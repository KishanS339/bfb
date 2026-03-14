const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Road Damage', 'Water Supply', 'Garbage', 'Street Light', 'Drainage', 'Tree Fall', 'Encroachment', 'Noise', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    default: 'Open'
  },
  location: {
    address: { type: String, required: true },
    ward: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    default: ''
  },
  photos: [{
    type: String  // file paths
  }],
  timeline: [{
    action: { type: String, required: true },
    description: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  sla: {
    deadline: { type: Date },
    breached: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Auto-generate grievance ID before saving
grievanceSchema.pre('save', async function (next) {
  if (!this.grievanceId) {
    const count = await mongoose.model('Grievance').countDocuments();
    this.grievanceId = `GRV-${String(2000 + count + 1).padStart(4, '0')}`;
  }

  // Auto-set SLA deadline (5 days from creation)
  if (!this.sla.deadline) {
    this.sla.deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  }

  // Auto-assign department based on category
  if (!this.department) {
    const deptMap = {
      'Road Damage': 'Road Infrastructure',
      'Water Supply': 'Water & Sanitation',
      'Garbage': 'Waste Management',
      'Street Light': 'Electrical',
      'Drainage': 'Water & Sanitation',
      'Tree Fall': 'Parks & Gardens',
      'Encroachment': 'Town Planning',
      'Noise': 'Environmental',
      'Other': 'General'
    };
    this.department = deptMap[this.category] || 'General';
  }

  // Add timeline entry on creation
  if (this.isNew) {
    this.timeline.push({
      action: 'Grievance Submitted',
      description: 'Grievance filed by citizen',
      performedBy: this.citizen,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);
