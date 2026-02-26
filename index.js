// ==================== ENVIRONMENT SETUP ====================
// Load .env first (backward compatible), then node.env if present
require('dotenv').config();
require('dotenv').config({ path: './node.env' });

// SECURITY: Disable debug/info logs in production (reduces info leakage)
if (process.env.NODE_ENV === 'production') {
  console.log = () => { };
  console.debug = () => { };
  console.info = () => { };
}

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const twilio = require('twilio');




// Import database connection
const mongoose = require('mongoose');
require('./db/conn');

// Import models
const User = require('./models/User');
const InspectionJob = require('./models/InspectionJob');
const Inspector = require('./models/Dashboard/Inspector');
const Free_Ads = require('./models/post_ad/Free_Ads');
const Featured_Ads = require('./models/post_ad/Featured_Ads');
const ListItforyouad = require('./models/ListItforyou/listItforyouad');
const BuyCar = require('./models/Buy_car_for_me/BuyCar');
const Rent_Car = require('./models/post_ad/Rent_Car');
const Inspection = require('./models/car_inspection/Inspection');
const InspectionReport = require('./models/car_inspection/InspectionReport');
const Report = require('./models/Report');
// Import additional models with error handling
let Bike_Ads, NewCarData, AutoStore, DealerPackage, DealerPackageRequest, MobilePackagePurchase;
try {
  Bike_Ads = require('./models/post_ad/Bike_Ads');
  console.log('✅ Bike_Ads model loaded');
} catch (error) {
  console.error('❌ CRITICAL: Bike_Ads model failed to load:', error.message);
}

try {
  NewCarData = require('./models/NewCarData'); // Exports as New_Car model
  console.log('✅ NewCarData model loaded');
} catch (error) {
  console.error('❌ CRITICAL: NewCarData model failed to load:', error.message);
}

try {
  AutoStore = require('./models/AutoStore'); // Exports as AutoStoreAd model
  console.log('✅ AutoStore model loaded');
} catch (error) {
  console.error('❌ CRITICAL: AutoStore model failed to load:', error.message);
}

try {
  DealerPackage = require('./models/DealerPackage');
  console.log('✅ DealerPackage model loaded');
} catch (error) {
  console.error('❌ CRITICAL: DealerPackage model failed to load:', error.message);
}

try {
  DealerPackageRequest = require('./models/DealerPackageRequest');
  console.log('✅ DealerPackageRequest model loaded');
} catch (error) {
  console.error('❌ CRITICAL: DealerPackageRequest model failed to load:', error.message);
}

try {
  MobilePackagePurchase = require('./models/MobilePackagePurchase');
  console.log('✅ MobilePackagePurchase model loaded');
} catch (error) {
  console.error('❌ CRITICAL: MobilePackagePurchase model failed to load:', error.message);
}

// Chat models
let ChatConversation, ChatMessage;
try {
  ChatConversation = require('./models/ChatConversation');
  ChatMessage = require('./models/ChatMessage');
  console.log('✅ Chat models loaded');
} catch (error) {
  console.warn('⚠️ Chat models not found:', error.message);
}

let Blog;
try {
  Blog = require('./models/Blog');
  console.log('✅ Blog model loaded');
} catch (error) {
  console.error('❌ CRITICAL: Blog model failed to load:', error.message);
}

let Video;
try {
  Video = require('./models/Video');
  console.log('✅ Video model loaded');
} catch (error) {
  console.error('❌ CRITICAL: Video model failed to load:', error.message);
}

let FuelPrice;
try {
  FuelPrice = require('./models/FuelPrice');
  console.log('✅ FuelPrice model loaded');
} catch (error) {
  console.error('❌ CRITICAL: FuelPrice model failed to load:', error.message);
}

let Advertising;
try {
  Advertising = require('./models/Advertising');
  console.log('✅ Advertising model loaded');
} catch (error) {
  console.error('❌ CRITICAL: Advertising model failed to load:', error.message);
}

let SupportRequest;
try {
  SupportRequest = require('./models/SupportRequest');
  console.log('✅ SupportRequest model loaded');
} catch (error) {
  console.error('❌ CRITICAL: SupportRequest model failed to load:', error.message);
}

let Notification;
try {
  Notification = require('./models/Notification');
  console.log('✅ Notification model loaded');
} catch (error) {
  console.error('❌ CRITICAL: Notification model failed to load:', error.message);
}

// ==================== SECURITY MIDDLEWARE - CRITICAL ====================
// ⚠️ CRITICAL: Server MUST NOT start if security middleware fails to load
// No fallbacks allowed - security failure = server shutdown
const securityMiddleware = require('./middleware/security');

if (!securityMiddleware || typeof securityMiddleware !== 'object') {
  console.error('❌ CRITICAL: Security middleware module failed to load');
  throw new Error('Security middleware failed to load. Server stopped for security reasons.');
}

if (!securityMiddleware.enhanceAuthenticateToken) {
  console.error('❌ CRITICAL: enhanceAuthenticateToken not found in security middleware');
  console.error('Available exports:', Object.keys(securityMiddleware));
  throw new Error('Security middleware failed to load. Server stopped for security reasons.');
}

if (typeof securityMiddleware.enhanceAuthenticateToken !== 'function') {
  console.error('❌ CRITICAL: enhanceAuthenticateToken is not a function');
  throw new Error('Security middleware failed to load. Server stopped for security reasons.');
}

const authenticateToken = securityMiddleware.enhanceAuthenticateToken;
const requestSecurity = require('./middleware/requestSecurity');

// Twilio Configuration
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioService = {
  sendWhatsAppOTP: async (phone) => {
    try {
      // Ensure correct format (E.164 only for Verify API)
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+${phone}`;

      console.log("📲 Sending OTP to WhatsApp:", formattedPhone);

      const verification = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: formattedPhone,
          channel: "whatsapp"
        });

      return { success: true, data: verification };

    } catch (error) {
      console.error("❌ Twilio Send OTP Error:", error.message);
      if (error.message.includes("not configured")) {
        console.warn("💡 TIP: Enable the WhatsApp channel for your Verify Service in Twilio Console!");
      }
      if (error.message.includes("channel disabled")) {
        console.warn("💡 TIP: Your selected delivery channel (WhatsApp/SMS) is disabled in Twilio Console!");
      }
      return { success: false, error: error.message };
    }
  },
  verifyOTP: async (phone, code) => {
    try {
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+${phone}`;

      const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: formattedPhone,
          code: code
        });

      return {
        success: verificationCheck.status === "approved"
      };

    } catch (error) {
      console.error("❌ Twilio Verify Error:", error);
      return { success: false };
    }
  }
};

console.log('✅ Twilio Service loaded successfully');
// ==================== END SECURITY MIDDLEWARE CHECK ====================

// ==================== MULTER CONFIGURATION (After security middleware loaded) ====================
// SECURITY: Use secure multer configuration from security middleware
const secureMulterConfig = securityMiddleware.getSecureMulterConfig();
const multerImageFilter = secureMulterConfig.fileFilter;
const multerLimits = secureMulterConfig.limits;

// Multer error handler middleware - catches multer errors before route handlers
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum file size is ${Math.round(multerLimits.fileSize / (1024 * 1024))}MB per image.`,
        error: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum ${multerLimits.files} files allowed.`,
        error: 'TOO_MANY_FILES'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field: ${err.field}`,
        error: 'UNEXPECTED_FILE_FIELD'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      error: err.code || 'MULTER_ERROR'
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: 'UPLOAD_ERROR'
    });
  }
  next();
};
// ==================== END MULTER CONFIGURATION ====================

// ==================== EXPRESS APP SETUP ====================
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8001;

// ==================== CORS FIRST (so /health and all routes get CORS headers) ====================
app.use(cors({
  origin: [
    'https://admin.autofinder.pk',
    'https://autofinder.pk',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ==================== FAST ROUTES (BEFORE OTHER MIDDLEWARE) ====================
// Health check - fastest possible response (CORS already applied above)
app.get('/health', (req, res) => {
  // Explicitly set CORS headers for health check
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://admin.autofinder.pk',
    'https://autofinder.pk',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'running'
  });
});

// App connectivity check (same as health - avoids 404 in app)
app.get('/test-connection', (req, res) => {
  res.json({ ok: true, message: 'Backend connected' });
});

// Handle OPTIONS request for /health endpoint
app.options('/health', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://admin.autofinder.pk',
    'https://autofinder.pk',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(200).end();
});

// Root route - simple response
app.get('/', (req, res) => {
  res.json({
    message: 'AutoFinder Backend API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check with DB status (separate endpoint)
app.get('/health/detailed', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : null;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbStatus,
    dbState: dbState,
    databaseName: dbName
  });
});

// Debug: show which database we're using and document counts per collection (remove in production if needed)
app.get('/debug/db-counts', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ error: 'DB not connected', databaseName: null, collections: {} });
    }
    const db = mongoose.connection.db;
    const databaseName = db.databaseName;
    const collections = await db.listCollections().toArray();
    const counts = {};
    for (const c of collections) {
      try {
        counts[c.name] = await db.collection(c.name).countDocuments();
      } catch (e) {
        counts[c.name] = 'error';
      }
    }
    res.json({ databaseName, collections: counts });
  } catch (err) {
    res.json({ error: err.message, databaseName: null, collections: {} });
  }
});

// Quick test endpoint for mobile app (no DB query, instant response)
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is responding',
    timestamp: new Date().toISOString()
  });
});

// ==================== REQUEST LOGGING (for debugging) ====================
app.use((req, res, next) => {
  const startTime = Date.now();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';

  // Log important endpoints
  if (req.path.includes('/all_ads') ||
    req.path.includes('/featured_ads/public') ||
    req.path.includes('/bike_ads/public') ||
    req.path.includes('/list_it_for_you_ad/public') ||
    req.path.includes('/new_cars/public') ||
    req.path.includes('/advertising/published')) {
    console.log(`📥 ${req.method} ${req.path} from ${ip} at ${new Date().toISOString()}`);
  }

  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (req.path.includes('/all_ads') ||
      req.path.includes('/featured_ads/public') ||
      req.path.includes('/bike_ads/public') ||
      req.path.includes('/list_it_for_you_ad/public') ||
      req.path.includes('/new_cars/public') ||
      req.path.includes('/advertising/published')) {
      console.log(`📤 ${req.method} ${req.path} → ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// ==================== SECURITY MIDDLEWARE (APPLIED AFTER HEALTH CHECK) ====================
// 1. Request security (bot detection, injection prevention, path traversal)
// Skip for health check and root route
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/') {
    return next(); // Skip security for health check and root route
  }
  requestSecurity(req, res, next);
});

// 2. Security headers (always applied)
app.use(securityMiddleware.securityHeaders);

// 3. Input sanitization (sanitize all request bodies)
app.use(securityMiddleware.sanitizeRequestBody);

// 4. Helmet for additional security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // IMPORTANT: allow resources (like images) to be loaded cross-origin,
  // e.g. from this API (8001) into the admin panel (3000)
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS already applied at top (so /health and all routes get headers)

// Body parser with limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==================== STATIC FILES SERVING ====================
// Middleware to add CORS headers for static files
const staticCorsMiddleware = (req, res, next) => {
  // Add CORS headers for static files
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://admin.autofinder.pk',
    'https://autofinder.pk',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Set cache headers
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  next();
};

// SECURITY: Only serve image files from uploads (blocks .php, .js, .sh)
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
app.use('/uploads', (req, res, next) => {
  if (req.path && !IMAGE_EXT.test(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});
app.use('/uploads', staticCorsMiddleware, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Ensure CORS headers are set
    const origin = res.req.headers.origin;
    const allowedOrigins = [
      'https://admin.autofinder.pk',
      'https://autofinder.pk',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081'
    ];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
}));

// Serve static files from public directory (if exists) with CORS support
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use('/public', staticCorsMiddleware, express.static(publicPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Ensure CORS headers are set
      const origin = res.req.headers.origin;
      const allowedOrigins = [
        'https://admin.autofinder.pk',
        'https://autofinder.pk',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081'
      ];
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }
  }));
}

// Logo files route - handle common logo requests
app.get('/autofinderlogo.svg', (req, res) => {
  const logoPath = path.join(__dirname, 'uploads', 'autofinderlogo.svg');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    // Try public folder
    const publicLogoPath = path.join(__dirname, 'public', 'autofinderlogo.svg');
    if (fs.existsSync(publicLogoPath)) {
      res.sendFile(publicLogoPath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Logo file not found',
        hint: 'Please upload autofinderlogo.svg to /uploads or /public folder'
      });
    }
  }
});

app.get('/autofinderlogo.jpg', (req, res) => {
  const logoPath = path.join(__dirname, 'uploads', 'autofinderlogo.jpg');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    // Try public folder
    const publicLogoPath = path.join(__dirname, 'public', 'autofinderlogo.jpg');
    if (fs.existsSync(publicLogoPath)) {
      res.sendFile(publicLogoPath);
    } else {
      // Try .png extension
      const pngPath = path.join(__dirname, 'uploads', 'autofinderlogo.png');
      if (fs.existsSync(pngPath)) {
        res.sendFile(pngPath);
      } else {
        res.status(404).json({
          success: false,
          message: 'Logo file not found',
          hint: 'Please upload autofinderlogo.jpg or autofinderlogo.png to /uploads or /public folder'
        });
      }
    }
  }
});

// ==================== END STATIC FILES ====================

// ==================== RATE LIMITING ====================
// Global rate limiter - SKIP for static files (/uploads)
// Use env RATE_LIMIT_MAX to override (e.g. 1000 for dev). Default 500 per 15 min for mobile app.
const globalRateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '500', 10) || 500;
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: globalRateLimitMax, // 500 per 15 min default (mobile app: list + detail + refresh)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'Rate limit exceeded'
    });
  },
  // Skip rate limiting for static files, auth endpoints, and authenticated requests
  skip: (req) => {
    // Skip for uploads and static files
    if (req.path.startsWith('/uploads/') ||
      req.path.startsWith('/public/') ||
      /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(req.path)) {
      return true;
    }
    // Skip for login - auth has its own rate limit in production
    if (req.path === '/login' || req.path === '/inspector_login') {
      return true;
    }
    // Skip for authenticated requests - admin dashboard etc make many parallel calls
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return true;
    }
    return false;
  }
});

app.use(globalRateLimiter);

// Auth rate limiter
// In production, protect against brute-force; in development, disable to avoid blocking tests
const authRateLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        error: 'Rate limit exceeded'
      });
    }
  })
  : (req, res, next) => next();

// Contact rate limiter
const contactRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many requests to admin contact endpoint. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests to admin contact endpoint. Please try again later.',
      error: 'Rate limit exceeded'
    });
  }
});

// ==================== SOCKET.IO SETUP ====================
const io = new Server(server, {
  cors: {
    origin: ['https://admin.autofinder.pk', 'https://autofinder.pk', 'http://localhost:3000', 'http://localhost:8081'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io JWT Authentication & Rate Limiting
const socketConnectionAttempts = new Map();
const SOCKET_RATE_LIMIT = 10;
const SOCKET_RATE_WINDOW = 60 * 1000;

io.use((socket, next) => {
  const clientIp = socket.handshake.address || socket.request.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean up old entries
  for (const [ip, attempts] of socketConnectionAttempts.entries()) {
    socketConnectionAttempts.set(ip, attempts.filter(time => now - time < SOCKET_RATE_WINDOW));
    if (socketConnectionAttempts.get(ip).length === 0) {
      socketConnectionAttempts.delete(ip);
    }
  }

  // Check rate limit
  const attempts = socketConnectionAttempts.get(clientIp) || [];
  if (attempts.length >= SOCKET_RATE_LIMIT) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket.io rate limit exceeded for IP: ' + clientIp);
    }
    return next(new Error('Too many connection attempts. Please try again later.'));
  }

  // Track connection attempt
  attempts.push(now);
  socketConnectionAttempts.set(clientIp, attempts);

  // JWT Authentication
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket.io connection rejected: No token provided');
    }
    return next(new Error('Authentication token required'));
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secretKey) {
      return next(new Error('JWT secret not configured'));
    }
    const decoded = jwt.verify(token, secretKey);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket.io connection rejected: Invalid token', error.message);
    }
    return next(new Error('Invalid authentication token'));
  }
});

io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Socket.io client connected:', socket.id);
  }

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket.io client disconnected:', socket.id);
    }
  });
});

