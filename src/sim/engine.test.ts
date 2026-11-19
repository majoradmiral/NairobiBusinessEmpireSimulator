import { describe, expect, it } from 'vitest';
import { createInitialState, step } from './engine';
import type { Command, GameState } from './types';

const SCRIPT: Command[] = [
  { type: 'OPERATE' },
  { type: 'BRIBE' },
  { type: 'INVEST' },
  { type: 'CAMPAIGN', narrative: 'safe market' },
  { type: 'TRIGGER_STRIKE' },
  { type: 'FILE_TAX' },
];

function runScript(): GameState {
  let state = createInitialState(4242);
  for (const command of SCRIPT) state = step(state, [command]).state;
  for (let i = 0; i < 20; i += 1) state = step(state, []).state;
  return state;
}

describe('deterministic engine', () => {
  it('replays identically from the same seed and command script', () => {
    expect(JSON.stringify(runScript())).toBe(JSON.stringify(runScript()));
  });

  it('a bribe schedules a future inspection with a causal link', () => {
    let state = createInitialState(7);
    const result = step(state, [{ type: 'BRIBE' }]);
    state = result.state;
    const bribe = result.emitted.find((event) => event.type === 'bribe');
    expect(bribe).toBeDefined();
    expect(state.effects.some((effect) => effect.kind === 'inspection')).toBe(true);
    expect(state.effects.every((effect) => effect.causeId === bribe!.id)).toBe(true);
  });

  it('a university strike depresses foot traffic in the university town', () => {
    const initial = createInitialState(11);
    const before = initial.districts.chuo.footTraffic;
    let state = initial;
    for (let i = 0; i < 4; i += 1) {
      state = step(state, i === 0 ? [{ type: 'TRIGGER_STRIKE' }] : []).state;
    }
    expect(state.districts.chuo.footTraffic).toBeLessThan(before);
  });
});
