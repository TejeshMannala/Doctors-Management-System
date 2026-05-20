const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');
const ensureAdminAccount = require('./utils/ensureAdminAccount');
const path = require('path');

require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not defined in .env. Using default fallback.');
} else {
  console.log('✅ JWT_SECRET loaded from environment.');
}

const PORT = parseInt(process.env.PORT, 10) || 5001;

const startServer = async (port = PORT) => {
  try {
    await connectDB();
    await ensureAdminAccount();

    const adminDist = path.join(__dirname, '../admin/dist');
    const frontendDist = path.join(__dirname, '../frontend/dist');
    const sendIndex = (res, filePath) => {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      });
      return res.sendFile(filePath);
    };

    // Static files
    app.use('/admin', express.static(adminDist));
    app.use(express.static(frontendDist));

    // Favicon handler to prevent 404
    app.get('/favicon.ico', (req, res) => {
      res.status(204).end();
    });

   
    app.get('*', (req, res) => {
      
      if (req.path.startsWith('/api')) {
        return res.status(404).json({
          success: false,
          message: 'API route not found'
        });
      }
      
     
      if (req.path.startsWith('/admin')) {
        return sendIndex(res, path.join(adminDist, 'index.html'));
      }
      
    
      return sendIndex(res, path.join(frontendDist, 'index.html'));
    });

    const server = app.listen(port, () => {
      console.log(`\n🚀 Server is running on http://localhost:${port}`);
      console.log(`📝 API: http://localhost:${port}/api`);
      console.log(`❤️  Health: http://localhost:${port}/api/health\n`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\nPort ${port} is already in use.`);
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
