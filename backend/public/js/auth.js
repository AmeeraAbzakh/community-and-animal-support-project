async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  const btn = document.getElementById('loginBtn');

  errorMsg.style.display = 'none';

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    errorMsg.style.display = 'block';
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

      // redirect حسب الـ role
      if (data.role === 'admin' || data.role === 'organization') {
        window.location.href = 'admin-dashboard.html';
      } else if (data.role === 'person_in_need') {
        window.location.href = 'request-assistance.html';
      } else {
        window.location.href = 'all-campaigns.html';
      }
    } else {
      errorMsg.textContent = data.message || 'Login failed.';
      errorMsg.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }

  } catch (err) {
    errorMsg.textContent = 'Could not connect to server.';
    errorMsg.style.display = 'block';
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
  const errorMsg = document.getElementById('errorMsg');
  const btn = document.getElementById('submitBtn');

  errorMsg.style.display = 'none';

  if (!firstName || !email || !password) {
    errorMsg.textContent = 'Please fill in all required fields.';
    errorMsg.style.display = 'block';
    return;
  }

  if (password !== pw2) {
    errorMsg.textContent = 'Passwords do not match.';
    errorMsg.style.display = 'block';
    return;
  }

  if (!terms) {
    errorMsg.textContent = 'Please agree to the Terms of Service.';
    errorMsg.style.display = 'block';
    return;
  }

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
      alert('Account created successfully! Please login.');
      window.location.href = 'login.html';
    } else {
      errorMsg.textContent = data.message || 'Registration failed.';
      errorMsg.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Create Account';
    }

  } catch (err) {
    errorMsg.textContent = 'Could not connect to server.';
    errorMsg.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Create Account';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginBtn = document.getElementById('loginBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (loginBtn) handleLogin();
    else if (submitBtn) handleRegister();
  }
});