// auth-common.js – runs on every page to init session state
(async function () {
  try {
    const res  = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();

    if (res.ok) {
      const authLinks = document.getElementById('authLinks');
      const userLinks = document.getElementById('userLinks');
      const adminLink = document.getElementById('adminLink');

      if (authLinks) authLinks.style.display = 'none';
      if (userLinks) userLinks.style.display = '';
      if (adminLink && data.role === 'admin') {
        adminLink.style.display = '';
        adminLink.href = 'admin.html';
        adminLink.textContent = 'Admin';
      }

      // Logout
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          window.location.href = 'index.html';
        });
      }
    }
  } catch (_) { /* not logged in */ }

  // Update cart count badge
  updateCartBadge();
})();

async function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  try {
    const res  = await fetch('/api/cart', { credentials: 'include' });
    if (!res.ok) return;
    const items = await res.json();
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? '' : 'none';
  } catch (_) {}
}
