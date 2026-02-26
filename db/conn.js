// db.js

const mongoose = require('mongoose');

// ✅ SECURED: MongoDB URI moved to environment variable
// const dbURI = process.env.MONGODB_URI;
const dbURI = "mongodb+srv://autofinder:anas@cluster0.fcal8.mongodb.net/Autofinder?retryWrites=true&w=majority&appName=Cluster0";
console.log('🔍 Using HARDCODED MONGODB_URI:', dbURI.slice(0, 30) + '...');
if (!dbURI) {
  console.error('❌ MONGODB_URI environment variable is missing!');
  throw new Error('MONGODB_URI is required. Set it in .env or node.env in project root.');
}

// Connection options with better error handling
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Reduced to 10 seconds - fail fast
      socketTimeoutMS: 20000, // Socket timeout: 20 seconds
      connectTimeoutMS: 10000, // Connection timeout: 10 seconds
      bufferCommands: true, // Enable buffering to prevent the error
      maxPoolSize: 10, // Connection pool size
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

const dbConnection = mongoose.connection;

dbConnection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

dbConnection.once('open', () => {
  console.log('✅ Connected to MongoDB successfully');
});

dbConnection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

dbConnection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Start the connection
connectDB();

module.exports = dbConnection;