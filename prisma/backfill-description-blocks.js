// Backfill legacy descriptionBlocks (string[]) into descriptionBlocksRich (Json[])
/*
  Usage:
    node prisma/backfill-description-blocks.js
*/
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function toStructuredBlocks(legacy) {
  if (!Array.isArray(legacy)) return [];
  return legacy.map((block) => {
    if (typeof block === 'string') {
      const s = block.trim();
      if (s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          if (parsed && (typeof parsed.title === 'string' || typeof parsed.description === 'string' || Array.isArray(parsed.items))) {
            return { title: parsed.title, description: parsed.description, items: Array.isArray(parsed.items) ? parsed.items : undefined };
          }
        } catch (_) {
          // ignore and fall through
        }
      }
      return { description: block };
    }
    // Already structured-like
    return { title: block.title, description: block.description, items: Array.isArray(block.items) ? block.items : undefined };
  });
}

(async () => {
  try {
    const events = await prisma.event.findMany({
      select: { id: true, descriptionBlocks: true, descriptionBlocksRich: true }
    });

    let updated = 0;
    for (const evt of events) {
      const legacy = evt.descriptionBlocks;
      const rich = evt.descriptionBlocksRich;
      if ((!rich || (Array.isArray(rich) && rich.length === 0)) && Array.isArray(legacy) && legacy.length > 0) {
        const structured = toStructuredBlocks(legacy);
        await prisma.event.update({
          where: { id: evt.id },
          data: { descriptionBlocksRich: structured }
        });
        updated++;
      }
    }
    console.log(`Backfill complete. Updated ${updated} event(s).`);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
