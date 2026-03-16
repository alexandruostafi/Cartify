// cart.js – shopping cart page
const cartContent = document.getElementById('cartContent');

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadCart() {
  cartContent.innerHTML = '<p class="loading">Loading cart…</p>';

  const res = await fetch('/api/cart', { credentials: 'include' });
  if (res.status === 401) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <p>Please <a href="login.html">log in</a> to view your cart.</p>
      </div>`;
    return;
  }

  const items = await res.json();
  if (items.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty. <a href="index.html">Continue shopping →</a></p>
      </div>`;
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  cartContent.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th></th>
          <th>Product</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${items.map(i => `
          <tr id="row-${i.product_id}">
            <td><img src="${i.image_url || 'https://via.placeholder.com/56'}" alt="" /></td>
            <td><a href="product.html?id=${i.product_id}">${escHtml(i.name)}</a></td>
            <td>$${i.price.toFixed(2)}</td>
            <td>
              <input class="qty-input" type="number" value="${i.quantity}" min="1" max="${i.stock}"
                     data-id="${i.product_id}" onchange="updateQty(${i.product_id}, this.value)" />
            </td>
            <td>$${(i.price * i.quantity).toFixed(2)}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="removeItem(${i.product_id})">✕</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="cart-summary">
      <div class="cart-summary-box">
        <div class="total-row"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
        <button class="btn btn-secondary btn-block" style="margin-top:8px" onclick="clearCart()">Clear Cart</button>
      </div>
    </div>
  `;
}

async function updateQty(productId, qty) {
  qty = parseInt(qty, 10);
  if (!qty || qty < 1) return;
  await fetch('/api/cart', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, quantity: qty })
  });
  loadCart();
  updateCartBadge();
}

async function removeItem(productId) {
  await fetch(`/api/cart/${productId}`, { method: 'DELETE', credentials: 'include' });
  loadCart();
  updateCartBadge();
}

async function clearCart() {
  if (!confirm('Clear your entire cart?')) return;
  await fetch('/api/cart', { method: 'DELETE', credentials: 'include' });
  loadCart();
  updateCartBadge();
}

loadCart();
