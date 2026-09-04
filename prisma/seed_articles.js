const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

function simpleSlugify(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0900-\u097F\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function seedArticles() {
  console.log("Seeding Dainik Manyavar Published Articles...");

  // Ensure default categories exist
  const categoriesData = [
    { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh' },
    { name: 'जौनपुर', slug: 'jaunpur' },
    { name: 'राजनीति', slug: 'rajneeti' },
    { name: 'देश', slug: 'desh' },
    { name: 'शिक्षा', slug: 'shiksha' },
    { name: 'स्वास्थ्य', slug: 'swasthya' },
    { name: 'अर्थजगत', slug: 'arthjagat' },
    { name: 'अन्य', slug: 'anya' },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    let cat = await db.category.findUnique({ where: { slug: c.slug } });
    if (!cat) {
      cat = await db.category.create({ data: c });
    }
    catMap[c.slug] = cat.id;
  }

  // Ensure default location exists
  let jaunpurLoc = await db.location.findFirst({ where: { slug: 'jaunpur' } });
  if (!jaunpurLoc) {
    jaunpurLoc = await db.location.create({
      data: { name: 'जौनपुर', slug: 'jaunpur', type: 'DISTRICT' },
    });
  }

  // Sample Articles Data
  const sampleArticles = [
    {
      title: 'पूर्वांचल एक्सप्रेस-वे से चंदौली और सोनभद्र भी जुड़ेंगे, सीएम योगी का बड़ा ऐलान',
      shortDescription: 'पूर्वांचल एक्सप्रेस-वे अब यूपी के अंतिम जिले चंदौली से भी जुड़ेगा। सीएम योगी ने मिर्ज़ापुर व चंदौली कनेक्टिविटी की समीक्षा की।',
      content: '<p>पूर्वांचल एक्सप्रेस-वे अब यूपी के अंतिम जिले चंदौली से भी जुड़ेगा। सीएम योगी ने गुरुवार को चंदौली में इसका ऐलान किया। गंगा एक्सप्रेसवे को पहले ही लिंक एक्सप्रेसवे के जरिए सोनभद्र और चंदौली से जोड़ा जा रहा है।</p><p>इस अवसर पर मुख्यमंत्री ने कई विकास परियोजनाओं का लोकार्पण एवं शिलान्यास भी किया।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'uttar-pradesh',
      viewCount: 2450,
      tags: ['#उत्तर_प्रदेश', '#पूर्वांचल', '#योगी_आदित्यनाथ', '#विकास'],
    },
    {
      title: 'जौनपुर में पुलिस की बड़ी कार्रवाई: शातिर लूट गिरोह के 4 सदस्य गिरफ्तार, अवैध तमंचा बरामद',
      shortDescription: 'जौनपुर कोतवाली पुलिस ने चेकिंग के दौरान अंतरप्रांतीय लूट गिरोह के चार सदस्यों को धर दबोचा। कब्जे से चोरी के जेवर व नकदी बरामद।',
      content: '<p>जौनपुर में अपराधियों पर पुलिस का शिकंजा लगातार कसता जा रहा है। कोतवाली थाना क्षेत्र में बीती रात मुठभेड़ के बाद पुलिस ने चार वांछित अभियुक्तों को दबोच लिया।</p><p>एसपी जौनपुर ने बताया कि आरोपियों के पास से 2 अवैध तमंचे, 4 कारतूस और चोरी की दो मोटरसाइकिलें बरामद की गई हैं।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'jaunpur',
      viewCount: 1820,
      tags: ['#जौनपुर', '#पुलिस_कार्रवाई', '#अपराध'],
    },
    {
      title: 'यूपी में नई शिक्षा नीति लागू: प्राथमिक स्कूलों में लगेंगे स्मार्ट डिजिटल बोर्ड, पठन-पाठन होगा हाईटेक',
      shortDescription: 'उत्तर प्रदेश सरकार ने परिषदीय विद्यालयों में पठन-पाठन को आधुनिक बनाने के लिए 10,000 स्मार्ट क्लास स्थापित करने का निर्णय लिया है।',
      content: '<p>बेसिक शिक्षा विभाग यूपी ने प्राथमिक विद्यालयों के बुनियादी ढांचे को मजबूत करने के लिए नई कार्ययोजना तैयार की है। राज्य के सभी जिलों में स्मार्ट क्लासरूम तैयार किए जा रहे हैं।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'shiksha',
      viewCount: 3100,
      tags: ['#शिक्षा', '#उत्तर_प्रदेश', '#स्मार्ट_क्लास'],
    },
    {
      title: 'मानसून का कहर: यूपी के कई जिलों में भारी बारिश का अलर्ट जारी, नदियां उफान पर',
      shortDescription: 'मौसम विभाग ने अगले 48 घंटों में पूर्वी उत्तर प्रदेश तथा पूर्वांचल के जिलों में अत्यधिक भारी वर्षा का ऑरेंज अलर्ट जारी किया है।',
      content: '<p>गंगा व सरयू नदी का जलस्तर खतरे के निशान के पास पहुंच गया है। प्रशासन ने तटवर्ती क्षेत्रों में चौकसी बढ़ा दी है। आपदा प्रबंधन टीमों को अलर्ट मोड पर रखा गया है।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'uttar-pradesh',
      viewCount: 1650,
      tags: ['#मौसम', '#बारिश', '#पूर्वांचल'],
    },
    {
      title: 'किसानों के लिए बड़ी राहत: केंद्र सरकार ने धान व गेहूं के न्यूनतम समर्थन मूल्य (MSP) में की बढ़ोतरी',
      shortDescription: 'केंद्रीय मंत्रिमंडल ने खरीफ फसलों के समर्थन मूल्य में वृद्धि को मंजूरी दे दी है। किसानों में खुशी की लहर।',
      content: '<p>केंद्रीय कैबिनेट की बैठक में किसानों की आय बढ़ाने के लिए फसलों के MSP में ऐतिहासिक वृद्धि का फैसला लिया गया। नए रेट आगामी सत्र से लागू होंगे।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'desh',
      viewCount: 2210,
      tags: ['#किसान', '#MSP', '#देश'],
    },
    {
      title: 'भारतीय वायुसेना की नई ताकत: राफेल जेट्स की नई स्क्वाड्रन पूर्वी सीमा पर तैनात',
      shortDescription: 'सुरक्षा व्यवस्था को मजबूत करने के लिए भारतीय वायुसेना ने सीमावर्ती एयरबेस पर नए उन्नत लड़ाकू विमान तैनात किए।',
      content: '<p>सुरक्षा मामलों की सर्वोच्‍च समिति ने सीमाई सुरक्षा रणनीति की समीक्षा की। आधुनिक रडार व मिसाइल सिस्टम से लैस नए लड़ाकू बेड़े गश्त करेंगे।</p>',
      featuredImage: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80',
      categorySlug: 'desh',
      viewCount: 1490,
      tags: ['#वायुसेना', '#सुरक्षा', '#देश'],
    },
  ];

  let count = 0;
  for (const artData of sampleArticles) {
    const slugBase = simpleSlugify(artData.title) || `article-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;
    const catId = catMap[artData.categorySlug] || catMap['uttar-pradesh'];

    const created = await db.article.create({
      data: {
        title: artData.title,
        slug,
        excerpt: artData.shortDescription,
        content: artData.content,
        featuredImage: artData.featuredImage,
        category: { connect: { id: catId } },
        location: artData.categorySlug === 'jaunpur' ? { connect: { id: jaunpurLoc.id } } : undefined,
        status: 'PUBLISHED',
        viewCount: artData.viewCount,
        publishedAt: new Date(),
      },
    });

    // Create Tags
    for (const tagText of artData.tags) {
      const tagSlug = simpleSlugify(tagText) || `tag-${Date.now()}`;
      let tagObj = await db.tag.findFirst({ where: { name: tagText } });
      if (!tagObj) {
        tagObj = await db.tag.create({ data: { name: tagText, slug: tagSlug } });
      }

      await db.articleTag.create({
        data: {
          articleId: created.id,
          tagId: tagObj.id,
        },
      });
    }

    count++;
  }

  console.log(`[+] Seeded ${count} published Dainik Manyavar news articles into database!`);
}

seedArticles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
