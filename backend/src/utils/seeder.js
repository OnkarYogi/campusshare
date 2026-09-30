const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Resource = require('../models/Resource');
const BorrowRequest = require('../models/BorrowRequest');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

dotenv.config();

const seedDatabaseInternal = async () => {
  console.log('[Seeder] Cleaning existing database records...');

  await Promise.all([
    User.deleteMany({}),
    Resource.deleteMany({}),
    BorrowRequest.deleteMany({}),
    Rating.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seeder] Creating demo users...');

  const elena = await User.create({
    name: 'Elena Rostova',
    email: 'elena.rostova@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Robotics & Mechatronics Lab',
    campusId: 'ENG-8492',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Senior Engineering Cohort researcher specializing in embedded systems and circuit design.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 14,
    totalReviews: 8,
    averageRating: 4.9,
  });

  const marcus = await User.create({
    name: 'Marcus Vance',
    email: 'marcus.vance@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Science',
    campusId: 'CS-9104',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Junior CS major working on autonomous navigation algorithms.',
    isVerified: true,
    trustScore: 4.8,
    totalCompletedLoans: 6,
    totalReviews: 4,
    averageRating: 4.8,
  });

  const drChen = await User.create({
    name: 'Dr. Evelyn Chen',
    email: 'dr.chen@campus.edu',
    password: 'Password123!',
    role: 'faculty',
    department: 'Biology & Chemistry Dept',
    campusId: 'FAC-4011',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Faculty advisor for undergraduate biochemistry laboratory research.',
    isVerified: true,
    trustScore: 5.0,
    totalCompletedLoans: 22,
    totalReviews: 12,
    averageRating: 5.0,
  });

  const club = await User.create({
    name: 'Campus Robotics Club',
    email: 'robotics.club@campus.edu',
    password: 'Password123!',
    role: 'club_coordinator',
    department: 'Mechanical Eng',
    campusId: 'CLUB-0042',
    avatarUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
    bio: 'Shared robotics and rapid prototyping pool for campus makers.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 35,
    totalReviews: 19,
    averageRating: 4.9,
  });

  const admin = await User.create({
    name: 'Campus System Administrator',
    email: 'admin@campus.edu',
    password: 'AdminPass123!',
    role: 'admin',
    department: 'Campus IT & Resource Services',
    campusId: 'ADMIN-001',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Overseeing institutional resource sharing safety and compliance.',
    isVerified: true,
    trustScore: 5.0,
  });

  console.log('[Seeder] Creating realistic academic resources matching Stitch designs...');

  const r1 = await Resource.create({
    title: 'Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope with 4 Probes & Calibration Cert',
    description:
      'Official departmental equipment available to junior & senior engineering cohorts for circuit debugging, waveform analysis, and senior capstone projects. Includes 4 calibrated 150MHz passive probes, USB interface cable, BNC connectors, and hard transit carrying case.',
    category: 'electronics',
    identifiers: 'Asset #EQ-8842 • Serial #DS1ZA18420041',
    condition: 'like_new',
    department: 'Robotics & Mechatronics Lab',
    location: 'North MakerSpace Station • Room 204',
    maxLoanDurationDays: 7,
    steward: elena._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Bandwidth', value: '50 MHz (4 Analog Channels)' },
      { label: 'Sampling Rate', value: '1 GSa/s Real-time' },
      { label: 'Memory Depth', value: '24 Mpts standard' },
      { label: 'Display', value: '7 inch WVGA Color LCD (800x480)' },
    ],
  });

  const r2 = await Resource.create({
    title: 'Campbell Biology 11th Edition (Hardcover Reference Edition)',
    description:
      'Comprehensive standard biology curriculum textbook containing full-color cellular diagrams, genetics chapters, and biochemical reaction guides. Pristine condition with zero highlighting.',
    category: 'textbooks',
    identifiers: 'ISBN 978-0134093413',
    condition: 'like_new',
    department: 'Biology & Chem',
    location: 'Mudd Library • Reserve Desk Floor 2',
    maxLoanDurationDays: 14,
    steward: drChen._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Edition', value: '11th Global Edition' },
      { label: 'Publisher', value: 'Pearson' },
      { label: 'Pages', value: '1488 Pages' },
    ],
  });

  const r3 = await Resource.create({
    title: 'Sony Alpha 7 IV Mirrorless 4K Camera + FE 28-70mm OSS Lens Kit',
    description:
      '33MP full-frame hybrid production camera for documentary filmmaking, departmental research capture, and student portfolio recording. Includes 2 high-capacity batteries and 128GB V90 SD card.',
    category: 'electronics',
    identifiers: 'Tag #MED-2044',
    condition: 'like_new',
    department: 'Film & Media',
    location: 'Media Arts Center • Equipment Cage Room 12',
    maxLoanDurationDays: 3,
    steward: club._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Sensor', value: '33MP Full-Frame Exmor R CMOS' },
      { label: 'Video', value: '4K 60p 10-Bit 4:2:2 All-Intra' },
      { label: 'Stabilization', value: '5-Axis In-Body Optical' },
    ],
  });

  const r4 = await Resource.create({
    title: 'TI-Nspire CX II CAS Color Graphing Calculator with Rechargeable Battery',
    description:
      'Computer Algebra System calculator authorized for AP Calculus, Linear Algebra, and Engineering Thermodynamics coursework. Preloaded with institutional math packages.',
    category: 'electronics',
    identifiers: 'Serial #NSP-6021',
    condition: 'good',
    department: 'Computer Science',
    location: 'Science Hall 301 • Study Commons',
    maxLoanDurationDays: 10,
    steward: marcus._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Screen', value: '3.2 inch Backlit Color 320x240' },
      { label: 'CAS Engine', value: 'Symbolic Algebra & Calculus' },
    ],
  });

  const r5 = await Resource.create({
    title: 'Arduino Mega 2560 R3 Advanced Sensor & Actuator Kit (65 Modules)',
    description:
      'Complete microcontroller experimentation set including ultrasonic distance sensors, servo motors, stepper drivers, relay boards, OLED displays, and jumper bundle.',
    category: 'project_kits',
    identifiers: 'Kit #ROB-K21',
    condition: 'good',
    department: 'Robotics & Mechatronics Lab',
    location: 'North MakerSpace • Workbench Locker 5',
    maxLoanDurationDays: 14,
    steward: club._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Microcontroller', value: 'ATmega2560 (16MHz, 256KB Flash)' },
      { label: 'Digital I/O', value: '54 Pins (15 PWM outputs)' },
    ],
  });

  const r6 = await Resource.create({
    title: 'Mitutoyo 500-196-30 Advanced Digital Vernier Caliper (0-6" / 0.01mm)',
    description:
      'High-precision AOS electromagnetic induction sensor vernier caliper for CNC machining, 3D printing tolerance checks, and physical prototype verification.',
    category: 'lab_gear',
    identifiers: 'Tool Tag #MECH-109',
    condition: 'like_new',
    department: 'Mechanical Eng',
    location: 'Precision Machine Shop • Tool Room A',
    maxLoanDurationDays: 5,
    steward: elena._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    ],
  });

  console.log('[Seeder] Creating sample completed transactions and reviews...');

  const completedReq = await BorrowRequest.create({
    resource: r1._id,
    borrower: marcus._id,
    steward: elena._id,
    startDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    durationDays: 7,
    purpose: 'Senior capstone frequency response measurements.',
    status: 'returned',
    approvedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    borrowedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    returnedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    handoverNotes: 'Inspected 4 probes in presence of borrower.',
    returnNotes: 'Returned cleanly with all probe clips accounted for.',
    borrowerRated: true,
    stewardRated: true,
  });

  await Rating.create({
    transaction: completedReq._id,
    resource: r1._id,
    rater: marcus._id,
    ratee: elena._id,
    role: 'borrower_to_steward',
    rating: 5,
    reviewText:
      'Elena was awesome to coordinate with! The Rigol oscilloscope was in top shape with all probes neatly organized.',
  });

  await Rating.create({
    transaction: completedReq._id,
    resource: r1._id,
    rater: elena._id,
    ratee: marcus._id,
    role: 'steward_to_borrower',
    rating: 5,
    reviewText:
      'Marcus returned the oscilloscope right on time and in perfect working order. Great campus borrower!',
  });

  console.log('[Seeder] Database populated successfully.');
};

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB()
    .then(seedDatabaseInternal)
    .then(async () => {
      console.log('[Seeder CLI] Finished.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder CLI Error]', err);
      process.exit(1);
    });
}

module.exports = { seedDatabaseInternal };
