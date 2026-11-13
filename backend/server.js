const app = require('./src/app');
const { connectDB } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const { runMigrations } = require('./src/utils/migrateData');

const startServer = async () => {
  await connectDB();
  try {
    await runMigrations();
  } catch (migErr) {
    console.error('[Migration Error]', migErr.message);
  }
  
  app.listen(PORT, () => {
    console.log(`[CSMS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
