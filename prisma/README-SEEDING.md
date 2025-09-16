# Database Seeding Guide

This guide explains how to use the database seeding scripts for the Fitflix backend.

## Available Seed Scripts

### 1. Admin User Seeding (`seed-admin.js`)

Creates default admin users for the system.

**Usage:**
```bash
npm run db:seed:admin
```

**Default Admin Users Created:**
- `admin@fitflix.com` / `admin` (password: `admin123`)
- `superadmin@fitflix.com` / `superadmin` (password: `superadmin123`)
- `developer@fitflix.com` / `developer` (password: `dev123`)

**Features:**
- Checks for existing admin users before creating new ones
- Prompts user confirmation if admin users already exist
- Updates existing users to admin role if needed
- Displays all current admin users after seeding

### 2. Interactive Admin Creator (`scripts/create-admin.js`)

Creates a single admin user interactively.

**Usage:**
```bash
node scripts/create-admin.js
```

**Features:**
- Interactive prompts for user details
- Validates input (email, username, password required)
- Checks for existing users to prevent duplicates
- Creates user with admin role and verified email

### 3. Full Database Seeding (`seed.js`)

Seeds the entire database with sample data.

**Usage:**
```bash
npm run db:dev:seed
```

**What it seeds:**
- Admin users (calls `seed-admin.js`)
- Sample blogs (2 fitness-related articles)
- Sample events (community workout, yoga workshop)
- Sample leads (3 potential customers)

## Environment-Specific Commands

### Development
```bash
# Seed admin users only
npm run db:seed:admin

# Seed full database
npm run db:dev:seed

# Create interactive admin
node scripts/create-admin.js
```

### Production
```bash
# Seed admin users in production
npm run db:seed:prod

# Deploy migrations
npm run db:deploy
```

## Database Schema

### User Model
```prisma
model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique
  username      String   @unique
  password      String
  firstName     String?
  lastName      String?
  role          String   @default("user")
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now()) @db.Timestamptz(6)
  updatedAt     DateTime @updatedAt @db.Timestamptz(6)
}
```

### Admin Role Requirements
- Users with `role: 'admin'` can access the admin dashboard
- Admin users must have `isActive: true` and `emailVerified: true`
- Password is hashed using bcrypt with 12 salt rounds

## Security Notes

### Password Security
- All passwords are hashed using bcrypt with 12 salt rounds
- Default passwords are provided for development only
- Change default passwords in production environments

### Admin Access
- Admin dashboard requires JWT token in HTTP-only cookies
- Tokens expire after 24 hours
- Admin role is checked on every protected route

## Troubleshooting

### Common Issues

1. **"User already exists"**
   - The email or username is already in the database
   - Use different credentials or update existing user

2. **"Database connection failed"**
   - Check DATABASE_URL environment variable
   - Ensure database is running and accessible

3. **"Permission denied"**
   - Ensure user has admin role
   - Check if user is active and email verified

### Reset Database
```bash
# Development
npm run db:test:reset

# Production (use with caution)
npx prisma migrate reset --force
```

## Sample Admin Credentials

For development and testing:

| Email | Username | Password | Role |
|-------|----------|----------|------|
| admin@fitflix.com | admin | admin123 | admin |
| superadmin@fitflix.com | superadmin | superadmin123 | admin |
| developer@fitflix.com | developer | dev123 | admin |

**⚠️ Important:** Change these passwords in production!

## Admin Dashboard Access

After seeding admin users:

1. Start the backend server: `npm run dev`
2. Start the admin dashboard: `cd ../Admin_Dashboard && npm run dev`
3. Access dashboard at: `http://localhost:3001`
4. Login with admin credentials

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT Documentation](https://jwt.io/)
