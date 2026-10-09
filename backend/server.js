const app = require('./src/app');
const { connectDB } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`[CSMS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
