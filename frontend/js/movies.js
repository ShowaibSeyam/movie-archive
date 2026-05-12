/* ============================================================
   Movie Archive – movies.js
   Card renderer · Watchlist · Home · Movies · Genres · Search
   ============================================================ */

/* ── Movie Card HTML ──────────────────────────────────────── */
function cardHTML(m) {
  const inWL = S.watchlist.includes(m.movie_id);
  return `
  <div class="movie-card" onclick="go('detail',${m.movie_id})">
    <div class="card-poster">
      ${m.poster_url
        ? `<img src="${m.poster_url}" alt="${m.title}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="poster-ph" ${m.poster_url ? 'style="display:none"' : ''}>
        <span class="poster-ph-icon">🎬</span>
        <span class="poster-ph-title">${m.title}</span>
      </div>
      <div class="card-rb">⭐ ${(+m.rating || 0).toFixed(1)}</div>
      <button class="wl-btn ${inWL ? 'active' : ''}"
        onclick="event.stopPropagation();toggleWL(${m.movie_id},this)"
        title="${inWL ? 'Remove from watchlist' : 'Add to watchlist'}">
        ${inWL ? '✓' : '＋'}
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${m.title}</div>
      <div class="card-meta">
        <span>${m.release_year || '—'}</span>
        <span class="g-chip">${m.genre_name || '—'}</span>
      </div>
    </div>
  </div>`;
}

/* ── Watchlist helpers ────────────────────────────────────── */
async function loadWLids() {
  if (!S.user) return;
  try {
    const d = await api('/watchlist');
    S.watchlist = (d.watchlist || []).map(m => m.movie_id);
  } catch { /* silent */ }
}

async function toggleWL(mid, btn) {
  if (!S.user) { openModal('login'); return; }
  const inList = S.watchlist.includes(mid);
  try {
    if (inList) {
      await api('/watchlist/' + mid, { method: 'DELETE' });
      S.watchlist = S.watchlist.filter(id => id !== mid);
      if (btn) { btn.textContent = '＋'; btn.classList.remove('active'); }
      toast('Removed from watchlist.', 'inf');
    } else {
      await api('/watchlist/' + mid, { method: 'POST' });
      S.watchlist.push(mid);
      if (btn) { btn.textContent = '✓'; btn.classList.add('active'); }
      toast('Added to watchlist!', 'ok');
    }
  } catch(e) { toast(e.message, 'err'); }
}

/* ── Home page ────────────────────────────────────────────── */
async function initHome() {
  // Reel decoration
  document.getElementById('reel-grid').innerHTML =
    Array(6).fill('').map(() => `<div class="reel-cell"><div class="reel-cell-ph">🎬</div></div>`).join('');

  try {
    const [fd, gd, dd] = await Promise.all([
      api('/movies/featured'), api('/genres'), api('/directors')
    ]);
    document.getElementById('home-grid').innerHTML = fd.movies.map(cardHTML).join('');
    document.getElementById('s-movies').textContent    = fd.movies.length + '+';
    document.getElementById('s-genres').textContent    = gd.genres.length;
    document.getElementById('s-directors').textContent = dd.directors.length + '+';
    if (!S.genres.length) { S.genres = gd.genres; S.directors = dd.directors; }
  } catch {
    document.getElementById('home-grid').innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Cannot connect to backend</div>
        <div style="color:var(--text3);font-size:14px;margin-top:6px">
          Start the Node.js server: <code>cd backend && npm run dev</code>
        </div>
      </div>`;
  }
}

/* ── Movies page ──────────────────────────────────────────── */
function debounceFilter() {
  clearTimeout(S.filterTimer);
  S.filterTimer = setTimeout(() => doFilter(1), 400);
}

async function initMovies() {
  if (!S.genres.length) await loadMeta();

  const gs = document.getElementById('f-genre');
  if (gs.children.length <= 1) {
    S.genres.forEach(g => {
      const o = document.createElement('option');
      o.value = g.genre_id; o.textContent = g.genre_name;
      gs.appendChild(o);
    });
  }
  const ys = document.getElementById('f-year');
  if (ys.children.length <= 1) {
    const cy = new Date().getFullYear();
    for (let y = cy; y >= 1970; y--) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y;
      ys.appendChild(o);
    }
  }
  doFilter(1);
}

