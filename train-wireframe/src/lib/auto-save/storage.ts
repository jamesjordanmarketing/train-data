import { errorLogger } from '../errors/error-logger';

// Draft data interface
export interface Draft<T = any> {
  id: string;
  data: T;
  savedAt: string;
  expiresAt: string;
  version: number;
}

// Storage interface (abstraction for IndexedDB and localStorage)
interface DraftStorage {
  save<T>(id: string, data: T, expiresInHours?: number): Promise<void>;
  load<T>(id: string): Promise<Draft<T> | null>;
  delete(id: string): Promise<void>;
  list(): Promise<Draft[]>;
  clear(): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * IndexedDB-based draft storage.
 * Uses IndexedDB for modern browsers with localStorage fallback.
 */
class IndexedDBDraftStorage implements DraftStorage {
  private dbName = 'TrainingDataDrafts';
  private storeName = 'drafts';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  /**
   * Initialize IndexedDB connection.
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        errorLogger.error('Failed to open IndexedDB', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          objectStore.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });
  }
  
  /**
   * Save a draft to IndexedDB.
   */
  async save<T>(id: string, data: T, expiresInHours: number = 24): Promise<void> {
    try {
      const db = await this.initDB();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
      
      const draft: Draft<T> = {
        id,
        data,
        savedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        version: 1,
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.put(draft);
        
        request.onsuccess = () => {
          errorLogger.debug('Draft saved to IndexedDB', { id, size: JSON.stringify(data).length });
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to save draft to IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB save error', error, { id });
      throw error;
    }
  }
  
  /**
   * Load a draft from IndexedDB.
   */
  async load<T>(id: string): Promise<Draft<T> | null> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(id);
        
        request.onsuccess = () => {
          const draft = request.result as Draft<T> | undefined;
          
          if (!draft) {
            resolve(null);
            return;
          }
          
          // Check if expired
          if (new Date(draft.expiresAt) < new Date()) {
            errorLogger.debug('Draft expired, deleting', { id });
            this.delete(id); // Async delete, don't wait
            resolve(null);
            return;
          }
          
          errorLogger.debug('Draft loaded from IndexedDB', { id });
          resolve(draft);
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to load draft from IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB load error', error, { id });
      return null;
    }
  }
  
  /**
   * Delete a draft from IndexedDB.
   */
  async delete(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.delete(id);
        
        request.onsuccess = () => {
          errorLogger.debug('Draft deleted from IndexedDB', { id });
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to delete draft from IndexedDB', request.error, { id });
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB delete error', error, { id });
      throw error;
    }
  }
  
  /**
   * List all drafts in IndexedDB.
   */
  async list(): Promise<Draft[]> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
          const drafts = request.result as Draft[];
          const now = new Date();
          
          // Filter out expired drafts
          const validDrafts = drafts.filter(draft => new Date(draft.expiresAt) >= now);
          
          errorLogger.debug('Drafts listed from IndexedDB', { count: validDrafts.length });
          resolve(validDrafts);
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to list drafts from IndexedDB', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB list error', error);
      return [];
    }
  }
  
  /**
   * Clear all drafts from IndexedDB.
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.clear();
        
        request.onsuccess = () => {
          errorLogger.info('All drafts cleared from IndexedDB');
          resolve();
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to clear drafts from IndexedDB', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB clear error', error);
      throw error;
    }
  }
  
  /**
   * Clean up expired drafts.
   */
  async cleanup(): Promise<void> {
    try {
      const db = await this.initDB();
      const now = new Date().toISOString();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const index = objectStore.index('expiresAt');
        const request = index.openCursor(IDBKeyRange.upperBound(now));
        
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            errorLogger.info('Expired drafts cleaned up', { deletedCount });
            resolve();
          }
        };
        
        request.onerror = () => {
          errorLogger.error('Failed to cleanup expired drafts', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      errorLogger.error('IndexedDB cleanup error', error);
      throw error;
    }
  }
}

/**
 * LocalStorage-based draft storage (fallback for browsers without IndexedDB).
 */
class LocalStorageDraftStorage implements DraftStorage {
  private prefix = 'draft_';
  
  async save<T>(id: string, data: T, expiresInHours: number = 24): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const draft: Draft<T> = {
      id,
      data,
      savedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: 1,
    };
    
    try {
      localStorage.setItem(this.prefix + id, JSON.stringify(draft));
      errorLogger.debug('Draft saved to localStorage', { id });
    } catch (error) {
      errorLogger.error('Failed to save draft to localStorage', error, { id });
      throw error;
    }
  }
  
  async load<T>(id: string): Promise<Draft<T> | null> {
    try {
      const item = localStorage.getItem(this.prefix + id);
      
      if (!item) {
        return null;
      }
      
      const draft = JSON.parse(item) as Draft<T>;
      
      // Check if expired
      if (new Date(draft.expiresAt) < new Date()) {
        this.delete(id);
        return null;
      }
      
      errorLogger.debug('Draft loaded from localStorage', { id });
      return draft;
    } catch (error) {
      errorLogger.error('Failed to load draft from localStorage', error, { id });
      return null;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + id);
      errorLogger.debug('Draft deleted from localStorage', { id });
    } catch (error) {
      errorLogger.error('Failed to delete draft from localStorage', error, { id });
    }
  }
  
  async list(): Promise<Draft[]> {
    const drafts: Draft[] = [];
    const now = new Date();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const draft = JSON.parse(item) as Draft;
            
            // Filter out expired
            if (new Date(draft.expiresAt) >= now) {
              drafts.push(draft);
            } else {
              localStorage.removeItem(key); // Clean up expired
            }
          }
        } catch (error) {
          errorLogger.error('Failed to parse draft from localStorage', error, { key });
        }
      }
    }
    
    return drafts;
  }
  
  async clear(): Promise<void> {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    errorLogger.info('All drafts cleared from localStorage');
  }
  
  async cleanup(): Promise<void> {
    const now = new Date();
    let deletedCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const draft = JSON.parse(item) as Draft;
            
            if (new Date(draft.expiresAt) < now) {
              localStorage.removeItem(key);
              deletedCount++;
            }
          }
        } catch (error) {
          errorLogger.error('Failed to cleanup draft from localStorage', error, { key });
        }
      }
    }
    
    errorLogger.info('Expired drafts cleaned up from localStorage', { deletedCount });
  }
}

/**
 * Create the appropriate draft storage based on browser capabilities.
 */
function createDraftStorage(): DraftStorage {
  if (typeof window === 'undefined') {
    // Server-side: return no-op storage
    return {
      save: async () => {},
      load: async () => null,
      delete: async () => {},
      list: async () => [],
      clear: async () => {},
      cleanup: async () => {},
    };
  }
  
  // Check for IndexedDB support
  if ('indexedDB' in window) {
    return new IndexedDBDraftStorage();
  }
  
  // Fallback to localStorage
  return new LocalStorageDraftStorage();
}

// Export singleton instance
export const draftStorage = createDraftStorage();

// Schedule periodic cleanup (every hour)
if (typeof window !== 'undefined') {
  setInterval(() => {
    draftStorage.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}

