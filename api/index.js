const app = require('../server/server.js');
const mongoose = require('mongoose');

// Vercel Serverless Function Wrapper
module.exports = async (req, res) => {
  // Ensure database is connected before processing the Express request
  if (mongoose.connection.readyState !== 1) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nagaraseva';
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Reduced from default 30s to fail fast
      });
      console.log('MongoDB Connected in Serverless mode');
    } catch (err) {
      console.error('Serverless MongoDB Connection Error:', err);
      return res.status(500).json({ error: 'Database connection failed.' });
    }
  }

  // Pass request to Express app
  return app(req, res);
};