async function doFilter(page = 1) {
  const q      = document.getElementById('f-q').value;
  const genre  = document.getElementById('f-genre').value;
  const year   = document.getElementById('f-year').value;
  const sort   = document.getElementById('f-sort').value;
  const order  = sort === 'title' ? 'ASC' : 'DESC';

  document.getElementById('movies-grid').innerHTML =
    '<div class="loader"><div class="spinner"></div></div>';

  try {
    const p = new URLSearchParams({ search:q, genre_id:genre, year, sort, order, page, limit:12 });
    const d = await api('/movies?' + p);
    document.getElementById('movies-count').textContent = d.pagination.total + ' movies found';
    document.getElementById('movies-grid').innerHTML = d.movies.length
      ? d.movies.map(cardHTML).join('')
      : `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">No movies found</div></div>`;
    renderPagination(d.pagination);
  } catch(e) {
    document.getElementById('movies-grid').innerHTML =
      `<p style="color:var(--red-b);padding:20px">${e.message}</p>`;
  }
}

function renderPagination({ page, totalPages }) {
  if (totalPages <= 1) { document.getElementById('pagination').innerHTML = ''; return; }
  let h = `<button class="pg-btn" ${page<=1?'disabled':''} onclick="doFilter(${page-1})">‹</button>`;
  for (let i = Math.max(1,page-2); i <= Math.min(totalPages,page+2); i++)
    h += `<button class="pg-btn ${i===page?'active':''}" onclick="doFilter(${i})">${i}</button>`;
  h += `<button class="pg-btn" ${page>=totalPages?'disabled':''} onclick="doFilter(${page+1})">›</button>`;
  document.getElementById('pagination').innerHTML = h;
}

/* ── Genres page ──────────────────────────────────────────── */
const GICONS = {
  Action:'⚔️', Drama:'🎭', Thriller:'🔪', 'Sci-Fi':'🚀',
  Comedy:'😄', Horror:'👻', Romance:'💕', Animation:'🎨',
  Documentary:'📽️', Fantasy:'🧙'
};

async function initGenres() {
  if (!S.genres.length) await loadMeta();
  document.getElementById('genres-grid').innerHTML = S.genres.map(g => `
    <div class="genre-card" onclick="filterByGenre(${g.genre_id})">
      <div class="genre-icon">${GICONS[g.genre_name] || '🎬'}</div>
      <div class="genre-name">${g.genre_name}</div>
    </div>`).join('');
}

function filterByGenre(gid) {
  go('movies');
  setTimeout(() => {
    document.getElementById('f-genre').value = gid;
    doFilter(1);
  }, 100);
}

/* ── Watchlist page ───────────────────────────────────────── */
async function initWatchlist() {
  if (!S.user) { openModal('login'); go('home'); return; }
  document.getElementById('wl-grid').innerHTML =
    '<div class="loader"><div class="spinner"></div></div>';
  try {
    const d = await api('/watchlist');
    S.watchlist = (d.watchlist || []).map(m => m.movie_id);
    document.getElementById('wl-grid').innerHTML = d.watchlist.length
      ? d.watchlist.map(cardHTML).join('')
      : `<div class="empty">
           <div class="empty-icon">🎬</div>
           <div class="empty-title">Watchlist is empty</div>
           <div style="color:var(--text3);font-size:14px;margin-top:8px">Browse movies and add them here.</div>
         </div>`;
  } catch(e) {
    document.getElementById('wl-grid').innerHTML =
      `<p style="color:var(--red-b)">${e.message}</p>`;
  }
}

/* ── Live Search ──────────────────────────────────────────── */
function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-inp').focus(), 60);
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-inp').value = '';
  document.getElementById('search-list').innerHTML =
    '<div class="search-hint">Start typing to search…</div>';
}
function searchOverlayClick(e) { if (e.target === e.currentTarget) closeSearch(); }

function liveSearch(q) {
  clearTimeout(S.searchTimer);
  if (q.length < 2) {
    document.getElementById('search-list').innerHTML =
      '<div class="search-hint">Type at least 2 characters…</div>';
    return;
  }
  document.getElementById('search-list').innerHTML =
    '<div class="loader" style="padding:24px"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div></div>';

  S.searchTimer = setTimeout(async () => {
    try {
      const d = await api('/movies?search=' + encodeURIComponent(q) + '&limit=8');
      if (!d.movies.length) {
        document.getElementById('search-list').innerHTML =
          '<div class="search-hint">No results found.</div>';
        return;
      }
      document.getElementById('search-list').innerHTML = d.movies.map(m => `
        <div class="sr-item" onclick="closeSearch();go('detail',${m.movie_id})">
          <div class="sr-thumb">
            ${m.poster_url
              ? `<img src="${m.poster_url}" alt="" onerror="this.parentNode.textContent='🎬'"/>`
              : '🎬'}
          </div>
          <div>
            <div class="sr-title">${m.title}</div>
            <div class="sr-sub">${m.release_year||'—'} · ${m.genre_name||'—'} · ⭐ ${(+m.rating||0).toFixed(1)}</div>
          </div>
        </div>`).join('');
    } catch { /* silent */ }
  }, 350);
}
