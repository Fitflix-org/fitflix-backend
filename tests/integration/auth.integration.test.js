// tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');

beforeAll(async () => {
  await prisma.$connect();
});
afterAll(async () => {
  await prisma.User.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await prisma.User.deleteMany();
  });

  it('should register a new user and set cookie', async () => {
    const payload = { email: 'int@user.com', password: 'IntPass123!', username: 'intuser' };
    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(res.body.message).toBe('User registered successfully.');
    expect(res.body.user).toMatchObject({ email: 'int@user.com', username: 'intuser' });
    const cookies = res.headers['set-cookie'];
    expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);

    // verify user exists in DB
    const dbUser = await prisma.User.findUnique({ where: { email: 'int@user.com' } });
    expect(dbUser).not.toBeNull();
  });

  it('should return 409 on duplicate registration', async () => {
    const payload = { email: 'dup@user.com', password: 'DupPass123!', username: 'dupuser' };
    await prisma.User.create({ data: { ...payload, password_hash: 'hashed', role: 'user' } });

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(409);

    expect(res.body.message).toMatch(/exists/);
  });
});
