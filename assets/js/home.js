const TABS = {
  trending:  { fn: getTrending,        title: '🔥 Trending Now' },
  new:       { fn: getNewReleases,     title: '🆕 New Releases' },
  ongoing:   { fn: getNewReleases,     title: '📡 Ongoing' },
  recent:    { fn: getRecentlyUpdated, title: '🕐 Recently Updated' },
  upcoming:  { fn: getUpcoming,        title: '📅 Upcoming' },
  completed: { fn: getCompleted,       title: '✅ Completed' },
};

// ─── Hero Banner ───────────────────────────────────────────────────
async function loadHero(animeList) {
  const hero     = document.getElementById('heroBanner');
  const featured = animeList.slice(0, 5);
  let idx = 0;

  function renderHero(anime) {
    const title  = getTitle(anime);
    const desc   = anime.description?.replace(/<[^>]*>/g, '') || '';
    const score  = getScore(anime);
    const genres = (anime.genres || []).slice(0, 3);
    hero.innerHTML = `
      <div class="hero-bg" style="background-image:url('${anime.bannerImage || anime.coverImage.extraLarge}')"></div>
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <div class="hero-tags">${genres.map(g => `<span class="hero-tag">${g}</span>`).join('')}</div>
        <h1 class="hero-title">${title}</h1>
        <p class="hero-desc">${desc}</p>
        <div class="hero-meta">
          <span class="hero-score">⭐ ${score}</span>
          <span>${anime.format || 'TV'}</span>
          <span>${anime.episodes ? anime.episodes + ' eps' : 'Ongoing'}</span>
          <span>${getYear(anime)}</span>
        </div>
        <div class="hero-buttons">
          <a class="btn-watch" href="watch.html?id=${anime.id}&ep=1">▶ Watch Now</a>
          <a class="btn-info"  href="anime.html?id=${anime.id}">ℹ More Info</a>
        </div>
      </div>`;
  }

  if (featured.length) {
    renderHero(featured[0]);
    setInterval(() => {
      idx = (idx + 1) % featured.length;
      renderHero(featured[idx]);
    }, 6000);
  }
}

// ─── Section loader ────────────────────────────────────────────────
async function loadSection(gridId, fetchFn, limit = 12) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '<div class="loading-row"></div>';
  try {
    const items = await fetchFn();
    grid.innerHTML = items.slice(0, limit).map(a => buildCard(a)).join('');
  } catch {
    grid.innerHTML = '<div class="loading-text">Failed to load. Refresh the page.</div>';
  }
}

// ─── Full tab view ─────────────────────────────────────────────────
async function loadFullTab(tab, page = 1) {
  const fullSec   = document.getElementById('sec-fullview');
  const fullGrid  = document.getElementById('fullviewGrid');
  const fullTitle = document.getElementById('fullviewTitle');
  const pag       = document.getElementById('pagination');

  document.querySelectorAll('.anime-section:not(#sec-fullview)').forEach(s => s.classList.add('hidden'));
  fullSec.classList.remove('hidden');

  const cfg = TABS[tab];
  fullTitle.textContent = cfg.title;
  fullGrid.innerHTML = '<div class="loading-text">Loading...</div>';

  try {
    const items = await cfg.fn(page);
    fullGrid.innerHTML = items.map(a => buildCard(a)).join('');
    buildPagination(pag, page, tab);
  } catch {
    fullGrid.innerHTML = '<div class="loading-text">Failed to load.</div>';
  }
}

function buildPagination(container, current, tab) {
  let html = '';
  const prev = current > 1
    ? `<button class="page-btn" onclick="loadFullTab('${tab}',${current - 1})">← Prev</button>`
    : '';
  const next = `<button class="page-btn" onclick="loadFullTab('${tab}',${current + 1})">Next →</button>`;
  for (let i = Math.max(1, current - 2); i <= current + 2; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="loadFullTab('${tab}',${i})">${i}</button>`;
  }
  container.innerHTML = prev + html + next;
}

// ─── Search ────────────────────────────────────────────────────────
let searchTimer;
const searchInput    = document.getElementById('searchInput');
const searchBtn      = document.getElementById('searchBtn');
const searchDropdown = document.getElementById('searchDropdown');

function goSearch(q) {
  if (!q.trim()) return;
  location.href = `search.html?q=${encodeURIComponent(q.trim())}`;
}

searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  if (!q) { searchDropdown.innerHTML = ''; return; }
  searchTimer = setTimeout(async () => {
    const results = await searchAnime(q);
    searchDropdown.innerHTML = results.slice(0, 6).map(a => `
      <div class="dropdown-item" onclick="location.href='anime.html?id=${a.id}'">
        <img src="${a.coverImage.large}" alt="">
        <div class="dropdown-item-info">
          <div class="dropdown-item-title">${getTitle(a)}</div>
          <div class="dropdown-item-meta">${a.format || 'TV'} • ${getYear(a)} • ⭐${getScore(a)}</div>
        </div>
      </div>`).join('');
  }, 400);
});

searchBtn?.addEventListener('click',  () => goSearch(searchInput.value));
searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(searchInput.value); });
document.addEventListener('click', e => { if (!e.target.closest('.search-bar')) searchDropdown.innerHTML = ''; });

// ─── Init ──────────────────────────────────────────────────────────
async function init() {
  const params = new URLSearchParams(location.search);
  const tab    = params.get('tab');

  if (tab && TABS[tab]) {
    loadFullTab(tab, 1);
    document.querySelectorAll('.nav-link').forEach(l => {
      if (l.href.includes(`tab=${tab}`)) l.classList.add('active');
    });
    return;
  }

  const trending = await getTrending();
  loadHero(trending);
  loadSection('trendingGrid',  getTrending,        12);
  loadSection('recentGrid',    getRecentlyUpdated, 12);
  loadSection('newGrid',       getNewReleases,     12);
  loadSection('upcomingGrid',  getUpcoming,        12);
  loadSection('completedGrid', getCompleted,       12);
}

init();