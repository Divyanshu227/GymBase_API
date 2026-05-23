const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

let connectPromise = null;

async function initDb() {
  if (!MONGO_URI) {
    console.error('[GymBase_API] Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in Vercel.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log('[GymBase_API] Connected to MongoDB');
        return true;
      })
      .catch((error) => {
        console.error('[GymBase_API] Error connecting to MongoDB:', error);
        connectPromise = null;
        return false;
      });
  }

  return connectPromise;
}

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { initDb, isDbReady, MONGO_URI };
