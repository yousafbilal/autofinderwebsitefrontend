const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==================== PRODUCTION SECURITY CONFIG ====================
// These settings are ALWAYS enforced, regardless of NODE_ENV
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB - increased for ad images (was 2MB)
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_BODY_SIZE: 50 * 1024 * 1024, // 50MB max request body (for multiple images)
  TOKEN_EXPIRY: '7d',
  BCRYPT_ROUNDS: 10,
};

// ==================== RATE LIMITING ====================
const loginAttempts = new Map();
const IP_ATTEMPTS = new Map();
const requestCounts = new Map(); // Track all requests per IP

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (value.lockedUntil && value.lockedUntil < now) {
      loginAttempts.delete(key);
    }
  }
  for (const [ip, value] of IP_ATTEMPTS.entries()) {
    if (value.firstAttempt && (now - value.firstAttempt) > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
      IP_ATTEMPTS.delete(ip);
    }
  }
  // Clean request counts older than window
  for (const [ip, timestamps] of requestCounts.entries()) {
    const filtered = timestamps.filter(ts => now - ts < SECURITY_CONFIG.RATE_LIMIT_WINDOW);
    if (filtered.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, filtered);
    }
  }
}, 5 * 60 * 1000);

// Get client IP address (production-safe)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
};

// ==================== REQUEST TRACKING MIDDLEWARE ====================
// Track all requests for abuse detection
const trackRequest = (req, res, next) => {
  const ip = getClientIP(req);
  const now = Date.now();

  // Skip abuse detection for public endpoints (mobile app needs frequent requests)
  const publicEndpoints = [
    '/featured_ads/public',
    '/bike_ads/public',
    '/list_it_for_you_ad/public',
    '/new_cars/public',
    '/all_ads',
    '/advertising/published',
    '/health'
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.includes(endpoint));

  // Only track non-public endpoints for abuse detection
  if (!isPublicEndpoint) {
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const timestamps = requestCounts.get(ip);
    const recentRequests = timestamps.filter(ts => now - ts < SECURITY_CONFIG.RATE_LIMIT_WINDOW);
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);

    // Detect potential abuse (too many requests) - only for non-public endpoints
    if (recentRequests.length > SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW * 2) {
      logSecurityEvent('ABUSE_DETECTED', {
        ip,
        requestCount: recentRequests.length,
        path: req.path,
        method: req.method,
      });
    }
  }

  next();
};

// ==================== INPUT SANITIZATION MIDDLEWARE ====================
const sanitizeInput = (input) => {
  if (input === null || input === undefined) return input;
  if (typeof input !== 'string') return input;

  // Remove potential XSS attempts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Middleware to sanitize request body
const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// ==================== FILE UPLOAD SECURITY ====================
// Enhanced file filter - STRICT image-only validation
const createSecureFileFilter = () => {
  return (req, file, cb) => {
    // Check mimetype first
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }

    // Validate against allowed types
    if (!SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
      return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: jpeg, jpg, png, gif, webp`), false);
    }

    // Check file extension as secondary validation
    const ext = file.originalname?.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (ext && !allowedExts.includes(ext)) {
      return cb(new Error(`File extension .${ext} is not allowed`), false);
    }

    cb(null, true);
  };
};

// Get multer configuration with security limits
const getSecureMulterConfig = () => {
  return {
    fileFilter: createSecureFileFilter(),
    limits: {
      fileSize: SECURITY_CONFIG.MAX_FILE_SIZE,
      files: 20, // Max 20 files per request
      fields: 50, // Max 50 form fields
      fieldNameSize: 100,
      fieldSize: 1024 * 1024, // 1MB max field size
    }
  };
};

// ==================== RATE LIMITING ====================
const rateLimitLogin = (req, res, next) => {
  try {
    const ip = getClientIP(req);
    const { emailOrPhone } = req.body || {};

    // IP-based rate limiting
    const ipData = IP_ATTEMPTS.get(ip) || { count: 0, firstAttempt: Date.now() };
    const timeSinceFirstAttempt = Date.now() - ipData.firstAttempt;

    if (timeSinceFirstAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
      IP_ATTEMPTS.set(ip, { count: 1, firstAttempt: Date.now() });
    } else {
      ipData.count++;
      IP_ATTEMPTS.set(ip, ipData);

      if (ipData.count > SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, endpoint: '/login' });
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later."
        });
      }
    }

    // Account-based lockout
    if (emailOrPhone && typeof emailOrPhone === 'string') {
      const key = emailOrPhone.toLowerCase().trim();
      const attemptData = loginAttempts.get(key);

      if (attemptData && attemptData.lockedUntil) {
        const now = Date.now();
        if (now < attemptData.lockedUntil) {
          const remainingMinutes = Math.ceil((attemptData.lockedUntil - now) / 60000);
          return res.status(423).json({
            success: false,
            message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`
          });
        } else {
          loginAttempts.delete(key);
        }
      }
    }

    next();
  } catch (error) {
    logSecurityEvent('RATE_LIMIT_ERROR', { error: error.message });
    // Fail securely - block request on error
    return res.status(500).json({
      success: false,
      message: "Security check failed. Please try again later."
    });
  }
};

