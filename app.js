// Dainik Manyawar - Shared Frontend Script

const API_BASE = '/api';

// --- Shared Helper: Retrieve URL Query Parameters ---
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// --- Date Formatter for Cards (English months e.g. "September 30, 2025") ---
function formatDateEnglish(dateStr) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

// --- Live Ticker tape Simulation ---
function initTickerSimulation() {
  const tickerContainer = document.getElementById("ticker-tape");
  if (!tickerContainer) return;
  
  const stocks = [
    { symbol: "NIFTY 50", price: 24325.20, change: 185.40, pct: 0.77 },
    { symbol: "SENSEX", price: 79980.50, change: 610.15, pct: 0.76 },
    { symbol: "S&P 500", price: 5567.10, change: 25.40, pct: 0.46 },
    { symbol: "BTC/USD", price: 62450.00, change: -840.50, pct: -1.33 },
    { symbol: "ETH/USD", price: 3450.75, change: 12.80, pct: 0.37 },
    { symbol: "EUR/USD", price: 1.0842, change: -0.0015, pct: -0.14 },
    { symbol: "USD/INR", price: 83.48, change: 0.05, pct: 0.06 }
  ];

  function renderTicker() {
    tickerContainer.innerHTML = "";
    const displayStocks = [...stocks, ...stocks, ...stocks];
    displayStocks.forEach(st => {
      const isUp = st.change >= 0;
      const changeClass = isUp ? "up" : "down";
      const sign = isUp ? "+" : "";
      
      const item = document.createElement("div");
      item.className = "ticker-item";
      item.innerHTML = `
        <span class="title">${st.symbol}</span>
        <span class="val">${st.price.toLocaleString(undefined, { minimumFractionDigits: st.price < 10 ? 4 : 2 })}</span>
        <span class="change ${changeClass}">${sign}${st.change.toFixed(st.price < 10 ? 4 : 2)} (${sign}${st.pct.toFixed(2)}%)</span>
      `;
      tickerContainer.appendChild(item);
    });
  }

  renderTicker();

  setInterval(() => {
    stocks.forEach(st => {
      const factor = (Math.random() - 0.5) * 0.1;
      const priceDelta = st.price * (factor / 100);
      st.price += priceDelta;
      st.change += priceDelta;
      st.pct = (st.change / (st.price - st.change)) * 100;
    });
    renderTicker();
  }, 6000);
}

// --- Weather Simulation ---
const WEATHER_DATA = {
  lucknow: { name: "लखनऊ (Lucknow)", temp: 35, condition: "धुंध और बादल", hum: 74, wind: 10, aqi: 120, aqiLabel: "मध्यम", icon: "☁️" },
  delhi: { name: "नई दिल्ली (New Delhi)", temp: 38, condition: "गर्म हवाएं", hum: 45, wind: 15, aqi: 240, aqiLabel: "खराब", icon: "☀️" },
  jaunpur: { name: "जौनपुर (Jaunpur)", temp: 34, condition: "हल्की बारिश", hum: 82, wind: 8, aqi: 65, aqiLabel: "संतोषजनक", icon: "🌧️" },
  varanasi: { name: "वाराणसी (Varanasi)", temp: 36, condition: "उमस और बादल", hum: 78, wind: 9, aqi: 95, aqiLabel: "संतोषजनक", icon: "⛅" }
};

function initWeatherWidget() {
  const citySelect = document.getElementById("weather-city-select");
  if (!citySelect) return;
  
  function updateWeather(cityKey) {
    const data = WEATHER_DATA[cityKey] || WEATHER_DATA.lucknow;
    const tempEl = document.getElementById("w-temp");
    const condEl = document.getElementById("w-condition");
    const humEl = document.getElementById("w-humidity");
    const windEl = document.getElementById("w-wind");
    const aqiEl = document.getElementById("w-aqi");
    const aqiDescEl = document.getElementById("w-aqi-desc");
    const iconEl = document.getElementById("w-icon");

    if (tempEl) tempEl.innerHTML = `${data.temp}<span>°C</span>`;
    if (condEl) condEl.innerText = data.condition;
    if (humEl) humEl.innerText = `${data.hum}%`;
    if (windEl) windEl.innerText = `${data.wind} किमी/घंटा`;
    if (aqiEl) aqiEl.innerText = data.aqi;
    if (aqiDescEl) aqiDescEl.innerText = data.aqiLabel;
    if (iconEl) iconEl.innerText = data.icon;
    
    const bar = document.getElementById("w-aqi-bar");
    if (bar) {
      if (data.aqi <= 100) {
        bar.style.backgroundColor = "#22c55e";
      } else if (data.aqi <= 200) {
        bar.style.backgroundColor = "#eab308";
      } else {
        bar.style.backgroundColor = "#ef4444";
      }
    }
  }

  citySelect.addEventListener("change", (e) => {
    updateWeather(e.target.value);
  });

  updateWeather("lucknow");
}

