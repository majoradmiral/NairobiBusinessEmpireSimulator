import { useState } from 'react';
import { queryEvents, type QueryResult } from '../sim/analytics';
import type { EventRecord } from '../sim/types';

const DEFAULT_SQL = `SELECT type, COUNT(*) AS occurrences
FROM events
GROUP BY type
ORDER BY occurrences DESC;`;

export function QueryConsole({ events }: { events: EventRecord[] }) {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      setResult(await queryEvents(sql, events));
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="panel console">
      <header className="panel-header">
        <h2>Analyst Console</h2>
        {result?.fallback && <span className="tag warn">fallback mode</span>}
      </header>
      <textarea value={sql} onChange={(event) => setSql(event.target.value)} spellCheck={false} />
      <button type="button" onClick={() => void run()} disabled={running}>
        {running ? 'Running…' : 'Run SQL'}
      </button>
      {result && (
        <div className="result">
          <table>
            <thead>
              <tr>
                {result.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 50).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="hint">DuckDB-WASM loads on first run. If unavailable, a safe in-memory fallback is used.</p>
    </section>
  );
}