const recordFailedAttempt = (emailOrPhone, ip) => {
  if (!emailOrPhone) return;

  const key = String(emailOrPhone).toLowerCase().trim();
  const attemptData = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };

  attemptData.count++;
  const timeSinceFirstAttempt = Date.now() - attemptData.firstAttempt;

  if (timeSinceFirstAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
    attemptData.count = 1;
    attemptData.firstAttempt = Date.now();
  }

  if (attemptData.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    attemptData.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
    logSecurityEvent('ACCOUNT_LOCKED', {
      emailOrPhone: key,
      ip,
      attempts: attemptData.count,
      lockedUntil: new Date(attemptData.lockedUntil).toISOString()
    });
  }

  loginAttempts.set(key, attemptData);
};

const clearFailedAttempts = (emailOrPhone) => {
  if (emailOrPhone) {
    loginAttempts.delete(String(emailOrPhone).toLowerCase().trim());
  }
};

// ==================== SECURITY HEADERS ====================
const securityHeaders = (req, res, next) => {
  // Always set security headers (production-safe)
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS only if HTTPS (check protocol)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy for API endpoints
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'none'; style-src 'none'; img-src 'self' data: https:; font-src 'none'; connect-src 'self' https:; frame-ancestors 'none';"
  );

  next();
};

// ==================== INPUT VALIDATION ====================
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254; // RFC 5321 max length
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.trim()) && phone.length <= 20;
};

const validateSignupInput = (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Sanitize
    req.body.name = sanitizeInput(String(name));
    req.body.email = sanitizeInput(String(email));
    req.body.phone = sanitizeInput(String(phone));
    req.body.password = sanitizeInput(String(password));

    // Validate
    if (!validateEmail(req.body.email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (!validatePhone(req.body.phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone format" });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    next();
  } catch (error) {
    logSecurityEvent('INPUT_VALIDATION_ERROR', { error: error.message });
    return res.status(500).json({ success: false, message: "Error validating input" });
  }
};

const validateLoginInput = (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }

    const { emailOrPhone, password, userType } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required"
      });
    }

    // Sanitize inputs
    req.body.emailOrPhone = sanitizeInput(String(emailOrPhone));
    req.body.password = sanitizeInput(String(password));
    if (userType) {
      req.body.userType = sanitizeInput(String(userType));
    }

    // Validate length limits
    if (req.body.emailOrPhone.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone is too long"
      });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 6 and 128 characters"
      });
    }

    // Validate email or phone format
    const isEmail = String(emailOrPhone).includes('@');
    if (isEmail && !validateEmail(emailOrPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    if (!isEmail && !validatePhone(emailOrPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone format"
      });
    }

    // Validate userType if provided
    if (userType && !['admin', 'superadmin', 'inspector'].includes(String(userType).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type"
      });
    }

    next();
  } catch (error) {
    logSecurityEvent('INPUT_VALIDATION_ERROR', { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error validating input"
    });
  }
};

// ==================== AUDIT LOGGING ====================
const securityLogs = [];
const MAX_LOG_ENTRIES = 10000;

const logSecurityEvent = (eventType, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    details: { ...details },
    ip: details.ip || 'unknown'
  };

  securityLogs.push(logEntry);

  if (securityLogs.length > MAX_LOG_ENTRIES) {
    securityLogs.shift();
  }

  // Only log to console in non-production (but still track in memory)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 Security Event: ${eventType}`, logEntry);
  }
};

// ==================== PASSWORD HASHING ====================
const hashPassword = async (password) => {
  const saltRounds = SECURITY_CONFIG.BCRYPT_ROUNDS;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logSecurityEvent('PASSWORD_COMPARE_ERROR', { error: error.message });
    return false;
  }
};

