const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Sample data
const sampleBlogs = [
  {
    title: 'Welcome to Fitflix - Your Fitness Journey Starts Here',
    slug: 'welcome-to-fitflix',
    excerpt: 'Discover how Fitflix can transform your fitness journey with personalized workouts and expert guidance.',
    content: `# Welcome to Fitflix!

Welcome to **Fitflix**, your ultimate destination for fitness and wellness. We're excited to have you join our community of fitness enthusiasts who are committed to living healthier, more active lives.

## What Makes Fitflix Special?

### 🏋️ Personalized Workouts
Our platform offers customized workout plans tailored to your fitness level, goals, and preferences. Whether you're a beginner or an experienced athlete, we have something for everyone.

### 📱 Easy-to-Use Platform
Access your workouts anytime, anywhere with our user-friendly mobile and web applications. Track your progress, set goals, and stay motivated.

### 👥 Community Support
Join thousands of like-minded individuals who are on their own fitness journeys. Share experiences, get tips, and celebrate achievements together.

## Getting Started

1. **Set Your Goals**: Define what you want to achieve
2. **Choose Your Plan**: Select a workout plan that fits your schedule
3. **Start Your Journey**: Begin with your first workout
4. **Track Progress**: Monitor your improvements over time

## Our Commitment

At Fitflix, we're committed to providing you with the tools, resources, and support you need to achieve your fitness goals. Our team of certified trainers and nutritionists work tirelessly to bring you the latest in fitness science and best practices.

Ready to start your fitness journey? Let's get moving! 🚀`,
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    metaTitle: 'Welcome to Fitflix - Your Fitness Journey Starts Here',
    metaDescription: 'Discover how Fitflix can transform your fitness journey with personalized workouts and expert guidance.',
    metaKeywords: 'fitness, workout, health, wellness, personalized training'
  },
  {
    title: '10 Essential Exercises for Beginners',
    slug: '10-essential-exercises-for-beginners',
    excerpt: 'Start your fitness journey with these fundamental exercises that will build strength and confidence.',
    content: `# 10 Essential Exercises for Beginners

Starting a fitness journey can be overwhelming, but these 10 essential exercises will help you build a strong foundation. Each exercise targets major muscle groups and can be performed with minimal equipment.

## 1. Bodyweight Squats
**Target**: Legs, glutes, core
- Stand with feet shoulder-width apart
- Lower your body as if sitting back into a chair
- Keep your chest up and knees behind your toes
- Return to starting position

## 2. Push-ups
**Target**: Chest, shoulders, triceps
- Start in plank position
- Lower your chest to the ground
- Push back up to starting position
- Modify by doing knee push-ups if needed

## 3. Plank
**Target**: Core, shoulders
- Start in push-up position
- Hold your body in a straight line
- Engage your core muscles
- Hold for 30-60 seconds

## 4. Lunges
**Target**: Legs, glutes
- Step forward with one leg
- Lower your back knee toward the ground
- Push back to starting position
- Alternate legs

## 5. Mountain Climbers
**Target**: Full body, cardio
- Start in plank position
- Bring one knee toward your chest
- Quickly switch legs
- Maintain plank position throughout

## 6. Glute Bridges
**Target**: Glutes, hamstrings
- Lie on your back with knees bent
- Lift your hips up
- Squeeze your glutes at the top
- Lower with control

## 7. Bird Dog
**Target**: Core, back
- Start on hands and knees
- Extend opposite arm and leg
- Hold for a few seconds
- Return to starting position
- Switch sides

## 8. Dead Bug
**Target**: Core
- Lie on your back with arms up
- Bring knees to 90 degrees
- Lower opposite arm and leg
- Return to starting position
- Switch sides

## 9. Wall Sit
**Target**: Legs, glutes
- Stand with back against wall
- Slide down until knees are at 90 degrees
- Hold position
- Keep back flat against wall

## 10. Jumping Jacks
**Target**: Full body, cardio
- Start with feet together
- Jump feet apart while raising arms
- Jump back to starting position
- Maintain steady rhythm

## Getting Started Tips

- **Start Slow**: Begin with 2-3 sets of 8-12 repetitions
- **Focus on Form**: Quality over quantity
- **Rest**: Take 30-60 seconds between sets
- **Progress Gradually**: Increase reps or sets as you get stronger
- **Listen to Your Body**: Stop if you feel pain

## Equipment Needed

Most of these exercises require no equipment, making them perfect for home workouts. You can enhance your workouts with:
- Yoga mat for comfort
- Resistance bands for added challenge
- Light dumbbells for progression

Remember, consistency is key. Start with these exercises 2-3 times per week and gradually increase frequency as your fitness improves.`,
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    metaTitle: '10 Essential Exercises for Beginners - Complete Guide',
    metaDescription: 'Start your fitness journey with these fundamental exercises that will build strength and confidence.',
    metaKeywords: 'beginner exercises, bodyweight workout, home fitness, strength training'
  }
];

