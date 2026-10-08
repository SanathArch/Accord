/* ══════════════════════════════════════════════════════════════
   02 · THE PROCESS
   Built to the reference: accord-demo/index.html, #p-intro.
   One centred column (620 px): kicker, headline, three paragraphs,
   Begin the questions → persona, Change residence → residence.
   ══════════════════════════════════════════════════════════════ */
import { INTRO } from '../../library/copy';
import { RichText } from '../../components/RichText';
import { useSession } from '../../state/SessionProvider';
import { startPersonaPatch } from '../../engine/method';
import './intro.css';

export function IntroScreen() {
  const { state, dispatch } = useSession();

  return (
    <section className="phase center intro" aria-labelledby="intro-title">
      <div className="col">
        <div className="kicker">{INTRO.kicker}</div>
        <h2 id="intro-title" className="display">
          {INTRO.titleBefore}<em>{INTRO.titleEm}</em><RichText text={INTRO.titleAfter} />
        </h2>
        <div className="body">
          {INTRO.paragraphs.map((p, i) => <p key={i}><RichText text={p} /></p>)}
        </div>
        <div className="row">
          <button className="btn" onClick={() => {
            // the five questions start from the first, scores at zero, the buyer as the first participant
            dispatch({ type: 'm/set', event: 'persona/start', patch: startPersonaPatch(state.buyerName) });
            dispatch({ type: 'nav/go', phase: 'persona' });
          }}>{INTRO.begin}</button>
          <button className="btn-ghost" onClick={() => dispatch({ type: 'nav/go', phase: 'residence' })}>{INTRO.changeResidence}</button>
        </div>
      </div>
    </section>
  );
}
