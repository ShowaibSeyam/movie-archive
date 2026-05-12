/* ============================================================
   Movie Archive – admin.js
   Admin Panel: Movies · Genres · Directors · Actors · Users
   ============================================================ */

function initAdmin() {
  if (!S.user || S.user.role !== 'admin') {
    toast('Admin access required', 'err');
    go('home');
    return;
  }
  loadMeta().then(() => loadAdmTab('movies'));
}

function switchTab(tab) {
  document.querySelectorAll('.adm-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.t === tab)
  );
  S.adminTab = tab;
  loadAdmTab(tab);
}

async function loadAdmTab(tab) {
  const el = document.getElementById('adm-content');
  el.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    if (tab === 'movies')    await renderAdmMovies(el);
    if (tab === 'genres')    await renderAdmGenres(el);
    if (tab === 'directors') await renderAdmDirectors(el);
    if (tab === 'actors')    await renderAdmActors(el);
    if (tab === 'users')     await renderAdmUsers(el);
  } catch(e) {
    el.innerHTML = `<p style="color:var(--red-b);padding:16px">${e.message}</p>`;
  }
}

/* ── Movies Tab ───────────────────────────────────────────── */
async function renderAdmMovies(el) {
  const d = await api('/movies?limit=50&sort=created_at&order=DESC');
  el.innerHTML = `
    <div class="adm-tb">
      <span style="color:var(--text2);font-size:13px">${d.pagination.total} movies total</span>
      <button class="btn-gold" style="font-size:13px;padding:8px 18px" onclick="openAddMF()">＋ Add Movie</button>
    </div>
    <div class="tbl-wrap">
      <table class="adm-tbl">
        <thead><tr>
          <th>Title</th><th>Year</th><th>Genre</th><th>Director</th><th>Rating</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${d.movies.map(m => `
          <tr>
            <td><strong>${m.title}</strong></td>
            <td>${m.release_year || '—'}</td>
            <td>${m.genre_name || '—'}</td>
            <td>${m.director_name || '—'}</td>
            <td>⭐ ${(+m.rating || 0).toFixed(1)}</td>
            <td>
              <button class="tb-btn edit" onclick="openEditMF(${m.movie_id})">Edit</button>
              <button class="tb-btn del"  onclick="admDelMov(${m.movie_id})">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Genres Tab ───────────────────────────────────────────── */
async function renderAdmGenres(el) {
  el.innerHTML = `
    <div class="adm-tb">
      <span style="color:var(--text2);font-size:13px">${S.genres.length} genres</span>
      <div style="display:flex;gap:8px">
        <input class="finput" id="ng-inp" placeholder="New genre name"
               style="width:200px;padding:8px 14px"/>
        <button class="btn-gold" style="font-size:13px;padding:8px 18px" onclick="admAddGenre()">＋ Add</button>
      </div>
    </div>
    <div class="tbl-wrap">
      <table class="adm-tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          ${S.genres.map(g => `
          <tr>
            <td>#${g.genre_id}</td>
            <td>${g.genre_name}</td>
            <td><button class="tb-btn del" onclick="admDelGenre(${g.genre_id})">Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Directors Tab ────────────────────────────────────────── */
async function renderAdmDirectors(el) {
  el.innerHTML = `
    <div class="adm-tb">
      <span style="color:var(--text2);font-size:13px">${S.directors.length} directors</span>
      <button class="btn-gold" style="font-size:13px;padding:8px 18px"
        onclick="openMeta('director')">＋ Add Director</button>
    </div>
    <div class="tbl-wrap">
      <table class="adm-tbl">
        <thead><tr><th>Name</th><th>Nationality</th><th>Actions</th></tr></thead>
        <tbody>
          ${S.directors.map(d => `
          <tr>
            <td><strong>${d.director_name}</strong></td>
            <td>${d.nationality || '—'}</td>
            <td>
              <button class="tb-btn edit"
                onclick="openMeta('director',${d.director_id},'${d.director_name.replace(/'/g,"\\'")}','${(d.nationality||'').replace(/'/g,"\\'")}')">
                Edit
              </button>
              <button class="tb-btn del" onclick="admDelDir(${d.director_id})">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Actors Tab ───────────────────────────────────────────── */
async function renderAdmActors(el) {
  el.innerHTML = `
    <div class="adm-tb">
      <span style="color:var(--text2);font-size:13px">${S.actors.length} actors</span>
      <button class="btn-gold" style="font-size:13px;padding:8px 18px"
        onclick="openMeta('actor')">＋ Add Actor</button>
    </div>
    <div class="tbl-wrap">
      <table class="adm-tbl">
        <thead><tr><th>Name</th><th>Birth Year</th><th>Nationality</th><th>Actions</th></tr></thead>
        <tbody>
          ${S.actors.map(a => `
          <tr>
            <td><strong>${a.actor_name}</strong></td>
            <td>${a.birth_year || '—'}</td>
            <td>${a.nationality || '—'}</td>
            <td>
              <button class="tb-btn edit"
                onclick="openMeta('actor',${a.actor_id},'${a.actor_name.replace(/'/g,"\\'")}','${(a.nationality||'').replace(/'/g,"\\'")}',${a.birth_year||0})">
                Edit
              </button>
              <button class="tb-btn del" onclick="admDelActor(${a.actor_id})">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Users Tab ────────────────────────────────────────────── */
