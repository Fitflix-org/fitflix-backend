const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@fitflixgyms.in' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    console.log('📧 Existing admin details:', {
      id: existingAdmin.id,
      email: existingAdmin.email,
      username: existingAdmin.username,
      role: existingAdmin.role
    });
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('FitFlix@123', 12);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fitflixgyms.in',
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
  console.log('   Email: admin@fitflixgyms.in');
  console.log('   Password: FitFlix@123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