// ==================== BASIC ROUTES ====================
// Root route - simple response (BEFORE middleware for fast response)
app.get('/', (req, res) => {
  // Respond immediately without any async operations
  res.json({
    message: 'AutoFinder Backend API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// SECURITY: Dangerous fix/debug endpoints REMOVED for production safety.
// Login endpoint
app.post("/login", authRateLimiter, securityMiddleware.validateLoginInput, async (req, res) => {
  try {
    const { emailOrPhone, password, userType } = req.body;

    // Debug logging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Login attempt:', {
        emailOrPhone,
        userType,
        hasPassword: !!password
      });
    }

    // Find user by email or phone (case insensitive)
    // Try exact match first, then case-insensitive
    let user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase().trim() },
        { phone: emailOrPhone.trim() }
      ]
    });

    // If not found, try case-insensitive search
    if (!user) {
      user = await User.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${emailOrPhone.trim()}$`, 'i') } },
          { phone: emailOrPhone.trim() }
        ]
      });
    }

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ User not found:', emailOrPhone);
        // Try to find similar emails
        const similarUsers = await User.find({
          email: { $regex: emailOrPhone, $options: 'i' }
        }).limit(5).select('email userType');
        if (similarUsers.length > 0) {
          console.log('💡 Similar emails found:', similarUsers.map(u => ({ email: u.email, type: u.userType })));
        }
      }
      securityMiddleware.recordFailedAttempt(emailOrPhone, securityMiddleware.getClientIP(req));
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
        debug: process.env.NODE_ENV !== 'production' ? 'User not found in database' : undefined
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ User found:', {
        email: user.email,
        userType: user.userType,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        isDeleted: user.isDeleted
      });
    }

    // SECURITY: Block deleted users from logging in
    if (user.isDeleted === true) {
      console.log('❌ Login denied: User account has been deleted');
      return res.status(403).json({
        success: false,
        message: "This account has been deleted and can no longer be accessed."
      });
    }

    // Check if user type matches (for admin/superadmin login)
    if (userType) {
      const requestedType = userType.toLowerCase();
      const userTypeLower = (user.userType || '').toLowerCase();

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 User type check:', { requestedType, userTypeLower });
      }

      if (requestedType === 'admin' && userTypeLower !== 'admin' && userTypeLower !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin access required."
        });
      }

      if (requestedType === 'superadmin' && userTypeLower !== 'superadmin') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('❌ SuperAdmin access denied. User type:', user.userType);
        }
        return res.status(403).json({
          success: false,
          message: "Access denied. SuperAdmin access required."
        });
      }
    }

    // Check if user has password (for Google users)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google login. Please use Google sign-in."
      });
    }

    // Verify password
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Verifying password...');
      console.log('Password hash length:', user.password ? user.password.length : 0);
      console.log('Password hash starts with:', user.password ? user.password.substring(0, 10) : 'none');
      console.log('Password hash format check:', user.password ? (user.password.startsWith('$2') ? 'bcrypt ✅' : 'NOT bcrypt ❌') : 'none');
    }

    // AUTO-FIX: If password hash is malformed (too short or not bcrypt format), rehash it
    // Bcrypt hashes always start with $2 and are typically 60 characters long
    const isHashMalformed = !user.password.startsWith('$2') || user.password.length < 50;

    if (isHashMalformed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Password hash is malformed (length: ' + user.password.length + ', format: ' + (user.password.startsWith('$2') ? 'bcrypt' : 'not bcrypt') + '), rehashing...');
      }
      try {
        // Rehash the provided password
        const newHash = await securityMiddleware.hashPassword(password);
        user.password = newHash;
        await user.save();

        // Verify the new hash
        const verifyAfterFix = await securityMiddleware.comparePassword(password, newHash);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Password rehashed successfully. New hash length:', newHash.length);
          console.log('✅ Verification after rehash:', verifyAfterFix ? 'SUCCESS' : 'FAILED');
        }

        // If verification fails after rehash, something is wrong
        if (!verifyAfterFix) {
          return res.status(500).json({
            success: false,
            message: "Password rehashing failed. Please contact administrator.",
            debug: process.env.NODE_ENV !== 'production' ? 'Password hash verification failed after rehash' : undefined
          });
        }
      } catch (rehashError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ Error rehashing password:', rehashError);
        }
        return res.status(500).json({
          success: false,
          message: "Error fixing password hash. Please contact administrator."
        });
      }
    }

    // Now verify password with properly formatted hash
    let isPasswordValid = false;
    try {
      isPasswordValid = await securityMiddleware.comparePassword(password, user.password);
    } catch (compareError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Password comparison error:', compareError);
      }
      // If comparison fails due to malformed hash, try to fix it
      if (compareError.message && compareError.message.includes('Invalid hash')) {
        try {
          const newHash = await securityMiddleware.hashPassword(password);
          user.password = newHash;
          await user.save();
          isPasswordValid = await securityMiddleware.comparePassword(password, newHash);
        } catch (fixError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('❌ Error fixing hash during comparison:', fixError);
          }
        }
      }
    }

    if (!isPasswordValid) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ Password verification failed');
        console.log('Input password:', password.substring(0, 3) + '***');
        console.log('Input password length:', password.length);
        console.log('Stored password hash length:', user.password.length);
        console.log('Password hash format:', user.password.startsWith('$2') ? 'bcrypt ✅' : 'unknown format ❌');

        // Test password hash/compare functionality
        try {
          const testHash = await securityMiddleware.hashPassword('test123');
          const testCompare = await securityMiddleware.comparePassword('test123', testHash);
          console.log('Password hash/compare test:', testCompare ? '✅ Working' : '❌ Not working');
        } catch (err) {
          console.log('Password test error:', err.message);
        }
      }
      securityMiddleware.recordFailedAttempt(emailOrPhone, securityMiddleware.getClientIP(req));
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
        debug: process.env.NODE_ENV !== 'production' ? {
          userFound: true,
          userEmail: user.email,
          userType: user.userType,
          passwordHashExists: !!user.password,
          passwordHashLength: user.password.length,
          passwordHashFormat: user.password.startsWith('$2') ? 'bcrypt' : 'unknown'
        } : undefined
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Password verified successfully');
    }

    // Clear failed attempts on successful login
    securityMiddleware.clearFailedAttempts(emailOrPhone);

    // Enforce OTP verification
    if (!user.isVerified) {
      console.log('⚠️ Login attempt for unverified user:', user.email);
      const otpResponse = await twilioService.sendWhatsAppOTP(user.phone);

      return res.status(200).json({
        success: true,
        requireOtp: true,
        message: "Your account is not verified. OTP sent to WhatsApp.",
        userId: user._id,
        phone: user.phone
      });
    }

    // Generate JWT token
    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Debug: Log userType before creating token
    console.log("🔐 Login - User userType from DB:", user.userType);
    console.log("🔐 Login - User ID:", user._id.toString());
    console.log("🔐 Login - User Email:", user.email);

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        userType: user.userType,
        email: user.email
      },
      secretKey,
      { expiresIn: '7d' }
    );

    console.log("✅ Login - JWT Token created with userType:", user.userType);

    // First-time login: create welcome notification if user has none
    if (Notification) {
      try {
        const existing = await Notification.findOne({ userId: user._id, type: 'welcome', isDeleted: { $ne: true } });
        if (!existing) {
          await Notification.create({
            userId: user._id,
            type: 'welcome',
            title: 'Welcome to AutoFinder',
            message: 'Thank you for joining AutoFinder! Start by posting your first ad or browse cars.',
            read: false,
            dateAdded: new Date()
          });
        }
      } catch (notifErr) {
        if (process.env.NODE_ENV !== 'production') console.error('Welcome notification on login error:', notifErr);
      }
    }

    // Return user data
    res.json({
      success: true,
      token,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateAdded: user.dateAdded,
      profileImage: user.profileImage,
      userType: user.userType
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }
    res.status(500).json({
      success: false,
      message: "An error occurred during login"
    });
  }
});

// Get current admin profile
app.get('/admin/profile', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or SuperAdmin access required.'
      });
    }

    const user = await User.findById(req.userId).select('name email phone userType profileImage');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        userType: user.userType,
        profileImage: user.profileImage || '',
        // Add debug info to help troubleshoot
        tokenUserType: req.userType,
        dbUserType: user.userType,
        isSuperAdmin: String(user.userType || '').toLowerCase() === 'superadmin'
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching admin profile:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// SECURITY: Debug endpoint disabled for production
// Uncomment only for troubleshooting in development
/*
app.get('/admin/check-role', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email userType');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      token: {
        userId: req.userId,
        userType: req.userType,
        userTypeType: typeof req.userType
      },
      database: {
        userId: user._id.toString(),
        userType: user.userType,
        name: user.name,
        email: user.email
      },
      check: {
        tokenUserType: req.userType,
        dbUserType: user.userType,
        normalizedTokenType: String(req.userType || '').toLowerCase(),
        normalizedDbType: String(user.userType || '').toLowerCase(),
        isSuperAdmin: String(user.userType || '').toLowerCase() === 'superadmin',
        isAdmin: String(user.userType || '').toLowerCase() === 'admin' || String(user.userType || '').toLowerCase() === 'superadmin',
        typesMatch: String(req.userType || '').toLowerCase() === String(user.userType || '').toLowerCase()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking role',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});
*/

// Change admin password
// Change password for regular users (mobile app)
app.put('/change-password', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 PUT /change-password called for user:', req.userId);

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await securityMiddleware.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      console.log('❌ Current password incorrect for user:', req.userId);
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = await securityMiddleware.hashPassword(newPassword);
    await user.save();

    console.log('✅ Password changed successfully for user:', req.userId);

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing user password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete account endpoint (soft delete)
app.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ DELETE /delete-account called for user:', req.userId);

    const { password } = req.body || {};

    // Require password confirmation for security
    if (!password) {
      console.log('❌ Password required for account deletion');
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete your account'
      });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already deleted
    if (user.isDeleted) {
      console.log('⚠️ User already deleted:', req.userId);
      return res.status(400).json({
        success: false,
        message: 'Account is already deleted'
      });
    }

    // Verify password (skip for Google users who don't have password)
    if (user.password) {
      const isMatch = await securityMiddleware.comparePassword(password, user.password);
      if (!isMatch) {
        console.log('❌ Password incorrect for account deletion:', req.userId);
        return res.status(401).json({
          success: false,
          message: 'Password is incorrect'
        });
      }
    }

    // Soft delete the user account
    user.isDeleted = true;
    user.isOnline = false;
    await user.save();

    // Soft delete all user's ads (Free Ads, Featured Ads, Bike Ads, Auto Parts)
    const deletePromises = [];

    if (Free_Ads) {
      deletePromises.push(
        Free_Ads.updateMany(
          { userId: req.userId, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } }
        )
      );
    }

    if (Featured_Ads) {
      deletePromises.push(
        Featured_Ads.updateMany(
          { userId: req.userId, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } }
        )
      );
    }

    if (Bike_Ads) {
      deletePromises.push(
        Bike_Ads.updateMany(
          { userId: req.userId, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } }
        )
      );
    }

    if (AutoStore) {
      deletePromises.push(
        AutoStore.updateMany(
          { userId: req.userId, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } }
        )
      );
    }

    if (Rent_Car) {
      deletePromises.push(
        Rent_Car.updateMany(
          { userId: req.userId, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } }
        )
      );
    }

    // Execute all deletions
    await Promise.all(deletePromises);

    console.log('✅ Account deleted successfully for user:', req.userId);

    return res.json({
      success: true,
      message: 'Your account and all associated data have been deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting account. Please try again.',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

app.put('/admin/change-password', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or SuperAdmin access required.'
      });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await securityMiddleware.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = await securityMiddleware.hashPassword(newPassword);
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error changing admin password:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== SIGNUP (PUBLIC USER REGISTRATION) ====================
// Multer for profile image upload on signup
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'profile');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `profile-${unique}.${ext}`);
  }
});
const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).single('profileImage');

app.post("/signup", uploadProfileImage, securityMiddleware.validateSignupInput, async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body;

    // Hash password early for consistent storage
    const hashedPassword = await securityMiddleware.hashPassword(password);

    // Check availability
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ success: false, message: "Email already exists" });
        }
        if (existingUser.phone === phone) {
          return res.status(400).json({ success: false, message: "Phone number already exists" });
        }
      } else {
        // User exists but is NOT verified. Update their details and resend OTP.
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.userType = userType || 'User';
        existingUser.dateAdded = new Date();

        // Handle profile image update if provided
        if (req.file && req.file.path) {
          const relativePath = path.relative(path.join(__dirname, 'uploads'), req.file.path);
          existingUser.profileImage = '/uploads/' + relativePath.replace(/\\/g, '/');
        }

        await existingUser.save();

        const otpResponse = await twilioService.sendWhatsAppOTP(phone);

        return res.status(200).json({
          success: true,
          message: otpResponse.success ? "Account exists but is unverified. New OTP sent." : "Account exists. Failed to send OTP, please retry.",
          requireOtp: true,
          userId: existingUser._id
        });
      }
    }

    // Create user (unverified)
    let profileImagePath = null;
    if (req.file && req.file.path) {
      const relativePath = path.relative(path.join(__dirname, 'uploads'), req.file.path);
      profileImagePath = '/uploads/' + relativePath.replace(/\\/g, '/');
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      userType: userType || 'User',
      profileImage: profileImagePath,
      isVerified: false,
      dateAdded: new Date()
    });

    await newUser.save();

    // Create welcome notification
    if (Notification) {
      try {
        await Notification.create({
          userId: newUser._id,
          type: 'welcome',
          title: 'Welcome to AutoFinder',
          message: 'Thank you for joining AutoFinder! Start by posting your first ad or browse cars.',
          read: false,
          dateAdded: new Date()
        });
      } catch (notifErr) {
        if (process.env.NODE_ENV !== 'production') console.error('Welcome notification error:', notifErr);
      }
    }

    // Send OTP
    const otpResponse = await twilioService.sendWhatsAppOTP(phone);

    res.status(201).json({
      success: true,
      requireOtp: true,
      message: otpResponse.success ? "Account created. OTP sent to WhatsApp." : "Account created. Failed to send OTP, please retry.",
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        userType: newUser.userType
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: "Error creating account. Please try again.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== OTP VERIFICATION ROUTE ====================
app.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: "User ID and OTP are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Twilio Verify API check
    const verification = await twilioService.verifyOTP(user.phone, otp);
    const isMasterCode = otp === '123456' && process.env.NODE_ENV !== 'production';

    if (isMasterCode || verification.success) {
      user.isVerified = true;
      user.tempOtp = null; // Clean up legacy fields if any
      user.otpExpires = null;
      await user.save();

      const token = jwt.sign(
        { userId: user._id.toString(), userType: user.userType, email: user.email },
        process.env.JWT_SECRET_KEY || process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: "Account verified successfully",
        token,
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        userType: user.userType
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

// ==================== FORGOT PASSWORD ROUTES ====================
app.post("/api/send-otp-reset", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ success: false, message: "Phone or Email required" });

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase().trim() }, { phone: emailOrPhone.trim() }]
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otpResponse = await twilioService.sendWhatsAppOTP(user.phone);
    if (otpResponse.success) {
      res.json({ success: true, message: "OTP sent to your WhatsApp", userId: user._id });
    } else {
      res.status(500).json({ success: false, message: "Failed to send OTP via WhatsApp" });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});

app.post("/api/reset-password-with-otp", async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword) return res.status(400).json({ success: false, message: "Missing required fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Twilio Verify API check
    const verification = await twilioService.verifyOTP(user.phone, otp);
    const isMasterCode = otp === '123456' && process.env.NODE_ENV !== 'production';

    if (isMasterCode || verification.success) {
      user.password = await securityMiddleware.hashPassword(newPassword);
      user.tempOtp = null;
      user.otpExpires = null;
      await user.save();
      res.json({ success: true, message: "Password updated successfully. Please login." });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
});



// ==================== PROFILE UPDATE (MOBILE APP) ====================
// Test endpoint to verify route is working
app.get("/edit-profile-pic/test", (req, res) => {
  console.log('✅ Test endpoint hit - route is working');
  res.json({
    success: true,
    message: "Profile upload endpoint is reachable",
    timestamp: new Date().toISOString()
  });
});

// Multer for profile pic update (field: profilePic)
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'profile');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `profile-${unique}.${ext}`);
  }
});
const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).single('profilePic');

app.put("/edit-profile-pic/:userId", authenticateToken, (req, res, next) => {
  console.log('🖼️ PUT /edit-profile-pic called');
  console.log('📝 User ID:', req.params.userId);
  console.log('📝 Authenticated User:', req.userId);
  console.log('📦 Content-Type:', req.headers['content-type']);

  uploadProfilePic(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
    console.log('✅ Multer completed, file received:', !!req.file);
    next();
  });
}, async (req, res) => {
  try {
    console.log('✅ Multer processing complete');
    console.log('📁 Uploaded file:', req.file ? 'Yes' : 'No');
    if (req.file) {
      console.log('📄 File details:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });
    }

    const { userId } = req.params;
    if (!userId) {
      console.log('❌ No userId provided');
      return res.status(400).json({ success: false, message: "userId required." });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid userId format:', userId);
      return res.status(400).json({ success: false, message: "Invalid userId." });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!req.file || !req.file.path) {
      console.log('❌ No file uploaded in request');
      return res.status(400).json({ success: false, message: "No image uploaded." });
    }

    const relativePath = path.relative(path.join(__dirname, 'uploads'), req.file.path);
    const profileImagePath = '/uploads/' + relativePath.replace(/\\/g, '/');

    console.log('✅ Saving profile image path:', profileImagePath);
    user.profileImage = profileImagePath;
    await user.save();

    console.log('✅ Profile image updated successfully');

    res.json({
      success: true,
      message: "Profile image updated.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        profileImage: profileImagePath
      }
    });
  } catch (error) {
    console.error('❌ edit-profile-pic error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile image.",
      error: error.message
    });
  }
});

app.put("/edit-profile-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "userId required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const { name, phone, dob } = req.body || {};
    if (name !== undefined && name !== null) user.name = String(name).trim() || user.name;
    if (phone !== undefined && phone !== null) user.phone = String(phone).trim();
    if (dob) user.dob = dob;
    await user.save();
    res.json({
      success: true,
      message: "Profile updated.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('edit-profile-details error:', error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

// ==================== INSPECTOR LOGIN ENDPOINT ====================
app.post("/inspector_login", authRateLimiter, securityMiddleware.validateLoginInput, async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Inspector login attempt:', { emailOrPhone });
    }

    // Find inspector by email or phone
    let inspector = await Inspector.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase().trim() },
        { phone: emailOrPhone.trim() }
      ]
    });

    // If not found, try case-insensitive search
    if (!inspector) {
      inspector = await Inspector.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${emailOrPhone.trim()}$`, 'i') } },
          { phone: emailOrPhone.trim() }
        ]
      });
    }

    if (!inspector) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ Inspector not found:', emailOrPhone);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password"
      });
    }

    // Check if inspector is active
    if (inspector.isDeleted || !inspector.isActive) {
      return res.status(403).json({
        success: false,
        message: "Inspector account is inactive or deleted"
      });
    }

    // Check if password exists
    if (!inspector.password) {
      return res.status(401).json({
        success: false,
        message: "Password not set for this account"
      });
    }

    // Verify password
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Verifying inspector password...');
      console.log('Password hash length:', inspector.password ? inspector.password.length : 0);
      console.log('Password hash format check:', inspector.password ? (inspector.password.startsWith('$2') ? 'bcrypt ✅' : 'NOT bcrypt ❌') : 'none');
    }

    // AUTO-FIX: If password hash is malformed (too short or not bcrypt format), rehash it
    const isHashMalformed = !inspector.password.startsWith('$2') || inspector.password.length < 50;

    if (isHashMalformed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Inspector password hash is malformed (length: ' + inspector.password.length + '), rehashing...');
      }
      try {
        // Rehash the provided password
        const newHash = await securityMiddleware.hashPassword(password);
        inspector.password = newHash;
        await inspector.save();

        // Verify the new hash
        const verifyAfterFix = await securityMiddleware.comparePassword(password, newHash);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Inspector password rehashed successfully. New hash length:', newHash.length);
          console.log('✅ Verification after rehash:', verifyAfterFix ? 'SUCCESS' : 'FAILED');
        }

        // If verification fails after rehash, something is wrong
        if (!verifyAfterFix) {
          return res.status(500).json({
            success: false,
            message: "Password rehashing failed. Please contact administrator."
          });
        }
      } catch (rehashError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ Error rehashing inspector password:', rehashError);
        }
        return res.status(500).json({
          success: false,
          message: "Error fixing password hash. Please contact administrator."
        });
      }
    }

    // Now verify password with properly formatted hash
    let isPasswordValid = false;
    try {
      isPasswordValid = await securityMiddleware.comparePassword(password, inspector.password);
    } catch (compareError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Inspector password comparison error:', compareError);
      }
      // If comparison fails due to malformed hash, try to fix it
      if (compareError.message && compareError.message.includes('Invalid hash')) {
        try {
          const newHash = await securityMiddleware.hashPassword(password);
          inspector.password = newHash;
          await inspector.save();
          isPasswordValid = await securityMiddleware.comparePassword(password, newHash);
        } catch (fixError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('❌ Error fixing inspector hash during comparison:', fixError);
          }
        }
      }
    }

    if (!isPasswordValid) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ Inspector password verification failed');
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password"
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Inspector password verified successfully');
    }

    // Generate JWT token
    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const token = jwt.sign(
      {
        inspectorId: inspector._id.toString(),
        userType: 'Inspector',
        email: inspector.email
      },
      secretKey,
      { expiresIn: '7d' }
    );

    // Return inspector data
    res.json({
      success: true,
      token,
      inspector_id: inspector._id.toString(),
      name: inspector.name,
      email: inspector.email,
      phone: inspector.phone,
      address: inspector.address,
      profileImage: inspector.profileImage,
      dateAdded: inspector.dateAdded
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Inspector login error:', error);
    }
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== INSPECTORS ENDPOINT ====================
// Get all inspectors (requires authentication)
app.get("/inspectors", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all active inspectors (not deleted)
    const inspectors = await Inspector.find({
      isDeleted: { $ne: true }
    })
      .select('-password') // Exclude password from response
      .sort({ dateAdded: -1 });

    // Return array of inspectors (frontend expects direct array)
    res.json(inspectors.map(inspector => ({
      _id: inspector._id,
      name: inspector.name,
      email: inspector.email,
      phone: inspector.phone,
      address: inspector.address,
      profileImage: inspector.profileImage,
      isActive: inspector.isActive,
      isDeleted: inspector.isDeleted,
      dateAdded: inspector.dateAdded,
      inspections: inspector.inspections || []
    })));

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching inspectors:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching inspectors",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADD INSPECTOR ENDPOINT ====================
// Create a new inspector (requires SuperAdmin authentication)
app.post("/add_inspector", authenticateToken, async (req, res) => {
  try {
    // Check if user is SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin access required."
      });
    }

    const { name, email, password, address, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and address are required"
      });
    }

    // Check if inspector with this email already exists
    const existingInspector = await Inspector.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: { $ne: true }
    });

    if (existingInspector) {
      return res.status(400).json({
        success: false,
        message: "Inspector with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await securityMiddleware.hashPassword(password);

    // Create new inspector
    const inspector = new Inspector({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      address: address.trim(),
      phone: phone ? phone.trim() : '',
      isActive: true,
      isDeleted: false,
      dateAdded: new Date()
    });

    await inspector.save();

    // Return inspector without password
    res.json({
      success: true,
      message: "Inspector created successfully",
      inspector: {
        _id: inspector._id,
        name: inspector.name,
        email: inspector.email,
        phone: inspector.phone,
        address: inspector.address,
        isActive: inspector.isActive,
        dateAdded: inspector.dateAdded
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating inspector:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error creating inspector",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN USERS ENDPOINT ====================
// Get all users (requires Admin/SuperAdmin authentication)
app.get("/admin/users", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all users (not deleted)
    const users = await User.find({
      isDeleted: { $ne: true }
    })
      .select('-password -googleId') // Exclude sensitive fields
      .sort({ dateAdded: -1 })
      .lean(); // Use lean() for better performance

    // OPTIMIZATION: Batch fetch all counts using aggregation pipelines (much faster)
    const mongoose = require('mongoose');
    const userIds = users.map(u => u._id);

    // Get all counts in parallel using aggregation (only if we have users)
    let freeAdsCounts = [], premiumAdsCounts = [], rentalAdsCounts = [], buyCarCounts = [], listItForYouCounts = [], inspectionCounts = [];

    if (userIds.length > 0) {
      try {
        [freeAdsCounts, premiumAdsCounts, rentalAdsCounts, buyCarCounts, listItForYouCounts, inspectionCounts] = await Promise.all([
          // Free ads counts grouped by userId
          Free_Ads.aggregate([
            { $match: { userId: { $in: userIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
          ]).catch(() => []),
          // Premium ads counts grouped by userId
          Featured_Ads.aggregate([
            { $match: { userId: { $in: userIds }, isDeleted: { $ne: true }, isFeatured: 'Approved' } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
          ]).catch(() => []),
          // Rental ads counts grouped by userId
          Rent_Car.aggregate([
            { $match: { userId: { $in: userIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
          ]).catch(() => []),
          // Buy car requests counts grouped by userId
          BuyCar.aggregate([
            { $match: { userId: { $in: userIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
          ]).catch(() => []),
          // List it for you counts grouped by addedBy
          ListItforyouad.aggregate([
            { $match: { addedBy: { $in: userIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$addedBy', count: { $sum: 1 } } }
          ]).catch(() => []),
          // Inspection requests counts grouped by userId
          Inspection.aggregate([
            { $match: { userId: { $in: userIds }, isDeleted: { $ne: true } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
          ]).catch(() => [])
        ]);
      } catch (aggError) {
        // If aggregation fails, fall back to empty counts (don't break the endpoint)
        console.error('Aggregation error (non-fatal):', aggError);
      }
    }

    // Convert to maps for O(1) lookup (handle ObjectId conversion properly)
    const freeAdsMap = new Map(freeAdsCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));
    const premiumAdsMap = new Map(premiumAdsCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));
    const rentalAdsMap = new Map(rentalAdsCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));
    const buyCarMap = new Map(buyCarCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));
    const listItForYouMap = new Map(listItForYouCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));
    const inspectionMap = new Map(inspectionCounts.map(item => {
      const id = item._id instanceof mongoose.Types.ObjectId ? item._id.toString() : String(item._id);
      return [id, item.count];
    }));

    // Get counts for each user (using pre-fetched maps - much faster)
    const usersWithCounts = users.map((user) => {
      const userIdStr = user._id.toString();
      const freeAdsCount = freeAdsMap.get(userIdStr) || 0;
      const premiumAdsCount = premiumAdsMap.get(userIdStr) || 0;
      const rentalAdsCount = rentalAdsMap.get(userIdStr) || 0;
      const buyCarRequestsCount = buyCarMap.get(userIdStr) || 0;
      const listItForYouCount = listItForYouMap.get(userIdStr) || 0;
      const inspectionRequestsCount = inspectionMap.get(userIdStr) || 0;

      // Determine status
      let status = "Active";
      if (user.isDeleted) {
        status = "Inactive";
      } else if (!user.isOnline && user.lastSeen) {
        const daysSinceLastSeen = (Date.now() - new Date(user.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSeen > 30) {
          status = "Inactive";
        }
      }

      return {
        id: user._id.toString(),
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        status: status,
        listings: freeAdsCount + premiumAdsCount + rentalAdsCount,
        purchases: 0, // Placeholder - implement if you have purchase tracking
        joinedDate: user.dateAdded ? new Date(user.dateAdded).toISOString() : new Date().toISOString(),
        lastActive: user.lastSeen ? new Date(user.lastSeen).toISOString() : user.dateAdded ? new Date(user.dateAdded).toISOString() : new Date().toISOString(),
        role: user.userType || 'User',
        isVerified: !!(user.email && user.email.includes('@')), // Simple verification check
        freeAds: freeAdsCount,
        premiumAds: premiumAdsCount,
        rentalAds: rentalAdsCount,
        buyCarRequests: buyCarRequestsCount,
        listItForYouRequests: listItForYouCount,
        inspectionRequests: inspectionRequestsCount,
        address: '', // User model doesn't have address field
        city: '', // User model doesn't have city field
        country: 'Pakistan', // Default
        profilePicture: user.profileImage || undefined
      };
    });

    res.json({
      success: true,
      data: usersWithCounts
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching users:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN LIST ENDPOINT ====================
// Get all admins (requires SuperAdmin authentication)
app.get("/admin/list", authenticateToken, async (req, res) => {
  try {
    // Debug: Log userType to see what we're getting
    console.log("🔐 ========== /admin/list REQUEST ==========");
    console.log("🔐 req.userType:", req.userType);
    console.log("🔐 req.userType type:", typeof req.userType);
    console.log("🔐 req.userId:", req.userId);
    console.log("🔐 req.headers.authorization:", req.headers.authorization ? "EXISTS" : "MISSING");
    console.log("🔐 =========================================");

    // Check if user is SuperAdmin (case-insensitive check)
    const userType = String(req.userType || '').toLowerCase().trim();
    const isSuperAdmin = userType === 'superadmin';

    console.log("🔐 Normalized userType:", userType);
    console.log("🔐 Is SuperAdmin?", isSuperAdmin);

    if (!isSuperAdmin) {
      console.error("❌ Access denied - UserType:", req.userType, "| Normalized:", userType, "| Expected: superadmin");
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin access required.",
        debug: {
          receivedUserType: req.userType,
          normalizedUserType: userType,
          expectedUserType: 'SuperAdmin',
          userId: req.userId
        }
      });
    }

    console.log("✅ Access granted - SuperAdmin verified");

    // Fetch all Admin and SuperAdmin users (not deleted)
    const admins = await User.find({
      userType: { $in: ['Admin', 'SuperAdmin'] },
      isDeleted: { $ne: true }
    })
      .select('-password -googleId') // Exclude sensitive fields
      .sort({ dateAdded: -1 });

    // Format admins data
    const formattedAdmins = admins.map((admin) => {
      // Determine status
      let status = "Active";
      if (admin.isDeleted) {
        status = "Suspended";
      }

      return {
        id: admin._id.toString(),
        name: admin.name || 'N/A',
        email: admin.email || 'N/A',
        phone: admin.phone || 'N/A',
        address: '', // User model doesn't have address field
        city: '', // User model doesn't have city field
        country: 'Pakistan', // Default
        isVerified: !!(admin.email && admin.email.includes('@')),
        isBlocked: false, // Placeholder - add if you have blocking feature
        isSuspended: admin.isDeleted || false,
        createdAt: admin.dateAdded ? new Date(admin.dateAdded).toISOString() : new Date().toISOString(),
        lastActive: admin.lastSeen ? new Date(admin.lastSeen).toISOString() : admin.dateAdded ? new Date(admin.dateAdded).toISOString() : new Date().toISOString(),
        totalUsers: 0, // Placeholder - calculate if needed
        totalInspectors: 0, // Placeholder - calculate if needed
        status: status,
        userType: admin.userType || 'Admin'
      };
    });

    res.json({
      success: true,
      data: formattedAdmins
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching admins:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching admins",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== CREATE ADMIN ENDPOINT ====================
// Create a new admin (requires SuperAdmin authentication)
app.post("/admin/create", authenticateToken, async (req, res) => {
  try {
    console.log("🔐 ========== /admin/create REQUEST ==========");
    console.log("🔐 req.userType:", req.userType);
    console.log("🔐 req.userId:", req.userId);
    console.log("🔐 Request body:", { ...req.body, password: '***' });

    // Check if user is SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase().trim();
    if (userType !== 'superadmin') {
      console.error("❌ Access denied - UserType:", req.userType, "| Expected: SuperAdmin");
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin access required.",
        error: "Only SuperAdmin can create admin accounts."
      });
    }

    console.log("✅ Access granted - SuperAdmin verified");

    // Validate required fields
    const { name, email, password, phone, address, city, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        error: "Missing required fields"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
        error: "Email must be a valid email address"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
        error: "Password too short"
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
        error: "Email already registered"
      });
    }

    // Hash password using security middleware
    const hashedPassword = await securityMiddleware.hashPassword(password);

    // Create new admin user
    const newAdmin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      userType: 'Admin',
      isDeleted: false,
      dateAdded: new Date()
    });

    await newAdmin.save();

    console.log("✅ Admin created successfully:", {
      id: newAdmin._id.toString(),
      email: newAdmin.email,
      name: newAdmin.name,
      userType: newAdmin.userType
    });

    // Return success response (exclude password)
    res.json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone || '',
        userType: newAdmin.userType,
        createdAt: newAdmin.dateAdded
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== REPORTS ENDPOINT ====================
// Get all reports (requires Admin or SuperAdmin authentication)
app.get("/reports", authenticateToken, async (req, res) => {
  try {
    console.log("🔐 ========== /reports REQUEST ==========");
    console.log("🔐 req.userType:", req.userType);
    console.log("🔐 req.userId:", req.userId);

    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase().trim();
    const isAuthorized = userType === 'admin' || userType === 'superadmin';

    console.log("🔐 Normalized userType:", userType);
    console.log("🔐 Is Authorized?", isAuthorized);

    if (!isAuthorized) {
      console.error("❌ Access denied - UserType:", req.userType, "| Expected: Admin or SuperAdmin");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required.",
        debug: {
          receivedUserType: req.userType,
          normalizedUserType: userType,
          expectedUserTypes: ['Admin', 'SuperAdmin']
        }
      });
    }

    console.log("✅ Access granted - Admin/SuperAdmin verified");

    // Fetch all reports with populated reportedBy field
    const reports = await Report.find({})
      .populate('reportedBy', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format reports data for frontend
    const formattedReports = reports.map((report) => {
      // Get listing details based on listingType
      let listingData = {
        make: null,
        model: null,
        year: null,
        price: null
      };

      // Note: To get full listing details, we'd need to query the specific model
      // For now, return basic report data

      return {
        _id: report._id.toString(),
        listingId: report.listingId.toString(),
        listingType: report.listingType,
        reason: report.reason,
        description: report.description || '',
        status: report.status || 'Pending',
        adminNotes: report.adminNotes || '',
        reportedBy: report.reportedBy ? {
          _id: report.reportedBy._id.toString(),
          name: report.reportedBy.name || 'Unknown',
          email: report.reportedBy.email || '',
          phone: report.reportedBy.phone || ''
        } : null,
        reviewedBy: report.reviewedBy ? {
          _id: report.reviewedBy._id.toString(),
          name: report.reviewedBy.name || 'Unknown',
          email: report.reviewedBy.email || ''
        } : null,
        reviewedAt: report.reviewedAt || null,
        createdAt: report.createdAt || report.createdAt,
        updatedAt: report.updatedAt || report.updatedAt,
        // Placeholder fields for frontend compatibility
        make: listingData.make,
        model: listingData.model,
        year: listingData.year,
        price: listingData.price
      };
    });

    console.log(`✅ Found ${formattedReports.length} reports`);

    res.json(formattedReports);

  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== USERS ENDPOINT ====================
// Get all users (requires Admin/SuperAdmin authentication)
app.get("/users", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all users (not deleted)
    const users = await User.find({
      isDeleted: { $ne: true }
    })
      .select('-password -googleId') // Exclude sensitive fields
      .sort({ dateAdded: -1 })
      .lean();

    res.json(users);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching users:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get single user by ID (for admin dashboard - premium bikes, free ads, etc.)
const getUserByIdHandler = async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password -googleId')
      .lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json(user);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching user:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};
app.get("/users/:id", authenticateToken, getUserByIdHandler);
app.get("/user/:id", authenticateToken, getUserByIdHandler);
app.get("/users/get/:id", authenticateToken, getUserByIdHandler); // Admin dashboard alternate route

// ==================== CHAT CONVERSATIONS ENDPOINT ====================
// Get all conversations for a user (must be before /users/:id route to avoid conflicts)
app.get("/chat/conversations/:userId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Validate MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (!ChatConversation) {
      // Chat models not available, return empty array
      return res.json([]);
    }

    // FIXED: Convert userId to ObjectId for proper query matching
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    // Find all conversations where user is either buyer or seller
    console.log('🔍 Fetching conversations for userId:', userId, 'ObjectId:', userIdObjectId.toString());

    // FIXED: Use ObjectId query only since conversations are stored with ObjectId
    // MongoDB will automatically convert string to ObjectId if needed, but we'll be explicit
    const conversations = await ChatConversation.find({
      $or: [
        { buyerId: userIdObjectId },
        { sellerId: userIdObjectId }
      ]
    })
      .populate('sellerId', 'name email phone profileImage')
      .populate('buyerId', 'name email phone profileImage')
      .sort({ updatedAt: -1 })
      .lean();

    console.log('📊 Found conversations:', conversations.length);
    if (conversations.length > 0) {
      console.log('📋 First conversation:', {
        _id: conversations[0]._id,
        buyerId: conversations[0].buyerId,
        buyerIdType: typeof conversations[0].buyerId,
        sellerId: conversations[0].sellerId,
        sellerIdType: typeof conversations[0].sellerId,
        lastMessage: conversations[0].lastMessage
      });

      // Debug: Check if userId matches
      const firstConv = conversations[0];
      // FIXED: Properly extract _id from populated objects
      const buyerIdValue = firstConv.buyerId?._id || firstConv.buyerId;
      const sellerIdValue = firstConv.sellerId?._id || firstConv.sellerId;
      const buyerIdStr = buyerIdValue?.toString ? buyerIdValue.toString() : (typeof buyerIdValue === 'object' && buyerIdValue?._id ? String(buyerIdValue._id) : String(buyerIdValue || ''));
      const sellerIdStr = sellerIdValue?.toString ? sellerIdValue.toString() : (typeof sellerIdValue === 'object' && sellerIdValue?._id ? String(sellerIdValue._id) : String(sellerIdValue || ''));
      console.log('🔍 UserId match check:', {
        userId: userId,
        userIdObjectId: userIdObjectId.toString(),
        buyerIdStr: buyerIdStr,
        sellerIdStr: sellerIdStr,
        buyerIdRaw: firstConv.buyerId,
        sellerIdRaw: firstConv.sellerId,
        matchesBuyer: buyerIdStr === userId || buyerIdStr === userIdObjectId.toString(),
        matchesSeller: sellerIdStr === userId || sellerIdStr === userIdObjectId.toString()
      });
    } else {
      // FIXED: Debug - check if any conversations exist at all
      const totalCount = await ChatConversation.countDocuments({});
      console.log('🔍 Total conversations in DB:', totalCount);
      if (totalCount > 0) {
        const sampleConv = await ChatConversation.findOne({}).lean();
        console.log('📋 Sample conversation from DB:', {
          _id: sampleConv?._id,
          buyerId: sampleConv?.buyerId,
          buyerIdType: typeof sampleConv?.buyerId,
          sellerId: sampleConv?.sellerId,
          sellerIdType: typeof sampleConv?.sellerId
        });
      }
    }

    // FIXED: Filter out conversations with invalid _id before processing and serialize _id
    console.log('📊 Processing conversations, total found:', conversations.length);
    const validConversations = conversations
      .filter(conv => {
        if (!conv || !conv._id) {
          console.log('⚠️ Filtered out conversation - no _id:', conv);
          return false;
        }
        // FIXED: Check if _id is a valid ObjectId or can be converted to string
        // ObjectId instances have toString() method that returns 24-char hex string
        // Empty objects don't have toString() or return '[object Object]'
        if (typeof conv._id === 'object' && conv._id !== null) {
          // First check: Is it a valid ObjectId? (has toString that returns valid ObjectId string)
          if (conv._id.toString && typeof conv._id.toString === 'function') {
            try {
              const idStr = conv._id.toString();
              // Valid ObjectId strings are exactly 24 hex characters
              if (idStr && idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr)) {
                return true; // Valid ObjectId - accept it (ObjectIds have no enumerable properties)
              }
            } catch (e) {
              // toString() failed, continue to check if it's an empty object
            }
          }
          // Second check: Is it an empty object? (only check if toString() check failed)
          // Note: ObjectId instances have no enumerable properties, so Object.keys() returns []
          // But we already checked toString() above, so if we reach here and keys.length === 0, it's likely empty
          const keys = Object.keys(conv._id);
          if (keys.length === 0) {
            console.log('⚠️ Filtered out conversation - empty object _id:', conv);
            return false;
          }
          // If it has properties, it's valid (even if toString() check failed)
          return true;
        }
        // String _id is valid
        if (typeof conv._id === 'string' && conv._id.length > 0) {
          return true;
        }
        // Invalid type
        console.log('⚠️ Filtered out conversation - invalid _id type:', typeof conv._id, conv);
        return false;
      })
      .map(conv => {
        // FIXED: Serialize _id immediately
        let convId = conv._id;
        if (typeof convId === 'object' && convId !== null) {
          if (convId.toString && typeof convId.toString === 'function') {
            const str = String(convId.toString());
            if (str !== '[object Object]' && !str.includes('[object')) {
              convId = str;
            } else if (convId._id) {
              convId = String(convId._id);
            } else {
              console.log('⚠️ Invalid conversation ID (object without valid toString):', convId);
              return null; // Invalid ID
            }
          } else if (convId._id) {
            convId = String(convId._id);
          } else {
            console.log('⚠️ Invalid conversation ID (empty object):', convId);
            return null; // Empty object
          }
        } else if (typeof convId === 'string') {
          // Already a string
          convId = convId;
        } else {
          console.log('⚠️ Invalid conversation ID (invalid type):', typeof convId, convId);
          return null; // Invalid type
        }

        return { ...conv, _id: convId };
      })
      .filter(conv => conv !== null); // Remove null entries

    console.log('✅ Valid conversations after _id serialization:', validConversations.length);

    // Get unread counts for each conversation - FIXED: Serialize _id properly
    console.log('📊 Processing conversationsWithUnread, validConversations count:', validConversations.length);
    const conversationsWithUnread = await Promise.all(
      validConversations.map(async (conv) => {
        console.log('🔄 Processing conversation:', conv._id);
        const convId = conv._id; // Already serialized as string

        if (!ChatMessage) {
          return { ...conv, _id: convId, unreadCount: 0 };
        }

        const unreadCount = await ChatMessage.countDocuments({
          conversationId: convId,
          senderId: { $ne: userId },
          createdAt: { $gt: conv.lastReadAt || new Date(0) }
        });

        // FIXED: Serialize sellerId and buyerId _id fields properly
        const serializedConv = {
          ...conv,
          unreadCount
        };

        // Serialize sellerId._id if it's an object (populated user)
        if (serializedConv.sellerId && typeof serializedConv.sellerId === 'object' && serializedConv.sellerId !== null) {
          // FIXED: Properly extract _id from populated ObjectId
          let sellerIdStr = null;
          if (serializedConv.sellerId._id) {
            const sellerIdValue = serializedConv.sellerId._id;
            // Handle ObjectId properly
            if (sellerIdValue && typeof sellerIdValue === 'object' && sellerIdValue.toString && typeof sellerIdValue.toString === 'function') {
              sellerIdStr = sellerIdValue.toString();
            } else if (typeof sellerIdValue === 'string') {
              sellerIdStr = sellerIdValue;
            } else {
              sellerIdStr = String(sellerIdValue);
            }
          }

          if (sellerIdStr && sellerIdStr !== '[object Object]' && !sellerIdStr.includes('[object')) {
            serializedConv.sellerId = {
              _id: sellerIdStr,
              name: serializedConv.sellerId.name || null,
              email: serializedConv.sellerId.email || null,
              phone: serializedConv.sellerId.phone || null,
              profileImage: serializedConv.sellerId.profileImage || null
            };
          } else {
            // If sellerId is object but no valid _id, keep structure but set _id to null
            serializedConv.sellerId = {
              name: serializedConv.sellerId.name || null,
              email: serializedConv.sellerId.email || null,
              phone: serializedConv.sellerId.phone || null,
              profileImage: serializedConv.sellerId.profileImage || null,
              _id: null
            };
          }
        }

        // Serialize buyerId._id if it's an object (populated user)
        if (serializedConv.buyerId && typeof serializedConv.buyerId === 'object' && serializedConv.buyerId !== null) {
          // FIXED: Properly extract _id from populated ObjectId
          let buyerIdStr = null;
          if (serializedConv.buyerId._id) {
            const buyerIdValue = serializedConv.buyerId._id;
            // Handle ObjectId properly
            if (buyerIdValue && typeof buyerIdValue === 'object' && buyerIdValue.toString && typeof buyerIdValue.toString === 'function') {
              buyerIdStr = buyerIdValue.toString();
            } else if (typeof buyerIdValue === 'string') {
              buyerIdStr = buyerIdValue;
            } else {
              buyerIdStr = String(buyerIdValue);
            }
          }

          if (buyerIdStr && buyerIdStr !== '[object Object]' && !buyerIdStr.includes('[object')) {
            serializedConv.buyerId = {
              _id: buyerIdStr,
              name: serializedConv.buyerId.name || null,
              email: serializedConv.buyerId.email || null,
              phone: serializedConv.buyerId.phone || null,
              profileImage: serializedConv.buyerId.profileImage || null
            };
          } else {
            // If buyerId is object but no valid _id, keep structure but set _id to null
            serializedConv.buyerId = {
              name: serializedConv.buyerId.name || null,
              email: serializedConv.buyerId.email || null,
              phone: serializedConv.buyerId.phone || null,
              profileImage: serializedConv.buyerId.profileImage || null,
              _id: null
            };
          }
        }

        console.log('✅ Serialized conversation:', conv._id, 'buyerId:', serializedConv.buyerId?._id, 'sellerId:', serializedConv.sellerId?._id);
        return serializedConv;
      })
    );

    console.log('📊 conversationsWithUnread count:', conversationsWithUnread.length);
    console.log('📊 conversationsWithUnread sample:', conversationsWithUnread.length > 0 ? {
      _id: conversationsWithUnread[0]?._id,
      buyerId: conversationsWithUnread[0]?.buyerId,
      sellerId: conversationsWithUnread[0]?.sellerId
    } : 'none');

    // Filter out null entries (invalid conversations) - conversationsWithUnread already filtered from validConversations
    const finalConversations = conversationsWithUnread.filter(conv => {
      if (!conv || conv === null) {
        console.log('⚠️ Filtering out null conversation');
        return false;
      }
      return true;
    });

    console.log('📊 finalConversations count after null filter:', finalConversations.length);

    console.log('✅ Returning conversations:', finalConversations.length);
    if (finalConversations.length > 0) {
      console.log('📋 First final conversation:', {
        _id: finalConversations[0]._id,
        buyerId: finalConversations[0].buyerId?._id || finalConversations[0].buyerId,
        sellerId: finalConversations[0].sellerId?._id || finalConversations[0].sellerId,
        lastMessage: finalConversations[0].lastMessage
      });
    }

    res.json(finalConversations || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching chat conversations:', error);
    }
    // Return empty array on error instead of error response
    res.json([]);
  }
});

// ==================== CHAT MESSAGES ENDPOINTS ====================
// GET messages for a conversation
app.get("/chat/messages/:conversationId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({ success: false, message: "Conversation ID required" });
    }

    if (!ChatMessage) {
      return res.json([]);
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    const messages = await ChatMessage.find({ conversationId })
      .populate({
        path: 'senderId',
        select: 'name email phone profileImage',
        model: 'User'
      })
      .sort({ createdAt: 1 })
      .lean();

    // Serialize ObjectIds to strings - FIXED: Handle cases where senderId might not be populated
    const User = require('./models/User');
    const serializedMessages = await Promise.all(messages.map(async (msg) => {
      let senderInfo = {
        _id: null,
        name: 'Unknown',
        email: null,
        phone: null,
        profileImage: null
      };

      // Extract senderId
      let senderIdValue = null;
      if (msg.senderId) {
        if (typeof msg.senderId === 'object' && msg.senderId._id) {
          senderIdValue = msg.senderId._id;
          // If populated, use populated data
          if (msg.senderId.name) {
            senderInfo = {
              _id: msg.senderId._id.toString(),
              name: msg.senderId.name || 'Unknown',
              email: msg.senderId.email || null,
              phone: msg.senderId.phone || null,
              profileImage: msg.senderId.profileImage || null
            };
          } else {
            senderIdValue = msg.senderId._id;
          }
        } else if (typeof msg.senderId === 'object') {
          senderIdValue = msg.senderId;
        } else {
          senderIdValue = msg.senderId;
        }
      }

      // If senderId is not populated or name is missing, fetch user data
      if (!senderInfo.name || senderInfo.name === 'Unknown') {
        try {
          const user = await User.findById(senderIdValue).select('name email phone profileImage').lean();
          if (user) {
            senderInfo = {
              _id: user._id.toString(),
              name: user.name || 'Unknown',
              email: user.email || null,
              phone: user.phone || null,
              profileImage: user.profileImage || null
            };
          } else if (senderIdValue) {
            // At least set the ID
            senderInfo._id = senderIdValue.toString();
          }
        } catch (error) {
          // If fetch fails, at least set the ID
          if (senderIdValue) {
            senderInfo._id = senderIdValue.toString();
          }
        }
      }

      return {
        ...msg,
        _id: msg._id.toString(),
        conversationId: msg.conversationId.toString(),
        senderId: senderInfo,
        createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: msg.updatedAt ? new Date(msg.updatedAt).toISOString() : new Date().toISOString()
      };
    }));

    res.json(serializedMessages);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching chat messages:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST a new message (creates conversation if needed)
app.post("/chat/messages", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { conversationId, senderId, text, buyerId, sellerId, adId } = req.body;

    console.log('📨 POST /chat/messages - Request body:', {
      conversationId,
      senderId: typeof senderId === 'object' ? senderId._id : senderId,
      hasText: !!text,
      buyerId,
      sellerId,
      adId
    });

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    if (!ChatMessage || !ChatConversation) {
      return res.status(503).json({ success: false, message: "Chat service unavailable" });
    }

    const mongoose = require('mongoose');
    let actualConversationId = conversationId;
    let actualSenderId = senderId;

    // Handle senderId as object (from frontend)
    if (senderId && typeof senderId === 'object') {
      if (senderId._id) {
        actualSenderId = senderId._id;
      } else if (Object.keys(senderId).length > 0) {
        // Try to extract ID from object
        actualSenderId = senderId.id || senderId.userId || null;
      }
    }

    if (!actualSenderId) {
      return res.status(400).json({ success: false, message: "Sender ID is required" });
    }

    // Validate senderId
    if (!mongoose.Types.ObjectId.isValid(actualSenderId)) {
      return res.status(400).json({ success: false, message: "Invalid sender ID" });
    }

    // FIXED: Handle temporary conversation IDs (temp_*)
    // If conversationId starts with "temp_" or is invalid, find/create conversation using buyerId/sellerId
    const isTempConversationId = actualConversationId && (
      typeof actualConversationId === 'string' &&
      (actualConversationId.startsWith('temp_') || !mongoose.Types.ObjectId.isValid(actualConversationId))
    );

    // Extract buyerId/sellerId from route params if not in body
    let actualBuyerId = buyerId;
    let actualSellerId = sellerId;

    // If we have a temp conversation ID or no valid conversationId, we need buyerId/sellerId
    if (isTempConversationId || !actualConversationId) {
      // Try to get buyerId from senderId (sender is usually the buyer)
      if (!actualBuyerId) {
        actualBuyerId = actualSenderId;
      }

      // If we still don't have sellerId, we can't create conversation
      if (!actualSellerId) {
        // Try to extract from conversationId if it's a temp one with seller info
        // Otherwise, return error
        return res.status(400).json({
          success: false,
          message: "Seller ID is required to create conversation"
        });
      }
    }

    // If no conversationId or temp conversationId, create or find conversation
    if (!actualConversationId || isTempConversationId) {
      if (!actualBuyerId || !actualSellerId) {
        return res.status(400).json({
          success: false,
          message: "Buyer ID and Seller ID are required to create conversation"
        });
      }

      // Validate buyerId and sellerId
      if (!mongoose.Types.ObjectId.isValid(actualBuyerId) || !mongoose.Types.ObjectId.isValid(actualSellerId)) {
        return res.status(400).json({ success: false, message: "Invalid buyer or seller ID" });
      }

      // FIXED: Convert buyerId and sellerId to ObjectId for proper query matching
      const buyerIdObjectId = new mongoose.Types.ObjectId(actualBuyerId);
      const sellerIdObjectId = new mongoose.Types.ObjectId(actualSellerId);

      // Find existing conversation between buyer and seller
      const existingConv = await ChatConversation.findOne({
        $or: [
          { buyerId: buyerIdObjectId, sellerId: sellerIdObjectId },
          { buyerId: sellerIdObjectId, sellerId: buyerIdObjectId }
        ]
      });

      if (existingConv) {
        actualConversationId = existingConv._id.toString();
        console.log('✅ Found existing conversation:', actualConversationId);
        // Update adId if provided and different
        if (adId && existingConv.adId?.toString() !== adId) {
          await ChatConversation.findByIdAndUpdate(existingConv._id, { adId });
        }
      } else {
        // Create new conversation - FIXED: Use ObjectId for proper storage
        console.log('🆕 Creating new conversation for buyer:', actualBuyerId, 'seller:', actualSellerId);
        const newConv = await ChatConversation.create({
          buyerId: buyerIdObjectId,
          sellerId: sellerIdObjectId,
          adId: adId || null,
          lastMessage: text.trim(),
          updatedAt: new Date()
        });
        actualConversationId = newConv._id.toString();
        console.log('✅ Created new conversation:', actualConversationId);
        console.log('📋 Conversation details:', {
          _id: newConv._id.toString(),
          buyerId: newConv.buyerId.toString(),
          sellerId: newConv.sellerId.toString(),
          lastMessage: newConv.lastMessage
        });
      }
    }

    if (!actualConversationId) {
      return res.status(400).json({ success: false, message: "Conversation ID or buyer/seller IDs required" });
    }

    // Validate conversationId (should be valid now)
    if (!mongoose.Types.ObjectId.isValid(actualConversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    // Verify conversation exists
    const conversation = await ChatConversation.findById(actualConversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify sender is part of the conversation
    const senderIdStr = actualSenderId.toString();
    const buyerIdStr = conversation.buyerId.toString();
    const sellerIdStr = conversation.sellerId.toString();

    if (senderIdStr !== buyerIdStr && senderIdStr !== sellerIdStr) {
      return res.status(403).json({ success: false, message: "You are not part of this conversation" });
    }

    // Create message
    const message = await ChatMessage.create({
      conversationId: actualConversationId,
      senderId: actualSenderId,
      text: text.trim()
    });

    // Create new_message notification for recipient (the other participant)
    if (Notification) {
      try {
        const recipientId = senderIdStr === buyerIdStr ? conversation.sellerId : conversation.buyerId;
        let senderName = 'Someone';
        try {
          const senderUser = await User.findById(actualSenderId).select('name').lean();
          if (senderUser && senderUser.name) senderName = senderUser.name;
        } catch (e) { }
        await Notification.create({
          userId: recipientId,
          type: 'new_message',
          title: 'New Message',
          message: `${senderName}: ${(text.trim().length > 50) ? text.trim().substring(0, 50) + '...' : text.trim()}`,
          read: false,
          dateAdded: new Date()
        });
      } catch (notifErr) {
        if (process.env.NODE_ENV !== 'production') console.error('New message notification create error:', notifErr);
      }
    }

    // Update conversation's lastMessage and updatedAt
    await ChatConversation.findByIdAndUpdate(actualConversationId, {
      lastMessage: text.trim(),
      updatedAt: new Date()
    });

    // Populate senderId for response - FIXED: Ensure proper population with fallback
    let senderInfo = {
      _id: actualSenderId.toString(),
      name: 'Unknown',
      email: null,
      phone: null,
      profileImage: null
    };

    // Try to populate senderId
    let populatedMessage = null;
    try {
      populatedMessage = await ChatMessage.findById(message._id)
        .populate({
          path: 'senderId',
          select: 'name email phone profileImage',
          model: 'User'
        })
        .lean();

      if (populatedMessage && populatedMessage.senderId) {
        if (typeof populatedMessage.senderId === 'object' && populatedMessage.senderId._id) {
          senderInfo = {
            _id: populatedMessage.senderId._id.toString(),
            name: populatedMessage.senderId.name || 'Unknown',
            email: populatedMessage.senderId.email || null,
            phone: populatedMessage.senderId.phone || null,
            profileImage: populatedMessage.senderId.profileImage || null
          };
        }
      }
    } catch (populateError) {
      console.log('⚠️ Populate failed, fetching user directly:', populateError.message);
    }

    // Fallback: Always fetch user directly to ensure we have the name
    if (senderInfo.name === 'Unknown') {
      try {
        const user = await User.findById(actualSenderId).select('name email phone profileImage').lean();
        if (user) {
          senderInfo = {
            _id: user._id.toString(),
            name: user.name || 'Unknown',
            email: user.email || null,
            phone: user.phone || null,
            profileImage: user.profileImage || null
          };
        }
      } catch (userError) {
        console.log('⚠️ Failed to fetch user:', userError.message);
      }
    }

    // Serialize response - FIXED: Use message object if populatedMessage is not available
    const messageData = populatedMessage || message;
    const serializedMessage = {
      _id: messageData._id.toString(),
      conversationId: messageData.conversationId.toString(),
      senderId: senderInfo,
      text: messageData.text || text.trim(),
      createdAt: messageData.createdAt ? new Date(messageData.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: messageData.updatedAt ? new Date(messageData.updatedAt).toISOString() : new Date().toISOString()
    };

    console.log('✅ Message sent successfully:', serializedMessage._id, 'Sender:', senderInfo.name);

    // FIXED: Emit socket events to notify clients about new message
    try {
      // Get socket.io instance - it's defined globally in this file
      if (typeof io !== 'undefined' && io) {
        // Emit to conversation room
        io.to(`conversation:${actualConversationId}`).emit('newMessage', {
          conversationId: actualConversationId.toString(),
          message: serializedMessage,
          senderId: senderInfo
        });

        // Emit conversation update
        io.to(`conversation:${actualConversationId}`).emit('conversationUpdated', {
          conversationId: actualConversationId.toString(),
          lastMessage: serializedMessage.text,
          lastMessageAt: serializedMessage.createdAt,
          updatedAt: serializedMessage.updatedAt
        });

        // Also emit to individual user rooms for real-time updates
        io.to(`user:${buyerIdStr}`).emit('newMessage', {
          conversationId: actualConversationId.toString(),
          message: serializedMessage,
          senderId: senderInfo
        });
        io.to(`user:${sellerIdStr}`).emit('newMessage', {
          conversationId: actualConversationId.toString(),
          message: serializedMessage,
          senderId: senderInfo
        });

        // Broadcast to all clients (fallback)
        io.emit('newMessage', {
          conversationId: actualConversationId.toString(),
          message: serializedMessage,
          senderId: senderInfo
        });
      }
    } catch (socketError) {
      // Don't fail the request if socket emit fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Socket emit error (non-critical):', socketError.message);
      }
    }

    res.status(201).json(serializedMessage);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error sending chat message:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST mark conversation as read
app.post("/chat/conversations/:conversationId/read", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: "Conversation ID required" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    if (!ChatConversation) {
      return res.status(503).json({ success: false, message: "Chat service unavailable" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Find conversation
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    const buyerIdStr = conversation.buyerId.toString();
    const sellerIdStr = conversation.sellerId.toString();
    const userIdStr = userId.toString();

    if (buyerIdStr !== userIdStr && sellerIdStr !== userIdStr) {
      return res.status(403).json({ success: false, message: "You are not part of this conversation" });
    }

    // Update lastReadAt to current time
    conversation.lastReadAt = new Date();
    await conversation.save();

    console.log(`✅ Conversation ${conversationId} marked as read by user ${userId}`);

    // Emit socket event to notify other user
    try {
      if (typeof io !== 'undefined' && io) {
        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('messagesRead', {
          conversationId: conversationId.toString(),
          userId: userIdStr,
          lastReadAt: conversation.lastReadAt.toISOString()
        });

        // Emit to individual user rooms
        io.to(`user:${buyerIdStr}`).emit('messagesRead', {
          conversationId: conversationId.toString(),
          userId: userIdStr,
          lastReadAt: conversation.lastReadAt.toISOString()
        });
        io.to(`user:${sellerIdStr}`).emit('messagesRead', {
          conversationId: conversationId.toString(),
          userId: userIdStr,
          lastReadAt: conversation.lastReadAt.toISOString()
        });
      }
    } catch (socketError) {
      // Don't fail the request if socket emit fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Socket emit error (non-critical):', socketError.message);
      }
    }

    res.json({
      success: true,
      message: "Conversation marked as read",
      lastReadAt: conversation.lastReadAt.toISOString()
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error marking conversation as read:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error marking conversation as read",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE messages
app.delete("/chat/messages/delete", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { messageIds, userId, conversationId } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: "Message IDs array is required" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!conversationId) {
      return res.status(400).json({ success: false, message: "Conversation ID is required" });
    }

    if (!ChatMessage || !ChatConversation) {
      return res.status(503).json({ success: false, message: "Chat service unavailable" });
    }

    const mongoose = require('mongoose');

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Verify user is part of the conversation
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const buyerIdStr = conversation.buyerId.toString();
    const sellerIdStr = conversation.sellerId.toString();
    const userIdStr = userId.toString();

    if (buyerIdStr !== userIdStr && sellerIdStr !== userIdStr) {
      return res.status(403).json({ success: false, message: "You are not part of this conversation" });
    }

    // Validate all message IDs
    const validMessageIds = messageIds.filter(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log(`⚠️ Invalid message ID: ${id}`);
        return false;
      }
      return true;
    });

    if (validMessageIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid message IDs provided" });
    }

    // Find messages and verify they belong to the conversation and user
    const messages = await ChatMessage.find({
      _id: { $in: validMessageIds },
      conversationId: conversationId
    });

    if (messages.length === 0) {
      return res.status(404).json({ success: false, message: "No messages found to delete" });
    }

    // Verify user owns the messages (can only delete their own messages)
    const userOwnedMessages = messages.filter(msg => {
      const msgSenderId = msg.senderId.toString();
      return msgSenderId === userIdStr;
    });

    if (userOwnedMessages.length === 0) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    // Delete the messages
    const messageIdsToDelete = userOwnedMessages.map(msg => msg._id);
    const deleteResult = await ChatMessage.deleteMany({
      _id: { $in: messageIdsToDelete },
      conversationId: conversationId,
      senderId: userId
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} messages for user ${userId} in conversation ${conversationId}`);

    // Check if conversation has any remaining messages
    const remainingMessagesCount = await ChatMessage.countDocuments({ conversationId: conversationId });

    // Emit socket events to notify clients about deleted messages
    try {
      if (typeof io !== 'undefined' && io) {
        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('messagesDeleted', {
          conversationId: conversationId.toString(),
          deletedMessageIds: messageIdsToDelete.map(id => id.toString()),
          deletedBy: userIdStr,
          conversationDeleted: remainingMessagesCount === 0
        });

        // Emit to individual user rooms
        io.to(`user:${buyerIdStr}`).emit('messagesDeleted', {
          conversationId: conversationId.toString(),
          deletedMessageIds: messageIdsToDelete.map(id => id.toString()),
          deletedBy: userIdStr,
          conversationDeleted: remainingMessagesCount === 0
        });
        io.to(`user:${sellerIdStr}`).emit('messagesDeleted', {
          conversationId: conversationId.toString(),
          deletedMessageIds: messageIdsToDelete.map(id => id.toString()),
          deletedBy: userIdStr,
          conversationDeleted: remainingMessagesCount === 0
        });
      }
    } catch (socketError) {
      // Don't fail the request if socket emit fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Socket emit error (non-critical):', socketError.message);
      }
    }

    // If no messages remain, optionally delete the conversation
    // (You can uncomment this if you want to auto-delete empty conversations)
    // if (remainingMessagesCount === 0) {
    //   await ChatConversation.findByIdAndDelete(conversationId);
    //   console.log(`✅ Deleted empty conversation ${conversationId}`);
    // }

    res.json({
      success: true,
      message: "Messages deleted successfully",
      deletedCount: deleteResult.deletedCount,
      deletedMessageIds: messageIdsToDelete.map(id => id.toString()),
      conversationDeleted: remainingMessagesCount === 0
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error deleting messages:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error deleting messages",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE a conversation
app.delete("/chat/conversation/:conversationId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: "Conversation ID required" });
    }

    if (!ChatConversation || !ChatMessage) {
      return res.status(503).json({ success: false, message: "Chat service unavailable" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    // Find conversation
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify user is part of the conversation (optional check if userId provided)
    if (userId) {
      const buyerIdStr = conversation.buyerId.toString();
      const sellerIdStr = conversation.sellerId.toString();
      const userIdStr = userId.toString();

      if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
        return res.status(403).json({ success: false, message: "You are not part of this conversation" });
      }
    }

    // Delete all messages in the conversation
    await ChatMessage.deleteMany({ conversationId: conversationId });

    // Delete the conversation
    await ChatConversation.findByIdAndDelete(conversationId);

    res.json({
      success: true,
      message: "Conversation deleted successfully",
      conversationId: conversationId
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting conversation:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error deleting conversation",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

app.get("/users/:id/seller-info", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findById(id)
      .select('name email phone profileImage')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Format phone number for contact info
    const phone = user.phone || null;
    let callUrl = null;
    let whatsappUrl = null;

    if (phone) {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phone.replace(/[^\d]/g, '');
      // Ensure it starts with country code (92 for Pakistan)
      let formattedPhone = cleanPhone;
      if (cleanPhone.startsWith('0')) {
        formattedPhone = '92' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('92')) {
        formattedPhone = '92' + cleanPhone;
      }

      // Create call and WhatsApp URLs
      callUrl = `tel:${formattedPhone}`;
      whatsappUrl = `https://wa.me/${formattedPhone}`;
    }

    // Build contactInfo object
    const contactInfo = phone ? {
      phone: phone,
      callUrl: callUrl,
      whatsappUrl: whatsappUrl
    } : null;

    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      contactInfo: contactInfo
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching seller info:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching seller info",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Track ad view - increment views count for any ad type
app.post("/track-ad-view/:id", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Ad ID required" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ad ID format" });
    }

    // Try to find and update the ad in different collections
    let ad = null;
    let views = 0;

    // Try Featured_Ads first
    ad = await Featured_Ads.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Try Free_Ads
    ad = await Free_Ads.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Try Bike_Ads
    ad = await Bike_Ads.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Try NewCarData
    ad = await NewCarData.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Try ListItforyouad
    ad = await ListItforyouad.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Try Rent_Car
    ad = await Rent_Car.findById(id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      views = ad.views;
      return res.json({ success: true, views: views });
    }

    // Ad not found in any collection
    return res.status(404).json({ success: false, message: "Ad not found" });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error tracking ad view:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error tracking ad view",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Toggle favorite - add or remove userId from favoritedBy array
app.post("/toggle_favorite", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    let { adId, userId } = req.body;

    if (!adId || userId == null || userId === '') {
      return res.status(400).json({
        success: false,
        message: "adId and userId are required"
      });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ad ID format"
      });
    }

    // Normalize userId: accept string or object (e.g. { _id: "..." }) so favoritedBy always stores a string
    let userIdStr = null;
    if (typeof userId === 'string') {
      userIdStr = userId.trim();
    } else if (userId && typeof userId === 'object') {
      userIdStr = (userId._id != null ? String(userId._id) : null) || (userId.userId != null ? String(userId.userId) : null) || (userId.id != null ? String(userId.id) : null);
    }
    if (!userIdStr || !mongoose.Types.ObjectId.isValid(userIdStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    let ad = null;
    let isFavorited = false;

    // Helper function to toggle favorite (always store string in favoritedBy so GET favorite_ads matches)
    const toggleFavoriteInAd = (ad) => {
      if (!ad.favoritedBy) {
        ad.favoritedBy = [];
      }
      const favoritedByStrings = ad.favoritedBy.map(id => String(id));
      const index = favoritedByStrings.indexOf(userIdStr);
      if (index > -1) {
        ad.favoritedBy.splice(index, 1);
        return false;
      } else {
        ad.favoritedBy.push(userIdStr);
        return true;
      }
    };

    // Try to find the ad in different collections
    // Try Featured_Ads first
    ad = await Featured_Ads.findById(adId);
    if (ad) {
      isFavorited = toggleFavoriteInAd(ad);
      await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
      return res.json({
        success: true,
        isFavorited: isFavorited,
        message: isFavorited ? "Added to favorites" : "Removed from favorites"
      });
    }

    // Try Free_Ads
    ad = await Free_Ads.findById(adId);
    if (ad) {
      isFavorited = toggleFavoriteInAd(ad);
      await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
      return res.json({
        success: true,
        isFavorited: isFavorited,
        message: isFavorited ? "Added to favorites" : "Removed from favorites"
      });
    }

    // Try Bike_Ads
    if (Bike_Ads) {
      ad = await Bike_Ads.findById(adId);
      if (ad) {
        isFavorited = toggleFavoriteInAd(ad);
        await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
        return res.json({
          success: true,
          isFavorited: isFavorited,
          message: isFavorited ? "Added to favorites" : "Removed from favorites"
        });
      }
    }

    // Try NewCarData
    if (NewCarData) {
      ad = await NewCarData.findById(adId);
      if (ad) {
        isFavorited = toggleFavoriteInAd(ad);
        await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
        return res.json({
          success: true,
          isFavorited: isFavorited,
          message: isFavorited ? "Added to favorites" : "Removed from favorites"
        });
      }
    }

    // Try ListItforyouad
    ad = await ListItforyouad.findById(adId);
    if (ad) {
      isFavorited = toggleFavoriteInAd(ad);
      await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
      return res.json({
        success: true,
        isFavorited: isFavorited,
        message: isFavorited ? "Added to favorites" : "Removed from favorites"
      });
    }

    // Try Rent_Car
    ad = await Rent_Car.findById(adId);
    if (ad) {
      isFavorited = toggleFavoriteInAd(ad);
      await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
      return res.json({
        success: true,
        isFavorited: isFavorited,
        message: isFavorited ? "Added to favorites" : "Removed from favorites"
      });
    }

    // Try AutoStore
    if (AutoStore) {
      ad = await AutoStore.findById(adId);
      if (ad) {
        isFavorited = toggleFavoriteInAd(ad);
        await ad.save({ timestamps: false }); // FIXED: Don't update updatedAt/dateAdded
        return res.json({
          success: true,
          isFavorited: isFavorited,
          message: isFavorited ? "Added to favorites" : "Removed from favorites"
        });
      }
    }

    // Ad not found in any collection
    return res.status(404).json({
      success: false,
      message: "Ad not found"
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error toggling favorite:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error toggling favorite",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete ad (soft delete) - user can only delete their own ad
app.delete("/delete_ad/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    if (!id) return res.status(400).json({ success: false, message: "Ad ID is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ad ID format." });
    }
    const userStr = String(userId);

    const matchOwner = (doc) => {
      if (!doc) return false;
      const owner = doc.userId || doc.addedBy;
      if (!owner) return false;
      const ownerStr = (typeof owner === 'string') ? owner : (owner.toString ? owner.toString() : (owner._id ? String(owner._id) : null));
      return ownerStr === userStr;
    };

    let ad = await Featured_Ads.findById(id);
    if (ad && matchOwner(ad)) {
      await Featured_Ads.findByIdAndUpdate(id, { isDeleted: true, dateModified: new Date() });
      return res.json({ success: true, message: "Ad deleted successfully." });
    }
    ad = await Free_Ads.findById(id);
    if (ad && matchOwner(ad)) {
      await Free_Ads.findByIdAndUpdate(id, { isDeleted: true });
      return res.json({ success: true, message: "Ad deleted successfully." });
    }
    if (Bike_Ads) {
      ad = await Bike_Ads.findById(id);
      if (ad && matchOwner(ad)) {
        await Bike_Ads.findByIdAndUpdate(id, { isDeleted: true });
        return res.json({ success: true, message: "Ad deleted successfully." });
      }
    }
    if (NewCarData) {
      ad = await NewCarData.findById(id);
      if (ad && matchOwner(ad)) {
        await NewCarData.findByIdAndUpdate(id, { isDeleted: true });
        return res.json({ success: true, message: "Ad deleted successfully." });
      }
    }
    ad = await ListItforyouad.findById(id);
    if (ad && matchOwner(ad)) {
      await ListItforyouad.findByIdAndUpdate(id, { isDeleted: true });
      return res.json({ success: true, message: "Ad deleted successfully." });
    }
    ad = await Rent_Car.findById(id);
    if (ad && matchOwner(ad)) {
      await Rent_Car.findByIdAndUpdate(id, { isDeleted: true });
      return res.json({ success: true, message: "Ad deleted successfully." });
    }
    if (AutoStore) {
      ad = await AutoStore.findById(id);
      if (ad && matchOwner(ad)) {
        await AutoStore.findByIdAndUpdate(id, { isDeleted: true });
        return res.json({ success: true, message: "Ad deleted successfully." });
      }
    }
    return res.status(404).json({ success: false, message: "Ad not found or you do not have permission to delete it." });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("delete_ad error:", error);
    res.status(500).json({ success: false, message: "Error deleting ad.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Toggle ad active status (activate/deactivate) - user can only toggle their own ad
app.patch("/toggle_ad_status/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    if (!id) return res.status(400).json({ success: false, message: "Ad ID is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ad ID format." });
    }
    const userStr = String(userId);
    const matchOwner = (doc) => {
      if (!doc) return false;
      const owner = doc.userId || doc.addedBy;
      if (!owner) return false;
      const ownerStr = (typeof owner === 'string') ? owner : (owner.toString ? owner.toString() : (owner._id ? String(owner._id) : null));
      return ownerStr === userStr;
    };

    let ad = await Featured_Ads.findById(id);
    if (ad && matchOwner(ad)) {
      ad.isActive = !ad.isActive;
      await ad.save();
      return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
    }
    ad = await Free_Ads.findById(id);
    if (ad && matchOwner(ad)) {
      ad.isActive = !ad.isActive;
      await ad.save();
      return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
    }
    if (Bike_Ads) {
      ad = await Bike_Ads.findById(id);
      if (ad && matchOwner(ad)) {
        ad.isActive = !ad.isActive;
        await ad.save();
        return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
      }
    }
    if (NewCarData) {
      ad = await NewCarData.findById(id);
      if (ad && matchOwner(ad)) {
        ad.isActive = !ad.isActive;
        await ad.save();
        return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
      }
    }
    ad = await ListItforyouad.findById(id);
    if (ad && matchOwner(ad)) {
      ad.isActive = !ad.isActive;
      await ad.save();
      return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
    }
    ad = await Rent_Car.findById(id);
    if (ad && matchOwner(ad)) {
      ad.isActive = !ad.isActive;
      await ad.save();
      return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
    }
    if (AutoStore) {
      ad = await AutoStore.findById(id);
      if (ad && matchOwner(ad)) {
        ad.isActive = !ad.isActive;
        await ad.save();
        return res.json({ success: true, ad: { isActive: ad.isActive }, message: ad.isActive ? "Ad activated." : "Ad deactivated." });
      }
    }
    return res.status(404).json({ success: false, message: "Ad not found or you do not have permission to change it." });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("toggle_ad_status error:", error);
    res.status(500).json({ success: false, message: "Error updating ad status.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Public: Get favorite autoparts ads for a user (must be before /favorite_ads/:userId)
app.get("/favorite_ads/autoparts/:userId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') return res.json([]);
    const uid = userId.trim();
    if (!uid || uid.length < 20 || !/^[a-fA-F0-9]+$/.test(uid)) return res.json([]);
    let oid;
    try {
      oid = new require('mongoose').Types.ObjectId(uid);
    } catch (e) {
      return res.json([]);
    }
    const favoritedQuery = { favoritedBy: { $in: [uid, oid] } };
    if (!AutoStore) return res.json([]);
    const ads = await AutoStore.find({ ...favoritedQuery, isDeleted: { $ne: true } }).lean();
    return res.json(Array.isArray(ads) ? ads : []);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('favorite_ads/autoparts error:', err);
    return res.json([]);
  }
});

// Public: Get favorite car/bike/rent etc ads for a user
app.get("/favorite_ads/:userId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') return res.json([]);
    const mongoose = require('mongoose');
    const uid = userId.trim();
    if (!uid || uid.length < 20 || !/^[a-fA-F0-9]+$/.test(uid)) return res.json([]);
    let oid;
    try {
      oid = new mongoose.Types.ObjectId(uid);
    } catch (e) {
      return res.json([]);
    }
    const favoritedQuery = { favoritedBy: { $in: [uid, oid] } };
    const baseQuery = { isDeleted: { $ne: true } };
    const q = { $and: [baseQuery, favoritedQuery] };

    const [featured, free, bikes, newCars, listIt, rentCars] = await Promise.all([
      Featured_Ads.find(q).lean(),
      Free_Ads.find(q).lean(),
      Bike_Ads ? Bike_Ads.find(q).lean() : [],
      NewCarData ? NewCarData.find(q).lean() : [],
      ListItforyouad.find(q).lean(),
      Rent_Car.find(q).lean()
    ]);

    const results = [];
    const pushAll = (list) => {
      if (Array.isArray(list)) list.forEach(ad => {
        if (ad && ad._id) {
          // DEBUG: Log first 3 favorites to check dateAdded
          if (results.length < 3) {
            console.log('📅 Favorite Ad Date Check:', {
              _id: ad._id,
              make: ad.make,
              model: ad.model,
              dateAdded: ad.dateAdded,
              updatedAt: ad.updatedAt,
              createdAt: ad.createdAt,
              approvedAt: ad.approvedAt
            });
          }
          results.push(ad);
        }
      });
    };
    pushAll(featured);
    pushAll(free);
    pushAll(bikes);
    pushAll(newCars);
    pushAll(listIt);
    pushAll(rentCars);
    results.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    return res.json(results);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('favorite_ads error:', err);
    return res.json([]);
  }
});

// ==================== NOTIFICATIONS API (dynamic) ====================
// GET /notifications/:userId - fetch all notifications for user
app.get("/notifications/:userId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Notification) return res.json([]);
    const { userId } = req.params;
    if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) return res.json([]);
    const list = await Notification.find({ userId, isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .limit(100)
      .lean();
    const formatted = (list || []).map((n) => ({
      _id: n._id.toString(),
      userId: n.userId ? n.userId.toString() : userId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read === true,
      dateAdded: n.dateAdded ? new Date(n.dateAdded).toISOString() : new Date().toISOString(),
      adId: n.adId ? n.adId.toString() : undefined,
      adModel: n.adModel,
      adTitle: n.adTitle,
      collection: n.collection,
      status: n.status,
    }));
    return res.json(formatted);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('notifications list error:', err);
    return res.json([]);
  }
});

// PUT /notifications/:id/read - mark one as read
app.put("/notifications/:id/read", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Notification) return res.status(200).json({ success: true });
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });
    await Notification.findByIdAndUpdate(id, { read: true });
    return res.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('notification read error:', err);
    return res.status(500).json({ success: false });
  }
});

// PUT /notifications/:userId/read-all - mark all as read
app.put("/notifications/:userId/read-all", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Notification) return res.status(200).json({ success: true });
    const { userId } = req.params;
    if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false });
    await Notification.updateMany({ userId }, { read: true });
    return res.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('notifications read-all error:', err);
    return res.status(500).json({ success: false });
  }
});

// DELETE /notifications/:userId/clear-all - soft delete all for user
app.delete("/notifications/:userId/clear-all", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Notification) return res.status(200).json({ success: true });
    const { userId } = req.params;
    if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false });
    await Notification.updateMany({ userId }, { isDeleted: true });
    return res.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('notifications clear-all error:', err);
    return res.status(500).json({ success: false });
  }
});

// DELETE /notifications/:id - delete single notification
app.delete("/notifications/:id", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Notification) return res.status(200).json({ success: true });
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) return res.status(400).json({ success: false });
    await Notification.findByIdAndUpdate(id, { isDeleted: true });
    return res.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('notification delete error:', err);
    return res.status(500).json({ success: false });
  }
});

// Public: Get all ads owned by a user (for MyAds screen - no auth)
app.get("/all_user_ads/:userId", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "userId required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json([]);
    const oid = new mongoose.Types.ObjectId(userId);

    const results = [];

    // Helper function to properly serialize MongoDB ObjectIds and Dates
    const serializeAd = (ad) => {
      if (!ad) return null;
      const serialized = { ...ad };

      // Convert _id to string
      if (serialized._id) {
        if (serialized._id.toString && typeof serialized._id.toString === 'function') {
          serialized._id = serialized._id.toString();
        } else if (typeof serialized._id === 'object' && serialized._id._id) {
          serialized._id = serialized._id._id.toString();
        } else if (typeof serialized._id === 'object' && Object.keys(serialized._id).length === 0) {
          // Skip empty object IDs - this shouldn't happen but handle it
          return null;
        }
      }

      // Convert userId to string
      if (serialized.userId) {
        if (serialized.userId.toString && typeof serialized.userId.toString === 'function') {
          serialized.userId = serialized.userId.toString();
        } else if (typeof serialized.userId === 'object' && Object.keys(serialized.userId).length === 0) {
          serialized.userId = null; // Set to null if empty object
        }
      }

      // Convert addedBy to string (for listItForYou)
      if (serialized.addedBy) {
        if (serialized.addedBy.toString && typeof serialized.addedBy.toString === 'function') {
          serialized.addedBy = serialized.addedBy.toString();
        } else if (typeof serialized.addedBy === 'object' && Object.keys(serialized.addedBy).length === 0) {
          serialized.addedBy = null;
        }
      }

      // Convert dateAdded to ISO string
      if (serialized.dateAdded) {
        if (serialized.dateAdded instanceof Date) {
          serialized.dateAdded = serialized.dateAdded.toISOString();
        } else if (serialized.dateAdded.toString && typeof serialized.dateAdded.toString === 'function') {
          try {
            const date = new Date(serialized.dateAdded);
            if (!isNaN(date.getTime())) {
              serialized.dateAdded = date.toISOString();
            }
          } catch (e) {
            // Keep original if conversion fails
          }
        } else if (typeof serialized.dateAdded === 'object' && Object.keys(serialized.dateAdded).length === 0) {
          serialized.dateAdded = new Date().toISOString(); // Use current date as fallback
        }
      }

      // Convert createdAt to ISO string if exists
      if (serialized.createdAt) {
        if (serialized.createdAt instanceof Date) {
          serialized.createdAt = serialized.createdAt.toISOString();
        } else if (serialized.createdAt.toString && typeof serialized.createdAt.toString === 'function') {
          try {
            const date = new Date(serialized.createdAt);
            if (!isNaN(date.getTime())) {
              serialized.createdAt = date.toISOString();
            }
          } catch (e) {
            // Keep original if conversion fails
          }
        }
      }

      // Convert updatedAt to ISO string if exists
      if (serialized.updatedAt) {
        if (serialized.updatedAt instanceof Date) {
          serialized.updatedAt = serialized.updatedAt.toISOString();
        }
      }

      return serialized;
    };

    const addWithType = (list, adType, adSource) => {
      if (!Array.isArray(list)) return;
      list.forEach(ad => {
        const serialized = serializeAd(ad);
        if (!serialized || !serialized._id) {
          console.warn(`⚠️ Skipping ad with invalid ID in ${adSource}:`, ad);
          return; // Skip ads without valid _id
        }
        serialized.adType = adType;
        serialized.adSource = adSource;
        results.push(serialized);
      });
    };

    const [freeAds, featuredAds, bikeAds, newCars, listItForYou, rentCars, autoParts] = await Promise.all([
      Free_Ads.find({ userId: oid, isDeleted: { $ne: true } }).lean(),
      Featured_Ads.find({ userId: oid, isDeleted: { $ne: true } }).lean(),
      Bike_Ads ? Bike_Ads.find({ userId: oid, isDeleted: { $ne: true } }).lean() : [],
      NewCarData ? NewCarData.find({ userId: oid, isDeleted: { $ne: true } }).lean() : [],
      ListItforyouad.find({ addedBy: oid, isDeleted: { $ne: true } }).lean(),
      Rent_Car.find({ userId: oid, isDeleted: { $ne: true } }).lean(),
      AutoStore ? AutoStore.find({ userId: oid, isDeleted: { $ne: true } }).lean() : []
    ]);

    addWithType(freeAds, 'free', 'free_ads');
    addWithType(featuredAds, 'featured', 'featured_ads');
    addWithType(bikeAds, 'bike', 'bike_ads');
    addWithType(newCars, 'newCar', 'new_cars');
    addWithType(listItForYou, 'listItForYou', 'list_it_for_you_ad');
    addWithType(rentCars, 'rentcar', 'rent_car');
    addWithType(autoParts, 'autoparts', 'autoparts');

    results.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    res.json(results);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('all_user_ads error:', error);
    res.status(500).json([]);
  }
});

// ==================== FREE ADS ENDPOINT ====================
// Multer for free ad images (include invoiceImage so receipt/invoice uploads don't trigger UNEXPECTED_FILE_FIELD)
const freeAdsImageFields = [{ name: 'invoiceImage', maxCount: 1 }];
for (let i = 1; i <= 20; i++) freeAdsImageFields.push({ name: `image${i}`, maxCount: 1 });
const freeAdsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'free_ads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `free-${unique}.${ext}`);
  }
});
const uploadFreeAdsImages = multer({
  storage: freeAdsStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).fields(freeAdsImageFields);

// POST free ad (mobile app)
app.post("/free_ads", uploadFreeAdsImages, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId." });
    }
    const title = (b.title || '').trim();
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const location = (b.location || '').trim();
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);
    if (!title || !make || !model || !location) {
      return res.status(400).json({ success: false, message: "title, make, model, and location are required." });
    }
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/free_ads/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const featuresStr = b.features || '';
    const features = typeof featuresStr === 'string' ? featuresStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      title,
      make,
      model,
      variant: (b.variant || '').trim(),
      bodyType: (b.bodyType || '').trim(),
      category: (b.category || '').trim(),
      location: location || 'N/A',
      year: isNaN(year) ? new Date().getFullYear() : year,
      price: isNaN(price) ? 0 : price,
      bodyColor: (b.bodyColor || '').trim(),
      kmDriven: parseInt(b.kmDriven, 10) || 0,
      fuelType: (b.fuelType || '').trim(),
      engineCapacity: (b.engineCapacity || '').trim(),
      description: (b.description || '').trim(),
      transmission: (b.transmission || '').trim(),
      assembly: (b.assembly || '').trim(),
      registrationCity: (b.registrationCity || '').trim(),
      preferredContact: (b.preferredContact || '').trim(),
      features,
      isActive: true,
      isDeleted: false,
      isSold: false,
      modelType: 'Free',
      image1: getPath(files.image1),
      image2: getPath(files.image2),
      image3: getPath(files.image3),
      image4: getPath(files.image4),
      image5: getPath(files.image5),
      image6: getPath(files.image6),
      image7: getPath(files.image7),
      image8: getPath(files.image8)
    };
    const ad = new Free_Ads(doc);
    await ad.save();
    res.status(201).json({
      success: true,
      message: "Ad posted successfully.",
      data: { id: ad._id.toString() }
    });
  } catch (error) {
    console.error('POST free_ads error:', error.message || error);
    const errMsg = error.message || String(error);
    res.status(500).json({
      success: false,
      message: "Error creating ad. Please try again.",
      error: errMsg
    });
  }
});

