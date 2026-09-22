// Dainik Manyawar - Node.js Express Backend CMS Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// In-memory active session store
let ACTIVE_TOKEN = null;
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123'; // Default password

// Enable CORS and parsing of json/urlencoded requests
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const fsSync = require('fs');
const { renderPdfPages } = require('./epaper-renderer.js');

// Ensure uploads directory exists
async function initDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(path.join(UPLOADS_DIR, 'epaper'), { recursive: true });
  } catch (err) {
    console.error("Failed to create uploads directory:", err);
  }
}
initDir();

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));
// Serve static client-side files
app.use(express.static(__dirname));

// Multer Storage Configuration for Image & PDF Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.fieldname === 'pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      const epaperDir = path.join(UPLOADS_DIR, 'epaper');
      if (!fsSync.existsSync(epaperDir)) fsSync.mkdirSync(epaperDir, { recursive: true });
      cb(null, epaperDir);
    } else {
      cb(null, UPLOADS_DIR);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'pdf' ? 'epaper-' : (file.fieldname === 'pages' ? 'page-' : 'image-');
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// File filter to allow images and PDF files without error
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('केवल इमेज (JPG/PNG) या पीडीएफ (PDF) फाइल अपलोड करने की अनुमति है!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// --- Custom Relational JSON Database Utility ---
async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read database, resetting...", err);
    return { articles: [], comments: {}, logs: [] };
  }
}

async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Failed to write to database:", err);
    return false;
  }
}

// Log audit helpers
async function logAction(action, details) {
  const db = await readDB();
  const now = new Date();
  
  // Format Indian Standard Time style timestamp
  const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timestamp = `${dateStr} ${timeStr}`;

  const newLog = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
    timestamp,
    action,
    details
  };

  db.logs.unshift(newLog); // prepend to logs
  // Cap logs at 200 items to avoid bloating JSON
  if (db.logs.length > 200) {
    db.logs = db.logs.slice(0, 200);
  }
  await writeDB(db);
}

// Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !ACTIVE_TOKEN || authHeader !== `Bearer ${ACTIVE_TOKEN}`) {
    return res.status(401).json({ error: 'अनधिकृत! कृपया एडमिन लॉगिन करें।' });
  }
  next();
}

// --- API Endpoints ---

// 1. Admin Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    ACTIVE_TOKEN = crypto.randomBytes(32).toString('hex');
    await logAction('LOGIN_SUCCESS', `प्रशासक '${username}' ने सफलतापूर्वक लॉग इन किया।`);
    res.json({ token: ACTIVE_TOKEN });
  } else {
    await logAction('LOGIN_FAILED', `प्रशासक '${username}' का लॉगिन प्रयास विफल रहा।`);
    res.status(401).json({ error: 'गलत यूजरनाम या पासवर्ड!' });
  }
});

// 2. Admin Logout
app.post('/api/logout', requireAuth, async (req, res) => {
  ACTIVE_TOKEN = null;
  await logAction('LOGOUT', 'प्रशासक ने लॉग आउट किया।');
  res.json({ success: true });
});

// 3. Fetch Articles (Public & Admin modes)
app.get('/api/articles', async (req, res) => {
  const db = await readDB();
  const { category, search, admin } = req.query;
  
  let result = [...db.articles];

  // If public route (not admin requests), filter only enabled articles
  const isAdmin = admin === 'true' && req.headers.authorization === `Bearer ${ACTIVE_TOKEN}`;
  if (!isAdmin) {
    result = result.filter(a => a.enabled === true);
  }

  // Filter by category
  if (category) {
    result = result.filter(a => a.categoryKey === category);
  }

  // Filter by search keyword
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q) ||
      a.snippet.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// 4. Fetch Single Article (Increment view count)
app.get('/api/articles/:id', async (req, res) => {
  const db = await readDB();
  const artIdx = db.articles.findIndex(a => a.id === req.params.id);
  
  if (artIdx === -1) {
    return res.status(404).json({ error: 'लेख नहीं मिला!' });
  }
  
  const article = db.articles[artIdx];
  
  // Only increment view counter for public views (not admin page renders)
  const isPublic = req.query.view === 'public';
  if (isPublic && article.enabled) {
    article.views = (article.views || 0) + 1;
    db.articles[artIdx] = article;
    await writeDB(db);
  }
  
  res.json(article);
});

// 5. Create News Article (Admin Only with Image Upload)
app.post('/api/articles', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, author, content } = req.body;
    
    if (!title || !category || !content) {
      return res.status(400).json({ error: 'शीर्षक, श्रेणी और सामग्री आवश्यक हैं।' });
    }

    const categoryMap = {
      politics: "राजनीति",
      national: "देश",
      defense: "डिफेंस",
      education: "शिक्षा",
      economy: "अर्थजगत",
      health: "हेल्थ",
      foreign: "विदेश",
      opinion: "मत-विमत",
      society: "समाज-संस्कृति"
    };

    const categoryLabel = categoryMap[category] || "अन्य";

    // Set image path (either uploaded file or fallback URL)
    let imagePath = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // 08:30 PM

    const newArticle = {
      id: 'art-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      title,
      category: categoryLabel,
      categoryKey: category,
      image: imagePath,
      date: dateStr,
      time: timeStr,
      views: 0,
      author: author || 'दैनिक मान्यवर',
      snippet: content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      content,
      enabled: true
    };

    const db = await readDB();
    db.articles.unshift(newArticle);
    await writeDB(db);

    await logAction('CREATE', `लेख प्रकाशित किया गया: "${title}"`);
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ error: 'सर्वर त्रुटि: लेख बनाने में विफलता।' });
  }
});

