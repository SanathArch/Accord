/* ══════════════════════════════════════════════════════════════
   SESSION RECORDER
   Saves everything the buyer selects as Excel, in the data folder
   (Accord_Structured/Data/Retreving_Data), while the session runs:
     · one workbook per session, rewritten after every selection
       Accord_<date>_<time>_<buyer>_<unit ref>.xlsx
     · Accord_All_Sessions.xlsx, one row per session, updated in place
   The folder is chosen once with "Connect data folder" (Chrome, Edge)
   and remembered; on a later visit the browser asks once to allow
   writing to it again (the app asks when Begin is pressed).
   Browsers that cannot write to a folder get "Download Excel".
   ══════════════════════════════════════════════════════════════ */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSession } from '../state/SessionProvider';
import { useCrm } from '../crm/CrmProvider';
import { statusOf } from '../engine/crm';
import { idbGet, idbSet } from '../crm/idb';
import { readWorkbook } from '../crm/xlsx';
import { VIEW } from '../state/view';
import type { Edition } from '../engine/types';
import type { SessionState } from '../engine/session';
import { writeWorkbook, type Cell } from './xlsxWrite';
import { SUMMARY_COLS, sessionFileName, sessionId, sessionWorkbook, summaryRow, type RecordContext } from './sessionWorkbook';

export const DATA_FOLDER = 'Retreving_Data';
export const DATA_FOLDER_PATH = 'Accord_Structured\\Data\\Retreving_Data';
export const ALL_SESSIONS_FILE = 'Accord_All_Sessions.xlsx';
const DEBOUNCE_MS = 700;
const IDB_KEY = 'data-folder';

type Mode = 'unsupported' | 'none' | 'reconnect' | 'ready';
type Perm = { mode: 'readwrite' };
interface Writable { write(d: BufferSource | Blob): Promise<void>; close(): Promise<void>; }
interface FileH { getFile(): Promise<File>; createWritable(): Promise<Writable>; }
interface DirHandle {
  name: string;
  getFileHandle(n: string, o?: { create?: boolean }): Promise<FileH>;
  queryPermission?(o: Perm): Promise<PermissionState>;
  requestPermission?(o: Perm): Promise<PermissionState>;
}
type DirPicker = (o?: unknown) => Promise<DirHandle>;

interface Snapshot { state: SessionState; edition: Edition; ctx: RecordContext; }

interface Ctx {
  mode: Mode;
  folder: string | null;
  lastSaved: { file: string; at: string } | null;
  error: string | null;
  connect: () => Promise<void>;
  reconnect: () => Promise<boolean>;
  download: () => void;
}
const RecorderContext = createContext<Ctx | null>(null);

async function writeFile(dir: DirHandle, name: string, bytes: Uint8Array) {
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(new Blob([bytes as BlobPart]));
  await w.close();
}

/** Read the All Sessions workbook (if any), replace or add this session's row, write it back. */
async function updateAllSessions(dir: DirHandle, snap: Snapshot) {
  let rows: Record<string, Cell>[] = [];
  let extra: string[] = [];
  try {
    const fh = await dir.getFileHandle(ALL_SESSIONS_FILE);
    const sheets = readWorkbook(await (await fh.getFile()).arrayBuffer());
    const sh = sheets.find(s => s.name === 'All sessions') ?? sheets[0];
    if (sh && sh.rows.length) {
      const head = sh.rows[0].map(h => String(h ?? ''));
      extra = head.filter(h => h && !(SUMMARY_COLS as readonly string[]).includes(h));   // columns someone added by hand
      rows = sh.rows.slice(1).filter(r => r.some(v => v != null && v !== '')).map(r => {
        const o: Record<string, Cell> = {};
        head.forEach((h, i) => { if (h) o[h] = r[i] as Cell; });
        return o;
      });
    }
  } catch { /* first session: the file does not exist yet */ }
  const mine = summaryRow(snap.state, snap.edition, snap.ctx);
  const at = rows.findIndex(r => r['Session ID'] === mine['Session ID']);
  if (at >= 0) rows[at] = { ...rows[at], ...mine }; else rows.push(mine);
  const cols = [...SUMMARY_COLS, ...extra];
  await writeFile(dir, ALL_SESSIONS_FILE, writeWorkbook([{ name: 'All sessions', rows: [cols, ...rows.map(r => cols.map(c => r[c]))] }]));
}

