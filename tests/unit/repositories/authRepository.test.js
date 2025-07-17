// tests/unit/repositories/authRepository.test.js
const prisma = require('../../../src/config/db');
const { findUserByEmail, createUser } = require('../../../src/features/auth/auth.repository');

jest.mock('../../../src/config/db', () => ({
  User: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

describe('Auth Repository - register', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find a user by email', async () => {
    const mockUser = { user_id: '1', email: 'test@example.com' };
    prisma.User.findUnique.mockResolvedValue(mockUser);

    const result = await findUserByEmail('test@example.com');
    expect(prisma.User.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      include: { user_profiles: true }
    });
    expect(result).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const payload = { email: 'new@example.com', password_hash: 'hashed', username: 'newuser', role: 'user' };
    const mockCreated = { user_id: '2', ...payload };
    prisma.User.create.mockResolvedValue(mockCreated);

    const result = await createUser(payload);
    expect(prisma.User.create).toHaveBeenCalledWith({ data: payload });
    expect(result).toEqual(mockCreated);
  });

  it('should throw on unique constraint violation for email', async () => {
    const payload = { email: 'dup@example.com', password_hash: 'hashed', username: 'dupuser', role: 'user' };
    const error = new Error();
    error.code = 'P2002';
    error.meta = { target: ['email'] };
    prisma.User.create.mockRejectedValue(error);

    await expect(createUser(payload)).rejects.toThrow('User with this email already exists.');
  });

  it('should throw generic error for other db errors', async () => {
    const payload = { email: 'err@example.com', password_hash: 'hashed', username: 'erruser', role: 'user' };
    const error = new Error('Some DB error');
    prisma.User.create.mockRejectedValue(error);

    await expect(createUser(payload)).rejects.toThrow('Database error during user creation.');
  });
});
