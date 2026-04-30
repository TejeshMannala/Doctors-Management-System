const app = require('./app');
const connectDB = require('./config/db');
const ensureAdminAccount = require('./utils/ensureAdminAccount');

require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not defined in .env. Using default fallback.');
} else {
  console.log('✅ JWT_SECRET loaded from environment.');
}

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async (port = PORT) => {
  try {
    // Connect to MongoDB
    await connectDB();
    await ensureAdminAccount();

    const server = app.listen(port, () => {
      console.log(`\n🚀 Server is running on http://localhost:${port}`);
      console.log(`📝 API: http://localhost:${port}/api`);
      console.log(`❤️  Health: http://localhost:${port}/api/health\n`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\nPort ${port} is already in use.`);
        console.error('Stop the process using this port or set a different PORT in .env.');
        process.exit(1);
      }
      console.error('Server encountered an error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
