const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// 18 Mandals (Divisions) of Uttar Pradesh
const UP_DIVISIONS = [
  {
    name: 'वाराणसी मंडल',
    slug: 'varanasi-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80', // Kashi Ghats
  },
  {
    name: 'प्रयागराज मंडल',
    slug: 'prayagraj-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80', // Triveni Sangam
  },
  {
    name: 'अयोध्या मंडल',
    slug: 'ayodhya-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop&q=80', // Saryu River & Temple
  },
  {
    name: 'गोरखपुर मंडल',
    slug: 'gorakhpur-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', // Gorakhnath Temple
  },
  {
    name: 'लखनऊ मंडल',
    slug: 'lucknow-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80', // Rumi Darwaza
  },
  {
    name: 'कानपुर मंडल',
    slug: 'kanpur-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80', // Kanpur Ganga Barrage
  },
  {
    name: 'आगरा मंडल',
    slug: 'agra-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80', // Taj Mahal
  },
  {
    name: 'मेरठ मंडल',
    slug: 'meerut-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80', // NCR Hub
  },
  {
    name: 'आज़मगढ़ मंडल',
    slug: 'azamgarh-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80', // Purvanchal Heritage
  },
  {
    name: 'मिर्ज़ापुर मंडल',
    slug: 'mirzapur-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80', // Vindhyachal Hills
  },
  {
    name: 'बस्ती मंडल',
    slug: 'basti-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80', // Nature
  },
  {
    name: 'देवीपाटन मंडल',
    slug: 'devipatan-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80', // Terai Region
  },
  {
    name: 'झाँसी मंडल',
    slug: 'jhansi-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80', // Jhansi Fort
  },
  {
    name: 'चित्रकूट मंडल',
    slug: 'chitrakoot-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80', // Ram Ghat Mandakini
  },
  {
    name: 'बरेली मंडल',
    slug: 'bareilly-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80', // Rohilkhand
  },
  {
    name: 'मुरादाबाद मंडल',
    slug: 'moradabad-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80', // Brass City
  },
  {
    name: 'अलीगढ़ मंडल',
    slug: 'aligarh-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', // University City
  },
  {
    name: 'सहारनपुर मंडल',
    slug: 'saharanpur-division',
    type: 'DIVISION',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=80', // Shivalik Foothills
  },
];

