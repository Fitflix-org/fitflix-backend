// Simple test script to debug backend issues
require('dotenv').config();

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Test database connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful. User count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Test JWT functionality
function testJWT() {
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'test-secret';
    const token = jwt.sign({ test: true }, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    console.log('✅ JWT functionality working');
  } catch (error) {
    console.error('❌ JWT functionality failed:', error.message);
  }
}

async function runTests() {
  console.log('\n=== Backend Health Check ===\n');
  
  testJWT();
  await testDatabase();
  
  console.log('\n=== Test Complete ===');
}

runTests().catch(console.error);



