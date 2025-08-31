const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking existing users in database...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      console.log(`👥 Found ${users.length} user(s):`);
      console.log('');
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Check for specific conflicts
    console.log('🔍 Checking for potential conflicts...');
    
    const adminEmailUser = await prisma.user.findUnique({
      where: { email: 'admin@fitflix.com' }
    });

    const adminUsernameUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (adminEmailUser) {
      console.log('⚠️  Found user with email admin@fitflix.com:');
      console.log(`   ID: ${adminEmailUser.id}`);
      console.log(`   Username: ${adminEmailUser.username}`);
      console.log(`   Role: ${adminEmailUser.role}`);
    }

    if (adminUsernameUser) {
      console.log('⚠️  Found user with username "admin":');
      console.log(`   ID: ${adminUsernameUser.id}`);
      console.log(`   Email: ${adminUsernameUser.email}`);
      console.log(`   Role: ${adminUsernameUser.role}`);
    }

    if (!adminEmailUser && !adminUsernameUser) {
      console.log('✅ No conflicts found - safe to create admin user');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
