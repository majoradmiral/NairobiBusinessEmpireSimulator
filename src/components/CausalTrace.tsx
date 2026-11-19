import { useState } from 'react';
import { causalChain } from '../sim/events';
import type { EventRecord } from '../sim/types';

export function CausalTrace({ events }: { events: EventRecord[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const recent = [...events].reverse().slice(0, 16);
  const chain = selected === null ? [] : causalChain(events, selected);

  return (
    <section className="panel trace">
      <header className="panel-header">
        <h2>Causal Trace</h2>
        <span className="tag">{events.length} events</span>
      </header>
      {chain.length > 0 && (
        <div className="chain">
          <strong>Why this happened</strong>
          <ol>
            {chain.map((event) => (
              <li key={event.id}>
                <span className="tick">t{event.tick}</span> {event.type}{' '}
                <code>{JSON.stringify(event.payload)}</code>
              </li>
            ))}
          </ol>
        </div>
      )}
      <ul className="event-list">
        {recent.map((event) => (
          <li key={event.id}>
            <button type="button" onClick={() => setSelected(event.id)}>
              <span className="tick">t{event.tick}</span>
              <span className="event-type">{event.type}</span>
              <span className="event-payload">{JSON.stringify(event.payload)}</span>
            </button>
          </li>
        ))}
        {recent.length === 0 && <li className="empty">No events yet. Take an action or step a tick.</li>}
      </ul>
    </section>
  );
}
