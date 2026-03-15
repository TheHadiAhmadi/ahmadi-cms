const DB_NAME = 'ahmadi-cms';
const DB_VERSION = 1;
const STORE_NAME = 'pending-changes';

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('repo', 'repo', { unique: false });
        store.createIndex('path', 'path', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

export interface PendingChange {
  id: string;
  repo: string;
  path: string;
  type: 'edit' | 'upload' | 'delete';
  content?: string;
  sha?: string;
  fileName?: string;
  mimeType?: string;
  message?: string;
  updatedAt: number;
}

export async function savePendingChange(change: Omit<PendingChange, 'updatedAt'>): Promise<void> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const fullChange: PendingChange = {
      ...change,
      updatedAt: Date.now()
    };
    
    const request = store.put(fullChange);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPendingChanges(repo?: string): Promise<PendingChange[]> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    let request: IDBRequest<PendingChange[]>;
    
    if (repo) {
      const index = store.index('repo');
      request = index.getAll(repo);
    } else {
      request = store.getAll();
    }
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(results);
    };
  });
}

export async function getPendingChange(id: string): Promise<PendingChange | undefined> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deletePendingChange(id: string): Promise<void> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deletePendingChanges(ids: string[]): Promise<void> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    ids.forEach(id => store.delete(id));
    
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

export async function clearPendingChanges(repo?: string): Promise<void> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    if (repo) {
      const index = store.index('repo');
      const request = index.openCursor(repo);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    } else {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }
  });
}

export function generateChangeId(repo: string, path: string): string {
  return `${repo}:${path}:${Date.now()}`;
}
