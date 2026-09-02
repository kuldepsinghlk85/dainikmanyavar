const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const rssFeeds = [
  {
    name: "Live Hindustan | Uttar Pradesh",
    publisherName: "Live Hindustan",
    region: "Uttar Pradesh",
    url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml"
  },
  {
    name: "Live Hindustan | Varanasi",
    publisherName: "Live Hindustan",
    region: "Varanasi",
    url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/varanasi/rssfeed.xml"
  },
  {
    name: "Live Hindustan | Jaunpur",
    publisherName: "Live Hindustan",
    region: "Jaunpur",
    url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/jaunpur/rssfeed.xml"
  },
  {
    name: "Live Hindustan | Ghazipur",
    publisherName: "Live Hindustan",
    region: "Ghazipur",
    url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/ghazipur/rssfeed.xml"
  },
  {
    name: "Live Hindustan | Chandauli",
    publisherName: "Live Hindustan",
    region: "Chandauli",
    url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/chandauli/rssfeed.xml"
  },
  {
    name: "Live Hindustan | New Delhi",
    publisherName: "Live Hindustan",
    region: "New Delhi",
    url: "https://api.livehindustan.com/feeds/rss/ncr/new-delhi/rssfeed.xml"
  },
  {
    name: "Live Hindustan | Bihar",
    publisherName: "Live Hindustan",
    region: "Bihar",
    url: "https://api.livehindustan.com/feeds/rss/bihar/rssfeed.xml"
  },
  {
    name: "Amar Ujala | Uttar Pradesh",
    publisherName: "Amar Ujala",
    region: "Uttar Pradesh",
    url: "https://www.amarujala.com/rss/uttar-pradesh.xml"
  },
  {
    name: "Amar Ujala | Varanasi",
    publisherName: "Amar Ujala",
    region: "Varanasi",
    url: "https://www.amarujala.com/rss/varanasi.xml"
  },
  {
    name: "Amar Ujala | Jaunpur",
    publisherName: "Amar Ujala",
    region: "Jaunpur",
    url: "https://www.amarujala.com/rss/jaunpur.xml"
  },
  {
    name: "Amar Ujala | Delhi NCR",
    publisherName: "Amar Ujala",
    region: "Delhi NCR",
    url: "https://www.amarujala.com/rss/delhi-ncr.xml"
  },
  {
    name: "Amar Ujala | Bihar",
    publisherName: "Amar Ujala",
    region: "Bihar",
    url: "https://www.amarujala.com/rss/bihar.xml"
  },
  {
    name: "ABP Live Hindi | Uttar Pradesh / Uttarakhand",
    publisherName: "ABP Live Hindi",
    region: "Uttar Pradesh / Uttarakhand",
    url: "https://www.abplive.com/news/states/up-uk/feed"
  },
  {
    name: "ABP Live Hindi | Delhi NCR",
    publisherName: "ABP Live Hindi",
    region: "Delhi NCR",
    url: "https://www.abplive.com/news/states/delhi-ncr/feed"
  },
  {
    name: "ABP Live Hindi | Bihar",
    publisherName: "ABP Live Hindi",
    region: "Bihar",
    url: "https://www.abplive.com/news/states/bihar/feed"
  }
];

async function seedAndSync() {
  console.log("Seeding 15 RSS sources into database...");

  for (let i = 0; i < rssFeeds.length; i++) {
    const feed = rssFeeds[i];
    const sourceId = `src-rss-${i + 1}`;

    const source = await db.newsSource.upsert({
      where: { id: sourceId },
      update: {
        name: feed.name,
        publisherName: feed.publisherName,
        sourceType: "RSS",
        feedUrl: feed.url,
        permissionMode: "METADATA_ONLY",
        isActive: true
      },
      create: {
        id: sourceId,
        name: feed.name,
        publisherName: feed.publisherName,
        sourceType: "RSS",
        feedUrl: feed.url,
        websiteUrl: feed.url,
        permissionMode: "METADATA_ONLY",
        isActive: true,
        healthStatus: "Healthy"
      }
    });

    console.log(`[+] Source #${i + 1} Seeded: ${source.name}`);
  }

  console.log("\nAll 15 RSS feeds seeded into database successfully!");
}

seedAndSync()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding sources:", err);
    process.exit(1);
  });
