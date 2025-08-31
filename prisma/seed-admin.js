const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin user already exists by both email and username
  const existingAdminByEmail = await prisma.user.findUnique({
    where: { email: 'admin@fitflix.com' }
  });

  const existingAdminByUsername = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (existingAdminByEmail) {
    console.log('✅ Admin user already exists with email admin@fitflix.com');
    console.log('📧 Existing admin details:', {
      id: existingAdminByEmail.id,
      email: existingAdminByEmail.email,
      username: existingAdminByUsername.username,
      role: existingAdminByUsername.role
    });
    return;
  }

  if (existingAdminByUsername) {
    console.log('⚠️  Username "admin" already exists, but with different email');
    console.log('📧 Existing user with username "admin":', {
      id: existingAdminByUsername.id,
      email: existingAdminByUsername.email,
      username: existingAdminByUsername.username,
      role: existingAdminByUsername.role
    });
    
    // Check if the existing user is already an admin
    if (existingAdminByUsername.role === 'admin') {
      console.log('✅ Admin user already exists with username "admin"');
      console.log('💡 You can use the existing admin account or create a new one with different credentials');
      console.log('');
      console.log('🔑 Existing admin credentials:');
      console.log(`   Email: ${existingAdminByUsername.email}`);
      console.log(`   Username: ${existingAdminByUsername.username}`);
      console.log(`   Role: ${existingAdminByUsername.role}`);
      return;
    } else {
      console.log('💡 The existing user is not an admin. Consider updating their role or using a different username.');
      return;
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fitflix.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      emailVerified: true
    }
  });

  console.log('✅ Admin user created successfully:', {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    role: adminUser.role
  });

  console.log('🔑 Login credentials:');
  console.log('   Email: admin@fitflix.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
