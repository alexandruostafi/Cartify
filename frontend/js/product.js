// product.js – single product detail page
const container = document.getElementById('productDetail');
const params    = new URLSearchParams(window.location.search);
const id        = params.get('id');

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadProduct() {
  if (!id) { container.innerHTML = '<p class="error-msg">No product specified.</p>'; return; }

  try {
    const res = await fetch(`/api/products/${id}`, { credentials: 'include' });
    if (!res.ok) { container.innerHTML = '<p class="error-msg">Product not found.</p>'; return; }

    const p = await res.json();
    document.title = `ShopApp – ${p.name}`;

    container.innerHTML = `
      <a href="index.html" class="back-link">← Back to Products</a>
      <div class="product-detail">
        <img src="${p.image_url || 'https://via.placeholder.com/600x420?text=No+Image'}"
             alt="${escHtml(p.name)}" />
        <div class="product-detail-info">
          ${p.category_name ? `<span class="category-tag">${escHtml(p.category_name)}</span>` : ''}
          <h1>${escHtml(p.name)}</h1>
          <p class="price">$${p.price.toFixed(2)}</p>
          <p class="description">${escHtml(p.description || 'No description available.')}</p>
          <p class="stock-info">
            ${p.stock > 0
              ? `✅ ${p.stock} units available`
              : '<span style="color:var(--danger)">❌ Out of stock</span>'}
          </p>
          ${p.stock > 0 ? `
          <div class="quantity-row">
            <label for="qty"><strong>Quantity:</strong></label>
            <input type="number" id="qty" value="1" min="1" max="${p.stock}" />
          </div>
          <button class="btn btn-primary" id="addToCartBtn">Add to Cart 🛒</button>
          ` : ''}
          <div id="cartMsg" class="error-msg"></div>
        </div>
      </div>
    `;

    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const qty = parseInt(document.getElementById('qty').value, 10);
        if (!qty || qty < 1) return;

        addBtn.disabled = true;
        const res = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: p.id, quantity: qty })
        });
        const data = await res.json();
        addBtn.disabled = false;

        if (!res.ok) {
          if (res.status === 401) { window.location.href = 'login.html'; return; }
          document.getElementById('cartMsg').textContent = data.error || 'Could not add to cart.';
          return;
        }
        updateCartBadge();
        document.getElementById('cartMsg').style.color = 'var(--success)';
        document.getElementById('cartMsg').textContent = '✅ Added to cart!';
        setTimeout(() => document.getElementById('cartMsg').textContent = '', 3000);
      });
    }
  } catch (_) {
    container.innerHTML = '<p class="error-msg">Failed to load product.</p>';
  }
}

loadProduct();
