import { useEffect } from 'react';
import { Rail, Toast } from './components/Rail';
import { HomeScreen } from './screens/home/HomeScreen';
import { IntroScreen } from './screens/intro/IntroScreen';
import { ResidenceScreen } from './screens/residence/ResidenceScreen';
import { NextScreen } from './screens/placeholder/NextScreen';
import { PersonaScreen, PersonaRevealScreen } from './screens/method/Persona';
import { RegisterScreen, BespokeScreen } from './screens/method/Register';
import { VisualScreen, ResolvingScreen } from './screens/method/Visual';
import { PaletteScreen, PaletteMapScreen } from './screens/method/Palette';
import { WalkthroughScreen } from './screens/method/Walkthrough';
import { ConfiguratorScreen } from './screens/method/Configurator';
import { BrandsScreen } from './screens/method/Brands';
import { CoherenceScreen } from './screens/method/Coherence';
import { SummaryScreen } from './screens/method/Summary';
import type { Phase } from './engine/phases';
import { useSession } from './state/SessionProvider';
import { CrmProvider } from './crm/CrmProvider';
import { VIEW } from './state/view';
import { RecorderProvider } from './record/RecorderProvider';


export function App() {
  const { state, edition, showToast } = useSession();

  useEffect(() => {
    document.title = `Accord · ${edition.label}`;
    if (edition.accent) document.documentElement.style.setProperty('--accent', edition.accent);
    else document.documentElement.style.removeProperty('--accent');
  }, [edition]);

  useEffect(() => { document.documentElement.dataset.view = VIEW; }, []);

  return (
    <CrmProvider key={edition.id} editionId={edition.id} snapshot={edition.crm?.snapshot ?? null} onChange={showToast}>
      <RecorderProvider>
        <div className={state.phase === 'entry' ? 'app' : 'app has-rail'}>
          <Rail />
          <Screen phase={state.phase} />
          <Toast />
        </div>
      </RecorderProvider>
    </CrmProvider>
  );
}

/** One screen per phase; phases not built yet fall through to the placeholder. */
function Screen({ phase }: { phase: Phase }) {
  switch (phase) {
    case 'entry': return <HomeScreen />;
    case 'residence': return <ResidenceScreen />;
    case 'intro': return <IntroScreen />;
    case 'persona': return <PersonaScreen />;
    case 'persona-reveal': return <PersonaRevealScreen />;
    case 'register': return <RegisterScreen />;
    case 'bespoke': return <BespokeScreen />;
    case 'visual': return <VisualScreen />;
    case 'resolving': return <ResolvingScreen />;
    case 'palette': return <PaletteScreen />;
    case 'palette-map': return <PaletteMapScreen />;
    case 'walkthrough': return <WalkthroughScreen />;
    case 'configurator': return <ConfiguratorScreen />;
    case 'brands': return <BrandsScreen />;
    case 'coherence': return <CoherenceScreen />;
    case 'summary': return <SummaryScreen />;
    default: return <NextScreen key={phase} />;
  }
}
