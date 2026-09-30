const request = require('supertest');
const app = require('../src/server');
require('./setup');

describe('Authentication & Account Management API (SRS 4.1, 4.2)', () => {
  const validUser = {
    name: 'Elena Rostova',
    email: 'elena.rostova@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Science & Engineering',
    campusId: 'CS-8492',
  };

  it('FR-01: Should reject registration with a non-institutional email domain', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        email: 'elena@gmail.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('institutional email address');
  });

  it('FR-01: Should successfully register a new user with an institutional email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(validUser.email.toLowerCase());
    expect(res.body.user.trustScore).toBe(5.0);
  });

  it('Should prevent duplicate registration for the same institutional email', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const duplicateRes = await request(app).post('/api/auth/register').send(validUser);
    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('FR-03: Should authenticate user and return token on valid login', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.name).toBe(validUser.name);
  });

  it('FR-03: Should reject login with invalid password', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: 'WrongPassword!',
    });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.success).toBe(false);
  });

  it('FR-06: Should allow user to retrieve their profile with auth token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(validUser.email.toLowerCase());
  });

  it('FR-06: Should allow user to update their profile', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;

    const updateRes = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Senior Undergraduate Researcher specializing in embedded robotics.',
        department: 'Robotics & Mechatronics',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.user.bio).toContain('Senior Undergraduate Researcher');
    expect(updateRes.body.user.department).toBe('Robotics & Mechatronics');
  });
});
