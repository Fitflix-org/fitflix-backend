const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getFutureISTDateAt(hour, minute, daysFromNow = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  // Build an IST date at given time, then convert to UTC for storage
  const istOffsetMinutes = 5 * 60 + 30; // +05:30
  const y = future.getUTCFullYear();
  const m = future.getUTCMonth();
  const d = future.getUTCDate();
  // Create a date at desired IST time by starting from UTC midnight then adding IST offset and desired time
  const utcDateAtISTTime = new Date(Date.UTC(y, m, d, hour - (istOffsetMinutes / 60), minute - (istOffsetMinutes % 60), 0));
  return utcDateAtISTTime;
}

async function main() {
  const title = 'FitFlix 5K - Health & Wellness Run (Pre-Launch)';
  const newDate = getFutureISTDateAt(6, 0, 7); // 6:00 AM IST, 7 days from now

  const updated = await prisma.event.updateMany({
    where: { title },
    data: { date: newDate, status: 'PUBLISHED' }
  });

  console.log(`Updated ${updated.count} event(s) to future date:`, newDate.toISOString());
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });






