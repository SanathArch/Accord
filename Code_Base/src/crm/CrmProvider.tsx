/* ══════════════════════════════════════════════════════════════
   CRM CONNECTION
   Source of unit availability, in order:
     1. live: the developer's spreadsheet, connected once with
        "Connect CRM file". Re-read every few seconds; a save in
        Excel recolours the building.
     2. snapshot: the copy taken when this build was made.
   The connected file is remembered; on the next visit the browser
   asks once to allow reading it again ("Reconnect").
   ══════════════════════════════════════════════════════════════ */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { inventoryFromRows, summarize, type Inventory } from '../engine/crm';
import { readWorkbook } from './xlsx';
import { idbGet, idbSet } from './idb';

const POLL_MS = 3000;
type Mode = 'snapshot' | 'live' | 'reconnect' | 'none';

interface FileHandle {
  name: string;
  getFile(): Promise<File>;
  queryPermission?(o: { mode: 'read' }): Promise<PermissionState>;
  requestPermission?(o: { mode: 'read' }): Promise<PermissionState>;
}
type Picker = (o: unknown) => Promise<FileHandle[]>;

interface Ctx {
  inventory: Inventory | null;
  mode: Mode;
  error: string | null;
  canLink: boolean;               // browser can keep a live link (Chrome, Edge)
  connect: () => Promise<void>;
  reconnect: () => Promise<void>;
  loadOnce: (f: File) => Promise<void>;
  counts: ReturnType<typeof summarize>;
}
const CrmContext = createContext<Ctx | null>(null);

export async function inventoryFromFile(f: File): Promise<Inventory> {
  const sheets = readWorkbook(await f.arrayBuffer());
  let lastErr: unknown = null;
  for (const s of sheets) {
    try { return inventoryFromRows(s.rows, f.name, new Date(f.lastModified).toISOString()); }
    catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error('No sheets in the file');
}

export function CrmProvider({ editionId, snapshot, onChange, children }:
  { editionId: string; snapshot: Inventory | null; onChange?: (msg: string) => void; children: ReactNode }) {
  const [inventory, setInventory] = useState<Inventory | null>(snapshot);
  const [mode, setMode] = useState<Mode>(snapshot ? 'snapshot' : 'none');
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<FileHandle | null>(null);
  const lastMod = useRef<number>(0);
  const timer = useRef<number>();
  const picker = (window as unknown as { showOpenFilePicker?: Picker }).showOpenFilePicker;
  const key = `crm-handle:${editionId}`;
  const notify = useRef(onChange); notify.current = onChange;

  const read = useCallback(async (announce: boolean) => {
    const h = handle.current; if (!h) return;
    try {
      const f = await h.getFile();
      if (f.lastModified === lastMod.current) return;
      const inv = await inventoryFromFile(f);
      lastMod.current = f.lastModified;
      setInventory(prev => {
        if (announce && prev) {
          const a = summarize(prev), b = summarize(inv);
          if (a.sold !== b.sold || a.blocked !== b.blocked) notify.current?.(`CRM updated: ${b.sold} sold, ${b.blocked} blocked`);
        }
        return inv;
      });
      setMode('live'); setError(null);
    } catch (e) {
      // a half-written save or a locked file: keep the last good reading and try again
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const start = useCallback(async (h: FileHandle) => {
    handle.current = h; lastMod.current = 0;
    await read(false);
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => read(true), POLL_MS);
  }, [read]);

  // remembered link from an earlier visit
  useEffect(() => {
    let alive = true;
    (async () => {
      const h = await idbGet<FileHandle>(key);
      if (!alive || !h) return;
      const p = h.queryPermission ? await h.queryPermission({ mode: 'read' }) : 'granted';
      if (p === 'granted') await start(h);
      else { handle.current = h; setMode('reconnect'); }
    })();
    return () => { alive = false; window.clearInterval(timer.current); };
  }, [key, start]);

  const connect = useCallback(async () => {
    if (!picker) return;
    try {
      const [h] = await picker({
        multiple: false,
        types: [{ description: 'CRM spreadsheet', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]
      });
      await idbSet(key, h);
      await start(h);
      notify.current?.(`Connected to ${h.name}`);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setError(e instanceof Error ? e.message : String(e));
    }
  }, [picker, key, start]);

  const reconnect = useCallback(async () => {
    const h = handle.current; if (!h) return connect();
    const p = h.requestPermission ? await h.requestPermission({ mode: 'read' }) : 'granted';
    if (p === 'granted') await start(h);
  }, [connect, start]);

  // browsers without a file link: read a chosen file once
  const loadOnce = useCallback(async (f: File) => {
    try { setInventory(await inventoryFromFile(f)); setMode('live'); setError(null); notify.current?.(`Read ${f.name}`); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }, []);

  const counts = useMemo(() => summarize(inventory), [inventory]);
  const value = useMemo(() => ({ inventory, mode, error, canLink: !!picker, connect, reconnect, loadOnce, counts }),
    [inventory, mode, error, picker, connect, reconnect, loadOnce, counts]);
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): Ctx {
  const c = useContext(CrmContext);
  if (!c) throw new Error('useCrm outside CrmProvider');
  return c;
}
