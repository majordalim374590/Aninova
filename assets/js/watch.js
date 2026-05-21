const params    = new URLSearchParams(location.search);
const animeId   = parseInt(params.get('id'));
let currentEp   = parseInt(params.get('ep')) || 1;
let isDub       = params.get('dub') === 'true';
let totalEps    = 0;
let server      = 'megaplay';

const player = document.getElementById('animePlayer');
const epList = document.getElementById('episodeList');

// ─── Build embed URL ───────────────────────────────────────────────
function getEmbedUrl(ep) {
  return CONFIG.EMBED_SERVERS[server]
    ? CONFIG.EMBED_SERVERS[server](animeId, ep, isDub)
    : CONFIG.EMBED_SERVERS.megaplay(animeId, ep, isDub);
}

// ─── Load episode ───────────────────────────────────────────────────
function loadEpisode(epNum) {
  currentEp = epNum;
  player.src = getEmbedUrl(epNum);

  document.getElementById('currentEpLabel').textContent  = `Episode ${epNum}`;
  document.getElementById('epProgressLabel').textContent = `EP ${epNum} of ${totalEps || '?'}`;
  document.title = `EP ${epNum} – AniNova`;

  // Sidebar highlight
  document.querySelectorAll('.ep-item').forEach(el => {
    const active = parseInt(el.dataset.ep) === epNum;
    el.classList.toggle('active', active);
    if (active) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  // Prev/Next opacity
  document.getElementById('prevEpBtn').style.opacity = epNum > 1        ? '1' : '0.3';
  document.getElementById('nextEpBtn').style.opacity = epNum < totalEps ? '1' : '0.3';

  history.replaceState({}, '', `?id=${animeId}&ep=${epNum}&dub=${isDub}`);
}

// ─── Navigation ────────────────────────────────────────────────────
function prevEpisode() { if (currentEp > 1)        loadEpisode(currentEp - 1); }
function nextEpisode() { if (currentEp < totalEps) loadEpisode(currentEp + 1); }

// ─── Audio toggle ───────────────────────────────────────────────────
function switchAudio(type) {
  isDub = type === 'dub';
  document.getElementById('btnSub').classList.toggle('active', !isDub);
  document.getElementById('btnDub').classList.toggle('active',  isDub);
  loadEpisode(currentEp);
}

// ─── Server switch ──────────────────────────────────────────────────
function switchServer(val) {
  server = val;
  loadEpisode(currentEp);
}

// ─── Episode list ───────────────────────────────────────────────────
function buildEpisodeList(count) {
  totalEps = count;
  document.getElementById('totalEpisodes').textContent = `${count} Episodes`;
  epList.innerHTML = Array.from({ length: count }, (_, i) => i + 1).map(ep => `
    <div class="ep-item ${ep === currentEp ? 'active' : ''}" data-ep="${ep}" onclick="loadEpisode(${ep})">
      <span class="ep-num">EP ${ep}</span>
    </div>`).join('');
}

function filterEpisodes(query) {
  document.querySelectorAll('.ep-item').forEach(el => {
    el.style.display = el.dataset.ep.includes(query) ? '' : 'none';
  });
}

// ─── Init ────────────────────────────────────────────────────────────
async function init() {
  if (!animeId) return;

  document.getElementById('btnSub').classList.toggle('active', !isDub);
  document.getElementById('btnDub').classList.toggle('active',  isDub);

  try {
    const info  = await getAnimeInfo(animeId);
    const title = getTitle(info);
    document.getElementById('sidebarAnimeTitle').textContent = title;
    document.getElementById('watchNavTitle').textContent     = title;
    document.title = `Watch ${title} – AniNova`;

    const epCount = info.episodes || 24;
    buildEpisodeList(epCount);
  } catch {
    buildEpisodeList(24);
  }

  loadEpisode(currentEp);
}

init();