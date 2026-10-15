const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Resource = require('../src/models/Resource');
const BorrowRequest = require('../src/models/BorrowRequest');
const Notification = require('../src/models/Notification');
const emailService = require('../src/services/emailService');
require('./setup');

describe('Email Notifications & Transaction Separation Suite', () => {
  let stewardUser, borrowerUser, thirdUser;
  let stewardToken, borrowerToken, thirdToken;
  let testResource;

  beforeEach(async () => {
    emailService.clearSentEmails();
    emailService.resetTransporter();

    // 1. Create realistic campus test users
    stewardUser = await User.create({
      name: 'Ananya Kulkarni',
      email: 'ananya.steward@campus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Electronics & Mechatronics',
      isVerified: true,
    });

    borrowerUser = await User.create({
      name: 'Rohan Deshmukh',
      email: 'rohan.borrower@campus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Engineering',
      isVerified: true,
    });

    thirdUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.student@campus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Civil Engineering',
      isVerified: true,
    });

    // 2. Authenticate and retrieve JWT tokens
    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'ananya.steward@campus.edu',
      password: 'Password123!',
    });
    stewardToken = sLogin.body.token;

    const bLogin = await request(app).post('/api/auth/login').send({
      email: 'rohan.borrower@campus.edu',
      password: 'Password123!',
    });
    borrowerToken = bLogin.body.token;

    const tLogin = await request(app).post('/api/auth/login').send({
      email: 'aarav.student@campus.edu',
      password: 'Password123!',
    });
    thirdToken = tLogin.body.token;

    // 3. Create a test catalog resource
    testResource = await Resource.create({
      title: 'Digital Multimeter & Oscilloscope Kit',
      description: 'Departmental testing gear with calibrated probes.',
      category: 'electronics',
      condition: 'like_new',
      department: 'Electronics',
      location: 'MakerSpace Lab 204',
      maxLoanDurationDays: 14,
      steward: stewardUser._id,
      status: 'available',
    });
  });

  afterEach(() => {
    emailService.resetTransporter();
    emailService.clearSentEmails();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Borrow Request triggers Email to Resource Owner
  // --------------------------------------------------------------------------
  it('1. Eligible borrow request triggers an email to the correct resource owner', async () => {
    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(Date.now() + 5 * 24 * 3600 * 1000);

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Capstone circuit debugging',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify email was dispatched to the steward's verified address
    const sent = emailService.getSentEmails();
    expect(sent.length).toBeGreaterThanOrEqual(1);

    const emailToSteward = sent.find((e) => e.to === 'ananya.steward@campus.edu');
    expect(emailToSteward).toBeDefined();
    expect(emailToSteward.subject).toContain('New Borrow Request');
    expect(emailToSteward.subject).toContain(testResource.title);
    expect(emailToSteward.text).toContain('Rohan Deshmukh');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Approval and Rejection trigger Email to Borrower
  // --------------------------------------------------------------------------
  it('2. Approval and Rejection trigger emails to the borrower', async () => {
    // 2a. Submit a request
    const borrowRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
        purpose: 'Lab assignment project',
      });
    const requestId = borrowRes.body.borrowRequest._id;
    emailService.clearSentEmails();

    // 2b. Approve request by steward
    const approveRes = await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(approveRes.status).toBe(200);

    const approvalEmails = emailService.getSentEmails();
    const emailToBorrower = approvalEmails.find((e) => e.to === 'rohan.borrower@campus.edu');
    expect(emailToBorrower).toBeDefined();
    expect(emailToBorrower.subject).toContain('Request Approved');
    expect(emailToBorrower.subject).toContain(testResource.title);

    // 2c. Test Rejection notification on another resource
    const anotherResource = await Resource.create({
      title: 'Chemistry Glassware Set',
      description: 'Beakers and flasks',
      category: 'lab_gear',
      condition: 'good',
      department: 'Chemistry',
      location: 'Science Lab 3',
      maxLoanDurationDays: 7,
      steward: stewardUser._id,
      status: 'available',
    });

    const borrowRes2 = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({
        resourceId: anotherResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
        purpose: 'Titration experiment',
      });
    const request2Id = borrowRes2.body.borrowRequest._id;
    emailService.clearSentEmails();

    const rejectRes = await request(app)
      .patch(`/api/borrow/${request2Id}/reject`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ rejectionReason: 'Required for departmental exam demonstration' });
    expect(rejectRes.status).toBe(200);

    const rejectEmails = emailService.getSentEmails();
    const rejectEmail = rejectEmails.find((e) => e.to === 'aarav.student@campus.edu');
    expect(rejectEmail).toBeDefined();
    expect(rejectEmail.subject).toContain('Request Update');
    expect(rejectEmail.text).toContain('Required for departmental exam demonstration');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Email Transport Failure does NOT corrupt successful transaction
  // --------------------------------------------------------------------------
  it('3. An email transport failure does not corrupt a successful transaction', async () => {
    // Inject a failing transport simulating an unreachable SMTP server or network error
    emailService.setTransporter({
      sendMail: jest.fn().mockRejectedValue(new Error('SMTP Connection timeout: Host unreachable')),
    });

    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(Date.now() + 3 * 24 * 3600 * 1000);

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Robotics sensor test with failing SMTP',
      });

    // The API request MUST succeed cleanly and not bubble up the email error to the user
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify the database record is fully persisted and valid
    const dbRecord = await BorrowRequest.findById(res.body.borrowRequest._id);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.status).toBe('pending');
    expect(dbRecord.purpose).toBe('Robotics sensor test with failing SMTP');
  });

  // --------------------------------------------------------------------------
  // TEST 4: In-App Notification mechanism still functions alongside email
  // --------------------------------------------------------------------------
  it('4. The in-app notification mechanism still works alongside email notifications', async () => {
    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(Date.now() + 4 * 24 * 3600 * 1000);

    const borrowRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        purpose: 'Testing dual notification channel',
      });
    expect(borrowRes.status).toBe(201);

    // Check in-app notification in database
    const notifs = await Notification.find({ recipient: stewardUser._id }).sort({ createdAt: -1 });
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].type).toBe('request_received');
    expect(notifs[0].title).toBe('New Borrow Request');
    expect(notifs[0].message).toContain('Rohan Deshmukh');
    expect(notifs[0].read).toBe(false);

    // Check user can fetch notifications through API
    const apiNotifs = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(apiNotifs.status).toBe(200);
    expect(apiNotifs.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  // --------------------------------------------------------------------------
  // TEST 5: Ongoing Transactions Appear in Ongoing List
  // --------------------------------------------------------------------------
  it('5. An ongoing transaction appears in the ongoing list (?scope=ongoing)', async () => {
    // Submit request (pending)
    const createRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        purpose: 'Ongoing transaction listing verification',
      });
    const requestId = createRes.body.borrowRequest._id;

    // Check ongoing scope as borrower
    const ongoingResBorrower = await request(app)
      .get('/api/borrow/my-requests?scope=ongoing')
      .set('Authorization', `Bearer ${borrowerToken}`);
    expect(ongoingResBorrower.status).toBe(200);
    const foundInBorrower = ongoingResBorrower.body.requests.find((r) => r._id === requestId);
    expect(foundInBorrower).toBeDefined();
    expect(foundInBorrower.status).toBe('pending');

    // Check ongoing scope as steward
    const ongoingResSteward = await request(app)
      .get('/api/borrow/incoming?scope=ongoing')
      .set('Authorization', `Bearer ${stewardToken}`);
    expect(ongoingResSteward.status).toBe(200);
    const foundInSteward = ongoingResSteward.body.requests.find((r) => r._id === requestId);
    expect(foundInSteward).toBeDefined();

    // Advance to approved and borrowed
    await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);

    await request(app)
      .patch(`/api/borrow/${requestId}/collect`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ handoverNotes: 'Checked out in good condition' });

    // Should STILL appear in ongoing list while checked out
    const ongoingWhileBorrowed = await request(app)
      .get('/api/borrow/my-requests?scope=ongoing')
      .set('Authorization', `Bearer ${borrowerToken}`);
    const foundWhileBorrowed = ongoingWhileBorrowed.body.requests.find((r) => r._id === requestId);
    expect(foundWhileBorrowed).toBeDefined();
    expect(foundWhileBorrowed.status).toBe('borrowed');

    // Borrower initiates return -> status: return_requested -> STILL ongoing
    const initiateRes = await request(app)
      .patch(`/api/borrow/${requestId}/request-return`)
      .set('Authorization', `Bearer ${borrowerToken}`);
    expect(initiateRes.status).toBe(200);
    expect(initiateRes.body.request.status).toBe('return_requested');

    const ongoingReturnRequested = await request(app)
      .get('/api/borrow/incoming?scope=ongoing')
      .set('Authorization', `Bearer ${stewardToken}`);
    const foundReturnRequested = ongoingReturnRequested.body.requests.find((r) => r._id === requestId);
    expect(foundReturnRequested).toBeDefined();
    expect(foundReturnRequested.status).toBe('return_requested');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Confirmed Return moves item to Completed List
  // --------------------------------------------------------------------------
  it('6. A confirmed return appears in the completed list (?scope=completed)', async () => {
    // 1. Create and approve request
    const createRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        purpose: 'Complete return verification test',
      });
    const requestId = createRes.body.borrowRequest._id;

    await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);

    await request(app)
      .patch(`/api/borrow/${requestId}/collect`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ handoverNotes: 'Standard lab handoff' });

    // 2. Confirm return by steward
    const returnRes = await request(app)
      .patch(`/api/borrow/${requestId}/return`)
      .set('Authorization', `Bearer ${stewardToken}`)
      .send({ returnNotes: 'Checked and confirmed returned intact.' });
    expect(returnRes.status).toBe(200);
    expect(returnRes.body.request.status).toBe('returned');

    // 3. Query completed scope
    const completedBorrower = await request(app)
      .get('/api/borrow/my-requests?scope=completed')
      .set('Authorization', `Bearer ${borrowerToken}`);
    expect(completedBorrower.status).toBe(200);
    const foundCompleted = completedBorrower.body.requests.find((r) => r._id === requestId);
    expect(foundCompleted).toBeDefined();
    expect(foundCompleted.status).toBe('returned');

    // 4. Verify it NO LONGER appears under ongoing scope
    const ongoingBorrower = await request(app)
      .get('/api/borrow/my-requests?scope=ongoing')
      .set('Authorization', `Bearer ${borrowerToken}`);
    const foundInOngoing = ongoingBorrower.body.requests.find((r) => r._id === requestId);
    expect(foundInOngoing).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // TEST 7: Unconfirmed Return does NOT appear as Completed
  // --------------------------------------------------------------------------
  it('7. An unconfirmed return does not appear as completed', async () => {
    const createRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        purpose: 'Testing unconfirmed return separation',
      });
    const requestId = createRes.body.borrowRequest._id;

    await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${stewardToken}`);

    await request(app)
      .patch(`/api/borrow/${requestId}/collect`)
      .set('Authorization', `Bearer ${stewardToken}`);

    // Borrower initiates return, but steward has NOT confirmed it yet
    await request(app)
      .patch(`/api/borrow/${requestId}/request-return`)
      .set('Authorization', `Bearer ${borrowerToken}`);

    // Completed list MUST NOT include this transaction
    const completedRes = await request(app)
      .get('/api/borrow/my-requests?scope=completed')
      .set('Authorization', `Bearer ${borrowerToken}`);
    const found = completedRes.body.requests.find((r) => r._id === requestId);
    expect(found).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // TEST 8: Invalid transaction state cannot be changed merely by requests
  // --------------------------------------------------------------------------
  it('8. Invalid transaction state cannot be manipulated via unauthorized requests', async () => {
    // 8a. Borrower creates a request (pending state)
    const createRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        resourceId: testResource._id,
        startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        purpose: 'State manipulation guard test',
      });
    const requestId = createRes.body.borrowRequest._id;

    // 8b. Borrower attempts to directly confirm return without approval or handover
    const directReturnAttempt = await request(app)
      .patch(`/api/borrow/${requestId}/return`)
      .set('Authorization', `Bearer ${borrowerToken}`);
    // Blocked: only steward can confirm return
    expect(directReturnAttempt.status).toBe(403);

    // 8c. Steward attempts to confirm return while still in "pending" status
    const prematureReturnAttempt = await request(app)
      .patch(`/api/borrow/${requestId}/return`)
      .set('Authorization', `Bearer ${stewardToken}`);
    // Blocked: item must be borrowed or return_requested
    expect(prematureReturnAttempt.status).toBe(400);

    // 8d. Borrower attempts to initiate return on an uncollected/pending item
    const prematureInitiateReturn = await request(app)
      .patch(`/api/borrow/${requestId}/request-return`)
      .set('Authorization', `Bearer ${borrowerToken}`);
    // Blocked: only borrowed items can have return initiated
    expect(prematureInitiateReturn.status).toBe(400);

    // 8e. Unrelated third party attempts to approve the request
    const unauthorizedApproval = await request(app)
      .patch(`/api/borrow/${requestId}/approve`)
      .set('Authorization', `Bearer ${thirdToken}`);
    // Blocked: 403 Forbidden
    expect(unauthorizedApproval.status).toBe(403);
  });
});
