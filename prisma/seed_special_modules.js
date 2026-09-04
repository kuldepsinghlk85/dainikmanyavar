const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function seedSpecialModules() {
  console.log("Seeding Special Content Modules...");

  // 1. Seed 12 Zodiac Horoscopes
  const zodiacSigns = [
    { zodiacSign: 'mesh', zodiacHindi: 'मेष (Aries)', title: 'आज का राशिफल: मेष राशि', prediction: 'आज व्यापार में धन लाभ का योग है। नौकरीपेशा लोगों को पदोन्नति का शुभ समाचार मिल सकता है। स्वास्थ्य उत्तम रहेगा।', love: 'सकारात्मक दृष्टिकोण बना रहेगा।', career: 'नया प्रोजेक्ट प्राप्त होगा।', health: 'ऊर्जावान महसूस करेंगे।', finance: 'निवेश में वृद्धि होगी।', luckyNumber: '9', luckyColor: 'लाल (Red)' },
    { zodiacSign: 'vrishabh', zodiacHindi: 'वृषभ (Taurus)', title: 'आज का राशिफल: वृषभ राशि', prediction: 'परिवार में सुख और शांति रहेगी। धन के लेन-देन में सतर्कता बरतें। कार्यक्षेत्र में अधिकारियों का सहयोग मिलेगा।', love: 'रिश्तों में मधुरता रहेगी।', career: 'वरिष्ठों का मार्गदर्शन मिलेगा।', health: 'खानपान पर ध्यान दें।', finance: 'अचानक धन लाभ की संभावना।', luckyNumber: '6', luckyColor: 'सफेद (White)' },
    { zodiacSign: 'mithun', zodiacHindi: 'मिथुन (Gemini)', title: 'आज का राशिफल: मिथुन राशि', prediction: 'नए विचारों से सफलता मिलेगी। यात्रा का योग बन रहा है। मित्रों के सहयोग से रुका हुआ कार्य पूर्ण होगा।', love: 'साथी के साथ समय बिताएंगे।', career: 'रचनात्मकता की सराहना होगी।', health: 'मानसिक प्रसन्नता बनी रहेगी।', finance: 'आर्थिक स्थिति सुदृढ़ होगी।', luckyNumber: '5', luckyColor: 'हरा (Green)' },
    { zodiacSign: 'kark', zodiacHindi: 'कर्क (Cancer)', title: 'आज का राशिफल: कर्क राशि', prediction: 'मानसिक शांति का अनुभव होगा। धार्मिक कार्यों में रुचि बढ़ेगी। संपत्ति संबंधी मामलों में प्रगति होगी।', love: 'पारिवारिक सौहार्द बना रहेगा।', career: 'नया अवसर मिल सकता है।', health: 'योग व ध्यान लाभप्रद रहेगा।', finance: 'बचत पर ध्यान केंद्रित करें।', luckyNumber: '2', luckyColor: 'सिल्वर (Silver)' },
    { zodiacSign: 'simha', zodiacHindi: 'सिंह (Leo)', title: 'आज का राशिफल: सिंह राशि', prediction: 'आत्मविश्वास से परिपूर्ण रहेंगे। कार्यक्षेत्र में आपका वर्चस्व बढ़ेगा। प्रतिस्पर्धियों पर विजय प्राप्त होगी।', love: 'प्रेम संबंधों में प्रगाढ़ता आएगी।', career: 'नेतृत्व क्षमता की प्रशंसा होगी।', health: 'दिनभर स्फूर्ति बनी रहेगी।', finance: 'आवक के नए स्रोत बनेंगे।', luckyNumber: '1', luckyColor: 'सोना/नारंगी (Orange)' },
    { zodiacSign: 'kanya', zodiacHindi: 'कन्या (Virgo)', title: 'आज का राशिफल: कन्या राशि', prediction: 'बुद्धिमत्ता से जटिल समस्याओं का समाधान करेंगे। व्यावसायिक मामलों में निर्णय सोच-समझकर लें।', love: 'आपसी समझ बढ़ेगी।', career: 'कठिन परिश्रम का फल मिलेगा।', health: 'पर्याप्त विश्राम करें।', finance: 'अनावश्यक व्यय से बचें।', luckyNumber: '7', luckyColor: 'हल्का नीला (Light Blue)' },
    { zodiacSign: 'tula', zodiacHindi: 'तुला (Libra)', title: 'आज का राशिफल: तुला राशि', prediction: 'कला और साहित्य के प्रति रुचि बढ़ेगी। जीवनसाथी का पूर्ण सहयोग प्राप्त होगा। व्यापार में वृद्धि होगी।', love: 'दांपत्य जीवन सुखद रहेगा।', career: 'साझेदारी में लाभ होगा।', health: 'उत्कृष्ट स्वास्थ्य रहेगा।', finance: 'संतुलित बजट बनाएं।', luckyNumber: '8', luckyColor: 'गुलाबी (Pink)' },
    { zodiacSign: 'vrischik', zodiacHindi: 'वृश्चिक (Scorpio)', title: 'आज का राशिफल: वृश्चिक राशि', prediction: 'धैर्य और संयम से काम लें। गुप्त शत्रुओं से सावधान रहने की आवश्यकता है। शाम तक शुभ संदेश प्राप्त होगा।', love: 'संवाद बनाए रखें।', career: 'रणनीति बनाकर काम करें।', health: 'पानी अधिक पीएं।', finance: 'रिफंड या रुका धन प्राप्त होगा।', luckyNumber: '4', luckyColor: 'गहरा लाल (Maroon)' },
    { zodiacSign: 'dhanu', zodiacHindi: 'धनु (Sagittarius)', title: 'आज का राशिफल: धनु राशि', prediction: 'शिक्षा व प्रतियोगिता के क्षेत्र में सफलता मिलेगी। उच्च अध्ययन के नए मार्ग प्रशस्त होंगे।', love: 'सकारात्मक मोड़ आएगा।', career: 'लक्ष्य प्राप्ति सुगम होगी।', health: 'व्यायाम शुरू करने के लिए उत्तम दिन।', finance: 'आर्थिक मजबूती आएगी।', luckyNumber: '3', luckyColor: 'पीला (Yellow)' },
    { zodiacSign: 'makar', zodiacHindi: 'मकर (Capricorn)', title: 'आज का राशिफल: मकर राशि', prediction: 'कर्मक्षेत्र में नए कीर्तिमान स्थापित करेंगे। भूमि या वाहन क्रय का विचार बन सकता है। माता का स्नेह मिलेगा।', love: 'पारिवारिक सहयोग मिलेगा।', career: 'पदोन्नति के प्रबल योग।', health: 'स्वास्थ्य सामान्य रहेगा।', finance: 'दीर्घकालिक निवेश करें।', luckyNumber: '10', luckyColor: 'नीला (Dark Blue)' },
    { zodiacSign: 'kumbh', zodiacHindi: 'कुंभ (Aquarius)', title: 'आज का राशिफल: कुंभ राशि', prediction: 'भाइयों और मित्रों का भरपूर साथ मिलेगा। सामाजिक कार्यों में प्रतिष्ठा बढ़ेगी। नए लोगों से संपर्क बनेगा।', love: 'मधुर स्मृतियां बनेंगी।', career: 'टीम वर्क से बड़ी सफलता।', health: 'ऊर्जा का स्तर ऊँचा रहेगा।', finance: 'अपेक्षित लाभ होगा।', luckyNumber: '11', luckyColor: 'बैंगनी (Purple)' },
    { zodiacSign: 'meen', zodiacHindi: 'मीन (Pisces)', title: 'आज का राशिफल: मीन राशि', prediction: 'वाणी में मधुरता से सभी काम सधेंगे। आर्थिक पक्ष मजबूत होगा। परिवार में मांगलिक कार्य की रूपरेखा बनेगी।', love: 'अविवाहितों के लिए रिश्ता आ सकता है।', career: 'व्यापार में विस्तार होगा।', health: 'उत्साही महसूस करेंगे।', finance: 'बचत योजनाएं फलदायी होंगी।', luckyNumber: '12', luckyColor: 'केसरिया (Saffron)' }
  ];

  for (const z of zodiacSigns) {
    await db.horoscope.create({
      data: {
        ...z,
        status: 'PUBLISHED',
        featuredImage: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=600&q=80',
        tagsJson: JSON.stringify(['#राशिफल', `#${z.zodiacHindi.split(' ')[0]}_राशि`, '#आज_का_राशिफल']),
      }
    });
  }
  console.log("[+] 12 Zodiac Horoscopes seeded.");

  // 2. Seed Cricket Matches & Reports
  const cricketMatches = [
    {
      matchTitle: 'भारत बनाम ऑस्ट्रेलिया - एशिया कप 2026 फाइनल',
      tournament: 'एशिया कप 2026',
      teamA: 'भारत (IND)',
      teamB: 'ऑस्ट्रेलिया (AUS)',
      scoreA: '312/6 (50 ओवर)',
      scoreB: '278/10 (47.2 ओवर)',
      matchStatus: 'RESULT',
      resultText: 'भारत ने 34 रनों से मैच जीतकर कप अपने नाम किया!',
      venue: 'ईडन गार्डन्स, कोलकाता',
      newsHeadline: 'एशिया कप 2026: भारत ने फाइनल में ऑस्ट्रेलिया को 34 रनों से हराया, विराट कोहली बने मैन ऑफ द मैच',
      newsSummary: 'कोलकाता के ईडन गार्डन्स स्टेडियम में खेले गए ऐतिहासिक फाइनल मैच में भारतीय क्रिकेट टीम ने शानदार प्रदर्शन करते हुए एशिया कप 2026 का खिताब जीत लिया।',
      featuredImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      tagsJson: JSON.stringify(['#क्रिकेट', '#भारत', '#एशिया_कप', '#विराट_कोहली']),
      status: 'PUBLISHED'
    },
    {
      matchTitle: 'भारत बनाम इंग्लैंड - T20 सीरीज पहला मुकाबला',
      tournament: 'T20 अंतरराष्ट्रीय सीरीज',
      teamA: 'भारत (IND)',
      teamB: 'इंग्लैंड (ENG)',
      scoreA: '185/4 (20 ओवर)',
      scoreB: '142/3 (15.4 ओवर)',
      matchStatus: 'LIVE',
      resultText: 'इंग्लैंड को 26 गेंदों में 44 रनों की आवश्यकता',
      venue: 'वानखेड़े स्टेडियम, मुंबई',
      newsHeadline: 'LIVE T20 Match: मुंबई टी-20 में भारतीय गेंदबाजों का शानदार प्रदर्शन, इंग्लैंड पर कसा शिकंजा',
      newsSummary: 'मुंबई में खेले जा रहे रोमांचक टी-20 मुकाबले में भारतीय टीम ने 185 रनों का विशाल लक्ष्य रखा है।',
      featuredImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
      tagsJson: JSON.stringify(['#क्रिकेट', '#LIVE_Score', '#भारत_इंग्लैंड']),
      status: 'PUBLISHED'
    }
  ];

  for (const c of cricketMatches) {
    await db.cricketMatch.create({ data: c });
  }
  console.log("[+] Cricket matches & live stories seeded.");

  // 3. Seed Stock Market Updates
  const marketUpdates = [
    {
      title: 'शेयर बाजार रिकॉर्ड ऊंचाई पर: सेंसेक्स 85,000 के पार, निफ्टी में भी 250 अंकों की बढ़त',
      company: 'भारतीय शेयर बाजार',
      symbol: 'SENSEX',
      price: '85,240.50',
      changePrice: '+480.20',
      changePercent: '+0.57%',
      movement: 'UP',
      indexName: 'SENSEX',
      indexValue: '85,240.50',
      indexChange: '+480.20 (+0.57%)',
      content: 'भारतीय शेयर बाजार में आज जबरदस्त लिवाली देखने को मिली। आईटी तथा बैंकिंग शेयरों में तेजी के दम पर सेंसेक्स 85,000 का स्तर पार कर गया।',
      featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      tagsJson: JSON.stringify(['#शेयर_बाजार', '#Sensex', '#Nifty', '#अर्थजगत']),
      status: 'PUBLISHED'
    },
    {
      title: 'निफ्टी 26,000 के ऐतिहासिक शिखर के करीब: ऑटो व मेटल सेक्टर में बंपर तेजी',
      company: 'नेशनल स्टॉक एक्सचेंज (NSE)',
      symbol: 'NIFTY50',
      price: '26,015.80',
      changePrice: '+145.60',
      changePercent: '+0.56%',
      movement: 'UP',
      indexName: 'NIFTY',
      indexValue: '26,015.80',
      indexChange: '+145.60 (+0.56%)',
      content: 'नेशनल स्टॉक एक्सचेंज के निफ्टी 50 इंडेक्स ने नया सर्वकालिक उच्चतम स्तर छुआ। विदेशी निवेशकों (FIIs) की खरीदारी से बाजार को बल मिला।',
      featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
      tagsJson: JSON.stringify(['#Nifty', '#NSE', '#शेयर_बाजार']),
      status: 'PUBLISHED'
    }
  ];

  for (const m of marketUpdates) {
    await db.stockMarketUpdate.create({ data: m });
  }
  console.log("[+] Stock market updates seeded.");

  // 4. Seed Commodity Prices (Gold & Silver)
  const cityRates = [
    { city: 'वाराणसी', gold24K: 74800, gold22K: 68600, silver: 88900, goldChange: 200, silverChange: -150 },
    { city: 'जौनपुर', gold24K: 74750, gold22K: 68550, silver: 88800, goldChange: 180, silverChange: -120 },
    { city: 'लखनऊ', gold24K: 74900, gold22K: 68700, silver: 89100, goldChange: 220, silverChange: -100 },
    { city: 'दिल्ली', gold24K: 75100, gold22K: 68900, silver: 89500, goldChange: 250, silverChange: -50 },
    { city: 'पटना', gold24K: 74850, gold22K: 68650, silver: 89000, goldChange: 190, silverChange: -110 }
  ];

  for (const c of cityRates) {
    await db.commodityPrice.create({ data: c });
  }
  console.log("[+] City-wise Gold/Silver commodity rates seeded.");

  console.log("All Special Modules successfully seeded into SQLite database!");
}

seedSpecialModules().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
