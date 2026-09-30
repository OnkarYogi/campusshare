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

  // Demo Steward — engineering student who lists equipment
  const elena = await User.create({
    name: 'Ananya Kulkarni',
    email: 'elena.rostova@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Electronics & Mechatronics Lab',
    campusId: 'MIT-ENG-8492',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Final year Electronics student specialising in embedded systems and IoT at MIT-WPU.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 14,
    totalReviews: 8,
    averageRating: 4.9,
  });

  // Demo Borrower — CS student who borrows equipment
  const marcus = await User.create({
    name: 'Rohan Deshmukh',
    email: 'marcus.vance@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Engineering',
    campusId: 'MIT-CS-9104',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Third year CS student working on autonomous navigation and ML projects.',
    isVerified: true,
    trustScore: 4.8,
    totalCompletedLoans: 6,
    totalReviews: 4,
    averageRating: 4.8,
  });

  // Demo Faculty
  const drChen = await User.create({
    name: 'Dr. Priya Joshi',
    email: 'dr.chen@campus.edu',
    password: 'Password123!',
    role: 'faculty',
    department: 'Applied Sciences & Chemistry',
    campusId: 'MIT-FAC-4011',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Faculty advisor for undergraduate biochemistry and materials science laboratory research at MIT-WPU.',
    isVerified: true,
    trustScore: 5.0,
    totalCompletedLoans: 22,
    totalReviews: 12,
    averageRating: 5.0,
  });

  // Demo Club Coordinator
  const club = await User.create({
    name: 'MIT-WPU Robotics Club',
    email: 'robotics.club@campus.edu',
    password: 'Password123!',
    role: 'club_coordinator',
    department: 'Mechanical & Robotics Eng',
    campusId: 'MIT-CLUB-0042',
    avatarUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
    bio: 'Shared robotics and rapid prototyping resource pool for all MIT-WPU campus makers.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 35,
    totalReviews: 19,
    averageRating: 4.9,
  });

  // Admin
  const admin = await User.create({
    name: 'MIT-WPU System Administrator',
    email: 'admin@campus.edu',
    password: 'AdminPass123!',
    role: 'admin',
    department: 'Campus IT & Resource Services',
    campusId: 'MIT-ADMIN-001',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Overseeing MIT-WPU institutional resource sharing safety and compliance.',
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
    department: 'Electronics & Mechatronics Lab',
    location: 'MIT-WPU MakerSpace • Lab Wing B, Room 204',
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
    title: 'Atkins Physical Chemistry 11th Edition (International Edition)',
    description:
      'Comprehensive physical chemistry curriculum textbook covering quantum mechanics, thermodynamics, and spectroscopy. Pristine condition with zero highlighting. Ideal for B.Tech Chemistry and Applied Sciences coursework.',
    category: 'textbooks',
    identifiers: 'ISBN 978-0198769866',
    condition: 'like_new',
    department: 'Applied Sciences & Chemistry',
    location: 'MIT-WPU Central Library • Reserve Desk, Floor 2',
    maxLoanDurationDays: 14,
    steward: drChen._id,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Edition', value: '11th International Edition' },
      { label: 'Publisher', value: 'Oxford University Press' },
      { label: 'Pages', value: '1008 Pages' },
    ],
  });

  const r3 = await Resource.create({
    title: 'Sony Alpha 7 IV Mirrorless 4K Camera + FE 28-70mm OSS Lens Kit',
    description:
      '33MP full-frame hybrid production camera for documentary filmmaking, departmental research capture, and student portfolio recording. Includes 2 high-capacity batteries and 128GB V90 SD card. Available for MIT-WPU Media Cell projects.',
    category: 'electronics',
    identifiers: 'Tag #MED-2044',
    condition: 'like_new',
    department: 'Media & Communication',
    location: 'MIT-WPU Media Lab • Equipment Cage, Room 12',
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
      'Computer Algebra System calculator authorized for B.Tech Mathematics, Linear Algebra, and Engineering Thermodynamics coursework at MIT-WPU. Preloaded with institutional math packages.',
    category: 'electronics',
    identifiers: 'Serial #NSP-6021',
    condition: 'good',
    department: 'Computer Engineering',
    location: 'MIT-WPU Science Block • Room 301, Study Commons',
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
      'Complete microcontroller experimentation set including ultrasonic distance sensors, servo motors, stepper drivers, relay boards, OLED displays, and jumper bundle. Perfect for MIT-WPU Robotics Club projects and B.Tech project prototyping.',
    category: 'project_kits',
    identifiers: 'Kit #ROB-K21',
    condition: 'good',
    department: 'Mechanical & Robotics Eng',
    location: 'MIT-WPU MakerSpace • Workbench Locker 5',
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
      'High-precision AOS electromagnetic induction sensor vernier caliper for CNC machining, 3D printing tolerance checks, and physical prototype verification. Used in MIT-WPU Precision Manufacturing Lab.',
    category: 'lab_gear',
    identifiers: 'Tool Tag #MECH-109',
    condition: 'like_new',
    department: 'Mechanical & Robotics Eng',
    location: 'MIT-WPU Precision Lab • Tool Room A',
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
    purpose: 'Senior capstone frequency response measurements for IoT gateway project.',
    status: 'returned',
    approvedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    borrowedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    returnedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    handoverNotes: 'Inspected 4 probes in presence of borrower at MIT-WPU MakerSpace.',
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
      'Ananya was great to coordinate with! The Rigol oscilloscope was in top shape with all probes neatly organized. Highly recommend borrowing from her.',
  });

  await Rating.create({
    transaction: completedReq._id,
    resource: r1._id,
    rater: elena._id,
    ratee: marcus._id,
    role: 'steward_to_borrower',
    rating: 5,
    reviewText:
      'Rohan returned the oscilloscope right on time and in perfect working order. Great MIT-WPU campus borrower!',
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
