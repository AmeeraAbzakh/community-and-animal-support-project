/* global API client */
const API_BASE = '/api';

const Api = {
  getToken() {
    return localStorage.getItem('token');
  },

  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async request(method, path, body) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },

  get(path)        { return this.request('GET',    path); },
  post(path, body) { return this.request('POST',   path, body); },
  put(path, body)  { return this.request('PUT',    path, body); },
  del(path)        { return this.request('DELETE', path); },

  /* Auth */
  register(data) { return this.post('/auth/register', data); },
  login(data)    { return this.post('/auth/login',    data); },

  /* Campaigns */
  getCampaigns(params = '') { return this.get('/campaigns' + (params ? '?' + params : '')); },
  getCampaign(id)           { return this.get(`/campaigns/${id}`); },
  getMyCampaigns()          { return this.get('/campaigns/user/mine'); },
  createCampaign(data)      { return this.post('/campaigns', data); },

  /* Donations */
  donate(data)              { return this.post('/donations', data); },
  getCampaignDonations(id)  { return this.get(`/donations/${id}`); },
  getMyDonations()          { return this.get('/donations/user/mine'); },
};

/* Toast helper */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* Format helpers */
function formatCurrency(amount) {
  return 'JD ' + parseFloat(amount || 0).toLocaleString('en-JO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function progressPercent(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

const CATEGORY_IMGS = {
  human:  'https://images.pexels.com/photos/6994982/pexels-photo-6994982.jpeg?auto=compress&cs=tinysrgb&w=600',
  animal: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=600',
};

function campaignImg(campaign) {
  return CATEGORY_IMGS[campaign.category] || CATEGORY_IMGS.human;
}

function buildCampaignCard(c) {
  const pct = progressPercent(c.current_amount, c.goal_amount);
  return `
    <a href="/campaign-details.html?id=${c.id}" class="card campaign-card" style="text-decoration:none;display:flex;flex-direction:column">
      <div class="campaign-card-img">
        <img src="${campaignImg(c)}" alt="${c.title}" loading="lazy" />
      </div>
      <div class="campaign-card-body">
        <div class="campaign-card-meta">
          <span class="badge badge-${c.category}">${c.category === 'human' ? '👤 Human' : '🐾 Animal'}</span>
          <span class="badge badge-${c.urgency}">${c.urgency}</span>
          <span class="priority-chip">⭐ ${c.priority_score}</span>
        </div>
        <div class="campaign-title">${c.title}</div>
        <div class="campaign-desc">${c.description}</div>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>${formatCurrency(c.current_amount)}</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div style="font-size:.8rem;color:var(--color-text-muted)">Goal: ${formatCurrency(c.goal_amount)}</div>
      </div>
    </a>`;
}