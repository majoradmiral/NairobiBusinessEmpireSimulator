import { useMemo, useState } from 'react';
import { ActionTray } from './components/ActionTray';
import { CaseFilePanel } from './components/CaseFilePanel';
import { CausalTrace } from './components/CausalTrace';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';
import { QueryConsole } from './components/QueryConsole';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const { state, emitted, dispatch, tick, reset } = useSimulation();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('gikomba');

  const districts = useMemo(() => (state ? Object.values(state.districts) : []), [state]);

  if (!state) {
    return <div className="loading">Opening the ledger…</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">KL</span>
          <div>
            <h1>Kanairo Ledger</h1>
            <p>Every shortcut leaves a trail.</p>
          </div>
        </div>
        <div className="topbar-actions">
          <span className={`status ${state.status}`}>{state.status}</span>
          <button type="button" className="ghost" onClick={() => reset()}>
            New world
          </button>
        </div>
      </header>

      <main className="grid">
        <div className="map-wrap">
          <MapView districts={districts} selectedId={selectedDistrict} />
          <div className="district-select">
            {districts.map((district) => (
              <button
                key={district.id}
                type="button"
                className={selectedDistrict === district.id ? 'active' : ''}
                onClick={() => setSelectedDistrict(district.id)}
              >
                {district.name}
              </button>
            ))}
          </div>
        </div>
        <Dashboard state={state} />
        <ActionTray dispatch={dispatch} tick={tick} disabled={state.status === 'paused'} />
        <CausalTrace events={state.events} />
        <QueryConsole events={state.events} />
        <CaseFilePanel />
      </main>
      <footer className="footer">
        <span>Deterministic sim · seed {state.seed} · {emitted.length} new event(s) this tick</span>
        <span>Satirical fiction. No real persons depicted.</span>
      </footer>
    </div>
  );
}
