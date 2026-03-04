import express from 'express';
import { createServer as createViteServer } from 'vite';
import { sql } from '@vercel/postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize DB schema
async function initDB() {
  if (!process.env.POSTGRES_URL) {
    console.warn('⚠️ POSTGRES_URL environment variable is not set. Database will not work until configured.');
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      );
    `;
    await sql`
      INSERT INTO users (username, password) VALUES ('admin', 'admin123') ON CONFLICT (username) DO NOTHING;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        nis VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        class_name VARCHAR(255)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS dispensations (
        id SERIAL PRIMARY KEY,
        date VARCHAR(255),
        time VARCHAR(255),
        student_id INTEGER REFERENCES students(id),
        type VARCHAR(255),
        reason TEXT,
        homeroom_teacher VARCHAR(255),
        bk_teacher VARCHAR(255),
        follow_up TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS homeroom_teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bk_teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS dispensation_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255)
      );
    `;

    await sql`
      INSERT INTO dispensation_types (name, category) VALUES 
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
        ('kondisi sosial tertentu', 'Dispensasi Khusus /Kondisional')
      ON CONFLICT (name) DO NOTHING;
    `;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Call initDB on startup
initDB();

// API Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, username: rows[0].username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const { rowCount } = await sql`UPDATE users SET password = ${newPassword} WHERE username = ${username} AND password = ${oldPassword}`;
    if (rowCount > 0) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid old password or username' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Students
app.get('/api/students', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM students`;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { nis, name, class_name } = req.body;
  try {
    const { rows } = await sql`INSERT INTO students (nis, name, class_name) VALUES (${nis}, ${name}, ${class_name}) RETURNING id`;
    res.json({ success: true, id: rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/students/import', async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  try {
    for (const student of students) {
      await sql`
        INSERT INTO students (nis, name, class_name) 
        VALUES (${student.nis}, ${student.name}, ${student.class_name})
        ON CONFLICT (nis) DO UPDATE SET name = EXCLUDED.name, class_name = EXCLUDED.class_name
      `;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await sql`DELETE FROM students WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Homeroom Teachers
app.get('/api/homeroom-teachers', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM homeroom_teachers`;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/homeroom-teachers', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await sql`INSERT INTO homeroom_teachers (name) VALUES (${name}) RETURNING id`;
    res.json({ success: true, id: rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/homeroom-teachers/import', async (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) return res.status(400).json({ success: false, message: 'Invalid data' });
  
  try {
    for (const teacher of teachers) {
      await sql`INSERT INTO homeroom_teachers (name) VALUES (${teacher.name}) ON CONFLICT (name) DO NOTHING`;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/homeroom-teachers/:id', async (req, res) => {
  try {
    await sql`DELETE FROM homeroom_teachers WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// BK Teachers
app.get('/api/bk-teachers', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM bk_teachers`;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/bk-teachers', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await sql`INSERT INTO bk_teachers (name) VALUES (${name}) RETURNING id`;
    res.json({ success: true, id: rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/bk-teachers/import', async (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) return res.status(400).json({ success: false, message: 'Invalid data' });
  
  try {
    for (const teacher of teachers) {
      await sql`INSERT INTO bk_teachers (name) VALUES (${teacher.name}) ON CONFLICT (name) DO NOTHING`;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/bk-teachers/:id', async (req, res) => {
  try {
    await sql`DELETE FROM bk_teachers WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dispensation Types
app.get('/api/dispensation-types', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM dispensation_types`;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensation-types', async (req, res) => {
  const { name, category } = req.body;
  try {
    const { rows } = await sql`INSERT INTO dispensation_types (name, category) VALUES (${name}, ${category}) RETURNING id`;
    res.json({ success: true, id: rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensation-types/import', async (req, res) => {
  const { types } = req.body;
  if (!types || !Array.isArray(types)) return res.status(400).json({ success: false, message: 'Invalid data' });
  
  try {
    for (const type of types) {
      await sql`INSERT INTO dispensation_types (name, category) VALUES (${type.name}, ${type.category}) ON CONFLICT (name) DO NOTHING`;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensation-types/:id', async (req, res) => {
  try {
    await sql`DELETE FROM dispensation_types WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dispensations
app.get('/api/dispensations', async (req, res) => {
  try {
    const { rows } = await sql`
      SELECT d.*, s.name as student_name, s.class_name, s.nis
      FROM dispensations d
      JOIN students s ON d.student_id = s.id
      ORDER BY d.date DESC, d.time DESC
    `;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensations', async (req, res) => {
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    const { rows } = await sql`
      INSERT INTO dispensations (date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up)
      VALUES (${date}, ${time}, ${student_id}, ${type}, ${reason}, ${homeroom_teacher}, ${bk_teacher}, ${follow_up})
      RETURNING id
    `;
    res.json({ success: true, id: rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensations/:id', async (req, res) => {
  try {
    await sql`DELETE FROM dispensations WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/dispensations/:id', async (req, res) => {
  const { id } = req.params;
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    await sql`
      UPDATE dispensations 
      SET date = ${date}, time = ${time}, student_id = ${student_id}, type = ${type}, reason = ${reason}, homeroom_teacher = ${homeroom_teacher}, bk_teacher = ${bk_teacher}, follow_up = ${follow_up}
      WHERE id = ${id}
    `;
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const { rows: studentRows } = await sql`SELECT COUNT(*) as count FROM students`;
    const totalStudents = parseInt(studentRows[0].count, 10);
    
    const { rows: dispRows } = await sql`SELECT COUNT(*) as count FROM dispensations`;
    const totalDispensations = parseInt(dispRows[0].count, 10);
    
    const { rows: frequentStudents } = await sql`
      SELECT s.name, s.class_name, COUNT(d.id) as count
      FROM dispensations d
      JOIN students s ON d.student_id = s.id
      GROUP BY s.id, s.name, s.class_name
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const { rows: typeStats } = await sql`
      SELECT type, COUNT(*) as count
      FROM dispensations
      GROUP BY type
    `;

    const { rows: classStats } = await sql`
      SELECT s.class_name, COUNT(d.id) as count
      FROM dispensations d
      JOIN students s ON d.student_id = s.id
      GROUP BY s.class_name
      ORDER BY s.class_name
    `;

    const { rows: uniqueStudentRows } = await sql`SELECT COUNT(DISTINCT student_id) as count FROM dispensations`;
    const uniqueStudentsWithDispensation = parseInt(uniqueStudentRows[0].count, 10);
    const percentage = totalStudents > 0 ? ((uniqueStudentsWithDispensation / totalStudents) * 100).toFixed(2) : 0;

    res.json({
      totalStudents,
      totalDispensations,
      frequentStudents: frequentStudents.map(r => ({ ...r, count: parseInt(r.count, 10) })),
      typeStats: typeStats.map(r => ({ ...r, count: parseInt(r.count, 10) })),
      classStats: classStats.map(r => ({ ...r, count: parseInt(r.count, 10) })),
      percentage
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backup & Restore
app.get('/api/backup', (req, res) => {
  res.status(501).json({ success: false, message: 'Backup file tidak didukung di Vercel Postgres. Silakan gunakan fitur export Excel.' });
});

app.post('/api/restore', (req, res) => {
  res.status(501).json({ success: false, message: 'Restore file tidak didukung di Vercel Postgres. Silakan gunakan fitur import Excel.' });
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

  // Only start the server if we are not running in a serverless environment (like Vercel)
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
