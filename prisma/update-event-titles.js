const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find the existing event
  const existingEvent = await prisma.event.findFirst({
    where: {
      title: 'FitFlix 5K - Health & Wellness Run (Pre-Launch)'
    }
  });

  if (!existingEvent) {
    console.log('No event found to update');
    return;
  }

  // Update the event with new title fields
  const updatedEvent = await prisma.event.update({
    where: { id: existingEvent.id },
    data: {
      title1: 'FitFlix 5K',
      title2: 'Health & Wellness Run',
      title3: 'Sainikpuri Community Event',
      description: 'Join us for an energizing 5K run that brings together fitness enthusiasts and introduces you to the upcoming FitFlix Wellness Club in Sainikpuri.'
    }
  });

  console.log('Updated event with new titles:', updatedEvent.id);
  console.log('Title1:', updatedEvent.title1);
  console.log('Title2:', updatedEvent.title2);
  console.log('Title3:', updatedEvent.title3);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


