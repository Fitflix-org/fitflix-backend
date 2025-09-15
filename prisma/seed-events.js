const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Parse event details
  const eventTitle = 'FitFlix 5K - Health & Wellness Run (Pre-Launch)';
  const description = 'Join us for an energizing 5K run that brings together fitness enthusiasts and introduces you to the upcoming FitFlix Wellness Club in Sainikpuri.';
  const details = {
    included: [
      'Free event t-shirt',
      'Refreshments & snacks',
      'Participation certificate',
      'FitFlix membership trial',
      'Health & wellness tips'
    ],
    benefits: [
      'Cardiovascular fitness',
      'Community connection',
      'Mental wellness boost',
      'Goal achievement',
      'Healthy lifestyle start'
    ],
    schedule: [
      '5:30 AM - Registration',
      '6:00 AM - Warm-up session',
      '6:15 AM - 5K run starts',
      '7:30 AM - Refreshments',
      '8:00 AM - Prize distribution'
    ],
    routeInfo: 'The 5K route starts and ends at Sainikpuri Park, taking you through the scenic neighborhoods of Sainikpuri. The route is well-marked, safe, and suitable for all fitness levels. Water stations will be available at the 2.5K mark.'
  };

  // December 15, 2024, 6:00 AM Asia/Kolkata
  const date = new Date('2024-12-15T00:30:00.000Z'); // 06:00 IST == 00:30 UTC

  const eventData = {
    title: eventTitle,
    title1: 'FitFlix 5K',
    title2: 'Health & Wellness Run',
    title3: 'Sainikpuri Community Event',
    description,
    details,
    descriptionBlocks: [
      'Join us for an energizing 5K run in Sainikpuri.',
      'Open to all fitness levels. Family-friendly event.'
    ],
    coverImage: 'https://fitflix.in/media/placeholder.svg',
    imageUrls: [],
    location: 'Sainikpuri Park, Hyderabad',
    date,
    entryFee: 0,
    status: 'PUBLISHED'
  };

  const existing = await prisma.event.findFirst({
    where: {
      title: eventTitle,
      date
    }
  });

  if (existing) {
    console.log('Event already exists. Skipping create.');
  } else {
    const created = await prisma.event.create({ data: eventData });
    console.log('Seeded event:', created.id, created.title);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


