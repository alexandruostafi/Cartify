// admin.js – admin panel
(async function guardAdmin() {
  const res  = await fetch('/api/auth/me', { credentials: 'include' });
  const data = await res.json();
  if (!res.ok || data.role !== 'admin') {
    window.location.href = 'login.html';
  }
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
  });
})();

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Tab switching ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    loaders[btn.dataset.tab]?.();
  });
});

const loaders = {
  dashboard:  loadDashboard,
  products:   loadProducts,
  orders:     loadAdminOrders,
  users:      loadUsers,
  categories: loadCategories
};

// ── Dashboard ──────────────────────────────────────────────────────────────
async function loadDashboard() {
  const statsGrid   = document.getElementById('statsGrid');
  const recentOrders= document.getElementById('recentOrders');
  statsGrid.innerHTML = '<p class="loading">Loading…</p>';

  const res  = await fetch('/api/admin/stats', { credentials: 'include' });
  const data = await res.json();

  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-value">${data.totalProducts}</div><div class="stat-label">Products</div></div>
    <div class="stat-card"><div class="stat-value">${data.totalOrders}</div><div class="stat-label">Orders</div></div>
    <div class="stat-card"><div class="stat-value">${data.totalCustomers}</div><div class="stat-label">Customers</div></div>
    <div class="stat-card"><div class="stat-value">$${Number(data.totalRevenue).toFixed(2)}</div><div class="stat-label">Revenue</div></div>
  `;

  if (data.recentOrders.length === 0) {
    recentOrders.innerHTML = '<p class="no-items">No orders yet.</p>';
    return;
  }
  recentOrders.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${data.recentOrders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${escHtml(o.customer_name)}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td><span class="badge badge-${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── Products ───────────────────────────────────────────────────────────────
let editingProductId = null;

async function loadProducts() {
  const container = document.getElementById('productsTable');
  container.innerHTML = '<p class="loading">Loading…</p>';
  await loadCategoriesForForm();

  const res      = await fetch('/api/products', { credentials: 'include' });
  const products = await res.json();

  if (products.length === 0) {
    container.innerHTML = '<p class="no-items">No products yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Img</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td><img src="${p.image_url || 'https://via.placeholder.com/44'}" alt="" /></td>
            <td>${escHtml(p.name)}</td>
            <td>${p.category_name || '—'}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" onclick="editProduct(${p.id})">Edit</button>
              <button class="btn btn-danger btn-sm"    onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadCategoriesForForm() {
  const sel = document.getElementById('productCategorySelect');
  if (sel.children.length > 1) return; // already loaded
  const res  = await fetch('/api/products/meta/categories');
  const cats = await res.json();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

document.getElementById('addProductBtn').addEventListener('click', () => {
  editingProductId = null;
  document.getElementById('productFormTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productFormContainer').style.display = '';
});

document.getElementById('cancelProductBtn').addEventListener('click', () => {
  document.getElementById('productFormContainer').style.display = 'none';
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    name:        fd.get('name'),
    description: fd.get('description'),
    price:       parseFloat(fd.get('price')),
    stock:       parseInt(fd.get('stock'), 10),
    image_url:   fd.get('image_url'),
    category_id: fd.get('category_id') || null
  };

  const url    = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
  const method = editingProductId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method, credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    document.getElementById('productFormContainer').style.display = 'none';
    loadProducts();
  } else {
    const d = await res.json();
    alert(d.error || 'Save failed.');
  }
});

async function editProduct(id) {
  const res = await fetch(`/api/products/${id}`, { credentials: 'include' });
  const p   = await res.json();
  editingProductId = id;
  document.getElementById('productFormTitle').textContent = 'Edit Product';

  const form = document.getElementById('productForm');
  form.name.value        = p.name;
  form.description.value = p.description || '';
  form.price.value       = p.price;
  form.stock.value       = p.stock;
  form.image_url.value   = p.image_url || '';
  form.category_id.value = p.category_id || '';
  document.getElementById('productFormContainer').style.display = '';
  document.getElementById('productFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
  loadProducts();
}

// ── Admin Orders ───────────────────────────────────────────────────────────
async function loadAdminOrders() {
  const container = document.getElementById('adminOrdersTable');
  container.innerHTML = '<p class="loading">Loading…</p>';

  const res    = await fetch('/api/orders', { credentials: 'include' });
  const orders = await res.json();

  if (orders.length === 0) {
    container.innerHTML = '<p class="no-items">No orders.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Items</th><th>Status</th><th>Date</th><th>Update</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${escHtml(o.customer_name)}<br><small style="color:var(--text-muted)">${escHtml(o.customer_email)}</small></td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${o.items.map(i => `${escHtml(i.name)} ×${i.quantity}`).join('<br>')}</td>
            <td><span class="badge badge-${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
              <select id="status-${o.id}" class="form-control" style="padding:5px 8px;border:1px solid var(--border);border-radius:var(--radius);font-size:.85rem">
                ${['pending','processing','shipped','delivered','cancelled'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
                ).join('')}
              </select>
              <button class="btn btn-primary btn-sm" style="margin-top:4px" onclick="updateOrderStatus(${o.id})">Save</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateOrderStatus(id) {
  const status = document.getElementById(`status-${id}`).value;
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (res.ok) loadAdminOrders();
  else { const d = await res.json(); alert(d.error); }
}

// ── Users ──────────────────────────────────────────────────────────────────
async function loadUsers() {
  const container = document.getElementById('usersTable');
  container.innerHTML = '<p class="loading">Loading…</p>';

  const res   = await fetch('/api/admin/users', { credentials: 'include' });
  const users = await res.json();

  container.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${escHtml(u.name)}</td>
            <td>${escHtml(u.email)}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-processing' : 'badge-delivered'}">${u.role}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}"
                      onclick="toggleRole(${u.id}, '${u.role}')">
                ${u.role === 'admin' ? 'Demote' : 'Promote'}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function toggleRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'customer' : 'admin';
  if (!confirm(`Change role to "${newRole}"?`)) return;
  await fetch(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole })
  });
  loadUsers();
}

// ── Categories ─────────────────────────────────────────────────────────────
async function loadCategories() {
  const container = document.getElementById('categoriesTable');
  container.innerHTML = '<p class="loading">Loading…</p>';

  const res  = await fetch('/api/admin/categories', { credentials: 'include' });
  const cats = await res.json();

  if (cats.length === 0) {
    container.innerHTML = '<p class="no-items">No categories yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Name</th><th>Action</th></tr></thead>
      <tbody>
        ${cats.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${escHtml(c.name)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">Delete</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) return;
  await fetch('/api/admin/categories', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('newCategoryName').value = '';
  loadCategories();
});

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
  loadCategories();
}

// ── Init ───────────────────────────────────────────────────────────────────
loadDashboard();
