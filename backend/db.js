const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '..', 'shop.db');

let db;

/** Used by unit tests: swap in a fresh in-memory database without touching disk. */
function _setDb(instance) { db = instance; }

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Persist helper — called after every write
  db._save = function () {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };

  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'customer',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      price       REAL    NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      image_url   TEXT,
      category_id INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS cart (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      total       REAL    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      full_name   TEXT    NOT NULL,
      address     TEXT    NOT NULL,
      city        TEXT    NOT NULL,
      postal_code TEXT    NOT NULL,
      country     TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL,
      unit_price REAL    NOT NULL,
      FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  db._save();
  return db;
}

/**
 * Initialise a fresh **in-memory** database with the full schema.
 * Intended for unit tests only — nothing is written to disk.
 */
async function initTestDb() {
  const SQL = await initSqlJs();
  db = new SQL.Database();
  db._save = () => {}; // no-op: never write to disk during tests

  db.run('PRAGMA foreign_keys = ON;');

  // Re-run the same schema creation as initDb()
  const schemaStart = 'CREATE TABLE IF NOT EXISTS users';
  const schemaEnd   = 'FOREIGN KEY (product_id) REFERENCES products(id)\n    );';
  // Instead of duplicating the SQL, call initDb logic on the in-memory db
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'customer',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      price       REAL    NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      image_url   TEXT,
      category_id INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS cart (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      total       REAL    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      full_name   TEXT    NOT NULL,
      address     TEXT    NOT NULL,
      city        TEXT    NOT NULL,
      postal_code TEXT    NOT NULL,
      country     TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL,
      unit_price REAL    NOT NULL,
      FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialised. Await initDb() first.');
  return db;
}

/** Run a SELECT and return all rows as objects. */
function all(sql, params = []) {
  const stmt = getDb().prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/** Run a SELECT and return the first row, or undefined. */
function get(sql, params = []) {
  return all(sql, params)[0];
}

/** Run a write statement; returns { lastInsertRowid, changes }. */
function run(sql, params = []) {
  getDb().run(sql, params);
  const info = all('SELECT last_insert_rowid() AS id, changes() AS ch')[0];
  getDb()._save();
  return { lastInsertRowid: info.id, changes: info.ch };
}

/** Same as run() but does NOT auto-save (for use inside transaction()). */
function _run(sql, params = []) {
  getDb().run(sql, params);
  const info = all('SELECT last_insert_rowid() AS id, changes() AS ch')[0];
  return { lastInsertRowid: info.id, changes: info.ch };
}

/** Wrap a function in BEGIN / COMMIT with automatic ROLLBACK on error. */
function transaction(fn) {
  return function (...args) {
    getDb().run('BEGIN');
    try {
      const result = fn(...args);
      getDb().run('COMMIT');
      getDb()._save();
      return result;
    } catch (err) {
      getDb().run('ROLLBACK');
      throw err;
    }
  };
}

module.exports = { initDb, initTestDb, _setDb, all, get, run, _run, transaction };
