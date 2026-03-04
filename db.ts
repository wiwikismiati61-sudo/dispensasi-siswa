import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.json');

class JSONDatabase {
  public data: any;
  private saveTimeout: any = null;

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(dbPath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse database.json, initializing empty DB');
        this.initEmpty();
      }
    } else {
      this.initEmpty();
    }
  }

  private initEmpty() {
    this.data = {
      users: [{ id: 1, username: 'admin', password: 'admin123' }],
      students: [],
      dispensations: [],
      homeroom_teachers: [],
      bk_teachers: [],
      dispensation_types: [
        { id: 1, name: 'Ada anggota keluarga sakit/meninggal', category: 'Dispensasi Keluarga' },
        { id: 2, name: 'Ada acara keluarga', category: 'Dispensasi Keluarga' },
        { id: 3, name: 'Lomba Akademik/ non Akademik', category: 'Dispensasi Kegiatan Sekolah' },
        { id: 4, name: 'Ekstrakurikuler', category: 'Dispensasi Kegiatan Sekolah' },
        { id: 5, name: 'Kegiatan Keagamaan', category: 'Dispensasi Kegiatan Sekolah' },
        { id: 6, name: 'Siswa mewakili sekolah dalam kegiatan yang di undang oleh Dinas Pendidikan', category: 'Dispensasi Kegiatan Dinas/Undangan resmi' },
        { id: 7, name: 'Kementerian Agama', category: 'Dispensasi Kegiatan Dinas/Undangan resmi' },
        { id: 8, name: 'Instansi Pemerintah Lainnya', category: 'Dispensasi Kegiatan Dinas/Undangan resmi' },
        { id: 9, name: 'Siswa Atlet yang latihan intensif', category: 'Dispensasi Khusus /Kondisional' },
        { id: 10, name: 'siswa mengikuti audisi /kompetisi di luar sekolah', category: 'Dispensasi Khusus /Kondisional' },
        { id: 11, name: 'kondisi sosial tertentu', category: 'Dispensasi Khusus /Kondisional' }
      ]
    };
    this.saveSync();
  }

  private saveSync() {
    fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
  }

  public save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      fs.writeFile(dbPath, JSON.stringify(this.data), (err) => {
        if (err) console.error('Failed to save database.json', err);
      });
    }, 100);
  }
}

export const db = new JSONDatabase();
