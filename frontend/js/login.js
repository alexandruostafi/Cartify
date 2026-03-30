// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = '';
  const data = Object.fromEntries(new FormData(e.target));

  if (!data.email || !data.email.trim()) {
    errorDiv.textContent = 'Email is required.';
    return;
  }
  if (!data.password) {
    errorDiv.textContent = 'Password is required.';
    return;
  }

  const btn  = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;

  try {
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const resp = await res.json();
    if (!res.ok) {
      errorDiv.textContent = resp.error || 'Login failed.';
      btn.disabled = false;
      return;
    }
    // Redirect admins to admin panel, others to home
    window.location.href = resp.role === 'admin' ? 'admin.html' : 'index.html';
  } catch (_) {
    errorDiv.textContent = 'Network error.';
    btn.disabled = false;
  }
});
