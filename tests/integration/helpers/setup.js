// tests/integration/helpers/setup.js
// Starts a real HTTP server backed by an in-memory sql.js database.
// Each test FILE gets one server (started in beforeAll, closed in afterAll).
// Each test SUITE (describe block) can reset the db via resetDb().

const http    = require('http');
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const request = require('supertest');

const { initTestDb, _setDb } = require('../../../backend/db');

const authRoutes    = require('../../../backend/routes/auth');
const productRoutes = require('../../../backend/routes/products');
const cartRoutes    = require('../../../backend/routes/cart');
const orderRoutes   = require('../../../backend/routes/orders');
const adminRoutes   = require('../../../backend/routes/admin');

// Build the Express app once (routes are cached singletons)
function buildApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(session({
    secret: 'integration-secret',
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

/**
 * Call in beforeAll() — creates the Express app + HTTP server, wires a fresh
 * in-memory db.  Returns { server, agent } where agent is a supertest agent
 * bound to the server (persists cookies between requests).
 */
async function startServer() {
  const db = await initTestDb();
  _setDb(db);

  const app    = buildApp();
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve)); // port 0 = OS assigns

  return { server, app };
}

/**
 * Call in afterAll() — gracefully closes the server.
 */
async function stopServer(server) {
  await new Promise((resolve, reject) =>
    server.close(err => err ? reject(err) : resolve())
  );
}

/**
 * Wipe all rows and re-initialise the in-memory db (call in beforeEach to
 * get a clean slate for each test).
 */
async function resetDb() {
  const db = await initTestDb();
  _setDb(db);
}

/**
 * Return a supertest agent bound to the given server.
 * Using an agent preserves the session cookie across multiple requests.
 */
function agent(server) {
  return request.agent(server);
}

module.exports = { startServer, stopServer, resetDb, agent };
