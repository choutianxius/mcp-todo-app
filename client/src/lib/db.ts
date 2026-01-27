import type { Todo } from '@/types/todo';

const DB_NAME = 'mcp-todo-db';
const DB_VERSION = 1;
const STORE_NAME = 'todos';

class TodoDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('completed', 'completed', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
  }

  async getAll(): Promise<Todo[]> {
    const store = this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(id: string): Promise<Todo | undefined> {
    const store = this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(todo: Todo): Promise<string> {
    const store = this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(todo);
      request.onsuccess = () => resolve(todo.id);
      request.onerror = () => reject(request.error);
    });
  }

  async update(todo: Todo): Promise<void> {
    const store = this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(todo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const store = this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const store = this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const todoDB = new TodoDB();
