/* ============================================================
   Movie Archive – detail.js
   Movie Detail Page · Cast · Reviews · Star Rating
   ============================================================ */

/* ── Load & Render Detail ─────────────────────────────────── */
async function initDetail(mid) {
  document.getElementById('detail-root').innerHTML =
    '<div class="loader" style="min-height:60vh"><div class="spinner"></div></div>';
  try {
    const m = await api('/movies/' + mid);
    renderDetail(m);
  } catch(e) {
    document.getElementById('detail-root').innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">${e.message}</div>
      </div>`;
  }
}

function renderDetail(m) {
  const userRv = m.reviews.find(r => S.user && r.user_id === S.user.user_id);
  const inWL   = S.watchlist.includes(m.movie_id);
  const isAdm  = S.user && S.user.role === 'admin';

  document.getElementById('detail-root').innerHTML = `
    <!-- ── Hero ── -->
    <div class="detail-hero">
      <div class="detail-bg">
        ${m.poster_url ? `<img class="detail-bg-img" src="${m.poster_url}" alt=""/>` : ''}
      </div>
      <div class="detail-inner">
        <div class="detail-poster">
          ${m.poster_url
            ? `<img src="${m.poster_url}" alt="${m.title}" style="width:100%">`
            : `<div class="poster-ph" style="min-height:345px">
                 <span class="poster-ph-icon">🎬</span>
                 <span class="poster-ph-title">${m.title}</span>
               </div>`}
        </div>
        <div class="detail-info">
          <div class="d-eyebrow">${m.genre_name || ''} ${m.genre_name && m.release_year ? '·' : ''} ${m.release_year || ''}</div>
          <h1 class="d-title">${m.title}</h1>
          <div class="d-pills">
            <div class="d-rating-box">
              <div>
                <div class="d-rating-num">⭐ ${(+m.rating || 0).toFixed(1)}</div>
                <div class="d-rating-sub">/ 10 · ${m.reviews.length} review${m.reviews.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            ${m.duration_min ? `<span class="d-pill">⏱ ${m.duration_min} min</span>` : ''}
            ${m.language     ? `<span class="d-pill">🗣 ${m.language}</span>`         : ''}
            ${m.director_name? `<span class="d-pill">🎬 ${m.director_name}</span>`    : ''}
          </div>
          ${m.description ? `<p class="d-desc">${m.description}</p>` : ''}
          <div class="d-actions">
            <button class="btn-gold"
              onclick="requireAuth(()=>document.getElementById('rv-section').scrollIntoView({behavior:'smooth'}))">
              ✍️ Write Review
            </button>
            <button class="btn-outline" id="d-wl-btn"
              onclick="toggleWLDetail(${m.movie_id},this)">
              ${inWL ? '✓ In Watchlist' : '＋ Watchlist'}
            </button>
            ${isAdm ? `
            <button class="btn-outline" style="font-size:13px;padding:10px 18px"
              onclick="openEditMF(${m.movie_id})">✏️ Edit</button>
            <button class="btn-outline"
              style="border-color:var(--red-b);color:var(--red-b);font-size:13px;padding:10px 18px"
              onclick="admDelMovFromDetail(${m.movie_id})">🗑 Delete</button>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="detail-body">

      ${m.cast.length ? `
      <div class="sub-sec">
        <div class="sub-sec-title">Cast</div>
        <div class="cast-flex">
          ${m.cast.map(a => `
          <div class="cast-chip">
            <div class="cast-chip-name">${a.actor_name}</div>
            <div class="cast-chip-role">${a.role_name || 'Actor'}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      ${m.director_name ? `
      <div class="sub-sec">
        <div class="sub-sec-title">Director</div>
        <div class="cast-chip" style="max-width:300px">
          <div class="cast-chip-name">${m.director_name}</div>
          <div class="cast-chip-role">${m.director_nationality || ''}</div>
          ${m.director_bio ? `<div style="font-size:12px;color:var(--text3);margin-top:8px;line-height:1.55">${m.director_bio}</div>` : ''}
        </div>
      </div>` : ''}

      <!-- ── Reviews ── -->
      <div class="sub-sec" id="rv-section">
        <div class="sub-sec-title">Reviews (${m.reviews.length})</div>

        ${S.user && !userRv ? `
        <div class="rv-form-card">
          <div class="rv-form-title">Share your thoughts</div>
          <div class="star-row" id="star-row">
            ${[1,2,3,4,5,6,7,8,9,10].map(i =>
              `<span onclick="setStar(${i})" onmouseover="hoverStar(${i})" onmouseout="unhoverStar()">★</span>`
            ).join('')}
          </div>
          <div class="rating-hint" id="rating-hint">Click to rate (1–10)</div>
          <textarea class="rv-textarea" id="rv-text" placeholder="What did you think?"></textarea>
          <button class="rv-submit" onclick="submitReview(${m.movie_id})">Post Review</button>
        </div>` : ''}

        ${S.user && userRv ? `
        <div style="padding:14px 18px;background:var(--bg3);border-radius:10px;margin-bottom:20px;font-size:14px;color:var(--text2)">
          ✅ You've already reviewed this movie. Edit or delete it below.
        </div>` : ''}

        ${!S.user ? `
        <div class="rv-form-card" style="text-align:center;padding:36px">
          <div style="font-size:15px;margin-bottom:14px;color:var(--text2)">Sign in to leave a review</div>
          <button class="btn-gold" onclick="openModal('login')">Sign In</button>
        </div>` : ''}

        ${m.reviews.length === 0
          ? `<div class="empty"><div class="empty-icon">📝</div><div class="empty-title">No reviews yet — be the first!</div></div>`
          : ''}

        <div id="rv-list">
          ${m.reviews.map(rvCard).join('')}
        </div>
      </div>
    </div>`;

  S.starRating = 0;
  updateStars(0);
}

async function toggleWLDetail(mid, btn) {
  await toggleWL(mid, null);
  btn.textContent = S.watchlist.includes(mid) ? '✓ In Watchlist' : '＋ Watchlist';
}

/* ── Star Rating ──────────────────────────────────────────── */
function setStar(n)      { S.starRating = n; document.getElementById('rating-hint').textContent = 'Rating: ' + n + '/10'; updateStars(n); }
function hoverStar(n)    { updateStars(n); }
function unhoverStar()   { updateStars(S.starRating); }
function updateStars(n)  {
  document.querySelectorAll('#star-row span').forEach((s, i) => s.classList.toggle('lit', i < n));
}

/* ── Review Card ──────────────────────────────────────────── */
function rvCard(r) {
  const isOwn = S.user && r.user_id === S.user.user_id;
  const isAdm = S.user && S.user.role === 'admin';
  const date  = new Date(r.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const safeT = (r.review_text || '').replace(/`/g, "'");

  return `
  <div class="rv-card" id="rv-${r.review_id}">
    <div class="rv-head">
      <div class="rv-avatar">${r.user_name.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="rv-user">${r.user_name}</div>
        <div class="rv-date">${date}</div>
      </div>
      <div class="rv-badge">⭐ ${r.rating}/10</div>
    </div>
    <div class="rv-text">${r.review_text || '<em style="color:var(--text3)">No comment.</em>'}</div>

    ${isOwn || isAdm ? `
    <div class="rv-actions">
      ${isOwn ? `<button class="rv-act" onclick="openEF(${r.review_id},${r.rating})">✏️ Edit</button>` : ''}
      <button class="rv-act del" onclick="deleteRv(${r.review_id})">🗑 Delete</button>
    </div>
    <!-- Inline edit form -->
    <div class="rv-ef" id="ef-${r.review_id}">
      <div class="star-row" id="ef-stars-${r.review_id}">
        ${[1,2,3,4,5,6,7,8,9,10].map(i =>
          `<span class="${i <= r.rating ? 'lit' : ''}"
            onclick="setEF(${r.review_id},${i})"
            onmouseover="hoverEF(${r.review_id},${i})"
            onmouseout="unhoverEF(${r.review_id})">★</span>`
        ).join('')}
      </div>
      <div class="rating-hint" id="ef-hint-${r.review_id}">Rating: ${r.rating}/10</div>
      <textarea class="rv-textarea" id="ef-txt-${r.review_id}" style="min-height:80px">${safeT}</textarea>
      <div style="display:flex;gap:10px;margin-top:10px">
        <button class="rv-submit" onclick="submitEF(${r.review_id})">Save</button>
        <button class="btn-outline" style="padding:8px 16px;font-size:13px"
          onclick="closeEF(${r.review_id})">Cancel</button>
      </div>
    </div>` : ''}
  </div>`;
}

/* Inline edit helpers */
function openEF(rid, rating) {
  window['_efR_' + rid] = rating;
  document.getElementById('ef-' + rid).classList.toggle('open');
  updateEFStars(rid, rating);
}
function closeEF(rid)  { document.getElementById('ef-' + rid).classList.remove('open'); }
function setEF(rid, n) {
  window['_efR_' + rid] = n;
  document.getElementById('ef-hint-' + rid).textContent = 'Rating: ' + n + '/10';
  updateEFStars(rid, n);
}
function hoverEF(rid, n)  { updateEFStars(rid, n); }
function unhoverEF(rid)   { updateEFStars(rid, window['_efR_' + rid] || 0); }
function updateEFStars(rid, n) {
  document.querySelectorAll('#ef-stars-' + rid + ' span')
    .forEach((s, i) => s.classList.toggle('lit', i < n));
}

/* ── Review CRUD ──────────────────────────────────────────── */
async function submitReview(mid) {
  if (!S.starRating) { toast('Please select a rating (1–10)', 'err'); return; }
  const rv = document.getElementById('rv-text').value;
  try {
    await api('/movies/' + mid + '/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: S.starRating, review_text: rv }),
    });
    toast('Review posted!', 'ok');
    initDetail(mid);
  } catch(e) { toast(e.message, 'err'); }
}

async function submitEF(rid) {
  const rating = window['_efR_' + rid] || 0;
  const rv     = document.getElementById('ef-txt-' + rid).value;
  if (!rating) { toast('Please select a rating', 'err'); return; }
  try {
    await api('/reviews/' + rid, { method:'PUT', body: JSON.stringify({ rating, review_text: rv }) });
    toast('Review updated!', 'ok');
    initDetail(S.curMovId);
  } catch(e) { toast(e.message, 'err'); }
}

async function deleteRv(rid) {
  if (!confirm('Delete this review?')) return;
  try {
    await api('/reviews/' + rid, { method: 'DELETE' });
    document.getElementById('rv-' + rid)?.remove();
    toast('Review deleted.', 'inf');
  } catch(e) { toast(e.message, 'err'); }
}
