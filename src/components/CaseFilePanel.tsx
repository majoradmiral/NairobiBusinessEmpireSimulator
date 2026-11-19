import { useState } from 'react';
import { CASE_FILES } from '../game/cases';

export function CaseFilePanel() {
  const [activeId, setActiveId] = useState(CASE_FILES[0].id);
  const active = CASE_FILES.find((file) => file.id === activeId) ?? CASE_FILES[0];

  return (
    <section className="panel cases">
      <header className="panel-header">
        <h2>Case Files</h2>
        <span className="tag">onboarding</span>
      </header>
      <div className="case-tabs">
        {CASE_FILES.map((file) => (
          <button
            key={file.id}
            type="button"
            className={file.id === activeId ? 'active' : ''}
            onClick={() => setActiveId(file.id)}
          >
            {file.difficulty}
          </button>
        ))}
      </div>
      <h3>{active.title}</h3>
      <p>{active.brief}</p>
      <p className="hint">
        <strong>Datasets:</strong> {active.dataset.join(', ')}
      </p>
      <p className="hint">
        <strong>Hint:</strong> {active.hint}
      </p>
      <p className="reward">Unlocks: {active.unlocks}</p>
    </section>
  );
}
