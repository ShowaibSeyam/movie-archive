/* ============================================================
   Movie Archive – profile.js
   ============================================================ */

function initProfile() {
  if (!S.user) { openModal('login'); go('home'); return; }
  const u = S.user;
  document.getElementById('prof-root').innerHTML = `
    <div class="prof-head">
      <div class="prof-ava">${u.user_name.slice(0,2).toUpperCase()}</div>
      <div>
        <div class="prof-name">${u.user_name}</div>
        <div class="prof-email">${u.email}</div>
        ${u.role==='admin'
          ? `<span class="g-chip" style="background:var(--gold);color:#0A0A0F;margin-top:6px;display:inline-block">Admin</span>`
          : ''}
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-title">Edit Profile</div>
      <div class="fgrid">
        <div class="fg">
          <label>Display Name</label>
          <input class="finput" id="p-name" value="${u.user_name}"/>
        </div>
        <div class="fg">
          <label>Avatar URL (optional)</label>
          <input class="finput" id="p-avatar" value="${u.avatar_url||''}" placeholder="https://…"/>
        </div>
      </div>
      <button class="btn-gold" style="font-size:14px;padding:10px 22px" onclick="saveProfile()">
        Save Changes
      </button>
    </div>

    <div class="card-box">
      <div class="card-box-title">Change Password</div>
      <div class="fg">
        <label>Current Password</label>
        <input class="finput" type="password" id="p-cur"/>
      </div>
      <div class="fg">
        <label>New Password</label>
        <input class="finput" type="password" id="p-new" placeholder="Min 8 chars, 1 uppercase, 1 number"/>
      </div>
      <button class="btn-gold" style="font-size:14px;padding:10px 22px" onclick="savePassword()">
        Update Password
      </button>
    </div>`;
}

async function saveProfile() {
  try {
    await api('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        user_name:  document.getElementById('p-name').value,
        avatar_url: document.getElementById('p-avatar').value || null,
      }),
    });
    S.user.user_name = document.getElementById('p-name').value;
    renderAuth();
    toast('Profile updated!', 'ok');
  } catch(e) { toast(e.message, 'err'); }
}

async function savePassword() {
  try {
    await api('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: document.getElementById('p-cur').value,
        new_password:     document.getElementById('p-new').value,
      }),
    });
    toast('Password changed!', 'ok');
    document.getElementById('p-cur').value = '';
    document.getElementById('p-new').value = '';
  } catch(e) { toast(e.message, 'err'); }
}