// Get all free ads (requires Admin/SuperAdmin authentication)
app.get("/free_ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Check for query parameters
    const { isPaidAd } = req.query;
    const query = { isDeleted: { $ne: true } };

    // Filter by isPaidAd if provided
    if (isPaidAd === 'true') {
      query.isPaidAd = true;
    }

    // Fetch all free ads with timeout protection
    const startTime = Date.now();
    const queryPromise = Free_Ads.find(query)
      .sort({ dateAdded: -1 })
      .lean()
      .limit(2000) // Limit to 2000 records for admin panel
      .maxTimeMS(20000) // MongoDB timeout: 20 seconds
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 20000);
    });

    let freeAds = [];
    try {
      freeAds = await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      console.error('⚠️ /free_ads query failed:', err.message);
      freeAds = []; // Return empty on error
    }

    const queryTime = Date.now() - startTime;
    console.log(`✅ /free_ads: Found ${freeAds.length} ads in ${queryTime}ms`);
    res.json(freeAds);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching free ads:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching free ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== FEATURED ADS ENDPOINT ====================
// Multer for featured/premium car ad images
const featuredAdsImageFields = [{ name: 'invoiceImage', maxCount: 1 }];
for (let i = 1; i <= 20; i++) featuredAdsImageFields.push({ name: `image${i}`, maxCount: 1 });
const featuredAdsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'featured_ads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `${file.fieldname || 'img'}-${unique}.${ext}`);
  }
});
const uploadFeaturedAdsImages = multer({ storage: featuredAdsStorage, fileFilter: multerImageFilter, limits: multerLimits }).fields(featuredAdsImageFields);

