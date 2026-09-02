const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function seedPredefinedRssLibrary() {
  console.log("Seeding 15 Regional News RSS Sources + Special Content Sources into Dainik Manyavar CMS...");

  const sources = [
    // 15 REGIONAL NEWS RSS SOURCES (LIVE HINDUSTAN, AMAR UJALA, ABP LIVE)
    {
      name: 'Live Hindustan | Uttar Pradesh',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Uttar Pradesh',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/uttar-pradesh',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | Varanasi',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Varanasi',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/varanasi/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/uttar-pradesh/varanasi',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | Jaunpur',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Jaunpur',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/jaunpur/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/uttar-pradesh/jaunpur',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | Ghazipur',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Ghazipur',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/ghazipur/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/uttar-pradesh/ghazipur',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | Chandauli',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Chandauli',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/chandauli/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/uttar-pradesh/chandauli',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | New Delhi',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'New Delhi',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/ncr/new-delhi/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/ncr/new-delhi',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Live Hindustan | Bihar',
      publisherName: 'Live Hindustan',
      logoUrl: 'https://www.livehindustan.com/favicon.ico',
      category: 'Regional News',
      region: 'Bihar',
      sourceType: 'RSS',
      feedUrl: 'https://api.livehindustan.com/feeds/rss/bihar/rssfeed.xml',
      websiteUrl: 'https://www.livehindustan.com/bihar',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Amar Ujala | Uttar Pradesh',
      publisherName: 'Amar Ujala',
      logoUrl: 'https://www.amarujala.com/favicon.ico',
      category: 'Regional News',
      region: 'Uttar Pradesh',
      sourceType: 'RSS',
      feedUrl: 'https://www.amarujala.com/rss/uttar-pradesh.xml',
      websiteUrl: 'https://www.amarujala.com/uttar-pradesh',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Amar Ujala | Varanasi',
      publisherName: 'Amar Ujala',
      logoUrl: 'https://www.amarujala.com/favicon.ico',
      category: 'Regional News',
      region: 'Varanasi',
      sourceType: 'RSS',
      feedUrl: 'https://www.amarujala.com/rss/varanasi.xml',
      websiteUrl: 'https://www.amarujala.com/uttar-pradesh/varanasi',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Amar Ujala | Jaunpur',
      publisherName: 'Amar Ujala',
      logoUrl: 'https://www.amarujala.com/favicon.ico',
      category: 'Regional News',
      region: 'Jaunpur',
      sourceType: 'RSS',
      feedUrl: 'https://www.amarujala.com/rss/jaunpur.xml',
      websiteUrl: 'https://www.amarujala.com/uttar-pradesh/jaunpur',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Amar Ujala | Delhi NCR',
      publisherName: 'Amar Ujala',
      logoUrl: 'https://www.amarujala.com/favicon.ico',
      category: 'Regional News',
      region: 'Delhi NCR',
      sourceType: 'RSS',
      feedUrl: 'https://www.amarujala.com/rss/delhi-ncr.xml',
      websiteUrl: 'https://www.amarujala.com/delhi-ncr',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Amar Ujala | Bihar',
      publisherName: 'Amar Ujala',
      logoUrl: 'https://www.amarujala.com/favicon.ico',
      category: 'Regional News',
      region: 'Bihar',
      sourceType: 'RSS',
      feedUrl: 'https://www.amarujala.com/rss/bihar.xml',
      websiteUrl: 'https://www.amarujala.com/bihar',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'ABP Live Hindi | Uttar Pradesh / Uttarakhand',
      publisherName: 'ABP Live',
      logoUrl: 'https://www.abplive.com/favicon.ico',
      category: 'Regional News',
      region: 'Uttar Pradesh',
      sourceType: 'RSS',
      feedUrl: 'https://www.abplive.com/news/states/up-uk/feed',
      websiteUrl: 'https://www.abplive.com/news/states/up-uk',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'ABP Live Hindi | Delhi NCR',
      publisherName: 'ABP Live',
      logoUrl: 'https://www.abplive.com/favicon.ico',
      category: 'Regional News',
      region: 'Delhi NCR',
      sourceType: 'RSS',
      feedUrl: 'https://www.abplive.com/news/states/delhi-ncr/feed',
      websiteUrl: 'https://www.abplive.com/news/states/delhi-ncr',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'ABP Live Hindi | Bihar',
      publisherName: 'ABP Live',
      logoUrl: 'https://www.abplive.com/favicon.ico',
      category: 'Regional News',
      region: 'Bihar',
      sourceType: 'RSS',
      feedUrl: 'https://www.abplive.com/news/states/bihar/feed',
      websiteUrl: 'https://www.abplive.com/news/states/bihar',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },

    // CRICKET RSS SOURCES
    {
      name: 'ESPN Cricinfo',
      publisherName: 'ESPN Cricinfo',
      category: 'Cricket',
      region: 'India',
      sourceType: 'RSS',
      feedUrl: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },
    {
      name: 'Google News Cricket Hindi',
      publisherName: 'Google News',
      category: 'Cricket',
      region: 'India',
      sourceType: 'RSS',
      feedUrl: 'https://news.google.com/rss/search?q=क्रिकेट+भारत&hl=hi&gl=IN&ceid=IN:hi',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },

    // RASHIFAL SOURCES
    {
      name: 'Google News Daily Rashifal',
      publisherName: 'Google News',
      category: 'Rashifal',
      region: 'India',
      sourceType: 'RSS',
      feedUrl: 'https://news.google.com/rss/search?q=आज+का+राशिफल+हिंदी&hl=hi&gl=IN&ceid=IN:hi',
      isActive: true,
      autoSync: true,
      syncInterval: 60,
    },

    // STOCK MARKET SOURCES
    {
      name: 'Moneycontrol Market',
      publisherName: 'Moneycontrol',
      category: 'Stock Market',
      region: 'India',
      sourceType: 'RSS',
      feedUrl: 'https://www.moneycontrol.com/rss/MCtopnews.xml',
      isActive: true,
      autoSync: true,
      syncInterval: 15,
    },

    // GOLD SILVER SOURCES
    {
      name: 'Google Gold Silver Hindi',
      publisherName: 'Google News',
      category: 'Gold Silver',
      region: 'India',
      sourceType: 'RSS',
      feedUrl: 'https://news.google.com/rss/search?q=सोना+चांदी+भाव+हिंदी&hl=hi&gl=IN&ceid=IN:hi',
      isActive: true,
      autoSync: true,
      syncInterval: 60,
    },
  ];

  for (const s of sources) {
    const existing = await db.newsSource.findFirst({
      where: { name: s.name },
    });

    if (!existing) {
      await db.newsSource.create({ data: s });
    } else {
      await db.newsSource.update({
        where: { id: existing.id },
        data: s,
      });
    }
  }

  console.log(`[+] Predefined RSS Library seeded with ${sources.length} regional and special news sources!`);
}

seedPredefinedRssLibrary()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
