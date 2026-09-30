const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Resource = require('../src/models/Resource');
const BorrowRequest = require('../src/models/BorrowRequest');
const Rating = require('../src/models/Rating');
const Notification = require('../src/models/Notification');
require('./setup');

describe('Ratings, Reviews & Trust Score Engine (SRS 4.5 & Business Rules 5.5)', () => {
  let steward, borrower;
  let stewardToken, borrowerToken;
  let resource, transaction;

  beforeEach(async () => {
    steward = await User.create({
      name: 'Elena Rostova',
      email: 'elena@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
      trustScore: 4.8,
    });

    borrower = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: true,
      trustScore: 5.0,
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

    resource = await Resource.create({
      title: 'Sony Alpha 7 IV Camera Kit',
      description: 'Production mirrorless kit.',
      category: 'electronics',
      condition: 'like_new',
      department: 'Film & Media',
      location: 'Studio B',
      maxLoanDurationDays: 3,
      steward: steward._id,
      status: 'available',
    });

    transaction = await BorrowRequest.create({
      resource: resource._id,
      borrower: borrower._id,
      steward: steward._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      durationDays: 2,
      purpose: 'Senior Film Screening',
      status: 'borrowed', // NOT YET RETURNED
    });
  });

  it('SRS 5.5: Should reject ratings if transaction is not yet in "returned" status', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        transactionId: transaction._id,
        rating: 5,
        reviewText: 'Great camera!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Ratings can only be submitted after the item has been returned');
  });

  it('FR-23 & FR-24: Should allow rating after return and recalculate recipient trust score', async () => {
    // 1. Mark transaction as returned
    transaction.status = 'returned';
    transaction.returnedAt = new Date();
    await transaction.save();

    // 2. Submit rating from Borrower to Steward
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        transactionId: transaction._id,
        rating: 5,
        reviewText: 'Excellent equipment, steward was very helpful and responsive.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.rating.rating).toBe(5);

    // Verify Steward received notification
    const notifs = await Notification.find({ recipient: steward._id, type: 'rating_received' });
    expect(notifs.length).toBe(1);

    // Verify Steward's profile has updated trust score
    const updatedSteward = await User.findById(steward._id);
    expect(updatedSteward.totalReviews).toBe(1);
    expect(updatedSteward.averageRating).toBe(5.0);
  });

  it('Should prevent duplicate ratings from the same participant on the same transaction', async () => {
    transaction.status = 'returned';
    transaction.returnedAt = new Date();
    await transaction.save();

    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        transactionId: transaction._id,
        rating: 5,
        reviewText: 'First review',
      });

    const secondRes = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({
        transactionId: transaction._id,
        rating: 4,
        reviewText: 'Trying to rate again',
      });

    expect(secondRes.status).toBe(400);
    expect(secondRes.body.message).toContain('already submitted a rating');
  });
});
