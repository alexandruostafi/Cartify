const bcrypt         = require('bcrypt');
const { initDb, run, get } = require('./db');

async function seed() {
  await initDb();
  console.log('🌱 Seeding database...');

  // Categories
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  for (const name of categories) {
    try { run('INSERT INTO categories (name) VALUES (?)', [name]); } catch (_) {}
  }

  const getCat = name => get('SELECT id FROM categories WHERE name = ?', [name]).id;

  // Admin user
  const adminPwd = await bcrypt.hash('admin123', 10);
  try {
    run("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@shop.com', ?, 'admin')", [adminPwd]);
  } catch (_) {}

  // Sample customer
  const customerPwd = await bcrypt.hash('customer123', 10);
  try {
    run("INSERT INTO users (name, email, password, role) VALUES ('Jane Doe', 'jane@example.com', ?, 'customer')", [customerPwd]);
  } catch (_) {}

  // Products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'High-quality noise-cancelling over-ear headphones with 30h battery life.',
      price: 89.99, stock: 50,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: 'Electronics'
    },
    {
      name: 'Mechanical Keyboard',
      description: 'Compact TKL mechanical keyboard with RGB backlight and blue switches.',
      price: 74.99, stock: 30,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      category: 'Electronics'
    },
    {
      name: 'Smartphone Stand',
      description: 'Adjustable aluminium desk stand compatible with all smartphones and tablets.',
      price: 19.99, stock: 100,
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
      category: 'Electronics'
    },
    {
      name: 'Classic White T-Shirt',
      description: '100% organic cotton crew-neck t-shirt. Available in sizes S-XXL.',
      price: 14.99, stock: 200,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category: 'Clothing'
    },
    {
      name: 'Denim Jacket',
      description: 'Slim-fit denim jacket, timeless style for any occasion.',
      price: 49.99, stock: 75,
      image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
      category: 'Clothing'
    },
    {
      name: 'The Pragmatic Programmer',
      description: 'A classic guide to software craftsmanship by David Thomas and Andrew Hunt.',
      price: 34.99, stock: 60,
      image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      category: 'Books'
    },
    {
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
      price: 29.99, stock: 45,
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      category: 'Books'
    },
    {
      name: 'Ceramic Plant Pot',
      description: 'Elegant minimalist ceramic pot for indoor plants. 15cm diameter.',
      price: 12.99, stock: 150,
      image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
      category: 'Home & Garden'
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip 6mm thick eco-friendly yoga mat with carrying strap.',
      price: 27.99, stock: 80,
      image_url: 'https://images.unsplash.com/photo-1601925228604-6b60b3e8be67?w=400',
      category: 'Sports'
    },
    {
      name: 'Water Bottle 1L',
      description: 'Insulated stainless steel water bottle, keeps drinks cold 24h or hot 12h.',
      price: 22.99, stock: 120,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      category: 'Sports'
    },
  ];

  const insertProduct = (p) => {
    try {
      run(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.stock, p.image_url, getCat(p.category)]
      );
    } catch (_) {}
  };

  for (const p of products) {
    insertProduct(p);
  }

  console.log('✅ Seeding complete!');
  console.log('   Admin login  → admin@shop.com   / admin123');
  console.log('   Customer     → jane@example.com / customer123');
}

seed().catch(console.error);
