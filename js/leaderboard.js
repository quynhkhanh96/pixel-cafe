// Khanh's Pixel Café — shared leaderboard helper.
// Fill in SUPABASE_URL and SUPABASE_ANON_KEY (Supabase → Project Settings → API).
// Both values are safe to publish: the database only allows reading scores and adding new ones.
// Until they are filled in, scores are kept in this browser only, so the site still works.
(function () {
  const SUPABASE_URL = '';       // e.g. 'https://abcdefgh.supabase.co'
  const SUPABASE_ANON_KEY = '';  // the "anon public" key

  const online = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const headers = () => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  });
  const LOCAL_KEY = game => `pixelcafe-scores-${game}`;

  function cleanName(name) {
    return String(name || '').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 16);
  }

  function readLocal(game) {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY(game)) || '[]'); } catch (e) { return []; }
  }

  async function submit(game, name, score, served) {
    const row = { game, name: cleanName(name), score: Math.round(score), served: Math.round(served || 0) };
    if (!row.name) throw new Error('Please enter a nickname.');
    try { localStorage.setItem('pixelcafe-nickname', row.name); } catch (e) {}
    if (!online) {
      const list = readLocal(game);
      list.push({ ...row, created_at: new Date().toISOString() });
      list.sort((a, b) => b.score - a.score);
      try { localStorage.setItem(LOCAL_KEY(game), JSON.stringify(list.slice(0, 50))); } catch (e) {}
      return { online: false };
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
      method: 'POST', headers: { ...headers(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
    });
    if (!res.ok) throw new Error('Could not save the score. Check your connection and try again.');
    return { online: true };
  }

  async function top(game, limit = 10) {
    if (!online) return readLocal(game).slice(0, limit);
    const q = `game=eq.${encodeURIComponent(game)}&select=name,score,served,created_at&order=score.desc,created_at.asc&limit=${limit}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?${q}`, { headers: headers() });
    if (!res.ok) throw new Error('Could not load the leaderboard.');
    return res.json();
  }

  function lastName() {
    try { return localStorage.getItem('pixelcafe-nickname') || ''; } catch (e) { return ''; }
  }

  window.PixelCafeBoard = { submit, top, online, lastName, cleanName };
})();
