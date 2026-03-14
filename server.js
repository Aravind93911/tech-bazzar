const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Database
const db = new Database('techbazaar.db');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    pw TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    joined TEXT DEFAULT CURRENT_DATE,
    addr TEXT,
    orders INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    n TEXT NOT NULL,
    c TEXT NOT NULL,
    p REAL NOT NULL,
    o REAL NOT NULL,
    r REAL DEFAULT 4.0,
    e TEXT,
    d TEXT,
    s INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    uid INTEGER,
    items TEXT,
    date TEXT,
    st TEXT DEFAULT 'confirmed',
    FOREIGN KEY (uid) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    t TEXT DEFAULT CURRENT_TIMESTAMP,
    ip TEXT,
    inp TEXT,
    tp TEXT,
    sev TEXT,
    st TEXT,
    conf REAL
  );

  CREATE TABLE IF NOT EXISTS dataset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    i TEXT NOT NULL,
    l TEXT NOT NULL,
    c TEXT
  );

  CREATE TABLE IF NOT EXISTS ml_model (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    ok INTEGER DEFAULT 0,
    acc REAL DEFAULT 0,
    ep INTEGER DEFAULT 0,
    last TEXT,
    samp INTEGER DEFAULT 0,
    f1 REAL DEFAULT 0,
    prec REAL DEFAULT 0,
    rec REAL DEFAULT 0
  );
