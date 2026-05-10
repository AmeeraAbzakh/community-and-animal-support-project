document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) { window.location.href = '/dashboard.html'; return; }

  const form      = document.getElementById('signupForm');
  const alertEl   = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type} show`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.classList.remove('show');

    const full_name        = document.getElementById('full_name').value.trim();
    const email            = document.getElementById('email').value.trim();
    const password         = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    let valid = true;

    const setErr = (id, errId, cond) => {
      document.getElementById(errId).classList.toggle('show', cond);
      document.getElementById(id).classList.toggle('error', cond);
      if (cond) valid = false;
    };

    setErr('full_name', 'nameErr',    !full_name);
    setErr('email',     'emailErr',   !email || !/\S+@\S+\.\S+/.test(email));
    setErr('password',  'passwordErr', password.length < 8);
    setErr('confirm_password', 'confirmErr', password !== confirm_password);

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const data = await Api.register({ full_name, email, password, role: 'user' });
      storeAuth(data.token, data.user);
      showAlert('Account created! Redirecting...', 'success');
      setTimeout(() => window.location.href = '/dashboard.html', 900);
    } catch (err) {
      showAlert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
});