const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@fitflix.com' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true
      }
    });

    if (user) {
      console.log('✅ User found:');
      console.log(JSON.stringify(user, null, 2));
      
      // Check if password is hashed
      if (user.password && user.password.startsWith('$2a$')) {
        console.log('🔐 Password is properly hashed');
      } else {
        console.log('❌ Password is NOT hashed properly');
      }
      
      // Check role
      if (user.role === 'admin') {
        console.log('👑 User has admin role');
      } else {
        console.log(`❌ User role is: "${user.role}" (should be "admin")`);
      }
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
