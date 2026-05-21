const params  = new URLSearchParams(location.search);
const query   = params.get('q') || '';
let currentPage = 1;

const searchInput    = document.getElementById('searchInput');
const searchBtn      = document.getElementById('searchBtn');

if (searchInput) searchInput.value = query;
document.getElementById('searchTitle').textContent = query
  ? `Results for "${query}"`
  : 'Search Anime';

async function loadResults(page = 1) {
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = '<div class="loading-text">Searching...</div>';
  try {
    const results = await searchAnime(query, page);
    grid.innerHTML = results.length
      ? results.map(a => buildCard(a)).join('')
      : '<div class="loading-text">No results found. Try a different name.</div>';
    buildPagination(page);
  } catch {
    grid.innerHTML = '<div class="loading-text">Search failed. Refresh and try again.</div>';
  }
}

function buildPagination(current) {
  const container = document.getElementById('pagination');
  const prev = current > 1
    ? `<button class="page-btn" onclick="goPage(${current - 1})">← Prev</button>`
    : '';
  const next = `<button class="page-btn" onclick="goPage(${current + 1})">Next →</button>`;
  let html = '';
  for (let i = Math.max(1, current - 2); i <= current + 2; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  container.innerHTML = prev + html + next;
}

function goPage(p) {
  currentPage = p;
  loadResults(p);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

searchBtn?.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) location.href = `search.html?q=${encodeURIComponent(q)}`;
});
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (q) location.href = `search.html?q=${encodeURIComponent(q)}`;
  }
});

if (query) loadResults();