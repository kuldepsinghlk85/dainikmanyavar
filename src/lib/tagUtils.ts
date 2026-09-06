import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

/**
 * Normalizes any tag string into:
 * - cleanName: without leading #, spaces as underscores (e.g. 'जौनपुर', 'उत्तर_प्रदेश')
 * - standardName: starting with single # (e.g. '#जौनपुर', '#उत्तर_प्रदेश')
 * - slug: URL-friendly slug
 */
export function normalizeTagName(rawName: string): { cleanName: string; standardName: string; slug: string } {
  let cleanName = rawName.replace(/^#+/, '').trim();
  cleanName = cleanName.replace(/\s+/g, '_');
  if (cleanName === 'उत्तरप्रदेश' || cleanName === 'uttar_pradesh' || cleanName === 'uttarpradesh') {
    cleanName = 'उत्तर_प्रदेश';
  }
  const standardName = `#${cleanName}`;
  const slug = slugify(cleanName) || `tag-${Date.now()}`;
  return { cleanName, standardName, slug };
}

/**
 * Finds an existing tag or creates a new one with guaranteed deduplication.
 * Looks up by standardName, cleanName, or slug.
 */
export async function getOrCreateTag(rawName: string, seoTitle?: string, seoDescription?: string) {
  if (!rawName || !rawName.trim()) return null;

  const { cleanName, standardName, slug } = normalizeTagName(rawName);

  let existing = await db.tag.findFirst({
    where: {
      OR: [
        { name: standardName },
        { name: cleanName },
        { slug: slug },
        { name: rawName.trim() },
      ],
    },
  });

  if (existing) {
    if (existing.name !== standardName) {
      existing = await db.tag.update({
        where: { id: existing.id },
        data: { name: standardName },
      });
    }
    return existing;
  }

  return await db.tag.create({
    data: {
      name: standardName,
      slug,
      seoTitle: seoTitle || `${standardName} की ताज़ा ख़बरें | दैनिक मान्यवर`,
      seoDescription: seoDescription || `${standardName} से जुड़ी सभी खबरें और अपडेट दैनिक मान्यवर पर पढ़ें।`,
    },
  });
}
