export type VisionStoredProject = {
  id: string;
  name: string;
  schema: 'abrxs.vision-project.v2';
  createdAt: string;
  updatedAt: string;
  payload: unknown;
};

const DB_NAME = 'abrxs-vision';
const DB_VERSION = 1;
const STORE = 'projects';
const LAST_PROJECT_KEY = 'abrxsVisionLastProjectIdV2';

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is not available in this runtime.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open Vision project store.'));
  });
}

export async function saveVisionProject(project: VisionStoredProject) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save Vision project.'));
    tx.onabort = () => reject(tx.error ?? new Error('Vision project save was aborted.'));
  });
  db.close();
  localStorage.setItem(LAST_PROJECT_KEY, project.id);
}

export async function loadVisionProject(id: string): Promise<VisionStoredProject | null> {
  const db = await openDb();
  const value = await new Promise<VisionStoredProject | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as VisionStoredProject | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Could not load Vision project.'));
  });
  db.close();
  return value;
}

export async function loadLastVisionProject() {
  const id = localStorage.getItem(LAST_PROJECT_KEY);
  return id ? loadVisionProject(id) : null;
}

export async function listVisionProjects(): Promise<VisionStoredProject[]> {
  const db = await openDb();
  const values = await new Promise<VisionStoredProject[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as VisionStoredProject[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error('Could not list Vision projects.'));
  });
  db.close();
  return values.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteVisionProject(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not delete Vision project.'));
  });
  db.close();
}

export function validateVisionProject(value: unknown): value is VisionStoredProject {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VisionStoredProject>;
  return (
    candidate.schema === 'abrxs.vision-project.v2' &&
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    'payload' in candidate
  );
}
