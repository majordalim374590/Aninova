// ─── AniList GraphQL ───────────────────────────────────────────────
const MEDIA_FIELDS = `
  id title { romaji english native }
  coverImage { large extraLarge }
  bannerImage averageScore popularity
  episodes duration status format
  genres startDate { year month day }
  description(asHtml: false)
  nextAiringEpisode { episode airingAt }
`;

async function anilistQuery(query, variables = {}) {
  const res = await fetch(CONFIG.ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  return data.data;
}

// ─── Data fetchers ─────────────────────────────────────────────────
async function getTrending(page = 1) {
  const q = `query($page:Int){Page(page:$page,perPage:24){media(sort:TRENDING_DESC,type:ANIME,isAdult:false){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { page })).Page.media;
}

async function getPopular(page = 1) {
  const q = `query($page:Int){Page(page:$page,perPage:24){media(sort:POPULARITY_DESC,type:ANIME,isAdult:false){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { page })).Page.media;
}

async function getNewReleases(page = 1) {
  const q = `query($page:Int){Page(page:$page,perPage:24){media(sort:START_DATE_DESC,type:ANIME,isAdult:false,status:RELEASING){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { page })).Page.media;
}

async function getUpcoming(page = 1) {
  const q = `query($page:Int){Page(page:$page,perPage:24){media(sort:START_DATE_DESC,type:ANIME,isAdult:false,status:NOT_YET_RELEASED){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { page })).Page.media;
}

async function getCompleted(page = 1) {
  const q = `query($page:Int){Page(page:$page,perPage:24){media(sort:POPULARITY_DESC,type:ANIME,isAdult:false,status:FINISHED){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { page })).Page.media;
}

async function getRecentlyUpdated() {
  const now = Math.floor(Date.now() / 1000);
  const weekAgo = now - 7 * 24 * 60 * 60;
  const q = `query{Page(page:1,perPage:24){airingSchedules(airingAt_greater:${weekAgo},airingAt_lesser:${now},sort:TIME_DESC){episode airingAt media{${MEDIA_FIELDS}}}}}`;
  const d = await anilistQuery(q);
  return d.Page.airingSchedules.map(s => ({ ...s.media, recentEpisode: s.episode }));
}

async function searchAnime(query, page = 1) {
  const q = `query($search:String,$page:Int){Page(page:$page,perPage:24){media(search:$search,type:ANIME,isAdult:false){${MEDIA_FIELDS}}}}`;
  return (await anilistQuery(q, { search: query, page })).Page.media;
}

async function getAnimeInfo(id) {
  const q = `query($id:Int){Media(id:$id,type:ANIME){${MEDIA_FIELDS} relations{edges{relationType(version:2) node{id title{romaji}coverImage{medium}type}}}}}`;
  return (await anilistQuery(q, { id: parseInt(id) })).Media;
}

// ─── Helpers ───────────────────────────────────────────────────────
function getTitle(anime) {
  return anime.title.english || anime.title.romaji || anime.title.native;
}

function getScore(anime) {
  return anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
}

function getYear(anime) {
  return anime.startDate?.year || '';
}

function buildCard(anime, badge = null) {
  const title = getTitle(anime);
  const img   = anime.coverImage.extraLarge || anime.coverImage.large;
  const score = getScore(anime);
  const eps   = anime.episodes
    ? `${anime.episodes} eps`
    : anime.recentEpisode
    ? `EP ${anime.recentEpisode}`
    : 'Ongoing';
  const badgeHtml = badge ? `<span class="card-badge">${badge}</span>` : '';

  return `
    <div class="anime-card" onclick="location.href='anime.html?id=${anime.id}'">
      <div class="card-img-wrap">
        <img src="${img}" alt="${title}" loading="lazy">
        <div class="card-overlay"><button class="play-btn">▶</button></div>
        ${badgeHtml}
        <span class="card-score">⭐ ${score}</span>
        <span class="card-eps">${eps}</span>
      </div>
      <div class="card-info">
        <h4 class="card-title">${title}</h4>
        <p class="card-meta">${anime.format || 'TV'} • ${getYear(anime)}</p>
      </div>
    </div>`;
}