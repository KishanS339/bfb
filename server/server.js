const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievances'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NagaraSeva API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── Connect to MongoDB & Start Server ──
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nagaraseva';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
};

// Only run the persistent connection and listener locally.
// On Vercel, the database connection is explicitly managed per-request inside `api/index.js`.
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('');
      console.log('  ┌─────────────────────────────────────────────┐');
      console.log('  │                                             │');
      console.log('  │   🏛️  NagaraSeva Server Running!            │');
      console.log('  │                                             │');
      console.log(`  │   API:      http://localhost:${PORT}/api      │`);
      console.log(`  │   Frontend: http://localhost:${PORT}          │`);
      console.log('  │   MongoDB:  Connected ✅                    │');
      console.log('  │                                             │');
      console.log('  └─────────────────────────────────────────────┘');
      console.log('');
      app.listen(PORT);
    })
    .catch(err => {
      console.error('');
      console.error('  ❌ MongoDB connection failed:', err.message);
      console.error('  Make sure MongoDB is running or MONGODB_URI is correct.');
      console.error('');
    });
}

// Export the Express API for Vercel's serverless functions
module.exports = app;