// 6. Modify News Article (Admin Only with optional Image Upload)
app.put('/api/articles/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, author, content } = req.body;
    const db = await readDB();
    const artIdx = db.articles.findIndex(a => a.id === req.params.id);

    if (artIdx === -1) {
      return res.status(404).json({ error: 'लेख नहीं मिला!' });
    }

    const oldArticle = db.articles[artIdx];

    const categoryMap = {
      politics: "राजनीति",
      national: "देश",
      defense: "डिफेंस",
      education: "शिक्षा",
      economy: "अर्थजगत",
      health: "हेल्थ",
      foreign: "विदेश",
      opinion: "मत-विमत",
      society: "समाज-संस्कृति"
    };

    // Keep existing image if no new file is uploaded
    let imagePath = oldArticle.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    db.articles[artIdx] = {
      ...oldArticle,
      title: title || oldArticle.title,
      category: categoryMap[category] || oldArticle.category,
      categoryKey: category || oldArticle.categoryKey,
      image: imagePath,
      author: author || oldArticle.author,
      content: content || oldArticle.content,
      snippet: content ? content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : oldArticle.snippet
    };

    await writeDB(db);
    await logAction('MODIFY', `लेख संशोधित किया गया: "${oldArticle.title}"`);
    res.json(db.articles[artIdx]);
  } catch (err) {
    console.error("Error modifying article:", err);
    res.status(500).json({ error: 'सर्वर त्रुटि: लेख संशोधन में विफलता।' });
  }
});

// 7. Toggle Article status (Admin Only)
app.put('/api/articles/:id/toggle', requireAuth, async (req, res) => {
  const db = await readDB();
  const artIdx = db.articles.findIndex(a => a.id === req.params.id);

  if (artIdx === -1) {
    return res.status(404).json({ error: 'लेख नहीं मिला!' });
  }

  const article = db.articles[artIdx];
  article.enabled = !article.enabled;
  db.articles[artIdx] = article;

  await writeDB(db);
  const statusStr = article.enabled ? "सक्रिय (Enabled)" : "निष्क्रिय (Disabled)";
  await logAction('TOGGLE_STATUS', `लेख "${article.title}" की स्थिति बदलकर ${statusStr} की गई।`);
  
  res.json({ success: true, enabled: article.enabled });
});

// 8. Delete Article (Admin Only)
app.delete('/api/articles/:id', requireAuth, async (req, res) => {
  const db = await readDB();
  const artIdx = db.articles.findIndex(a => a.id === req.params.id);

  if (artIdx === -1) {
    return res.status(404).json({ error: 'लेख नहीं मिला!' });
  }

  const title = db.articles[artIdx].title;
  db.articles.splice(artIdx, 1);
  
  // Clean up associated comments
  if (db.comments[req.params.id]) {
    delete db.comments[req.params.id];
  }

  await writeDB(db);
  await logAction('DELETE', `लेख हटा दिया गया: "${title}"`);
  res.json({ success: true });
});

// 9. Fetch Comments
app.get('/api/comments/:articleId', async (req, res) => {
  const db = await readDB();
  const result = db.comments[req.params.articleId] || [];
  res.json(result);
});

