/**
 * TechBazaar - Data Store
 * All application state and initial data
 */
const S = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@tech.com', password: 'admin123', phone: '9876543210', role: 'admin', status: 'active', joined: '2025-01-15', address: '123 Tech St, Silicon Valley', orders: 5 },
    { id: 2, name: 'John Doe', email: 'john@test.com', password: 'john123', phone: '9876543211', role: 'user', status: 'active', joined: '2025-03-20', address: '456 Main St, New York', orders: 3 },
    { id: 3, name: 'Jane Smith', email: 'jane@test.com', password: 'jane123', phone: '9876543212', role: 'user', status: 'active', joined: '2025-06-10', address: '789 Oak Ave, LA', orders: 1 },
    { id: 4, name: 'Bob Wilson', email: 'bob@test.com', password: 'bob123', phone: '9876543213', role: 'user', status: 'suspended', joined: '2025-08-05', address: '321 Elm St, Chicago', orders: 0 },
    { id: 5, name: 'Alice Brown', email: 'alice@test.com', password: 'alice123', phone: '9876543214', role: 'user', status: 'active', joined: '2025-10-12', address: '555 Pine Rd, Seattle', orders: 2 }
  ],

  products: [
    { id: 1, name: 'ProFit Ultra Smartwatch', cat: 'smartwatch', price: 12999, old: 18999, rating: 4.5, emoji: '⌚', desc: 'AMOLED display, 7-day battery, GPS, heart rate', stock: 45 },
    { id: 2, name: 'AirWave Pro Earbuds', cat: 'earbuds', price: 4999, old: 7999, rating: 4.3, emoji: '🎧', desc: 'ANC, 30hr battery, IPX5, transparency mode', stock: 120 },
    { id: 3, name: 'BassX Wired Earphones', cat: 'earphones', price: 1299, old: 2499, rating: 4.0, emoji: '🎵', desc: 'Deep bass, tangle-free cable, inline mic', stock: 200 },
    { id: 4, name: 'SoundBlast Mini Speaker', cat: 'speaker', price: 3499, old: 5999, rating: 4.6, emoji: '🔊', desc: '360° sound, 12hr playtime, waterproof', stock: 80 },
    { id: 5, name: 'TurboCharge 65W GaN', cat: 'charger', price: 1899, old: 2999, rating: 4.2, emoji: '🔌', desc: '3 ports, GaN tech, foldable, fast charge', stock: 150 },
    { id: 6, name: 'FitBand SE Watch', cat: 'smartwatch', price: 3999, old: 5999, rating: 4.1, emoji: '⌚', desc: 'SpO2, sleep tracking, 14-day battery', stock: 90 },
    { id: 7, name: 'SonicBuds Lite', cat: 'earbuds', price: 1499, old: 2999, rating: 3.9, emoji: '🎧', desc: 'Touch controls, 20hr battery, lightweight', stock: 250 },
    { id: 8, name: 'ProSound Neckband', cat: 'earphones', price: 999, old: 1999, rating: 3.8, emoji: '🎵', desc: 'Magnetic tips, 15hr playback, quick charge', stock: 180 },
    { id: 9, name: 'MegaBoom Party Speaker', cat: 'speaker', price: 8999, old: 13999, rating: 4.7, emoji: '🔊', desc: '100W, LED lights, mic input, TWS pairing', stock: 35 },
    { id: 10, name: 'PowerVault 20000mAh', cat: 'charger', price: 2499, old: 3999, rating: 4.4, emoji: '🔋', desc: 'Dual USB-C, LED display, slim, fast charge', stock: 100 },
    { id: 11, name: 'Elite GPS Smartwatch', cat: 'smartwatch', price: 24999, old: 34999, rating: 4.8, emoji: '⌚', desc: 'Titanium, always-on, diving mode, ECG', stock: 20 },
    { id: 12, name: 'StudioPods Max', cat: 'earbuds', price: 9999, old: 14999, rating: 4.6, emoji: '🎧', desc: 'Hi-Res, spatial audio, 40hr battery', stock: 60 }
  ],

  cart: [],
  orders: [],

  attackLogs: [
    { id: 1, time: '2026-02-28 14:23:15', ip: '192.168.1.45', input: "' OR '1'='1' --", type: 'Tautology', severity: 'high', status: 'blocked', confidence: 98.5 },
    { id: 2, time: '2026-02-28 15:10:42', ip: '10.0.0.123', input: "admin'; DROP TABLE users;--", type: 'DROP TABLE', severity: 'critical', status: 'blocked', confidence: 99.2 },
    { id: 3, time: '2026-02-28 16:45:30', ip: '172.16.0.89', input: "1 UNION SELECT * FROM passwords", type: 'UNION Attack', severity: 'high', status: 'blocked', confidence: 97.8 },
    { id: 4, time: '2026-03-01 09:12:05', ip: '192.168.2.10', input: "user@test.com", type: 'Normal', severity: 'none', status: 'allowed', confidence: 2.1 },
    { id: 5, time: '2026-03-01 10:30:18', ip: '10.0.0.55', input: "' OR 1=1 UNION SELECT username,password FROM users--", type: 'UNION+OR', severity: 'critical', status: 'blocked', confidence: 99.8 },
    { id: 6, time: '2026-03-01 11:05:33', ip: '192.168.1.200', input: "' AND CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--", type: 'Error-based', severity: 'critical', status: 'blocked', confidence: 99.5 },
    { id: 7, time: '2026-03-01 14:20:00', ip: '172.16.1.15', input: "john.doe@email.com", type: 'Normal', severity: 'none', status: 'allowed', confidence: 1.5 },
    { id: 8, time: '2026-03-02 08:15:44', ip: '10.0.0.77', input: "'; EXEC xp_cmdshell('net user');--", type: 'Command Exec', severity: 'critical', status: 'blocked', confidence: 99.9 },
    { id: 9, time: '2026-03-02 09:00:00', ip: '192.168.5.22', input: "normaluser", type: 'Normal', severity: 'none', status: 'allowed', confidence: 0.8 },
    { id: 10, time: '2026-03-02 09:30:12', ip: '10.0.1.88', input: "' WAITFOR DELAY '0:0:10'--", type: 'Time-based Blind', severity: 'high', status: 'blocked', confidence: 96.3 }
  ],

  dataset: [
    { input: "' OR '1'='1'", label: 'sqli', cat: 'Tautology' },
    { input: "admin'--", label: 'sqli', cat: 'Comment' },
    { input: "' UNION SELECT * FROM users--", label: 'sqli', cat: 'Union' },
    { input: "'; DROP TABLE users;--", label: 'sqli', cat: 'Piggyback' },
    { input: "1' AND 1=1--", label: 'sqli', cat: 'Tautology' },
    { input: "' OR ''='", label: 'sqli', cat: 'Tautology' },
    { input: "user@email.com", label: 'normal', cat: 'Normal' },
    { input: "john_doe", label: 'normal', cat: 'Normal' },
    { input: "password123", label: 'normal', cat: 'Normal' },
    { input: "Hello World", label: 'normal', cat: 'Normal' },
    { input: "1 OR 1=1", label: 'sqli', cat: 'Tautology' },
    { input: "' UNION ALL SELECT NULL--", label: 'sqli', cat: 'Union' },
    { input: "'; WAITFOR DELAY '0:0:5'--", label: 'sqli', cat: 'Time-based' },
    { input: "admin' AND SUBSTRING(@@version,1,1)='5", label: 'sqli', cat: 'Blind' },
    { input: "test_user_2024", label: 'normal', cat: 'Normal' },
    { input: "my.email+tag@domain.co", label: 'normal', cat: 'Normal' },
    { input: "1'; EXEC xp_cmdshell('dir');--", label: 'sqli', cat: 'Command' },
    { input: "' HAVING 1=1--", label: 'sqli', cat: 'Error-based' },
    { input: "Robert'); DROP TABLE students;--", label: 'sqli', cat: 'Piggyback' },
    { input: "search term here", label: 'normal', cat: 'Normal' }
  ],

  model: {
    trained: true, accuracy: 96.8, epochs: 50,
    lastTrained: '2026-02-25', samples: 20,
    f1: 0.95, precision: 97.2, recall: 96.4
  },

  currentUser: null,
  nextId: 6,
  checkoutStep: 1,
  checkoutData: {}
};
