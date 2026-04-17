// checkout.js – checkout page
const summaryItems = document.getElementById('summaryItems');
const summaryTotal = document.getElementById('summaryTotal');
const form         = document.getElementById('checkoutForm');
const errorDiv     = document.getElementById('checkoutError');

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadSummary() {
  const res = await fetch('/api/cart', { credentials: 'include' });
  if (res.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  const items = await res.json();
  if (items.length === 0) {
    summaryItems.innerHTML = '<p class="no-items">Your armoury is empty.</p>';
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  summaryItems.innerHTML = items.map(i => `
    <div class="summary-item">
      <span>${escHtml(i.name)} × ${i.quantity}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  summaryTotal.textContent = `$${total.toFixed(2)}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  const btn  = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Deploying requisition…';

  try {
    const res  = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const resp = await res.json();

    if (!res.ok) {
      errorDiv.textContent = resp.error || 'Order failed.';
      btn.disabled = false;
      btn.textContent = 'Confirm Requisition';
      return;
    }

    updateCartBadge();
    window.location.href = `orders.html?success=${resp.orderId}`;
  } catch (_) {
    errorDiv.textContent = 'Network error. Please try again.';
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
});

loadSummary();
