import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';
import { getOrCreateTag } from '@/lib/tagUtils';
import { serializeBlocksToHtml, ParagraphBlock } from '@/lib/paragraphBlocks';
import { revalidatePath } from 'next/cache';

export interface AkhbarDraftDefinition {
  importItemId: string;
  headline: string;
  secondaryHeadline: string;
  excerpt: string;
  categorySlug: string;
  locationName: string;
  featuredImage: string;
  sourceClippingUrl: string;
  sourceClippingTitle: string;
  sourceDate: string;
  contentType: string;
  tags: string[];
  paragraphBlocks: Array<{
    subtitle?: string;
    text: string;
    imageUrl?: string;
    imageCaption?: string;
  }>;
  factCheck: {
    names: string[];
    dates: string[];
    locations: string[];
    numbers: string[];
    sourceType: string;
    unconfirmedNotes: string[];
  };
}

export const BENCHMARK_HEADLINE_STORIES: AkhbarDraftDefinition[] = [
  // 1. TCS Rural IT Quiz (Clipping 1, Story 1)
  {
    importItemId: 'akhbar_draft_tcs_it_quiz',
    headline: 'टीसीएस ग्रामीण आईटी क्विज में सक्षम सिंह प्रदेश में प्रथम, कृषेश पांडेय दूसरे स्थान पर',
    secondaryHeadline: 'बीएचयू में आयोजित राज्य स्तरीय प्रतियोगिता में सर्वोदय विद्यालयों के विद्यार्थियों ने लहराया परचम',
    excerpt: 'समाज कल्याण विभाग द्वारा संचालित जय प्रकाश नारायण सर्वोदय विद्यालयों के विद्यार्थियों ने बनारस हिंदू विश्वविद्यालय (बीएचयू) में आयोजित टीसीएस ग्रामीण आईटी क्विज में ऐतिहासिक सफलता हासिल की है। सर्वोदय विद्यालय नारायणपुर (प्रतापगढ़) के कक्षा 9 के छात्र सक्षम सिंह ने समूचे प्रदेश में प्रथम तथा सर्वोदय विद्यालय सोनभद्र के छात्र कृषेश पांडेय ने दूसरा स्थान प्राप्त किया है।',
    categorySlug: 'shiksha',
    locationName: 'वाराणसी',
    featuredImage: '/uploads/akhbar-extracted/tcs_it_quiz_award.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_1_tcs_quiz.png',
    sourceClippingTitle: 'अखबार कतरन: टीसीएस ग्रामीण आईटी क्विज परिणाम',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'news',
    tags: ['#टीसीएसआईटीक्विज', '#बीएचयू', '#सक्षमसिंह', '#असीमअरुण', '#सर्वोदयविद्यालय', '#वाराणसी'],
    paragraphBlocks: [
      {
        subtitle: 'बीएचयू में प्रदेशभर के सर्वोदय विद्यालयों के बीच हुई कड़ी स्पर्धा',
        text: 'बनारस हिंदू विश्वविद्यालय में आयोजित प्रतिष्ठित टीसीएस ग्रामीण आईटी क्विज प्रतियोगिता में प्रदेशभर के विभिन्न सर्वोदय विद्यालयों के चयनित मेधावी छात्रों ने प्रतिभाग किया। इंटरनेट, आर्टिफिशियल इंटेलिजेंस (एआई), आधुनिक डिजिटल तकनीक और कंप्यूटर साइंस से जुड़े अत्यंत प्रतिस्पर्धी सवालों का सटीक उत्तर देकर सक्षम सिंह और कृषेश पांडेय ने पूरे प्रदेश में शीर्ष स्थान अर्जित किया।',
        imageUrl: '/uploads/akhbar-extracted/tcs_it_quiz_award.png',
        imageCaption: 'बीएचयू में टीसीएस ग्रामीण आईटी क्विज के विजेताओं को पुरस्कृत करते मुख्य अतिथि व समाज कल्याण विभाग के अधिकारी',
      },
      {
        subtitle: 'समाज कल्याण राज्यमंत्री असीम अरुण ने दी बधाई, कहा- प्रतिभा का लोहा मनवाया',
        text: 'समाज कल्याण राज्यमंत्री (स्वतंत्र प्रभार) असीम अरुण ने दोनों होनहार विद्यार्थियों की इस शानदार उपलब्धि पर बधाई देते हुए कहा कि ग्रामीण पृष्ठभूमि के विद्यार्थियों की यह सफलता उनकी असाधारण प्रतिभा और आधुनिक तकनीकी समझ का जीवंत प्रमाण है। इससे समाज कल्याण विभाग के अन्य विद्यालयों के लाखों विद्यार्थियों को तकनीकी क्षेत्र में आगे बढ़ने की नई प्रेरणा मिलेगी।',
      },
      {
        subtitle: 'बेंगलुरु में आयोजित होने वाले राष्ट्रीय फाइनल में करेंगे उत्तर प्रदेश का प्रतिनिधित्व',
        text: 'क्षेत्रीय विजेता बनने के बाद सक्षम सिंह और उपविजेता कृषेश पांडेय अब आगामी नवंबर माह में कर्नाटक की राजधानी बेंगलुरु में प्रस्तावित टीसीएस ग्रामीण आईटी क्विज के राष्ट्रीय फाइनल में उत्तर प्रदेश का प्रतिनिधित्व करेंगे। राष्ट्रीय स्तर पर विजेता प्रतिभागी को 1 लाख रुपये और उपविजेता को 50 हजार रुपये का नकद पुरस्कार और प्रशस्ति पत्र देकर सम्मानित किया जाएगा।',
      },
    ],
    factCheck: {
      names: ['सक्षम सिंह', 'कृषेश पांडेय', 'असीम अरुण'],
      dates: ['नवंबर 2026 (बेंगलुरु फाइनल)', '29 अक्टूबर 2026'],
      locations: ['बीएचयू (वाराणसी)', 'नारायणपुर (प्रतापगढ़)', 'सोनभद्र', 'बेंगलुरु'],
      numbers: ['कक्षा 9', 'प्रथम स्थान', 'द्वितीय स्थान', '₹1,00,000 (विजेता)', '₹50,000 (उपविजेता)'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },

  // 2. Banaras Railway Station Parking (Clipping 1, Story 2)
  {
    importItemId: 'akhbar_draft_banaras_station_parking',
    headline: 'बनारस रेलवे स्टेशन के प्लेटफॉर्म संख्या 8 की पार्किंग 30 अक्टूबर से अस्थायी रूप से बंद',
    secondaryHeadline: 'प्रशासनिक कार्यवश तीन एवं चार पहिया वाहनों की पार्किंग 1 नवंबर तक रहेगी स्थगित, प्लेटफॉर्म 1 पर वैकल्पिक व्यवस्था',
    excerpt: 'बनारस रेलवे स्टेशन पर यात्रा करने वाले यात्रियों के लिए महत्वपूर्ण प्रशासनिक सूचना जारी की गई है। प्लेटफॉर्म संख्या 8 की तरफ संचालित दोपहिया वाहन पार्किंग को तत्काल प्रभाव से तथा तीन एवं चार पहिया वाहनों की पार्किंग को 30 अक्टूबर 2026 से अस्थायी रूप से बंद रखा जाएगा।',
    categorySlug: 'varanasi',
    locationName: 'वाराणसी',
    featuredImage: '/uploads/akhbar-extracted/banaras_station_notice.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_1_tcs_quiz.png',
    sourceClippingTitle: 'अखबार कतरन: बनारस स्टेशन पार्किंग नोटिस',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'news',
    tags: ['#बनारसस्टेशन', '#रेलवेपार्किंग', '#वाराणसीसमाचार', '#पूर्वोत्तररेलवे'],
    paragraphBlocks: [
      {
        subtitle: 'यात्रियों की सुविधा के लिए प्लेटफॉर्म संख्या 1 पर वैकल्पिक पार्किंग व्यवस्था',
        text: 'रेल प्रशासन द्वारा जारी आधिकारिक सूचना के अनुसार, प्रशासनिक कार्यों और सुदृढ़ीकरण के चलते प्लेटफॉर्म संख्या 8 की पार्किंग को अस्थायी तौर पर बंद करने का निर्णय लिया गया है। इस दौरान स्टेशन आने वाले यात्रियों की सुविधा के लिए प्लेटफॉर्म संख्या 1 की तरफ दोपहिया, तीन पहिया और चार पहिया वाहनों के लिए व्यापक वैकल्पिक पार्किंग व्यवस्था उपलब्ध कराई गई है।',
      },
      {
        subtitle: '1 नवंबर से प्लेटफॉर्म संख्या 8 पर सामान्य रूप से शुरू होगी पार्किंग',
        text: 'रेल प्रशासन ने सभी यात्रियों और स्थानीय नागरिकों से अपील की है कि वे असुविधा से बचने के लिए प्लेटफॉर्म संख्या 1 पर निर्धारित पार्किंग स्थल का ही उपयोग करें और सुचारु यातायात व्यवस्था में सहयोग करें। आगामी 1 नवंबर 2026 से प्लेटफॉर्म संख्या 8 पर पूर्ववत सभी वाहनों की नियमित पार्किंग व्यवस्था पुनः शुरू कर दी जाएगी।',
      },
    ],
    factCheck: {
      names: ['रेल प्रशासन अधिकारी'],
      dates: ['30 अक्टूबर 2026', '01 नवंबर 2026'],
      locations: ['बनारस स्टेशन (वाराणसी)', 'प्लेटफॉर्म संख्या 8', 'प्लेटफॉर्म संख्या 1'],
      numbers: ['प्लेटफॉर्म संख्या 8', 'प्लेटफॉर्म संख्या 1', 'तीन एवं चार पहिया वाहन'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },

  // 3. Chetganj Nakkatayya (Clipping 2)
  {
    importItemId: 'akhbar_draft_chetganj_nakkatayya',
    headline: 'चेतगंज की ऐतिहासिक 140वीं नक्कटैया में दिखेगा एयर शो, हिंदू-मुस्लिम एकता और मोबाइल दुष्प्रभावों पर झांकियां',
    secondaryHeadline: 'अंग्रेजों की कुरीतियों के विरुद्ध बाबा फतेहराम ने शुरू की थी परंपरा; आधी रात 12 बजे डीएम करेंगे मेले का उद्घाटन',
    excerpt: 'काशी की ऐतिहासिक और सांस्कृतिक परंपरा की अमिट पहचान चेतगंज की 140वीं नक्कटैया लीला 29 अक्टूबर की रात समसामयिक सामाजिक सरोकारों का सशक्त संदेश लेकर आयोजित होगी। इस वर्ष भारतीय वायुसेना के शौर्य को समर्पित एयर शो, हिंदू-मुस्लिम सामाजिक सद्भाव, बच्चों पर स्मार्टफोन के दुष्प्रभाव, सीमा पार आतंकवाद पर प्रहार और नीम करौली बाबा के जीवन प्रसंग पर आधारित नयनाभिराम झांकियां पूरी रात मुख्य आकर्षण रहेंगी।',
    categorySlug: 'dharm-sanskriti',
    locationName: 'वाराणसी',
    featuredImage: '/uploads/akhbar-extracted/chetganj_nakkatayya_airshow.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_2_chetganj_nakkatayya.png',
    sourceClippingTitle: 'अखबार कतरन: चेतगंज नक्कटैया मेला',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'news',
    tags: ['#चेतगंजकीनक्कटैया', '#काशीरामलीला', '#वाराणसी', '#नीमकरौलीबाबा', '#एयरशो', '#हिंदूमुस्लिमएकता'],
    paragraphBlocks: [
      {
        subtitle: 'बच्चों पर स्मार्टफोन के दुष्प्रभावों और साइबर सुरक्षा पर विशेष झांकी',
        text: 'इस बार मेले में बाल पीढ़ी और युवाओं के बीच बढ़ते मोबाइल स्क्रीन एडिक्शन और उसके गंभीर दुष्प्रभावों को प्रमुखता से दर्शाया जाएगा। संस्था के अमित राज जायसवाल ने बताया कि बच्चों को विशेष नाट्य प्रशिक्षण देकर तैयार किया गया है, ताकि वे झांकियों के जरिए समाज को मोबाइल के संतुलित इस्तेमाल और पारिवारिक संवाद का जीवंत संदेश दे सकें।',
        imageUrl: '/uploads/akhbar-extracted/chetganj_nakkatayya_airshow.png',
        imageCaption: 'चेतगंज रामलीला समिति की प्रेसवार्ता में एयर शो व सामाजिक झांकियों का पोस्टर जारी करते पदाधिकारी',
      },
      {
        subtitle: 'नीम करौली बाबा के जीवन प्रसंग और राम-रावण युद्ध का पौराणिक मंचन',
        text: 'धार्मिक और आध्यात्मिक आस्था के तहत बाबा नीम करौली के जीवन की उस सुप्रसिद्ध घटना का सजीव चित्रण किया जाएगा, जब उन्हें ट्रेन से उतारा गया था। इसके साथ ही भगवान श्रीराम और लंकापति रावण के ऐतिहासिक धर्मयुद्ध का पारंपरिक लोकनाट्य मंचन भी भव्य झांकी के रूप में दर्शकों को मंत्रमुग्ध करेगा।',
      },
      {
        subtitle: '140 वर्षों से स्वांग और लीला के माध्यम से सामाजिक कुरीतियों पर प्रहार',
        text: 'श्री चेतगंज रामलीला समिति के उपाध्यक्ष तनुज पांडेय व अध्यक्ष अजय गुप्ता बच्चू ने बताया कि अंग्रेजी हुकूमत के दौर में बाबा फतेहराम ने कुरीतियों और सामाजिक बुराइयों को उजागर करने के लिए नक्कटैया मेले की नींव रखी थी। 29 अक्टूबर की रात ठीक 12 बजे चेतगंज थाने के सामने जिलाधिकारी मेले का विधिवत उद्घाटन करेंगे, जिसके बाद पूरी रात लाखों श्रद्धालु ऐतिहासिक लाग विमान और झांकियों का दर्शन करेंगे।',
      },
    ],
    factCheck: {
      names: ['बाबा फतेहराम', 'अमित राज जायसवाल', 'तनुज पांडेय (उपाध्यक्ष)', 'अजय गुप्ता बच्चू (अध्यक्ष)', 'नीम करौली बाबा'],
      dates: ['29 अक्टूबर 2026 (रात 12 बजे)', '140वां वर्ष'],
      locations: ['चेतगंज (वाराणसी)', 'चेतगंज थाना'],
      numbers: ['140वां वर्ष', 'रात 12 बजे'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },

  // 4. Water Mission & Roads Review (Clipping 3)
  {
    importItemId: 'akhbar_draft_water_mission_review',
    headline: 'जल जीवन मिशन में लापरवाही बर्दाश्त नहीं, जलापूर्ति बाधित हुई तो होगी कठोर कार्रवाई: मण्डलायुक्त राजेश प्रकाश',
    secondaryHeadline: 'मीरजापुर, सोनभद्र और भदोही के जल निगम अधिकारियों को अल्टीमेटम; मतवार व तिलहर संपर्क मार्ग निर्माण में तेजी के निर्देश',
    excerpt: 'विंध्याचल मंडल के मण्डलायुक्त राजेश प्रकाश ने आयुक्त सभागार से वीडियो कॉन्फ्रेंसिंग के माध्यम से मीरजापुर, भदोही और सोनभद्र जनपदों में जल जीवन मिशन, कानून व्यवस्था और निर्माणाधीन सड़कों की उच्चस्तरीय समीक्षा की। उन्होंने जल निगम के अधिकारियों को सख्त चेतावनी देते हुए कहा कि ग्रामीण क्षेत्रों में पाइपलाइन लीकेज और जलापूर्ति की बाधाओं का तत्काल निस्तारण कराएं, अन्यथा दोषी अधिकारियों पर दंडात्मक कार्रवाई होगी और लापरवाह ठेकेदारों को सीधे ब्लैकलिस्ट किया जाएगा।',
    categorySlug: 'uttar-pradesh',
    locationName: 'मिर्ज़ापुर',
    featuredImage: '/uploads/akhbar-extracted/water_mission_review_meeting.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_3_water_mission.png',
    sourceClippingTitle: 'अखबार कतरन: विंध्याचल मंडल जलापूर्ति समीक्षा',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'news',
    tags: ['#जलजीवनमिशन', '#मण्डलायुक्तराजेशप्रकाश', '#मीरजापुर', '#सोनभद्र', '#भदोही', '#सड़कनिर्माण'],
    paragraphBlocks: [
      {
        subtitle: 'पाइप लीकेज और टूटी सड़कों की शिकायतों पर मण्डलायुक्त की कड़ी नाराजगी',
        text: 'मण्डलायुक्त ने समीक्षा के दौरान कहा कि गांवों में पाइपलाइन बिछाने के बाद पाइप फटने या लीकेज के कारण अंतिम छोर तक पानी न पहुंचने की शिकायतें बेहद गंभीर हैं। उन्होंने अधिशासी अभियंताओं को स्वयं मौके पर जाकर गुणवत्ता की जांच करने के निर्देश दिए। बार-बार डिफाल्टर पाए जाने वाले कांट्रैक्टरों के खिलाफ एफआईआर दर्ज कराकर उन्हें डिबार करने का आदेश दिया गया।',
        imageUrl: '/uploads/akhbar-extracted/water_mission_review_meeting.png',
        imageCaption: 'आयुक्त सभागार में वीडियो कॉन्फ्रेंसिंग के माध्यम से तीनों जनपदों के विकास कार्यों की समीक्षा करते मण्डलायुक्त राजेश प्रकाश',
      },
      {
        subtitle: 'मतवार और तिलहर संपर्क मार्ग के निर्माण में तेजी लाने के निर्देश',
        text: 'लोक निर्माण विभाग की समीक्षा करते हुए मण्डलायुक्त ने मीरजापुर के हलिया विकास खंड स्थित मतवार संपर्क मार्ग और सोनभद्र के तिलहर संपर्क मार्ग सहित बकहर नदी पर लघु सेतु निर्माण में वन भूमि से जुड़े मामलों को संयुक्त टीम भेजकर त्वरित निस्तारित कराने को कहा। उन्होंने स्पष्ट किया कि गड्ढामुक्ति अभियान और सड़क निर्माण में गुणवत्ता से कोई समझौता नहीं होगा।',
      },
      {
        subtitle: 'सीएम डैशबोर्ड रैंकिंग और कानून व्यवस्था पर सख्त मॉनिटरिंग',
        text: 'मंडलीय बैठक में संयुक्त विकास आयुक्त रमेश चन्द्र, अपर आयुक्त राज कुमार द्विवेदी और उप निदेशक अर्थ व संख्या राम नरायन यादव सहित तीनों जिलों के मुख्य विकास अधिकारी उपस्थित रहे। मण्डलायुक्त ने सीएम डैशबोर्ड पर खराब प्रदर्शन वाले विभागों को अक्टूबर माह में ही रैंकिंग सुधारने की अंतिम चेतावनी दी। साथ ही आगामी त्योहारों के मद्देनजर अवैध खनन, भू-माफिया और महिला उत्पीड़न के मामलों में जीरो टॉलरेंस की नीति अपनाने का निर्देश दिया।',
      },
    ],
    factCheck: {
      names: ['राजेश प्रकाश (मण्डलायुक्त)', 'रमेश चन्द्र (संयुक्त विकास आयुक्त)', 'राज कुमार द्विवेदी (अपर आयुक्त)', 'राम नरायन यादव (उप निदेशक अर्थ व संख्या)'],
      dates: ['29 अक्टूबर 2026', 'अक्टूबर 2026 रैंकिंग'],
      locations: ['मीरजापुर', 'भदोही', 'सोनभद्र', 'हलिया विकास खंड (मतवार)', 'तिलहर', 'बकहर नदी'],
      numbers: ['3 जनपद', '100% जलापूर्ति लक्ष्य'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },

  // 5. Israel Netanyahu Election (Clipping 4)
  {
    importItemId: 'akhbar_draft_israel_netanyahu_election',
    headline: 'इजरायल चुनाव में नेतन्याहू की प्रचंड जीत के आसार, अरब पार्टियां बनीं किंगमेकर; पीएम मोदी और ट्रंप की भूमिका पर वैश्विक बहस',
    secondaryHeadline: '120 सीटों वाली नेसेट में 61 के जादुई आंकड़े के लिए कांटे की टक्कर; एग्जिट पोल के बाद नेतन्याहू ने भारत-अमेरिका से संपर्क साधा',
    excerpt: 'इजरायल के संसदीय चुनाव (नेसेट) में मतदान के बाद आए शुरुआती रुझानों और एग्जिट पोल में प्रधानमंत्री बेंजामिन नेतन्याहू की दक्षिणपंथी लिक्विड पार्टी मजबूत स्थिति में दिख रही है। 120 सदस्यीय संसद में बहुमत के 61 सीटों के जादुई आंकड़े को छूने के लिए नेतन्याहू ब्लॉक और विपक्षी गादी आइजनकोट गठबंधन के बीच अभूतपूर्व रस्साकशी जारी है, जिसमें 16 सीटें हासिल करने का अनुमान रखने वाली अरब पार्टियां संभावित किंगमेकर की भूमिका में उभर आई हैं।',
    categorySlug: 'videsh',
    locationName: 'वाराणसी',
    featuredImage: '/uploads/akhbar-extracted/netanyahu_modi_trump_graphic.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_4_israel_election.png',
    sourceClippingTitle: 'अखबार कतरन: इजरायल चुनाव विश्लेषण',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'explainer',
    tags: ['#इजरायलचुनाव', '#बेंजामिननेतन्याहू', '#पीएममोदी', '#डोनाल्डट्रंप', '#नेसेट', '#अंतरराष्ट्रीय'],
    paragraphBlocks: [
      {
        subtitle: 'एग्जिट पोल के ताजा आंकड़ों में 55 सीटों तक पहुंचा नेतन्याहू गठबंधन',
        text: 'इजरायल के प्रमुख टीवी चैनल 11 और चैनल 12 के एग्जिट पोल के अनुसार, नेतन्याहू समर्थक गठबंधन 52 से 55 सीटों तक पहुंचता दिख रहा है, जबकि विपक्षी खेमे को 49 से 51 सीटें मिलने की संभावना जताई गई है। बहुमत साबित करने के लिए नेतन्याहू को अतिरिक्त 6 सांसदों के समर्थन की दरकार होगी, जिसके लिए छोटी पार्टियों और निर्दलीय गुटों से गहन वार्ता शुरू हो गई है।',
        imageUrl: '/uploads/akhbar-extracted/netanyahu_modi_trump_graphic.png',
        imageCaption: 'नेतन्याहू की संभावित चुनावी जीत के बाद वैश्विक कूटनीति में भारत व अमेरिका के संबंधों पर केंद्रित ग्राफिक',
      },
      {
        subtitle: 'प्रधानमंत्री नरेंद्र मोदी और अमेरिकी राष्ट्रपति ट्रंप की रणनीतिक कूटनीति',
        text: 'चुनावी गहमागहमी के बीच इजरायली प्रधानमंत्री नेतन्याहू और भारत के प्रधानमंत्री नरेंद्र मोदी के बीच हुई उच्चस्तरीय बातचीत ने वैश्विक कूटनीति में हलचल मचा दी है। बातचीत में पश्चिम एशिया में शांति, स्थिरता और भारत-इजरायल के बीच विशेष रणनीतिक साझेदारी को प्रगाढ़ करने पर बल दिया गया। वहीं, अमेरिकी राष्ट्रपति डोनाल्ड ट्रंप द्वारा नेतन्याहू के पक्ष में दिए गए सार्वजनिक बयानों ने भी इजरायली दक्षिणपंथी मतदाताओं को एकजुट करने में अहम भूमिका निभाई है।',
      },
      {
        subtitle: 'सरकार गठन में आंतरिक मतभेद और गठबंधन की चुनौतियां',
        text: 'इजरायल की राजनीति के सबसे अनुभवी राजनेता माने जाने वाले नेतन्याहू के सामने अलग-अलग विचारधारा वाले सहयोगी दलों को एक मंच पर लाने की बड़ी चुनौती है। यदि कोई भी खेमा 61 सीटों का स्पष्ट बहुमत नहीं जुटा पाता है, तो इजरायल को एक बार फिर राजनीतिक गतिरोध और पुनः चुनाव की स्थिति का सामना करना पड़ सकता है।',
      },
    ],
    factCheck: {
      names: ['बेंजामिन नेतन्याहू', 'नरेंद्र मोदी (प्रधानमंत्री भारत)', 'डोनाल्ड ट्रंप (पूर्व राष्ट्रपति अमेरिका)', 'गादी आइजनकोट (विपक्षी नेता)'],
      dates: ['29 अक्टूबर 2026'],
      locations: ['इजरायल (यरुशलम)', 'वाशिंगटन डीसी', 'नई दिल्ली'],
      numbers: ['120 सीटें (नेसेट)', '61 सीटें (बहुमत)', '55 सीटें (अनुमानित नेतन्याहू)', '16 सीटें (अरब पार्टियां)'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },

  // 6. Editorial Source Protection (Clipping 5)
  {
    importItemId: 'akhbar_draft_editorial_source_protection',
    headline: 'संपादकीय : स्रोत हो सुरक्षित — खोजी पत्रकारिता और गोपनीय सूत्रों की हिफाजत पर सुप्रीम कोर्ट का रुख',
    secondaryHeadline: 'डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट के प्रावधानों के बीच व्हिसलब्लोअर और प्रेस की स्वतंत्रता का संतुलन जरूरी',
    excerpt: 'पत्रकारिता के पेशे में मीडियाकर्मियों का सर्वोच्च नैतिक दायित्व होता है कि वे किसी खोजपूर्ण खबर में सहायक सूत्र की सुरक्षा और विश्वास को अटूट बनाए रखें। अपने गोपनीय सूत्र की रक्षा केवल पेशेवर औपचारिकता नहीं, बल्कि लोकतांत्रिक समाज में खोजी पत्रकारिता की बुनियादी रीढ़ है। यदि जनहित में भ्रष्टाचार उजागर करने वाले व्हिसलब्लोअर का भरोसा टूटेगा, तो लोकतंत्र में सच सामने लाने वाली आवाजें हमेशा के लिए खामोश हो जाएंगी।',
    categorySlug: 'desh',
    locationName: 'वाराणसी',
    featuredImage: '/uploads/akhbar-extracted/editorial_source_header.png',
    sourceClippingUrl: '/uploads/akhbar-extracted/full_clipping_5_editorial_source.png',
    sourceClippingTitle: 'अखबार कतरन: दैनिक मान्यवर संपादकीय',
    sourceDate: '29 अक्टूबर 2026',
    contentType: 'editorial',
    tags: ['#संपादकीय', '#प्रेसकीस्वतंत्रता', '#डीपीडीपीएक्ट', '#सुप्रीमकोर्ट', '#व्हिसलब्लोअर', '#खोजीपत्रकारिता'],
    paragraphBlocks: [
      {
        subtitle: 'डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट (डीपीडीपी) और सूत्रों की गोपनीयता का सवाल',
        text: 'हाल ही में देश की शीर्ष अदालत में डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट (डीपीडीपी) के कड़े प्रावधानों को चुनौती दी गई है। डिजिटल न्यूज पब्लिशर्स एसोसिएशन ने सर्वोच्च न्यायालय के समक्ष यह गंभीर चिंता रखी है कि यदि कानून के तहत सरकारी एजेंसियों को नागरिकों और पत्रकारों का गोपनीय डेटा प्राप्त करने के असीमित अधिकार मिल जाएंगे, तो मीडिया के गोपनीय सूत्रों की पहचान खतरे में पड़ जाएगी और निर्भीक पत्रकारिता बाधित होगी।',
        imageUrl: '/uploads/akhbar-extracted/editorial_source_header.png',
        imageCaption: 'दैनिक मान्यवर संपादकीय: निष्पक्ष पत्रकारिता और संवैधानिक अधिकारों की सुरक्षा का विचार',
      },
      {
        subtitle: 'सर्वोच्च न्यायालय ने केंद्र से मांगा जवाब, 17 नवंबर को अगली सुनवाई',
        text: 'सुप्रीम कोर्ट ने इस संवेदनशील याचिका पर संज्ञान लेते हुए केंद्र सरकार से स्पष्ट जवाब तलब किया है और मामले की अगली सुनवाई 17 नवंबर नियत की है। आधुनिक डिजिटल युग में निजता की सुरक्षा बनाए रखना जितनी बड़ी आवश्यकता है, उतनी ही जरूरी यह भी है कि कानून सत्ताधीशों के लिए ऐसा हथियार न बन जाए जो खोजी पत्रकारों की पड़ताल और जांच में अवरोध खड़ा करे।',
      },
      {
        subtitle: 'सत्ता के दुरुपयोग और कॉरपोरेट भ्रष्टाचार के खिलाफ सुरक्षा कवच आवश्यक',
        text: 'शासन-प्रशासन में व्याप्त भ्रष्टाचार और कॉरपोरेट अनियमितताओं की पड़ताल अक्सर उन साहसी लोगों पर निर्भर करती है, जो बड़ा व्यक्तिगत जोखिम उठाकर भी राष्ट्रहित में तथ्य उजागर करते हैं। ऐसे में यदि कानूनी सुरक्षा उपायों के बिना उनकी पहचान सार्वजनिक हो जाती है, तो पत्रकारिता की विश्वसनीयता को अपूरणीय क्षति पहुंचेगी। उम्मीद की जाती है कि शीर्ष अदालत निजता और स्वतंत्र प्रेस के बीच न्यायसंगत संतुलन स्थापित करेगी।',
      },
    ],
    factCheck: {
      names: ['डिजिटल न्यूज पब्लिशर्स एसोसिएशन', 'सर्वोच्च न्यायालय पीठ'],
      dates: ['17 नवंबर 2026 (अगली सुनवाई)', '29 अक्टूबर 2026'],
      locations: ['सर्वोच्च न्यायालय (नई दिल्ली)'],
      numbers: ['17 नवंबर', 'डीपीडीपी एक्ट'],
      sourceType: 'अखबार कतरन (दैनिक मान्यवर)',
      unconfirmedNotes: [],
    },
  },
];

/**
 * Ensures all 6 headline stories are seeded/synced as DRAFT news items in the database.
 * Strictly sets status: 'DRAFT' so nothing is published until explicit editor approval.
 */
export async function seedOrSyncAkhbarDrafts(): Promise<{
  created: number;
  existing: number;
  total: number;
}> {
  let createdCount = 0;
  let existingCount = 0;

  for (const storyDef of BENCHMARK_HEADLINE_STORIES) {
    // Check if article already exists by importItemId
    const existing = await db.article.findFirst({
      where: { importItemId: storyDef.importItemId },
      select: { id: true, status: true, featuredImage: true },
    });

    if (existing) {
      if (existing.featuredImage !== storyDef.featuredImage) {
        await db.article.update({
          where: { id: existing.id },
          data: { featuredImage: storyDef.featuredImage },
        });
      }
      existingCount++;
      continue;
    }

    // Resolve Category
    let category = await db.category.findUnique({
      where: { slug: storyDef.categorySlug },
    });
    if (!category) {
      category = await db.category.findFirst();
    }
    if (!category) {
      console.warn(`No category found for ${storyDef.categorySlug}`);
      continue;
    }

    // Resolve Location
    const location = await db.location.findFirst({
      where: {
        OR: [
          { name: storyDef.locationName },
          { slug: slugify(storyDef.locationName) },
        ],
      },
    });

    // Generate unique newsId
    const newsId = await getNextNewsId();

    // Generate unique slug
    const baseSlug = slugify(storyDef.headline.slice(0, 60)) || `akhbar-news-${Date.now()}`;
    const slug = `${baseSlug}-${newsId}`;

    // Serialize paragraph blocks into production HTML
    const blocks: ParagraphBlock[] = storyDef.paragraphBlocks.map((b, idx) => ({
      id: `b_${storyDef.importItemId}_${idx}`,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      imageCaption: b.imageCaption || '',
      text: b.text,
    }));
    const serializedHtml = serializeBlocksToHtml(blocks);

    // Create the article strictly with status: 'DRAFT'
    const newArticle = await db.article.create({
      data: {
        newsId,
        title: storyDef.headline,
        subtitle: storyDef.secondaryHeadline,
        slug,
        excerpt: storyDef.excerpt,
        content: serializedHtml,
        featuredImage: storyDef.featuredImage,
        status: 'DRAFT', // STRICTLY DRAFT
        primaryCategoryId: category.id,
        locationId: location ? location.id : null,
        source: 'दैनिक मान्यवर अखबार',
        sourceType: 'akhbar_se_khabar',
        originalSourceName: storyDef.sourceClippingTitle,
        originalSourceUrl: storyDef.sourceClippingUrl,
        contentType: storyDef.contentType,
        importItemId: storyDef.importItemId,
        isImported: true,
      },
    });

    // Link Tags
    for (const rawTag of storyDef.tags) {
      try {
        const tag = await getOrCreateTag(rawTag);
        if (tag) {
          await db.articleTag.upsert({
            where: {
              articleId_tagId: {
                articleId: newArticle.id,
                tagId: tag.id,
              },
            },
            update: {},
            create: {
              articleId: newArticle.id,
              tagId: tag.id,
            },
          });
        }
      } catch (err) {
        console.warn(`Failed to link tag ${rawTag}:`, err);
      }
    }

    createdCount++;
  }

  return {
    created: createdCount,
    existing: existingCount,
    total: BENCHMARK_HEADLINE_STORIES.length,
  };
}

/**
 * Retrieves all articles created from Akhbar Se Khabar.
 */
export async function getAkhbarDraftsList(statusFilter?: string) {
  // Ensure default benchmark headlines exist
  await seedOrSyncAkhbarDrafts();

  const where: any = {
    sourceType: 'akhbar_se_khabar',
  };

  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  const articles = await db.article.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { id: true, name: true, slug: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return articles.map((art) => {
    // Match with benchmark fact check if available
    const def = BENCHMARK_HEADLINE_STORIES.find((d) => d.importItemId === art.importItemId);

    return {
      id: art.id,
      newsId: art.newsId,
      title: art.title,
      subtitle: art.subtitle,
      slug: art.slug,
      excerpt: art.excerpt,
      featuredImage: art.featuredImage,
      status: art.status,
      contentType: art.contentType,
      source: art.source,
      sourceClippingTitle: art.originalSourceName || def?.sourceClippingTitle,
      sourceClippingUrl: art.originalSourceUrl || def?.sourceClippingUrl,
      sourceDate: def?.sourceDate,
      category: art.category,
      location: art.location,
      tags: art.tags.map((t) => t.tag.name),
      factCheck: def?.factCheck || null,
      createdAt: art.createdAt,
      publishedAt: art.publishedAt,
    };
  });
}

/**
 * Publishes an Akhbar draft so it immediately goes live on the website.
 */
export async function publishAkhbarDraft(articleId: string) {
  const article = await db.article.findUnique({
    where: { id: articleId },
    include: { category: true, location: true },
  });

  if (!article) {
    throw new Error('लेख नहीं मिला');
  }

  const updated = await db.article.update({
    where: { id: articleId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // Revalidate public cache paths
  try {
    revalidatePath('/');
    if (article.category?.slug) {
      revalidatePath(`/category/${article.category.slug}`);
    }
    if (article.location?.slug) {
      revalidatePath(`/district/${article.location.slug}`);
    }
    revalidatePath(`/news/${article.slug}`);
    revalidatePath('/mobile');
    revalidatePath('/rss.xml');
  } catch (err) {
    console.warn('Revalidation warning:', err);
  }

  return updated;
}

/**
 * Unpublishes an Akhbar story back to DRAFT.
 */
export async function unpublishAkhbarDraft(articleId: string) {
  const updated = await db.article.update({
    where: { id: articleId },
    data: {
      status: 'DRAFT',
    },
  });

  try {
    revalidatePath('/');
    revalidatePath(`/news/${updated.slug}`);
  } catch (_) {}

  return updated;
}

/**
 * Deletes an Akhbar draft.
 */
export async function deleteAkhbarDraft(articleId: string) {
  return db.article.delete({
    where: { id: articleId },
  });
}
