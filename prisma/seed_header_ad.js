const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function runSeed() {
  console.log("Setting active advertisement creative for Header Ad Slot (header_wide)...");

  await db.adSlot.upsert({
    where: { position: 'header_wide' },
    // Keep update empty so custom user-uploaded ad creative is never overwritten on seed
    update: {},
    create: {
      name: 'शीर्ष हेडर विज्ञापन (Header Ad Slot 468×60)',
      position: 'header_wide',
      desktopCreative: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
      targetUrl: '/advertise',
      active: true,
    },
  });

  console.log("Header Ad Slot active creative set successfully!");
}

runSeed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
