'use strict';
// ═══════════════════════════════════════════
//  API TESTS  —  Jest + Supertest
//  Run: npm test
// ═══════════════════════════════════════════
const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');
const User     = require('../models/User');
const { Contact, Newsletter, Booking, Blog } = require('../models/index');

// ── Test state ─────────────────────────────
let adminToken, userToken, adminId, userId;
let blogPostId, bookingId, contactId;

// ── Setup / Teardown ──────────────────────
beforeAll(async () => {
  // Wait for DB connection
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Clean test data
  await Promise.all([
    User.deleteMany({ email: { $in: ['testadmin@test.com','testuser@test.com'] } }),
    Blog.deleteMany({ title: /TEST_/ }),
    Contact.deleteMany({ email: 'testcontact@test.com' }),
    Newsletter.deleteMany({ email: 'testnl@test.com' }),
    Booking.deleteMany({ email: 'testbook@test.com' })
  ]);
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({ email: { $in: ['testadmin@test.com','testuser@test.com'] } }),
    Blog.deleteMany({ title: /TEST_/ }),
    Contact.deleteMany({ email: 'testcontact@test.com' }),
    Newsletter.deleteMany({ email: 'testnl@test.com' }),
    Booking.deleteMany({ email: 'testbook@test.com' })
  ]);
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════
describe('🔐 Auth', () => {

  it('POST /api/v1/auth/register — registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User', email: 'testuser@test.com', password: 'Pass1234!'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
    userId    = res.body.data.user._id;
  });

  it('POST /api/v1/auth/register — rejects duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Dupe', email: 'testuser@test.com', password: 'Pass1234!'
    });
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/auth/register — rejects weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Bad', email: 'bad@test.com', password: '123'
    });
    expect(res.status).toBe(422);
  });

  it('POST /api/v1/auth/login — logs in with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@test.com', password: 'Pass1234!'
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/v1/auth/login — rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@test.com', password: 'WrongPass!'
    });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me — returns current user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('testuser@test.com');
  });

  it('GET /api/v1/auth/me — rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/forgot-password — always returns 200', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'nonexistent@test.com'
    });
    expect(res.status).toBe(200);
  });

  // Create admin for later tests
  it('Creates admin user directly', async () => {
    const admin = await User.create({
      name: 'Test Admin', email: 'testadmin@test.com',
      password: 'Admin1234!', role: 'admin', isVerified: true
    });
    adminId = admin._id.toString();
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'testadmin@test.com', password: 'Admin1234!'
    });
    adminToken = loginRes.body.data.token;
    expect(adminToken).toBeDefined();
  });
});

// ═══════════════════════════════════════════
//  CONTACT
// ═══════════════════════════════════════════
describe('✉️  Contact', () => {

  it('POST /api/v1/contact — submits a contact form', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      firstName: 'Jane', lastName: 'Doe',
      email: 'testcontact@test.com',
      subject: 'Test subject',
      message: 'This is a test message with enough characters.'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    contactId = res.body.data.id;
  });

  it('POST /api/v1/contact — rejects missing fields', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      email: 'testcontact@test.com'
    });
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════
//  NEWSLETTER
// ═══════════════════════════════════════════
describe('📧 Newsletter', () => {

  it('POST /api/v1/newsletter/subscribe — subscribes an email', async () => {
    const res = await request(app).post('/api/v1/newsletter/subscribe').send({
      email: 'testnl@test.com', firstName: 'Test'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/newsletter/subscribe — handles duplicate gracefully', async () => {
    const res = await request(app).post('/api/v1/newsletter/subscribe').send({
      email: 'testnl@test.com'
    });
    expect([200, 201]).toContain(res.status);
  });

  it('POST /api/v1/newsletter/subscribe — rejects invalid email', async () => {
    const res = await request(app).post('/api/v1/newsletter/subscribe').send({
      email: 'not-an-email'
    });
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════
//  BOOKINGS
// ═══════════════════════════════════════════
describe('📅 Bookings', () => {

  it('POST /api/v1/bookings — creates a booking', async () => {
    const res = await request(app).post('/api/v1/bookings').send({
      firstName: 'Book', lastName: 'Test',
      email: 'testbook@test.com',
      sessionType: 'quick-consult',
      concern: 'general-wellness',
      notes: 'Test booking notes'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.bookingRef).toMatch(/^APH-/);
    bookingId = res.body.data.id;
  });

  it('POST /api/v1/bookings — rejects invalid session type', async () => {
    const res = await request(app).post('/api/v1/bookings').send({
      firstName: 'Book', lastName: 'Test',
      email: 'testbook@test.com',
      sessionType: 'invalid-type',
      concern: 'general-wellness'
    });
    expect(res.status).toBe(422);
  });

  it('GET /api/v1/bookings/ref/:ref — fetches by reference', async () => {
    const booking = await Booking.findById(bookingId);
    const res = await request(app).get(`/api/v1/bookings/ref/${booking.bookingRef}`);
    expect(res.status).toBe(200);
    expect(res.body.data.booking.bookingRef).toBe(booking.bookingRef);
  });
});

// ═══════════════════════════════════════════
//  BLOG
// ═══════════════════════════════════════════
describe('📝 Blog', () => {

  it('POST /api/v1/blog — admin creates a post', async () => {
    const res = await request(app)
      .post('/api/v1/blog')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title:    'TEST_ Sample Blog Post Title Here',
        excerpt:  'A short test excerpt for the blog post.',
        content:  '<p>This is the full content of the test blog post. It contains enough text to pass validation requirements for the content field.</p>',
        category: 'Wellness',
        topic:    'wellness',
        status:   'published'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.post.slug).toBeDefined();
    blogPostId = res.body.data.post._id;
  });

  it('GET /api/v1/blog — lists published posts', async () => {
    const res = await request(app).get('/api/v1/blog?status=published');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('GET /api/v1/blog/:slug — fetches single post', async () => {
    const post = await Blog.findById(blogPostId);
    const res  = await request(app).get(`/api/v1/blog/${post.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.post.title).toContain('TEST_');
  });

  it('PATCH /api/v1/blog/:id — admin updates post', async () => {
    const res = await request(app)
      .patch(`/api/v1/blog/${blogPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ featured: true });
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/blog — non-admin is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/blog')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test', content: 'x', excerpt: 'x', category: 'Wellness', topic: 'wellness' });
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════
describe('🛡️  Admin', () => {

  it('GET /api/v1/admin/dashboard — returns full stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.recent).toBeDefined();
  });

  it('GET /api/v1/admin/dashboard — blocks non-admins', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/users — lists all users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  it('GET /api/v1/admin/contacts — lists all contacts', async () => {
    const res = await request(app)
      .get('/api/v1/admin/contacts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/admin/bookings — lists all bookings', async () => {
    const res = await request(app)
      .get('/api/v1/admin/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/admin/newsletter — lists subscribers', async () => {
    const res = await request(app)
      .get('/api/v1/admin/newsletter')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/admin/contacts/:id — updates contact status', async () => {
    const contact = await Contact.findOne({ email: 'testcontact@test.com' });
    const res = await request(app)
      .patch(`/api/v1/admin/contacts/${contact._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'read', adminNote: 'Reviewed by admin' });
    expect(res.status).toBe(200);
    expect(res.body.data.contact.status).toBe('read');
  });

  it('PATCH /api/v1/admin/bookings/:id — updates booking status', async () => {
    const booking = await Booking.findOne({ email: 'testbook@test.com' });
    const res = await request(app)
      .patch(`/api/v1/admin/bookings/${booking._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('confirmed');
  });
});

// ═══════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════
describe('❤️  Health', () => {
  it('GET /health — returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/nonexistent — returns 404', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });
});
