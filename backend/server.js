const express        = require('express');
const session        = require('express-session');
const cors           = require('cors');
const path           = require('path');
const { initDb }     = require('./db');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const cartRoutes     = require('./routes/cart');
const orderRoutes    = require('./routes/orders');
const adminRoutes    = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'shopapp-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ── Static Frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);

// ── Catch-all: serve index.html for any unmatched routes ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n⚔️  WarForge running at http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});
