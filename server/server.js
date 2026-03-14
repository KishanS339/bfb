const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes (Using In-Memory Mock Database) ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievances'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NagaraSeva API',
    database: 'Static In-Memory Mock (No MongoDB)',
    timestamp: new Date().toISOString()
  });
});

// Only bind the port locally for `npm run dev`
if (!process.env.VERCEL) {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │                                             │');
  console.log('  │   🏛️  NagaraSeva Server Running!            │');
  console.log('  │                                             │');
  console.log(`  │   API:      http://localhost:${PORT}/api      │`);
  console.log(`  │   Frontend: http://localhost:${PORT}          │`);
  console.log('  │   Mode:     Static Mock (No MongoDB)      │');
  console.log('  │                                             │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
  app.listen(PORT);
}

// Export the Express app for Vercel Serverless
module.exports = app;
