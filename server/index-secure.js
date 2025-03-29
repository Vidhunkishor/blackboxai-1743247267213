const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createToken, verifyToken, hashPassword, verifyPassword } = require('./middleware/auth');

const app = express();
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10kb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});
app.use('/admin', authLimiter);

// Database setup
const db = new sqlite3.Database('./database/attendance.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    student_id INTEGER,
    date TEXT,
    present BOOLEAN,
    PRIMARY KEY (student_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`);
});

// Admin routes
app.post('/admin/setup', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const passwordHash = await hashPassword(password);
    db.run(
      'INSERT OR REPLACE INTO admins (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
app.post('/admin/login/password', async (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = createToken(admin.id);
    res.json({ success: true, token });
  });
});

// Student routes (protected)
app.get('/students', verifyToken, (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/students', verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  db.run('INSERT INTO students (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// Attendance routes (protected)
app.get('/attendance', verifyToken, (req, res) => {
  const { studentId, date } = req.query;
  
  db.get(
    'SELECT * FROM attendance WHERE student_id = ? AND date = ?',
    [studentId, date],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || { present: null });
    }
  );
});

app.post('/attendance', verifyToken, (req, res) => {
  const { studentId, date, status } = req.body;
  
  db.run(
    'INSERT OR REPLACE INTO attendance (student_id, date, status) VALUES (?, ?, ?)',
    [studentId, date, status],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;