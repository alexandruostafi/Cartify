// orders.js – my orders page
const container = document.getElementById('ordersContent');

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function badgeClass(status) {
  return `badge badge-${status}`;
}

async function loadOrders() {
  const res = await fetch('/api/orders/my', { credentials: 'include' });
  if (res.status === 401) {
    container.innerHTML = `<p>Please <a href="login.html">log in</a> to see your orders.</p>`;
    return;
  }
  const orders = await res.json();

  // Show success banner if redirected from checkout
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get('success');
  let banner = '';
  if (orderId) {
    banner = `<div class="card" style="background:#dcfce7;border-color:#86efac;margin-bottom:20px">
      ✅ <strong>Order #${orderId} placed successfully!</strong> Thank you for your purchase.
    </div>`;
    history.replaceState(null, '', 'orders.html');
  }

  if (orders.length === 0) {
    container.innerHTML = banner + `<p class="no-items">You have no orders yet. <a href="index.html">Start shopping →</a></p>`;
    return;
  }

  container.innerHTML = banner + orders.map(o => `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <strong>Order #${o.id}</strong>
          <span style="color:var(--text-muted);margin-left:12px;font-size:.85rem">${new Date(o.created_at).toLocaleDateString()}</span>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <span class="${badgeClass(o.status)}">${o.status}</span>
          <strong>$${o.total.toFixed(2)}</strong>
        </div>
      </div>
      <div class="order-card-body">
        <p><strong>Ship to:</strong> ${escHtml(o.full_name)}, ${escHtml(o.address)}, ${escHtml(o.city)}, ${escHtml(o.postal_code)}, ${escHtml(o.country)}</p>
        <ul class="order-items-list">
          ${o.items.map(i => `<li>• ${escHtml(i.name)} × ${i.quantity} — $${(i.unit_price * i.quantity).toFixed(2)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

loadOrders();
