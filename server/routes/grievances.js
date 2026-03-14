const express = require('express');
const router = express.Router();
const { auth } = require('./auth');

// IN-MEMORY STORE (Replaces MongoDB Grievance model)
let grievances = [
  {
    _id: 'g1',
    grievanceId: 'GRV-49821',
    title: 'Severe Pothole on Brigade Road',
    description: 'There is a massive pothole causing absolute chaos during rush hour.',
    category: 'Roads',
    status: 'Open',
    priority: 'High',
    location: { address: 'Brigade Road, Ashok Nagar', ward: 'Ward 111', coordinates: {} },
    citizen: { _id: '1', name: 'Citizen Demo', email: 'akarsh@example.com' },
    timeline: [
      { action: 'Created', description: 'Grievance submitted by citizen', timestamp: new Date() }
    ],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'g2',
    grievanceId: 'GRV-10294',
    title: 'Garbage Dump Overflowing',
    description: 'The garbage bins near the park have not been cleared in 4 days.',
    category: 'Solid Waste',
    status: 'In Progress',
    priority: 'Medium',
    location: { address: 'Indiranagar 100ft Road', ward: 'Ward 89', coordinates: {} },
    citizen: { _id: '1', name: 'Citizen Demo', email: 'akarsh@example.com' },
    timeline: [
      { action: 'Created', description: 'Grievance submitted by citizen', timestamp: new Date(Date.now() - 86400000) }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date()
  }
];

// GET /api/grievances — List all grievances (with filters)
router.get('/', (req, res) => {
  let filtered = [...grievances];
  const { status, category, search } = req.query;
  
  if (status) filtered = filtered.filter(g => g.status === status);
  if (category) filtered = filtered.filter(g => g.category === category);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(g => g.title.toLowerCase().includes(s) || g.grievanceId.toLowerCase().includes(s));
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    grievances: filtered,
    pagination: {
      total: filtered.length,
      page: 1,
      pages: 1,
      limit: 100
    }
  });
});

// GET /api/grievances/stats — Dashboard statistics
router.get('/stats', (req, res) => {
  res.json({
    total: grievances.length,
    open: grievances.filter(g => g.status === 'Open').length,
    inProgress: grievances.filter(g => g.status === 'In Progress').length,
    resolved: grievances.filter(g => g.status === 'Resolved').length,
    escalated: grievances.filter(g => g.status === 'Escalated').length,
    closed: grievances.filter(g => g.status === 'Closed').length,
    overdue: 0,
    categoryStats: [
      { _id: 'Roads', count: grievances.filter(g => g.category === 'Roads').length },
      { _id: 'Solid Waste', count: grievances.filter(g => g.category === 'Solid Waste').length }
    ],
    wardStats: [
      { _id: 'Ward 111', count: 1 },
      { _id: 'Ward 89', count: 1 }
    ]
  });
});

// GET /api/grievances/my — Get grievances for logged-in citizen
router.get('/my', auth, (req, res) => {
  const mine = grievances.filter(g => g.citizen && g.citizen._id === req.user._id);
  res.json({
    grievances: mine,
    stats: {
      total: mine.length,
      open: mine.filter(g => g.status === 'Open').length,
      inProgress: mine.filter(g => g.status === 'In Progress').length,
      resolved: mine.filter(g => g.status === 'Resolved').length,
      escalated: mine.filter(g => g.status === 'Escalated').length
    }
  });
});

// GET /api/grievances/:id — Get single grievance by ID
router.get('/:id', (req, res) => {
  const grievance = grievances.find(g => g.grievanceId === req.params.id);
  if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });
  res.json({ grievance });
});

// POST /api/grievances — Create new grievance
router.post('/', auth, (req, res) => {
  const newGrievance = {
    _id: 'g' + Date.now().toString(),
    grievanceId: 'GRV-' + Math.floor(10000 + Math.random() * 90000),
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    status: 'Open',
    priority: req.body.priority || 'Medium',
    location: {
      address: req.body.location?.address || 'Unknown Location',
      ward: req.body.location?.ward || 'Unassigned',
      coordinates: req.body.location?.coordinates || {}
    },
    citizen: { _id: req.user._id, name: req.user.name, email: req.user.email },
    timeline: [{ action: 'Created', description: 'Grievance submitted statically', timestamp: new Date() }],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  grievances.push(newGrievance);
  res.status(201).json({ message: 'Grievance submitted successfully!', grievance: newGrievance });
});

// PUT /api/grievances/:id — Update grievance (admin/officer)
router.put('/:id', auth, (req, res) => {
  const grievance = grievances.find(g => g.grievanceId === req.params.id);
  if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });

  const { status, priority } = req.body;

  if (status && status !== grievance.status) {
    grievance.timeline.push({
      action: `Status changed to ${status}`,
      description: `Status updated from "${grievance.status}" to "${status}"`,
      performedBy: req.user._id,
      timestamp: new Date()
    });
    grievance.status = status;
  }

  if (priority) grievance.priority = priority;
  
  res.json({ message: 'Grievance updated.', grievance });
});

// POST /api/grievances/:id/comments — Add comment
router.post('/:id/comments', auth, (req, res) => {
  const grievance = grievances.find(g => g.grievanceId === req.params.id);
  if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });

  grievance.comments.push({
    author: { name: req.user.name, role: req.user.role },
    text: req.body.text,
    isInternal: req.body.isInternal || false,
    createdAt: new Date()
  });

  res.status(201).json({ message: 'Comment added.', grievance });
});

// DELETE /api/grievances/:id — Delete grievance (admin only)
router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete grievances.' });
  }
  grievances = grievances.filter(g => g.grievanceId !== req.params.id);
  res.json({ message: 'Grievance deleted.' });
});

module.exports = router;
