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

mongoose.connect(MONGODB_URI)
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
    console.error('');
    console.error('  Make sure MongoDB is running:');
    console.error('    • Local: mongod --dbpath /path/to/data');
    console.error('    • Atlas: Update MONGODB_URI in server/.env');
    console.error('');
    process.exit(1);
  });
