// index.js – product listing page
const grid     = document.getElementById('productsGrid');
const searchIn = document.getElementById('searchInput');
const catFilter= document.getElementById('categoryFilter');
const searchBtn= document.getElementById('searchBtn');

async function loadCategories() {
  try {
    const res  = await fetch('/api/products/meta/categories');
    const cats = await res.json();
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      catFilter.appendChild(opt);
    });
  } catch (_) {}
}

async function loadProducts() {
  grid.innerHTML = '<p class="loading">Summoning miniatures from the Warp…</p>';
  const params = new URLSearchParams();
  if (searchIn.value.trim())  params.set('search',   searchIn.value.trim());
  if (catFilter.value)        params.set('category', catFilter.value);

  try {
    const res      = await fetch(`/api/products?${params}`, { credentials: 'include' });
    const products = await res.json();

    if (products.length === 0) {
      grid.innerHTML = '<p class="no-items">No miniatures found. The search yielded nothing, Commander.</p>';
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <a href="product.html?id=${p.id}">
          <img src="${p.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}"
               alt="${escHtml(p.name)}" loading="lazy" />
        </a>
        <div class="product-card-body">
          ${p.category_name ? `<span class="category-tag">${escHtml(p.category_name)}</span>` : ''}
          <h3><a href="product.html?id=${p.id}">${escHtml(p.name)}</a></h3>
          <p class="stock-info">${p.stock > 0 ? `${p.stock} in stock` : '<span style="color:var(--danger)">Out of stock</span>'}</p>
          <p class="price">$${p.price.toFixed(2)}</p>
        </div>
        <div class="product-card-actions">
          <a href="product.html?id=${p.id}" class="btn btn-secondary btn-sm">View</a>
          <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})" ${p.stock === 0 ? 'disabled' : ''}>
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
      grid.innerHTML = '<p class="error-msg">Failed to load miniatures.</p>';
  }
}

async function addToCart(productId) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { window.location.href = 'login.html'; return; }
      alert(data.error || 'Could not add to cart.');
      return;
    }
    updateCartBadge();
    showToast('Requisitioned! ⚔️');
  } catch (_) { alert('Network error.'); }
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#1a1a1a', color: '#e4e4e7', padding: '12px 20px',
      borderRadius: '8px', fontSize: '.9rem', boxShadow: '0 4px 12px rgba(0,0,0,.3)',
      zIndex: 9999, transition: 'opacity .3s'
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.style.opacity = '0', 2500);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

searchBtn.addEventListener('click', loadProducts);
searchIn.addEventListener('keydown', e => { if (e.key === 'Enter') loadProducts(); });
catFilter.addEventListener('change', loadProducts);

loadCategories();
loadProducts();
