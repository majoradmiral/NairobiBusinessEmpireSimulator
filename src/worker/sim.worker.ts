import { createInitialState, step } from '../sim/engine';
import type { Command, GameState } from '../sim/types';

interface WorkerMessage {
  type: 'INIT' | 'LOAD' | 'COMMAND' | 'TICK';
  seed?: number;
  state?: GameState;
  command?: Command;
}

const context = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null;
  postMessage(message: unknown): void;
};

let state: GameState = createInitialState();

context.onmessage = (event) => {
  const message = event.data;
  switch (message.type) {
    case 'INIT':
      state = createInitialState(message.seed ?? 20261119);
      break;
    case 'LOAD':
      if (message.state) state = message.state;
      break;
    case 'COMMAND':
      if (message.command) {
        const result = step(state, [message.command]);
        state = result.state;
        context.postMessage({ type: 'STATE', state, emitted: result.emitted });
      }
      break;
    case 'TICK': {
      const result = step(state, []);
      state = result.state;
      context.postMessage({ type: 'STATE', state, emitted: result.emitted });
      break;
    }
  }
};

context.postMessage({ type: 'STATE', state, emitted: [] });