// ==================== ENHANCED AUTHENTICATION ====================
const enhanceAuthenticateToken = (req, res, next) => {
  let token = null;

  // Get token from Authorization header
  token = req.headers["authorization"] || req.headers["Authorization"];

  if (!token && req.get) {
    token = req.get("Authorization");
  }

  if (!token && req.header && typeof req.header === 'function') {
    token = req.header("Authorization");
  }

  const ip = getClientIP(req);

  if (!token || typeof token !== 'string' || !token.startsWith("Bearer ")) {
    logSecurityEvent('AUTH_FAILED', { reason: 'Missing or invalid token format', ip, path: req.path });
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing or invalid format.",
      error: "Authentication required. Please login again."
    });
  }

  const tokenWithoutBearer = (token.substring(7) || '').trim();
  if (!tokenWithoutBearer) {
    logSecurityEvent('AUTH_FAILED', { reason: 'Empty token after Bearer', ip, path: req.path });
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing or invalid format.",
      error: "Authentication required. Please login again."
    });
  }

  // Validate token format (basic JWT check)
  if (tokenWithoutBearer.split('.').length !== 3) {
    logSecurityEvent('AUTH_FAILED', { reason: 'Invalid token format', ip, path: req.path });
    return res.status(401).json({
      success: false,
      message: "Invalid token format.",
      error: "Authentication failed. Please login again."
    });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secretKey || secretKey.length < 32) {
      logSecurityEvent('CONFIG_ERROR', { error: 'JWT_SECRET_KEY not set or too short' });
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact administrator."
      });
    }

    const decoded = jwt.verify(tokenWithoutBearer, secretKey);

    // Accept userId or id in payload (mobile app compatibility)
    const userId = decoded.userId || decoded.id || null;

    // Check token expiry (jwt.verify may already throw TokenExpiredError; this is a fallback)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      logSecurityEvent('AUTH_FAILED', { reason: 'Expired token', ip, userId });
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
        error: "Your session has expired. Please login again."
      });
    }

    if (!userId) {
      logSecurityEvent('AUTH_FAILED', { reason: 'Token missing userId/id', ip });
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        error: "Authentication failed. Please login again."
      });
    }

    req.userId = typeof userId === 'string' ? userId : (userId.toString ? userId.toString() : String(userId));
    req.userType = decoded.userType || decoded.role || null;
    req.userIP = ip;

    next();
  } catch (error) {
    // Distinguish expired token so user gets clear message
    if (error.name === 'TokenExpiredError') {
      logSecurityEvent('AUTH_FAILED', { reason: 'Expired token (jwt)', ip, path: req.path });
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
        error: "Your session has expired. Please login again."
      });
    }
    if (error.name === 'JsonWebTokenError') {
      logSecurityEvent('AUTH_FAILED', { reason: 'Invalid token (signature/format)', ip, path: req.path, error: error.message });
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        error: "Authentication failed. Please login again."
      });
    }
    logSecurityEvent('AUTH_FAILED', { reason: 'Token verification failed', ip, error: error.message });
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again.",
      error: "Authentication failed. Please login again."
    });
  }
};

// ==================== SUSPICIOUS ACTIVITY DETECTION ====================
const detectSuspiciousActivity = (req, emailOrPhone, ip) => {
  const key = emailOrPhone?.toLowerCase()?.trim();
  if (key) {
    const attemptData = loginAttempts.get(key);
    if (attemptData) {
      if (attemptData.count > 3 && attemptData.ips && attemptData.ips.length > 2) {
        logSecurityEvent('SUSPICIOUS_ACTIVITY', {
          type: 'Multiple IPs',
          emailOrPhone: key,
          ip,
          previousIPs: attemptData.ips
        });
        return true;
      }

      if (!attemptData.ips) {
        attemptData.ips = [];
      }
      if (!attemptData.ips.includes(ip)) {
        attemptData.ips.push(ip);
        loginAttempts.set(key, attemptData);
      }
    }
  }
  return false;
};

// ==================== PUBLIC ENDPOINT DATA SANITIZATION ====================
// Middleware to remove sensitive fields from public responses
// Note: Some endpoints like /users/:id/seller-info intentionally expose email/phone for contact
// This middleware removes passwords, tokens, and internal data but preserves contact info
const sanitizePublicResponse = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      // Remove highly sensitive fields (always remove these)
      const highlySensitiveFields = ['password', 'token', 'googleId', 'internalNotes', 'adminNotes', 'secret', 'apiKey'];

      // Fields to remove from nested objects (but allow in top-level for seller-info endpoint)
      const nestedSensitiveFields = ['password', 'token', 'googleId', 'internalNotes', 'adminNotes', 'secret', 'apiKey', 'address'];

      const sanitize = (obj, depth = 0) => {
        if (Array.isArray(obj)) {
          return obj.map(item => sanitize(item, depth + 1));
        }
        if (obj && typeof obj === 'object') {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            const keyLower = key.toLowerCase();

            // Always remove highly sensitive fields
            if (highlySensitiveFields.includes(keyLower)) {
              continue;
            }

            // Remove nested sensitive fields (but allow email/phone at top level for seller-info)
            if (depth > 0 && nestedSensitiveFields.includes(keyLower)) {
              continue;
            }

            sanitized[key] = typeof value === 'object' && value !== null ? sanitize(value, depth + 1) : value;
          }
          return sanitized;
        }
        return obj;
      };

      data = sanitize(data);
    }
    return originalJson.call(this, data);
  };
  next();
};

module.exports = {
  // Rate limiting
  rateLimitLogin,
  recordFailedAttempt,
  clearFailedAttempts,
  trackRequest,

  // Security headers
  securityHeaders,

  // Input validation
  // Input validation
  validateLoginInput,
  validateSignupInput,
  sanitizeRequestBody,
  sanitizeInput,
  sanitizeObject,

  // File upload security
  createSecureFileFilter,
  getSecureMulterConfig,

  // Authentication
  enhanceAuthenticateToken,

  // Password
  hashPassword,
  comparePassword,

  // Logging
  logSecurityEvent,
  getSecurityLogs: () => securityLogs,

  // Detection
  detectSuspiciousActivity,

  // Public response sanitization
  sanitizePublicResponse,

  // Utilities
  getClientIP,

  // Config (read-only)
  SECURITY_CONFIG: Object.freeze(SECURITY_CONFIG),

  // Legacy exports for compatibility
  loginAttempts,
};