// 10. Post Comment
app.post('/api/comments', async (req, res) => {
  const { articleId, name, email, text } = req.body;

  if (!articleId || !name || !email || !text) {
    return res.status(400).json({ error: 'सभी फ़ील्ड आवश्यक हैं।' });
  }

  const db = await readDB();
  if (!db.comments[articleId]) {
    db.comments[articleId] = [];
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const newComment = {
    id: 'c-' + Date.now() + '-' + Math.floor(Math.random() * 100),
    name,
    email,
    text,
    date: dateStr
  };

  db.comments[articleId].push(newComment);
  await writeDB(db);
  res.status(201).json(newComment);
});

// 11. Delete Comment (Admin Only)
app.delete('/api/comments/:articleId/:commentId', requireAuth, async (req, res) => {
  const db = await readDB();
  const { articleId, commentId } = req.params;

  if (db.comments[articleId]) {
    const comIdx = db.comments[articleId].findIndex(c => c.id === commentId);
    if (comIdx !== -1) {
      const author = db.comments[articleId][comIdx].name;
      db.comments[articleId].splice(comIdx, 1);
      await writeDB(db);
      await logAction('DELETE_COMMENT', `टिप्पणी हटाई गई: लेखक "${author}" की प्रतिक्रिया।`);
      return res.json({ success: true });
    }
  }

  res.status(404).json({ error: 'टिप्पणी नहीं मिली!' });
});

// 12. Fetch Audit Logs (Admin Only)
app.get('/api/logs', requireAuth, async (req, res) => {
  const db = await readDB();
  res.json(db.logs);
});

// 13. Dynamic RSS Feed generation (XML format)
app.get('/api/feed.xml', async (req, res) => {
  const db = await readDB();
  const activeArticles = db.articles.filter(a => a.enabled === true).slice(0, 15);
  
  res.set('Content-Type', 'text/xml; charset=utf-8');

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>दैनिक मान्यवर | Dainik Manyawar RSS Feed</title>
    <link>http://localhost:${PORT}</link>
    <description>ताजा राजनीति, देश, शिक्षा, हेल्थ, और समाज-संस्कृति की खबरें।</description>
    <language>hi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

  activeArticles.forEach(art => {
    // Generate full URL references
    const articleLink = `http://localhost:${PORT}/article.html?id=${art.id}`;
    
    rss += `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${articleLink}</link>
      <guid>${art.id}</guid>
      <pubDate>${new Date(art.date).toUTCString()}</pubDate>
      <author>${art.author}</author>
      <description><![CDATA[${art.snippet}]]></description>
      <category>${art.category}</category>
    </item>
`;
  });

  rss += `  </channel>
</rss>`;

  res.send(rss);
});

// --- E-Paper (ई-पेपर) Endpoints ---

// 14. Get All E-Papers (Public: only enabled; Admin: all)
app.get('/api/epaper', async (req, res) => {
  const db = await readDB();
  const epapers = db.epapers || [];
  const isAdmin = req.query.admin === 'true';
  if (isAdmin) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'अनधिकृत पहुंच।' });
    return res.json(epapers);
  }
  const publicEpapers = epapers.filter(e => e.enabled !== false);
  res.json(publicEpapers);
});

// 15. Get Latest E-Paper
app.get('/api/epaper/latest', async (req, res) => {
  const db = await readDB();
  const epapers = db.epapers || [];
  const active = epapers.filter(e => e.enabled !== false);
  if (active.length === 0) {
    return res.status(404).json({ error: 'कोई ई-पेपर उपलब्ध नहीं है।' });
  }
  res.json(active[0]);
});

// 15B. Get Archive Dates (All dates with available epaper editions)
app.get('/api/epaper/archive-dates', async (req, res) => {
  const db = await readDB();
  const epapers = (db.epapers || []).filter(e => e.enabled !== false);
  const archives = epapers.map(e => ({
    id: e.id,
    date: e.date,
    displayDate: e.displayDate || e.date,
    title: e.title,
    edition: e.edition || 'वाराणसी - जौनपुर',
    totalPages: e.totalPages || (e.pages ? e.pages.length : 8)
  }));
  res.json(archives);
});

// 15C. Get E-Paper by Date (e.g. /api/epaper/by-date/2026-09-10)
app.get('/api/epaper/by-date/:date', async (req, res) => {
  const db = await readDB();
  const epapers = db.epapers || [];
  const epaper = epapers.find(e => e.date === req.params.date && e.enabled !== false);
  if (!epaper) {
    return res.status(404).json({ error: `दिनांक ${req.params.date} के लिए ई-पेपर उपलब्ध नहीं है।` });
  }
  res.json(epaper);
});

// 16. Get E-Paper by ID
app.get('/api/epaper/:id', async (req, res) => {
  const db = await readDB();
  const epapers = db.epapers || [];
  const epaper = epapers.find(e => e.id === req.params.id);
  if (!epaper) {
    return res.status(404).json({ error: 'ई-पेपर नहीं मिला।' });
  }
  res.json(epaper);
});

