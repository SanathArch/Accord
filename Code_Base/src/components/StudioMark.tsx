import { STUDIO } from '../library/studio';
import './studio.css';

export function StudioMark() {
  return (
    <div className="mark" aria-label={`${STUDIO.mark}, ${STUDIO.expansion}`}>
      <span className="mark-word">{STUDIO.mark}</span>
      <sup className="mark-sup">{STUDIO.office}</sup>
      <span className="mark-sub">Outlook for Theoreticals<br />&amp; Speculative Design</span>
    </div>
  );
}

export function Credits() {
  return (
    <ul className="credits">
      {STUDIO.credits.map(c => (
        <li className="credit" key={c.name}><b>{c.name}</b><span>{c.role}</span></li>
      ))}
    </ul>
  );
}
