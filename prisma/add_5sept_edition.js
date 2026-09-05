const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function add5SeptEdition() {
  console.log("Adding/Updating Official 05 September 2026 Dainik Manyavar E-Paper Edition...");

  const date5Sept = new Date('2026-09-05T00:00:00.000Z');

  // Check if 5 Sept edition already exists
  const existingEdition = await db.epaperEdition.findFirst({
    where: {
      title: { contains: '5 सितंबर' },
    },
  });

  if (existingEdition) {
    console.log("[i] 5 September edition already exists in database. Skipping creation to preserve content.");
    return;
  }

  edition = await db.epaperEdition.create({
    data: {
      title: `दैनिक मान्यवर - वाराणसी एवं पूर्वांचल संस्करण (5 सितंबर 2026)`,
      editionDate: date5Sept,
      editionType: 'दैनिक',
      pdfUrl: '/uploads/epaper/manyavar_varanasi_5sept.pdf',
      coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      description: `दैनिक मान्यवर ई-पेपर डिजिटल संस्करण: वाराणसी, जौनपुर, पूर्वांचल व उत्तर प्रदेश की ताज़ा खबरें (5 सितंबर 2026, 8 पृष्ठ)`,
      totalPages: 8,
      status: 'PUBLISHED',
      viewCount: 4120,
    },
  });

  const pagesData = [
    {
      num: 1,
      title: 'पेज 1 - मुख्य पृष्ठ (Front Page - 5 सितंबर 2026)',
      img: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - 5 सितंबर 2026 - मुख्य पृष्ठ
1. शिक्षक दिवस विशेष: देश भर में शिक्षकों को नमन, राष्ट्रपति व सीएम योगी ने दीं शुभकामनाएं।
2. पीएम नरेंद्र मोदी की जी-20 व बेल्जियम व्यापार द्विपक्षीय वार्ता सफल।
3. उत्तर प्रदेश में मानसून फिर सक्रिय, वाराणसी, पूर्वांचल व लखनऊ में भारी बारिश का अलर्ट जारी।
4. जी-20 समिट व ब्रिक्स लीडर्स सम्मेलन की तैयारियां तेज।
5. वाराणसी में गंगा नदी का जलस्तर खतरे के निशान के पास स्थिर, प्रशासन हाई अलर्ट पर।`,
    },
    {
      num: 2,
      title: 'पेज 2 - वाराणसी महानगर व जौनपुर आसपास',
      img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 2 (वाराणसी व जौनपुर)
1. जौनपुर में विकास कार्यों की समीक्षा बैठक, जिलाधिकारी सैमुअल पाल एन ने दिए सख्त निर्देश।
2. केराकत में श्रीकृष्ण जन्माष्टमी पर झांकियों की धूम, श्रद्धालुओं का उमड़ा जनसैलाब।
3. जलकल विभाग वाराणसी निविदा आमंत्रण।`,
    },
    {
      num: 3,
      title: 'पेज 3 - पूर्वांचल प्रादेशिक समाचार (भदोही, मीरजापुर, चंदौली, गाजीपुर)',
      img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 3 (पूर्वांचल विशेष)
1. मुख्यमंत्री युवा उद्यमी विकास योजना के तहत युवाओं को 5 लाख तक ब्याज मुक्त ऋण।
2. भदोही कालीन अमेरिका निर्यात में रिकॉर्ड वृद्धि, एक्मा सेमिनार आयोजित।
3. सोनभद्र बाणसागर अलर्ट, तटवर्ती इलाकों में प्रशासन अलर्ट पर।`,
    },
    {
      num: 4,
      title: 'पेज 4 - संपादकीय व विशेष आलेख',
      img: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 4 (संपादकीय)
1. संपादकीय: शिक्षा और राष्ट्र निर्माण में गुरुओं की भूमिका।
2. विशेष आलेख: वैश्विक मंच पर भारत की आर्थिक महाशक्ति के रूप में उभरती साख।`,
    },
    {
      num: 5,
      title: 'पेज 5 - व्यापार, अर्थजगत, शेयर बाजार व खेलकूद',
      img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 5 (व्यापार व खेल)
1. भारतीय शेयर बाजार में तेजी, सेंसेक्स 350 अंक उछला।
2. सर्राफा बाजार: सोना व चांदी के दामों में नरमी।
3. एशियाई गेम्स 2026: भारतीय क्रिकेट टीम की जोरदार तैयारियां।`,
    },
    {
      num: 6,
      title: 'पेज 6 - बलिया, मऊ व आजमगढ़ हलचल',
      img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 6 (बलिया व आजमगढ़)
1. बलिया पुलिस का वज्रपात अभियान, मनचलों और असमाजिक तत्वों पर कसा शिकंजा।
2. आजमगढ़ दिव्यांग युवाओं के कौशल विकास में अग्रणी।`,
    },
    {
      num: 7,
      title: 'पेज 7 - सोनभद्र व मऊ विकास वार्ता',
      img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 7 (सोनभद्र व मऊ)
1. बाणसागर बांध से पानी छोड़े जाने के बाद प्रशासन मुस्तैद।
2. सोनभद्र में निःशुल्क पशु टीकाकरण शिविर संपन्न।`,
    },
    {
      num: 8,
      title: 'पेज 8 - वाराणसी महानगर विशेष (गंगा जलस्तर व बीएचयू शोध)',
      img: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80',
      text: `दैनिक मान्यवर - पेज 8 (वाराणसी मुख्य)
1. काशी में गंगा नदी के तटवर्ती क्षेत्रों में राहत शिविर सक्रिय।
2. बीएचयू के वैज्ञानिकों ने विकसित की मूंग की उन्नत किस्म एचयूएम 27।
3. आनंद काशी आवासीय योजना में 1004 भूखंडों का आवंटन।`,
    },
  ];

  for (const p of pagesData) {
    await db.epaperPage.create({
      data: {
        editionId: edition.id,
        pageNumber: p.num,
        pageTitle: p.title,
        pageImage: p.img,
        thumbnailImage: p.img,
        extractedText: p.text,
      },
    });
  }

  console.log(`[+] Successfully created & published 05 September 2026 E-Paper Edition (ID: ${edition.id})`);
}

add5SeptEdition()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
