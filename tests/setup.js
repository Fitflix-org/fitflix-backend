// tests/setup.js
// Global setup and teardown for Jest tests, especially for integration tests.

// Load environment variables for the test environment
require('dotenv').config({ path: '.env.test' });

const { execSync } = require('child_process');
const prisma = require('../src/config/db'); // Your Prisma client singleton

// This block runs once before all tests in your Jest suite.
beforeAll(async () => {
  console.log('\n--- Global Test Setup: Starting ---');

  // 1. Ensure the test database is clean and migrated
  console.log('Resetting and migrating test database...');
  try {
    // This command will drop the test database, recreate it, and apply all migrations.
    // It ensures a clean slate for integration tests.
    execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit', env: process.env });
    console.log('Test database reset and migrated successfully.');
  } catch (error) {
    console.error('Failed to reset/migrate test database:', error.message);
    process.exit(1); // Exit if database setup fails
  }

  // You might want to seed some base data for all integration tests here
  // For example, if you have a `prisma/seed.js` that populates essential lookup data.
  // execSync('npx prisma db seed', { stdio: 'inherit', env: process.env });

  console.log('--- Global Test Setup: Complete ---');
});

// This block runs once after all tests in your Jest suite.
afterAll(async () => {
  console.log('\n--- Global Test Teardown: Starting ---');

  // Disconnect Prisma Client to ensure no open handles prevent Jest from exiting
  if (prisma) {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }

  // Optionally, stop Docker containers if you manage them directly from tests,
  // but `docker-compose down` is usually run manually or via CI/CD.
  // For now, we rely on --detectOpenHandles and --forceExit if needed.

  console.log('--- Global Test Teardown: Complete ---');
});

// You can also add beforeEach/afterEach for per-test setup/teardown if needed,
// e.g., for transaction-based test isolation for integration tests.
// For example:
// beforeEach(async () => {
//   await prisma.$transaction(async (tx) => {
//     // Assign tx to a global variable or pass it down to repositories
//     // This is more advanced for full transaction-per-test isolation
//   });
// });
// afterEach(async () => {
//   // Rollback the transaction
// });