/* Reads the rows of an .xlsx in the browser: unzip (fflate), then the sheet XML.
   Uses cached values for formula cells, which Excel writes on every save. */
import { unzipSync, strFromU8 } from 'fflate';

const colIndex = (ref: string) => {
  const letters = ref.replace(/\d+/g, '');
  let n = 0; for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

export interface Sheet { name: string; rows: unknown[][]; }

export function readWorkbook(buf: ArrayBuffer): Sheet[] {
  const files = unzipSync(new Uint8Array(buf));
  const txt = (p: string) => (files[p] ? strFromU8(files[p]) : '');
  const xml = (s: string) => new DOMParser().parseFromString(s, 'application/xml');

  const shared: string[] = [];
  const ss = txt('xl/sharedStrings.xml');
  if (ss) xml(ss).querySelectorAll('si').forEach(si => {
    shared.push(Array.from(si.getElementsByTagName('t')).map(t => t.textContent ?? '').join(''));
  });

  const rels: Record<string, string> = {};
  xml(txt('xl/_rels/workbook.xml.rels')).querySelectorAll('Relationship').forEach(r => {
    const t = r.getAttribute('Target') ?? '';
    rels[r.getAttribute('Id') ?? ''] = t.startsWith('/') ? t.slice(1) : 'xl/' + t;
  });

  const sheets: Sheet[] = [];
  xml(txt('xl/workbook.xml')).querySelectorAll('sheet').forEach(s => {
    const rid = s.getAttribute('r:id') ?? s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ?? '';
    const path = rels[rid]; if (!path || !files[path]) return;
    const rows: unknown[][] = [];
    xml(txt(path)).querySelectorAll('sheetData > row').forEach(row => {
      const r = Number(row.getAttribute('r')) - 1;
      const out: unknown[] = [];
      row.querySelectorAll('c').forEach(c => {
        const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0]?.textContent ?? null;
        let val: unknown = v;
        if (t === 's' && v != null) val = shared[Number(v)];
        else if (t === 'inlineStr') val = Array.from(c.getElementsByTagName('t')).map(x => x.textContent).join('');
        else if (t === 'b') val = v === '1';
        else if (t !== 'str' && t !== 'e' && v != null && v !== '' && !isNaN(Number(v))) val = Number(v);
        out[colIndex(c.getAttribute('r') ?? 'A1')] = val;
      });
      rows[r] = out;
    });
    sheets.push({ name: s.getAttribute('name') ?? '', rows: Array.from(rows, r => r ?? []) });
  });
  return sheets;
}
