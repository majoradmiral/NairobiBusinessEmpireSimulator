import { line, scaleLinear } from 'd3';
import type { GameState } from '../sim/types';

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <strong>{pct}%</strong>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

export function Dashboard({ state }: { state: GameState }) {
  const player = state.actors[state.playerId];
  const districts = Object.values(state.districts);
  const avgTraffic =
    districts.reduce((total, district) => total + district.footTraffic, 0) / districts.length;
  const avgSentiment =
    districts.reduce((total, district) => total + district.sentiment, 0) / districts.length;
  const dueEffects = state.effects.length;

  const recentTicks = Array.from({ length: 20 }, (_, index) =>
    Math.max(0, state.tick - 19 + index),
  );
  const eventCounts = recentTicks.map(
    (tick) => state.events.filter((event) => event.tick === tick).length,
  );
  const x = scaleLinear().domain([0, 19]).range([0, 260]);
  const y = scaleLinear().domain([0, Math.max(1, ...eventCounts)]).range([38, 2]);
  const sparkline =
    line<number>()
      .x((_, index) => x(index))
      .y((count) => y(count))(eventCounts) ?? '';

  return (
    <section className="panel dashboard">
      <header className="panel-header">
        <h2>City Pulse</h2>
        <span className="tag">Tick {state.tick}</span>
      </header>
      <div className="stat-grid">
        <div className="stat">
          <span>Capital</span>
          <strong>KSh {Math.round(player.capital).toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Favors owed</span>
          <strong>{player.favors}</strong>
        </div>
        <div className="stat">
          <span>Pending effects</span>
          <strong>{dueEffects}</strong>
        </div>
        <div className="stat">
          <span>Strike</span>
          <strong>{state.strike.active ? `${state.strike.remaining} ticks left` : 'none'}</strong>
        </div>
      </div>
      <Meter label="Heat (latent liability)" value={player.heat} tone="#e8615f" />
      <Meter label="Public trust" value={player.reputation} tone="#3ddc97" />
      <Meter label="Average foot traffic" value={avgTraffic} tone="#62b6ff" />
      <Meter label="Average sentiment" value={avgSentiment} tone="#e8a33d" />
      <div className="sparkline">
        <span>Events / recent tick</span>
        <svg viewBox="0 0 260 40" preserveAspectRatio="none" role="img" aria-label="Event activity">
          <path d={sparkline} fill="none" stroke="#62b6ff" strokeWidth={2} />
        </svg>
      </div>
      <p className="hint">
        Shortcuts raise heat. Heat schedules inspections. Inspections become penalties. Open the
        Causal Trace to watch it happen.
      </p>
    </section>
  );
}