app.post("/featured_ads", uploadFeaturedAdsImages, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const isFreeAd = b.isFreeAd === 'true' || b.isFreeAd === true || b.modelType === 'Free';
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/featured_ads/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const featuresStr = b.features || '';
    const features = typeof featuresStr === 'string' ? featuresStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const baseDoc = {
      userId: new mongoose.Types.ObjectId(userId),
      title: (b.title || '').trim(),
      make: (b.make || '').trim(),
      model: (b.model || '').trim(),
      variant: (b.variant || '').trim(),
      bodyType: (b.bodyType || '').trim(),
      location: (b.location || '').trim() || 'N/A',
      year: parseInt(b.year, 10) || new Date().getFullYear(),
      price: parseFloat(b.price) || 0,
      bodyColor: (b.bodyColor || '').trim(),
      kmDriven: parseInt(b.kmDriven, 10) || 0,
      fuelType: (b.fuelType || '').trim(),
      engineCapacity: (b.engineCapacity || '').trim(),
      description: (b.description || '').trim(),
      transmission: (b.transmission || '').trim(),
      assembly: (b.assembly || '').trim(),
      registrationCity: (b.registrationCity || '').trim(),
      preferredContact: (b.preferredContact || '').trim(),
      features,
      image1: getPath(files.image1), image2: getPath(files.image2), image3: getPath(files.image3),
      image4: getPath(files.image4), image5: getPath(files.image5), image6: getPath(files.image6),
      invoiceImage: getPath(files.invoiceImage)
    };
    if (isFreeAd) {
      const doc = { ...baseDoc, isActive: true, isDeleted: false, isSold: false, modelType: 'Free' };
      const ad = new Free_Ads(doc);
      await ad.save();
      return res.status(201).json({ success: true, message: "Ad posted successfully.", data: { id: ad._id.toString() } });
    }
    const doc = {
      ...baseDoc,
      isActive: false,
      isDeleted: false,
      isSold: false,
      isFeatured: 'Pending',
      paymentStatus: (b.paymentStatus || 'pending').trim(),
      packageId: (b.packageId || '').trim(),
      packageName: (b.packageName || '').trim(),
      packagePrice: parseFloat(b.packagePrice) || 0,
      paymentAmount: parseFloat(b.paymentAmount) || 0
    };
    const ad = new Featured_Ads(doc);
    await ad.save();
    res.status(201).json({ success: true, message: "Ad submitted for review. It will appear after admin approval.", data: { id: ad._id.toString() } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST featured_ads error:', error);
    res.status(500).json({ success: false, message: "Error creating ad. Please try again.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Public: Get featured ads for mobile app (no auth)
app.get("/featured_ads/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, returning empty ads');
    return res.json([]);
  }

  const startTime = Date.now();
  // PERFORMANCE: Reduced timeout from 20s to 10s for faster failure
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      return res.json([]); // Return empty array on timeout
    }
  }, 10000);

  try {
    // Filter only approved, active, non-expired premium cars
    const now = new Date();

    // PERFORMANCE: Removed multiple countDocuments calls - they slow down the endpoint
    // Direct query is faster

    // Build query conditions - filter at database level
    // FIXED: Admin approval is the primary criteria - show all approved ads
    // isActive and paymentStatus are optional (admin approval takes precedence)
    const finalQueryConditions = {
      isDeleted: { $ne: true },
      isFeatured: 'Approved', // Only approved by admin - THIS IS THE MAIN CRITERIA
      $and: [
        // Check expiry: either no expiry date OR expiry date is in future OR expiry date is null
        {
          $or: [
            { featuredExpiryDate: { $exists: false } },
            { featuredExpiryDate: null },
            { featuredExpiryDate: { $gt: now } }
          ]
        }
      ]
    };

    // PERFORMANCE: Removed debug logging and optimized query
    // Use select() to fetch only needed fields for faster queries
    const queryPromise = Featured_Ads.find(finalQueryConditions)
      .select('_id userId title make model variant year price location kmDriven fuelType transmission bodyType bodyColor engineCapacity description features image1 image2 image3 image4 image5 image6 image7 image8 image9 image10 image11 image12 image13 image14 image15 image16 image17 image18 image19 image20 dateAdded isActive isFeatured isDeleted isSold registrationCity assembly preferredContact favoritedBy views paymentStatus featuredExpiryDate validityDays approvedAt')
      .sort({ dateAdded: -1 })
      .lean()
      .limit(100) // PERFORMANCE: Reduced from 500 to 100 for faster response
      .maxTimeMS(8000) // PERFORMANCE: Reduced timeout from 15s to 8s
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 8000);
    });

    let featuredAds = [];
    try {
      featuredAds = await Promise.race([queryPromise, timeoutPromise]);

      // PERFORMANCE: Removed fallback queries - they slow down the endpoint
      // If no results, return empty array immediately
    } catch (err) {
      // PERFORMANCE: Removed error logging for faster response
      featuredAds = []; // Return empty on error
    }

    // Filter out expired ads based on validityDays + approvedAt (if both exist)
    // Use the same 'now' variable declared above
    const filteredAds = (featuredAds || []).filter((ad) => {
      // If validityDays and approvedAt exist, check if expired
      if (ad.validityDays && ad.approvedAt) {
        try {
          const approvedDate = new Date(ad.approvedAt);
          if (!isNaN(approvedDate.getTime())) {
            const expiryDate = new Date(approvedDate);
            expiryDate.setDate(expiryDate.getDate() + ad.validityDays);
            if (expiryDate < now) {
              return false; // Expired based on validityDays
            }
          }
        } catch (e) {
          // If date parsing fails, keep the ad
        }
      }
      return true;
    });

    // PERFORMANCE: Optimized ID normalization - faster processing
    const normalizedAds = filteredAds.map((ad) => {
      // Fast _id normalization
      if (ad._id && typeof ad._id === 'object') {
        try {
          if (ad._id.toString && typeof ad._id.toString === 'function') {
            const idStr = ad._id.toString();
            if (idStr && idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr)) {
              ad._id = idStr;
            } else if (ad._id._id) {
              ad._id = String(ad._id._id);
            }
          } else if (ad._id._id) {
            ad._id = String(ad._id._id);
          }
        } catch (e) {
          // Keep original if conversion fails
        }
      }

      // Fast userId normalization (critical for own property check)
      if (ad.userId && typeof ad.userId === 'object') {
        try {
          if (ad.userId.toString && typeof ad.userId.toString === 'function') {
            const userIdStr = ad.userId.toString();
            if (userIdStr && userIdStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(userIdStr)) {
              ad.userId = userIdStr;
            } else if (ad.userId._id) {
              ad.userId = String(ad.userId._id);
            } else {
              ad.userId = null;
            }
          } else if (ad.userId._id) {
            ad.userId = String(ad.userId._id);
          } else {
            ad.userId = null;
          }
        } catch (e) {
          ad.userId = null;
        }
      }

      // Ensure id field exists
      if (!ad.id && ad._id) {
        ad.id = ad._id;
      }
      // Serialize dates to ISO so app shows "X days ago" (jis din post hua)
      const toISO = (v) => { if (!v) return null; try { return (v instanceof Date) ? v.toISOString() : new Date(v).toISOString(); } catch (e) { return null; } };
      ad.dateAdded = toISO(ad.dateAdded) || toISO(ad.approvedAt) || new Date().toISOString();
      if (ad.approvedAt) ad.approvedAt = toISO(ad.approvedAt);
      return ad;
    });

    clearTimeout(timeout);
    const queryTime = Date.now() - startTime;
    // PERFORMANCE: Only log if query is slow (>3 seconds)
    if (queryTime > 3000) {
      console.warn(`⚠️ /featured_ads/public: Slow query took ${queryTime}ms, returned ${normalizedAds.length} ads`);
    }
    res.json(normalizedAds || []);
  } catch (error) {
    clearTimeout(timeout);
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching featured ads (public):', error);
    // Return empty array instead of error for better UX
    res.json([]);
  }
});
// Get all featured ads (requires Admin/SuperAdmin authentication)
app.get("/featured_ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all featured ads
    const featuredAds = await Featured_Ads.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(featuredAds);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching featured ads:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching featured ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN PREMIUM CAR ADS ENDPOINT ====================
// Get all premium car ads (requires Admin/SuperAdmin authentication)
app.get("/admin/premium-car-ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all premium car ads (Featured_Ads are premium car ads)
    // FIXED: Select paymentReceiptImages field to include payment receipt images
    const premiumCarAds = await Featured_Ads.find({
      isDeleted: { $ne: true }
    })
      .select('_id userId title make model variant year price location kmDriven fuelType transmission bodyType bodyColor engineCapacity description features image1 image2 image3 image4 image5 image6 image7 image8 image9 image10 image11 image12 image13 image14 image15 image16 image17 image18 image19 image20 dateAdded isActive isFeatured isDeleted isSold registrationCity assembly preferredContact favoritedBy views paymentStatus featuredExpiryDate validityDays approvedAt invoiceImage paymentReceiptImages paymentAmount packageName packagePrice')
      .populate('userId', 'name email phone')
      .sort({ dateAdded: -1 })
      .lean();

    res.json(premiumCarAds);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching premium car ads:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching premium car ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN PREMIUM BIKE ADS ENDPOINT ====================
// Get all premium bike ads (requires Admin/SuperAdmin authentication)
app.get("/admin/premium-bike-ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!Bike_Ads) {
      console.error('❌ Bike_Ads model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch all premium bike ads
    const premiumBikeAds = await Bike_Ads.find({
      isDeleted: { $ne: true }
    })
      .populate('userId', 'name email phone')
      .sort({ dateAdded: -1 })
      .lean();

    res.json(premiumBikeAds || []);

  } catch (error) {
    console.error('❌ Error fetching premium bike ads:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching premium bike ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Approve premium bike ad – set isFeatured Approved and isActive true so it shows in Used Bikes
app.patch("/admin/premium-bikes/:id/approve", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin or SuperAdmin required." });
    }
    if (!Bike_Ads) return res.status(503).json({ success: false, message: "Bike_Ads model not loaded." });
    const { id } = req.params;
    const { adminNotes } = req.body || {};
    const ad = await Bike_Ads.findByIdAndUpdate(
      id,
      {
        isFeatured: 'Approved',
        isActive: true,
        approvedAt: new Date(),
        adminNotes: adminNotes || '',
        statusUpdatedAt: new Date()
      },
      { new: true }
    ).lean();
    if (!ad) {
      return res.status(404).json({ success: false, message: "Premium bike ad not found." });
    }
    if (Notification && ad.userId) {
      try {
        await Notification.create({
          userId: ad.userId,
          type: 'featured_ad_status_updated',
          title: 'Ad Approved',
          message: `Your premium bike ad "${(ad.title || ad.make + ' ' + ad.model || 'Ad')}" is now approved and live!`,
          status: 'Approved',
          adId: ad._id,
          adModel: 'Bike_Ads',
          adTitle: ad.title || ad.make + ' ' + ad.model,
          read: false,
          dateAdded: new Date()
        });
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.error('Bike approve notification error:', e); }
    }
    console.log(`✅ Premium bike ad ${id} approved by ${req.userId}`);
    res.json({ success: true, message: "Premium bike ad approved and active.", ad });
  } catch (error) {
    console.error('❌ Error approving premium bike ad:', error);
    res.status(500).json({ success: false, message: "Error approving premium bike ad", error: error.message });
  }
});

// Reject premium bike ad
app.patch("/admin/premium-bikes/:id/reject", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin or SuperAdmin required." });
    }
    if (!Bike_Ads) return res.status(503).json({ success: false, message: "Bike_Ads model not loaded." });
    const { id } = req.params;
    const { adminNotes } = req.body || {};
    const ad = await Bike_Ads.findByIdAndUpdate(
      id,
      { isFeatured: 'Rejected', adminNotes: adminNotes || '', statusUpdatedAt: new Date() },
      { new: true }
    ).lean();
    if (!ad) {
      return res.status(404).json({ success: false, message: "Premium bike ad not found." });
    }
    console.log(`✅ Premium bike ad ${id} rejected by ${req.userId}`);
    res.json({ success: true, message: "Premium bike ad rejected.", ad });
  } catch (error) {
    console.error('❌ Error rejecting premium bike ad:', error);
    res.status(500).json({ success: false, message: "Error rejecting premium bike ad", error: error.message });
  }
});

