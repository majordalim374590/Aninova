const CONFIG = {
  ANILIST_API: 'https://graphql.anilist.co',
  SITE_NAME: 'AniNova',
  EMBED_SERVERS: {
    megaplay: (id, ep, dub) =>
      `https://megaplay.buzz/stream/ani/${id}/${ep}/${dub ? 'dub' : 'sub'}`,
    vidsrc: (id, ep) =>
      `https://vidsrc.cc/v2/embed/anime/${id}/${ep}`,
  },
};