// --- Date & Time in Hindi ---
function initDateTime() {
  const el = document.getElementById("hindi-date-time");
  if (!el) return;

  const daysHindi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const monthsHindi = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

  function update() {
    const now = new Date();
    const day = daysHindi[now.getDay()];
    const date = now.getDate();
    const month = monthsHindi[now.getMonth()];
    const year = now.getFullYear();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    el.innerText = `${day}, ${date} ${month} ${year} | ${hours}:${minutes} ${ampm}`;
  }

  update();
  setInterval(update, 30000);
}

// --- Dark / Light Mode ---
function setupTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem("dm_theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  toggleBtn.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("dm_theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      `;
    } else {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12.3 22c5.4 0 9.7-4.3 9.7-9.7 0-4.1-2.5-7.6-6.1-9.1-.5-.2-1 .1-1 .7.1.5.1 1.1.1 1.6 0 3.7-3 6.7-6.7 6.7-.5 0-1.1-.1-1.6-.1-.6-.1-.9.5-.7 1 1.5 3.6 5 6.1 9.1 9.1z"/></svg>
      `;
    }
  }
}

// --- Search Trigger ---
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchFormBtn = document.getElementById("search-trigger");
  
  if (!searchFormBtn || !searchInput) return;

  function runSearch() {
    const val = searchInput.value.trim();
    if (val) {
      window.location.href = `category.html?search=${encodeURIComponent(val)}`;
    }
  }

  searchFormBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

