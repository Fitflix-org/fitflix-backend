const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Admin user data
const adminUsers = [
  {
    email: 'admin@fitflix.com',
    username: 'admin',
    password: ' dewantdvent', // This will be hashed
    firstName: 'Fitflix',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    emailVerified: true
  },
  {
    email: 'superadmin@fitflix.com',
    username: 'superadmin',
    password: 'superadmin123', // This will be hashed
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    emailVerified: true
  },
  {
    email: 'developer@fitflix.com',
    username: 'developer',
    password: 'dev123', // This will be hashed
    firstName: 'Developer',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    emailVerified: true
  }
];

async function seedAdminUsers() {
  console.log('🌱 Starting admin user seeding...');
  
  try {
    // Check if any admin users already exist
    const existingAdmins = await prisma.user.findMany({
      where: {
        role: 'admin'
      }
    });

    if (existingAdmins.length > 0) {
      console.log(`⚠️  Found ${existingAdmins.length} existing admin users:`);
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.username})`);
      });
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to continue and create additional admin users? (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled by user');
        return;
      }
    }

    // Process each admin user
    for (const adminData of adminUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: adminData.email },
              { username: adminData.username }
            ]
          }
        });

        if (existingUser) {
          console.log(`⚠️  User already exists: ${adminData.email} (${adminData.username})`);
          
          // Update existing user to admin role if not already admin
          if (existingUser.role !== 'admin') {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                role: 'admin',
                isActive: true,
                emailVerified: true,
                firstName: adminData.firstName,
                lastName: adminData.lastName
              }
            });
            console.log(`✅ Updated user to admin: ${adminData.email}`);
          } else {
            console.log(`ℹ️  User is already an admin: ${adminData.email}`);
          }
          continue;
        }

        // Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

        // Create new admin user
        const newAdmin = await prisma.user.create({
          data: {
            email: adminData.email,
            username: adminData.username,
            password: hashedPassword,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            role: adminData.role,
            isActive: adminData.isActive,
            emailVerified: adminData.emailVerified
          }
        });

        console.log(`✅ Created admin user: ${newAdmin.email} (${newAdmin.username})`);
        
      } catch (error) {
        console.error(`❌ Error creating admin user ${adminData.email}:`, error.message);
      }
    }

    // Display all admin users
    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    });

    console.log('\n📋 Current admin users in database:');
    console.log('=====================================');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (${admin.username})`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive ? '✅' : '❌'}`);
      console.log(`   Email Verified: ${admin.emailVerified ? '✅' : '❌'}`);
      console.log(`   Created: ${admin.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('🎉 Admin user seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during admin user seeding:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedAdminUsers();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { seedAdminUsers };
