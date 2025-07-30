const request = require('supertest');
const app = require('../../src/app');

describe('Authentication API Enhancements', () => {
    describe('POST /api/auth/change-password', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/change-password')
                .send({
                    currentPassword: 'oldpass123',
                    newPassword: 'newpass123'
                });

            expect(response.status).toBe(401);
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', 'Bearer invalid-token')
                .send({
                    currentPassword: 'oldpass123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should return 400 for invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'invalid-email'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 200 for valid email (even if user doesn\'t exist)', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password reset instructions sent to your email.');
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should return 400 for missing token', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    newPassword: 'newpass123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 for short password', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'valid-token',
                    newPassword: '123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        it('should return 400 for missing refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });
});