// 17. Create / Upload E-Paper (Admin Only)
app.post('/api/epaper', requireAuth, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'pages', maxCount: 20 }]), async (req, res) => {
  try {
    const { title, edition, date, displayDate, year, issue, price, totalPages } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'शीर्षक और दिनांक आवश्यक हैं।' });
    }

    let pdfFile = null;
    let pdfUrl = '';
    let pdfSize = '';
    if (req.files && req.files.pdf && req.files.pdf[0]) {
      pdfFile = req.files.pdf[0];
      pdfUrl = `/uploads/epaper/${pdfFile.filename}`;
      pdfSize = (pdfFile.size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Page images if uploaded manually
    let pages = [];
    if (req.files && req.files.pages && req.files.pages.length > 0) {
      pages = req.files.pages.map((file, idx) => ({
        page: idx + 1,
        title: `पेज ${idx + 1}`,
        image: `/uploads/${file.filename}`
      }));
    } else if (pdfFile) {
      // Auto-extract and render pages from uploaded PDF
      try {
        const editionDirName = `edition-${Date.now()}`;
        const outputDir = path.join(UPLOADS_DIR, 'epaper', editionDirName);
        const webPrefix = `/uploads/epaper/${editionDirName}`;
        console.log(`Auto-rendering PDF pages for ${pdfFile.filename}...`);
        const rendered = await renderPdfPages(pdfFile.path, outputDir, webPrefix, 1.5);
        if (rendered && rendered.length > 0) {
          pages = rendered;
        }
      } catch (renderErr) {
        console.error('Auto-render of PDF pages failed:', renderErr);
      }
    }

    const count = pages.length || parseInt(totalPages) || 8;
    // Fallback page links if none rendered or uploaded
    if (pages.length === 0) {
      for (let i = 1; i <= count; i++) {
        pages.push({
          page: i,
          title: `पेज ${i}`,
          image: `/uploads/epaper/edition-10-sep-2026/page-${Math.min(i, 8)}.jpg`
        });
      }
    }

    const newEpaper = {
      id: 'epaper-' + Date.now(),
      title,
      edition: edition || 'वाराणसी - जौनपुर',
      date,
      displayDate: displayDate || date,
      year: year || '20',
      issue: issue || '43',
      price: price || '₹ 3.00',
      totalPages: count,
      pdfUrl,
      pdfSize,
      pages,
      enabled: true
    };

    const db = await readDB();
    if (!db.epapers) db.epapers = [];
    db.epapers.unshift(newEpaper);
    await writeDB(db);

    await logAction('CREATE_EPAPER', `नया ई-पेपर प्रकाशित किया गया: "${title}" (${count} पन्ने)`);
    res.status(201).json(newEpaper);
  } catch (err) {
    console.error('Error uploading epaper:', err);
    res.status(500).json({ error: 'ई-पेपर अपलोड करने में विफलता।' });
  }
});

// 18. Delete E-Paper
app.delete('/api/epaper/:id', requireAuth, async (req, res) => {
  const db = await readDB();
  const idx = (db.epapers || []).findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'ई-पेपर नहीं मिला।' });

  const deleted = db.epapers.splice(idx, 1)[0];
  await writeDB(db);
  await logAction('DELETE_EPAPER', `ई-पेपर हटाया गया: "${deleted.title}"`);
  res.json({ message: 'ई-पेपर सफलतापूर्वक हटा दिया गया।' });
});

// 19. Toggle E-Paper Status
app.put('/api/epaper/:id/toggle', requireAuth, async (req, res) => {
  const db = await readDB();
  const epaper = (db.epapers || []).find(e => e.id === req.params.id);
  if (!epaper) return res.status(404).json({ error: 'ई-पेपर नहीं मिला।' });

  epaper.enabled = !epaper.enabled;
  await writeDB(db);
  await logAction('TOGGLE_EPAPER', `ई-पेपर स्थिति बदली गई: "${epaper.title}" -> ${epaper.enabled ? 'सक्रिय' : 'निष्क्रिय'}`);
  res.json(epaper);
});

// Multer & General Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `अपलोड त्रुटि: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'फाइल अपलोड करने में त्रुटि हुई।' });
  }
  next();
});

// Process-level error resilience
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

// Listen
const server = app.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`  Dainik Manyawar Server running at http://localhost:${PORT}`);
  console.log(`=====================================================`);
});

server.on('error', (err) => {
  console.error('[SERVER ERROR]:', err);
});
