const request = require('supertest');
const app = require('../../src/app');

describe('Chatbot API', () => {
    describe('POST /api/chatbot/message', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/chatbot/message')
                .send({
                    message: 'Hello, how can I improve my fitness?',
                    includeContext: true
                });

            expect(response.status).toBe(401);
        });

        it('should return 400 for missing message', async () => {
            // This test would need proper JWT token setup
            // For now, just test validation
            const response = await request(app)
                .post('/api/chatbot/message')
                .set('Authorization', 'Bearer invalid-token')
                .send({
                    includeContext: true
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/chatbot/context', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/chatbot/context');

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/chatbot/history', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .delete('/api/chatbot/history');

            expect(response.status).toBe(401);
        });
    });
});
