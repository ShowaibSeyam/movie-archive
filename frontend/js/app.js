/* ============================================================
   Movie Archive – app.js
   Core: config · state · API helper · toast · router · theme
   ============================================================ */

const API = 'https://movie-archive-lfyc.onrender.com/api';

/* ── Global State ─────────────────────────────────────────── */
const S = {
  user:      null,
  token:     localStorage.getItem('ma_tok') || null,
  genres:    [],
  directors: [],
  actors:    [],
  watchlist: [],          // array of movie_ids
  curMovId:  null,
  starRating: 0,
  filterTimer: null,
  searchTimer: null,
  metaType:  null,
  metaId:    null,
  adminTab:  'movies',
  editMFid:  null,
};

/* ── API helper ───────────────────────────────────────────── */
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (S.token) headers['Authorization'] = 'Bearer ' + S.token;
  const res  = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Toast ────────────────────────────────────────────────── */
function toast(msg, type = 'inf') {
  const icons = { ok: '✅', err: '❌', inf: '🎬' };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

/* ── Router ───────────────────────────────────────────────── */
function go(page, param = null) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const pe = document.getElementById('page-' + page);
  if (pe) pe.classList.add('active');
  const ne = document.getElementById('nl-' + page);
  if (ne) ne.classList.add('active');
  window.scrollTo(0, 0);

  if (page === 'home')      initHome();
  if (page === 'movies')    initMovies();
  if (page === 'genres')    initGenres();
  if (page === 'watchlist') initWatchlist();
  if (page === 'profile')   initProfile();
  if (page === 'admin')     initAdmin();
  if (page === 'detail' && param) { S.curMovId = param; initDetail(param); }
}

function requireAuth(cb) {
  if (!S.user) { openModal('login'); return; }
  cb();
}

/* ── Theme ────────────────────────────────────────────────── */
let _dark = true;
function toggleTheme() {
  _dark = !_dark;
  document.documentElement.setAttribute('data-theme', _dark ? 'dark' : 'light');
  document.getElementById('theme-btn').textContent = _dark ? '🌙' : '☀️';
}

/* ── Render Navbar Auth ───────────────────────────────────── */
function renderAuth() {
  const slot = document.getElementById('nav-auth-slot');
  if (!S.user) {
    slot.innerHTML = `<button class="nav-cta" onclick="openModal('login')">Sign In</button>`;
    return;
  }
  const ini = S.user.user_name.slice(0, 2).toUpperCase();
  slot.innerHTML = `
    <div class="avatar-wrap">
      <div class="user-avatar" onclick="toggleDd()">${ini}</div>
      <div class="dropdown" id="user-dd">
        <div class="dd-user">
          <div class="dd-name">${S.user.user_name}</div>
          <div class="dd-email">${S.user.email}</div>
        </div>
        <div class="dd-item" onclick="closeDd();go('profile')">👤 My Profile</div>
        <div class="dd-item" onclick="closeDd();requireAuth(()=>go('watchlist'))">🎬 Watchlist</div>
        ${S.user.role === 'admin' ? `<div class="dd-item" onclick="closeDd();go('admin')">⚙️ Admin Panel</div>` : ''}
        <div class="dd-sep"></div>
        <div class="dd-item danger" onclick="doLogout()">🚪 Sign Out</div>
      </div>
    </div>`;
}

function toggleDd() { document.getElementById('user-dd')?.classList.toggle('open'); }
function closeDd()   { document.getElementById('user-dd')?.classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.avatar-wrap')) closeDd(); });

/* ── Modals ───────────────────────────────────────────────── */
function openModal(id)  { document.getElementById('modal-' + id).classList.add('open'); }
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); }
function switchModal(a, b) { closeModal(a); openModal(b); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ── Auth actions ─────────────────────────────────────────── */
async function doLogin() {
  const email = document.getElementById('l-email').value;
  const pass  = document.getElementById('l-pass').value;
  document.getElementById('l-err').textContent = '';
  try {
    const d = await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password: pass }) });
    S.token = d.token; S.user = d.user;
    localStorage.setItem('ma_tok', d.token);
    closeModal('login'); renderAuth(); loadWLids();
    toast('Welcome back, ' + d.user.user_name + '!', 'ok');
  } catch(e) { document.getElementById('l-err').textContent = e.message; }
}

async function doRegister() {
  const n     = document.getElementById('r-name').value;
  const email = document.getElementById('r-email').value;
  const pass  = document.getElementById('r-pass').value;
  document.getElementById('r-err').textContent = '';
  try {
    const d = await api('/auth/register', { method:'POST', body: JSON.stringify({ user_name:n, email, password:pass }) });
    S.token = d.token; S.user = d.user;
    localStorage.setItem('ma_tok', d.token);
    closeModal('register'); renderAuth();
    toast('Welcome, ' + d.user.user_name + '!', 'ok');
  } catch(e) { document.getElementById('r-err').textContent = e.message; }
}

function doLogout() {
  S.token = null; S.user = null; S.watchlist = [];
  localStorage.removeItem('ma_tok');
  renderAuth(); go('home'); toast('Signed out.', 'inf');
}

/* ── Load meta (genres/directors/actors) ──────────────────── */
async function loadMeta() {
  const [gd, dd, ad] = await Promise.all([api('/genres'), api('/directors'), api('/actors')]);
  S.genres    = gd.genres    || [];
  S.directors = dd.directors || [];
  S.actors    = ad.actors    || [];
}

/* ── Boot ─────────────────────────────────────────────────── */
(async function boot() {
  if (S.token) {
    try {
      const d = await api('/auth/me');
      S.user = d.user;
      await loadWLids();
    } catch {
      S.token = null;
      localStorage.removeItem('ma_tok');
    }
  }
  renderAuth();
  initHome();
})();