// All 75 Districts of Uttar Pradesh categorized under their respective divisions
const UP_DISTRICTS = [
  // 1. वाराणसी मंडल (4 जिले)
  { name: 'वाराणसी', slug: 'varanasi', divisionSlug: 'varanasi-division', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80' },
  { name: 'जौनपुर', slug: 'jaunpur', divisionSlug: 'varanasi-division', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80' },
  { name: 'गाजीपुर', slug: 'ghazipur', divisionSlug: 'varanasi-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'चंदौली', slug: 'chandauli', divisionSlug: 'varanasi-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },

  // 2. प्रयागराज मंडल (4 जिले)
  { name: 'प्रयागराज', slug: 'prayagraj', divisionSlug: 'prayagraj-division', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80' },
  { name: 'कौशाम्बी', slug: 'kaushambi', divisionSlug: 'prayagraj-division', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80' },
  { name: 'फतेहपुर', slug: 'fatehpur', divisionSlug: 'prayagraj-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'प्रतापगढ़', slug: 'pratapgarh', divisionSlug: 'prayagraj-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },

  // 3. मिर्ज़ापुर मंडल (3 जिले)
  { name: 'मिर्ज़ापुर', slug: 'mirzapur', divisionSlug: 'mirzapur-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'भदोही', slug: 'bhadohi', divisionSlug: 'mirzapur-division', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'सोनभद्र', slug: 'sonbhadra', divisionSlug: 'mirzapur-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },

  // 4. आज़मगढ़ मंडल (3 जिले)
  { name: 'आज़मगढ़', slug: 'azamgarh', divisionSlug: 'azamgarh-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },
  { name: 'मऊ', slug: 'mau', divisionSlug: 'azamgarh-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'बलिया', slug: 'ballia', divisionSlug: 'azamgarh-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },

  // 5. गोरखपुर मंडल (4 जिले)
  { name: 'गोरखपुर', slug: 'gorakhpur', divisionSlug: 'gorakhpur-division', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80' },
  { name: 'महराजगंज', slug: 'maharajganj', divisionSlug: 'gorakhpur-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'देवरिया', slug: 'deoria', divisionSlug: 'gorakhpur-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'कुशीनगर', slug: 'kushinagar', divisionSlug: 'gorakhpur-division', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80' },

  // 6. बस्ती मंडल (3 जिले)
  { name: 'बस्ती', slug: 'basti', divisionSlug: 'basti-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'सिद्धार्थनगर', slug: 'siddharthnagar', divisionSlug: 'basti-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { name: 'संत कबीर नगर', slug: 'sant-kabir-nagar', divisionSlug: 'basti-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },

  // 7. देवीपाटन मंडल (4 जिले - मुख्यालय गोंडा)
  { name: 'गोंडा', slug: 'gonda', divisionSlug: 'devipatan-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'बलरामपुर', slug: 'balrampur', divisionSlug: 'devipatan-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },
  { name: 'श्रावस्ती', slug: 'shravasti', divisionSlug: 'devipatan-division', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80' },
  { name: 'बहराइच', slug: 'bahraich', divisionSlug: 'devipatan-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },

  // 8. अयोध्या मंडल (5 जिले)
  { name: 'अयोध्या', slug: 'ayodhya', divisionSlug: 'ayodhya-division', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80' },
  { name: 'अम्बेडकर नगर', slug: 'ambedkar-nagar', divisionSlug: 'ayodhya-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },
  { name: 'बाराबंकी', slug: 'barabanki', divisionSlug: 'ayodhya-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'सुल्तानपुर', slug: 'sultanpur', divisionSlug: 'ayodhya-division', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80' },
  { name: 'अमेठी', slug: 'amethi', divisionSlug: 'ayodhya-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },

  // 9. लखनऊ मंडल (6 जिले)
  { name: 'लखनऊ', slug: 'lucknow', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80' },
  { name: 'हरदोई', slug: 'hardoi', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'लखीमपुर खीरी', slug: 'lakhimpur-kheri', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { name: 'रायबरेली', slug: 'raebareli', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'सीतापुर', slug: 'sitapur', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'उन्नाव', slug: 'unnao', divisionSlug: 'lucknow-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },

  // 10. कानपुर मंडल (6 जिले)
  { name: 'कानपुर नगर', slug: 'kanpur-nagar', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80' },
  { name: 'कानपुर देहात', slug: 'kanpur-dehat', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'इटावा', slug: 'etawah', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },
  { name: 'फर्रुखाबाद', slug: 'farrukhabad', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'कन्नौज', slug: 'kannauj', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'औरैया', slug: 'auraiya', divisionSlug: 'kanpur-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },

  // 11. झाँसी मंडल (3 जिले)
  { name: 'झाँसी', slug: 'jhansi', divisionSlug: 'jhansi-division', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80' },
  { name: 'जालौन', slug: 'jalaun', divisionSlug: 'jhansi-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'ललितपुर', slug: 'lalitpur', divisionSlug: 'jhansi-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },

  // 12. चित्रकूट मंडल (4 जिले - मुख्यालय बांदा)
  { name: 'बांदा', slug: 'banda', divisionSlug: 'chitrakoot-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },
  { name: 'चित्रकूट', slug: 'chitrakoot', divisionSlug: 'chitrakoot-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { name: 'हमीरपुर', slug: 'hamirpur', divisionSlug: 'chitrakoot-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'महोबा', slug: 'mahoba', divisionSlug: 'chitrakoot-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },

  // 13. आगरा मंडल (4 जिले)
  { name: 'आगरा', slug: 'agra', divisionSlug: 'agra-division', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80' },
  { name: 'फिरोजाबाद', slug: 'firozabad', divisionSlug: 'agra-division', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'मैनपुरी', slug: 'mainpuri', divisionSlug: 'agra-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'मथुरा', slug: 'mathura', divisionSlug: 'agra-division', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80' },

  // 14. अलीगढ़ मंडल (4 जिले)
  { name: 'अलीगढ़', slug: 'aligarh', divisionSlug: 'aligarh-division', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80' },
  { name: 'एटा', slug: 'etah', divisionSlug: 'aligarh-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'हाथरस', slug: 'hathras', divisionSlug: 'aligarh-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },
  { name: 'कासगंज', slug: 'kasganj', divisionSlug: 'aligarh-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },

  // 15. मेरठ मंडल (6 जिले)
  { name: 'मेरठ', slug: 'meerut', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
  { name: 'बागपत', slug: 'baghpat', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'बुलंदशहर', slug: 'bulandshahr', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'गौतम बुद्ध नगर', slug: 'gautam-buddha-nagar', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
  { name: 'गाजियाबाद', slug: 'ghaziabad', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'हापुड़', slug: 'hapur', divisionSlug: 'meerut-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },

  // 16. सहारनपुर मंडल (3 जिले)
  { name: 'सहारनपुर', slug: 'saharanpur', divisionSlug: 'saharanpur-division', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&auto=format&fit=crop&q=80' },
  { name: 'मुजफ्फरनगर', slug: 'muzaffarnagar', divisionSlug: 'saharanpur-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'शामली', slug: 'shamli', divisionSlug: 'saharanpur-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },

  // 17. मुरादाबाद मंडल (5 जिले)
  { name: 'मुरादाबाद', slug: 'moradabad', divisionSlug: 'moradabad-division', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'बिजनौर', slug: 'bijnor', divisionSlug: 'moradabad-division', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'रामपुर', slug: 'rampur', divisionSlug: 'moradabad-division', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80' },
  { name: 'अमरोहा', slug: 'amroha', divisionSlug: 'moradabad-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { name: 'संभल', slug: 'sambhal', divisionSlug: 'moradabad-division', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80' },

  // 18. बरेली मंडल (4 जिले)
  { name: 'बरेली', slug: 'bareilly', divisionSlug: 'bareilly-division', image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=600&auto=format&fit=crop&q=80' },
  { name: 'बदायूं', slug: 'budaun', divisionSlug: 'bareilly-division', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'पीलीभीत', slug: 'pilibhit', divisionSlug: 'bareilly-division', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80' },
  { name: 'शाहजहांपुर', slug: 'shahjahanpur', divisionSlug: 'bareilly-division', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80' },
];

async function seedUpLocations() {
  console.log('====================================================');
  console.log(' Seeding Uttar Pradesh Mandals (18) & Districts (75)...');
  console.log('====================================================');

  const divisionMap = new Map();

  // 1. Seed / Upsert 18 Mandals
  for (const div of UP_DIVISIONS) {
    // Check if division exists by slug or name
    let existing = await db.location.findFirst({
      where: {
        OR: [
          { slug: div.slug },
          { name: div.name },
        ],
      },
    });

    if (existing) {
      existing = await db.location.update({
        where: { id: existing.id },
        data: {
          name: div.name,
          slug: div.slug,
          type: 'DIVISION',
          image: existing.image || div.image,
        },
      });
      console.log(`[✔] Updated Mandal: ${div.name} (${div.slug})`);
    } else {
      existing = await db.location.create({
        data: {
          name: div.name,
          slug: div.slug,
          type: 'DIVISION',
          image: div.image,
        },
      });
      console.log(`[+] Added Mandal: ${div.name} (${div.slug})`);
    }
    divisionMap.set(div.slug, existing.id);
  }

  // 2. Seed / Upsert 75 Districts
  for (const dist of UP_DISTRICTS) {
    const parentId = divisionMap.get(dist.divisionSlug) || null;

    // Check if district already exists by name or standard slug or legacy hindi slug
    let existing = await db.location.findFirst({
      where: {
        OR: [
          { name: dist.name },
          { slug: dist.slug },
          { slug: dist.name }, // e.g. legacy Hindi slug like 'बलिया'
        ],
      },
    });

    if (existing) {
      await db.location.update({
        where: { id: existing.id },
        data: {
          name: dist.name,
          slug: dist.slug, // ensure standard english slug
          type: 'DISTRICT',
          parentId: parentId,
          image: existing.image || dist.image,
        },
      });
      console.log(`[✔] Updated District: ${dist.name} -> ${dist.slug} (Parent: ${dist.divisionSlug})`);
    } else {
      await db.location.create({
        data: {
          name: dist.name,
          slug: dist.slug,
          type: 'DISTRICT',
          parentId: parentId,
          image: dist.image,
        },
      });
      console.log(`[+] Added District: ${dist.name} (${dist.slug})`);
    }
  }

  const totalCount = await db.location.count();
  const divisionCount = await db.location.count({ where: { type: 'DIVISION' } });
  const districtCount = await db.location.count({ where: { type: 'DISTRICT' } });

  console.log('====================================================');
  console.log(` Seed Completed Successfully!`);
  console.log(` Total Locations: ${totalCount} (Mandals: ${divisionCount}, Districts: ${districtCount})`);
  console.log('====================================================');
}

if (require.main === module) {
  seedUpLocations()
    .catch((e) => {
      console.error('Error seeding UP locations:', e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}

module.exports = { seedUpLocations, UP_DIVISIONS, UP_DISTRICTS };
