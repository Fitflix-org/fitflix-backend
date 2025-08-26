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
      username: 'johnfitness'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      username: 'sarahwellness'
    }
  });

  console.log('✅ Users created:', { user1: user1.username, user2: user2.username });

  // Create test blogs
  const blog1 = await prisma.blog.upsert({
    where: { slug: 'getting-started-with-fitness' },
    update: {},
    create: {
      title: 'Getting Started with Fitness: A Beginner\'s Guide',
      slug: 'getting-started-with-fitness',
      excerpt: 'Learn the fundamentals of starting your fitness journey with practical tips and advice.',
      content: `# Getting Started with Fitness: A Beginner's Guide

Starting your fitness journey can be overwhelming, but it doesn't have to be. Here are some key principles to help you get started:

## 1. Start Small
Don't try to do everything at once. Begin with simple exercises and gradually increase intensity.

## 2. Consistency is Key
It's better to exercise for 20 minutes every day than 2 hours once a week.

## 3. Listen to Your Body
Pay attention to how your body feels and don't push through pain.

## 4. Set Realistic Goals
Start with achievable goals and celebrate small victories.

Remember, everyone starts somewhere. The important thing is to begin!`,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'Getting Started with Fitness - Beginner\'s Guide',
      metaDescription: 'Learn how to start your fitness journey with practical tips and advice for beginners.',
      metaKeywords: 'fitness, beginner, workout, health, exercise'
    }
  });

  const blog2 = await prisma.blog.upsert({
    where: { slug: 'nutrition-basics-for-athletes' },
    update: {},
    create: {
      title: 'Nutrition Basics for Athletes',
      slug: 'nutrition-basics-for-athletes',
      excerpt: 'Understanding the fundamentals of sports nutrition to fuel your workouts and recovery.',
      content: `# Nutrition Basics for Athletes

Proper nutrition is crucial for athletic performance and recovery. Here's what you need to know:

## Macronutrients
- **Proteins**: Essential for muscle repair and growth
- **Carbohydrates**: Primary fuel source for high-intensity exercise
- **Fats**: Important for hormone production and long-term energy

## Hydration
Stay hydrated throughout the day, especially before, during, and after workouts.

## Timing
Eat a balanced meal 2-3 hours before exercise and refuel within 30 minutes after.

## Supplements
While whole foods should be your primary source of nutrients, some supplements can be beneficial.

Remember, nutrition is highly individual. Experiment to find what works best for you!`,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'Nutrition Basics for Athletes - Complete Guide',
      metaDescription: 'Learn the fundamentals of sports nutrition to optimize your athletic performance and recovery.',
      metaKeywords: 'nutrition, athletes, sports nutrition, protein, carbohydrates, hydration'
    }
  });

  const blog3 = await prisma.blog.upsert({
    where: { slug: 'workout-recovery-tips' },
    update: {},
    create: {
      title: 'Essential Workout Recovery Tips',
      slug: 'workout-recovery-tips',
      excerpt: 'Maximize your gains and prevent injuries with these essential recovery strategies.',
      content: `# Essential Workout Recovery Tips

Recovery is just as important as the workout itself. Here are key strategies:

## Sleep
Aim for 7-9 hours of quality sleep per night for optimal recovery.

## Nutrition
Consume protein and carbohydrates within the recovery window.

## Stretching
Incorporate dynamic stretching before workouts and static stretching after.

## Rest Days
Schedule regular rest days to allow your body to repair and adapt.

## Active Recovery
Light activities like walking or swimming can enhance recovery.

## Listen to Your Body
If you're feeling run down, it's okay to take an extra rest day.

Recovery is when your body gets stronger. Don't skip it!`,
      status: 'DRAFT',
      metaTitle: 'Workout Recovery Tips - Maximize Your Gains',
      metaDescription: 'Learn essential recovery strategies to maximize your workout gains and prevent injuries.',
      metaKeywords: 'recovery, workout, rest, stretching, sleep, nutrition'
    }
  });

  // Create a scheduled blog to showcase the new publishing functionality
  const blog4 = await prisma.blog.upsert({
    where: { slug: 'advanced-workout-techniques' },
    update: {},
    create: {
      title: 'Advanced Workout Techniques for Experienced Athletes',
      slug: 'advanced-workout-techniques',
      excerpt: 'Take your fitness to the next level with these advanced training methods.',
      content: `# Advanced Workout Techniques for Experienced Athletes

Ready to push your limits? Here are advanced techniques to challenge even the most experienced athletes:

## Supersets and Circuits
Combine multiple exercises with minimal rest for maximum intensity.

## Drop Sets
Start with heavy weights and gradually decrease weight while maintaining reps.

## Pyramid Training
Progressive weight increases with decreasing reps, then reverse the pattern.

## Eccentric Training
Focus on the lowering phase of exercises for increased strength gains.

## Isometric Holds
Static holds at various points in the movement to build stability.

## Advanced Plyometrics
Explosive movements that enhance power and athletic performance.

Remember to master basic movements before attempting advanced techniques!`,
      status: 'SCHEDULED',
      scheduledPublishAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Schedule for tomorrow
      metaTitle: 'Advanced Workout Techniques - Expert Training Methods',
      metaDescription: 'Discover advanced workout techniques to challenge experienced athletes and take your fitness to the next level.',
      metaKeywords: 'advanced workout, training techniques, supersets, drop sets, plyometrics, athletic performance'
    }
  });

  console.log('✅ Blogs created:', {
    blog1: blog1.title,
    blog2: blog2.title,
    blog3: blog3.title,
    blog4: blog4.title
  });

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