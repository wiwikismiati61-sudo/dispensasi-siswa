import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Setup Database
const dbPath = path.join(__dirname, 'database.sqlite');
let db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123');

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nis TEXT UNIQUE,
    name TEXT,
    class_name TEXT
  );

  CREATE TABLE IF NOT EXISTS dispensations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    student_id INTEGER,
    type TEXT,
    reason TEXT,
    homeroom_teacher TEXT,
    bk_teacher TEXT,
    follow_up TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS homeroom_teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS bk_teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS dispensation_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    category TEXT
  );

  INSERT OR IGNORE INTO dispensation_types (name, category) VALUES 
    ('Ada anggota keluarga sakit/meninggal', 'Dispensasi Keluarga'),
    ('Ada acara keluarga', 'Dispensasi Keluarga'),
    ('Lomba Akademik/ non Akademik', 'Dispensasi Kegiatan Sekolah'),
    ('Ekstrakurikuler', 'Dispensasi Kegiatan Sekolah'),
    ('Kegiatan Keagamaan', 'Dispensasi Kegiatan Sekolah'),
    ('Siswa mewakili sekolah dalam kegiatan yang di undang oleh Dinas Pendidikan', 'Dispensasi Kegiatan Dinas/Undangan resmi'),
    ('Kementerian Agama', 'Dispensasi Kegiatan Dinas/Undangan resmi'),
    ('Instansi Pemerintah Lainnya', 'Dispensasi Kegiatan Dinas/Undangan resmi'),
    ('Siswa Atlet yang latihan intensif', 'Dispensasi Khusus /Kondisional'),
    ('siswa mengikuti audisi /kompetisi di luar sekolah', 'Dispensasi Khusus /Kondisional'),
    ('kondisi sosial tertentu', 'Dispensasi Khusus /Kondisional');
`);

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/change-password', (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const info = db.prepare('UPDATE users SET password = ? WHERE username = ? AND password = ?').run(newPassword, username, oldPassword);
  if (info.changes > 0) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid old password or username' });
  }
});

// Students
app.get('/api/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { nis, name, class_name } = req.body;
  try {
    const info = db.prepare('INSERT INTO students (nis, name, class_name) VALUES (?, ?, ?)').run(nis, name, class_name);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/students/import', (req, res) => {
  // We will handle the excel parsing on the client side and send JSON array here
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  const insert = db.prepare('INSERT OR REPLACE INTO students (nis, name, class_name) VALUES (?, ?, ?)');
  const insertMany = db.transaction((students) => {
    for (const student of students) {
      insert.run(student.nis, student.name, student.class_name);
    }
  });
  
  try {
    insertMany(students);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM students WHERE id = ?').run(id);
  res.json({ success: true });
});

// Homeroom Teachers
app.get('/api/homeroom-teachers', (req, res) => {
  const teachers = db.prepare('SELECT * FROM homeroom_teachers').all();
  res.json(teachers);
});

app.post('/api/homeroom-teachers', (req, res) => {
  const { name } = req.body;
  try {
    const info = db.prepare('INSERT INTO homeroom_teachers (name) VALUES (?)').run(name);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/homeroom-teachers/import', (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) return res.status(400).json({ success: false, message: 'Invalid data' });
  const insert = db.prepare('INSERT OR IGNORE INTO homeroom_teachers (name) VALUES (?)');
  const insertMany = db.transaction((teachers) => {
    for (const teacher of teachers) insert.run(teacher.name);
  });
  try {
    insertMany(teachers);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/homeroom-teachers/:id', (req, res) => {
  db.prepare('DELETE FROM homeroom_teachers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// BK Teachers
app.get('/api/bk-teachers', (req, res) => {
  const teachers = db.prepare('SELECT * FROM bk_teachers').all();
  res.json(teachers);
});

app.post('/api/bk-teachers', (req, res) => {
  const { name } = req.body;
  try {
    const info = db.prepare('INSERT INTO bk_teachers (name) VALUES (?)').run(name);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/bk-teachers/import', (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) return res.status(400).json({ success: false, message: 'Invalid data' });
  const insert = db.prepare('INSERT OR IGNORE INTO bk_teachers (name) VALUES (?)');
  const insertMany = db.transaction((teachers) => {
    for (const teacher of teachers) insert.run(teacher.name);
  });
  try {
    insertMany(teachers);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/bk-teachers/:id', (req, res) => {
  db.prepare('DELETE FROM bk_teachers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Dispensation Types
app.get('/api/dispensation-types', (req, res) => {
  const types = db.prepare('SELECT * FROM dispensation_types').all();
  res.json(types);
});

app.post('/api/dispensation-types', (req, res) => {
  const { name, category } = req.body;
  try {
    const info = db.prepare('INSERT INTO dispensation_types (name, category) VALUES (?, ?)').run(name, category);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensation-types/import', (req, res) => {
  const { types } = req.body;
  if (!types || !Array.isArray(types)) return res.status(400).json({ success: false, message: 'Invalid data' });
  const insert = db.prepare('INSERT OR IGNORE INTO dispensation_types (name, category) VALUES (?, ?)');
  const insertMany = db.transaction((types) => {
    for (const type of types) insert.run(type.name, type.category);
  });
  try {
    insertMany(types);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensation-types/:id', (req, res) => {
  db.prepare('DELETE FROM dispensation_types WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Dispensations
app.get('/api/dispensations', (req, res) => {
  const dispensations = db.prepare(`
    SELECT d.*, s.name as student_name, s.class_name, s.nis
    FROM dispensations d
    JOIN students s ON d.student_id = s.id
    ORDER BY d.date DESC, d.time DESC
  `).all();
  res.json(dispensations);
});

app.post('/api/dispensations', (req, res) => {
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    const info = db.prepare(`
      INSERT INTO dispensations (date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensations/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM dispensations WHERE id = ?').run(id);
  res.json({ success: true });
});

