// handles both login and signup pages

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  const btn = document.getElementById('loginBtn');

  errorMsg.style.display = 'none';

  if (!email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);

      if (data.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (data.role === 'organization') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'all-campaigns.html';
      }
    } else {
      showError(data.message || 'Login failed.');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }

  } catch (err) {
    showError('Could not connect to server.');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleRegister() {
  const firstName = document.getElementById('firstName')?.value.trim() || '';
  const lastName = document.getElementById('lastName')?.value.trim() || '';
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone')?.value.trim() || '';
  const password = document.getElementById('pw').value;
  const pw2 = document.getElementById('pw2')?.value || password;
  const role = document.getElementById('role')?.value || 'user';
  const terms = document.getElementById('terms')?.checked ?? true;

  if (!firstName || !email || !password) {
    showError('Please fill in all required fields.');
    return;
  }

  if (password !== pw2) {
    showError('Passwords do not match.');
    return;
  }

  if (!terms) {
    showError('Please agree to the Terms of Service.');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: firstName + ' ' + lastName,
        email, phone, password, role
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Account created! Please login.');
      window.location.href = 'login.html';
    } else {
      showError(data.message || 'Registration failed.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Create Account';
    }

  } catch (err) {
    showError('Could not connect to server.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Create Account';
  }
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// run on Enter key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginBtn = document.getElementById('loginBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (loginBtn) handleLogin();
    else if (submitBtn) handleRegister();
  }
});