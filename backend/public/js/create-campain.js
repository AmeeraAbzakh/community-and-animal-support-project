/* Priority score constants (mirrors the backend) */
const HEALTH_SCORES  = { critical: 50, serious: 35, moderate: 20 };
const INCOME_SCORES  = { very_low: 30, low: 20, medium: 10 };
const URGENCY_SCORES = { critical: 25, high: 15, medium: 8, low: 3 };

function calcPreviewScore() {
  let score = 0;
  const health    = document.getElementById('health_condition').value;
  const income    = document.getElementById('income_level').value;
  const urgency   = document.getElementById('urgency').value;
  const family    = parseInt(document.getElementById('family_size').value) || 0;
  const category  = document.getElementById('category').value;

  score += HEALTH_SCORES[health]  || 0;
  score += INCOME_SCORES[income]  || 0;
  score += URGENCY_SCORES[urgency] || 0;
  score += family > 5 ? 20 : family >= 3 ? 10 : family > 0 ? 5 : 0;
  if (category === 'animal') score += 10;

  document.getElementById('priorityPreview').textContent = score;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    showToast('Please login to create a campaign.', 'error');
    setTimeout(() => window.location.href = '/login.html', 1200);
    return;
  }

  document.querySelectorAll('.score-field, #category').forEach(el => {
    el.addEventListener('change', calcPreviewScore);
    el.addEventListener('input', calcPreviewScore);
  });

  const form      = document.getElementById('campaignForm');
  const alertEl   = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type} show`;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const required = [
    ['title',           'titleErr',    v => v.length > 0],
    ['description',     'descErr',     v => v.length > 0],
    ['category',        'categoryErr', v => v !== ''],
    ['location',        'locationErr', v => v.length > 0],
    ['urgency',         'urgencyErr',  v => v !== ''],
    ['health_condition','healthErr',   v => v !== ''],
    ['income_level',    'incomeErr',   v => v !== ''],
    ['family_size',     'familyErr',   v => parseInt(v) >= 1],
    ['goal_amount',     'goalErr',     v => parseFloat(v) >= 10],
  ];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.classList.remove('show');

    let valid = true;
    const payload = {};

    required.forEach(([id, errId, validate]) => {
      const val = document.getElementById(id).value.trim();
      const ok  = validate(val);
      document.getElementById(errId).classList.toggle('show', !ok);
      document.getElementById(id).classList.toggle('error', !ok);
      if (!ok) valid = false;
      else payload[id] = val;
    });

    if (!valid) { showAlert('Please fix the errors above.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const campaign = await Api.createCampaign(payload);
      showAlert('Campaign created successfully!', 'success');
      showToast('Campaign submitted!', 'success');
      setTimeout(() => window.location.href = `/campaign-details.html?id=${campaign.id}`, 1200);
    } catch (err) {
      showAlert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Submit Campaign';
    }
  });
});