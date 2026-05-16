document.addEventListener('DOMContentLoaded', async () => {
  await loadTopCampaigns();
  await loadAnimalCampaigns();
});

async function loadTopCampaigns() {
  const container = document.getElementById('topCampaigns');
  try {
    const campaigns = await Api.getCampaigns();
    const top = campaigns.slice(0, 6);
    if (!top.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div class="empty-title">No campaigns yet</div><p class="empty-desc">Be the first to <a href="/create-campaign.html" style="color:var(--color-secondary)">create a campaign</a>.</p></div>`;
      return;
    }
    container.innerHTML = top.map(buildCampaignCard).join('');

    // Update stats
    document.getElementById('statCampaigns').textContent = campaigns.filter(c => c.status === 'active').length;
    const raised = campaigns.reduce((s, c) => s + parseFloat(c.current_amount || 0), 0);
    document.getElementById('statRaised').textContent = formatCurrency(raised).replace('JD ', '');
    document.getElementById('statDonors').textContent = '—';
  } catch {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><div class="empty-title">Could not load campaigns</div><div class="empty-desc">Please ensure the server is running.</div></div>`;
  }
}

async function loadAnimalCampaigns() {
  const container = document.getElementById('animalCampaigns');
  try {
    const campaigns = await Api.getCampaigns('category=animal');
    const top = campaigns.slice(0, 3);
    if (!top.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🐾</div><div class="empty-title">No animal campaigns yet</div></div>`;
      return;
    }
    container.innerHTML = top.map(buildCampaignCard).join('');
  } catch {
    container.innerHTML = '';
  }
}
