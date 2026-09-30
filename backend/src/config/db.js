const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusshare';

    // In automated testing mode
    if (process.env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`[Database] Connected to In-Memory MongoDB for testing: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // If development and database is empty, seed demo academic records
    if (process.env.NODE_ENV === 'development') {
      await autoSeedIfEmpty();
    }

    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Fallback for development if local MongoDB isn't running
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('[Database] Attempting fallback to MongoMemoryServer for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[Database] Connected to Development In-Memory MongoDB: ${fallbackUri}`);

        await autoSeedIfEmpty();
        return conn;
      } catch (memErr) {
        console.error(`[Database Fallback Failed] ${memErr.message}`);
        throw error;
      }
    }
    throw error;
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const Resource = require('../models/Resource');
    const count = await Resource.countDocuments();
    if (count === 0) {
      console.log('[Database] Empty development database detected. Auto-seeding initial catalog...');
      const { seedDatabaseInternal } = require('../utils/seeder');
      await seedDatabaseInternal();
    }
  } catch (err) {
    console.warn('[Database] Auto-seeding warning:', err.message);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error(`[Database Disconnect Error] ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
