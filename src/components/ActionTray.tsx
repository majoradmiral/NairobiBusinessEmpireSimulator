import type { Command } from '../sim/types';

interface ActionTrayProps {
  dispatch: (command: Command) => void;
  tick: () => void;
  disabled: boolean;
}

export function ActionTray({ dispatch, tick, disabled }: ActionTrayProps) {
  return (
    <section className="panel actions">
      <header className="panel-header">
        <h2>Actions</h2>
        <button type="button" className="ghost" onClick={tick} disabled={disabled}>
          Step tick →
        </button>
      </header>
      <div className="action-grid">
        <button type="button" onClick={() => dispatch({ type: 'OPERATE' })} disabled={disabled}>
          Run stall <small>earn, small heat</small>
        </button>
        <button type="button" onClick={() => dispatch({ type: 'BRIBE' })} disabled={disabled}>
          Pay kanjo <small>faster, heat +8%</small>
        </button>
        <button type="button" onClick={() => dispatch({ type: 'INVEST' })} disabled={disabled}>
          Invest locally <small>vitality ↑</small>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'CAMPAIGN', narrative: 'Our market is safe' })}
          disabled={disabled}
        >
          Buy narrative <small>sentiment ↑, exposure risk</small>
        </button>
        <button type="button" onClick={() => dispatch({ type: 'TRIGGER_STRIKE' })} disabled={disabled}>
          University strike <small>demand shock</small>
        </button>
        <button type="button" onClick={() => dispatch({ type: 'FILE_TAX' })} disabled={disabled}>
          File taxes <small>pay now, heat ↓</small>
        </button>
      </div>
    </section>
  );
}
