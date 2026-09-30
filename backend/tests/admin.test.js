const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const AuditLog = require('../src/models/AuditLog');
require('./setup');

describe('Administration & Governance API (SRS 4.6 & Security 5.3)', () => {
  let adminToken, studentToken;
  let adminUser, studentUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@campus.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      isVerified: true,
    });

    studentUser = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: 'Password123!',
      role: 'student',
      isVerified: false,
    });

    const aLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@campus.edu',
      password: 'AdminPassword123!',
    });
    adminToken = aLogin.body.token;

    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'marcus@campus.edu',
      password: 'Password123!',
    });
    studentToken = sLogin.body.token;
  });

  it('Should reject non-admin users from accessing /api/admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('FR-28: Admin should be able to fetch system metrics', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics.users.total).toBe(2);
  });

  it('FR-25: Admin should verify a student user', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${studentUser._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isVerified: true });

    expect(res.status).toBe(200);
    expect(res.body.user.isVerified).toBe(true);

    const updated = await User.findById(studentUser._id);
    expect(updated.isVerified).toBe(true);
  });

  it('FR-27: Admin should suspend user and blocked user cannot access protected routes', async () => {
    // 1. Suspend user
    const suspendRes = await request(app)
      .patch(`/api/admin/users/${studentUser._id}/suspend`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isSuspended: true, reason: 'Repeated late returns' });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.user.isSuspended).toBe(true);

    // 2. Suspended user attempts to use token
    const blockedRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.message).toContain('suspended');
  });

  it('NFR-14: Admin can view audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});
