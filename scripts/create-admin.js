#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Fitflix Admin User Creator');
  console.log('=============================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Get user input
    const email = await new Promise((resolve) => {
      rl.question('Enter admin email: ', resolve);
    });

    const username = await new Promise((resolve) => {
      rl.question('Enter admin username: ', resolve);
    });

    const password = await new Promise((resolve) => {
      rl.question('Enter admin password: ', resolve);
    });

    const firstName = await new Promise((resolve) => {
      rl.question('Enter first name (optional): ', (answer) => resolve(answer || 'Admin'));
    });

    const lastName = await new Promise((resolve) => {
      rl.question('Enter last name (optional): ', (answer) => resolve(answer || 'User'));
    });

    // Validate input
    if (!email || !username || !password) {
      console.log('❌ Email, username, and password are required!');
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      console.log(`❌ User already exists with email: ${existingUser.email} or username: ${existingUser.username}`);
      return;
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    console.log('👤 Creating admin user...');
    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('=====================================');
    console.log(`ID: ${newAdmin.id}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Username: ${newAdmin.username}`);
    console.log(`Name: ${newAdmin.firstName} ${newAdmin.lastName}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log(`Active: ${newAdmin.isActive ? 'Yes' : 'No'}`);
    console.log(`Email Verified: ${newAdmin.emailVerified ? 'Yes' : 'No'}`);
    console.log(`Created: ${newAdmin.createdAt.toISOString()}`);

    console.log('\n🎉 You can now log in to the admin dashboard!');
    console.log(`🌐 Admin Dashboard: http://localhost:3001`);
    console.log(`📧 Login with: ${newAdmin.email}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
