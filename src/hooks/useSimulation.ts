import { useCallback, useEffect, useRef, useState } from 'react';
import { appendCommand, loadSnapshot, saveSnapshot } from '../sim/persistence';
import type { Command, EventRecord, GameState } from '../sim/types';

interface WorkerPayload {
  type: string;
  state: GameState;
  emitted: EventRecord[];
}

export function useSimulation() {
  const [state, setState] = useState<GameState | null>(null);
  const [emitted, setEmitted] = useState<EventRecord[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const stateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../worker/sim.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerPayload>) => {
      if (event.data.type !== 'STATE') return;
      stateRef.current = event.data.state;
      setState(event.data.state);
      setEmitted(event.data.emitted);
      if (event.data.state.tick % 10 === 0) void saveSnapshot(event.data.state);
    };

    void loadSnapshot().then((snapshot) => {
      if (snapshot) worker.postMessage({ type: 'LOAD', state: snapshot });
    });

    return () => worker.terminate();
  }, []);

  const dispatch = useCallback((command: Command) => {
    workerRef.current?.postMessage({ type: 'COMMAND', command });
    void appendCommand(command, stateRef.current?.tick ?? 0);
  }, []);

  const tick = useCallback(() => {
    workerRef.current?.postMessage({ type: 'TICK' });
  }, []);

  const reset = useCallback((seed = Date.now() >>> 0) => {
    workerRef.current?.postMessage({ type: 'INIT', seed });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(tick, 1400);
    return () => window.clearInterval(interval);
  }, [tick]);

  return { state, emitted, dispatch, tick, reset };
}