async function renderAdmUsers(el) {
  const d = await api('/admin/users');
  el.innerHTML = `
    <div class="adm-tb">
      <span style="color:var(--text2);font-size:13px">${d.users.length} users total</span>
    </div>
    <div class="tbl-wrap">
      <table class="adm-tbl">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          ${d.users.map(u => `
          <tr>
            <td><strong>${u.user_name}</strong></td>
            <td>${u.email}</td>
            <td><span class="role-b ${u.role}">${u.role}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>
              <button class="tb-btn edit"
                onclick="admToggleRole(${u.user_id},'${u.role==='admin'?'user':'admin'}')">
                ${u.role === 'admin' ? 'Demote' : 'Make Admin'}
              </button>
              <button class="tb-btn del" onclick="admDelUser(${u.user_id})">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Movie Form Modal ─────────────────────────────────────── */
function openAddMF() {
  S.editMFid = null;
  document.getElementById('mf-heading').textContent = 'Add New Movie';
  document.getElementById('mf-id').value = '';
  ['mf-ttl','mf-yr','mf-dur','mf-lang','mf-poster'].forEach(id =>
    document.getElementById(id).value = ''
  );
  document.getElementById('mf-desc').value = '';
  document.getElementById('mf-err').textContent  = '';
  populateMFSelects();
  openModal('mf');
}

async function openEditMF(id) {
  S.editMFid = id;
  document.getElementById('mf-heading').textContent = 'Edit Movie';
  document.getElementById('mf-err').textContent = '';
  try {
    const m = await api('/movies/' + id);
    document.getElementById('mf-id').value     = id;
    document.getElementById('mf-ttl').value    = m.title;
    document.getElementById('mf-yr').value     = m.release_year || '';
    document.getElementById('mf-dur').value    = m.duration_min || '';
    document.getElementById('mf-lang').value   = m.language || '';
    document.getElementById('mf-poster').value = m.poster_url || '';
    document.getElementById('mf-desc').value   = m.description || '';
    populateMFSelects(m.genre_id, m.director_id);
    openModal('mf');
  } catch(e) { toast(e.message, 'err'); }
}

function populateMFSelects(gid = null, did = null) {
  document.getElementById('mf-genre').innerHTML =
    '<option value="">Select Genre</option>' +
    S.genres.map(g =>
      `<option value="${g.genre_id}" ${g.genre_id == gid ? 'selected' : ''}>${g.genre_name}</option>`
    ).join('');

  document.getElementById('mf-dir').innerHTML =
    '<option value="">Select Director</option>' +
    S.directors.map(d =>
      `<option value="${d.director_id}" ${d.director_id == did ? 'selected' : ''}>${d.director_name}</option>`
    ).join('');
}

async function submitMF() {
  const id   = document.getElementById('mf-id').value;
  const body = {
    title:        document.getElementById('mf-ttl').value,
    release_year: parseInt(document.getElementById('mf-yr').value)    || null,
    genre_id:     document.getElementById('mf-genre').value            || null,
    director_id:  document.getElementById('mf-dir').value             || null,
    description:  document.getElementById('mf-desc').value,
    poster_url:   document.getElementById('mf-poster').value,
    duration_min: parseInt(document.getElementById('mf-dur').value)   || null,
    language:     document.getElementById('mf-lang').value,
  };
  document.getElementById('mf-err').textContent = '';
  try {
    if (id) {
      await api('/movies/' + id, { method: 'PUT', body: JSON.stringify(body) });
      toast('Movie updated!', 'ok');
    } else {
      await api('/movies', { method: 'POST', body: JSON.stringify(body) });
      toast('Movie added!', 'ok');
    }
    closeModal('mf');
    await loadMeta();
    loadAdmTab(S.adminTab);
  } catch(e) { document.getElementById('mf-err').textContent = e.message; }
}

async function admDelMov(id) {
  if (!confirm('Delete this movie permanently?')) return;
  await api('/movies/' + id, { method: 'DELETE' });
  toast('Movie deleted.', 'inf');
  loadAdmTab('movies');
}

async function admDelMovFromDetail(id) {
  if (!confirm('Delete this movie permanently?')) return;
  try {
    await api('/movies/' + id, { method: 'DELETE' });
    toast('Movie deleted.', 'inf');
    go('movies');
  } catch(e) { toast(e.message, 'err'); }
}

/* ── Genre Actions ────────────────────────────────────────── */
async function admAddGenre() {
  const n = document.getElementById('ng-inp')?.value?.trim();
  if (!n) return;
  try {
    await api('/genres', { method: 'POST', body: JSON.stringify({ genre_name: n }) });
    await loadMeta();
    loadAdmTab('genres');
    toast('Genre added!', 'ok');
  } catch(e) { toast(e.message, 'err'); }
}

async function admDelGenre(id) {
  if (!confirm('Delete this genre?')) return;
  await api('/genres/' + id, { method: 'DELETE' });
  await loadMeta();
  loadAdmTab('genres');
  toast('Deleted.', 'inf');
}

/* ── Director / Actor Meta Modal ──────────────────────────── */
function openMeta(type, id = null, name = '', nat = '', year = 0) {
  S.metaType = type; S.metaId = id;
  const cap = type === 'director' ? 'Director' : 'Actor';
  document.getElementById('meta-heading').textContent = (id ? 'Edit ' : 'Add ') + cap;
  document.getElementById('meta-err').textContent = '';

  if (type === 'director') {
    document.getElementById('meta-body').innerHTML = `
      <div class="fg"><label>Name *</label><input class="finput" id="mt-name" value="${name}"/></div>
      <div class="fg"><label>Nationality</label><input class="finput" id="mt-nat" value="${nat}"/></div>
      <div class="fg"><label>Bio</label>
        <textarea class="rv-textarea" id="mt-bio" style="min-height:70px"></textarea>
      </div>`;
  } else {
    document.getElementById('meta-body').innerHTML = `
      <div class="fg"><label>Name *</label><input class="finput" id="mt-name" value="${name}"/></div>
      <div class="fg"><label>Birth Year</label>
        <input class="finput" id="mt-year" type="number" value="${year || ''}"/>
      </div>
      <div class="fg"><label>Nationality</label><input class="finput" id="mt-nat" value="${nat}"/></div>`;
  }
  openModal('meta');
}

async function submitMeta() {
  const name = document.getElementById('mt-name')?.value?.trim();
  if (!name) { document.getElementById('meta-err').textContent = 'Name is required'; return; }
  document.getElementById('meta-err').textContent = '';
  try {
    if (S.metaType === 'director') {
      const body = {
        director_name: name,
        nationality:   document.getElementById('mt-nat')?.value || '',
        bio:           document.getElementById('mt-bio')?.value || '',
      };
      if (S.metaId) await api('/directors/' + S.metaId, { method:'PUT',  body: JSON.stringify(body) });
      else          await api('/directors',              { method:'POST', body: JSON.stringify(body) });
    } else {
      const body = {
        actor_name:  name,
        birth_year:  parseInt(document.getElementById('mt-year')?.value) || null,
        nationality: document.getElementById('mt-nat')?.value || '',
      };
      if (S.metaId) await api('/actors/' + S.metaId, { method:'PUT',  body: JSON.stringify(body) });
      else          await api('/actors',              { method:'POST', body: JSON.stringify(body) });
    }
    closeModal('meta');
    await loadMeta();
    loadAdmTab(S.metaType === 'director' ? 'directors' : 'actors');
    toast('Saved!', 'ok');
  } catch(e) { document.getElementById('meta-err').textContent = e.message; }
}

async function admDelDir(id) {
  if (!confirm('Delete director?')) return;
  await api('/directors/' + id, { method: 'DELETE' });
  await loadMeta(); loadAdmTab('directors'); toast('Deleted.', 'inf');
}

async function admDelActor(id) {
  if (!confirm('Delete actor?')) return;
  await api('/actors/' + id, { method: 'DELETE' });
  await loadMeta(); loadAdmTab('actors'); toast('Deleted.', 'inf');
}

/* ── User Actions ─────────────────────────────────────────── */
async function admDelUser(id) {
  if (!confirm('Delete this user permanently?')) return;
  try {
    await api('/admin/users/' + id, { method: 'DELETE' });
    loadAdmTab('users');
    toast('User deleted.', 'inf');
  } catch(e) { toast(e.message, 'err'); }
}

async function admToggleRole(id, role) {
  await api('/admin/users/' + id + '/role', {
    method: 'PUT', body: JSON.stringify({ role }),
  });
  loadAdmTab('users');
  toast('Role updated to ' + role + '.', 'ok');
}