`);

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  // Seed users
  const insertUser = db.prepare('INSERT INTO users (name, email, pw, phone, role, status, joined, addr, orders) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertUser.run('Admin User', 'admin@tech.com', 'admin123', '9876543210', 'admin', 'active', '2025-01-15', '123 Tech St, Silicon Valley', 5);
  insertUser.run('John Doe', 'john@test.com', 'john123', '9876543211', 'user', 'active', '2025-03-20', '456 Main St, New York', 3);
  insertUser.run('Jane Smith', 'jane@test.com', 'jane123', '9876543212', 'user', 'active', '2025-06-10', '789 Oak Ave, LA', 1);
  insertUser.run('Bob Wilson', 'bob@test.com', 'bob123', '9876543213', 'user', 'suspended', '2025-08-05', '321 Elm St, Chicago', 0);
  insertUser.run('Alice Brown', 'alice@test.com', 'alice123', '9876543214', 'user', 'active', '2025-10-12', '555 Pine Rd, Seattle', 2);

  // Seed products
  const insertProd = db.prepare('INSERT INTO products (n, c, p, o, r, e, d, s) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertProd.run('ProFit Ultra Smartwatch', 'smartwatch', 12999, 18999, 4.5, '⌚', 'AMOLED, 7-day battery, GPS, heart rate, SpO2', 45);
  insertProd.run('AirWave Pro Earbuds', 'earbuds', 4999, 7999, 4.3, '🎧', 'ANC, 30hr battery, IPX5, transparency mode', 120);
  insertProd.run('BassX Wired Earphones', 'earphones', 1299, 2499, 4.0, '🎵', 'Deep bass, tangle-free, hi-fi drivers, inline mic', 200);
  insertProd.run('SoundBlast Mini Speaker', 'speaker', 3499, 5999, 4.6, '🔊', '360° surround, 12hr playtime, IPX7 waterproof', 80);
  insertProd.run('TurboCharge 65W GaN', 'charger', 1899, 2999, 4.2, '🔌', '3 ports, GaN tech, foldable plug, fast charge', 150);
  insertProd.run('FitBand SE Watch', 'smartwatch', 3999, 5999, 4.1, '⌚', 'SpO2, sleep tracking, 14-day battery life', 90);
  insertProd.run('SonicBuds Lite', 'earbuds', 1499, 2999, 3.9, '🎧', 'Touch controls, 20hr battery, ultra-lightweight', 250);
  insertProd.run('ProSound Neckband', 'earphones', 999, 1999, 3.8, '🎵', 'Magnetic tips, 15hr playback, quick charge', 180);
  insertProd.run('MegaBoom Party Speaker', 'speaker', 8999, 13999, 4.7, '🔊', '100W output, LED lights, mic input, TWS pair', 35);
  insertProd.run('PowerVault 20000mAh', 'charger', 2499, 3999, 4.4, '🔋', 'Dual USB-C, LED display, slim profile', 100);
  insertProd.run('Elite GPS Smartwatch', 'smartwatch', 24999, 34999, 4.8, '⌚', 'Titanium body, always-on, diving mode, ECG', 20);
  insertProd.run('StudioPods Max', 'earbuds', 9999, 14999, 4.6, '🎧', 'Hi-Res audio, spatial sound, 40hr battery', 60);

  // Seed logs
  const insertLog = db.prepare('INSERT INTO logs (t, ip, inp, tp, sev, st, conf) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const logs = [
    ['2026-02-28 14:23', '192.168.1.45', "' OR '1'='1' --", 'Tautology', 'high', 'blocked', 98.5],
    ['2026-02-28 15:10', '10.0.0.123', "admin'; DROP TABLE users;--", 'DROP TABLE', 'critical', 'blocked', 99.2],
    ['2026-02-28 16:45', '172.16.0.89', '1 UNION SELECT * FROM passwords', 'UNION', 'high', 'blocked', 97.8],
    ['2026-03-01 09:12', '192.168.2.10', 'user@test.com', 'Normal', 'none', 'allowed', 2.1],
    ['2026-03-01 10:30', '10.0.0.55', "' OR 1=1 UNION SELECT username,password--", 'UNION+OR', 'critical', 'blocked', 99.8],
    ['2026-03-01 11:05', '192.168.1.200', "' AND CONVERT(int,(SELECT table_name FROM information_schema.tables))--", 'Error-based', 'critical', 'blocked', 99.5],
    ['2026-03-01 14:20', '172.16.1.15', 'john.doe@email.com', 'Normal', 'none', 'allowed', 1.5],
    ['2026-03-02 08:15', '10.0.0.77', "'; EXEC xp_cmdshell('net user');--", 'Command Exec', 'critical', 'blocked', 99.9],
    ['2026-03-02 09:00', '192.168.5.22', 'normaluser', 'Normal', 'none', 'allowed', 0.8],
    ['2026-03-02 09:30', '10.0.1.88', "' WAITFOR DELAY '0:0:10'--", 'Time-based', 'high', 'blocked', 96.3]
  ];
  logs.forEach(log => insertLog.run(...log));

  // Seed dataset
  const insertDS = db.prepare('INSERT INTO dataset (i, l, c) VALUES (?, ?, ?)');
  const ds = [
    ["' OR '1'='1", 'sqli', 'Tautology'], ["admin'--", 'sqli', 'Comment'],
    ["' UNION SELECT * FROM users--", 'sqli', 'Union'], ["'; DROP TABLE users;--", 'sqli', 'Piggyback'],
    ["1' AND 1=1--", 'sqli', 'Tautology'], ["' OR ''='", 'sqli', 'Tautology'],
    ['user@email.com', 'n', 'Normal'], ['john_doe', 'n', 'Normal'],
    ['password123', 'n', 'Normal'], ['Hello World', 'n', 'Normal'],
    ['1 OR 1=1', 'sqli', 'Tautology'], ["' UNION ALL SELECT NULL--", 'sqli', 'Union'],
    ["'; WAITFOR DELAY '0:0:5'--", 'sqli', 'Time-based'],
    ["admin' AND SUBSTRING(@@version,1,1)='5", 'sqli', 'Blind'],
    ['test_user_2024', 'n', 'Normal'], ['email+tag@domain.co', 'n', 'Normal'],
    ["1'; EXEC xp_cmdshell('dir');--", 'sqli', 'Command'],
    ["'; WAITFOR DELAY '0:0:5'--", 'sqli', 'Time-based']
  ];
  ds.forEach(d => insertDS.run(...d));

  // Seed ML model
  db.prepare('INSERT INTO ml_model (id, ok, acc, ep, last, samp, f1, prec, rec) VALUES (1, 1, 96.8, 50, ?, 20, 0.95, 97.2, 96.4)').run('2026-02-25');

  console.log('Database seeded with initial data!');
}

// ============ API ROUTES ============

// Get all data for initialization
app.get('/api/init', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  const products = db.prepare('SELECT * FROM products').all();
  const logs = db.prepare('SELECT * FROM logs ORDER BY id DESC').all();
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const dataset = db.prepare('SELECT * FROM dataset').all();
  const ml = db.prepare('SELECT * FROM ml_model WHERE id = 1').get();
  
  res.json({
    users,
    prods: products,
    logs,
    orders,
    ds: dataset,
    ml: ml || { ok: false, acc: 0, ep: 0, last: 'N/A', samp: 0, f1: 0, prec: 0, rec: 0 }
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password, sqliCheck } = req.body;
  
  // Log the attempt
  if (sqliCheck && sqliCheck.bad) {
    db.prepare('INSERT INTO logs (t, ip, inp, tp, sev, st, conf) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      new Date().toISOString(), req.ip || '127.0.0.1', sqliCheck.input || email,
      sqliCheck.threats.join(', '), sqliCheck.risk, 'blocked', sqliCheck.confidence
    );
    return res.json({ success: false, error: 'SQL Injection detected & blocked! Incident logged.' });
  }
  
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND pw = ?').get(email, password);
  
  if (!user) {
    return res.json({ success: false, error: 'Invalid email or password.' });
  }
  
  if (user.status === 'suspended') {
    return res.json({ success: false, error: 'Account suspended. Contact admin.' });
  }
  
  // Log successful login
  db.prepare('INSERT INTO logs (t, ip, inp, tp, sev, st, conf) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    new Date().toISOString(), '127.0.0.1', email, 'Normal', 'none', 'allowed', 2.1
  );
  
  res.json({ success: true, user });
});

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.json({ success: false, error: 'Email already registered.' });
  }
  
  const result = db.prepare('INSERT INTO users (name, email, pw, phone, role, status, joined) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    name, email, password, phone, 'user', 'active', new Date().toISOString().split('T')[0]
  );
  
  res.json({ success: true, userId: result.lastInsertRowid });
});

// Get user profile
app.get('/api/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json(user);
});

// Update user profile
app.put('/api/user/:id', (req, res) => {
  const { name, phone, addr } = req.body;
  db.prepare('UPDATE users SET name = ?, phone = ?, addr = ? WHERE id = ?').run(name, phone, addr, req.params.id);
  res.json({ success: true });
});

// Get user orders
app.get('/api/orders/:uid', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE uid = ? ORDER BY id DESC').all(req.params.uid);
  orders.forEach(o => o.items = JSON.parse(o.items));
  res.json(orders);
});

// Create order
app.post('/api/orders', (req, res) => {
  const { uid, items, total } = req.body;
  const oid = 'TB' + Date.now().toString(36).toUpperCase();
  const date = new Date().toISOString();
  
  db.prepare('INSERT INTO orders (id, uid, items, date, st) VALUES (?, ?, ?, ?, ?)').run(
    oid, uid, JSON.stringify(items), date, 'confirmed'
  );
  
  db.prepare('UPDATE users SET orders = orders + 1 WHERE id = ?').run(uid);
  
  res.json({ success: true, orderId: oid, date });
});

// ============ ADMIN APIs ============

// Get all users
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();
  res.json(users);
});

// Update user status
app.put('/api/admin/users/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Update user role
app.put('/api/admin/users/:id/role', (req, res) => {
  const { role } = req.body;
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ success: true });
});

// Get all logs
app.get('/api/admin/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM logs ORDER BY id DESC').all();
  res.json(logs);
});

// Add log entry
app.post('/api/admin/logs', (req, res) => {
  const { t, ip, inp, tp, sev, st, conf } = req.body;
  db.prepare('INSERT INTO logs (t, ip, inp, tp, sev, st, conf) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    t || new Date().toISOString(), ip, inp, tp, sev, st, conf
  );
  res.json({ success: true });
});

// Get ML stats
app.get('/api/admin/ml', (req, res) => {
  const ml = db.prepare('SELECT * FROM ml_model WHERE id = 1').get();
  res.json(ml || { ok: false, acc: 0, ep: 0, last: 'N/A', samp: 0, f1: 0, prec: 0, rec: 0 });
});

// Update ML model
app.put('/api/admin/ml', (req, res) => {
  const { ok, acc, ep, last, samp, f1, prec, rec } = req.body;
  db.prepare(`INSERT OR REPLACE INTO ml_model (id, ok, acc, ep, last, samp, f1, prec, rec) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    ok ? 1 : 0, acc, ep, last, samp, f1, prec, rec
  );
  res.json({ success: true });
});

