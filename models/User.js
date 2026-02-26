const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: function () { return !this.googleId; } }, // Required only if not Google user
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, // Optional for Google users
  googleId: { type: String, unique: true, sparse: true }, // Google user ID
  profileImage: { type: String },
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  userType: {
    type: String,
    enum: ["User", "Inspector", "Admin", "SuperAdmin"],
    default: "User"
  },
  isVerified: { type: Boolean, default: false },
  tempOtp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  // Dealer Package System (Apple In-App Purchase)
  role: {
    type: String,
    enum: ["user", "dealer"],
    default: "user"
  },
  dealerActive: {
    type: Boolean,
    default: false
  },
  dealerPlatform: {
    type: String,
    enum: ["ios", "android", null],
    default: null
  },
  dealerPackage: {
    type: String,
    default: null // e.g. package name like '10 Days Dealer Package'
  },
  dealerStartDate: {
    type: Date,
    default: null
  },
  dealerExpiryDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  postedAds: [
    {
      adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Free_Ads", // or "Product" depending on your model name
      },
      isSold: {
        type: Boolean,
        default: false,
      }
    }
  ],
  bikeAds: [
    {
      adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike_Ads", // or "Product" depending on your model name
      },
      isSold: {
        type: Boolean,
        default: false,
      }
    }
  ],
  autoPartsAds: [
    {
      adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AutoStoreAd", // or "Product" depending on your model name
      },
      isSold: {
        type: Boolean,
        default: false,
      }
    }
  ],
  featuredAds: [
    {
      adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Featured_Ads", // Reference to featured ads collection
      },
      isSold: {
        type: Boolean,
        default: false,
      },
      isFeatured: {
        type: String,
        enum: ["Pending", "Rejected", "Approved"],
        default: "Pending",
      }
    }
  ],
  freeAdLimit: { type: Number, default: 2 },
  lastAdReset: { type: Date, default: Date.now },
  paidAdsCount: { type: Number, default: 0 },
  totalPaidAmount: { type: Number, default: 0 },
  premiumAdjustment: { type: Number, default: 0 },
  // Premium Package System
  premiumPackage: {
    type: {
      type: String,
      enum: ['7-day', '15-day', '30-day', 'starter', 'value', 'executive', null],
      default: null,
    },
    packageCategory: {
      type: String,
      enum: ['cars', 'bikes', 'general'],
      default: 'general',
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'expired'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  }
});

// Function to reset free ad limit exactly one month after last reset
userSchema.methods.resetFreeAds = function () {
  const now = new Date();
  const nextResetDate = new Date(this.lastAdReset);

  // Set the next reset date to exactly one month after last reset
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);

  if (now >= nextResetDate) {
    this.freeAdLimit = 2;
    this.paidAdsCount = 0;
    this.totalPaidAmount = 0;
    this.premiumAdjustment = 0;
    this.lastAdReset = now; // Update reset date to current date
  }
};

// Function to check if user can post a free ad
userSchema.methods.canPostFreeAd = function () {
  console.log(`🔍 canPostFreeAd - Before reset: freeAdLimit=${this.freeAdLimit}, lastAdReset=${this.lastAdReset}`);
  this.resetFreeAds(); // Reset if needed
  console.log(`🔍 canPostFreeAd - After reset: freeAdLimit=${this.freeAdLimit}, canPost=${this.freeAdLimit > 0}`);
  return this.freeAdLimit > 0;
};

// Function to get the cost for the next ad
userSchema.methods.getNextAdCost = function () {
  this.resetFreeAds(); // Reset if needed
  if (this.freeAdLimit > 0) {
    return 0; // Free
  } else {
    return 525; // PKR 525 for paid ads
  }
};

// Function to process ad payment
userSchema.methods.processAdPayment = function (amount) {
  this.paidAdsCount += 1;
  this.totalPaidAmount += amount;
  this.premiumAdjustment += amount; // This amount can be adjusted from premium service
  return this.save();
};

