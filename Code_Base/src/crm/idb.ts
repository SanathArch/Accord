/* Keeps the connected CRM file handle between visits (IndexedDB stores file handles). */
const DB = 'accord', STORE = 'kv';
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
export async function idbGet<T>(key: string): Promise<T | undefined> {
  try { const db = await open(); return await new Promise((res, rej) => {
    const q = db.transaction(STORE).objectStore(STORE).get(key); q.onsuccess = () => res(q.result as T); q.onerror = () => rej(q.error); });
  } catch { return undefined; }
}
export async function idbSet(key: string, val: unknown): Promise<void> {
  try { const db = await open(); await new Promise<void>((res, rej) => {
    const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(val, key); t.oncomplete = () => res(); t.onerror = () => rej(t.error); });
  } catch { /* storage unavailable: the connection lasts this visit only */ }
}
