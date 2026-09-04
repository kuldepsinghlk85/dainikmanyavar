const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillNewsIds() {
  console.log('Assigning numbered IDs to Dainik Manyavar news articles...');

  const articles = await prisma.article.findMany({
    orderBy: [
      { createdAt: 'asc' },
      { publishedAt: 'asc' },
    ],
    select: { id: true, newsId: true, title: true },
  });

  console.log(`Found ${articles.length} total articles.`);

  // Check if any need assignment
  let maxAssigned = 0;
  for (const a of articles) {
    if (a.newsId && a.newsId > maxAssigned) maxAssigned = a.newsId;
  }

  let nextId = maxAssigned > 0 ? maxAssigned + 1 : 1;
  let updatedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    if (!art.newsId || art.newsId <= 0) {
      await prisma.article.update({
        where: { id: art.id },
        data: { newsId: nextId++ },
      });
      updatedCount++;
    }
  }

  console.log(`[+] Finished! Assigned numbered IDs to ${updatedCount} articles. Latest ID is ${nextId - 1}.`);
}

backfillNewsIds()
  .then(() => prisma.$disconnect().then(() => process.exit(0)))
  .catch((err) => {
    console.error(err);
    prisma.$disconnect().then(() => process.exit(1));
  });
