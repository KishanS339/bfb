const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const { auth } = require('./auth');

// GET /api/grievances — List all grievances (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, ward, priority, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (ward) filter['location.ward'] = ward;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { grievanceId: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Grievance.countDocuments(filter);
    const grievances = await Grievance.find(filter)
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      grievances,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/stats — Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, open, inProgress, resolved, escalated, closed] = await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: 'Open' }),
      Grievance.countDocuments({ status: 'In Progress' }),
      Grievance.countDocuments({ status: 'Resolved' }),
      Grievance.countDocuments({ status: 'Escalated' }),
      Grievance.countDocuments({ status: 'Closed' })
    ]);

    const overdue = await Grievance.countDocuments({
      status: { $in: ['Open', 'In Progress'] },
      'sla.deadline': { $lt: new Date() }
    });

    // Category breakdown
    const categoryStats = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Ward breakdown
    const wardStats = await Grievance.aggregate([
      { $group: { _id: '$location.ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      total, open, inProgress, resolved, escalated, closed, overdue,
      categoryStats,
      wardStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/my — Get grievances for logged-in citizen
router.get('/my', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ citizen: req.user._id })
      .populate('assignedOfficer', 'name department')
      .sort({ createdAt: -1 });

    const stats = {
      total: grievances.length,
      open: grievances.filter(g => g.status === 'Open').length,
      inProgress: grievances.filter(g => g.status === 'In Progress').length,
      resolved: grievances.filter(g => g.status === 'Resolved').length,
      escalated: grievances.filter(g => g.status === 'Escalated').length
    };

    res.json({ grievances, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/:id — Get single grievance by ID
router.get('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ grievanceId: req.params.id })
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name department email')
      .populate('timeline.performedBy', 'name role')
      .populate('comments.author', 'name role');

    if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });
    res.json({ grievance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grievances — Create new grievance
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority, location, photos } = req.body;

    const grievance = new Grievance({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location: {
        address: location.address,
        ward: location.ward || '',
        coordinates: location.coordinates || {}
      },
      citizen: req.user._id,
      photos: photos || []
    });

    await grievance.save();

    res.status(201).json({
      message: 'Grievance submitted successfully!',
      grievance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/grievances/:id — Update grievance (admin/officer)
router.put('/:id', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ grievanceId: req.params.id });
    if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });

    const { status, priority, assignedOfficer, department } = req.body;

    // Track status change in timeline
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
    if (department) grievance.department = department;

    // Track officer assignment in timeline
    if (assignedOfficer && String(assignedOfficer) !== String(grievance.assignedOfficer)) {
      grievance.timeline.push({
        action: 'Officer assigned',
        description: 'Grievance assigned to officer',
        performedBy: req.user._id,
        timestamp: new Date()
      });
      grievance.assignedOfficer = assignedOfficer;
    }

    await grievance.save();
    res.json({ message: 'Grievance updated.', grievance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grievances/:id/comments — Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ grievanceId: req.params.id });
    if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });

    const { text, isInternal } = req.body;

    grievance.comments.push({
      author: req.user._id,
      text,
      isInternal: isInternal || false,
      createdAt: new Date()
    });

    await grievance.save();
    res.status(201).json({ message: 'Comment added.', grievance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/grievances/:id — Delete grievance (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete grievances.' });
    }

    const grievance = await Grievance.findOneAndDelete({ grievanceId: req.params.id });
    if (!grievance) return res.status(404).json({ error: 'Grievance not found.' });

    res.json({ message: 'Grievance deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