// --- Dynamic Rendering: Homepage ---
async function renderHomepage() {
  const container = document.getElementById("main-container");
  if (!container || !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('dainik-manyawar/')) return;

  try {
    const res = await fetch(`${API_BASE}/articles`);
    const articles = await res.json();

    if (!articles || articles.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:40px;">कोई लेख उपलब्ध नहीं है।</p>`;
      return;
    }

    const featured = articles[0];
    const breakingList = articles.slice(1, 5);
    
    const politics = articles.filter(a => a.categoryKey === "politics").slice(0, 3);
    const defense = articles.filter(a => a.categoryKey === "defense").slice(0, 3);
    const education = articles.filter(a => a.categoryKey === "education").slice(0, 3);
    const economy = articles.filter(a => a.categoryKey === "economy").slice(0, 3);

    container.innerHTML = `
      <!-- Top Featured Grid -->
      <div class="featured-section">
        <div class="featured-main-card" onclick="location.href='article.html?id=${featured.id}'">
          <div class="img-zoom">
            <span class="badge">ख़ास ख़बर</span>
            <img src="${featured.image}" alt="${featured.title}">
          </div>
          <div class="card-content">
            <div class="card-meta">
              <span>By ${featured.author}</span>
              <span>•</span>
              <span>${featured.time}</span>
            </div>
            <h2 class="card-title">${featured.title}</h2>
            <p class="card-desc">${featured.snippet}</p>
          </div>
        </div>
        
        <div class="breaking-column">
          <div class="section-header">
            <span class="section-title">ब्रेकिंग न्यूज़</span>
          </div>
          <div class="breaking-news-list">
            ${breakingList.map(art => `
              <div class="breaking-item" onclick="location.href='article.html?id=${art.id}'">
                <div class="breaking-item-img">
                  <img src="${art.image}" alt="${art.title}">
                </div>
                <div class="breaking-item-info">
                  <h4 class="breaking-item-title">${art.title}</h4>
                  <div class="card-meta" style="margin: 0; font-size: 11px;">
                    <span>${art.category}</span>
                    <span>•</span>
                    <span>${art.time}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Live TV & Weather Column -->
      <div class="widgets-section">
        <div class="live-tv-container">
          <span class="live-indicator">🔴 लाइव टीवी</span>
          <h3 class="widget-title" style="border:none; padding:0; margin-bottom:10px;">आज तक लाइव समाचार</h3>
          <div class="video-wrapper">
            <iframe src="https://www.youtube.com/embed/live_stream?channel=UCt4t-jeY85jekYdyyOP5gyA&autoplay=0" allowfullscreen></iframe>
          </div>
        </div>

        <!-- Simulated Weather Card -->
        <div class="weather-card">
          <div class="weather-header">
            <div class="weather-location">
              <span class="weather-city"><span id="w-icon">☁️</span> <span id="w-city-name">मौसम</span></span>
              <span style="font-size: 12px; color: #94a3b8;">ताज़ा जानकारी</span>
            </div>
            <select id="weather-city-select" class="weather-select">
              <option value="lucknow">लखनऊ</option>
              <option value="delhi">नई दिल्ली</option>
              <option value="jaunpur">जौनपुर</option>
              <option value="varanasi">वाराणसी</option>
            </select>
          </div>
          
          <div class="weather-main">
            <div class="weather-temp" id="w-temp">--<span>°C</span></div>
            <div style="text-align: right;">
              <div id="w-condition" style="font-weight: 600;">--</div>
              <div style="font-size: 12px; color: #94a3b8;">उत्तर प्रदेश</div>
            </div>
          </div>

          <div class="weather-details">
            <div class="weather-detail-item">
              <span class="weather-detail-label">आर्द्रता</span>
              <span class="weather-detail-val" id="w-humidity">--</span>
            </div>
            <div class="weather-detail-item">
              <span class="weather-detail-label">हवा</span>
              <span class="weather-detail-val" id="w-wind">--</span>
            </div>
            <div class="weather-detail-item">
              <span class="weather-detail-label">वायु गुणवत्ता</span>
              <span class="weather-detail-val"><span id="w-aqi">--</span> (<span id="w-aqi-desc">--</span>)</span>
              <div class="weather-aqi-bar" id="w-aqi-bar"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Columns Grid 1 -->
      <div class="grid-2col">
        <!-- Politics -->
        <div class="category-block">
          <div class="section-header">
            <span class="section-title">राजनीति</span>
            <a href="category.html?cat=politics" class="read-more-link">सभी देखें »</a>
          </div>
          <div class="category-articles">
            ${politics.length ? `
              <div class="cat-main-article" onclick="location.href='article.html?id=${politics[0].id}'">
                <div class="cat-main-img">
                  <img src="${politics[0].image}" alt="${politics[0].title}">
                </div>
                <h4 class="cat-main-title">${politics[0].title}</h4>
              </div>
              ${politics.slice(1).map(art => `
                <div class="breaking-item" onclick="location.href='article.html?id=${art.id}'" style="border:none; padding:0; margin-top:10px;">
                  <div class="breaking-item-img" style="width:70px; height:50px;">
                    <img src="${art.image}" alt="${art.title}">
                  </div>
                  <div class="breaking-item-info">
                    <h5 class="breaking-item-title" style="font-size:13px;">${art.title}</h5>
                  </div>
                </div>
              `).join("")}
            ` : '<p style="color:var(--text-secondary)">कोई लेख उपलब्ध नहीं है।</p>'}
          </div>
        </div>

        <!-- Defense -->
        <div class="category-block">
          <div class="section-header">
            <span class="section-title">डिफेंस</span>
            <a href="category.html?cat=defense" class="read-more-link">सभी देखें »</a>
          </div>
          <div class="category-articles">
            ${defense.length ? `
              <div class="cat-main-article" onclick="location.href='article.html?id=${defense[0].id}'">
                <div class="cat-main-img">
                  <img src="${defense[0].image}" alt="${defense[0].title}">
                </div>
                <h4 class="cat-main-title">${defense[0].title}</h4>
              </div>
              ${defense.slice(1).map(art => `
                <div class="breaking-item" onclick="location.href='article.html?id=${art.id}'" style="border:none; padding:0; margin-top:10px;">
                  <div class="breaking-item-img" style="width:70px; height:50px;">
                    <img src="${art.image}" alt="${art.title}">
                  </div>
                  <div class="breaking-item-info">
                    <h5 class="breaking-item-title" style="font-size:13px;">${art.title}</h5>
                  </div>
                </div>
              `).join("")}
            ` : '<p style="color:var(--text-secondary)">कोई लेख उपलब्ध नहीं है।</p>'}
          </div>
        </div>
      </div>

      <!-- Banner Advertisement Middle -->
      <div class="header-ad" style="margin: 0 auto 40px; height: 110px; max-width: 100%; display: flex; justify-content: center; background: linear-gradient(135deg, #b91c1c, #d9383a);">
        <div class="header-ad-badge">प्रायोजित विज्ञापन</div>
        <div style="text-align: center; color: white; padding: 20px;">
          <h3 style="font-family: var(--font-serif); font-size: 22px;">क्या आप अपनी खुद की न्यूज़ वेबसाइट बनवाना चाहते हैं?</h3>
          <p style="font-size: 13px; margin-top: 5px;">7K Network से आज ही संपर्क करें और अपना डिजिटल समाचार पोर्टल शुरू करें।</p>
        </div>
      </div>

      <!-- Category Columns Grid 2 -->
      <div class="grid-2col">
        <!-- Education -->
        <div class="category-block">
          <div class="section-header">
            <span class="section-title">शिक्षा</span>
            <a href="category.html?cat=education" class="read-more-link">सभी देखें »</a>
          </div>
          <div class="category-articles">
            ${education.length ? `
              <div class="cat-main-article" onclick="location.href='article.html?id=${education[0].id}'">
                <div class="cat-main-img">
                  <img src="${education[0].image}" alt="${education[0].title}">
                </div>
                <h4 class="cat-main-title">${education[0].title}</h4>
              </div>
              ${education.slice(1).map(art => `
                <div class="breaking-item" onclick="location.href='article.html?id=${art.id}'" style="border:none; padding:0; margin-top:10px;">
                  <div class="breaking-item-img" style="width:70px; height:50px;">
                    <img src="${art.image}" alt="${art.title}">
                  </div>
                  <div class="breaking-item-info">
                    <h5 class="breaking-item-title" style="font-size:13px;">${art.title}</h5>
                  </div>
                </div>
              `).join("")}
            ` : '<p style="color:var(--text-secondary)">कोई लेख उपलब्ध नहीं है।</p>'}
          </div>
        </div>

        <!-- Economy -->
        <div class="category-block">
          <div class="section-header">
            <span class="section-title">अर्थजगत</span>
            <a href="category.html?cat=economy" class="read-more-link">सभी देखें »</a>
          </div>
          <div class="category-articles">
            ${economy.length ? `
              <div class="cat-main-article" onclick="location.href='article.html?id=${economy[0].id}'">
                <div class="cat-main-img">
                  <img src="${economy[0].image}" alt="${economy[0].title}">
                </div>
                <h4 class="cat-main-title">${economy[0].title}</h4>
              </div>
              ${economy.slice(1).map(art => `
                <div class="breaking-item" onclick="location.href='article.html?id=${art.id}'" style="border:none; padding:0; margin-top:10px;">
                  <div class="breaking-item-img" style="width:70px; height:50px;">
                    <img src="${art.image}" alt="${art.title}">
                  </div>
                  <div class="breaking-item-info">
                    <h5 class="breaking-item-title" style="font-size:13px;">${art.title}</h5>
                  </div>
                </div>
              `).join("")}
            ` : '<p style="color:var(--text-secondary)">कोई लेख उपलब्ध नहीं है।</p>'}
          </div>
        </div>
      </div>
    `;

    initWeatherWidget();
  } catch (err) {
    console.error("Failed to load homepage:", err);
  }
}

// --- Dynamic Rendering: Category Page (Supports 4 columns + custom Metadata + Pagination) ---
async function renderCategoryPage() {
  const container = document.getElementById("main-container");
  if (!container || !window.location.pathname.endsWith('category.html')) return;

  const catKey = getQueryParam('cat');
  const searchQ = getQueryParam('search');
  const page = parseInt(getQueryParam('page')) || 1;
  const itemsPerPage = 8;
  
  let fetchUrl = `${API_BASE}/articles`;
  let pageTitle = "समाचार";

  if (catKey) {
    fetchUrl += `?category=${catKey}`;
    const labels = {
      politics: "राजनीति", national: "देश", defense: "डिफेंस",
      education: "शिक्षा", economy: "अर्थजगत", health: "हेल्थ",
      foreign: "विदेश", opinion: "मत-विमत", society: "समाज-संस्कृति"
    };
    pageTitle = `Category: ${labels[catKey] || catKey.toUpperCase()}`;
    
    // Set active nav link
    document.querySelectorAll(".nav-links li").forEach(li => {
      li.classList.remove("active");
      const a = li.querySelector("a");
      if (a && a.getAttribute("data-cat") === catKey) li.classList.add("active");
    });
  } else if (searchQ) {
    fetchUrl += `?search=${encodeURIComponent(searchQ)}`;
    pageTitle = `खोज परिणाम: "${searchQ}"`;
  }

  try {
    const res = await fetch(fetchUrl);
    const allArticles = await res.json();
    
    // Paginate client-side
    const totalItems = allArticles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedArticles = allArticles.slice(startIndex, startIndex + itemsPerPage);

    // Sidebar: Taza Khabar list
    const sideRes = await fetch(`${API_BASE}/articles`);
    const sideArticles = await sideRes.json();

    let categoryGridHTML = `<div class="category-page-grid">`;
    
    for (const art of paginatedArticles) {
      // Get comment count
      const comRes = await fetch(`${API_BASE}/comments/${art.id}`);
      const comments = await comRes.json();
      const comCount = comments.length;
      const comText = comCount === 0 ? "No Comments" : comCount === 1 ? "1 Comment" : `${comCount} Comments`;
      
      const displayDate = formatDateEnglish(art.date);

      categoryGridHTML += `
        <div class="post-card" onclick="location.href='article.html?id=${art.id}'">
          <div class="post-card-img">
            <img src="${art.image}" alt="${art.title}">
          </div>
          <div class="post-card-content">
            <h3 class="post-card-title">${art.title}</h3>
            <div class="post-card-meta">
              ${displayDate} /// ${comText}
            </div>
            <span class="read-more-link">Read More »</span>
          </div>
        </div>
      `;
    }
    
    categoryGridHTML += `</div>`;

    // Render pagination buttons (e.g. 1 2 3 4)
    let paginationHTML = "";
    if (totalPages > 1) {
      paginationHTML += `<div class="pagination">`;
      for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === page ? "active" : "";
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("page", i);
        paginationHTML += `<span class="page-num ${activeClass}" onclick="location.search='?${urlParams.toString()}'">${i}</span>`;
      }
      paginationHTML += `</div>`;
    }

    container.innerHTML = `
      <div style="background-color: var(--bg-card); padding: 25px; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 25px;">
        <div class="section-header" style="margin-bottom: 25px; border-bottom: 2px solid var(--accent); padding-bottom: 12px;">
          <h2 class="section-title" style="font-family: var(--font-serif); font-size: 28px; color: var(--accent);">${pageTitle}</h2>
        </div>
        
        ${paginatedArticles.length ? `
          ${categoryGridHTML}
          ${paginationHTML}
        ` : `
          <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">इस श्रेणी में अभी कोई लेख उपलब्ध नहीं है।</p>
        `}
      </div>
    `;
  } catch (err) {
    console.error("Failed to load category view:", err);
  }
}

// --- Dynamic Rendering: Article View (Matches third screenshot with custom right-side widgets) ---
async function renderArticleDetail() {
  const container = document.getElementById("main-container");
  if (!container || !window.location.pathname.endsWith('article.html')) return;

  const id = getQueryParam('id');
  if (!id) {
    location.href = 'index.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/articles/${id}?view=public`);
    if (res.status === 404) {
      container.innerHTML = `<p style="text-align:center; padding:40px;">लेख नहीं मिला।</p>`;
      return;
    }
    const art = await res.json();
    
    // Fetch comments
    const comRes = await fetch(`${API_BASE}/comments/${id}`);
    const comments = await comRes.json();

    // Fetch side latest news
    const sideRes = await fetch(`${API_BASE}/articles`);
    const sideArticles = await sideRes.json();

    // Related articles grid at the bottom (4 columns, matches category grid style)
    const relatedArticles = sideArticles.filter(a => a.id !== art.id).slice(0, 4);

    container.innerHTML = `
      <div class="main-content-layout">
        
        <!-- Primary Article Pane (Left) -->
        <div class="primary-content-pane">
          <div class="article-header">
            <!-- Title -->
            <h1 class="article-title" style="font-size: 28px; line-height: 1.4; font-family: var(--font-serif); font-weight: 700; margin-bottom: 15px;">${art.title}</h1>
            
            <!-- Metadata line -->
            <div class="article-meta-row" style="font-size: 13px; color: var(--text-secondary); display: flex; gap: 15px; margin-bottom: 20px; font-family: var(--font-en);">
              <span>✍️ By <strong>${art.author}</strong></span>
              <span>•</span>
              <span>📅 ${formatDateEnglish(art.date)} ${art.time}</span>
              <span>•</span>
              <span>💬 ${comments.length} Comments</span>
              <span>•</span>
              <span>👁️ ${art.views || 0} Views</span>
            </div>
          </div>

          <!-- Featured Cover Image -->
          <div class="article-main-image">
            <img src="${art.image}" alt="${art.title}">
          </div>

          <!-- Article Content Body -->
          <div class="article-body-content" style="font-size: 17px; line-height: 1.8;">
            ${art.content}
          </div>

          <!-- Social Share Widget -->
          <div class="share-container">
            <span style="font-weight: 700; font-size: 14px; margin-right: 15px;">शेयर करें:</span>
            <div class="share-btn fb" onclick="shareArticle('facebook', '${art.title}')">Facebook</div>
            <div class="share-btn tw" onclick="shareArticle('twitter', '${art.title}')">Twitter</div>
            <div class="share-btn wa" onclick="shareArticle('whatsapp', '${art.title}')">WhatsApp</div>
            <div class="share-btn tg" onclick="shareArticle('telegram', '${art.title}')">Telegram</div>
          </div>

          <!-- Comments Ingress Form -->
          <div class="comments-wrapper" style="border-top: 1px solid var(--border-color); padding-top: 30px; margin-top: 40px;">
            <h3 class="widget-title" style="font-size: 20px; margin-bottom: 20px; font-family: var(--font-serif);">Leave a Comment</h3>
            
            <div class="comment-list" id="comments-list-box" style="margin-bottom: 30px;">
              ${comments.length ? comments.map(c => `
                <div class="comment-item" style="padding: 15px; border-radius: var(--radius-sm); margin-bottom: 15px;">
                  <div class="comment-author-meta">
                    <span class="comment-author-name">${c.name}</span>
                    <span>${c.date}</span>
                  </div>
                  <p class="comment-text" style="font-size: 14px; margin-top: 5px;">${c.text}</p>
                </div>
              `).join("") : `<p id="no-comments-msg" style="color: var(--text-secondary); font-size: 14px;">Be the first to comment on this article!</p>`}
            </div>

            <!-- Form -->
            <form class="comment-form" id="article-comment-form" style="display: grid; gap: 15px; margin-top: 20px;">
              <div class="form-group">
                <label style="font-weight:600; font-size:13px;">Comment *</label>
                <textarea id="c-text" class="form-control" placeholder="Type your comment here..." required style="min-height: 120px;"></textarea>
              </div>
              
              <div class="comment-form-row">
                <div class="form-group">
                  <label style="font-weight:600; font-size:13px;">Name *</label>
                  <input type="text" id="c-name" class="form-control" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                  <label style="font-weight:600; font-size:13px;">Email *</label>
                  <input type="email" id="c-email" class="form-control" placeholder="Your Email" required>
                </div>
              </div>

              <div class="form-group">
                <label style="font-weight:600; font-size:13px;">Website</label>
                <input type="url" id="c-website" class="form-control" placeholder="Website (Optional)">
              </div>

              <div style="display: flex; align-items: start; gap: 10px; margin-top: 5px;">
                <input type="checkbox" id="c-save" style="margin-top: 4px; cursor: pointer;">
                <label for="c-save" style="font-size: 12px; color: var(--text-secondary); cursor: pointer;">Save my name, email, and website in this browser for the next time I comment.</label>
              </div>
              
              <button type="submit" class="submit-btn" style="background-color: var(--bg-nav); font-family: var(--font-en); font-weight: bold; border-radius: 4px; padding: 10px 20px; margin-top: 10px;">Post Comment</button>
            </form>
          </div>
        </div>

        <!-- Sidebar Pane (Right) -->
        <aside class="sidebar-pane">
          
          <!-- 1. Taza Khabar Widget -->
          <div class="sidebar-widget">
            <h3 class="widget-title">ताज़ा खबरें</h3>
            <div class="breaking-news-list" style="margin-top: 15px;">
              ${sideArticles.slice(0, 5).map(rel => `
                <div class="breaking-item" onclick="location.href='article.html?id=${rel.id}'">
                  <div class="breaking-item-img" style="width: 65px; height: 50px;">
                    <img src="${rel.image}" alt="${rel.title}">
                  </div>
                  <div class="breaking-item-info">
                    <h5 class="breaking-item-title" style="font-size: 13px; line-height: 1.3; font-weight: 600;">${rel.title}</h5>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 2. Banner Ad Widget -->
          <div class="sidebar-widget" style="padding: 0; overflow: hidden; border: none; height: 250px;">
            <div class="header-ad" style="width: 100%; height: 100%; max-width: 100%; display: flex; background: linear-gradient(135deg, #1e3a8a, #3b82f6);">
              <div class="header-ad-badge">विज्ञापन</div>
              <div style="text-align: center; color: white; padding: 25px; margin: auto;">
                <h4 style="font-family: var(--font-serif); font-size: 18px;">आज ही बनवाएं अपनी न्यूज़ वेबसाइट</h4>
                <p style="font-size: 11px; margin-top: 6px; opacity: 0.8;">News Portal Development Company</p>
                <button onclick="alert('7K Network - +91 82879 35889')" style="background-color: #f59e0b; border: none; color: black; font-weight: bold; padding: 6px 12px; margin-top: 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Get Quote</button>
              </div>
            </div>
          </div>

          <!-- 3. Cricket Score Widget -->
          <div class="cricket-card">
            <div class="cricket-header">
              <span>Cricket Live Score</span>
              <span class="cricket-live-dot"></span>
            </div>
            <div class="cricket-tabs">
              <span class="cricket-tab active">TODAY</span>
              <span class="cricket-tab">1ST ODI</span>
              <span class="cricket-tab">2ND ODI</span>
            </div>
            <div class="cricket-body">
              <div class="cricket-match-type">1st Test Match • Jaunpur Oval</div>
              <div class="cricket-teams-row">
                <div class="cricket-team">
                  <span class="cricket-flag">🇮🇳</span>
                  <span class="cricket-team-name">IND</span>
                  <span class="cricket-score cricket-team-score-active">320/4 &amp; 240</span>
                </div>
                <div class="cricket-vs">vs</div>
                <div class="cricket-team">
                  <span class="cricket-flag">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <span class="cricket-team-name">ENG</span>
                  <span class="cricket-score">280 &amp; 180/6</span>
                </div>
              </div>
              <div class="cricket-status">ENG needs 101 runs to win (Target 281)</div>
            </div>
          </div>

          <!-- 4. Corona Virus Statistics Widget -->
          <div class="corona-card">
            <div class="corona-header">
              <span>COVID-19 Stats (India)</span>
              <span>☣️</span>
            </div>
            <div class="corona-grid">
              <div class="corona-item confirmed">
                <div class="corona-label">Confirmed</div>
                <div class="corona-val">44.9M</div>
              </div>
              <div class="corona-item active">
                <div class="corona-label">Active</div>
                <div class="corona-val">6.3K</div>
              </div>
              <div class="corona-item recovered">
                <div class="corona-label">Recovered</div>
                <div class="corona-val">44.4M</div>
              </div>
              <div class="corona-item deaths">
                <div class="corona-label">Deaths</div>
                <div class="corona-val">531K</div>
              </div>
            </div>
          </div>

          <!-- 5. Rashifal (Horoscope) 3x4 Grid Widget -->
          <div class="rashifal-card">
            <div class="rashifal-header">आज का राशिफल (Rashifal)</div>
            <div class="rashifal-grid">
              <div class="rashi-item" onclick="showHoroscope('मेष', 'आज आपका दिन बहुत ही ऊर्जावान रहेगा। धन लाभ के योग हैं।')">
                <span class="rashi-icon">♈</span>
                <span class="rashi-name">मेष</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('वृष', 'पारिवारिक सुख-शांति बनी रहेगी। निवेश के लिए अनुकूल समय है।')">
                <span class="rashi-icon">♉</span>
                <span class="rashi-name">वृष</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('मिथुन', 'नौकरी पेशा लोगों के लिए तरक्की के रास्ते खुलेंगे। सेहत अच्छी रहेगी।')">
                <span class="rashi-icon">♊</span>
                <span class="rashi-name">मिथुन</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('कर्क', 'आज वाद-विवाद से बचें। वाणी पर संयम रखना लाभदायक होगा।')">
                <span class="rashi-icon">♋</span>
                <span class="rashi-name">कर्क</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('सिंह', 'मान-सम्मान में वृद्धि होगी। सोचे हुए काम समय पर पूरे होंगे।')">
                <span class="rashi-icon">♌</span>
                <span class="rashi-name">सिंह</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('कन्या', 'नए व्यापारिक समझौते हो सकते हैं। मित्रों का सहयोग प्राप्त होगा।')">
                <span class="rashi-icon">♍</span>
                <span class="rashi-name">कन्या</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('तुला', 'आध्यात्मिक कार्यों में रुचि बढ़ेगी। यात्रा के योग बन रहे हैं।')">
                <span class="rashi-icon">♎</span>
                <span class="rashi-name">तुला</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('वृश्चिक', 'काम का दबाव थोड़ा बढ़ सकता है। स्वास्थ्य के प्रति सचेत रहें।')">
                <span class="rashi-icon">♏</span>
                <span class="rashi-name">वृश्चिक</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('धनु', 'वित्तीय लेन-देन में सावधानी बरतें। विद्यार्थियों के लिए उत्तम समय।')">
                <span class="rashi-icon">♐</span>
                <span class="rashi-name">धनु</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('मकर', 'करियर में सकारात्मक बदलाव देखने को मिलेंगे। सुखद समाचार प्राप्त होगा।')">
                <span class="rashi-icon">♑</span>
                <span class="rashi-name">मकर</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('कुंभ', 'सामाजिक दायरा बढ़ेगा। आज आर्थिक स्थिति मजबूत रहने वाली है।')">
                <span class="rashi-icon">♒</span>
                <span class="rashi-name">कुंभ</span>
              </div>
              <div class="rashi-item" onclick="showHoroscope('मीन', 'लंबे समय से रुका हुआ काम पूरा होगा। मन में प्रसन्नता बनी रहेगी।')">
                <span class="rashi-icon">♓</span>
                <span class="rashi-name">मीन</span>
              </div>
            </div>
          </div>

        </aside>
      </div>

      <!-- Bottom Related News Section (4 columns matching Category Grid) -->
      <div style="margin-top: 50px; border-top: 2px solid var(--border-color); padding-top: 30px;">
        <div class="section-header" style="margin-bottom: 20px;">
          <span class="section-title">अन्य महत्वपूर्ण खबरें</span>
        </div>
        <div class="category-page-grid">
          ${relatedArticles.map(rel => `
            <div class="post-card" onclick="location.href='article.html?id=${rel.id}'">
              <div class="post-card-img">
                <img src="${rel.image}" alt="${rel.title}">
              </div>
              <div class="post-card-content">
                <h3 class="post-card-title">${rel.title}</h3>
                <div class="post-card-meta">
                  ${formatDateEnglish(rel.date)}
                </div>
                <span class="read-more-link">Read More »</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Hook comment submission
    const form = document.getElementById("article-comment-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("c-name").value.trim();
        const email = document.getElementById("c-email").value.trim();
        const text = document.getElementById("c-text").value.trim();

        try {
          const cRes = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: id, name, email, text })
          });
          const cData = await cRes.json();
          
          const commentsList = document.getElementById("comments-list-box");
          const noMsg = document.getElementById("no-comments-msg");
          if (noMsg) noMsg.remove();
          
          const cDiv = document.createElement("div");
          cDiv.className = "comment-item";
          cDiv.innerHTML = `
            <div class="comment-author-meta">
              <span class="comment-author-name">${cData.name}</span>
              <span>${cData.date}</span>
            </div>
            <p class="comment-text" style="font-size: 14px; margin-top: 5px;">${cData.text}</p>
          `;
          commentsList.appendChild(cDiv);
          form.reset();
        } catch (err) {
          console.error("Comment submission failed:", err);
        }
      });
    }
  } catch (err) {
    console.error("Failed to load article detail:", err);
  }
}

// --- Interactive Rashifal Alert helper ---
window.showHoroscope = function(rashi, prediction) {
  alert(`आज का राशिफल: ${rashi}\n\n${prediction}`);
};

// --- Dynamic Rendering: News Timeline Feed Page ---
async function renderNewsFeed() {
  const container = document.getElementById("main-container");
  if (!container || !window.location.pathname.endsWith('feed.html')) return;

  try {
    const res = await fetch(`${API_BASE}/articles`);
    const articles = await res.json();

    container.innerHTML = `
      <div class="main-content-layout">
        <div class="primary-content-pane">
          <div class="section-header" style="margin-bottom: 25px;">
            <h2 class="section-title">समाचार फीड (Timeline Feed)</h2>
            <a href="/api/feed.xml" target="_blank" style="background:#f97316; color:white; padding:4px 10px; font-size:12px; border-radius:4px; font-weight:bold; font-family:var(--font-en);">RSS FEED XML</a>
          </div>

          ${articles.length ? `
            <div class="feed-timeline">
              ${articles.map(art => `
                <div class="feed-item">
                  <div class="feed-item-card" onclick="location.href='article.html?id=${art.id}'">
                    <div class="feed-item-img">
                      <img src="${art.image}" alt="${art.title}">
                    </div>
                    <div class="feed-item-body">
                      <div class="card-meta">
                        <span>${art.category}</span>
                        <span>•</span>
                        <span>${art.date} ${art.time}</span>
                      </div>
                      <h3 class="cat-main-title" style="font-size:18px; margin-top:5px; line-height:1.4;">${art.title}</h3>
                      <p style="color:var(--text-secondary); font-size:14px; margin-top:5px;">${art.snippet}</p>
                      <span class="read-more-link" style="margin-top:10px;">पूरा पढ़ें »</span>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `
            <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">कोई समाचार उपलब्ध नहीं है।</p>
          `}
        </div>

        <div class="sidebar-pane">
          <div class="sidebar-widget">
            <h3 class="widget-title">फीड के बारे में</h3>
            <p style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
              यह दैनिक मान्यवर का निरंतर अपडेट होने वाला समाचार टाइमलाइन फीड है। यहाँ आप नवीनतम घटनाओं को क्रमबद्ध तरीके से पढ़ सकते हैं।
            </p>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Failed to render news timeline:", err);
  }
}

// --- Social Share Share Actions ---
window.shareArticle = function(platform, title) {
  const url = window.location.href;
  let shareUrl = "";
  if (platform === "facebook") {
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  } else if (platform === "twitter") {
    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  } else if (platform === "whatsapp") {
    shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + url)}`;
  } else if (platform === "telegram") {
    shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  }
  
  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
  }
};

// --- DOM Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initDateTime();
  initTickerSimulation();
  setupTheme();
  setupSearch();
  
  renderHomepage();
  renderCategoryPage();
  renderArticleDetail();
  renderNewsFeed();
  
  // Link nav triggers to page loads
  document.querySelectorAll(".nav-links li a").forEach(a => {
    a.addEventListener("click", (e) => {
      const cat = a.getAttribute("data-cat");
      if (cat) {
        e.preventDefault();
        if (cat === "home") {
          location.href = "index.html";
        } else {
          location.href = `category.html?cat=${cat}`;
        }
      }
    });
  });
});
