// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'johnfitness',
      password: 'hashedPassword123', // Note: In production, this should be properly hashed
      firstName: 'John',
      lastName: 'Fitness',
      role: 'user'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      username: 'sarahwellness',
      password: 'hashedPassword456', // Note: In production, this should be properly hashed
      firstName: 'Sarah',
      lastName: 'Wellness',
      role: 'user'
    }
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fitflix.in' },
    update: {},
    create: {
      email: 'admin@fitflix.in',
      username: 'admin',
      password: 'adminPassword123', // Note: In production, this should be properly hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }
  });

  console.log('✅ Users created:', { 
    user1: { username: user1.username, email: user1.email, role: user1.role }, 
    user2: { username: user2.username, email: user2.email, role: user2.role }, 
    admin: { username: adminUser.username, email: adminUser.email, role: adminUser.role } 
  });



  console.log('✅ Blogs created:', {
    blog1: { title: blog1.title, status: blog1.status, author: user1.username },
    blog2: { title: blog2.title, status: blog2.status, author: user1.username },
    blog3: { title: blog3.title, status: blog3.status, author: user2.username },
    blog4: { title: blog4.title, status: blog4.status, author: user1.username },
    blog5: { title: blog5.title, status: blog5.status, author: user2.username }
  });

  // Log database statistics
  const userCount = await prisma.user.count();
  const blogCount = await prisma.blog.count();
  const publishedBlogs = await prisma.blog.count({ where: { status: 'PUBLISHED' } });
  const draftBlogs = await prisma.blog.count({ where: { status: 'DRAFT' } });
  const scheduledBlogs = await prisma.blog.count({ where: { status: 'SCHEDULED' } });

  console.log('📊 Database Statistics:');
  console.log(`  - Total Users: ${userCount}`);
  console.log(`  - Total Blogs: ${blogCount}`);
  console.log(`  - Published Blogs: ${publishedBlogs}`);
  console.log(`  - Draft Blogs: ${draftBlogs}`);
  console.log(`  - Scheduled Blogs: ${scheduledBlogs}`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });