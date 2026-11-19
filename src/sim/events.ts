import type { EffectKind, EventRecord, ScheduledEffect, Tick } from './types';

export function makeEvent(
  id: number,
  tick: Tick,
  type: string,
  payload: Record<string, number | string | boolean>,
  causeIds: number[] = [],
  actorId?: string,
  districtId?: string,
): EventRecord {
  return { id, tick, type, payload, causeIds, actorId, districtId };
}

export function makeEffect(
  id: number,
  dueTick: Tick,
  kind: EffectKind,
  payload: Record<string, number | string>,
  causeId: number,
): ScheduledEffect {
  return { id, dueTick, kind, payload, causeId };
}

/** Walk causeIds backwards to build a readable causal chain. */
export function causalChain(events: EventRecord[], eventId: number): EventRecord[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  const chain: EventRecord[] = [];
  const seen = new Set<number>();
  const visit = (id: number): void => {
    if (seen.has(id)) return;
    seen.add(id);
    const event = byId.get(id);
    if (!event) return;
    for (const cause of event.causeIds) visit(cause);
    chain.push(event);
  };
  visit(eventId);
  return chain;
}
