/**
 * Official Dainik Manyavar Social Media & Channel Details
 * Single source of truth across the entire platform
 */

export const OFFICIAL_SOCIAL_LINKS = {
  website: 'https://dainikmanyavar.com/',
  instagram: 'https://www.instagram.com/dainikmanyavarofficial/',
  youtube: 'https://www.youtube.com/@DainikManyavarOfficial',
  facebook: 'https://www.facebook.com/profile.php?id=61595721003030',
  whatsapp: 'https://wa.me/919336181297',
  whatsappNumber: '+91 93361 81297',
  telegram: 'https://t.me/dainikmanyawar',
  x: 'https://x.com/dainikmanyawar',
  email: 'editor.dainikmanyavar@gmail.com',
};

export const OFFICIAL_HANDLES = {
  instagram: '@dainikmanyavarofficial',
  youtube: '@DainikManyavarOfficial',
  facebook: 'Dainik Manyavar Official',
};

export function buildSocialPostCaption(article: {
  title: string;
  shortUrl: string;
  excerpt?: string;
  category?: string;
}): string {
  const parts: string[] = [
    `📰 *${article.title.trim()}*`,
  ];

  if (article.excerpt && article.excerpt.trim()) {
    parts.push(`\n${article.excerpt.trim()}`);
  }

  parts.push(`\n👉 पूरी खबर पढ़ें:\n${article.shortUrl}`);
  parts.push(`\n━━━━━━━━━━━━━━━━━━━━`);
  parts.push(`दैनिक मान्यवर के आधिकारिक चैनल्स से जुड़ें:`);
  parts.push(`🌐 वेबसाइट: ${OFFICIAL_SOCIAL_LINKS.website}`);
  parts.push(`📸 इंस्टाग्राम: ${OFFICIAL_SOCIAL_LINKS.instagram}`);
  parts.push(`▶️ यूट्यूब: ${OFFICIAL_SOCIAL_LINKS.youtube}`);
  parts.push(`👍 फेसबुक: ${OFFICIAL_SOCIAL_LINKS.facebook}`);
  parts.push(`📲 व्हाट्सएप: ${OFFICIAL_SOCIAL_LINKS.whatsapp}`);

  return parts.join('\n');
}
