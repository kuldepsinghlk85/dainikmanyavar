import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dainik Manyavar database...');

  // 1. Create Super Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dainikmanyavar.in' },
    update: {},
    create: {
      email: 'admin@dainikmanyavar.in',
      password: hashedPassword,
      name: 'मुख्य संपादक (Super Admin)',
      role: 'SUPER_ADMIN',
      active: true,
    },
  });
  console.log('Admin user created/updated:', admin.email);

  // 2. Create Categories according to brand specifications
  const categoryNames = [
    'होम',
    'ताजा खबर',
    'उत्तर प्रदेश',
    'जौनपुर',
    'राजनीति',
    'देश',
    'शिक्षा',
    'स्वास्थ्य',
    'अर्थजगत',
    'समाज',
    'खेल',
    'धर्म-संस्कृति',
    'टेक्नोलॉजी',
    'डिफेंस',
    'विदेश',
    'अन्य'
  ];

  const categoryMap = new Map<string, string>();
  let order = 1;
  for (const name of categoryNames) {
    const slugMap: Record<string, string> = {
      'होम': 'home',
      'ताजा खबर': 'latest',
      'उत्तर प्रदेश': 'uttar-pradesh',
      'जौनपुर': 'jaunpur',
      'राजनीति': 'rajneeti',
      'देश': 'desh',
      'शिक्षा': 'shiksha',
      'स्वास्थ्य': 'swasthya',
      'अर्थजगत': 'arthjagat',
      'समाज': 'samaj',
      'खेल': 'khel',
      'धर्म-संस्कृति': 'dharm-sanskriti',
      'टेक्नोलॉजी': 'technology',
      'डिफेंस': 'defence',
      'विदेश': 'videsh',
      'अन्य': 'anya',
    };
    const slug = slugMap[name] || `cat-${order}`;
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name, order },
      create: {
        name,
        slug,
        order: order++,
        isHeaderMenu: true,
      },
    });
    categoryMap.set(name, cat.id);
  }

  // 3. Create Tags (Multi-tag system)
  const tagsData = [
    { name: 'जौनपुर', slug: 'jaunpur' },
    { name: 'विकास', slug: 'vikas' },
    { name: 'पुल_परियोजना', slug: 'pul_pariyojana' },
    { name: 'उत्तर_प्रदेश', slug: 'uttar_pradesh' },
    { name: 'बुनियादी_ढांचा', slug: 'buniyadi_dhancha' },
    { name: 'राजनीति', slug: 'rajneeti' },
    { name: 'संसद', slug: 'sansad' },
    { name: 'देश', slug: 'desh' },
    { name: 'शिक्षा', slug: 'shiksha' },
    { name: 'डिजिटल_शिक्षा', slug: 'digital_shiksha' },
    { name: 'डिफेंस', slug: 'defence' },
    { name: 'वायुसेना', slug: 'vayusena' },
    { name: 'स्वास्थ्य', slug: 'swasthya' },
    { name: 'हेल्थकेयर', slug: 'healthcare' },
    { name: 'किसान', slug: 'kisan' },
    { name: 'सब्सिडी', slug: 'subsidy' },
    { name: 'सरकार', slug: 'sarkar' },
    { name: 'रोजगार', slug: 'rojgar' },
    { name: 'युवा', slug: 'yuva' },
    { name: 'बारिश', slug: 'barish' },
    { name: 'मानसून', slug: 'monsoon' },
  ];

  const tagMap = new Map<string, string>();
  for (const t of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: {
        name: t.name,
        slug: t.slug,
        seoTitle: `${t.name} की ताज़ा ख़बरें | दैनिक मान्यवर`,
        seoDescription: `${t.name} से जुड़ी सभी खबरें और अपडेट दैनिक मान्यवर पर पढ़ें।`,
      },
    });
    tagMap.set(t.name, tag.id);
  }

  // 4. Create Locations
  const districtNames = ['जौनपुर', 'वाराणसी', 'प्रयागराज', 'लखनऊ', 'सुल्तानपुर'];
  const locationMap = new Map<string, string>();
  for (const dName of districtNames) {
    const slugMap: Record<string, string> = {
      'जौनपुर': 'jaunpur',
      'वाराणसी': 'varanasi',
      'प्रयागराज': 'prayagraj',
      'लखनऊ': 'lucknow',
      'सुल्तानपुर': 'sultanpur'
    };
    const loc = await prisma.location.upsert({
      where: { slug: slugMap[dName] },
      update: { name: dName },
      create: {
        name: dName,
        slug: slugMap[dName],
        type: 'DISTRICT',
      },
    });
    locationMap.set(dName, loc.id);
  }

  // 5. Create Reporters
  const author1 = await prisma.author.upsert({
    where: { slug: 'ramesh-sharma' },
    update: {},
    create: {
      name: 'रमेश शर्मा',
      slug: 'ramesh-sharma',
      designation: 'वरिष्ठ संवाददाता, जौनपुर',
      city: 'जौनपुर',
      bio: 'दैनिक मान्यवर के वरिष्ठ रिपोर्टर, जौनपुर जिले के बुनियादी ढांचे और स्थानीय मुद्दों पर लगातार रिपोर्टिंग।',
    },
  });

  const author2 = await prisma.author.upsert({
    where: { slug: 'priya-singh' },
    update: {},
    create: {
      name: 'प्रिया सिंह',
      slug: 'priya-singh',
      designation: 'विशेष संवाददाता, लखनऊ',
      city: 'लखनऊ',
      bio: 'उत्तर प्रदेश शासन एवं शिक्षा व्यवस्था पर पैनी नज़र रखने वाली वरिष्ठ पत्रकार।',
    },
  });

  // 6. Create Demo Articles with Multiple Tags
  const articlesData = [
    {
      title: 'जौनपुर में नई पुल परियोजना को मिली मंजूरी, क्षेत्र के विकास को मिलेगी नई गति',
      subtitle: 'गोमती नदी पर बनने वाले इस फोरलेन पुल से यातायात की समस्या होगी खत्म',
      slug: 'jaunpur-new-bridge-project-approved-2026',
      excerpt: 'जौनपुर जिले के लिए एक महत्वपूर्ण सौगात देते हुए सरकार ने नई पुल परियोजना को मंजूरी दे दी है। इससे न केवल यातायात की समस्या दूर होगी बल्कि क्षेत्रीय विकास को भी नई दिशा मिलेगी।',
      content: `<p><strong>जौनपुर (दैनिक मान्यवर ब्यूरो)।</strong> उत्तर प्रदेश सरकार ने जौनपुर जिले को एक बड़ी सौगात देते हुए गोमती नदी पर प्रस्तावित नए फोरलेन पुल के निर्माण प्रस्ताव को प्रशासनिक एवं वित्तीय स्वीकृति प्रदान कर दी है। इस महत्वाकांक्षी परियोजना की अनुमानित लागत लगभग 145 करोड़ रुपये बताई जा रही है।</p>
<p>जिलाधिकारी एवं लोक निर्माण विभाग के वरिष्ठ अधिकारियों के अनुसार, इस पुल के बन जाने से शहर में आए दिन लगने वाले भीषण जाम से स्थानीय नागरिकों और यात्रियों को बड़ी राहत मिलेगी। पुल के दोनों ओर एप्रोच मार्ग का निर्माण भी त्वरित गति से कराया जाएगा।</p>
<h3>परियोजना की प्रमुख विशेषताएं:</h3>
<ul>
  <li>फोरलेन चौड़ाई के साथ आधुनिक सुरक्षा बीम और स्ट्रीट लाइट व्यवस्था।</li>
  <li>शहर के मुख्य व्यापारिक क्षेत्रों को सीधे हाईवे से जोड़ने का मार्ग।</li>
  <li>स्थानीय कृषि एवं व्यापारिक गतिविधियों में तेजी आने की उम्मीद।</li>
</ul>
<p>स्थानीय व्यापार मंडल एवं नागरिक समूहों ने इस स्वीकृति का स्वागत किया है और उम्मीद जताई है कि कार्य समयबद्ध तरीके से पूरा होगा।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1200&q=80',
      category: 'उत्तर प्रदेश',
      authorId: author1.id,
      locationId: locationMap.get('जौनपुर'),
      isMainStory: true,
      isFeatured: true,
      isBreaking: true,
      viewCount: 12400,
      likeCount: 412,
      shareCount: 185,
      listenCount: 890,
      tags: ['जौनपुर', 'विकास', 'पुल_परियोजना', 'उत्तर_प्रदेश', 'बुनियादी_ढांचा'],
    },
    {
      title: 'यूपी के स्कूलों में डिजिटल शिक्षा को मिलेगा नया बढ़ावा, हर क्लासरूम में लगेंगे स्मार्ट बोर्ड',
      subtitle: 'बेसिक शिक्षा परिषद ने जारी किया नया दिशा-निर्देश',
      slug: 'up-schools-digital-education-smart-boards-2026',
      excerpt: 'उत्तर प्रदेश सरकार ने प्राथमिक एवं उच्च प्राथमिक विद्यालयों में गुणवत्तापूर्ण शिक्षा देने हेतु आधुनिक डिजिटल लैब और स्मार्ट बोर्ड स्थापित करने का निर्णय लिया है।',
      content: `<p><strong>लखनऊ (दैनिक मान्यवर ब्यूरो)।</strong> राज्य सरकार ने प्रदेश के बेसिक शिक्षा विभाग के तहत संचालित 40,000 से अधिक स्कूलों को आधुनिक डिजिटल सुविधाओं से लैस करने की योजना की घोषणा की है।</p>
<p>इस योजना के तहत प्रत्येक चयनित स्कूल में हाई-स्पीड इंटरनेट कनेक्टिविटी, डिजिटल कंटेंट एवं इंटरैक्टिव स्मार्ट बोर्ड लगाए जाएंगे। शिक्षकों को भी डिजिटल शिक्षण तकनीकों का विशेष प्रशिक्षण दिया जाएगा।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80',
      category: 'शिक्षा',
      authorId: author2.id,
      locationId: locationMap.get('लखनऊ'),
      isFeatured: true,
      viewCount: 4800,
      likeCount: 276,
      shareCount: 94,
      listenCount: 310,
      tags: ['शिक्षा', 'उत्तर_प्रदेश', 'डिजिटल_शिक्षा', 'सरकार'],
    },
    {
      title: 'संसद के विशेष सत्र में कई अहम विधेयकों पर होगी व्यापक चर्चा',
      subtitle: 'देश के विकास और जनहित से जुड़े कई प्रस्ताव पेश होने की संभावना',
      slug: 'parliament-special-session-key-bills-discussion',
      excerpt: 'संसद का विशेष सत्र आगामी सप्ताह से शुरू हो रहा है, जिसमें देश की अर्थव्यवस्था और जनकल्याण से जुड़े दूरगामी विधेयकों पर गहन विचार-विमर्श किया जाएगा।',
      content: `<p><strong>नई दिल्ली (दैनिक मान्यवर ब्यूरो)।</strong> संसद का आगामी सत्र नीतिगत दृष्टिकोण से अत्यंत महत्वपूर्ण माना जा रहा है। सरकार द्वारा देश के आधारभूत ढांचे तथा डिजिटल सुरक्षा से संबंधित नए कानून लाने की तैयारी की गई है।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80',
      category: 'राजनीति',
      authorId: author2.id,
      locationId: null,
      isFeatured: true,
      viewCount: 5200,
      likeCount: 320,
      shareCount: 110,
      listenCount: 420,
      tags: ['राजनीति', 'संसद', 'देश'],
    },
    {
      title: 'भारतीय वायुसेना को मिले नए लड़ाकू विमान, सरहद पर बढ़ी देश की ताकत',
      subtitle: 'आधुनिक रडार और मिसाइल प्रणालियों से लैस स्क्वाड्रन शामिल',
      slug: 'indian-air-force-new-fighter-jets-induction',
      excerpt: 'सुरक्षा की दृष्टि से एक बड़ी उपलब्धि के रूप में भारतीय वायुसेना ने अपने बेड़े में अत्याधुनिक लड़ाकू विमानों की नई खेप को शामिल कर लिया है।',
      content: `<p><strong>नई दिल्ली।</strong> देश की सीमाओं की सुरक्षा को और मजबूत करने के लिए रक्षा मंत्रालय ने नए स्वदेशी एवं उन्नत बहुउद्देश्यीय फाइटर जेट्स को स्क्वाड्रन में तैनात किया है।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=80',
      category: 'डिफेंस',
      authorId: author1.id,
      locationId: null,
      isFeatured: true,
      viewCount: 7100,
      likeCount: 412,
      shareCount: 156,
      listenCount: 540,
      tags: ['देश', 'डिफेंस', 'वायुसेना'],
    },
    {
      title: 'उत्तर प्रदेश में स्वास्थ्य सेवाओं का होगा विस्तार, ग्रामीण क्षेत्रों में नए केंद्र',
      subtitle: 'उपचार और दवाइयों की उपलब्धता सुनिश्चित करने का लक्ष्य',
      slug: 'up-health-services-expansion-rural-centres',
      excerpt: 'प्रदेश के सुदूर ग्रामीण अंचलों तक बेहतर और मुफ्त चिकित्सा सुविधाएं पहुंचाने के लिए स्वास्थ्य विभाग ने विशेष अभियान शुरू किया है।',
      content: `<p><strong>लखनऊ।</strong> उत्तर प्रदेश के प्राथमिक स्वास्थ्य केंद्रों को और सुदृढ़ बनाने के लिए नई एम्बुलेंस सेवाएं तथा आधुनिक पैथोलॉजी जांच सुविधाएं शुरू की जा रही हैं।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80',
      category: 'स्वास्थ्य',
      authorId: author2.id,
      locationId: locationMap.get('लखनऊ'),
      isFeatured: true,
      viewCount: 3900,
      likeCount: 198,
      shareCount: 75,
      listenCount: 280,
      tags: ['स्वास्थ्य', 'उत्तर_प्रदेश', 'हेल्थकेयर', 'सरकार'],
    },
    {
      title: 'शाहगंज में विकास कार्यों का अधिकारियों ने किया गहन निरीक्षण',
      subtitle: 'सड़क एवं पेयजल योजनाओं में गुणवत्ता का विशेष ध्यान रखने का निर्देश',
      slug: 'shahganj-jaunpur-development-work-inspection',
      excerpt: 'जौनपुर के शाहगंज तहसील क्षेत्र में जारी विभिन्न विकास परियोजनाओं की प्रगति की समीक्षा प्रशासनिक टीम द्वारा की गई।',
      content: `<p><strong>शाहगंज, जौनपुर।</strong> तहसील मुख्यालय पर आयोजित समीक्षा बैठक के उपरांत अधिकारियों ने मुख्य सड़कों और निर्माणाधीन पानी की टंकियों का मौके पर जाकर मुआयना किया।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=700&q=80',
      category: 'जौनपुर',
      authorId: author1.id,
      locationId: locationMap.get('जौनपुर'),
      viewCount: 3400,
      likeCount: 145,
      shareCount: 60,
      listenCount: 210,
      tags: ['जौनपुर', 'विकास', 'उत्तर_प्रदेश'],
    },
    {
      title: 'किसानों की आय बढ़ाने के लिए नई कृषि सब्सिडी योजना का ऐलान',
      subtitle: 'सोलर पंप और आधुनिक कृषि यंत्रों पर 75% तक की छूट',
      slug: 'farmers-income-boost-new-subsidy-scheme',
      excerpt: 'प्रदेश के किसानों को सिंचाई सुविधाओं तथा आधुनिक कृषि उपकरणों पर भारी अनुदान देने हेतु सरकार ने नया पोर्टल शुरू किया है।',
      content: `<p><strong>वाराणसी।</strong> पूर्वांचल के किसानों के लिए कृषि विभाग ने सोलर पंप योजना के तहत ऑनलाइन आवेदन प्रक्रिया प्रारंभ कर दी है।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80',
      category: 'उत्तर प्रदेश',
      authorId: author1.id,
      locationId: locationMap.get('वाराणसी'),
      viewCount: 2900,
      likeCount: 184,
      shareCount: 88,
      listenCount: 190,
      tags: ['किसान', 'सब्सिडी', 'सरकार', 'उत्तर_प्रदेश'],
    },
    {
      title: 'युवाओं के लिए जौनपुर में विशाल रोजगार मेले का आयोजन',
      subtitle: '50 से अधिक प्रतिष्ठित कंपनियां लेंगी हिस्सा, हजारों पदों पर होगी भर्ती',
      slug: 'jaunpur-job-fair-youth-employment-drive',
      excerpt: 'जिला सेवायोजन कार्यालय द्वारा तकनीकी तथा गैर-तकनीकी युवाओं को रोजगार के अवसर उपलब्ध कराने के लिए एक दिवसीय मेले की तिथि घोषित कर दी गई है।',
      content: `<p><strong>जौनपुर।</strong> राजकीय आईटीआई परिसर में आयोजित होने वाले इस रोजगार मेले में आईटीआई, डिप्लोमा तथा स्नातक पास अभ्यर्थी भाग ले सकेंगे।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
      category: 'जौनपुर',
      authorId: author1.id,
      locationId: locationMap.get('जौनपुर'),
      viewCount: 2600,
      likeCount: 142,
      shareCount: 55,
      listenCount: 175,
      tags: ['रोजगार', 'युवा', 'विकास', 'जौनपुर'],
    },
    {
      title: 'मानसून का कहर: यूपी के कई जिलों में भारी बारिश, नदियां उफान पर',
      subtitle: 'मौसम विभाग ने जारी किया रेड अलर्ट, प्रशासन सतर्क',
      slug: 'monsoon-heavy-rainfall-up-districts-alert',
      excerpt: 'पूर्वांचल एवं मध्य यूपी में लगातार हो रही मूसलाधार बारिश से निचले इलाकों में पानी भर गया है। प्रशासन ने लोगों से सतर्क रहने की अपील की है।',
      content: `<p><strong>प्रयागराज।</strong> संगम नगरी सहित आसपास के जिलों में पिछले 24 घंटों से रुक-रुक कर हो रही तेज बारिश से तापमान में गिरावट आई है।</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=700&q=80',
      category: 'उत्तर प्रदेश',
      authorId: author2.id,
      locationId: locationMap.get('प्रयागराज'),
      viewCount: 16300,
      likeCount: 210,
      shareCount: 130,
      listenCount: 650,
      tags: ['बारिश', 'मानसून', 'उत्तर_प्रदेश'],
    }
  ];

  for (const artData of articlesData) {
    const catId = categoryMap.get(artData.category) || Array.from(categoryMap.values())[0];
    const createdArt = await prisma.article.upsert({
      where: { slug: artData.slug },
      update: {
        title: artData.title,
        excerpt: artData.excerpt,
        content: artData.content,
        isMainStory: artData.isMainStory || false,
        isFeatured: artData.isFeatured || false,
        isBreaking: artData.isBreaking || false,
      },
      create: {
        title: artData.title,
        subtitle: artData.subtitle,
        slug: artData.slug,
        excerpt: artData.excerpt,
        content: artData.content,
        featuredImage: artData.featuredImage,
        primaryCategoryId: catId,
        authorId: artData.authorId,
        locationId: artData.locationId,
        isMainStory: artData.isMainStory || false,
        isFeatured: artData.isFeatured || false,
        isBreaking: artData.isBreaking || false,
        viewCount: artData.viewCount || 100,
        likeCount: artData.likeCount || 10,
        shareCount: artData.shareCount || 5,
        listenCount: artData.listenCount || 12,
        seoTitle: `${artData.title} | दैनिक मान्यवर`,
        seoDescription: artData.excerpt,
      },
    });

    // Create ShortLink
    const shortCode = createdArt.id.slice(0, 6);
    await prisma.shortLink.upsert({
      where: { shortCode },
      update: {},
      create: {
        articleId: createdArt.id,
        shortCode,
      },
    });

    // Attach tags
    for (const tagName of artData.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: createdArt.id,
              tagId: tagId,
            },
          },
          update: {},
          create: {
            articleId: createdArt.id,
            tagId: tagId,
          },
        });
      }
    }
  }

  // 7. Create Breaking News Ticker items
  const mainArticle = await prisma.article.findFirst({ where: { isMainStory: true } });
  await prisma.breakingNews.create({
    data: {
      articleId: mainArticle?.id,
      customHeadline: 'UP में नई शिक्षा नीति को लेकर बड़ा फैसला | जौनपुर में विकास परियोजनाओं की समीक्षा | मानसून से कई जिलों में भारी बारिश',
      priority: 1,
      active: true,
    },
  });

  // 8. Create Ad Slots
  await prisma.adSlot.upsert({
    where: { position: 'header_wide' },
    update: {},
    create: {
      name: 'Top Header Wide Banner',
      position: 'header_wide',
      targetUrl: 'https://dainikmanyawar.in',
      active: true,
    },
  });

  await prisma.adSlot.upsert({
    where: { position: 'sidebar_box' },
    update: {},
    create: {
      name: 'Sidebar Ad Box 300x600',
      position: 'sidebar_box',
      targetUrl: 'https://dainikmanyawar.in',
      active: true,
    },
  });

  // 9. Site Settings
  const defaultSettings = [
    { key: 'site_name', value: 'दैनिक मान्यवर' },
    { key: 'site_subtitle', value: 'सच के साथ... समाज के लिए...' },
    { key: 'whatsapp_number', value: '+91 93361 81297' },
    { key: 'contact_email', value: 'info@dainikmanyawar.in' },
    { key: 'contact_address', value: 'जौनपुर, उत्तर प्रदेश, भारत' },
    { key: 'tts_provider', value: 'web_speech' },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
