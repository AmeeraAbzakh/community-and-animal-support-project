document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) { window.location.href = '/dashboard.html'; return; }

  const form    = document.getElementById('loginForm');
  const alertEl = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type} show`;
  }
  function hideAlert() { alertEl.classList.remove('show'); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    let valid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('emailErr').classList.add('show');
      document.getElementById('email').classList.add('error');
      valid = false;
    } else {
      document.getElementById('emailErr').classList.remove('show');
      document.getElementById('email').classList.remove('error');
    }

    if (!password) {
      document.getElementById('passwordErr').classList.add('show');
      document.getElementById('password').classList.add('error');
      valid = false;
    } else {
      document.getElementById('passwordErr').classList.remove('show');
      document.getElementById('password').classList.remove('error');
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const data = await Api.login({ email, password });
      storeAuth(data.token, data.user);
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = '/dashboard.html', 800);
    } catch (err) {
      showAlert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
});