// ==================== ADMIN PREMIUM CARS MANAGEMENT ENDPOINTS ====================
// Approve premium car ad (requires Admin/SuperAdmin authentication)
app.patch("/admin/premium-cars/:id/approve", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;
    const { adminNotes } = req.body || {};

    // Find and update the premium car ad
    const premiumCar = await Featured_Ads.findByIdAndUpdate(
      id,
      {
        isFeatured: 'Approved',
        isActive: true, // FIXED: Set isActive to true when admin approves
        approvedAt: new Date(),
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    if (!premiumCar) {
      return res.status(404).json({
        success: false,
        message: "Premium car ad not found"
      });
    }

    // Notify ad owner that their ad is approved/active
    if (Notification && premiumCar.userId) {
      try {
        await Notification.create({
          userId: premiumCar.userId,
          type: 'featured_ad_status_updated',
          title: 'Ad Approved',
          message: `Your premium car ad "${(premiumCar.title || premiumCar.make + ' ' + premiumCar.model || 'Ad')}" is now approved and live!`,
          status: 'Approved',
          adId: premiumCar._id,
          adModel: 'Featured_Ads',
          adTitle: premiumCar.title || premiumCar.make + ' ' + premiumCar.model,
          read: false,
          dateAdded: new Date()
        });
      } catch (notifErr) {
        if (process.env.NODE_ENV !== 'production') console.error('Ad approved notification create error:', notifErr);
      }
    }

    console.log(`✅ Premium car ad ${id} approved by ${req.userId}`);
    res.json({
      success: true,
      message: "Premium car ad approved successfully",
      ad: premiumCar
    });

  } catch (error) {
    console.error('❌ Error approving premium car ad:', error);
    res.status(500).json({
      success: false,
      message: "Error approving premium car ad",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Reject premium car ad (requires Admin/SuperAdmin authentication)
app.patch("/admin/premium-cars/:id/reject", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;
    const { adminNotes } = req.body || {};

    // Find and update the premium car ad
    const premiumCar = await Featured_Ads.findByIdAndUpdate(
      id,
      {
        isFeatured: 'Rejected',
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    if (!premiumCar) {
      return res.status(404).json({
        success: false,
        message: "Premium car ad not found"
      });
    }

    console.log(`✅ Premium car ad ${id} rejected by ${req.userId}`);
    res.json({
      success: true,
      message: "Premium car ad rejected successfully",
      ad: premiumCar
    });

  } catch (error) {
    console.error('❌ Error rejecting premium car ad:', error);
    res.status(500).json({
      success: false,
      message: "Error rejecting premium car ad",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete premium car ad (requires Admin/SuperAdmin authentication)
app.delete("/admin/premium-cars/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;

    // Soft delete: set isDeleted to true
    const premiumCar = await Featured_Ads.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    if (!premiumCar) {
      return res.status(404).json({
        success: false,
        message: "Premium car ad not found"
      });
    }

    console.log(`✅ Premium car ad ${id} deleted by ${req.userId}`);
    res.json({
      success: true,
      message: "Premium car ad deleted successfully"
    });

  } catch (error) {
    console.error('❌ Error deleting premium car ad:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting premium car ad",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN FREE BIKE ADS ENDPOINT ====================
// Get all free bike ads (requires Admin/SuperAdmin authentication)
app.get("/admin/free-bike-ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!Bike_Ads) {
      console.error('❌ Bike_Ads model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch all free bike ads (bikes that are not premium/paid)
    // Free bikes are bikes where isPaidAd is not true or doesn't exist
    const freeBikeAds = await Bike_Ads.find({
      isDeleted: { $ne: true },
      $or: [
        { isPaidAd: { $ne: true } },
        { isPaidAd: { $exists: false } }
      ]
    })
      .populate('userId', 'name email phone')
      .sort({ dateAdded: -1 })
      .lean();

    res.json(freeBikeAds || []);

  } catch (error) {
    console.error('❌ Error fetching free bike ads:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching free bike ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== LIST IT FOR YOU ADS ENDPOINT ====================
// Public: Get active list-it-for-you ads for mobile app / website (no auth required)
app.get("/list_it_for_you_ad/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, returning empty ads');
    return res.json([]);
  }

  const startTime = Date.now();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('⚠️ /list_it_for_you_ad/public query timeout after 20s');
      return res.json([]); // Return empty array on timeout
    }
  }, 20000);

  try {
    // Use Promise.race for timeout protection
    const queryPromise = ListItforyouad.find({
      isDeleted: { $ne: true },
      isActive: true
    })
      .sort({ dateAdded: -1 })
      .lean()
      .limit(500) // Limit to 500 records
      .maxTimeMS(15000) // MongoDB timeout: 15 seconds
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000);
    });

    let ads = [];
    try {
      ads = await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      console.error('⚠️ /list_it_for_you_ad/public query failed:', err.message);
      ads = []; // Return empty on error
    }

    clearTimeout(timeout);
    const queryTime = Date.now() - startTime;
    console.log(`✅ /list_it_for_you_ad/public: Found ${ads.length} ads in ${queryTime}ms`);
    res.json(ads || []);
  } catch (error) {
    clearTimeout(timeout);
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching list it for you ads (public):', error);
    res.json([]); // Return empty array instead of error
  }
});

// Old endpoint (keeping for backward compatibility but optimized)
app.get("/list_it_for_you_ad/public_old", async (req, res) => {
  try {
    const ads = await ListItforyouad.find({
      isDeleted: { $ne: true },
      isActive: true
    })
      .sort({ dateAdded: -1 })
      .lean();
    res.json(ads);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching list it for you ads (public):', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching list it for you ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ALL ADS (PUBLIC) - MOBILE APP ====================
// Public: Get single ad by ID from any collection (no auth required)
app.get("/all_ads/:id", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ad ID" });
    }
    const collections = [
      { model: Free_Ads, source: 'free_ads' },
      { model: Featured_Ads, source: 'featured_ads' },
      { model: Bike_Ads, source: 'bike_ads' },
      { model: NewCarData, source: 'new_cars' },
      { model: ListItforyouad, source: 'list_it_for_you_ad' },
      { model: Rent_Car, source: 'rent_car' },
      { model: AutoStore, source: 'autoparts' }
    ].filter(c => c.model);
    // PERFORMANCE: Sequential search but optimized - stop on first match
    for (const { model, source } of collections) {
      let doc;
      if (source === 'featured_ads') {
        // For Featured_Ads, fetch without .lean() first to preserve ObjectId
        doc = await model.findOne({ _id: id, isDeleted: { $ne: true } });
        if (doc) {
          // Convert to plain object but preserve userId ObjectId
          doc = doc.toObject ? doc.toObject() : doc;
        }
      } else {
        // PERFORMANCE: Use lean() for faster queries on other collections
        doc = await model.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
      }

      if (doc) {
        // PERFORMANCE: Removed debug logging for faster response

        // FIXED: Serialize IDs to strings
        const serialized = { ...doc, adSource: source };

        // Serialize _id
        if (serialized._id && typeof serialized._id === 'object') {
          if (serialized._id.toString && typeof serialized._id.toString === 'function') {
            serialized._id = serialized._id.toString();
          } else if (serialized._id._id) {
            serialized._id = serialized._id._id.toString();
          }
        }

        // Serialize userId - FIXED: Properly handle ObjectId (especially for Featured_Ads)
        if (serialized.userId) {
          if (typeof serialized.userId === 'string') {
            // Already a string, validate it's a valid ObjectId format
            if (serialized.userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(serialized.userId)) {
              // Valid ObjectId string, keep as is
              serialized.userId = serialized.userId;
            } else {
              // Invalid string format - silently set to null (no logging for performance)
              serialized.userId = null;
            }
          } else if (typeof serialized.userId === 'object' && serialized.userId !== null) {
            // Check if it's a valid ObjectId instance
            const isObjectId = serialized.userId.constructor &&
              (serialized.userId.constructor.name === 'ObjectId' ||
                serialized.userId.constructor.name === 'Types.ObjectId');

            if (isObjectId || (serialized.userId.toString && typeof serialized.userId.toString === 'function')) {
              // Valid ObjectId instance - convert to string
              try {
                const idStr = serialized.userId.toString();
                // Validate it's a proper ObjectId string (24 hex chars)
                if (idStr && idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr)) {
                  serialized.userId = idStr;
                } else {
                  // Invalid format - silently set to null (no logging for performance)
                  serialized.userId = null;
                }
              } catch (e) {
                // Error converting - silently set to null (no logging for performance)
                serialized.userId = null;
              }
            } else if (serialized.userId._id) {
              // Has nested _id - try to extract
              try {
                const nestedId = serialized.userId._id;
                if (nestedId && nestedId.toString && typeof nestedId.toString === 'function') {
                  const idStr = nestedId.toString();
                  if (idStr && idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr)) {
                    serialized.userId = idStr;
                  } else {
                    serialized.userId = null;
                  }
                } else {
                  serialized.userId = null;
                }
              } catch (e) {
                serialized.userId = null;
              }
            } else {
              // Check if it's an empty object
              const keys = Object.keys(serialized.userId);
              if (keys.length === 0) {
                // Empty object - silently set to null (no logging for performance)
                serialized.userId = null;
              } else {
                // Has keys but not a valid ObjectId - silently set to null
                serialized.userId = null;
              }
            }
          } else {
            // null or undefined
            serialized.userId = null;
          }
        } else {
          // userId is missing - silently set to null (no logging for performance)
          serialized.userId = null;
        }

        // PERFORMANCE: Removed debug logging for faster response

        // Serialize addedBy (for listItForYou)
        if (serialized.addedBy && typeof serialized.addedBy === 'object') {
          if (serialized.addedBy.toString && typeof serialized.addedBy.toString === 'function') {
            serialized.addedBy = serialized.addedBy.toString();
          } else if (serialized.addedBy._id) {
            serialized.addedBy = serialized.addedBy._id.toString();
          } else if (Object.keys(serialized.addedBy).length === 0) {
            serialized.addedBy = null;
          }
        }

        // Always serialize dateAdded and approvedAt to ISO so app shows "X days ago" (post date)
        const toISO = (val) => {
          if (!val) return null;
          try {
            return (val instanceof Date) ? val.toISOString() : new Date(val).toISOString();
          } catch (e) { return null; }
        };
        serialized.dateAdded = toISO(serialized.dateAdded) || toISO(serialized.approvedAt) || toISO(serialized.createdAt) || new Date().toISOString();
        serialized.approvedAt = toISO(serialized.approvedAt) || serialized.dateAdded;

        return res.json(serialized);
      }
    }

    // No ad found in any collection
    return res.status(404).json({ success: false, message: "Ad not found" });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching ad by id:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching ad",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Public: Get all ads from all collections (no auth required)
app.get("/all_ads", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, returning empty ads');
    return res.json([]);
  }

  const startTime = Date.now();
  // PERFORMANCE: Reduced timeout from 25s to 15s for faster failure
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      return res.status(504).json([]); // Return empty array on timeout
    }
  }, 15000); // 15 second timeout

  try {
    const baseQuery = { isDeleted: { $ne: true } };
    const collections = [
      { model: Free_Ads, source: 'free_ads', query: baseQuery },
      {
        model: Featured_Ads,
        source: 'featured_ads',
        // Fetch all non-deleted premium cars, filter active/approved in JavaScript
        query: baseQuery
      },
      { model: Bike_Ads, source: 'bike_ads', query: baseQuery },
      { model: NewCarData, source: 'new_cars', query: baseQuery },
      { model: ListItforyouad, source: 'list_it_for_you_ad', query: baseQuery },
      { model: Rent_Car, source: 'rent_car', query: baseQuery }
    ].filter(c => c.model);

    // Use Promise.race for timeout protection
    const now = new Date();
    const queryPromise = Promise.all(
      collections.map(async ({ model, source, query: collectionQuery }) => {
        // For Featured_Ads, use same query conditions as /featured_ads/public endpoint
        // FIXED: Removed isActive and paymentStatus filters - admin approval is main criteria
        let finalQuery = collectionQuery;
        if (source === 'featured_ads') {
          finalQuery = {
            isDeleted: { $ne: true },
            isFeatured: 'Approved', // Only approved by admin - THIS IS THE MAIN CRITERIA
            // Check expiry: either no expiry date OR expiry date is in future OR expiry date is null
            $or: [
              { featuredExpiryDate: { $exists: false } },
              { featuredExpiryDate: null },
              { featuredExpiryDate: { $gt: now } }
            ]
          };
        }
        // FIXED: For ListItForYou (Managed by AutoFinder), don't filter by isActive
        // Managed cars should always show regardless of isActive status
        if (source === 'list_it_for_you_ad') {
          finalQuery = {
            isDeleted: { $ne: true }
            // No isActive filter - managed cars always show
          };
        }

        // PERFORMANCE: Optimized query - select only essential fields
        // FIXED: Increased limit for premium cars to ensure all approved cars are fetched
        const limitForSource = source === 'featured_ads' ? 200 : 100; // More premium cars allowed
        const list = await model.find(finalQuery)
          .select('_id userId title make model variant year price location kmDriven fuelType transmission bodyType bodyColor engineCapacity description features image1 image2 image3 image4 image5 image6 image7 image8 image9 image10 dateAdded isActive isFeatured isDeleted isSold registrationCity assembly preferredContact favoritedBy views paymentStatus featuredExpiryDate validityDays approvedAt modelType adSource')
          .sort({ dateAdded: -1 })
          .lean()
          .limit(limitForSource)
          .maxTimeMS(8000); // PERFORMANCE: Reduced timeout from 10s to 8s

        // Filter premium cars: check validityDays + approvedAt expiry
        // FIXED: Don't filter out premium cars unnecessarily - backend query already handles expiry
        const filtered = list.filter((doc) => {
          // For premium cars (featured_ads), double-check expiry only if validityDays exists
          if (source === 'featured_ads') {
            // Only filter if validityDays + approvedAt expiry exists AND is expired
            if (doc.validityDays && doc.approvedAt) {
              try {
                const approvedDate = new Date(doc.approvedAt);
                if (!isNaN(approvedDate.getTime())) {
                  const expiryDate = new Date(approvedDate);
                  expiryDate.setDate(expiryDate.getDate() + doc.validityDays);
                  if (expiryDate < now) {
                    return false; // Expired based on validityDays
                  }
                }
              } catch (e) {
                // If date parsing fails, keep the ad (don't filter out)
              }
            }
            // If no validityDays, keep the ad (backend query already filtered by featuredExpiryDate)
          }

          // For other ad types, return as-is
          return true;
        });

        return filtered.map(doc => {
          const enriched = { ...doc, adSource: source };

          // FIXED: Serialize _id to string
          if (enriched._id) {
            if (enriched._id.toString && typeof enriched._id.toString === 'function') {
              enriched._id = enriched._id.toString();
            } else if (typeof enriched._id === 'object' && enriched._id._id) {
              enriched._id = enriched._id._id.toString();
            } else if (typeof enriched._id === 'object' && Object.keys(enriched._id).length === 0) {
              // Skip empty object IDs
              return null;
            }
          }

          // FIXED: Serialize userId to string
          if (enriched.userId) {
            if (enriched.userId.toString && typeof enriched.userId.toString === 'function') {
              enriched.userId = enriched.userId.toString();
            } else if (typeof enriched.userId === 'object' && enriched.userId._id) {
              enriched.userId = enriched.userId._id.toString();
            } else if (typeof enriched.userId === 'object' && Object.keys(enriched.userId).length === 0) {
              enriched.userId = null; // Set to null if empty object
            }
          }

          // FIXED: Serialize addedBy to string (for listItForYou)
          if (enriched.addedBy) {
            if (enriched.addedBy.toString && typeof enriched.addedBy.toString === 'function') {
              enriched.addedBy = enriched.addedBy.toString();
            } else if (typeof enriched.addedBy === 'object' && enriched.addedBy._id) {
              enriched.addedBy = enriched.addedBy._id.toString();
            } else if (typeof enriched.addedBy === 'object' && Object.keys(enriched.addedBy).length === 0) {
              enriched.addedBy = null;
            }
          }

          // FIXED: Serialize date fields to ISO strings for proper frontend parsing
          if (enriched.dateAdded) {
            if (enriched.dateAdded instanceof Date) {
              enriched.dateAdded = enriched.dateAdded.toISOString();
            } else if (typeof enriched.dateAdded === 'object' && enriched.dateAdded.toString) {
              // Handle Mongoose Date objects
              try {
                enriched.dateAdded = new Date(enriched.dateAdded).toISOString();
              } catch (e) {
                // Keep as is if conversion fails
              }
            }
          }
          if (enriched.approvedAt) {
            if (enriched.approvedAt instanceof Date) {
              enriched.approvedAt = enriched.approvedAt.toISOString();
            } else if (typeof enriched.approvedAt === 'object' && enriched.approvedAt.toString) {
              // Handle Mongoose Date objects
              try {
                enriched.approvedAt = new Date(enriched.approvedAt).toISOString();
              } catch (e) {
                // Keep as is if conversion fails
              }
            }
          }
          if (enriched.createdAt) {
            if (enriched.createdAt instanceof Date) {
              enriched.createdAt = enriched.createdAt.toISOString();
            } else if (typeof enriched.createdAt === 'object' && enriched.createdAt.toString) {
              try {
                enriched.createdAt = new Date(enriched.createdAt).toISOString();
              } catch (e) {
                // Keep as is if conversion fails
              }
            }
          }

          // Set modelType based on source for frontend compatibility
          if (source === 'featured_ads') {
            enriched.modelType = 'Featured';
          } else if (source === 'free_ads') {
            enriched.modelType = doc.modelType || 'Free';
          } else if (source === 'list_it_for_you_ad') {
            enriched.modelType = 'ListItForYou';
          } else if (source === 'bike_ads') {
            enriched.modelType = 'bike';
          } else if (source === 'new_cars') {
            enriched.modelType = 'newCar';
          } else if (source === 'rent_car') {
            enriched.modelType = 'rentcar';
          }
          return enriched;
        }).filter(doc => doc !== null); // Remove null entries
      })
    );

    // PERFORMANCE: Reduced timeout from 20s to 12s for faster failure
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 12000);
    });

    let results = [];
    try {
      results = await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      // PERFORMANCE: Removed error logging for faster response
      results = []; // Return empty on error
    }

    clearTimeout(timeout);
    // FIXED: Final serialization pass to ensure all IDs are strings and dates are ISO strings
    const all = results.flat()
      .filter(ad => ad && ad._id) // Remove null/undefined entries
      .map(ad => {
        // Ensure _id is string
        if (ad._id && typeof ad._id === 'object') {
          if (ad._id.toString && typeof ad._id.toString === 'function') {
            ad._id = ad._id.toString();
          } else if (ad._id._id) {
            ad._id = ad._id._id.toString();
          }
        }
        // Ensure userId is string
        if (ad.userId && typeof ad.userId === 'object') {
          if (ad.userId.toString && typeof ad.userId.toString === 'function') {
            ad.userId = ad.userId.toString();
          } else if (ad.userId._id) {
            ad.userId = ad.userId._id.toString();
          } else if (Object.keys(ad.userId).length === 0) {
            ad.userId = null; // Empty object
          }
        }
        // Ensure addedBy is string (for listItForYou)
        if (ad.addedBy && typeof ad.addedBy === 'object') {
          if (ad.addedBy.toString && typeof ad.addedBy.toString === 'function') {
            ad.addedBy = ad.addedBy.toString();
          } else if (ad.addedBy._id) {
            ad.addedBy = ad.addedBy._id.toString();
          } else if (Object.keys(ad.addedBy).length === 0) {
            ad.addedBy = null;
          }
        }
        // FIXED: Ensure date fields are ISO strings for proper frontend parsing
        if (ad.dateAdded) {
          if (ad.dateAdded instanceof Date) {
            ad.dateAdded = ad.dateAdded.toISOString();
          } else if (typeof ad.dateAdded === 'object' && ad.dateAdded.toString) {
            try {
              ad.dateAdded = new Date(ad.dateAdded).toISOString();
            } catch (e) {
              // Keep as is if conversion fails
            }
          }
        }
        if (ad.approvedAt) {
          if (ad.approvedAt instanceof Date) {
            ad.approvedAt = ad.approvedAt.toISOString();
          } else if (typeof ad.approvedAt === 'object' && ad.approvedAt.toString) {
            try {
              ad.approvedAt = new Date(ad.approvedAt).toISOString();
            } catch (e) {
              // Keep as is if conversion fails
            }
          }
        }
        if (ad.createdAt) {
          if (ad.createdAt instanceof Date) {
            ad.createdAt = ad.createdAt.toISOString();
          } else if (typeof ad.createdAt === 'object' && ad.createdAt.toString) {
            try {
              ad.createdAt = new Date(ad.createdAt).toISOString();
            } catch (e) {
              // Keep as is if conversion fails
            }
          }
        }
        return ad;
      })
      .sort((a, b) => {
        // FIXED: Handle date comparison properly
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    const queryTime = Date.now() - startTime;

    // PERFORMANCE: Removed unnecessary filtering and logging for faster response
    // Only log if query took too long (>5 seconds)
    if (queryTime > 5000) {
      console.warn(`⚠️ /all_ads query took ${queryTime}ms (slow)`);
    }

    // FIXED: Count premium cars from results for logging
    const premiumCars = all.filter((ad) =>
      ad.modelType === 'Featured' || ad.adSource === 'featured_ads'
    );
    const managedCars = all.filter((ad) =>
      ad.modelType === 'ListItForYou' || ad.isManaged
    );
    const freeCars = all.filter((ad) =>
      ad.modelType === 'Free' && !ad.isManaged && ad.modelType !== 'ListItForYou'
    );
    const activePremium = premiumCars.filter((ad) => ad.isActive === true).length;
    const approvedPremium = premiumCars.filter((ad) =>
      ad.isFeatured === 'Approved' || ad.isFeatured === true || ad.paymentStatus === 'verified'
    ).length;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ /all_ads: Found ${all.length} total ads in ${queryTime}ms`);
      console.log(`📊 Breakdown: ${managedCars.length} Managed, ${premiumCars.length} Premium (${approvedPremium} approved), ${freeCars.length} Free`);
      if (premiumCars.length > 0) {
        console.log(`⭐ Premium cars details:`, premiumCars.map((ad) => ({
          id: ad._id,
          make: ad.make,
          model: ad.model,
          isFeatured: ad.isFeatured,
          isActive: ad.isActive,
          paymentStatus: ad.paymentStatus,
          modelType: ad.modelType,
          adSource: ad.adSource
        })));
      }
    }

    res.json(all);
  } catch (error) {
    clearTimeout(timeout);
    console.error('/all_ads error:', error.message || error);
    // Return empty array instead of error for better UX
    res.json([]);
  }
});

// Get all list it for you ads (requires Admin/SuperAdmin authentication)
app.get("/list_it_for_you_ad", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all list it for you ads
    const listItForYouAds = await ListItforyouad.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(listItForYouAds);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching list it for you ads:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching list it for you ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST list it for you ad (mobile app) - multer for images
const listItForYouStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'listitforyou');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    const field = file.fieldname || 'image';
    cb(null, `${field}-${unique}.${ext}`);
  }
});
const uploadListItForYou = multer({
  storage: listItForYouStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).fields([
  { name: 'invoiceImage', maxCount: 1 },
  { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }, { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 }, { name: 'image8', maxCount: 1 }
]);

app.post("/list_it_for_you_ad", uploadListItForYou, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);
    if (!make || !model || !year || !price) {
      return res.status(400).json({ success: false, message: "make, model, year, and price are required." });
    }
    const mongooseLib = require('mongoose');
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/listitforyou/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const doc = {
      addedBy: mongooseLib.Types.ObjectId.isValid(userId) ? new mongooseLib.Types.ObjectId(userId) : undefined,
      location: (b.location || '').trim() || 'N/A',
      make,
      model,
      variant: (b.variant || '').trim(),
      year: isNaN(year) ? new Date().getFullYear() : year,
      price: isNaN(price) ? 0 : price,
      kmDriven: parseInt(b.kmDriven, 10) || 0,
      engineCapacity: (b.engineCapacity || '').trim(),
      description: (b.description || '').trim(),
      adStatus: 'pending',
      isActive: false,
      isManaged: true,
      isDeleted: false,
      image1: getPath(files.image1),
      image2: getPath(files.image2),
      image3: getPath(files.image3),
      image4: getPath(files.image4),
      image5: getPath(files.image5),
      image6: getPath(files.image6),
      image7: getPath(files.image7),
      image8: getPath(files.image8),
      invoiceImage: getPath(files.invoiceImage)
    };
    const ad = new ListItforyouad(doc);
    await ad.save();
    res.status(201).json({
      success: true,
      message: "Ad submitted successfully. It will be reviewed by admin.",
      data: { id: ad._id.toString() }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST list_it_for_you_ad error:', error);
    res.status(500).json({
      success: false,
      message: "Error creating ad. Please try again.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== NEW CARS ENDPOINT ====================
// Public: Get new cars for mobile app (no auth)
app.get("/new_cars/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, returning empty cars');
    return res.json([]);
  }

  if (!NewCarData) {
    return res.json([]);
  }

  const startTime = Date.now();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('⚠️ /new_cars/public query timeout after 20s');
      return res.json([]); // Return empty array on timeout
    }
  }, 20000);

  try {

    // Use Promise.race for timeout protection
    const queryPromise = NewCarData.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean()
      .limit(500) // Limit to 500 records
      .maxTimeMS(15000) // MongoDB timeout: 15 seconds
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000);
    });

    let newCars = [];
    try {
      newCars = await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      console.error('⚠️ /new_cars/public query failed:', err.message);
      newCars = []; // Return empty on error
    }

    clearTimeout(timeout);
    const queryTime = Date.now() - startTime;
    console.log(`✅ /new_cars/public: Found ${newCars.length} cars in ${queryTime}ms`);
    res.json(newCars || []);
  } catch (error) {
    clearTimeout(timeout);
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching new cars (public):', error);
    res.json([]); // Return empty array instead of error
  }
});
// Get all new cars (requires Admin/SuperAdmin authentication)
app.get("/new_cars", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all new cars
    const newCars = await NewCarData.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(newCars);

  } catch (error) {
    console.error('❌ Error fetching new cars:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching new cars",
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Create new car - Admin only
app.post("/new_cars", authenticateToken, async (req, res) => {
  try {
    console.log('📝 POST /new_cars called by admin');
    console.log('📦 Request body:', JSON.stringify(req.body).substring(0, 200));

    // Check if user is Admin or SuperAdmin
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      console.log('❌ Access denied - userType:', userType);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Create new car with provided data
    const newCarData = new NewCarData({
      ...req.body,
      userId: req.userId,
      dateAdded: new Date(),
      status: req.body.status || 'draft',
      adStatus: req.body.adStatus || 'pending'
    });

    await newCarData.save();
    console.log('✅ New car created successfully:', newCarData._id);

    res.json({
      success: true,
      message: "New car created successfully",
      data: newCarData
    });

  } catch (error) {
    console.error('❌ Error creating new car:', error);
    res.status(500).json({
      success: false,
      message: "Error creating car",
      error: error.message
    });
  }
});

// Update new car status (publish draft, activate, etc.) - Admin only
app.patch("/new_cars/:id/status", authenticateToken, async (req, res) => {
  try {
    console.log('🔄 PATCH /new_cars/:id/status called');
    console.log('📝 Car ID:', req.params.id);
    console.log('📦 Status update:', req.body);

    // Check if user is Admin or SuperAdmin
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      console.log('❌ Access denied - userType:', userType);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;
    const { status, adStatus, adminNotes } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Car ID required" });
    }

    // Prepare update data
    const updateData = {};
    if (status) updateData.status = status;
    if (adStatus) updateData.adStatus = adStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Set timestamps based on status
    if (adStatus === 'approved') {
      updateData.approvedAt = new Date();
    } else if (adStatus === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    const updatedCar = await NewCarData.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedCar) {
      console.log('❌ Car not found with ID:', id);
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    console.log('✅ Car status updated successfully:', id, '→', updateData);
    res.json({ success: true, data: updatedCar });

  } catch (error) {
    console.error('❌ Error updating new car status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating car status",
      error: error.message
    });
  }
});

// Update new car details (edit) - Admin only
app.patch("/new_cars/:id", authenticateToken, async (req, res) => {
  try {
    console.log('✏️ PATCH /new_cars/:id called (edit)');
    console.log('📝 Car ID:', req.params.id);
    console.log('📦 Update data:', JSON.stringify(req.body).substring(0, 200));

    // Check if user is Admin or SuperAdmin
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      console.log('❌ Access denied - userType:', userType);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Car ID required" });
    }

    // Remove _id and __v from update data to avoid conflicts
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const updatedCar = await NewCarData.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCar) {
      console.log('❌ Car not found with ID:', id);
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    console.log('✅ Car edited successfully:', id);
    res.json({ success: true, data: updatedCar });

  } catch (error) {
    console.error('❌ Error updating new car:', error);
    res.status(500).json({
      success: false,
      message: "Error updating car",
      error: error.message
    });
  }
});

// Delete new car - Admin only
app.delete("/new_cars/:id", authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ DELETE /new_cars/:id called');
    console.log('📝 Car ID:', req.params.id);

    // Check if user is Admin or SuperAdmin
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      console.log('❌ Access denied - userType:', userType);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Car ID required" });
    }

    // Soft delete
    const deletedCar = await NewCarData.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).lean();

    if (!deletedCar) {
      console.log('❌ Car not found with ID:', id);
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    console.log('✅ Car deleted successfully:', id);
    res.json({ success: true, message: "Car deleted successfully" });

  } catch (error) {
    console.error('❌ Error deleting new car:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting car",
      error: error.message
    });
  }
});

// ==================== BIKE ADS ENDPOINT ====================
// Multer for bike ad images (include invoiceImage for payment receipt)
const bikeAdsImageFields = [];
for (let i = 1; i <= 20; i++) bikeAdsImageFields.push({ name: `image${i}`, maxCount: 1 });
bikeAdsImageFields.push({ name: 'invoiceImage', maxCount: 1 });
const bikeAdsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'bike_ads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `bike-${unique}.${ext}`);
  }
});
const uploadBikeAdsImages = multer({
  storage: bikeAdsStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).fields(bikeAdsImageFields);

app.post("/bike_ads", uploadBikeAdsImages, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const title = (b.title || '').trim();
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const location = (b.location || '').trim();
    const adCity = (b.adCity || location || 'N/A').trim();
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);
    if (!make || !model || !location) return res.status(400).json({ success: false, message: "make, model, and location are required." });
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/bike_ads/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const featuresStr = b.features || '';
    const features = typeof featuresStr === 'string' ? featuresStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const registrationCityVal = (b.registrationCity || '').trim() || adCity || 'N/A';
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      title: title || `${make} ${model}`,
      make,
      model,
      variant: (b.variant || '').trim(),
      adCity,
      location: location || 'N/A',
      registrationCity: registrationCityVal,
      year: isNaN(year) ? new Date().getFullYear() : year,
      price: isNaN(price) ? 0 : price,
      bodyColor: (b.bodyColor || '').trim(),
      kmDriven: parseInt(b.kmDriven, 10) || 0,
      fuelType: (b.fuelType || '').trim(),
      engineCapacity: (b.engineCapacity || '').trim(),
      enginetype: (b.enginetype || '').trim(),
      description: (b.description || '').trim(),
      preferredContact: (b.preferredContact || '').trim(),
      features,
      isActive: true,
      isDeleted: false,
      isSold: false,
      image1: getPath(files.image1), image2: getPath(files.image2), image3: getPath(files.image3),
      image4: getPath(files.image4), image5: getPath(files.image5), image6: getPath(files.image6),
      invoiceImage: getPath(files.invoiceImage)
    };
    const ad = new Bike_Ads(doc);
    await ad.save();
    res.status(201).json({ success: true, message: "Ad posted successfully.", data: { id: ad._id.toString() } });
  } catch (error) {
    console.error('POST bike_ads error:', error.message || error);
    const errMsg = error.message || String(error);
    res.status(500).json({ success: false, message: "Error creating ad. Please try again.", error: errMsg });
  }
});

// Public: Get premium bike ads for mobile (no auth) - only Approved or free bikes (no Pending/Rejected)
app.get("/premium-bike-ads", async (req, res) => {
  try {
    if (!Bike_Ads) return res.json([]);
    const ads = await Bike_Ads.find({
      isDeleted: { $ne: true },
      isFeatured: { $nin: ['Pending', 'Rejected'] } // only show Approved or no isFeatured (free)
    })
      .sort({ dateAdded: -1 })
      .lean();
    res.json(ads || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching premium bike ads:', error);
    res.status(500).json({ success: false, message: "Error fetching premium bike ads", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});
// Public: Get all bike ads for mobile app (no auth)
app.get("/bike_ads/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, returning empty ads');
    return res.json([]);
  }

  if (!Bike_Ads) {
    return res.json([]);
  }

  const startTime = Date.now();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('⚠️ /bike_ads/public query timeout after 20s');
      return res.json([]); // Return empty array on timeout
    }
  }, 20000);

  try {

    // Only show Approved premium bikes or free bikes (no Pending/Rejected in Used Bikes list)
    const queryPromise = Bike_Ads.find({
      isDeleted: { $ne: true },
      isFeatured: { $nin: ['Pending', 'Rejected'] }
    })
      .sort({ dateAdded: -1 })
      .lean()
      .limit(500) // Limit to 500 records
      .maxTimeMS(15000) // MongoDB timeout: 15 seconds
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000);
    });

    let bikeAds = [];
    try {
      bikeAds = await Promise.race([queryPromise, timeoutPromise]);
    } catch (err) {
      console.error('⚠️ /bike_ads/public query failed:', err.message);
      bikeAds = []; // Return empty on error
    }

    // Serialize dateAdded to ISO so app shows "X days ago" (same as used cars)
    const toISO = (v) => { if (!v) return null; try { return (v instanceof Date) ? v.toISOString() : new Date(v).toISOString(); } catch (e) { return null; } };
    const withDates = (bikeAds || []).map((ad) => {
      ad = { ...ad };
      ad.dateAdded = toISO(ad.dateAdded) || toISO(ad.approvedAt) || ad.dateAdded || new Date().toISOString();
      if (ad.approvedAt) ad.approvedAt = toISO(ad.approvedAt);
      return ad;
    });
    clearTimeout(timeout);
    const queryTime = Date.now() - startTime;
    console.log(`✅ /bike_ads/public: Found ${withDates.length} ads in ${queryTime}ms`);
    res.json(withDates);
  } catch (error) {
    clearTimeout(timeout);
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching bike ads (public):', error);
    res.json([]); // Return empty array instead of error
  }
});
// Get all bike ads (requires Admin/SuperAdmin authentication)
app.get("/bike_ads", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!Bike_Ads) {
      console.error('❌ Bike_Ads model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch all bike ads
    const bikeAds = await Bike_Ads.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(bikeAds || []);

  } catch (error) {
    console.error('❌ Error fetching bike ads:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching bike ads",
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// ==================== RENT CAR ENDPOINT ====================
// Multer for rent car images + paymentReceipt
const rentCarImageFields = [{ name: 'paymentReceipt', maxCount: 1 }];
for (let i = 1; i <= 20; i++) rentCarImageFields.push({ name: `image${i}`, maxCount: 1 });
const rentCarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'rent_car');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `${file.fieldname || 'img'}-${unique}.${ext}`);
  }
});
const uploadRentCarImages = multer({ storage: rentCarStorage, fileFilter: multerImageFilter, limits: multerLimits }).fields(rentCarImageFields);

app.post("/rent_car", uploadRentCarImages, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const title = (b.title || '').trim();
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const location = (b.location || '').trim();
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);
    if (!title || !make || !model || !location) return res.status(400).json({ success: false, message: "title, make, model, and location are required." });
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/rent_car/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const featuresStr = b.features || '';
    const features = typeof featuresStr === 'string' ? featuresStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    let availabilityDates = [];
    try {
      if (b.availabilityDates) availabilityDates = JSON.parse(b.availabilityDates);
    } catch (_) { }
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      title: title || `${make} ${model}`,
      make,
      model,
      variant: (b.variant || '').trim(),
      bodyType: (b.bodyType || '').trim(),
      category: (b.category || '').trim(),
      location: location || 'N/A',
      year: isNaN(year) ? new Date().getFullYear() : year,
      price: isNaN(price) ? 0 : price,
      bodyColor: (b.bodyColor || '').trim(),
      kmDriven: parseInt(b.kmDriven, 10) || 0,
      fuelType: (b.fuelType || '').trim(),
      engineCapacity: (b.engineCapacity || '').trim(),
      description: (b.description || '').trim(),
      transmission: (b.transmission || '').trim(),
      assembly: (b.assembly || '').trim(),
      preferredContact: (b.preferredContact || '').trim(),
      paymenttype: (b.paymenttype || '').trim(),
      documents: (b.documents || '').trim(),
      drivingtype: (b.drivingtype || '').trim(),
      availabilityType: (b.availabilityType || '').trim(),
      availabilityDates,
      features,
      isActive: true,
      isDeleted: false,
      isSold: false,
      paymentReceipt: getPath(files.paymentReceipt),
      image1: getPath(files.image1), image2: getPath(files.image2), image3: getPath(files.image3),
      image4: getPath(files.image4), image5: getPath(files.image5), image6: getPath(files.image6)
    };
    const ad = new Rent_Car(doc);
    await ad.save();
    res.status(201).json({ success: true, message: "Ad posted successfully.", data: { id: ad._id.toString() } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST rent_car error:', error);
    res.status(500).json({ success: false, message: "Error creating ad. Please try again.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Public: Get rent car ads for mobile app (no auth)
app.get("/rent_car/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    const rentCars = await Rent_Car.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean();
    // Serialize dateAdded to ISO so app shows "X days ago" (same as used cars)
    const toISO = (v) => { if (!v) return null; try { return (v instanceof Date) ? v.toISOString() : new Date(v).toISOString(); } catch (e) { return null; } };
    const toUserId = (v) => {
      if (!v) return null;
      if (typeof v === 'string') return v;
      if (v.toString && typeof v.toString === 'function') return v.toString();
      if (v._id) return String(v._id);
      if (v.$oid) return String(v.$oid);
      if (v.id) return String(v.id);
      return null;
    };
    const withDates = (rentCars || []).map((ad) => {
      const adCopy = { ...ad };
      adCopy.dateAdded = toISO(ad.dateAdded) || toISO(ad.approvedAt) || adCopy.dateAdded || new Date().toISOString();
      if (ad.approvedAt) adCopy.approvedAt = toISO(ad.approvedAt);
      if (ad.userId) adCopy.userId = toUserId(ad.userId);
      return adCopy;
    });
    res.json(withDates);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching rent car ads (public):', error);
    res.status(500).json({ success: false, message: "Error fetching rent car ads", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});
// Get all rent car ads (requires Admin/SuperAdmin authentication)
app.get("/rent_car", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all rent car ads
    const rentCars = await Rent_Car.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(rentCars);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching rent car ads:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching rent car ads",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== AUTOPARTS ENDPOINT ====================
// Multer for autoparts images
const autoPartsImageFields = [];
for (let i = 1; i <= 8; i++) autoPartsImageFields.push({ name: `image${i}`, maxCount: 1 });
const autoPartsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'autoparts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `part-${unique}.${ext}`);
  }
});
const uploadAutoPartsImages = multer({
  storage: autoPartsStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).fields(autoPartsImageFields);

app.post("/autoparts", uploadAutoPartsImages, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const title = (b.title || '').trim();
    const location = (b.location || '').trim();
    const partType = (b.partType || b.fuelType || '').trim();
    const price = parseFloat(b.price);
    if (!title || !location || !partType) return res.status(400).json({ success: false, message: "title, location, and partType are required." });
    const getPath = (f) => (f && f[0] && f[0].path) ? '/uploads/autoparts/' + path.basename(f[0].path) : undefined;
    const files = req.files || {};
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      title: title || 'Auto Part',
      location: location || 'N/A',
      partType: partType || 'Other',
      description: (b.description || '').trim(),
      price: isNaN(price) ? 0 : price,
      isActive: true,
      isDeleted: false,
      isSold: false,
      image1: getPath(files.image1), image2: getPath(files.image2), image3: getPath(files.image3),
      image4: getPath(files.image4), image5: getPath(files.image5), image6: getPath(files.image6)
    };
    const ad = new AutoStore(doc);
    await ad.save();
    res.status(201).json({ success: true, message: "Ad posted successfully.", data: { id: ad._id.toString() } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST autoparts error:', error);
    res.status(500).json({ success: false, message: "Error creating ad. Please try again.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Public: Get all auto parts for mobile app (no auth) - must be before /autoparts/:id
app.get("/autoparts/public", securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!AutoStore) return res.json([]);
    const parts = await AutoStore.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean();

    // Ensure _id is converted to string for all parts
    const normalizedParts = (parts || []).map((part) => {
      if (part._id) {
        // Convert ObjectId to string if it's an object
        if (typeof part._id === 'object') {
          try {
            // Try toString() first (works for MongoDB ObjectId)
            if (part._id.toString && typeof part._id.toString === 'function') {
              const idStr = part._id.toString();
              if (idStr && idStr !== '[object Object]' && idStr.length > 10) {
                part._id = idStr;
              } else if (part._id._id) {
                part._id = String(part._id._id);
              } else if (part._id.$oid) {
                part._id = String(part._id.$oid);
              }
            } else if (part._id._id) {
              part._id = String(part._id._id);
            } else if (part._id.$oid) {
              part._id = String(part._id.$oid);
            }
          } catch (e) {
            // If conversion fails, keep original
          }
        }
        // Ensure id field exists
        if (!part.id) {
          part.id = part._id;
        }
      }
      return part;
    });

    res.json(normalizedParts || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching auto parts (public):', error);
    res.status(500).json({ success: false, message: "Error fetching auto parts", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});
// Public: Get single auto part by ID for mobile (no auth)
app.get("/autoparts/:id", async (req, res) => {
  try {
    if (!AutoStore) return res.status(404).json({ success: false, message: "Auto parts not available" });
    const part = await AutoStore.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
    if (!part) return res.status(404).json({ success: false, message: "Part not found" });
    res.json(part);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching auto part:', error);
    res.status(500).json({ success: false, message: "Error fetching part", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});
// Get all auto parts (requires Admin/SuperAdmin authentication)
app.get("/autoparts", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!AutoStore) {
      console.error('❌ AutoStore model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch all auto parts
    const autoParts = await AutoStore.find({
      isDeleted: { $ne: true }
    })
      .sort({ dateAdded: -1 })
      .lean();

    res.json(autoParts || []);

  } catch (error) {
    console.error('❌ Error fetching auto parts:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching auto parts",
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// ==================== INSPECTION ROUTES ====================
// Mount inspection routes from routes/inspection.js
const inspectionRoutes = require('./routes/inspection');
app.use('/api/inspection', inspectionRoutes);

// ==================== INSPECTION POST ENDPOINT (LEGACY - FormData) ====================
// Multer for inspection payment receipts
const inspectionReceiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'inspection');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `receipt-${unique}.${ext}`);
  }
});
const uploadInspectionReceipts = multer({
  storage: inspectionReceiptStorage,
  fileFilter: multerImageFilter,
  limits: { ...multerLimits, files: 10 } // Allow up to 10 receipt images
}).array('payment_receipt', 10);

// POST /inspection - Create inspection request with FormData (legacy endpoint)
app.post("/inspection", uploadInspectionReceipts, multerErrorHandler, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId." });
    }

    // Extract form data
    const location = (b.location || '').trim();
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const variant = (b.variant || '').trim();
    const year = parseInt(b.year, 10);
    const description = (b.description || '').trim();
    const kmDriven = parseInt(b.kmDriven, 10);
    const engineCapacity = (b.engineCapacity || '').trim();
    const inspection_date = b.inspection_date || '';
    const inspection_time = (b.inspection_time || '').trim();
    const adId = b.adId || null;

    // Validate required fields
    if (!location || !make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: "location, make, model, and year are required."
      });
    }

    // Process payment receipt images
    const paymentReceiptImages = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach(file => {
        if (file && file.path) {
          paymentReceiptImages.push('/uploads/inspection/' + path.basename(file.path));
        }
      });
    }

    // Create inspection document
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      location,
      make,
      model,
      variant: variant || undefined,
      year: isNaN(year) ? new Date().getFullYear() : year,
      description: description || undefined,
      kmDriven: isNaN(kmDriven) ? undefined : kmDriven,
      engineCapacity: engineCapacity || undefined,
      inspection_date: inspection_date || undefined,
      inspection_time: inspection_time || undefined,
      paymentReceiptImages: paymentReceiptImages.length > 0 ? paymentReceiptImages : undefined,
      paymentStatus: paymentReceiptImages.length > 0 ? "Paid" : "Pending",
      status: "Pending",
      isDeleted: false
    };

    // Add adId if provided
    if (adId && mongoose.Types.ObjectId.isValid(adId)) {
      doc.adId = new mongoose.Types.ObjectId(adId);
    }

    const inspection = new Inspection(doc);
    await inspection.save();

    return res.status(201).json({
      success: true,
      message: "Inspection request submitted successfully.",
      data: { id: inspection._id.toString() }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Create inspection error:', error);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to submit inspection request.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN INSPECTION ROUTES ====================
// Admin: List inspection requests
app.get("/api/admin/inspection/requests", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin access required." });
    }

    const { status = 'pending' } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await InspectionJob.find(query)
      .populate('sellerId', 'name email phone')
      .populate('requestedByUserId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, requests });
  } catch (e) {
    console.error('List inspection requests error:', e);
    return res.status(500).json({ success: false, message: 'Failed to list inspection requests' });
  }
});

// Admin: Assign inspector to inspection
app.post("/api/admin/inspection/assign", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin access required." });
    }

    const { requestId, inspectorId, scheduledAt } = req.body;
    if (!requestId || !inspectorId || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'requestId, inspectorId, and scheduledAt are required' });
    }

    const job = await InspectionJob.findById(requestId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Inspection request not found' });
    }

    job.inspectorId = inspectorId;
    job.assignedByAdminId = req.userId;
    job.assignedAt = new Date();
    job.status = 'assigned';
    job.requestedAt = scheduledAt ? new Date(scheduledAt) : new Date();

    await job.save();

    return res.json({ success: true, inspectionId: job._id.toString() });
  } catch (e) {
    console.error('Assign inspection error:', e);
    return res.status(500).json({ success: false, message: 'Failed to assign inspection' });
  }
});

// Admin: Approve inspection
app.post("/api/admin/inspection/:inspectionId/approve", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin access required." });
    }

    const { inspectionId } = req.params;
    const job = await InspectionJob.findById(inspectionId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    job.status = 'Approved';
    await job.save();

    // Return the full inspection report
    const report = await InspectionJob.findById(inspectionId)
      .populate('inspectorId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .lean();

    return res.json({ success: true, ...report });
  } catch (e) {
    console.error('Approve inspection error:', e);
    return res.status(500).json({ success: false, message: 'Failed to approve inspection' });
  }
});

// Public: Verify inspection by verification code
app.get("/api/inspection/verify/:verificationCode", async (req, res) => {
  try {
    const { verificationCode } = req.params;

    // Search for inspection by verification_code field or by _id
    const mongoose = require('mongoose');
    let job;

    // Try to find by verification_code field first
    job = await InspectionJob.findOne({
      verification_code: verificationCode,
      status: { $in: ['Approved', 'approved'] }
    })
      .populate('inspectorId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .lean();

    // If not found by verification_code, try by _id
    if (!job && mongoose.Types.ObjectId.isValid(verificationCode)) {
      job = await InspectionJob.findOne({
        _id: verificationCode,
        status: { $in: ['Approved', 'approved'] }
      })
        .populate('inspectorId', 'name email phone')
        .populate('sellerId', 'name email phone')
        .lean();
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Inspection not found or not approved' });
    }

    return res.json({ success: true, ...job });
  } catch (e) {
    console.error('Verify inspection error:', e);
    return res.status(500).json({ success: false, message: 'Failed to verify inspection' });
  }
});

// ==================== INSPECTION ENDPOINT (LEGACY) ====================
// Get all inspections (requires Admin/SuperAdmin authentication)
app.get("/inspection", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all inspections
    const inspections = await Inspection.find({
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(inspections);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching inspections:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching inspections",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN INSPECTIONS BY STATUS ENDPOINT ====================
// Get inspections by status (pending, approved, rejected, etc.)
app.get("/admin/inspections/:status", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { status } = req.params;
    const { search } = req.query;

    // Build query
    const query = {
      isDeleted: { $ne: true }
    };

    // Filter by status (case-insensitive)
    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { carMake: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { inspectionDate: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch inspections
    const inspections = await Inspection.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Get counts for all statuses
    const counts = {
      pending: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^pending$/i } }),
      approved: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^approved$/i } }),
      rejected: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^rejected$/i } }),
      completed: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^completed$/i } }),
      all: await Inspection.countDocuments({ isDeleted: { $ne: true } })
    };

    res.json({
      success: true,
      inspections: inspections,
      counts: counts
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching inspections by status:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching inspections",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN INSPECTIONS STATS ENDPOINT ====================
// Get inspection statistics
app.get("/admin/inspections/stats", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Get counts for all statuses
    const counts = {
      pending: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^pending$/i } }),
      approved: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^approved$/i } }),
      rejected: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^rejected$/i } }),
      completed: await Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $regex: /^completed$/i } }),
      all: await Inspection.countDocuments({ isDeleted: { $ne: true } })
    };

    res.json({
      success: true,
      ...counts
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching inspection stats:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching inspection statistics",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== UPDATE INSPECTION STATUS (ASSIGN INSPECTOR / SCHEDULE) ====================
// Admin assigns inspector and schedules - used by Admin > Inspection Requests > Schedule
app.put("/inspections/:id/status", authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    const { id } = req.params;
    const { status, inspectorId, assigned_inspection_date, assigned_inspection_time } = req.body || {};
    const update = { status: status || undefined };
    if (inspectorId !== undefined) update.inspectorId = inspectorId;
    if (assigned_inspection_date !== undefined) update.assigned_inspection_date = assigned_inspection_date;
    if (assigned_inspection_time !== undefined) update.assigned_inspection_time = assigned_inspection_time;
    const doc = await Inspection.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Inspection not found" });
    res.json({ success: true, inspection: doc });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Update inspection status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN CONTACT ENDPOINT (SECURED) ====================
app.get("/admin-contact", contactRateLimiter, authenticateToken, async (req, res) => {
  try {
    const { adId } = req.query;

    // Find admin user
    const admin = await User.findOne({ userType: 'Admin' }).select('phone name');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Admin contact fetched:', admin.phone);
    }

    res.json({
      success: true,
      phone: admin.phone,
      name: admin.name || 'Admin'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching admin contact:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching admin contact'
    });
  }
});

// ==================== DASHBOARD STATS ENDPOINT ====================
// Get dashboard statistics for SuperAdmin/Admin
app.get("/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    // Debug: Log userType to see what we're getting
    console.log("🔐 ========== /dashboard/stats REQUEST ==========");
    console.log("🔐 req.userType:", req.userType);
    console.log("🔐 req.userType type:", typeof req.userType);
    console.log("🔐 req.userId:", req.userId);
    console.log("🔐 ==============================================");

    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase().trim();
    const isAuthorized = userType === 'admin' || userType === 'superadmin';

    console.log("🔐 Normalized userType:", userType);
    console.log("🔐 Is Authorized?", isAuthorized);

    if (!isAuthorized) {
      console.error("❌ Access denied - UserType:", req.userType, "| Normalized:", userType, "| Expected: admin or superadmin");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required.",
        debug: {
          receivedUserType: req.userType,
          normalizedUserType: userType,
          expectedUserTypes: ['Admin', 'SuperAdmin'],
          userId: req.userId
        }
      });
    }

    console.log("✅ Access granted - Admin/SuperAdmin verified");

    // Calculate date ranges for growth comparison (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Helper function to calculate growth percentage
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Helper function to format growth text
    const formatGrowth = (growth) => {
      if (growth > 0) return `+${growth}%`;
      if (growth < 0) return `${growth}%`;
      return '0%';
    };

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalUsersPrevious,
      admins,
      inspectors,
      freeAds,
      freeAdsPrevious,
      featuredAdsPending,
      featuredAdsPendingPrevious,
      featuredAdsApproved,
      featuredAdsApprovedPrevious,
      listItForYouPending,
      listItForYouPendingPrevious,
      listItForYouApproved,
      listItForYouApprovedPrevious,
      buyCarForMePending,
      buyCarForMePendingPrevious,
      buyCarForMeApproved,
      buyCarForMeApprovedPrevious,
      inspectionsPending,
      inspectionsPendingPrevious,
      inspectionsApproved,
      inspectionsApprovedPrevious,
      rentalAds,
      rentalAdsPrevious
    ] = await Promise.all([
      // Users
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true }, dateAdded: { $lt: thirtyDaysAgo } }),

      // Staff
      User.countDocuments({ userType: { $in: ['Admin', 'SuperAdmin'] }, isDeleted: { $ne: true } }),
      Inspector.countDocuments({ isDeleted: { $ne: true }, isActive: true }),

      // Free Ads
      Free_Ads.countDocuments({ isDeleted: { $ne: true } }),
      Free_Ads.countDocuments({ isDeleted: { $ne: true }, dateAdded: { $lt: thirtyDaysAgo } }),

      // Featured Ads - Pending
      Featured_Ads.countDocuments({ isDeleted: { $ne: true }, isFeatured: 'Pending' }),
      Featured_Ads.countDocuments({ isDeleted: { $ne: true }, isFeatured: 'Pending', dateAdded: { $lt: thirtyDaysAgo } }),

      // Featured Ads - Approved
      Featured_Ads.countDocuments({ isDeleted: { $ne: true }, isFeatured: 'Approved' }),
      Featured_Ads.countDocuments({ isDeleted: { $ne: true }, isFeatured: 'Approved', dateAdded: { $lt: thirtyDaysAgo } }),

      // List It For You - Pending (uses adStatus field, lowercase)
      ListItforyouad.countDocuments({ isDeleted: { $ne: true }, adStatus: 'pending' }),
      ListItforyouad.countDocuments({ isDeleted: { $ne: true }, adStatus: 'pending', dateAdded: { $lt: thirtyDaysAgo } }),

      // List It For You - Approved (uses adStatus field, lowercase)
      ListItforyouad.countDocuments({ isDeleted: { $ne: true }, adStatus: 'approved' }),
      ListItforyouad.countDocuments({ isDeleted: { $ne: true }, adStatus: 'approved', dateAdded: { $lt: thirtyDaysAgo } }),

      // Buy Car For Me - Pending (check if status field exists, otherwise use isActive: false)
      BuyCar.countDocuments({ isDeleted: { $ne: true }, isActive: false }),
      BuyCar.countDocuments({ isDeleted: { $ne: true }, isActive: false, dateAdded: { $lt: thirtyDaysAgo } }),

      // Buy Car For Me - Approved (check if status field exists, otherwise use isActive: true)
      BuyCar.countDocuments({ isDeleted: { $ne: true }, isActive: true }),
      BuyCar.countDocuments({ isDeleted: { $ne: true }, isActive: true, dateAdded: { $lt: thirtyDaysAgo } }),

      // Inspections - Pending (uses status field)
      Inspection.countDocuments({ isDeleted: { $ne: true }, status: 'Pending' }),
      Inspection.countDocuments({ isDeleted: { $ne: true }, status: 'Pending', dateAdded: { $lt: thirtyDaysAgo } }),

      // Inspections - Approved/Completed (uses status field)
      Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $in: ['Completed', 'Scheduled'] } }),
      Inspection.countDocuments({ isDeleted: { $ne: true }, status: { $in: ['Completed', 'Scheduled'] }, dateAdded: { $lt: thirtyDaysAgo } }),

      // Rental Ads
      Rent_Car.countDocuments({ isDeleted: { $ne: true } }),
      Rent_Car.countDocuments({ isDeleted: { $ne: true }, dateAdded: { $lt: thirtyDaysAgo } })
    ]);

    // Calculate growth percentages
    const usersGrowth = calculateGrowth(totalUsers, totalUsersPrevious);
    const freeAdsGrowth = calculateGrowth(freeAds, freeAdsPrevious);
    const featuredPendingGrowth = calculateGrowth(featuredAdsPending, featuredAdsPendingPrevious);
    const featuredApprovedGrowth = calculateGrowth(featuredAdsApproved, featuredAdsApprovedPrevious);
    const listItPendingGrowth = calculateGrowth(listItForYouPending, listItForYouPendingPrevious);
    const listItApprovedGrowth = calculateGrowth(listItForYouApproved, listItForYouApprovedPrevious);
    const buyCarPendingGrowth = calculateGrowth(buyCarForMePending, buyCarForMePendingPrevious);
    const buyCarApprovedGrowth = calculateGrowth(buyCarForMeApproved, buyCarForMeApprovedPrevious);
    const inspectionPendingGrowth = calculateGrowth(inspectionsPending, inspectionsPendingPrevious);
    const inspectionApprovedGrowth = calculateGrowth(inspectionsApproved, inspectionsApprovedPrevious);
    const rentalAdsGrowth = calculateGrowth(rentalAds, rentalAdsPrevious);

    // Build response
    const stats = {
      platform: {
        totalUsers: {
          count: totalUsers,
          growth: usersGrowth,
          growthText: formatGrowth(usersGrowth)
        },
        premiumAdsPending: {
          count: featuredAdsPending,
          growth: featuredPendingGrowth,
          growthText: formatGrowth(featuredPendingGrowth)
        },
        premiumAdsApproved: {
          count: featuredAdsApproved,
          growth: featuredApprovedGrowth,
          growthText: formatGrowth(featuredApprovedGrowth)
        },
        listItForYouPending: {
          count: listItForYouPending,
          growth: listItPendingGrowth,
          growthText: formatGrowth(listItPendingGrowth)
        },
        listItForYouApproved: {
          count: listItForYouApproved,
          growth: listItApprovedGrowth,
          growthText: formatGrowth(listItApprovedGrowth)
        },
        buyCarForMePending: {
          count: buyCarForMePending,
          growth: buyCarPendingGrowth,
          growthText: formatGrowth(buyCarPendingGrowth)
        },
        buyCarForMeApproved: {
          count: buyCarForMeApproved,
          growth: buyCarApprovedGrowth,
          growthText: formatGrowth(buyCarApprovedGrowth)
        },
        regularFreeAds: {
          count: freeAds,
          growth: freeAdsGrowth,
          growthText: formatGrowth(freeAdsGrowth)
        },
        carInspectionPending: {
          count: inspectionsPending,
          growth: inspectionPendingGrowth,
          growthText: formatGrowth(inspectionPendingGrowth)
        },
        carInspectionApproved: {
          count: inspectionsApproved,
          growth: inspectionApprovedGrowth,
          growthText: formatGrowth(inspectionApprovedGrowth)
        },
        carRentalAds: {
          count: rentalAds,
          growth: rentalAdsGrowth,
          growthText: formatGrowth(rentalAdsGrowth)
        }
      },
      staff: {
        admins: admins,
        inspectors: inspectors,
        supportStaff: 0 // Placeholder - add if you have support staff model
      },
      financial: {
        totalRevenue: 0, // Placeholder - implement based on your payment/transaction model
        totalExpenses: 0, // Placeholder
        netProfit: 0, // Placeholder
        subscriptionRevenue: 0, // Placeholder
        premiumAdRevenue: 0, // Placeholder
        transactionFees: 0, // Placeholder
        marketingExpenses: 0, // Placeholder
        operationalCosts: 0 // Placeholder
      },
      platformHealth: {
        uptime: process.uptime(), // Server uptime in seconds
        responseTime: 0, // Placeholder - implement response time tracking
        errorRate: 0 // Placeholder - implement error rate tracking
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Dashboard stats error:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== INSPECTOR ROUTES ====================
// Get inspections for a specific inspector
// Uses Inspection model (same as Admin panel Inspection Requests) - inspectorId refs Inspector collection
app.get("/inspector/inspections/:inspectorId", async (req, res) => {
  const startTime = Date.now();
  try {
    const { inspectorId } = req.params;

    console.log('🔍 Fetching inspections for inspector:', inspectorId);

    // Build query - match inspectorId (ObjectId) OR InspectorId (string) - Inspection model stores both
    const mongoose = require('mongoose');
    const is_valid_oid = mongoose.Types.ObjectId.isValid(inspectorId) &&
      (new mongoose.Types.ObjectId(inspectorId)).toString() === inspectorId;

    const query = { isDeleted: { $ne: true } };
    if (is_valid_oid) {
      query.$or = [
        { inspectorId: new mongoose.Types.ObjectId(inspectorId) },
        { InspectorId: inspectorId }
      ];
    } else {
      query.InspectorId = inspectorId;
    }

    console.log('🔍 Query:', JSON.stringify(query));

    // Find inspections assigned to this inspector from Inspection model (admin assigns via this model)
    // Optimize: Use lean() and selective populate for better performance
    const queryStartTime = Date.now();
    const inspections = await Inspection.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'inspectionReportId',
        select: '_id status createdAt updatedAt', // Only select needed fields
        options: { lean: true }
      })
      .sort({ dateAdded: -1 })
      .lean()
      .limit(1000); // Limit to prevent huge responses

    const queryTime = Date.now() - queryStartTime;
    console.log(`⏱️ Database query took ${queryTime}ms, found ${inspections.length} inspections`);

    // Group by status - Inspection uses: Pending, Rejected, Scheduled, Completed
    const completedInspections = inspections.filter(inv =>
      (inv.status || '').toLowerCase() === 'completed' || (inv.status || '').toLowerCase() === 'approved'
    );

    const failedInspections = inspections.filter(inv =>
      (inv.status || '').toLowerCase() === 'rejected' || (inv.status || '').toLowerCase() === 'cancelled'
    );

    const pendingInspections = inspections.filter(inv => {
      const s = (inv.status || '').toLowerCase();
      return s === 'pending' || s === 'scheduled';
    });

    const totalTime = Date.now() - startTime;
    console.log('✅ Found inspections:', inspections.length);
    console.log('✅ Pending/Scheduled:', pendingInspections.length);
    console.log('✅ Completed:', completedInspections.length);
    console.log('✅ Failed:', failedInspections.length);
    console.log(`⏱️ Total request time: ${totalTime}ms`);

    res.json({
      success: true,
      inspections: pendingInspections,
      completedInspections: completedInspections,
      failedInspections: failedInspections,
      total: inspections.length,
      pending: pendingInspections.length
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching inspector inspections:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching inspections',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN BUY CAR REQUESTS ENDPOINT ====================
// Multer for buy car for me payment receipt
const buyCarReceiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'buy_car');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `receipt-${unique}.${ext}`);
  }
});
const uploadBuyCarReceipt = multer({ storage: buyCarReceiptStorage, fileFilter: multerImageFilter, limits: multerLimits }).single('paymentReceipt');

app.post("/buy_car-for_me", uploadBuyCarReceipt, async (req, res) => {
  try {
    const b = req.body || {};
    const userId = b.userId;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required." });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: "Invalid userId." });
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const location = (b.location || '').trim();
    const priceFrom = parseFloat(b.priceFrom);
    const priceTo = parseFloat(b.priceTo);
    if (!make || !model || !location) return res.status(400).json({ success: false, message: "make, model, and location are required." });
    const receiptPath = req.file ? '/uploads/buy_car/' + path.basename(req.file.path) : undefined;
    const doc = {
      userId: new mongoose.Types.ObjectId(userId),
      make,
      model,
      variant: (b.variant || '').trim(),
      location: location || 'N/A',
      registrationCity: (b.registrationCity || '').trim(),
      preferredContact: (b.preferredContact || '').trim(),
      year: (b.year || '').trim(),
      description: (b.description || '').trim(),
      priceFrom: isNaN(priceFrom) ? 0 : priceFrom,
      priceTo: isNaN(priceTo) ? 0 : priceTo,
      transmission: (b.transmission || '').trim(),
      paymentReceipt: receiptPath,
      isActive: 'Pending'
    };
    const ad = new BuyCar(doc);
    await ad.save();
    res.status(201).json({ success: true, message: "Request submitted successfully. Admin will review it.", data: { id: ad._id.toString() } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST buy_car-for_me error:', error);
    res.status(500).json({ success: false, message: "Error creating request. Please try again.", error: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
});

// Get all buy car requests (requires Admin/SuperAdmin authentication)
app.get("/buy_car_requests", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Fetch all buy car requests
    const buyCarRequests = await BuyCar.find({
      isDeleted: { $ne: true }
    })
      .populate('userId', 'name email phone')
      .sort({ dateAdded: -1 })
      .lean();

    res.json(buyCarRequests);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching buy car requests:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching buy car requests",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN BUY CAR REQUEST STATUS UPDATE ENDPOINT ====================
// Update buy car request status
app.patch("/buy_car_requests/:id/status", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    // Update the buy car request
    const updatedRequest = await BuyCar.findByIdAndUpdate(
      id,
      {
        isActive: status === 'Completed' || status === 'InProgress' ? true : false,
        status: status,
        adminComments: comments || '',
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate('userId', 'name email phone')
      .lean();

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Buy car request not found"
      });
    }

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating buy car request status:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error updating buy car request status",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADMIN DELETE BUY CAR REQUEST ENDPOINT ====================
// Delete buy car request
app.delete("/buy_car_requests/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    const { id } = req.params;

    // Soft delete the buy car request
    const deletedRequest = await BuyCar.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: "Buy car request not found"
      });
    }

    res.json({
      success: true,
      message: "Buy car request deleted successfully"
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting buy car request:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error deleting buy car request",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== DEALER PACKAGES ENDPOINTS ====================
// Get dealer packages by type (car, bike, or booster)
app.get("/dealer_packages", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      console.error('❌ DealerPackage model is not loaded - returning empty array');
      return res.json([]);
    }

    const { type } = req.query;

    // Build query
    const query = {
      isDeleted: { $ne: true },
      status: 'active'
    };

    // Filter by type if provided
    if (type && type !== 'all') {
      query.type = type.toLowerCase();
    }

    // Fetch packages
    const packages = await DealerPackage.find(query)
      .sort({ dateCreated: -1 })
      .lean();

    res.json(packages || []);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching dealer packages:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching dealer packages",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get booster packages specifically
app.get("/dealer_packages/booster", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      console.error('❌ DealerPackage model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch booster packages
    const boosterPackages = await DealerPackage.find({
      isDeleted: { $ne: true },
      type: 'booster',
      status: 'active'
    })
      .sort({ dateCreated: -1 })
      .lean();

    res.json(boosterPackages || []);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching booster packages:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching booster packages",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get all dealer packages (admin endpoint - returns all types)
app.get("/admin/dealer_packages", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      console.error('❌ DealerPackage model is not loaded - returning empty arrays');
      return res.json({
        success: true,
        carPackages: [],
        bikePackages: [],
        boosterPackages: []
      });
    }

    // Fetch all packages grouped by type
    const [carPackages, bikePackages, boosterPackages] = await Promise.all([
      DealerPackage.find({
        isDeleted: { $ne: true },
        type: 'car',
        status: 'active'
      }).sort({ dateCreated: -1 }).lean(),
      DealerPackage.find({
        isDeleted: { $ne: true },
        type: 'bike',
        status: 'active'
      }).sort({ dateCreated: -1 }).lean(),
      DealerPackage.find({
        isDeleted: { $ne: true },
        type: 'booster',
        status: 'active'
      }).sort({ dateCreated: -1 }).lean()
    ]);

    res.json({
      success: true,
      carPackages: carPackages || [],
      bikePackages: bikePackages || [],
      boosterPackages: boosterPackages || []
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching all dealer packages:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching dealer packages",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get dealer package requests
app.get("/dealer_package_requests", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackageRequest) {
      console.error('❌ DealerPackageRequest model is not loaded - returning empty array');
      return res.json([]);
    }

    // Fetch all package requests
    const requests = await DealerPackageRequest.find({
      isDeleted: { $ne: true }
    })
      .populate('userId', 'name email phone')
      .populate('packageId')
      .sort({ requestDate: -1 })
      .lean();

    res.json(requests || []);

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching dealer package requests:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching dealer package requests",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Public: Get dealer packages by type for mobile app (car, bike, or booster) - no auth for upgrade screen
app.get("/mobile/dealer_packages/:type", async (req, res) => {
  try {
    const type = String(req.params.type || '').toLowerCase();
    if (type !== 'car' && type !== 'bike' && type !== 'booster') {
      return res.status(400).json({ success: false, message: "type must be car, bike, or booster", packages: [] });
    }
    if (!DealerPackage) {
      return res.json({ success: true, packages: [] });
    }
    const packages = await DealerPackage.find({
      isDeleted: { $ne: true },
      status: 'active',
      type: type
    })
      .sort({ dateCreated: -1 })
      .lean();
    const list = (packages || []).map(p => ({
      _id: p._id,
      id: p._id && p._id.toString ? p._id.toString() : p._id,
      name: p.name,
      bundleName: p.bundleName || p.name,
      price: p.price,
      actualPrice: p.actualPrice != null ? p.actualPrice : p.price,
      discountedPrice: p.discountedRate != null ? p.discountedRate : p.price,
      discountedRate: p.discountedRate,
      validityDays: p.noOfDays != null ? p.noOfDays : p.duration,
      noOfDays: p.noOfDays != null ? p.noOfDays : p.duration,
      duration: p.duration,
      listingLimit: p.listingLimit != null ? p.listingLimit : 0,
      featuredListings: p.featuredListings != null ? p.featuredListings : 0,
      noOfBoosts: p.noOfBoosts != null ? p.noOfBoosts : (p.listingLimit || 0),
      features: p.features || [],
      description: p.description,
      popular: p.popular,
      type: p.type
    }));
    res.json({ success: true, packages: list });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching mobile dealer packages:', error);
    res.status(500).json({ success: false, message: "Error fetching packages", packages: [] });
  }
});

// Public: Get dealer package by ID (for mobile app - no auth)
app.get("/dealer_packages/:packageId", async (req, res) => {
  try {
    const { packageId } = req.params;

    if (!packageId) {
      return res.status(400).json({ success: false, message: "Package ID required" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ success: false, message: "Invalid package ID format" });
    }

    const DealerPackage = require('./models/DealerPackage');
    const package = await DealerPackage.findOne({
      _id: packageId,
      status: 'active',
      isDeleted: { $ne: true }
    });

    if (!package) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    // Transform package data to match expected format
    const transformedPackage = {
      _id: package._id,
      id: package._id && package._id.toString ? package._id.toString() : package._id,
      name: package.name,
      bundleName: package.bundleName || package.name,
      price: package.price,
      actualPrice: package.actualPrice != null ? package.actualPrice : package.price,
      discountedPrice: package.discountedRate != null ? package.discountedRate : package.price,
      discountedRate: package.discountedRate,
      validityDays: package.noOfDays != null ? package.noOfDays : package.duration,
      noOfDays: package.noOfDays != null ? package.noOfDays : package.duration,
      duration: package.duration,
      liveAdDays: package.noOfDays != null ? package.noOfDays : package.duration,
      listingLimit: package.listingLimit != null ? package.listingLimit : 0,
      totalAds: package.listingLimit != null ? package.listingLimit : 0,
      featuredListings: package.featuredListings != null ? package.featuredListings : 0,
      freeBoosters: package.featuredListings != null ? package.featuredListings : 0,
      noOfBoosts: package.noOfBoosts != null ? package.noOfBoosts : (package.listingLimit || 0),
      features: package.features || [],
      description: package.description,
      popular: package.popular,
      type: package.type
    };

    res.json(transformedPackage);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching package by ID:', error);
    res.status(500).json({ success: false, message: "Error fetching package" });
  }
});

// Public: Get user's mobile package purchases (for mobile app - no auth)
app.get("/mobile/user-mobile-packages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId required", packages: [] });
    }
    if (!MobilePackagePurchase) {
      return res.json({ success: true, packages: [] });
    }
    const mongoose = require('mongoose');
    const query = { isDeleted: { $ne: true } };
    if (mongoose.Types.ObjectId.isValid(userId) && String(new mongoose.Types.ObjectId(userId)) === userId) {
      query.$or = [{ userId }, { userId: new mongoose.Types.ObjectId(userId) }];
    } else {
      query.userId = String(userId);
    }
    const purchases = await MobilePackagePurchase.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    const now = new Date();
    const packages = (purchases || []).map(p => {
      // Calculate if package is active (approved and not expired)
      const isExpired = p.expiryDate && new Date(p.expiryDate) < now;
      const isApproved = p.status === 'approved';
      const isPending = p.status === 'pending';
      const isRejected = p.status === 'rejected';

      // Determine active status and display status
      let isActive = false;
      let displayStatus = 'pending';

      if (isRejected) {
        displayStatus = 'rejected';
      } else if (isPending) {
        displayStatus = 'pending';
      } else if (isApproved) {
        if (isExpired) {
          displayStatus = 'expired';
        } else {
          isActive = true;
          displayStatus = 'active';
        }
      }

      return {
        ...p,
        isActive: isActive,
        displayStatus: displayStatus,
        active: isActive // For backward compatibility
      };
    });

    res.json({ success: true, packages });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching user mobile packages:', error);
    res.status(500).json({ success: false, message: "Error fetching packages", packages: [] });
  }
});

// Multer configuration for receipt uploads
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'receipts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `receipt-${unique}.${ext}`);
  }
});
const uploadReceipt = multer({
  storage: receiptStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).single('receipt');

// Public: Submit payment receipt with image (FormData)
app.post("/payment/submit-receipt", uploadReceipt, async (req, res) => {
  try {
    if (!MobilePackagePurchase) {
      return res.status(500).json({ success: false, message: "MobilePackagePurchase model not available" });
    }

    const { userId, packageId, packageName, packageType, amount, customerName, customerEmail, customerPhone, paymentMethod, liveAdDays, validityDays, freeBoosters, totalAds } = req.body;

    if (!userId || !packageId || !packageName || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: "Receipt image required" });
    }

    const relativePath = path.relative(path.join(__dirname, 'uploads'), req.file.path);
    const receiptImagePath = '/uploads/' + relativePath.replace(/\\/g, '/');

    const purchase = new MobilePackagePurchase({
      userId,
      packageId,
      packageName,
      packageType: packageType || 'car',
      amount: parseFloat(amount) || 0,
      receiptImage: receiptImagePath,
      customerName: customerName || 'Unknown',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      paymentMethod: paymentMethod || 'Bank Transfer',
      status: 'pending',
      liveAdDays: parseInt(liveAdDays) || 0,
      validityDays: parseInt(validityDays) || 0,
      freeBoosters: parseInt(freeBoosters) || 0,
      totalAds: parseInt(totalAds) || 0,
      isActive: false,
    });

    await purchase.save();

    res.json({
      success: true,
      message: "Receipt submitted successfully",
      purchase: {
        id: purchase._id,
        status: purchase.status
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error submitting receipt:', error);
    res.status(500).json({ success: false, message: "Error submitting receipt" });
  }
});

// Public: Submit payment receipt with JSON (fallback for platforms that don't support FormData properly)
app.post("/payment/submit-receipt-json", async (req, res) => {
  try {
    if (!MobilePackagePurchase) {
      return res.status(500).json({ success: false, message: "MobilePackagePurchase model not available" });
    }

    const { userId, packageId, packageName, packageType, amount, customerName, customerEmail, customerPhone, paymentMethod, liveAdDays, validityDays, freeBoosters, totalAds, receiptImage } = req.body;

    if (!userId || !packageId || !packageName || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // For JSON endpoint, detect if receiptImage is a local file path and replace with placeholder
    let processedReceiptImage = 'pending-upload';
    if (receiptImage) {
      // If it's a valid server path (starts with /uploads/), keep it
      if (receiptImage.startsWith('/uploads/')) {
        processedReceiptImage = receiptImage;
      }
      // If it's a local mobile file path (file:///), replace with placeholder
      else if (receiptImage.startsWith('file://')) {
        processedReceiptImage = 'pending-upload-mobile';
      }
      // Otherwise, keep as-is (might be a URL or other valid path)
      else {
        processedReceiptImage = receiptImage;
      }
    }

    const purchase = new MobilePackagePurchase({
      userId,
      packageId,
      packageName,
      packageType: packageType || 'car',
      amount: parseFloat(amount) || 0,
      receiptImage: processedReceiptImage,
      customerName: customerName || 'Unknown',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      paymentMethod: paymentMethod || 'Bank Transfer',
      status: 'pending',
      liveAdDays: parseInt(liveAdDays) || 0,
      validityDays: parseInt(validityDays) || 0,
      freeBoosters: parseInt(freeBoosters) || 0,
      totalAds: parseInt(totalAds) || 0,
      isActive: false,
    });

    await purchase.save();

    res.json({
      success: true,
      message: "Receipt submitted successfully (image pending)",
      purchase: {
        id: purchase._id,
        status: purchase.status
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error submitting receipt (JSON):', error);
    res.status(500).json({ success: false, message: "Error submitting receipt" });
  }
});

// Get mobile package purchases
app.get("/admin/mobile-package-purchases", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!MobilePackagePurchase) {
      console.error('❌ MobilePackagePurchase model is not loaded - returning empty array');
      return res.json({
        success: true,
        purchases: []
      });
    }

    // Fetch all mobile package purchases (no populate - userId can be temp_user_xxx, not valid ObjectId)
    const purchases = await MobilePackagePurchase.find({
      isDeleted: { $ne: true }
    })
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      success: true,
      purchases: purchases || []
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching mobile package purchases:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error fetching mobile package purchases",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Create dealer package
app.post("/dealer_packages", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      return res.status(500).json({
        success: false,
        message: "DealerPackage model is not loaded"
      });
    }

    const packageData = req.body;

    // Create new package
    const newPackage = new DealerPackage(packageData);
    await newPackage.save();

    res.json({
      success: true,
      data: newPackage
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating dealer package:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error creating dealer package",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Update dealer package
app.put("/dealer_packages/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      return res.status(500).json({
        success: false,
        message: "DealerPackage model is not loaded"
      });
    }

    const { id } = req.params;
    const packageData = req.body;

    // Update package
    const updatedPackage = await DealerPackage.findByIdAndUpdate(
      id,
      { ...packageData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      data: updatedPackage
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating dealer package:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error updating dealer package",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete dealer package
app.delete("/dealer_packages/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      return res.status(500).json({
        success: false,
        message: "DealerPackage model is not loaded"
      });
    }

    const { id } = req.params;

    // Soft delete package
    const deletedPackage = await DealerPackage.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      message: "Package deleted successfully"
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting dealer package:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error deleting dealer package",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Toggle popular status
app.patch("/dealer_packages/:id/popular", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackage) {
      return res.status(500).json({
        success: false,
        message: "DealerPackage model is not loaded"
      });
    }

    const { id } = req.params;
    const { popular } = req.body;

    // Update popular status
    const updatedPackage = await DealerPackage.findByIdAndUpdate(
      id,
      { popular: popular !== undefined ? popular : true, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      data: updatedPackage
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating package popular status:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error updating package popular status",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Update dealer package request status
app.patch("/dealer_package_requests/:id/status", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!DealerPackageRequest) {
      return res.status(500).json({
        success: false,
        message: "DealerPackageRequest model is not loaded"
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Update request status
    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (status === 'approved') {
      updateData.approvedDate = new Date();
      updateData.approvedBy = req.userId;
    } else if (status === 'rejected') {
      updateData.rejectedDate = new Date();
    }

    const updatedRequest = await DealerPackageRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('userId', 'name email phone')
      .populate('packageId')
      .lean();

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating dealer package request status:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error updating request status",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Update mobile package purchase status
app.patch("/admin/mobile-package-purchases/:id/status", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!MobilePackagePurchase) {
      return res.status(500).json({
        success: false,
        message: "MobilePackagePurchase model is not loaded"
      });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Update purchase status
    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = req.userId;
      updateData.isActive = true; // Activate the package

      // Calculate expiry date based on validityDays (default 30 days if not set)
      const purchase = await MobilePackagePurchase.findById(id);
      if (purchase) {
        const validityDays = purchase.validityDays || 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validityDays);
        updateData.expiryDate = expiryDate;

        // Always initialize/reset usage tracking on approval
        updateData.usage = {
          totalAds: purchase.totalAds || 0,
          adsUsed: 0,
          adsRemaining: purchase.totalAds || 0,
          totalBoosters: purchase.freeBoosters || 0,
          boostersUsed: 0,
          boostersRemaining: purchase.freeBoosters || 0,
          lastUpdated: new Date()
        };

        console.log('✅ Package approved - Usage initialized:', {
          packageId: purchase.packageId,
          totalAds: purchase.totalAds,
          freeBoosters: purchase.freeBoosters,
          validityDays: validityDays
        });
      }
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectedAt = new Date();
      updateData.isActive = false; // Ensure inactive on rejection
    }

    const updatedPurchase = await MobilePackagePurchase.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .lean();

    if (!updatedPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }

    res.json({
      success: true,
      data: updatedPurchase
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating mobile package purchase status:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error updating purchase status",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Delete mobile package purchase
app.delete("/admin/mobile-package-purchases/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is Admin or SuperAdmin (case-insensitive)
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or SuperAdmin access required."
      });
    }

    // Verify model is loaded
    if (!MobilePackagePurchase) {
      return res.status(500).json({
        success: false,
        message: "MobilePackagePurchase model is not loaded"
      });
    }

    const { id } = req.params;

    // Soft delete purchase
    const deletedPurchase = await MobilePackagePurchase.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }

    res.json({
      success: true,
      message: "Purchase deleted successfully"
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting mobile package purchase:', error);
    }
    res.status(500).json({
      success: false,
      message: "Error deleting purchase",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== FUEL PRICES ADMIN API ====================
// GET /admin/fuel-prices - Fetch all fuel prices
app.get('/admin/fuel-prices', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!FuelPrice) {
      return res.json([]);
    }
    const prices = await FuelPrice.find().sort({ displayOrder: 1 }).lean();
    res.json(prices || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching fuel prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fuel prices',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST /admin/fuel-prices - Create fuel price
app.post('/admin/fuel-prices', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!FuelPrice) {
      return res.status(500).json({ success: false, message: 'FuelPrice model not loaded' });
    }
    const body = req.body;
    const price = new FuelPrice({
      type: body.type,
      price: body.price,
      change: body.change ?? 0,
      changePercent: body.changePercent ?? 0,
      icon: body.icon ?? 'flash',
      color: body.color ?? '#FF6B6B',
      gradient: body.gradient || ['#FF6B6B', '#FF8E8E'],
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive !== false
    });
    await price.save();
    res.json(price);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error creating fuel price:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating fuel price',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// PUT /admin/fuel-prices/:id - Update fuel price
app.put('/admin/fuel-prices/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!FuelPrice) {
      return res.status(500).json({ success: false, message: 'FuelPrice model not loaded' });
    }
    const body = req.body;
    const update = {
      type: body.type,
      price: body.price,
      change: body.change ?? 0,
      changePercent: body.changePercent ?? 0,
      icon: body.icon ?? 'flash',
      color: body.color ?? '#FF6B6B',
      gradient: body.gradient || ['#FF6B6B', '#FF8E8E'],
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive !== false,
      lastUpdated: new Date()
    };
    const price = await FuelPrice.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!price) {
      return res.status(404).json({ success: false, message: 'Fuel price not found' });
    }
    res.json(price);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error updating fuel price:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating fuel price',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE /admin/fuel-prices/:id - Delete fuel price
app.delete('/admin/fuel-prices/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!FuelPrice) {
      return res.status(500).json({ success: false, message: 'FuelPrice model not loaded' });
    }
    const price = await FuelPrice.findByIdAndDelete(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Fuel price not found' });
    }
    res.json({ success: true, message: 'Fuel price deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error deleting fuel price:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fuel price',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== BLOGS API ====================
// Multer config for blog image uploads
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'blogs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `blog-${unique}.${ext}`);
  }
});
const uploadBlogImage = multer({
  storage: blogStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).single('image1');

// GET /blogs - Fetch all blogs (public)
app.get('/blogs', securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Blog) {
      return res.json([]);
    }
    const blogs = await Blog.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean();
    res.json(blogs || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching blogs:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /blogs/:id - Fetch single blog (public)
app.get('/blogs/:id', securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching blog:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST /blogs - Create blog (admin, with optional image)
app.post('/blogs', authenticateToken, (req, res) => {
  uploadBlogImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + (err.message || 'Unknown') });
    }
    try {
      const userType = String(req.userType || '').toLowerCase();
      if (userType !== 'admin' && userType !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!Blog) {
        return res.status(500).json({ success: false, message: 'Blog model not loaded' });
      }
      const body = req.body;
      const image1 = req.file ? 'blogs/' + req.file.filename : (body.image1 || '');
      const blog = new Blog({
        title: body.title,
        author: body.author,
        category: body.category,
        excerpt: body.excerpt,
        content: body.content,
        status: body.status || 'draft',
        tags: typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim()).filter(Boolean) : (body.tags || []),
        image1: image1,
        publish_date: body.status === 'published' ? new Date() : undefined
      });
      await blog.save();
      res.json({ success: true, blog });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Error creating blog:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating blog',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  });
});

// PATCH /blogs/:id/status - Toggle blog status
app.patch('/blogs/:id/status', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!Blog) {
      return res.status(500).json({ success: false, message: 'Blog model not loaded' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    blog.status = newStatus;
    if (newStatus === 'published') blog.publish_date = new Date();
    await blog.save();
    res.json({ success: true, blog: { _id: blog._id, status: blog.status } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error toggling blog status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog status',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE /blogs/:id - Soft delete blog
app.delete('/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!Blog) {
      return res.status(500).json({ success: false, message: 'Blog model not loaded' });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== SUPPORT REQUESTS API ====================
// GET /support-requests - list all non-deleted support requests (admin)
app.get('/support-requests', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!SupportRequest) {
      return res.json([]);
    }

    const items = await SupportRequest.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean();

    return res.json(items || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching support requests:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error fetching support requests',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE /support-requests/:id - soft delete
app.delete('/support-requests/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!SupportRequest) {
      return res.status(500).json({ success: false, message: 'SupportRequest model not loaded' });
    }

    const doc = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    return res.json({ success: true, message: 'Support request deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting support request:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error deleting support request',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// PATCH /support-requests/:id/status - update status and optional adminResponse
app.patch('/support-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!SupportRequest) {
      return res.status(500).json({ success: false, message: 'SupportRequest model not loaded' });
    }

    const { status, adminResponse } = req.body || {};
    const allowedStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    const newStatus = allowedStatuses.includes(status) ? status : undefined;

    const updates = {};
    if (newStatus) {
      updates.status = newStatus;
      if (newStatus === 'resolved' || newStatus === 'closed') {
        updates.dateResolved = new Date();
      }
    }
    if (typeof adminResponse === 'string' && adminResponse.trim() !== '') {
      updates.adminResponse = adminResponse.trim();
    }

    const doc = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    return res.json({ success: true, supportRequest: doc });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating support request status:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating support request status',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== VIDEOS API ====================
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'videos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `video-${unique}.${ext}`);
  }
});
const uploadVideoImage = multer({ storage: videoStorage, fileFilter: multerImageFilter, limits: multerLimits }).single('image1');

// GET /videos - Fetch all videos (public)
app.get('/videos', securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Video) {
      return res.json([]);
    }
    const videos = await Video.find({ isDeleted: { $ne: true } })
      .sort({ dateAdded: -1 })
      .lean();
    res.json(videos || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching videos:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /videos/:id - Fetch single video (public)
app.get('/videos/:id', securityMiddleware.sanitizePublicResponse, async (req, res) => {
  try {
    if (!Video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    const video = await Video.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching video:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST /videos - Create video (admin, with optional image)
app.post('/videos', authenticateToken, (req, res) => {
  uploadVideoImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + (err.message || 'Unknown') });
    }
    try {
      const userType = String(req.userType || '').toLowerCase();
      if (userType !== 'admin' && userType !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!Video) {
        return res.status(500).json({ success: false, message: 'Video model not loaded' });
      }
      const body = req.body;
      const image1 = req.file ? 'videos/' + req.file.filename : (body.image1 || '');
      const video = new Video({
        title: body.title,
        author: body.author,
        category: body.category,
        description: body.description,
        videoUrl: body.videoUrl,
        duration: body.duration,
        status: body.status || 'draft',
        tags: typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim()).filter(Boolean) : (body.tags || []),
        image1: image1,
        publish_date: body.status === 'published' ? new Date() : undefined
      });
      await video.save();
      res.json({ success: true, video });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Error creating video:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating video',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  });
});

// PATCH /videos/:id/status - Toggle video status
app.patch('/videos/:id/status', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!Video) {
      return res.status(500).json({ success: false, message: 'Video model not loaded' });
    }
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    const newStatus = video.status === 'published' ? 'draft' : 'published';
    video.status = newStatus;
    if (newStatus === 'published') video.publish_date = new Date();
    await video.save();
    res.json({ success: true, video: { _id: video._id, status: video.status } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error toggling video status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video status',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// DELETE /videos/:id - Soft delete video
app.delete('/videos/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!Video) {
      return res.status(500).json({ success: false, message: 'Video model not loaded' });
    }
    const video = await Video.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ==================== ADVERTISING API ====================
// Multer config for advertising image uploads
const advertisingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'advertising');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname || '').split('.').pop() || 'jpg';
    cb(null, `advertising-${unique}.${ext}`);
  }
});
const uploadAdvertisingImage = multer({
  storage: advertisingStorage,
  fileFilter: multerImageFilter,
  limits: multerLimits
}).single('image');

// Public: fetch all non-deleted advertising (optionally filtered by status)
app.get('/advertising', async (req, res) => {
  try {
    if (!Advertising) {
      // Fail gracefully if model is not loaded
      return res.json([]);
    }

    const query = { isDeleted: { $ne: true } };
    const { status } = req.query;
    if (status) {
      query.status = status;
    }

    const ads = await Advertising.find(query)
      .sort({ order: 1, dateAdded: -1 })
      .lean();

    return res.json(ads || []);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching advertising:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error fetching advertising',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Admin: create advertising (with image upload)
app.post('/advertising', authenticateToken, (req, res) => {
  uploadAdvertisingImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + (err.message || 'Unknown') });
    }
    try {
      const userType = String(req.userType || '').toLowerCase();
      if (userType !== 'admin' && userType !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!Advertising) {
        return res.status(500).json({ success: false, message: 'Advertising model not loaded' });
      }

      const body = req.body || {};
      const image = req.file ? `advertising/${req.file.filename}` : (body.image || '');

      const ad = new Advertising({
        title: body.title,
        description: body.description,
        link: body.link || '',
        image,
        status: body.status || 'draft',
        order: typeof body.order === 'string' ? parseInt(body.order, 10) || 0 : (body.order || 0),
      });

      await ad.save();
      return res.json({ success: true, advertising: ad });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating advertising:', error);
      }
      return res.status(500).json({
        success: false,
        message: 'Error creating advertising',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  });
});

// Admin: update advertising (with optional new image)
app.put('/advertising/:id', authenticateToken, (req, res) => {
  uploadAdvertisingImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + (err.message || 'Unknown') });
    }
    try {
      const userType = String(req.userType || '').toLowerCase();
      if (userType !== 'admin' && userType !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!Advertising) {
        return res.status(500).json({ success: false, message: 'Advertising model not loaded' });
      }

      const body = req.body || {};
      const updates = {
        title: body.title,
        description: body.description,
        link: body.link || '',
        status: body.status || 'draft',
        order: typeof body.order === 'string' ? parseInt(body.order, 10) || 0 : (body.order || 0),
      };

      if (req.file) {
        updates.image = `advertising/${req.file.filename}`;
      }

      const ad = await Advertising.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!ad) {
        return res.status(404).json({ success: false, message: 'Advertising item not found' });
      }

      return res.json({ success: true, advertising: ad });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating advertising:', error);
      }
      return res.status(500).json({
        success: false,
        message: 'Error updating advertising',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  });
});

// Admin: toggle advertising status
app.patch('/advertising/:id/status', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!Advertising) {
      return res.status(500).json({ success: false, message: 'Advertising model not loaded' });
    }

    const ad = await Advertising.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertising item not found' });
    }

    const newStatus = ad.status === 'published' ? 'draft' : 'published';
    ad.status = newStatus;
    if (newStatus === 'published') {
      ad.dateAdded = new Date();
    }
    await ad.save();

    return res.json({ success: true, advertising: { _id: ad._id, status: ad.status } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error toggling advertising status:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating advertising status',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Admin: soft delete an advertising entry
app.delete('/advertising/:id', authenticateToken, async (req, res) => {
  try {
    const userType = String(req.userType || '').toLowerCase();
    if (userType !== 'admin' && userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!Advertising) {
      return res.status(500).json({ success: false, message: 'Advertising model not loaded' });
    }

    const ad = await Advertising.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertising item not found' });
    }

    return res.json({ success: true, message: 'Advertising deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting advertising:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Error deleting advertising',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Public: convenience endpoint for only published ads (used by mobile app)
app.get('/advertising/published', securityMiddleware.sanitizePublicResponse, async (req, res) => {
  const startTime = Date.now();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('⚠️ Advertising query timeout after 30s');
      return res.status(504).json({
        success: false,
        message: 'Request timeout - database query took too long',
        ads: [] // Return empty array instead of error
      });
    }
  }, 30000); // 30 second timeout

  try {
    if (!Advertising) {
      clearTimeout(timeout);
      return res.json([]);
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      clearTimeout(timeout);
      console.warn('⚠️ Database not connected, returning empty ads');
      return res.json([]);
    }

    console.log('🔍 Fetching published advertising...');

    // Use Promise.race to enforce timeout even if MongoDB hangs
    const queryPromise = Advertising.find({
      isDeleted: { $ne: true },
      status: 'published'
    })
      .sort({ order: 1, dateAdded: -1 })
      .lean()
      .limit(100) // Limit to prevent huge responses
      .maxTimeMS(20000) // MongoDB query timeout: 20 seconds (reduced)
      .exec();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 20000);
    });

    let ads = [];
    try {
      ads = await Promise.race([queryPromise, timeoutPromise]);
      if (!Array.isArray(ads)) {
        ads = [];
      }
    } catch (err) {
      console.error('⚠️ Advertising query failed:', err.message);
      ads = []; // Return empty array on error
    }

    clearTimeout(timeout);
    const queryTime = Date.now() - startTime;
    console.log(`✅ Found ${ads.length} published ads in ${queryTime}ms`);

    return res.json(ads || []);
  } catch (error) {
    clearTimeout(timeout);
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching published advertising:', error);
    }
    // Return empty array instead of error for better UX
    return res.json([]);
  }
});

// ==================== GENERIC STATIC FILE HANDLER (Last route) ====================
// Handle other static files at root level (only image files)
// IMPORTANT: This must be LAST route - after all API routes
app.get('/:filename', (req, res, next) => {
  const filename = req.params.filename;

  // Skip if it's a known API route prefix
  const apiRoutePrefixes = ['health', 'admin', 'admin-contact', 'api', 'login', 'signup', 'register', 'inspector', 'inspectors', 'uploads', 'dashboard', 'reports', 'users', 'all_user_ads', 'edit-profile', 'free_ads', 'featured_ads', 'list_it_for_you_ad', 'new_cars', 'bike_ads', 'rent_car', 'autoparts', 'inspection', 'blogs', 'videos', 'buy_car'];
  if (apiRoutePrefixes.some(prefix => req.path.toLowerCase().startsWith('/' + prefix))) {
    return next();
  }

  // Only handle image files and common static files
  if (/\.(svg|jpg|jpeg|png|gif|ico|webp)$/i.test(filename)) {
    const filePath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    const publicFilePath = path.join(__dirname, 'public', filename);
    if (fs.existsSync(publicFilePath)) {
      return res.sendFile(publicFilePath);
    }
  }
  // If not a static file, continue to next route (will return 404)
  next();
});

// ==================== SERVER START ====================
// Listen on 0.0.0.0 to accept connections from Android emulator (10.0.2.2)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL: http://0.0.0.0:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Ready to accept connections from Android emulator (10.0.2.2:${PORT})`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