const sampleEvents = [
  {
    title: 'Fitflix Community Workout',
    description: 'Join us for a fun and energetic community workout session! Perfect for all fitness levels.',
    location: 'Central Park, New York',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    entryFee: 0,
    status: 'PUBLISHED',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'
    ]
  },
  {
    title: 'Yoga & Meditation Workshop',
    description: 'Learn the fundamentals of yoga and meditation for stress relief and improved flexibility.',
    location: 'Fitflix Studio, Downtown',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    entryFee: 25.00,
    status: 'PUBLISHED',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ]
  }
];

const sampleLeads = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    location: 'New York, NY',
    source: 'Website',
    interest: 'Personal Training',
    status: 'NEW',
    notes: 'Interested in personal training sessions. Prefers morning workouts.'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0456',
    location: 'Los Angeles, CA',
    source: 'Social Media',
    interest: 'Group Classes',
    status: 'CONTACTED',
    notes: 'Referred by friend. Interested in group fitness classes.'
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1-555-0789',
    location: 'Chicago, IL',
    source: 'Google Ads',
    interest: 'Nutrition Consultation',
    status: 'INTERESTED',
    notes: 'Looking for nutrition guidance along with fitness program.'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed admin users first
    console.log('\n👤 Seeding admin users...');
    const { seedAdminUsers } = require('./seed-admin');
    await seedAdminUsers();

    // Seed blogs
    console.log('\n📝 Seeding blogs...');
    for (const blogData of sampleBlogs) {
      const existingBlog = await prisma.blog.findUnique({
        where: { slug: blogData.slug }
      });

      if (!existingBlog) {
        const blog = await prisma.blog.create({
          data: blogData
        });
        console.log(`✅ Created blog: ${blog.title}`);
      } else {
        console.log(`⚠️  Blog already exists: ${blogData.title}`);
      }
    }

    // Seed events
    console.log('\n📅 Seeding events...');
    for (const eventData of sampleEvents) {
      const existingEvent = await prisma.event.findFirst({
        where: { title: eventData.title }
      });

      if (!existingEvent) {
        const event = await prisma.event.create({
          data: eventData
        });
        console.log(`✅ Created event: ${event.title}`);
      } else {
        console.log(`⚠️  Event already exists: ${eventData.title}`);
      }
    }

    // Seed leads
    console.log('\n👥 Seeding leads...');
    for (const leadData of sampleLeads) {
      const existingLead = await prisma.lead.findFirst({
        where: { email: leadData.email }
      });

      if (!existingLead) {
        const lead = await prisma.lead.create({
          data: leadData
        });
        console.log(`✅ Created lead: ${lead.name}`);
      } else {
        console.log(`⚠️  Lead already exists: ${leadData.name}`);
      }
    }

    // Display summary
    const blogCount = await prisma.blog.count();
    const eventCount = await prisma.event.count();
    const leadCount = await prisma.lead.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });

    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`👤 Admin Users: ${adminCount}`);
    console.log(`📝 Blogs: ${blogCount}`);
    console.log(`📅 Events: ${eventCount}`);
    console.log(`👥 Leads: ${leadCount}`);

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedDatabase();
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

module.exports = { seedDatabase };
