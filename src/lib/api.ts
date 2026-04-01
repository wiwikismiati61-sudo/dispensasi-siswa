import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  getDoc,
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export const api = {
  // Students
  async getStudents() {
    try {
      const q = query(collection(db, 'students'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'students');
    }
  },
  async addStudent(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'students'), data);
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    }
  },
  async deleteStudent(id: string) {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  },

  // Teachers
  async getTeachers(type: 'homeroom' | 'bk') {
    try {
      const q = query(collection(db, 'teachers'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((t: any) => t.type === type);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'teachers');
    }
  },
  async addTeacher(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'teachers'), data);
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'teachers');
    }
  },
  async deleteTeacher(id: string) {
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`);
    }
  },

  // Dispensation Types
  async getDispensationTypes() {
    try {
      const q = query(collection(db, 'dispensation_types'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'dispensation_types');
    }
  },
  async addDispensationType(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'dispensation_types'), data);
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dispensation_types');
    }
  },
  async deleteDispensationType(id: string) {
    try {
      await deleteDoc(doc(db, 'dispensation_types', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `dispensation_types/${id}`);
    }
  },

  // Dispensations
  async getDispensations() {
    try {
      const q = query(collection(db, 'dispensations'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const dispensations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // We need to join with students to get names
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsMap = new Map(studentsSnapshot.docs.map(doc => [doc.id, doc.data()]));

      return dispensations.map((d: any) => {
        const student: any = studentsMap.get(d.student_id);
        return {
          ...d,
          student_name: student?.name || 'Unknown',
          class_name: student?.class_name || 'Unknown',
          nis: student?.nis || '-'
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'dispensations');
    }
  },
  async addDispensation(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'dispensations'), data);
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dispensations');
    }
  },
  async updateDispensation(id: string, data: any) {
    try {
      await updateDoc(doc(db, 'dispensations', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dispensations/${id}`);
    }
  },
  async deleteDispensation(id: string) {
    try {
      await deleteDoc(doc(db, 'dispensations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `dispensations/${id}`);
    }
  },
  async uploadProof(file: File) {
    try {
      const storageRef = ref(storage, `proofs/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading proof:", error);
      throw error;
    }
  },

  // Dashboard Stats
  async getDashboardStats() {
    try {
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const dispensationsSnapshot = await getDocs(collection(db, 'dispensations'));
      
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dispensations = dispensationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalStudents = students.length;
      const totalDispensations = dispensations.length;
      
      const frequentStudentsMap: Record<string, number> = {};
      dispensations.forEach((d: any) => {
        const id = d.student_id;
        if (id) {
          frequentStudentsMap[id] = (frequentStudentsMap[id] || 0) + 1;
        }
      });
      
      const frequentStudents = Object.entries(frequentStudentsMap)
        .map(([id, count]) => {
          const student: any = students.find((s: any) => s.id === id);
          return { name: student?.name || 'Unknown', class_name: student?.class_name || 'Unknown', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const typeStatsMap: Record<string, number> = {};
      dispensations.forEach((d: any) => {
        typeStatsMap[d.type] = (typeStatsMap[d.type] || 0) + 1;
      });
      const typeStats = Object.entries(typeStatsMap).map(([type, count]) => ({ type, count }));

      const classStatsMap: Record<string, number> = {};
      dispensations.forEach((d: any) => {
        const student: any = students.find((s: any) => s.id === d.student_id);
        if (student) {
          classStatsMap[student.class_name] = (classStatsMap[student.class_name] || 0) + 1;
        }
      });
      const classStats = Object.entries(classStatsMap)
        .map(([class_name, count]) => ({ class_name, count }))
        .sort((a, b) => a.class_name.localeCompare(b.class_name));

      const uniqueStudentsWithDispensation = Object.keys(frequentStudentsMap).length;
      const percentage = totalStudents > 0 ? ((uniqueStudentsWithDispensation / totalStudents) * 100).toFixed(2) : 0;

      return {
        totalStudents,
        totalDispensations,
        frequentStudents,
        typeStats,
        classStats,
        percentage
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'dashboard');
    }
  }
};
