const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding alternative admin user...');

  // Check if admin user already exists with the new email
  const existingAdminByEmail = await prisma.user.findUnique({
    where: { email: 'admin@fitflix.com' }
  });

  if (existingAdminByEmail) {
    console.log('✅ Admin user already exists with email admin@fitflix.com');
    console.log('📧 Existing admin details:', {
      id: existingAdminByEmail.id,
      email: existingAdminByEmail.email,
      username: existingAdminByEmail.username,
      role: existingAdminByEmail.role
    });
    return;
  }

  // Check if username "superadmin" is available
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { username: 'superadmin' }
  });

  if (existingSuperAdmin) {
    console.log('⚠️  Username "superadmin" already exists');
    console.log('📧 Existing user details:', {
      id: existingSuperAdmin.id,
      email: existingSuperAdmin.email,
      username: existingSuperAdmin.username,
      role: existingSuperAdmin.role
    });
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create alternative admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fitflix.com',
      username: 'superadmin',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      emailVerified: true
    }
  });

  console.log('✅ Alternative admin user created successfully:', {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    role: adminUser.role
  });

  console.log('🔑 Login credentials:');
  console.log('   Email: admin@fitflix.com');
  console.log('   Username: superadmin');
  console.log('   Password: admin123');
  console.log('');
  console.log('💡 Note: This is an additional admin user. You also have:');
  console.log('   Email: admin@fitflix.in');
  console.log('   Username: admin');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding alternative admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
