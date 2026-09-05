const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const sampleAds = [
  {
    position: 'sidebar_box',
    name: 'साइडबार विज्ञापन #1 (Sidebar Ad #1 - 300x250)',
    desktopCreative: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    targetUrl: '/advertise',
    active: true
  },
  {
    position: 'sidebar_tall',
    name: 'साइडबार विज्ञापन #2 (Sidebar Ad #2 - 300x300)',
    desktopCreative: 'https://images.unsplash.com/photo-1542744094-3a31727202b3?auto=format&fit=crop&w=600&q=80',
    targetUrl: '/contact',
    active: true
  },
  {
    position: 'sidebar_box2',
    name: 'साइडबार विज्ञापन #3 (Sidebar Ad #3 - 300x250)',
    desktopCreative: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    targetUrl: '/advertise',
    active: true
  }
];

async function seedAds() {
  console.log("Seeding 3 realistic sample advertisements into AdSlot...");
  for (const ad of sampleAds) {
    await db.adSlot.upsert({
      where: { position: ad.position },
      // Keep update empty so custom user-uploaded ad creative is never overwritten on seed
      update: {},
      create: {
        name: ad.name,
        position: ad.position,
        desktopCreative: ad.desktopCreative,
        targetUrl: ad.targetUrl,
        active: true
      }
    });
    console.log(`[+] Seeded Ad Slot: ${ad.position}`);
  }
  console.log("3 Sample Ads seeded successfully!");
}

seedAds().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
