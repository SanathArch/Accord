/* The data folder link on the home page (console only), and its short form on the rail. */
import { useRecorder, DATA_FOLDER, DATA_FOLDER_PATH, ALL_SESSIONS_FILE } from './RecorderProvider';
import './record.css';

export function DataFolder() {
  const r = useRecorder();
  const time = r.lastSaved ? new Date(r.lastSaved.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="rec">
      <div className="rec-src">
        <span className={`dot ${r.mode}`} />
        <span className="micro dim">
          {r.mode === 'ready' ? `Selections save to ${r.folder}${r.lastSaved ? ` · last saved ${time}` : ''}` :
           r.mode === 'reconnect' ? `${r.folder} was connected before. Allow saving to it again.` :
           r.mode === 'unsupported' ? 'This browser cannot save to a folder. Use Chrome or Edge, or download the Excel from the rail.' :
           `Data folder not connected. Choose ${DATA_FOLDER_PATH}.`}
        </span>
        {r.mode === 'none' && <button type="button" className="chip" onClick={r.connect}>Connect data folder</button>}
        {r.mode === 'reconnect' && <button type="button" className="chip" onClick={() => { void r.reconnect(); }}>Reconnect</button>}
        {r.mode === 'ready' && <button type="button" className="chip" onClick={r.connect}>Change</button>}
      </div>
      {r.mode === 'ready' && r.folder && r.folder !== DATA_FOLDER &&
        <span className="micro rec-err">This is not {DATA_FOLDER}. Choose {DATA_FOLDER_PATH} with Change.</span>}
      {r.mode === 'ready' && <span className="micro dim rec-note">One Excel file per session, and {ALL_SESSIONS_FILE} with a row per session.</span>}
      {r.error && <span className="micro rec-err">Last save failed: {r.error}</span>}
    </div>
  );
}

/** On the rail during a session: shown only when selections are not being saved. */
export function RailRecorder({ started }: { started: boolean }) {
  const r = useRecorder();
  if (!started || r.mode === 'ready') return null;
  if (r.mode === 'unsupported') return <button className="rail-btn rec-rail" onClick={r.download}>Download Excel</button>;
  return (
    <button className="rail-btn rec-rail" title="Selections are not being saved"
      onClick={() => { r.mode === 'reconnect' ? void r.reconnect() : void r.connect(); }}>
      <span className="dot reconnect" />Not saving · {r.mode === 'reconnect' ? 'Reconnect' : 'Connect data folder'}
    </button>
  );
}
