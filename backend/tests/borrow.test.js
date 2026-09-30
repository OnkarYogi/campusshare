const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Resource = require('../src/models/Resource');
const BorrowRequest = require('../src/models/BorrowRequest');
require('./setup');

describe('Borrowing Workflow Engine (SRS 4.4 & Business Rules 5.5)', () => {
  let stewardUser, borrowerUser;
  let stewardToken, borrowerToken;
  let testResource;

  beforeEach(async () => {
    stewardUser = await User.create({
      name: 'Elena Rostova',
      email: 'elena@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
    });

    borrowerUser = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
    });

    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'elena@campus.edu',
      password: 'Password123!',
    });
    stewardToken = sLogin.body.token;

    const bLogin = await request(app).post('/api/auth/login').send({
      email: 'marcus@campus.edu',
      password: 'Password123!',
    });
    borrowerToken = bLogin.body.token;

    testResource = await Resource.create({
      title: 'Rigol DS1054Z 50MHz Oscilloscope',
      description: 'Lab gear with 4 probes.',
      category: 'electronics',
      condition: 'like_new',
      department: 'Robotics',
      location: 'Makerspace Lab 102',
      maxLoanDurationDays: 14,
      steward: stewardUser._id,
      status: 'available',
    });
  });

  it('SRS 5.5: Should prevent user from borrowing their own resource', async () => {
    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        purpose: 'Attempting to self-borrow',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('cannot borrow your own resource');
  });

  it('SRS 5.5: Should prevent unverified users from borrowing resources', async () => {
    const unverifiedUser = await User.create({
      name: 'Unverified Student',
      email: 'unverified@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: false,
    });

    const unverifiedLogin = await request(app).post('/api/auth/login').send({
      email: 'unverified@campus.edu',
      password: 'Password123!',
    });
    const unverifiedToken = unverifiedLogin.body.token;

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        purpose: 'Attempting to borrow without verification',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Institutional verification required');
  });

  it('FR-15: Should allow borrower to submit a borrow request and update resource state', async () => {
    const start = new Date();
    const end = new Date(Date.now() + 5 * 24 * 3600 * 1000);

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Circuit debugging for Senior Capstone Project',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.borrowRequest.status).toBe('pending');

    const updatedRes = await Resource.findById(testResource._id);
    expect(updatedRes.status).toBe('requested');
  });

  it('SRS 5.5: Should enforce maximum 3 active borrowings quota', async () => {
    // Create 3 active borrowings for borrowerUser
    for (let i = 0; i < 3; i++) {
      const extraRes = await Resource.create({
        title: `Extra Item ${i}`,
        description: 'Test gear',
        category: 'electronics',
        condition: 'good',
        department: 'CS',
        location: 'Hall',
        maxLoanDurationDays: 14,
        steward: stewardUser._id,
      });

      await BorrowRequest.create({
        resource: extraRes._id,
        borrower: borrowerUser._id,
        steward: stewardUser._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        durationDays: 4,
        purpose: 'Research',
        status: 'borrowed', // Active
      });
    }

    // Try to request a 4th item
    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        purpose: 'Exceeding quota attempt',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Maximum limit of 3 active borrowings reached');
  });

  it('FR-16 to FR-19: Complete Lifecycle (Request -> Approve -> Collect -> Return)', async () => {
    // 1. Submit Request
    const createRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        purpose: 'Capstone presentation',
      });
    const requestId = createRes.body.borrowRequest._id;

    // 2. Approve Request by Steward
    const approveRes = await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.request.status).toBe('approved');

    // 3. Mark Collected / Borrowed
    const collectRes = await request(app)
      .patch(`/api/borrow/${requestId}/collect`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ handoverNotes: 'Handed over with 4 probes and carrying bag.' });
    expect(collectRes.status).toBe(200);
    expect(collectRes.body.request.status).toBe('borrowed');

    const resWhileBorrowed = await Resource.findById(testResource._id);
    expect(resWhileBorrowed.status).toBe('borrowed');

    // 4. Non-owner cannot confirm return (SRS 5.5)
    const unauthorizedReturn = await request(app)
      .patch(`/api/borrow/${requestId}/return`)
      .set('Authorization', `Bearer ${borrowerToken}`);
    expect(unauthorizedReturn.status).toBe(403);
    expect(unauthorizedReturn.body.message).toContain('Only the resource steward may confirm a return');

    // 5. Steward confirms return
    const returnRes = await request(app)
      .patch(`/api/borrow/${requestId}/return`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ returnNotes: 'Returned in pristine condition with all cables.' });
    expect(returnRes.status).toBe(200);
    expect(returnRes.body.request.status).toBe('returned');

    // Resource should automatically be available again
    const finalRes = await Resource.findById(testResource._id);
    expect(finalRes.status).toBe('available');
  });

  it('SRS 4.4 & 5.5: Multiple requests on same resource — approving one auto-rejects competing requests, marks resource checked out, and prevents subsequent approval', async () => {
    // Register second borrower (User C)
    const borrower2 = await User.create({
      name: 'Ananya Kulkarni',
      email: 'ananya@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
    });

    const b2Login = await request(app).post('/api/auth/login').send({
      email: 'ananya@campus.edu',
      password: 'Password123!',
    });
    const borrower2Token = b2Login.body.token;

    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(Date.now() + 5 * 24 * 3600 * 1000);

    // 1. Borrower 1 (User B) submits request A
    const reqA = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Robotics sensor calibration',
      });
    expect(reqA.status).toBe(201);
    expect(reqA.body.borrowRequest.status).toBe('pending');
    const requestAId = reqA.body.borrowRequest._id;

    // 2. Borrower 2 (User C) submits request B on same resource
    const reqB = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrower2Token}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Microcontroller lab assignment',
      });
    expect(reqB.status).toBe(201);
    expect(reqB.body.borrowRequest.status).toBe('pending');
    const requestBId = reqB.body.borrowRequest._id;

    // Verify both requests are pending in database
    const reqADoc = await BorrowRequest.findById(requestAId);
    const reqBDoc = await BorrowRequest.findById(requestBId);
    expect(reqADoc.status).toBe('pending');
    expect(reqBDoc.status).toBe('pending');

    // 3. Steward approves Request A
    const approveA = await request(app)
      .patch(`/api/borrow/${requestAId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(approveA.status).toBe(200);
    expect(approveA.body.request.status).toBe('approved');

    // 4. Verify resource immediately became 'borrowed' (checked out)
    const resourceAfterApproval = await Resource.findById(testResource._id);
    expect(resourceAfterApproval.status).toBe('borrowed');

    // 5. Verify Request B was automatically rejected and preserved in database
    const reqBAfter = await BorrowRequest.findById(requestBId);
    expect(reqBAfter.status).toBe('rejected');
    expect(reqBAfter.rejectionReason).toContain('Another request was approved');

    // 6. Attempt to approve Request B afterward must be rejected by backend
    const approveB = await request(app)
      .patch(`/api/borrow/${requestBId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(approveB.status).toBe(400);
    expect(approveB.body.message).toContain('Cannot approve request with current status: rejected');

    // 7. Attempt to create a NEW borrow request for the checked-out resource must be rejected
    const newReqOnBorrowed = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Late request attempt',
      });
    expect(newReqOnBorrowed.status).toBe(400);
    expect(newReqOnBorrowed.body.message).toContain('currently checked out and unavailable');

    // 8. Public catalog: resource must NOT appear in "availableNow" search
    const availableRes = await request(app)
      .get('/api/resources')
      .query({ availableNow: 'true' });
    const availableIds = availableRes.body.resources.map((r) => r._id.toString());
    expect(availableIds).not.toContain(testResource._id.toString());

    // 9. Return the resource: steward collects and confirms return
    await request(app)
      .patch(`/api/borrow/${requestAId}/collect`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ handoverNotes: 'Handed over' });

    const returnRes = await request(app)
      .patch(`/api/borrow/${requestAId}/return`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ returnNotes: 'All items returned intact' });
    expect(returnRes.status).toBe(200);

    // 10. Verify resource is available again and can be requested
    const resourceAfterReturn = await Resource.findById(testResource._id);
    expect(resourceAfterReturn.status).toBe('available');

    const newReqAfterReturn = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrower2Token}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Requesting now that resource is returned and available',
      });
    expect(newReqAfterReturn.status).toBe(201);
    expect(newReqAfterReturn.body.borrowRequest.status).toBe('pending');
  });

  it('SRS 5.5: Concurrent approval race-condition guard prevents duplicate borrower assignment', async () => {
    // Create pending request
    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(Date.now() + 5 * 24 * 3600 * 1000);

    const reqRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Concurrency test request',
      });
    const requestId = reqRes.body.borrowRequest._id;

    // Simulate another concurrent process just set the resource status to 'borrowed'
    await Resource.findByIdAndUpdate(testResource._id, { status: 'borrowed' });

    // Attempt approval when resource status is already 'borrowed'
    const approveRes = await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);

    // Must return 409 Conflict preventing double-approval
    expect(approveRes.status).toBe(409);
    expect(approveRes.body.success).toBe(false);
    expect(approveRes.body.message).toContain('Resource was just approved for another borrower');
  });
});
