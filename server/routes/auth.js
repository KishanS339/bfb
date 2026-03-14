const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// IN-MEMORY STORE (Replaces MongoDB User model)
let users = [
  { _id: '1', name: 'Citizen Demo', email: 'akarsh@example.com', password: 'password123', phone: '9876543210', role: 'citizen' },
  { _id: '2', name: 'Admin Demo', email: 'admin@bbmp.gov.in', password: 'admin123', phone: '9876543210', role: 'admin' }
];

// Middleware: Verify JWT token
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = users.find(u => u._id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// POST /api/auth/signup — Register new user
router.post('/signup', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'Email already registered.' });

  const _id = Date.now().toString();
  const newUser = { _id, name, email, password, phone: phone || '', role: role || 'citizen' };
  users.push(newUser);

  const token = jwt.sign({ id: _id, role: newUser.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });
  res.status(201).json({
    message: 'Account created successfully (Mock Data)',
    token,
    user: { id: _id, name, email, role: newUser.role }
  });
});

// POST /api/auth/login — Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });
  res.json({
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// GET /api/auth/me — Get current user
router.get('/me', auth, (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, phone: req.user.phone }
  });
});

module.exports = router;
module.exports.auth = auth;
