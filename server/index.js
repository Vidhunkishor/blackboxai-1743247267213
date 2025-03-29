const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./database/attendance.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    credential_id TEXT,
    public_key TEXT
  )`);
});

// Student routes
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/students', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run('INSERT INTO students (name) VALUES (?)', [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

app.put('/students/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run('UPDATE students SET name = ? WHERE id = ?', [name, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, name });
  });
});

app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Student deleted' });
  });
});

// Attendance routes
app.get('/attendance', (req, res) => {
  const { studentId, date } = req.query;
  db.get(
    'SELECT * FROM attendance WHERE student_id = ? AND date = ?',
    [studentId, date],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || { status: 'absent' });
    }
  );
});

app.post('/attendance', (req, res) => {
  const { studentId, date, status } = req.body;
  db.run(
    `INSERT OR REPLACE INTO attendance (student_id, date, status) 
     VALUES (?, ?, ?)`,
    [studentId, date, status],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ studentId, date, status });
    }
  );
});

// Admin routes
app.post('/admin/register', (req, res) => {
  const { username } = req.body;
  // In a real app, you would generate proper WebAuthn options
  res.json({
    publicKeyCredentialCreationOptions: {
      challenge: Buffer.from('random-challenge').toString('base64'),
      rp: { name: 'Attendance App' },
      user: {
        id: Buffer.from(username).toString('base64'),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'direct'
    }
  });
});

app.post('/admin/register/complete', (req, res) => {
  const { username, credential } = req.body;
  // In a real app, you would verify the credential and store it
  db.run(
    'INSERT INTO admins (username, credential_id, public_key) VALUES (?, ?, ?)',
    [username, credential.id, JSON.stringify(credential.response)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.post('/admin/login', (req, res) => {
  const { username } = req.body;
  // In a real app, you would fetch the stored credential for this user
  res.json({
    publicKeyCredentialRequestOptions: {
      challenge: Buffer.from('random-challenge').toString('base64'),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: [{
        type: 'public-key',
        id: Buffer.from('stored-credential-id').toString('base64'),
      }]
    }
  });
});

app.post('/admin/login/verify', (req, res) => {
  const { username, credential } = req.body;
  // In a real app, you would verify the credential against stored data
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;