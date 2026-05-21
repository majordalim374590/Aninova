const params  = new URLSearchParams(location.search);
const animeId = params.get('id');
let isDub     = false;
let info      = null;
let episodes  = [];

async function loadAnimePage() {
  if (!animeId) {
    document.getElementById('animeDetailRoot').textContent = 'Invalid anime ID.';
    return;
  }

  info = await getAnimeInfo(animeId);
  const title  = getTitle(info);
  const banner = info.bannerImage || info.coverImage.extraLarge;
  const poster = info.coverImage.extraLarge || info.coverImage.large;
  const desc   = info.description?.replace(/<[^>]*>/g, '') || 'No description available.';
  document.title = `${title} – AniNova`;

  const epCount = info.episodes || 24;
  episodes = Array.from({ length: epCount }, (_, i) => i + 1);

  document.getElementById('animeDetailRoot').innerHTML = `
    <div class="detail-banner">
      <img class="detail-banner-img" src="${banner}" alt="">
      <div class="detail-banner-grad"></div>
    </div>
    <div class="detail-main">
      <div>
        <div class="detail-poster"><img src="${poster}" alt="${title}"></div>
        <div style="margin-top:1rem;display:flex;flex-direction:column;gap:.6rem;">
          <a class="btn-primary" href="watch.html?id=${animeId}&ep=1&dub=false">▶ Watch EP 1</a>
          <a class="btn-secondary" href="#episodes">📋 Episode List</a>
        </div>
      </div>
      <div class="detail-info">
        <h1>${title}</h1>
        <p class="detail-alt-title">${info.title.native || ''} ${info.title.romaji !== title ? '/ ' + info.title.romaji : ''}</p>
        <div class="detail-tags">${(info.genres || []).map(g => `<span class="detail-tag">${g}</span>`).join('')}</div>
        <div class="detail-stats">
          <div class="detail-stat"><label>Score</label><value>⭐ ${getScore(info)}</value></div>
          <div class="detail-stat"><label>Episodes</label><value>${info.episodes || '?'}</value></div>
          <div class="detail-stat"><label>Status</label><value>${info.status || '?'}</value></div>
          <div class="detail-stat"><label>Year</label><value>${getYear(info)}</value></div>
          <div class="detail-stat"><label>Format</label><value>${info.format || 'TV'}</value></div>
        </div>
        <p class="detail-desc">${desc}</p>

        <div class="episodes-section" id="episodes">
          <h2>Episodes</h2>
          <div class="ep-audio-toggle">
            <button class="ep-audio-btn active" id="subBtn" onclick="setAudio(false)">SUB</button>
            <button class="ep-audio-btn"        id="dubBtn" onclick="setAudio(true)">DUB</button>
          </div>
          <div class="episodes-grid" id="episodesGrid">
            ${renderEpisodes()}
          </div>
        </div>
      </div>
    </div>`;
}

function renderEpisodes() {
  return episodes.map(ep => `
    <button class="ep-btn" onclick="watchEpisode(${ep})">EP ${ep}</button>
  `).join('');
}

function setAudio(dub) {
  isDub = dub;
  document.getElementById('subBtn')?.classList.toggle('active', !dub);
  document.getElementById('dubBtn')?.classList.toggle('active',  dub);
}

function watchEpisode(epNum) {
  location.href = `watch.html?id=${animeId}&ep=${epNum}&dub=${isDub}`;
}

// ─── Shared search ─────────────────────────────────────────────────
let searchTimer;
const searchInput    = document.getElementById('searchInput');
const searchBtn      = document.getElementById('searchBtn');
const searchDropdown = document.getElementById('searchDropdown');

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
          <div class="dropdown-item-meta">${a.format || 'TV'} • ${getYear(a)}</div>
        </div>
      </div>`).join('');
  }, 400);
});
searchBtn?.addEventListener('click', () => {
  if (searchInput.value.trim()) location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
});
document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar')) searchDropdown.innerHTML = '';
});

loadAnimePage();