// Function to get premium service cost with adjustment
userSchema.methods.getPremiumServiceCost = function (basePrice) {
  const adjustedPrice = Math.max(0, basePrice - this.premiumAdjustment);
  return {
    originalPrice: basePrice,
    adjustment: this.premiumAdjustment,
    finalPrice: adjustedPrice
  };
};

// Function to check if premium package is active
userSchema.methods.isPremiumPackageActive = function () {
  if (!this.premiumPackage.isActive || !this.premiumPackage.expiryDate || this.premiumPackage.status !== 'active') {
    return false;
  }

  const now = new Date();
  const isActive = now < this.premiumPackage.expiryDate;

  // If expired, deactivate the package
  if (!isActive && this.premiumPackage.isActive) {
    this.premiumPackage.isActive = false;
    this.premiumPackage.status = 'expired';
    this.save();
  }

  return isActive;
};

// Function to purchase premium package (sets as pending)
userSchema.methods.purchasePremiumPackage = function (packageType, amount, packageCategory = 'general') {
  const now = new Date();
  const expiryDate = new Date(now);

  // Set expiry date based on package type
  switch (packageType) {
    case '7-day':
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case '15-day':
      expiryDate.setDate(expiryDate.getDate() + 15);
      break;
    case '30-day':
      expiryDate.setDate(expiryDate.getDate() + 30);
      break;
    case 'starter': // Bike packages
      expiryDate.setDate(expiryDate.getDate() + 30);
      break;
    case 'value':
      expiryDate.setDate(expiryDate.getDate() + 6);
      break;
    case 'executive':
      expiryDate.setDate(expiryDate.getDate() + 90);
      break;
    default:
      throw new Error('Invalid package type');
  }

  // Update premium package info (status: pending)
  this.premiumPackage = {
    type: packageType,
    packageCategory: packageCategory,
    purchaseDate: now,
    expiryDate: expiryDate,
    isActive: false, // Not active until approved
    status: 'pending',
    adminNotes: '',
    approvedAt: null,
    rejectedAt: null
  };

  // Update payment info
  this.totalPaidAmount += amount;
  this.premiumAdjustment += amount;

  return this.save();
};

// Function to approve premium package
userSchema.methods.approvePremiumPackage = function (adminNotes = '') {
  if (this.premiumPackage.status !== 'pending') {
    throw new Error('Package is not pending approval');
  }

  this.premiumPackage.status = 'active';
  this.premiumPackage.isActive = true;
  this.premiumPackage.adminNotes = adminNotes;
  this.premiumPackage.approvedAt = new Date();

  return this.save();
};

// Function to reject premium package
userSchema.methods.rejectPremiumPackage = function (adminNotes = '') {
  if (this.premiumPackage.status !== 'pending') {
    throw new Error('Package is not pending approval');
  }

  this.premiumPackage.status = 'rejected';
  this.premiumPackage.isActive = false;
  this.premiumPackage.adminNotes = adminNotes;
  this.premiumPackage.rejectedAt = new Date();

  return this.save();
};

// Function to get premium package info
userSchema.methods.getPremiumPackageInfo = function () {
  const isActive = this.isPremiumPackageActive();
  const now = new Date();

  let daysRemaining = 0;
  if (this.premiumPackage.expiryDate && isActive) {
    const timeDiff = this.premiumPackage.expiryDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  return {
    type: this.premiumPackage.type,
    isActive,
    status: this.premiumPackage.status,
    purchaseDate: this.premiumPackage.purchaseDate,
    expiryDate: this.premiumPackage.expiryDate,
    daysRemaining: Math.max(0, daysRemaining),
    adminNotes: this.premiumPackage.adminNotes,
    approvedAt: this.premiumPackage.approvedAt,
    rejectedAt: this.premiumPackage.rejectedAt
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
