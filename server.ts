import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.data.users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/change-password', (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const userIndex = db.data.users.findIndex((u: any) => u.username === username && u.password === oldPassword);
    if (userIndex !== -1) {
      db.data.users[userIndex].password = newPassword;
      db.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid old password or username' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Students
app.get('/api/students', (req, res) => {
  try {
    res.json(db.data.students);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/students', (req, res) => {
  const { nis, name, class_name } = req.body;
  try {
    if (db.data.students.some((s: any) => s.nis === nis)) {
      return res.status(400).json({ success: false, message: 'NIS already exists' });
    }
    const id = db.data.students.length > 0 ? Math.max(...db.data.students.map((s: any) => s.id)) + 1 : 1;
    db.data.students.push({ id, nis, name, class_name });
    db.save();
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/students/import', (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  try {
    for (const student of students) {
      const existingIndex = db.data.students.findIndex((s: any) => s.nis === student.nis);
      if (existingIndex !== -1) {
        db.data.students[existingIndex] = { ...db.data.students[existingIndex], ...student };
      } else {
        const id = db.data.students.length > 0 ? Math.max(...db.data.students.map((s: any) => s.id)) + 1 : 1;
        db.data.students.push({ id, ...student });
      }
    }
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.data.students = db.data.students.filter((s: any) => s.id !== id);
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Homeroom Teachers
app.get('/api/homeroom-teachers', (req, res) => {
  try {
    res.json(db.data.homeroom_teachers);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/homeroom-teachers', (req, res) => {
  const { name } = req.body;
  try {
    if (db.data.homeroom_teachers.some((t: any) => t.name === name)) {
      return res.status(400).json({ success: false, message: 'Name already exists' });
    }
    const id = db.data.homeroom_teachers.length > 0 ? Math.max(...db.data.homeroom_teachers.map((t: any) => t.id)) + 1 : 1;
    db.data.homeroom_teachers.push({ id, name });
    db.save();
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/homeroom-teachers/import', (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  try {
    for (const teacher of teachers) {
      if (!db.data.homeroom_teachers.some((t: any) => t.name === teacher.name)) {
        const id = db.data.homeroom_teachers.length > 0 ? Math.max(...db.data.homeroom_teachers.map((t: any) => t.id)) + 1 : 1;
        db.data.homeroom_teachers.push({ id, name: teacher.name });
      }
    }
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/homeroom-teachers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.data.homeroom_teachers = db.data.homeroom_teachers.filter((t: any) => t.id !== id);
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// BK Teachers
app.get('/api/bk-teachers', (req, res) => {
  try {
    res.json(db.data.bk_teachers);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/bk-teachers', (req, res) => {
  const { name } = req.body;
  try {
    if (db.data.bk_teachers.some((t: any) => t.name === name)) {
      return res.status(400).json({ success: false, message: 'Name already exists' });
    }
    const id = db.data.bk_teachers.length > 0 ? Math.max(...db.data.bk_teachers.map((t: any) => t.id)) + 1 : 1;
    db.data.bk_teachers.push({ id, name });
    db.save();
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/bk-teachers/import', (req, res) => {
  const { teachers } = req.body;
  if (!teachers || !Array.isArray(teachers)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  try {
    for (const teacher of teachers) {
      if (!db.data.bk_teachers.some((t: any) => t.name === teacher.name)) {
        const id = db.data.bk_teachers.length > 0 ? Math.max(...db.data.bk_teachers.map((t: any) => t.id)) + 1 : 1;
        db.data.bk_teachers.push({ id, name: teacher.name });
      }
    }
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/bk-teachers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.data.bk_teachers = db.data.bk_teachers.filter((t: any) => t.id !== id);
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dispensation Types
app.get('/api/dispensation-types', (req, res) => {
  try {
    res.json(db.data.dispensation_types);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensation-types', (req, res) => {
  const { name, category } = req.body;
  try {
    if (db.data.dispensation_types.some((t: any) => t.name === name)) {
      return res.status(400).json({ success: false, message: 'Name already exists' });
    }
    const id = db.data.dispensation_types.length > 0 ? Math.max(...db.data.dispensation_types.map((t: any) => t.id)) + 1 : 1;
    db.data.dispensation_types.push({ id, name, category });
    db.save();
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensation-types/import', (req, res) => {
  const { types } = req.body;
  if (!types || !Array.isArray(types)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  
  try {
    for (const type of types) {
      if (!db.data.dispensation_types.some((t: any) => t.name === type.name)) {
        const id = db.data.dispensation_types.length > 0 ? Math.max(...db.data.dispensation_types.map((t: any) => t.id)) + 1 : 1;
        db.data.dispensation_types.push({ id, name: type.name, category: type.category });
      }
    }
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensation-types/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.data.dispensation_types = db.data.dispensation_types.filter((t: any) => t.id !== id);
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dispensations
app.get('/api/dispensations', (req, res) => {
  try {
    const dispensations = db.data.dispensations.map((d: any) => {
      const student = db.data.students.find((s: any) => s.id.toString() === d.student_id?.toString());
      return {
        ...d,
        student_name: student?.name || 'Unknown',
        class_name: student?.class_name || 'Unknown',
        nis: student?.nis || '-'
      };
    }).sort((a: any, b: any) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
    res.json(dispensations);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/dispensations', (req, res) => {
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    const id = db.data.dispensations.length > 0 ? Math.max(...db.data.dispensations.map((d: any) => d.id)) + 1 : 1;
    db.data.dispensations.push({
      id, date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up
    });
    db.save();
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/dispensations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.data.dispensations = db.data.dispensations.filter((d: any) => d.id !== id);
    db.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/dispensations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up } = req.body;
  try {
    const index = db.data.dispensations.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      db.data.dispensations[index] = {
        id, date, time, student_id, type, reason, homeroom_teacher, bk_teacher, follow_up
      };
      db.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Dispensation not found' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  try {
    const totalStudents = db.data.students.length;
    const totalDispensations = db.data.dispensations.length;
    
    const frequentStudentsMap: Record<string, number> = {};
    db.data.dispensations.forEach((d: any) => {
      const id = d.student_id?.toString();
      if (id) {
        frequentStudentsMap[id] = (frequentStudentsMap[id] || 0) + 1;
      }
    });
    
    const frequentStudents = Object.entries(frequentStudentsMap)
      .map(([id, count]) => {
        const student = db.data.students.find((s: any) => s.id.toString() === id);
        return { name: student?.name || 'Unknown', class_name: student?.class_name || 'Unknown', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const typeStatsMap: Record<string, number> = {};
    db.data.dispensations.forEach((d: any) => {
      typeStatsMap[d.type] = (typeStatsMap[d.type] || 0) + 1;
    });
    const typeStats = Object.entries(typeStatsMap).map(([type, count]) => ({ type, count }));

    const classStatsMap: Record<string, number> = {};
    db.data.dispensations.forEach((d: any) => {
      const student = db.data.students.find((s: any) => s.id.toString() === d.student_id?.toString());
      if (student) {
        classStatsMap[student.class_name] = (classStatsMap[student.class_name] || 0) + 1;
      }
    });
    const classStats = Object.entries(classStatsMap)
      .map(([class_name, count]) => ({ class_name, count }))
      .sort((a, b) => a.class_name.localeCompare(b.class_name));

    const uniqueStudentsWithDispensation = Object.keys(frequentStudentsMap).length;
    const percentage = totalStudents > 0 ? ((uniqueStudentsWithDispensation / totalStudents) * 100).toFixed(2) : 0;

    res.json({
      totalStudents,
      totalDispensations,
      frequentStudents,
      typeStats,
      classStats,
      percentage
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backup & Restore
const upload = multer({ dest: 'uploads/' });

app.get('/api/backup', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dbPath)) {
      res.download(dbPath, 'database.json');
    } else {
      res.status(404).json({ success: false, message: 'Database file not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/restore', upload.single('database'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const dbPath = path.join(__dirname, 'database.json');
    fs.copyFileSync(req.file.path, dbPath);
    fs.unlinkSync(req.file.path);
    
    // Reload data into memory
    db.data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    res.json({ success: true, message: 'Database restored successfully.' });
  } catch (error: any) {
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

  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
