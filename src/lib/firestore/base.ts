import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  Timestamp,
  serverTimestamp,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FirestoreDocument } from './types';

// Convert Date to Timestamp for Firestore
export const toTimestamp = (date: Date | Timestamp | undefined): Timestamp | undefined => {
  if (!date) return undefined;
  if (date instanceof Timestamp) return date;
  return Timestamp.fromDate(date);
};

// Convert Timestamp to Date for application use
export const toDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

// Prepare document for Firestore (add timestamps, convert dates)
export const prepareDocument = <T extends FirestoreDocument>(
  data: T,
  isNew: boolean = true
): DocumentData => {
  const { id, ...docData } = data;
  
  const prepared: any = { ...docData };
  
  // Add timestamps
  if (isNew) {
    prepared.createdAt = serverTimestamp();
    prepared.updatedAt = serverTimestamp();
  } else {
    prepared.updatedAt = serverTimestamp();
  }
  
  // Convert Date objects to Timestamps
  Object.keys(prepared).forEach(key => {
    if (prepared[key] instanceof Date) {
      prepared[key] = Timestamp.fromDate(prepared[key]);
    }
  });
  
  return prepared;
};

// Parse document from Firestore (convert timestamps to dates)
export const parseDocument = <T extends FirestoreDocument>(
  id: string,
  data: DocumentData
): T => {
  const parsed: any = { id, ...data };
  
  // Convert Timestamps to Dates
  Object.keys(parsed).forEach(key => {
    if (parsed[key] instanceof Timestamp) {
      parsed[key] = parsed[key].toDate();
    }
  });
  
  return parsed as T;
};

// Base CRUD operations
export class FirestoreService {
  // Check if Firestore is available
  private static checkDb() {
    if (!db) {
      throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
    }
  }

  private static getStorage() {
    const storage = getStorage();
    if (!storage) {
      throw new Error('Storage is not initialized. Please check your Firebase configuration.');
    }
    return storage;
  }

  private static getAuth() {
    const auth = getAuth();
    if (!auth) {
      throw new Error('Auth is not initialized. Please check your Firebase configuration.');
    }
    return auth;
  }

  // Create a document
  static async create<T extends FirestoreDocument>(
    collectionName: string,
    data: T,
    customId?: string
  ): Promise<T> {
    this.checkDb();
    
    const collectionRef = collection(db, collectionName);
    const docRef = customId ? doc(collectionRef, customId) : doc(collectionRef);
    const prepared = prepareDocument(data, true);
    
    await setDoc(docRef, prepared);
    
    return { ...data, id: docRef.id };
  }

  // Get a document by ID
  static async get<T extends FirestoreDocument>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    this.checkDb();
    
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return parseDocument<T>(docSnap.id, docSnap.data());
  }

  // Update a document
  static async update<T extends FirestoreDocument>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    this.checkDb();
    
    const docRef = doc(db, collectionName, docId);
    const { id, ...updateData } = data;
    const prepared = prepareDocument(updateData as T, false);
    
    await updateDoc(docRef, prepared);
  }

  // Delete a document
  static async delete(collectionName: string, docId: string): Promise<void> {
    this.checkDb();
    
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }

  // Query documents
  static async query<T extends FirestoreDocument>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    this.checkDb();
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push(parseDocument<T>(doc.id, doc.data()));
    });
    
    return results;
  }

  // List documents with pagination
  static async list<T extends FirestoreDocument>(
    collectionName: string,
    options: {
      userId?: string;
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      limitCount?: number;
      startAfterId?: string;
    } = {}
  ): Promise<{ data: T[]; lastDoc: string | null }> {
    this.checkDb();
    
    const {
      userId,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      limitCount = 20,
      startAfterId,
    } = options;
    
    const constraints: QueryConstraint[] = [];
    
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount + 1)); // Fetch one extra to check if there are more
    
    if (startAfterId) {
      const startDoc = await this.get(collectionName, startAfterId);
      if (startDoc) {
        constraints.push(startAfter(startDoc[orderByField as keyof typeof startDoc]));
      }
    }
    
    const results = await this.query<T>(collectionName, constraints);
    
    // Check if there are more results
    const hasMore = results.length > limitCount;
    const data = hasMore ? results.slice(0, -1) : results;
    const lastDoc = data.length > 0 ? data[data.length - 1].id || null : null;
    
    return { data, lastDoc: hasMore ? lastDoc : null };
  }

  // Batch operations
  static async batchCreate<T extends FirestoreDocument>(
    collectionName: string,
    documents: T[]
  ): Promise<void> {
    this.checkDb();
    
    const batch = writeBatch(db);
    const collectionRef = collection(db, collectionName);
    
    documents.forEach((document) => {
      const docRef = doc(collectionRef);
      const prepared = prepareDocument(document, true);
      batch.set(docRef, prepared);
    });
    
    await batch.commit();
  }

  // Batch update
  static async batchUpdate<T extends FirestoreDocument>(
    collectionName: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<void> {
    this.checkDb();
    
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, collectionName, id);
      const { id: _, ...updateData } = data;
      const prepared = prepareDocument(updateData as T, false);
      batch.update(docRef, prepared);
    });
    
    await batch.commit();
  }

  // Batch delete
  static async batchDelete(
    collectionName: string,
    docIds: string[]
  ): Promise<void> {
    this.checkDb();
    
    const batch = writeBatch(db);
    
    docIds.forEach((docId) => {
      const docRef = doc(db, collectionName, docId);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }
} 