export function RecorderProvider({ children }: { children: ReactNode }) {
  const { state, edition, showToast } = useSession();
  const crm = useCrm();
  const picker = (window as unknown as { showDirectoryPicker?: DirPicker }).showDirectoryPicker;
  const [mode, setMode] = useState<Mode>(picker ? 'none' : 'unsupported');
  const [folder, setFolder] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<{ file: string; at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dir = useRef<DirHandle | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef<Snapshot | null>(null);
  const timer = useRef<number>();
  const announced = useRef<Set<string>>(new Set());
  const toast = useRef(showToast); toast.current = showToast;
  const modeRef = useRef(mode); modeRef.current = mode;

  // the unit's availability in the CRM, kept with the record
  const unitStatus = state.floor != null && state.unit ? statusOf(crm.inventory, state.floor, state.unit, edition.crm?.floorAlias) : null;

  // remembered folder from an earlier visit
  useEffect(() => {
    if (!picker) return;
    let alive = true;
    (async () => {
      const h = await idbGet<DirHandle>(IDB_KEY);
      if (!alive || !h) return;
      dir.current = h; setFolder(h.name);
      const p = h.queryPermission ? await h.queryPermission({ mode: 'readwrite' }) : 'granted';
      setMode(p === 'granted' ? 'ready' : 'reconnect');
    })();
    return () => { alive = false; };
  }, [picker]);

  const save = useCallback((snap: Snapshot) => {
    queue.current = queue.current.then(async () => {
      const h = dir.current;
      if (!h || modeRef.current !== 'ready') return;
      const file = sessionFileName(snap.state);
      try {
        const p = h.queryPermission ? await h.queryPermission({ mode: 'readwrite' }) : 'granted';
        if (p !== 'granted') { setMode('reconnect'); return; }
        await writeFile(h, file, writeWorkbook(sessionWorkbook(snap.state, snap.edition, snap.ctx)));
        try { await updateAllSessions(h, snap); }
        catch (e) { throw new Error(`${ALL_SESSIONS_FILE}: ${e instanceof Error ? e.message : String(e)} (is it open in Excel?)`); }
        setLastSaved({ file, at: new Date().toISOString() }); setError(null);
        if (!announced.current.has(file)) { announced.current.add(file); toast.current(`Saving selections to ${h.name}`); }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(prev => { if (prev !== msg) toast.current('Could not save to Excel. Trying again on the next selection.'); return msg; });
      }
    });
  }, []);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (pending.current) { save(pending.current); pending.current = null; }
  }, [save]);

  // every change to a started session is written, a moment after it settles
  useEffect(() => {
    if (VIEW !== 'console') return;
    // a different session (restart, new buyer): the previous one is written straight away
    if (pending.current && sessionId(pending.current.state) !== sessionId(state)) flush();
    if (!state.startedAt) return;
    pending.current = { state, edition, ctx: { unitStatus } };
    if (mode !== 'ready') return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, DEBOUNCE_MS);
  }, [state, edition, unitStatus, mode, flush]);

  // closing the window: write what is pending
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onHide); };
  }, [flush]);

  const connect = useCallback(async () => {
    if (!picker) return;
    try {
      const h = await picker({ id: 'accord-data', mode: 'readwrite', startIn: 'documents' });
      const p = h.requestPermission ? await h.requestPermission({ mode: 'readwrite' }) : 'granted';
      if (p !== 'granted') return;
      dir.current = h; setFolder(h.name); setError(null);
      await idbSet(IDB_KEY, h);
      setMode('ready');
      toast.current(h.name === DATA_FOLDER ? `Data folder connected: ${h.name}` : `Connected to ${h.name}. Expected ${DATA_FOLDER}.`);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setError(e instanceof Error ? e.message : String(e));
    }
  }, [picker]);

  /** Must run from a click (the browser asks the user). True when writing is allowed. */
  const reconnect = useCallback(async () => {
    const h = dir.current;
    if (!h) { await connect(); return modeRef.current === 'ready'; }
    try {
      const p = h.requestPermission ? await h.requestPermission({ mode: 'readwrite' }) : 'granted';
      if (p === 'granted') { setMode('ready'); return true; }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    return false;
  }, [connect]);

  // browsers without folder access: the session's workbook as a download
  const download = useCallback(() => {
    if (!state.startedAt) return;
    const bytes = writeWorkbook(sessionWorkbook(state, edition, { unitStatus }));
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url; a.download = sessionFileName(state); a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [state, edition, unitStatus]);

  const value = useMemo(() => ({ mode, folder, lastSaved, error, connect, reconnect, download }),
    [mode, folder, lastSaved, error, connect, reconnect, download]);
  return <RecorderContext.Provider value={value}>{children}</RecorderContext.Provider>;
}

export function useRecorder(): Ctx {
  const c = useContext(RecorderContext);
  if (!c) throw new Error('useRecorder outside RecorderProvider');
  return c;
}
