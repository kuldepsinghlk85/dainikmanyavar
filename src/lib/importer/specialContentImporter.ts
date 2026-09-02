import { db } from '@/lib/db';

export async function fetchAndIngestSpecialFeeds() {
  console.log('[SpecialContentImporter] Starting background sync for Cricket, Horoscope, Stock Market, Gold-Silver...');

  const mockFeeds = [
    {
      moduleType: 'CRICKET',
      sourceName: 'ESPN Cricket RSS',
      externalId: `cricket-${Date.now()}`,
      title: 'भारत बनाम वेस्टइंडीज T20 सीरीज का ऐलान, टीम इंडिया में युवा खिलाड़ियों को मौका',
      summary: 'भारतीय क्रिकेट नियंत्रण बोर्ड (BCCI) ने आगामी T20 सीरीज के लिए 15 सदस्यीय टीम की घोषणा कर दी है।',
      suggestedTags: JSON.stringify(['#क्रिकेट', '#भारत', '#BCCI', '#T20']),
    },
    {
      moduleType: 'HOROSCOPE',
      sourceName: 'Astrology News Engine',
      externalId: `horo-${Date.now()}`,
      title: 'आज का विशेष ग्रह गोचर: 4 राशियों के लिए बंपर धन लाभ के योग',
      summary: 'ज्योतिष गणना के अनुसार आज सूर्य व बृहस्पति का शुभ योग बन रहा है जिससे कई राशियों की किस्मत चमकेगी।',
      suggestedTags: JSON.stringify(['#राशिफल', '#ग्रह_गोचर', '#आज_का_राशिफल']),
    },
    {
      moduleType: 'STOCK_MARKET',
      sourceName: 'Financial Express RSS',
      externalId: `market-${Date.now()}`,
      title: 'शेयर बाजार अपडेट: रिलायंस व टाटा मोटर्स में तेजी, बाजार नए रिकॉर्ड पर',
      summary: 'आज कारोबारी सत्र में भारी खरीदारी के चलते सेंसेक्स और निफ्टी में मजबूती देखने को मिली।',
      suggestedTags: JSON.stringify(['#शेयर_बाजार', '#Sensex', '#Nifty']),
    },
    {
      moduleType: 'GOLD_SILVER',
      sourceName: 'Bullion Rates Feed',
      externalId: `gold-${Date.now()}`,
      title: 'सोना हुआ महंगा: 24 कैरेट सोने की कीमत ₹75,000 के पार, चांदी में भी उछाल',
      summary: 'वाराणसी व लखनऊ के सराफा बाजार में आज सोने-चांदी के दामों में बढ़ोतरी दर्ज की गई।',
      suggestedTags: JSON.stringify(['#सोना', '#चांदी', '#सराफा_बाजार']),
    },
  ];

  let importedCount = 0;
  for (const item of mockFeeds) {
    const exists = await db.externalSpecialFeedItem.findFirst({
      where: { title: item.title },
    });

    if (!exists) {
      await db.externalSpecialFeedItem.create({
        data: {
          moduleType: item.moduleType,
          sourceName: item.sourceName,
          externalId: item.externalId,
          title: item.title,
          summary: item.summary,
          suggestedTags: item.suggestedTags,
          status: 'NEW',
        },
      });
      importedCount++;
    }
  }

  return { success: true, count: importedCount };
}
