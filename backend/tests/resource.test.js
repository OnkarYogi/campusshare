const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Resource = require('../src/models/Resource');
const BorrowRequest = require('../src/models/BorrowRequest');
require('./setup');

describe('Resource Management API (SRS 4.3)', () => {
  let stewardToken;
  let stewardUser;
  let otherToken;
  let otherUser;

  beforeEach(async () => {
    stewardUser = await User.create({
      name: 'Dr. Evelyn Chen',
      email: 'chen@campus.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Robotics & Mechatronics Lab',
      isVerified: true,
    });

    otherUser = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science',
      isVerified: true,
    });

    const stewardLogin = await request(app).post('/api/auth/login').send({
      email: 'chen@campus.edu',
      password: 'Password123!',
    });
    stewardToken = stewardLogin.body.token;

    const otherLogin = await request(app).post('/api/auth/login').send({
      email: 'marcus@campus.edu',
      password: 'Password123!',
    });
    otherToken = otherLogin.body.token;
  });

  it('FR-09: Should allow verified steward to add a new academic resource', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({
        title: 'Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope',
        description: 'Includes 4 probes and calibration cert for circuit analysis.',
        category: 'electronics',
        identifiers: 'EQ-8842',
        condition: 'like_new',
        department: 'Robotics & Mechatronics Lab',
        location: 'North MakerSpace Station • Room 204',
        maxLoanDurationDays: 7,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.resource.title).toContain('Rigol DS1054Z');
    expect(res.body.resource.status).toBe('available');
    expect(res.body.resource.steward.name).toBe('Dr. Evelyn Chen');
  });

  it('FR-13: Should search and filter resources by category and department', async () => {
    await Resource.create([
      {
        title: 'Campbell Biology 11th Edition',
        description: 'Complete textbook for introductory biology.',
        category: 'textbooks',
        condition: 'good',
        department: 'Biology & Chem',
        location: 'Mudd Library Floor 2',
        maxLoanDurationDays: 14,
        steward: stewardUser._id,
        status: 'available',
      },
      {
        title: 'TI-Nspire CX II CAS Graphing Calculator',
        description: 'Advanced graphing calculator for calculus.',
        category: 'electronics',
        condition: 'like_new',
        department: 'Computer Science',
        location: 'Engineering Hall 101',
        maxLoanDurationDays: 5,
        steward: stewardUser._id,
        status: 'available',
      },
    ]);

    const filterRes = await request(app)
      .get('/api/resources')
      .query({ category: 'textbooks', department: 'Biology' });

    expect(filterRes.status).toBe(200);
    expect(filterRes.body.count).toBe(1);
    expect(filterRes.body.resources[0].title).toBe('Campbell Biology 11th Edition');
  });

  it('FR-10: Should allow steward to update their listing, but forbid unauthorized users', async () => {
    const resource = await Resource.create({
      title: 'Digital Multimeter Fluke 87V',
      description: 'Industrial multimeter.',
      category: 'electronics',
      condition: 'good',
      department: 'Robotics & Mechatronics Lab',
      location: 'Room 204',
      maxLoanDurationDays: 7,
      steward: stewardUser._id,
    });

    // Unauthorized attempt by Marcus
    const forbiddenRes = await request(app)
      .put(`/api/resources/${resource._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ location: 'Marcus Dorm Room' });

    expect(forbiddenRes.status).toBe(403);

    // Authorized update by Dr. Chen
    const successRes = await request(app)
      .put(`/api/resources/${resource._id}`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ location: 'MakerSpace Tool Cabinet B' });

    expect(successRes.status).toBe(200);
    expect(successRes.body.resource.location).toBe('MakerSpace Tool Cabinet B');
  });

  it('FR-11: Should prevent deleting a resource that has active borrow requests (SRS 5.5)', async () => {
    const resource = await Resource.create({
      title: 'Sony Alpha 7 IV Camera Kit',
      description: 'Full frame mirrorless camera with 28-70mm lens.',
      category: 'electronics',
      condition: 'like_new',
      department: 'Film & Media',
      location: 'Media Production Lab Room 12',
      maxLoanDurationDays: 3,
      steward: stewardUser._id,
      status: 'borrowed',
    });

    // Create an active borrow request for this item
    await BorrowRequest.create({
      resource: resource._id,
      borrower: otherUser._id,
      steward: stewardUser._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      durationDays: 3,
      purpose: 'Documentary project filming',
      status: 'borrowed',
    });

    // Attempt deletion
    const delRes = await request(app)
      .delete(`/api/resources/${resource._id}`)
      .set('Authorization', `Bearer ${stewardToken}`);

    expect(delRes.status).toBe(400);
    expect(delRes.body.success).toBe(false);
    expect(delRes.body.message).toContain('Cannot delete, withdraw, or archive resource while there are pending, approved, or active');
  });

  it('FR-11: Should allow steward to successfully withdraw their resource listing when no active requests exist', async () => {
    const resource = await Resource.create({
      title: 'Arduino Mega 2560 Rev3 Microcontroller',
      description: 'Microcontroller board based on the ATmega2560.',
      category: 'project_kits',
      condition: 'good',
      department: 'Robotics & Mechatronics Lab',
      location: 'North MakerSpace Station • Room 204',
      maxLoanDurationDays: 14,
      steward: stewardUser._id,
      status: 'available',
    });

    const res = await request(app)
      .delete(`/api/resources/${resource._id}`)
      .set('Authorization', `Bearer ${stewardToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('safely withdrawn');

    // Verify database state: status changed to 'archived', record preserved
    const updated = await Resource.findById(resource._id);
    expect(updated).not.toBeNull();
    expect(updated.status).toBe('archived');

    // Verify it is excluded from public search and from my-listings
    const catalogRes = await request(app).get('/api/resources');
    const catalogTitles = catalogRes.body.resources.map((r) => r.title);
    expect(catalogTitles).not.toContain('Arduino Mega 2560 Rev3 Microcontroller');

    const myListingsRes = await request(app)
      .get('/api/resources/my-listings')
      .set('Authorization', `Bearer ${stewardToken}`);
    const myListingsTitles = myListingsRes.body.resources.map((r) => r.title);
    expect(myListingsTitles).not.toContain('Arduino Mega 2560 Rev3 Microcontroller');
  });

  it('FR-11: Should forbid unauthorized user from withdrawing another steward resource listing', async () => {
    const resource = await Resource.create({
      title: 'Calculus: Early Transcendentals 8th Ed',
      description: 'James Stewart calculus textbook.',
      category: 'textbooks',
      condition: 'good',
      department: 'Mathematics',
      location: 'Science Library',
      maxLoanDurationDays: 14,
      steward: stewardUser._id,
      status: 'available',
    });

    // Marcus tries to withdraw Dr. Chen's resource
    const res = await request(app)
      .delete(`/api/resources/${resource._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Not authorized to withdraw');

    // Ensure status is unchanged
    const unchanged = await Resource.findById(resource._id);
    expect(unchanged.status).toBe('available');
  });

  it('FR-11: Should support withdrawal via PATCH /api/resources/:id/withdraw', async () => {
    const resource = await Resource.create({
      title: 'Vernier Photogate Sensor Kit',
      description: 'High accuracy photogate for mechanics lab.',
      category: 'lab_gear',
      condition: 'like_new',
      department: 'Robotics & Mechatronics Lab',
      location: 'Physics Lab 3',
      maxLoanDurationDays: 5,
      steward: stewardUser._id,
      status: 'available',
    });

    const res = await request(app)
      .patch(`/api/resources/${resource._id}/withdraw`)
      .set('Authorization', `Bearer ${stewardToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resource.status).toBe('archived');
  });
});
