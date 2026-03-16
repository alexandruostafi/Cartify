// tests/unit/helpers/setup.js
// Shared test-db bootstrap used by every unit test file.
//
// Usage:
//   const { app, db } = require('./helpers/setup');
//
// Call setupDb() in beforeEach to get a clean in-memory database for each test.

const { initTestDb, _setDb } = require('../../../backend/db');

/**
 * Re-initialise the in-memory database, wipe all rows, and wire it into the
 * db module so all route handlers see the fresh state.
 */
async function setupDb() {
  const db = await initTestDb();
  _setDb(db);
  return db;
}

/**
 * Build a minimal Express app that mounts all API routes — identical to
 * server.js but without calling app.listen() or initDb().
 */
function buildApp() {
  const express       = require('express');
  const session       = require('express-session');
  const cors          = require('cors');

  const authRoutes    = require('../../../backend/routes/auth');
  const productRoutes = require('../../../backend/routes/products');
  const cartRoutes    = require('../../../backend/routes/cart');
  const orderRoutes   = require('../../../backend/routes/orders');
  const adminRoutes   = require('../../../backend/routes/admin');

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }));

  app.use('/api/auth',     authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart',     cartRoutes);
  app.use('/api/orders',   orderRoutes);
  app.use('/api/admin',    adminRoutes);

  return app;
}

module.exports = { setupDb, buildApp };