app.put('/api/dispensations/:id', (req, res) => {
  const { id } = req.params;
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    db.prepare(`
      UPDATE dispensations 
      SET date = ?, time = ?, student_id = ?, type = ?, reason = ?, homeroom_teacher = ?, bk_teacher = ?, follow_up = ?
      WHERE id = ?
    `).run(date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  const totalDispensations = db.prepare('SELECT COUNT(*) as count FROM dispensations').get().count;
  
  const frequentStudents = db.prepare(`
    SELECT s.name, s.class_name, COUNT(d.id) as count
    FROM dispensations d
    JOIN students s ON d.student_id = s.id
    GROUP BY s.id
    ORDER BY count DESC
    LIMIT 5
  `).all();
  
  const typeStats = db.prepare(`
    SELECT type, COUNT(*) as count
    FROM dispensations
    GROUP BY type
  `).all();

  const classStats = db.prepare(`
    SELECT s.class_name, COUNT(d.id) as count
    FROM dispensations d
    JOIN students s ON d.student_id = s.id
    GROUP BY s.class_name
    ORDER BY s.class_name
  `).all();

  const uniqueStudentsWithDispensation = db.prepare('SELECT COUNT(DISTINCT student_id) as count FROM dispensations').get().count;
  const percentage = totalStudents > 0 ? ((uniqueStudentsWithDispensation / totalStudents) * 100).toFixed(2) : 0;

  res.json({
    totalStudents,
    totalDispensations,
    frequentStudents,
    typeStats,
    classStats,
    percentage
  });
});

// Backup & Restore
app.get('/api/backup', (req, res) => {
  res.download(dbPath, 'database_backup.sqlite');
});

app.post('/api/restore', upload.single('database'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  try {
    db.close();
    fs.copyFileSync(req.file.path, dbPath);
    fs.unlinkSync(req.file.path);
    db = new Database(dbPath);
    res.json({ success: true, message: 'Database berhasil direstore.' });
  } catch (error: any) {
    try {
      db = new Database(dbPath); // Try to reopen if it failed
    } catch (e) {}
    res.status(500).json({ success: false, message: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
