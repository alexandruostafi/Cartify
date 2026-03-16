// register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('registerError');
  errorDiv.textContent = '';
  const data = Object.fromEntries(new FormData(e.target));
  const btn  = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;

  try {
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const resp = await res.json();
    if (!res.ok) {
      errorDiv.textContent = resp.error || 'Registration failed.';
      btn.disabled = false;
      return;
    }
    window.location.href = 'index.html';
  } catch (_) {
    errorDiv.textContent = 'Network error.';
    btn.disabled = false;
  }
});
