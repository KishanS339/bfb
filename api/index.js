const app = require('../server/server.js');

// Simple Vercel Serverless Function wrapper.
// No database connection required for the mock build.
module.exports = (req, res) => {
  return app(req, res);
};
