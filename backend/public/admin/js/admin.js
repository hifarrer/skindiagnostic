/* ================================================================
   SkinDiagnostics.ai — Admin Dashboard SPA
   ================================================================ */

(function () {
  'use strict';

  const API = '/api/admin';

  // ── State ──────────────────────────────────────────────────────
  let token = localStorage.getItem('admin_token');
  let currentView = 'dashboard';
  let charts = {};

  // ── DOM refs ───────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const loginOverlay = $('#login-overlay');
  const appShell = $('#app-shell');
  const viewContainer = $('#view-container');
  const pageTitle = $('#page-title');
  const adminName = $('#admin-name');
  const modalBackdrop = $('#modal-backdrop');
  const modal = $('#modal');
  const modalTitle = $('#modal-title');
  const modalBody = $('#modal-body');

  // ── Toast ──────────────────────────────────────────────────────
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
  }

  // ── API helper ─────────────────────────────────────────────────
  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ── Auth ───────────────────────────────────────────────────────
  function showLogin() {
    loginOverlay.classList.remove('hidden');
    appShell.classList.add('hidden');
  }

  function showApp() {
    loginOverlay.classList.add('hidden');
    appShell.classList.remove('hidden');
    route();
  }

  function logout() {
    token = null;
    localStorage.removeItem('admin_token');
    showLogin();
  }

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('#login-error');
    const btn = $('#login-btn');
    const username = $('#login-username').value.trim();
    const password = $('#login-password').value;
    errEl.textContent = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      token = data.token;
      localStorage.setItem('admin_token', token);
      adminName.textContent = data.admin.username;
      showApp();
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  $('#logout-btn').addEventListener('click', logout);

  // ── Modal ──────────────────────────────────────────────────────
  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
  }
  function closeModal() {
    modal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
  }
  $('#modal-close').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // ── Mobile sidebar ─────────────────────────────────────────────
  const sidebar = $('.sidebar');
  $('#mobile-menu-btn').addEventListener('click', () => sidebar.classList.toggle('open'));

  // ── Router ─────────────────────────────────────────────────────
  const views = { dashboard: renderDashboard, users: renderUsers, plans: renderPlans, settings: renderSettings };
  const titles = { dashboard: 'Dashboard', users: 'Users', plans: 'Subscription Plans', settings: 'Settings' };

  function route() {
    const hash = location.hash.replace('#', '') || 'dashboard';
    if (!views[hash]) { location.hash = '#dashboard'; return; }
    currentView = hash;
    pageTitle.textContent = titles[hash];

    document.querySelectorAll('.nav-item[data-view]').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === hash);
    });
    sidebar.classList.remove('open');

    destroyCharts();
    views[hash]();
  }
  window.addEventListener('hashchange', route);

  function destroyCharts() {
    Object.values(charts).forEach((c) => c.destroy());
    charts = {};
  }

  // ── Helpers ────────────────────────────────────────────────────
  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtMoney(n) {
    return '$' + Number(n).toFixed(2);
  }
  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s ?? '';
    return d.innerHTML;
  }

  // ================================================================
  //  DASHBOARD VIEW
  // ================================================================
  async function renderDashboard() {
    viewContainer.innerHTML = '<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';
    try {
      const [overview, usersOT, tasksOT, subStats] = await Promise.all([
        api('/stats/overview'),
        api('/stats/users-over-time?days=30&period=day'),
        api('/stats/tasks-over-time?days=30'),
        api('/stats/subscriptions'),
      ]);

      viewContainer.innerHTML = `
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div class="stat-label">Total Users</div>
            <div class="stat-value">${overview.totalUsers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div class="stat-label">Active Subscriptions</div>
            <div class="stat-value">${overview.activeSubscriptions}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="stat-label">Monthly Revenue</div>
            <div class="stat-value">${fmtMoney(overview.monthlyRevenue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-label">Total Tasks</div>
            <div class="stat-value">${overview.totalTasks}</div>
          </div>
        </div>

        <div class="chart-grid">
          <div class="chart-card">
            <h3>User Growth (30 days)</h3>
            <canvas id="chart-user-growth"></canvas>
          </div>
          <div class="chart-card">
            <h3>Task Activity (30 days)</h3>
            <canvas id="chart-tasks"></canvas>
          </div>
          <div class="chart-card">
            <h3>Subscription Distribution</h3>
            <canvas id="chart-subs"></canvas>
          </div>
        </div>
      `;

      // User growth chart
      const ugLabels = usersOT.data.map((r) => fmtDate(r.date));
      const ugData = usersOT.data.map((r) => parseInt(r.count, 10));
      charts.userGrowth = new Chart($('#chart-user-growth'), {
        type: 'line',
        data: {
          labels: ugLabels,
          datasets: [{
            label: 'New Users',
            data: ugData,
            borderColor: '#7B5CFF',
            backgroundColor: 'rgba(123,92,255,.1)',
            fill: true,
            tension: .4,
            pointRadius: 3,
            pointBackgroundColor: '#7B5CFF',
          }],
        },
        options: chartOpts(''),
      });

      // Tasks chart
      const taskTypes = [...new Set(tasksOT.data.map((r) => r.task_type))];
      const taskDates = [...new Set(tasksOT.data.map((r) => r.date))].sort();
      const taskColors = ['#FF5EA8', '#7B5CFF', '#5AD7FF', '#FF8A4C', '#34d399'];
      const taskDatasets = taskTypes.map((type, i) => ({
        label: type.replace(/_/g, ' '),
        data: taskDates.map((d) => {
          const found = tasksOT.data.find((r) => r.date === d && r.task_type === type);
          return found ? parseInt(found.count, 10) : 0;
        }),
        backgroundColor: taskColors[i % taskColors.length],
        borderRadius: 4,
      }));
      charts.tasks = new Chart($('#chart-tasks'), {
        type: 'bar',
        data: { labels: taskDates.map(fmtDate), datasets: taskDatasets },
        options: { ...chartOpts(''), plugins: { legend: { display: taskTypes.length > 1 } } },
      });

      // Subscription doughnut
      const subLabels = subStats.data.map((r) => r.name);
      const subData = subStats.data.map((r) => parseInt(r.count, 10));
      charts.subs = new Chart($('#chart-subs'), {
        type: 'doughnut',
        data: {
          labels: subLabels,
          datasets: [{ data: subData, backgroundColor: ['#7B5CFF', '#FF5EA8', '#5AD7FF', '#FF8A4C', '#34d399'] }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    } catch (err) {
      viewContainer.innerHTML = `<div class="loading-state" style="color:var(--red)">${escHtml(err.message)}</div>`;
    }
  }

  function chartOpts(yTitle) {
    return {
      responsive: true,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, title: { display: !!yTitle, text: yTitle }, grid: { color: '#f0f0f5' } },
      },
      plugins: { legend: { display: false } },
    };
  }

  // ================================================================
  //  USERS VIEW
  // ================================================================
  let usersPage = 1;
  let usersSearch = '';

  async function renderUsers() {
    viewContainer.innerHTML = `
      <div class="table-toolbar">
        <input class="search-input" id="user-search" placeholder="Search by email or name..." value="${escHtml(usersSearch)}" />
        <button class="btn-secondary btn-icon" id="user-search-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </button>
      </div>
      <div id="users-table-area"><div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div></div>
    `;

    $('#user-search-btn').addEventListener('click', () => {
      usersSearch = $('#user-search').value;
      usersPage = 1;
      loadUsersTable();
    });
    $('#user-search').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { usersSearch = e.target.value; usersPage = 1; loadUsersTable(); }
    });

    loadUsersTable();
  }

  async function loadUsersTable() {
    const area = $('#users-table-area');
    if (!area) return;
    area.innerHTML = '<div class="loading-state"><div class="spinner spinner-dark"></div></div>';
    try {
      const data = await api(`/users?page=${usersPage}&limit=15&search=${encodeURIComponent(usersSearch)}`);
      const totalPages = Math.ceil(data.total / data.limit) || 1;

      let rows = data.users.map((u) => `
        <tr>
          <td>${u.id}</td>
          <td>${escHtml(u.name) || '—'}</td>
          <td>${escHtml(u.email)}</td>
          <td>${escHtml(u.plan_name) || 'None'}</td>
          <td><span class="badge ${u.subscription_status === 'active' ? 'badge-active' : 'badge-inactive'}">${u.subscription_status}</span></td>
          <td>${fmtDate(u.created_at)}</td>
          <td>
            <button class="btn-secondary btn-sm" onclick="window.__editUser(${u.id})">Edit</button>
            <button class="btn-danger btn-sm" onclick="window.__deleteUser(${u.id}, '${escHtml(u.email)}')">Delete</button>
          </td>
        </tr>
      `).join('');

      if (!rows) rows = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px">No users found</td></tr>';

      area.innerHTML = `
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="pagination">
          <button id="users-prev" ${usersPage <= 1 ? 'disabled' : ''}>Prev</button>
          <span>Page ${usersPage} of ${totalPages}</span>
          <button id="users-next" ${usersPage >= totalPages ? 'disabled' : ''}>Next</button>
        </div>
      `;

      const prevBtn = $('#users-prev');
      const nextBtn = $('#users-next');
      if (prevBtn) prevBtn.addEventListener('click', () => { usersPage--; loadUsersTable(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { usersPage++; loadUsersTable(); });
    } catch (err) {
      area.innerHTML = `<div class="loading-state" style="color:var(--red)">${escHtml(err.message)}</div>`;
    }
  }

  window.__editUser = async (id) => {
    try {
      const { user } = await api(`/users/${id}`);
      const plans = (await api('/plans')).plans;
      const planOpts = plans.map((p) =>
        `<option value="${p.id}" ${user.subscription_plan_id == p.id ? 'selected' : ''}>${escHtml(p.name)} (${fmtMoney(p.price)})</option>`
      ).join('');

      openModal('Edit User', `
        <form id="edit-user-form">
          <div class="form-group">
            <label>Name</label>
            <input name="name" value="${escHtml(user.name) || ''}" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input name="email" type="email" value="${escHtml(user.email)}" required />
          </div>
          <div class="form-group">
            <label>Subscription Plan</label>
            <select name="subscription_plan_id">
              <option value="">None</option>
              ${planOpts}
            </select>
          </div>
          <div class="form-group">
            <label>Subscription Status</label>
            <select name="subscription_status">
              <option value="inactive" ${user.subscription_status === 'inactive' ? 'selected' : ''}>Inactive</option>
              <option value="active" ${user.subscription_status === 'active' ? 'selected' : ''}>Active</option>
            </select>
          </div>
          <div id="edit-user-error" class="form-error"></div>
          <button type="submit" class="btn-primary">Save Changes</button>
        </form>
      `);

      $('#edit-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const body = {};
        body.name = fd.get('name');
        body.email = fd.get('email');
        body.subscription_plan_id = fd.get('subscription_plan_id') ? parseInt(fd.get('subscription_plan_id'), 10) : null;
        body.subscription_status = fd.get('subscription_status');
        try {
          await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
          closeModal();
          toast('User updated', 'success');
          loadUsersTable();
        } catch (err) {
          $('#edit-user-error').textContent = err.message;
        }
      });
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  window.__deleteUser = async (id, email) => {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      toast('User deleted', 'success');
      loadUsersTable();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // ================================================================
  //  PLANS VIEW
  // ================================================================
  async function renderPlans() {
    viewContainer.innerHTML = '<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';
    try {
      const { plans } = await api('/plans');

      const cards = plans.map((p) => {
        const features = (Array.isArray(p.features) ? p.features : []).map((f) => `<li>${escHtml(String(f).replace(/_/g, ' '))}</li>`).join('');
        return `
          <div class="plan-card ${p.is_active ? '' : 'inactive'}">
            <span class="plan-status-badge badge ${p.is_active ? 'badge-active' : 'badge-inactive'}">${p.is_active ? 'Active' : 'Inactive'}</span>
            <div class="plan-name">${escHtml(p.name)}</div>
            <div class="plan-price">${fmtMoney(p.price)} <span>/mo</span></div>
            <div class="plan-desc">${escHtml(p.description)}</div>
            <ul class="plan-features">${features || '<li>No features listed</li>'}</ul>
            <div class="plan-actions">
              <button class="btn-secondary btn-sm" onclick="window.__editPlan(${p.id})">Edit</button>
              ${p.is_active ? `<button class="btn-danger btn-sm" onclick="window.__deactivatePlan(${p.id})">Deactivate</button>` : ''}
              <button class="btn-danger btn-sm" onclick="window.__deletePlanPermanent(${p.id}, '${escHtml(p.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </div>
        `;
      }).join('');

      viewContainer.innerHTML = `
        <div class="table-toolbar" style="margin-bottom:20px">
          <button class="btn-primary" style="width:auto;padding:10px 22px" id="create-plan-btn">+ New Plan</button>
        </div>
        <div class="plan-grid">${cards}</div>
      `;

      $('#create-plan-btn').addEventListener('click', () => openPlanModal());
    } catch (err) {
      viewContainer.innerHTML = `<div class="loading-state" style="color:var(--red)">${escHtml(err.message)}</div>`;
    }
  }

  function openPlanModal(plan = null) {
    const isEdit = !!plan;
    openModal(isEdit ? 'Edit Plan' : 'Create Plan', `
      <form id="plan-form">
        <div class="form-group">
          <label>Name</label>
          <input name="name" value="${escHtml(plan?.name ?? '')}" required />
        </div>
        <div class="form-group">
          <label>Price ($/mo)</label>
          <input name="price" type="number" step="0.01" min="0" value="${plan?.price ?? ''}" required />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description" rows="2">${escHtml(plan?.description ?? '')}</textarea>
        </div>
        <div class="form-group">
          <label>Features (comma-separated)</label>
          <input name="features" value="${escHtml((plan?.features || []).join(', '))}" />
        </div>
        <div class="form-group">
          <label>Stripe Price ID (optional)</label>
          <input name="stripe_price_id" value="${escHtml(plan?.stripe_price_id ?? '')}" />
        </div>
        <div class="form-group">
          <label>Active</label>
          <select name="is_active">
            <option value="true" ${plan?.is_active !== false ? 'selected' : ''}>Yes</option>
            <option value="false" ${plan?.is_active === false ? 'selected' : ''}>No</option>
          </select>
        </div>
        <div id="plan-form-error" class="form-error"></div>
        <button type="submit" class="btn-primary">${isEdit ? 'Save Changes' : 'Create Plan'}</button>
      </form>
    `);

    $('#plan-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        name: fd.get('name'),
        price: parseFloat(fd.get('price')),
        description: fd.get('description'),
        features: fd.get('features').split(',').map((s) => s.trim()).filter(Boolean),
        stripe_price_id: fd.get('stripe_price_id') || null,
        is_active: fd.get('is_active') === 'true',
      };
      try {
        if (isEdit) {
          await api(`/plans/${plan.id}`, { method: 'PUT', body: JSON.stringify(body) });
          toast('Plan updated', 'success');
        } else {
          await api('/plans', { method: 'POST', body: JSON.stringify(body) });
          toast('Plan created', 'success');
        }
        closeModal();
        renderPlans();
      } catch (err) {
        $('#plan-form-error').textContent = err.message;
      }
    });
  }

  window.__editPlan = async (id) => {
    try {
      const { plans } = await api('/plans');
      const plan = plans.find((p) => p.id === id);
      if (!plan) throw new Error('Plan not found');
      openPlanModal(plan);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  window.__deactivatePlan = async (id) => {
    if (!confirm('Deactivate this plan?')) return;
    try {
      await api(`/plans/${id}`, { method: 'DELETE' });
      toast('Plan deactivated', 'success');
      renderPlans();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  window.__deletePlanPermanent = async (id, name) => {
    if (!confirm(`Permanently delete plan "${name}"? Users on this plan will have their plan cleared. This cannot be undone.`)) return;
    try {
      await api(`/plans/${id}/permanent`, { method: 'DELETE' });
      toast('Plan deleted', 'success');
      renderPlans();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // ================================================================
  //  SETTINGS VIEW
  // ================================================================
  async function renderSettings() {
    viewContainer.innerHTML = '<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';
    try {
      const { settings } = await api('/settings');

      const settingsRows = settings.map((s, i) => `
        <div class="settings-row" data-idx="${i}">
          <input class="setting-key" value="${escHtml(s.key)}" placeholder="Key" />
          <input class="setting-val" value="${escHtml(typeof s.value === 'string' ? s.value : JSON.stringify(s.value))}" placeholder="Value" />
          <button class="btn-danger btn-sm setting-remove" title="Remove">✕</button>
        </div>
      `).join('');

      viewContainer.innerHTML = `
        <div class="settings-section">
          <h3>Site Settings</h3>
          <div id="settings-rows">${settingsRows}</div>
          <div style="display:flex;gap:10px;margin-top:14px">
            <button class="btn-secondary btn-sm" id="add-setting-btn">+ Add Setting</button>
            <button class="btn-primary" style="width:auto;padding:8px 22px" id="save-settings-btn">Save Settings</button>
          </div>
          <div id="settings-msg" class="form-success" style="margin-top:10px"></div>
        </div>

        <div class="settings-section">
          <h3>Change Admin Password</h3>
          <form id="password-form" class="password-form">
            <div class="form-group">
              <label>Current Password</label>
              <input name="currentPassword" type="password" required />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input name="newPassword" type="password" required minlength="6" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input name="confirmPassword" type="password" required minlength="6" />
            </div>
            <div id="pw-error" class="form-error"></div>
            <div id="pw-success" class="form-success"></div>
            <button type="submit" class="btn-primary" style="width:auto;padding:10px 28px">Update Password</button>
          </form>
        </div>
      `;

      // Add / Remove settings
      $('#add-setting-btn').addEventListener('click', () => {
        const container = $('#settings-rows');
        const div = document.createElement('div');
        div.className = 'settings-row';
        div.innerHTML = `
          <input class="setting-key" placeholder="Key" />
          <input class="setting-val" placeholder="Value" />
          <button class="btn-danger btn-sm setting-remove" title="Remove">✕</button>
        `;
        container.appendChild(div);
        bindRemoveButtons();
      });
      bindRemoveButtons();

      // Save settings
      $('#save-settings-btn').addEventListener('click', async () => {
        const rows = document.querySelectorAll('.settings-row');
        const payload = [];
        rows.forEach((r) => {
          const key = r.querySelector('.setting-key').value.trim();
          let val = r.querySelector('.setting-val').value.trim();
          if (!key) return;
          try { val = JSON.parse(val); } catch (_) { /* keep as string */ }
          payload.push({ key, value: val });
        });
        try {
          await api('/settings', { method: 'PUT', body: JSON.stringify({ settings: payload }) });
          $('#settings-msg').textContent = 'Settings saved!';
          toast('Settings saved', 'success');
          setTimeout(() => { const m = $('#settings-msg'); if (m) m.textContent = ''; }, 3000);
        } catch (err) {
          toast(err.message, 'error');
        }
      });

      // Password form
      $('#password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const errEl = $('#pw-error');
        const sucEl = $('#pw-success');
        errEl.textContent = '';
        sucEl.textContent = '';

        if (fd.get('newPassword') !== fd.get('confirmPassword')) {
          errEl.textContent = 'Passwords do not match';
          return;
        }

        try {
          await api('/password', {
            method: 'PUT',
            body: JSON.stringify({
              currentPassword: fd.get('currentPassword'),
              newPassword: fd.get('newPassword'),
            }),
          });
          sucEl.textContent = 'Password updated successfully!';
          e.target.reset();
          toast('Password updated', 'success');
        } catch (err) {
          errEl.textContent = err.message;
        }
      });
    } catch (err) {
      viewContainer.innerHTML = `<div class="loading-state" style="color:var(--red)">${escHtml(err.message)}</div>`;
    }
  }

  function bindRemoveButtons() {
    document.querySelectorAll('.setting-remove').forEach((btn) => {
      btn.onclick = () => btn.closest('.settings-row').remove();
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  async function init() {
    if (!token) { showLogin(); return; }
    try {
      const data = await api('/me');
      adminName.textContent = data.admin.username;
      showApp();
    } catch (_) {
      showLogin();
    }
  }

  init();
})();
