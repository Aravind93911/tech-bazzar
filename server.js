const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Database
const db = new sqlite3.Database('./techbazaar.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

// Create Tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    joined DATE DEFAULT CURRENT_DATE,
    address TEXT,
    orders_count INTEGER DEFAULT 0
  )`);

  // Attack Logs table
  db.run(`CREATE TABLE IF NOT EXISTS attack_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT,
    input TEXT,
    type TEXT,
    severity TEXT,
    status TEXT,
    confidence REAL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    items TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'confirmed',
    total REAL,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Dataset table for ML training
  db.run(`CREATE TABLE IF NOT EXISTS dataset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input TEXT UNIQUE,
    label TEXT,
    category TEXT
  )`);

  // Insert default admin if not exists
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (id, name, email, password, phone, role, status) 
          VALUES (1, 'Admin User', 'admin@tech.com', ?, '9876543210', 'admin', 'active')`, 
          [adminHash]);
  
  // Insert default dataset samples
  const defaultSamples = [
    ["' OR '1'='1", 'sqli', 'Tautology'],
    ["admin'--", 'sqli', 'Comment'],
    ["' UNION SELECT * FROM users--", 'sqli', 'Union'],
    ["'; DROP TABLE users;--", 'sqli', 'Piggyback'],
    ["user@email.com", 'n', 'Normal'],
    ["john_doe", 'n', 'Normal']
  ];
  
  const stmt = db.prepare(`INSERT OR IGNORE INTO dataset (input, label, category) VALUES (?, ?, ?)`);
  defaultSamples.forEach(s => stmt.run(s));
  stmt.finalize();
});

// Authentication Middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Routes

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, ip } = req.body;
  
  // Log the attempt first
  db.run(`INSERT INTO attack_logs (ip, input, type, severity, status, confidence) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
          [ip || req.ip, email, 'Login Attempt', 'none', 'allowed', 0]);
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { ...user, password: undefined } });
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hash = await bcrypt.hashSync(password, 10);
  
  db.run(`INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
    [name, email, hash, phone], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'User created successfully' });
    });
});

// Get all users (Admin)
app.get('/api/users', auth, adminOnly, (req, res) => {
  db.all(`SELECT id, name, email, phone, role, status, joined, orders_count, address FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update user status
app.put('/api/users/:id/status', auth, adminOnly, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE users SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

// Update user role
app.put('/api/users/:id/role', auth, adminOnly, (req, res) => {
  const { role } = req.body;
  db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Role updated' });
  });
});

// Get attack logs
app.get('/api/logs', auth, adminOnly, (req, res) => {
  db.all(`SELECT * FROM attack_logs ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add attack log
app.post('/api/logs', (req, res) => {
  const { ip, input, type, severity, status, confidence } = req.body;
  db.run(`INSERT INTO attack_logs (ip, input, type, severity, status, confidence) VALUES (?, ?, ?, ?, ?, ?)`,
    [ip, input, type, severity, status, confidence], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Get dataset
app.get('/api/dataset', auth, adminOnly, (req, res) => {
  db.all(`SELECT * FROM dataset`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add to dataset
app.post('/api/dataset', auth, adminOnly, (req, res) => {
  const { input, label, category } = req.body;
  db.run(`INSERT OR IGNORE INTO dataset (input, label, category) VALUES (?, ?, ?)`,
    [input, label, category], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Create order
app.post('/api/orders', auth, (req, res) => {
  const { items, total, address } = req.body;
  const orderId = 'TB' + Date.now().toString(36).toUpperCase();
  
  db.run(`INSERT INTO orders (id, user_id, items, total, address) VALUES (?, ?, ?, ?, ?)`,
    [orderId, req.user.id, JSON.stringify(items), total, address], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update user order count
      db.run(`UPDATE users SET orders_count = orders_count + 1 WHERE id = ?`, [req.user.id]);
      
      res.json({ orderId, message: 'Order placed' });
    });
});

// Get user orders
app.get('/api/orders', auth, (req, res) => {
  db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map(r => ({...r, items: JSON.parse(r.items)}));
    res.json(orders);
  });
});

// Get all orders (Admin)
app.get('/api/orders/all', auth, adminOnly, (req, res) => {
  db.all(`SELECT o.*, u.name as user_name, u.email as user_email 
          FROM orders o JOIN users u ON o.user_id = u.id 
          ORDER BY date DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update profile
app.put('/api/profile', auth, (req, res) => {
  const { name, phone, address } = req.body;
  db.run(`UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?`,
    [name, phone, address, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated' });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
