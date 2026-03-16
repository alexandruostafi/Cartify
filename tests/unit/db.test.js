// tests/unit/db.test.js
// Unit tests for the db.js query helpers (all / get / run / transaction)

const { initTestDb, _setDb, all, get, run, _run, transaction } = require('../../backend/db');

beforeEach(async () => {
  const db = await initTestDb();
  _setDb(db);
});

describe('db helpers', () => {
  describe('run() and all()', () => {
    test('run() inserts a row and returns lastInsertRowid', () => {
      const result = run(
        "INSERT INTO categories (name) VALUES (?)", ['Electronics']
      );
      expect(result.lastInsertRowid).toBe(1);
    });

    test('all() returns all inserted rows', () => {
      run("INSERT INTO categories (name) VALUES (?)", ['Books']);
      run("INSERT INTO categories (name) VALUES (?)", ['Sports']);
      const rows = all('SELECT * FROM categories ORDER BY name');
      expect(rows).toHaveLength(2);
      expect(rows[0].name).toBe('Books');
      expect(rows[1].name).toBe('Sports');
    });

    test('run() with params prevents SQL injection', () => {
      run("INSERT INTO categories (name) VALUES (?)", ["Hack'); DROP TABLE categories;--"]);
      const rows = all('SELECT * FROM categories');
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toContain('DROP TABLE');
    });
  });

  describe('get()', () => {
    test('returns the first matching row', () => {
      run("INSERT INTO categories (name) VALUES (?)", ['Clothing']);
      const row = get('SELECT * FROM categories WHERE name = ?', ['Clothing']);
      expect(row).toBeDefined();
      expect(row.name).toBe('Clothing');
    });

    test('returns undefined when no row matches', () => {
      const row = get('SELECT * FROM categories WHERE name = ?', ['Nonexistent']);
      expect(row).toBeUndefined();
    });
  });

  describe('transaction()', () => {
    test('commits all writes when fn succeeds', () => {
      const insert = transaction(() => {
        _run("INSERT INTO categories (name) VALUES (?)", ['A']);
        _run("INSERT INTO categories (name) VALUES (?)", ['B']);
      });
      insert();
      expect(all('SELECT * FROM categories')).toHaveLength(2);
    });

    test('rolls back all writes when fn throws', () => {
      const failingInsert = transaction(() => {
        _run("INSERT INTO categories (name) VALUES (?)", ['C']);
        throw new Error('deliberate failure');
      });
      expect(() => failingInsert()).toThrow('deliberate failure');
      expect(all('SELECT * FROM categories')).toHaveLength(0);
    });
  });
});
