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

  // 1. Demo Steward — engineering student who lists equipment
  const elena = await User.create({
    name: 'Ananya Kulkarni',
    email: 'elena.rostova@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Electronics & Mechatronics Lab',
    campusId: 'MIT-ENG-8492',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Final year Electronics student specialising in embedded systems and IoT at MIT-WPU.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 14,
    totalReviews: 8,
    averageRating: 4.9,
  });

  // 2. Demo Borrower — CS student who borrows equipment
  const marcus = await User.create({
    name: 'Rohan Deshmukh',
    email: 'marcus.vance@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Engineering',
    campusId: 'MIT-CS-9104',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Third year CS student working on autonomous navigation and ML projects.',
    isVerified: true,
    trustScore: 4.8,
    totalCompletedLoans: 6,
    totalReviews: 4,
    averageRating: 4.8,
  });

  // 3. Demo Faculty
  const drChen = await User.create({
    name: 'Dr. Priya Joshi',
    email: 'dr.chen@campus.edu',
    password: 'Password123!',
    role: 'faculty',
    department: 'Applied Sciences & Chemistry',
    campusId: 'MIT-FAC-4011',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Faculty advisor for undergraduate biochemistry and materials science laboratory research at MIT-WPU.',
    isVerified: true,
    trustScore: 5.0,
    totalCompletedLoans: 22,
    totalReviews: 12,
    averageRating: 5.0,
  });

  // 4. Demo Club Coordinator
  const club = await User.create({
    name: 'MIT-WPU Robotics Club',
    email: 'robotics.club@campus.edu',
    password: 'Password123!',
    role: 'club_coordinator',
    department: 'Mechanical & Robotics Eng',
    campusId: 'MIT-CLUB-0042',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Shared robotics and rapid prototyping resource pool for all MIT-WPU campus makers.',
    isVerified: true,
    trustScore: 4.9,
    totalCompletedLoans: 35,
    totalReviews: 19,
    averageRating: 4.9,
  });

  // 5. Admin
  const admin = await User.create({
    name: 'MIT-WPU System Administrator',
    email: 'admin@campus.edu',
    password: 'AdminPass123!',
    role: 'admin',
    department: 'Campus IT & Resource Services',
    campusId: 'MIT-ADMIN-001',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Overseeing MIT-WPU institutional resource sharing safety and compliance.',
    isVerified: true,
    trustScore: 5.0,
  });

  // 6. Demo Unverified Student (WB-01)
  const unverified = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Civil Engineering',
    campusId: 'MIT-CE-1002',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'First year engineering student pending institutional verification.',
    isVerified: false,
    trustScore: 5.0,
  });

  // 7. Demo Student with Max (3) Active Borrowings (WB-03)
  const maxBorrower = await User.create({
    name: 'Aditya Patil',
    email: 'aditya.patil@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Mechanical Engineering',
    campusId: 'MIT-ME-3031',
    avatarUrl: '/avatar-placeholder.svg',
    bio: 'Mechanical engineering researcher working on multi-stage robotics prototyping.',
    isVerified: true,
    trustScore: 4.8,
    totalCompletedLoans: 9,
    totalReviews: 5,
    averageRating: 4.8,
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
    images: ['/resource-placeholder.svg'],
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
    images: ['/resource-placeholder.svg'],
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
    status: 'borrowed',
    images: ['/resource-placeholder.svg'],
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
    images: ['/resource-placeholder.svg'],
    specifications: [
      { label: 'Screen', value: '3.2 inch Backlit Color 320x240' },
      { label: 'CAS Engine', value: 'Symbolic Algebra & Calculus' },
    ],
  });

  // Resource stewarded by Ananya with an ACTIVE PENDING REQUEST (WB-04)
  const r5 = await Resource.create({
    title: 'Arduino Mega 2560 R3 Advanced Sensor & Actuator Kit (65 Modules)',
    description:
      'Complete microcontroller experimentation set including ultrasonic distance sensors, servo motors, stepper drivers, relay boards, OLED displays, and jumper bundle. Perfect for MIT-WPU Robotics Club projects and B.Tech project prototyping.',
    category: 'project_kits',
    identifiers: 'Kit #ROB-K21',
    condition: 'good',
    department: 'Electronics & Mechatronics Lab',
    location: 'MIT-WPU MakerSpace • Workbench Locker 5',
    maxLoanDurationDays: 14,
    steward: elena._id,
    status: 'requested',
    images: ['/resource-placeholder.svg'],
    specifications: [
      { label: 'Microcontroller', value: 'ATmega2560 (16MHz, 256KB Flash)' },
      { label: 'Digital I/O', value: '54 Pins (15 PWM outputs)' },
    ],
  });

  // Resource stewarded by Ananya with NO ACTIVE REQUESTS (BB-05)
  const r6 = await Resource.create({
    title: 'Mitutoyo 500-196-30 Advanced Digital Vernier Caliper (0-6" / 0.01mm)',
    description:
      'High-precision AOS electromagnetic induction sensor vernier caliper for CNC machining, 3D printing tolerance checks, and physical prototype verification. Used in MIT-WPU Precision Manufacturing Lab.',
    category: 'lab_gear',
    identifiers: 'Tool Tag #MECH-109',
    condition: 'like_new',
    department: 'Electronics & Mechatronics Lab',
    location: 'MIT-WPU Precision Lab • Tool Room A',
    maxLoanDurationDays: 5,
    steward: elena._id,
    status: 'available',
    images: ['/resource-placeholder.svg'],
  });

  // Active pending request on r5 (blocks Ananya from withdrawing r5) -> WB-04
  await BorrowRequest.create({
    resource: r5._id,
    borrower: marcus._id,
    steward: elena._id,
    startDate: new Date(Date.now() + 24 * 3600 * 1000),
    endDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
    durationDays: 5,
    purpose: 'Senior capstone IoT sensor integration testing.',
    status: 'pending',
  });

  // Active borrowed item for Rohan (marcus) stewarded by Robotics Club -> WB-05
  await BorrowRequest.create({
    resource: r3._id,
    borrower: marcus._id,
    steward: club._id,
    startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    durationDays: 4,
    purpose: 'Campus documentary recording',
    status: 'borrowed',
    approvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    borrowedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  });

  // 3 Active Borrowings for Aditya Patil -> WB-03
  for (let i = 1; i <= 3; i++) {
    const quotaRes = await Resource.create({
      title: `Lab Prototyping Module #${i} (Active Custody)`,
      description: `Modular testing apparatus currently checked out by student researcher.`,
      category: 'project_kits',
      identifiers: `TOOL-MOD-00${i}`,
      condition: 'good',
      department: 'Mechanical & Robotics Eng',
      location: 'MIT-WPU MakerSpace • Storage C',
      maxLoanDurationDays: 14,
      steward: club._id,
      status: 'borrowed',
      images: ['/resource-placeholder.svg'],
    });

    await BorrowRequest.create({
      resource: quotaRes._id,
      borrower: maxBorrower._id,
      steward: club._id,
      startDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      durationDays: 10,
      purpose: 'Robotics lab testing',
      status: 'borrowed',
      approvedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      borrowedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    });
  }

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
