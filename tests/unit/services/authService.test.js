// tests/unit/services/authService.test.js
// Mock dotenv to prevent overriding test env vars
jest.mock('dotenv', () => ({ config: jest.fn() }));

const jwt = require('jsonwebtoken');
const authRepository = require('../../../src/features/auth/auth.repository');
const helpers = require('../../../src/common/helpers');

jest.mock('../../../src/features/auth/auth.repository');
jest.mock('../../../src/common/helpers');

let authService;

describe('Auth Service - registerUser', () => {
  const userData = { email: 'u@e.com', password: 'pass123', username: 'user' };

  beforeAll(() => {
    // Set JWT env before module load
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  beforeEach(() => {
    jest.resetModules(); // clear module cache including dotenv mock
    // Re-require authService after resetting modules and setting env
    authService = require('../../../src/features/auth/auth.service');
    // Mock helpers behavior
    helpers.hashPassword.mockResolvedValue('hashedpass');
    helpers.parseDuration.mockReturnValue(3600000);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if required fields missing', async () => {
    await expect(authService.registerUser({})).rejects.toThrow(
      'Required fields (email, password, username) are missing.'
    );
  });

  it('should register a new user and return token and user', async () => {
    const createdUser = {
      user_id: '123',
      email: 'u@e.com',
      username: 'user',
      role: 'user',
      password_hash: 'hashedpass'
    };
    authRepository.createUser.mockResolvedValue(createdUser);

    const result = await authService.registerUser(userData);

    expect(helpers.hashPassword).toHaveBeenCalledWith('pass123');
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: 'u@e.com',
      password_hash: 'hashedpass',
      username: 'user',
      role: 'user'
    });
    expect(result.user).toEqual({
      user_id: '123',
      email: 'u@e.com',
      username: 'user',
      role: 'user'
    });
    expect(result.token).toBeDefined();
    expect(result.expiresInMs).toBe(3600000);

    // Verify JWT signature and payload
    const payload = jwt.verify(result.token, 'test_secret');
    expect(payload.userId).toBe('123');
    expect(payload.role).toBe('user');
  });

  it('should rethrow repository errors', async () => {
    const err = new Error('Username already taken.');
    authRepository.createUser.mockRejectedValue(err);
    await expect(authService.registerUser(userData)).rejects.toThrow(
      'Username already taken.'
    );
  });
});
