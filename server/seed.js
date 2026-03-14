const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Grievance = require('./models/Grievance');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nagaraseva';

const sampleUsers = [
  { name: 'Akarsh S', email: 'akarsh@example.com', password: 'password123', phone: '+91 98765 43210', role: 'citizen' },
  { name: 'Priya Nair', email: 'priya@example.com', password: 'password123', phone: '+91 98765 43211', role: 'citizen' },
  { name: 'Ravi Kumar', email: 'ravi@example.com', password: 'password123', phone: '+91 98765 43212', role: 'citizen' },
  { name: 'Meena Reddy', email: 'meena@example.com', password: 'password123', phone: '+91 98765 43213', role: 'citizen' },
  { name: 'Ramesh Kumar', email: 'ramesh@bbmp.gov.in', password: 'admin123', phone: '+91 98765 00001', role: 'officer', department: 'Road Infrastructure' },
  { name: 'Suresh M', email: 'suresh@bbmp.gov.in', password: 'admin123', phone: '+91 98765 00002', role: 'officer', department: 'Water & Sanitation' },
  { name: 'Kumar P', email: 'kumarp@bbmp.gov.in', password: 'admin123', phone: '+91 98765 00003', role: 'officer', department: 'Electrical' },
  { name: 'Priya S', email: 'priyas@bbmp.gov.in', password: 'admin123', phone: '+91 98765 00004', role: 'officer', department: 'Waste Management' },
  { name: 'Admin Officer', email: 'admin@bbmp.gov.in', password: 'admin123', phone: '+91 98765 00000', role: 'admin', department: 'BBMP HQ' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Grievance.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);

    const citizens = users.filter(u => u.role === 'citizen');
    const officers = users.filter(u => u.role === 'officer');

    // Create grievances
    const grievances = [
      {
        grievanceId: 'GRV-2041',
        title: 'Pothole on MG Road near Trinity Circle',
        description: 'There is a large pothole approximately 2 feet wide and 8 inches deep on MG Road, near the Trinity Circle junction. Extremely dangerous for two-wheelers.',
        category: 'Road Damage',
        priority: 'High',
        status: 'In Progress',
        location: { address: 'MG Road, near Trinity Circle', ward: 'Ward 113' },
        citizen: citizens[0]._id,
        assignedOfficer: officers[0]._id,
        department: 'Road Infrastructure',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen with 3 photos', performedBy: citizens[0]._id, timestamp: new Date('2026-03-10T11:00:00') },
          { action: 'AI Categorized', description: 'Auto-categorized as Road Damage, High priority', performedBy: citizens[0]._id, timestamp: new Date('2026-03-10T11:02:00') },
          { action: 'Status changed to In Progress', description: 'BBMP acknowledged', performedBy: officers[0]._id, timestamp: new Date('2026-03-10T12:15:00') },
          { action: 'Officer assigned', description: 'Assigned to Ramesh Kumar, Sr. Engineer', performedBy: officers[0]._id, timestamp: new Date('2026-03-11T08:45:00') },
          { action: 'Repair crew dispatched', description: 'Road maintenance team dispatched', performedBy: officers[0]._id, timestamp: new Date('2026-03-12T05:00:00') }
        ],
        comments: [
          { author: officers[0]._id, text: 'Repair crew has been dispatched. We will complete the work by tomorrow evening.', createdAt: new Date('2026-03-12T05:00:00') },
          { author: citizens[0]._id, text: 'Thank you for the quick response. The pothole seems to have gotten bigger due to rain.', createdAt: new Date('2026-03-11T12:30:00') }
        ],
        sla: { deadline: new Date('2026-03-15T11:00:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2040',
        title: 'Sewage overflow near 80 Feet Road',
        description: 'Sewage has been overflowing from the main drain near 80 Feet Road for the past 2 days. Causing health hazards and foul smell throughout the area.',
        category: 'Drainage',
        priority: 'High',
        status: 'Open',
        location: { address: '80 Feet Road, Koramangala', ward: 'Ward 150' },
        citizen: citizens[1]._id,
        department: 'Water & Sanitation',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen', performedBy: citizens[1]._id, timestamp: new Date('2026-03-10T09:30:00') }
        ],
        sla: { deadline: new Date('2026-03-15T09:30:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2039',
        title: 'Garbage bin overflowing at Sector 5',
        description: 'The garbage bin near Sector 5 main junction has not been emptied for a week. Stray dogs are spreading the waste.',
        category: 'Garbage',
        priority: 'Medium',
        status: 'Open',
        location: { address: 'Sector 5, HSR Layout', ward: 'Ward 174' },
        citizen: citizens[2]._id,
        department: 'Waste Management',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen', performedBy: citizens[2]._id, timestamp: new Date('2026-03-09T14:00:00') }
        ],
        sla: { deadline: new Date('2026-03-14T14:00:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2038',
        title: 'No water supply for 3 days',
        description: 'Our area has had no water supply for 3 consecutive days. Multiple families are affected, and the situation is getting critical.',
        category: 'Water Supply',
        priority: 'High',
        status: 'Escalated',
        location: { address: 'Koramangala 4th Block', ward: 'Ward 150' },
        citizen: citizens[3]._id,
        assignedOfficer: officers[1]._id,
        department: 'Water & Sanitation',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen', performedBy: citizens[3]._id, timestamp: new Date('2026-03-08T08:00:00') },
          { action: 'Status changed to In Progress', description: 'Acknowledged', performedBy: officers[1]._id, timestamp: new Date('2026-03-08T10:00:00') },
          { action: 'Escalated', description: 'No resolution in 3 days, escalated', performedBy: citizens[3]._id, timestamp: new Date('2026-03-11T08:00:00') }
        ],
        sla: { deadline: new Date('2026-03-13T08:00:00'), breached: true }
      },
      {
        grievanceId: 'GRV-2037',
        title: 'Street light not working at 3rd Cross',
        description: 'The street light at 3rd Cross, Rajajinagar has been non-functional for 2 weeks. The area is very dark at night.',
        category: 'Street Light',
        priority: 'Low',
        status: 'In Progress',
        location: { address: '3rd Cross, Rajajinagar', ward: 'Ward 96' },
        citizen: citizens[0]._id,
        assignedOfficer: officers[2]._id,
        department: 'Electrical',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen', performedBy: citizens[0]._id, timestamp: new Date('2026-03-08T16:00:00') },
          { action: 'Officer assigned', description: 'Assigned to Kumar P', performedBy: officers[2]._id, timestamp: new Date('2026-03-09T10:00:00') }
        ],
        sla: { deadline: new Date('2026-03-13T16:00:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2036',
        title: 'Tree fallen on footpath after storm',
        description: 'A large tree has fallen on the footpath near Malleshwaram Circle after last night\'s storm. Blocking pedestrian movement.',
        category: 'Tree Fall',
        priority: 'Medium',
        status: 'Resolved',
        location: { address: 'Malleshwaram Circle', ward: 'Ward 85' },
        citizen: citizens[1]._id,
        assignedOfficer: officers[0]._id,
        department: 'Parks & Gardens',
        timeline: [
          { action: 'Grievance Submitted', description: 'Filed by citizen', performedBy: citizens[1]._id, timestamp: new Date('2026-03-07T07:00:00') },
          { action: 'Officer assigned', description: 'Assigned', performedBy: officers[0]._id, timestamp: new Date('2026-03-07T09:00:00') },
          { action: 'Status changed to Resolved', description: 'Tree cleared', performedBy: officers[0]._id, timestamp: new Date('2026-03-07T15:00:00') }
        ],
        sla: { deadline: new Date('2026-03-12T07:00:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2035',
        title: 'Garbage not collected for a week',
        description: 'Garbage has not been collected in our area for the past week. The bins are overflowing and the street smells terrible.',
        category: 'Garbage',
        priority: 'Medium',
        status: 'Resolved',
        location: { address: '2nd Main, HSR Layout', ward: 'Ward 174' },
        citizen: citizens[2]._id,
        assignedOfficer: officers[3]._id,
        department: 'Waste Management',
        timeline: [
          { action: 'Grievance Submitted', performedBy: citizens[2]._id, timestamp: new Date('2026-03-06T10:00:00') },
          { action: 'Status changed to Resolved', description: 'Garbage cleared', performedBy: officers[3]._id, timestamp: new Date('2026-03-07T14:00:00') }
        ],
        sla: { deadline: new Date('2026-03-11T10:00:00'), breached: false }
      },
      {
        grievanceId: 'GRV-2034',
        title: 'Open manhole cover on 1st Main Road',
        description: 'Manhole cover is missing on 1st Main Road in Malleshwaram. Very dangerous, especially at night. A child nearly fell in yesterday.',
        category: 'Drainage',
        priority: 'High',
        status: 'Open',
        location: { address: '1st Main Road, Malleshwaram', ward: 'Ward 85' },
        citizen: citizens[3]._id,
        department: 'Water & Sanitation',
        timeline: [
          { action: 'Grievance Submitted', performedBy: citizens[3]._id, timestamp: new Date('2026-03-05T12:00:00') }
        ],
        sla: { deadline: new Date('2026-03-10T12:00:00'), breached: true }
      },
      {
        grievanceId: 'GRV-2033',
        title: 'Road cave-in near Whitefield bus stop',
        description: 'A section of road has caved in near the Whitefield bus stop, creating a dangerous 3-foot deep hole in the middle of the lane.',
        category: 'Road Damage',
        priority: 'High',
        status: 'In Progress',
        location: { address: 'Whitefield Bus Stop', ward: 'Ward 194' },
        citizen: citizens[0]._id,
        assignedOfficer: officers[0]._id,
        department: 'Road Infrastructure',
        timeline: [
          { action: 'Grievance Submitted', performedBy: citizens[0]._id, timestamp: new Date('2026-03-04T09:00:00') },
          { action: 'Officer assigned', performedBy: officers[0]._id, timestamp: new Date('2026-03-04T11:00:00') }
        ],
        sla: { deadline: new Date('2026-03-09T09:00:00'), breached: true }
      },
      {
        grievanceId: 'GRV-2032',
        title: 'Water pipeline burst on 5th Cross',
        description: 'Water pipeline has burst at 5th Cross, Indiranagar causing massive water wastage and road flooding.',
        category: 'Water Supply',
        priority: 'High',
        status: 'Resolved',
        location: { address: '5th Cross, Indiranagar', ward: 'Ward 120' },
        citizen: citizens[1]._id,
        assignedOfficer: officers[1]._id,
        department: 'Water & Sanitation',
        timeline: [
          { action: 'Grievance Submitted', performedBy: citizens[1]._id, timestamp: new Date('2026-03-03T07:30:00') },
          { action: 'Status changed to Resolved', performedBy: officers[1]._id, timestamp: new Date('2026-03-03T16:00:00') }
        ],
        sla: { deadline: new Date('2026-03-08T07:30:00'), breached: false }
      }
    ];

    // Insert grievances directly (skip pre-save hook for seeding)
    for (const g of grievances) {
      await Grievance.create(g);
    }
    console.log(`Created ${grievances.length} grievances`);

    console.log('');
    console.log('  ✅ Database seeded successfully!');
    console.log('');
    console.log('  Login credentials:');
    console.log('  ─────────────────────────────────────');
    console.log('  Citizen:  akarsh@example.com / password123');
    console.log('  Officer:  ramesh@bbmp.gov.in / admin123');
    console.log('  Admin:    admin@bbmp.gov.in  / admin123');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
