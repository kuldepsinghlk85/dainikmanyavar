const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0900-\u097F\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeKey(name) {
  let cleaned = name.replace(/^#+/, '').trim().toLowerCase();
  cleaned = cleaned.replace(/\s+/g, '_');
  if (cleaned === 'उत्तरप्रदेश' || cleaned === 'uttar_pradesh' || cleaned === 'uttarpradesh') {
    return 'उत्तर_प्रदेश';
  }
  return cleaned;
}

async function deduplicateAndNormalizeTags() {
  console.log('=== Starting Tag Deduplication & Normalization ===');

  const allTags = await prisma.tag.findMany({
    include: {
      articleTags: true,
    },
  });

  console.log(`Found ${allTags.length} tags in database.`);

  const groups = new Map();

  for (const tag of allTags) {
    const key = normalizeKey(tag.name);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(tag);
  }

  console.log(`Identified ${groups.size} unique normalized tag groups.`);

  let mergedGroupsCount = 0;
  let deletedTagsCount = 0;
  let remappedArticleTagsCount = 0;

  for (const [key, tags] of groups.entries()) {
    let baseName = key;
    const hindiTag = tags.find((t) => /[\u0900-\u097F]/.test(t.name));
    if (hindiTag) {
      baseName = hindiTag.name.replace(/^#+/, '').trim();
    }
    if (key === 'उत्तर_प्रदेश') baseName = 'उत्तर_प्रदेश';

    const standardName = `#${baseName}`;
    const standardSlug = slugify(baseName) || `tag-${key}`;

    if (tags.length > 1) {
      mergedGroupsCount++;
      console.log(`\nMerging group '${key}' with ${tags.length} duplicates:`);
      tags.forEach((t) => console.log(` - ID: ${t.id}, Name: "${t.name}", Slug: "${t.slug}", Articles: ${t.articleTags.length}`));

      tags.sort((a, b) => {
        if (b.articleTags.length !== a.articleTags.length) {
          return b.articleTags.length - a.articleTags.length;
        }
        return (b.name.startsWith('#') ? 1 : 0) - (a.name.startsWith('#') ? 1 : 0);
      });

      const canonical = tags[0];
      const duplicates = tags.slice(1);

      console.log(` => Keeping canonical tag: ID: ${canonical.id} ("${canonical.name}")`);

      for (const dup of duplicates) {
        for (const at of dup.articleTags) {
          const existingLink = await prisma.articleTag.findUnique({
            where: {
              articleId_tagId: {
                articleId: at.articleId,
                tagId: canonical.id,
              },
            },
          });

          if (existingLink) {
            await prisma.articleTag.delete({
              where: { id: at.id },
            });
          } else {
            await prisma.articleTag.update({
              where: { id: at.id },
              data: { tagId: canonical.id },
            });
            remappedArticleTagsCount++;
          }
        }

        await prisma.tag.delete({
          where: { id: dup.id },
        });
        deletedTagsCount++;
        console.log(`  [x] Deleted duplicate tag ID: ${dup.id} ("${dup.name}")`);
      }

      await prisma.tag.update({
        where: { id: canonical.id },
        data: {
          name: standardName,
          slug: standardSlug,
        },
      });
      console.log(`  [✔] Canonical tag updated: "${standardName}" (slug: "${standardSlug}")`);
    } else {
      const tag = tags[0];
      if (tag.name !== standardName || !tag.slug || tag.slug === '_' || tag.slug === '') {
        await prisma.tag.update({
          where: { id: tag.id },
          data: {
            name: standardName,
            slug: standardSlug,
          },
        });
        console.log(`Normalized single tag: "${tag.name}" -> "${standardName}" (slug: "${standardSlug}")`);
      }
    }
  }

  const finalTags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articleTags: true } } },
  });

  console.log('\n=== Deduplication Summary ===');
  console.log(`Groups merged: ${mergedGroupsCount}`);
  console.log(`Duplicate tags deleted: ${deletedTagsCount}`);
  console.log(`ArticleTag relations remapped: ${remappedArticleTagsCount}`);
  console.log(`Final total tags count: ${finalTags.length}`);
}

if (require.main === module) {
  deduplicateAndNormalizeTags()
    .catch((e) => {
      console.error('Error during deduplication:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { deduplicateAndNormalizeTags };
