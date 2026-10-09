const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/csms_db';

    // Attempt direct connection first with low timeout if fallback needed
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
    } catch (err) {
      console.warn(`[Database] Could not connect to primary MongoDB (${mongoUri}). Falling back to In-Memory MongoDB Server...`);
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[Database] Connected to In-Memory MongoDB Server at ${mongoUri}`);
    }
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error(`[Database Error] Disconnect failed: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
