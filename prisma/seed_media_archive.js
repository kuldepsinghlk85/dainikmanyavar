const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const sampleImages = [
  {
    filename: "jaunpur_development_project.jpg",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
    category: "जौनपुर",
    caption: "जौनपुर विकास परियोजना निरीक्षण"
  },
  {
    filename: "uttar_pradesh_budget_assembly.jpg",
    url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    category: "उत्तर प्रदेश",
    caption: "उत्तर प्रदेश विधानसभा बजट सत्र"
  },
  {
    filename: "political_press_conference.jpg",
    url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    category: "राजनीति",
    caption: "राजनीतिक प्रेस कॉन्फ्रेंस जौनपुर"
  },
  {
    filename: "sports_stadium_up.jpg",
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    category: "खेल",
    caption: "पूर्वांचल खेल प्रतियोगिता स्टेडियम"
  }
];

async function runSeed() {
  console.log("Seeding sample images to Media Archive...");
  for (const img of sampleImages) {
    const existing = await db.mediaItem.findFirst({
      where: { filename: img.filename },
    });
    if (!existing) {
      await db.mediaItem.create({
        data: {
          filename: img.filename,
          url: img.url,
          category: img.category,
          caption: img.caption,
          size: 245000,
          mimeType: "image/jpeg",
        },
      });
    }
  }
  console.log("Sample Media Archive seeded successfully!");
}

runSeed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
