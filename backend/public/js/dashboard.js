document.addEventListener('DOMContentLoaded', async () => {
  const user = getStoredUser();
  if (!user) {
    document.getElementById('dashboardLayout').classList.add('hidden');
    document.getElementById('notLoggedIn').classList.remove('hidden');
    return;
  }

  // Populate sidebar
  document.getElementById('sidebarAvatar').textContent = user.full_name.charAt(0).toUpperCase();
  document.getElementById('sidebarName').textContent   = user.full_name;
  document.getElementById('sidebarRole').textContent   = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  document.getElementById('welcomeHeading').textContent = `Welcome back, ${user.full_name.split(' ')[0]}!`;

  // Tabs
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
      document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
      if (tab === 'campaigns') loadMyCampaigns();
      if (tab === 'donations') loadMyDonations();
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    window.location.href = '/home.html';
  });

  await loadOverview();
});

async function loadOverview() {
  try {
    const [campaigns, donations] = await Promise.all([
      Api.getMyCampaigns(),
      Api.getMyDonations(),
    ]);

    document.getElementById('statMyCampaigns').textContent  = campaigns.length;
    document.getElementById('statMyDonations').textContent  = donations.length;

    const totalDonated = donations.reduce((s, d) => s + parseFloat(d.amount || 0), 0);
    const totalRaised  = campaigns.reduce((s, c) => s + parseFloat(c.current_amount || 0), 0);
    document.getElementById('statTotalDonated').textContent = formatCurrency(totalDonated);
    document.getElementById('statTotalRaised').textContent  = formatCurrency(totalRaised);

    // Recent campaigns (up to 3)
    const recent = campaigns.slice(0, 3);
    const recentEl = document.getElementById('recentCampaigns');
    if (!recent.length) {
      recentEl.innerHTML = `
        <div class="empty-state" style="padding:40px 0">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No campaigns yet</div>
          <div class="empty-desc">Start by <a href="/create-campaign.html" style="color:var(--color-secondary)">creating your first campaign</a>.</div>
        </div>`;
      return;
    }
    recentEl.innerHTML = recent.map(c => buildDashCampaignRow(c)).join('');
  } catch (err) {
    document.getElementById('recentCampaigns').innerHTML = `<div class="alert alert-error show">${err.message}</div>`;
  }
}

async function loadMyCampaigns() {
  const el = document.getElementById('campaignsList');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const campaigns = await Api.getMyCampaigns();
    if (!campaigns.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No campaigns yet</div><a href="/create-campaign.html" class="btn btn-primary mt-16">Create Campaign</a></div>`;
      return;
    }
    el.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">${campaigns.map(c => buildDashCampaignRow(c)).join('')}</div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error show">${err.message}</div>`;
  }
}

async function loadMyDonations() {
  const el = document.getElementById('donationsList');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const donations = await Api.getMyDonations();
    if (!donations.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">💚</div><div class="empty-title">No donations yet</div><a href="/all-campaigns.html" class="btn btn-primary mt-16">Browse Campaigns</a></div>`;
      return;
    }
    el.innerHTML = `
      <div class="card">
        <div class="card-body" style="padding:0">
          <table style="width:100%;border-collapse:collapse;font-size:.9rem">
            <thead>
              <tr style="background:var(--color-cream);border-bottom:2px solid var(--color-border)">
                <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-primary-dark)">Campaign</th>
                <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-primary-dark)">Category</th>
                <th style="padding:12px 16px;text-align:right;font-weight:600;color:var(--color-primary-dark)">Amount</th>
                <th style="padding:12px 16px;text-align:right;font-weight:600;color:var(--color-primary-dark)">Date</th>
              </tr>
            </thead>
            <tbody>
              ${donations.map(d => `
                <tr style="border-bottom:1px solid var(--color-border)">
                  <td style="padding:12px 16px">
                    <a href="/campaign-details.html?id=${d.campaign?.id}" style="color:var(--color-secondary);font-weight:500">
                      ${d.campaign?.title || 'Unknown Campaign'}
                    </a>
                  </td>
                  <td style="padding:12px 16px">
                    <span class="badge badge-${d.campaign?.category || 'human'}">${d.campaign?.category === 'animal' ? '🐾 Animal' : '👤 Human'}</span>
                  </td>
                  <td style="padding:12px 16px;text-align:right;color:var(--color-accent);font-weight:600">${formatCurrency(d.amount)}</td>
                  <td style="padding:12px 16px;text-align:right;color:var(--color-text-muted)">${formatDate(d.created_at)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-error show">${err.message}</div>`;
  }
}

function buildDashCampaignRow(c) {
  const pct = progressPercent(c.current_amount, c.goal_amount);
  return `
    <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
          <a href="/campaign-details.html?id=${c.id}" style="font-weight:600;color:var(--color-primary-dark);font-size:.95rem">${c.title}</a>
          <span class="badge badge-${c.status}">${c.status}</span>
          <span class="badge badge-${c.category}">${c.category === 'animal' ? '🐾' : '👤'} ${c.category}</span>
        </div>
        <div class="progress-wrap" style="margin-bottom:4px">
          <div class="progress-bar-track" style="height:6px">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div style="font-size:.8rem;color:var(--color-text-muted)">${formatCurrency(c.current_amount)} raised of ${formatCurrency(c.goal_amount)} &nbsp;•&nbsp; ${pct}% &nbsp;•&nbsp; Score: ${c.priority_score}</div>
      </div>
      <a href="/campaign-details.html?id=${c.id}" class="btn btn-outline-dark btn-sm" style="white-space:nowrap">View</a>
    </div>`;
}