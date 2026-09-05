const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function updateDbWithRealPages() {
  console.log("Updating all E-Paper editions and pages with real newspaper page images...");

  const pageImages = [
    { num: 1, url: '/uploads/epaper/pages/page_1.png', title: 'पेज 1 - मुख्य समाचार (Front Page)' },
    { num: 2, url: '/uploads/epaper/pages/page_2.png', title: 'पेज 2 - जौनपुर आसपास व अदालती नोटिस' },
    { num: 3, url: '/uploads/epaper/pages/page_3.jpg', title: 'पेज 3 - पूर्वांचल प्रादेशिक समाचार' },
    { num: 4, url: '/uploads/epaper/pages/page_4.png', title: 'पेज 4 - संपादकीय व विशेष आलेख' },
    { num: 5, url: '/uploads/epaper/pages/page_5.png', title: 'पेज 5 - राष्ट्रीय, अर्थजगत व खेलकूद' },
    { num: 6, url: '/uploads/epaper/pages/page_6.png', title: 'पेज 6 - बलिया, मऊ व आजमगढ़ हलचल' },
    { num: 7, url: '/uploads/epaper/pages/page_7.png', title: 'पेज 7 - सोनभद्र व मऊ विकास वार्ता' },
    { num: 8, url: '/uploads/epaper/pages/page_8.jpg', title: 'पेज 8 - वाराणसी महानगर मुख्य पृष्ठ' },
  ];

  const editions = await db.epaperEdition.findMany();

  for (const ed of editions) {
    const existingPagesCount = await db.epaperPage.count({ where: { editionId: ed.id } });
    if (existingPagesCount > 0) {
      console.log(`[i] Edition "${ed.title}" already has ${existingPagesCount} pages. Skipping to preserve content.`);
      continue;
    }

    // Update Edition Cover Image to Real Page 1
    await db.epaperEdition.update({
      where: { id: ed.id },
      data: {
        coverImage: '/uploads/epaper/pages/page_1.png',
        totalPages: 8,
      },
    });

    for (const p of pageImages) {
      await db.epaperPage.create({
        data: {
          editionId: ed.id,
          pageNumber: p.num,
          pageTitle: p.title,
          pageImage: p.url,
          thumbnailImage: p.url,
        },
      });
    }
    console.log(`[+] Updated Edition: ${ed.title} (${ed.id}) with 8 real pages`);
  }

  console.log("[✔] All E-Paper editions updated with real printed newspaper pages!");
}

updateDbWithRealPages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