// Get dataset
app.get('/api/admin/dataset', (req, res) => {
  const dataset = db.prepare('SELECT * FROM dataset').all();
  res.json(dataset);
});

// Add to dataset
app.post('/api/admin/dataset', (req, res) => {
  const { i, l, c } = req.body;
  const existing = db.prepare('SELECT id FROM dataset WHERE i = ?').get(i);
  if (existing) {
    return res.json({ success: false, error: 'Already exists' });
  }
  db.prepare('INSERT INTO dataset (i, l, c) VALUES (?, ?, ?)').run(i, l, c);
  res.json({ success: true });
});

// Delete from dataset
app.delete('/api/admin/dataset/:id', (req, res) => {
  db.prepare('DELETE FROM dataset WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Bulk add to dataset
app.post('/api/admin/dataset/bulk', (req, res) => {
  const { samples } = req.body;
  const insert = db.prepare('INSERT INTO dataset (i, l, c) VALUES (?, ?, ?)');
  
  let count = 0;
  samples.forEach(s => {
    const existing = db.prepare('SELECT id FROM dataset WHERE i = ?').get(s.i);
    if (!existing) {
      insert.run(s.i, s.l, s.c);
      count++;
    }
  });
  
  res.json({ success: true, count });
});

// Get stats for dashboard
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const blockedLogs = db.prepare('SELECT COUNT(*) as count FROM logs WHERE st = ?').get('blocked').count;
  const allowedLogs = db.prepare('SELECT COUNT(*) as count FROM logs WHERE st = ?').get('allowed').count;
  const criticalLogs = db.prepare('SELECT COUNT(*) as count FROM logs WHERE sev = ?').get('critical').count;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const ml = db.prepare('SELECT * FROM ml_model WHERE id = 1').get() || { acc: 0 };
  
  res.json({
    totalUsers,
    blockedLogs,
    allowedLogs,
    criticalLogs,
    totalOrders,
    mlAccuracy: ml.acc
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Database: techbazaar.db`);
});
