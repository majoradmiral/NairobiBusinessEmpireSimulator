import type { EffectKind } from './types';

export interface InfluenceRule {
  id: string;
  description: string;
  trigger: 'bribe' | 'campaign' | 'strike' | 'operate';
  lagTicks: number;
  effect: EffectKind;
  gain: number;
}

/**
 * Influence rules are data, not code. Balance can be tuned by editing this
 * file (or, later, by loading a JSON ruleset) without touching the engine.
 */
export const DEFAULT_RULES: InfluenceRule[] = [
  {
    id: 'bribe-audit',
    description: 'A bribe schedules an inspection 3-8 ticks later, weighted by accumulated heat.',
    trigger: 'bribe',
    lagTicks: 5,
    effect: 'inspection',
    gain: 1,
  },
  {
    id: 'campaign-exposure',
    description: 'Paid influencer narratives can backfire into sentiment loss.',
    trigger: 'campaign',
    lagTicks: 3,
    effect: 'sentimentShock',
    gain: -0.08,
  },
  {
    id: 'strike-demand',
    description: 'A university strike depresses nearby foot traffic with a slow recovery.',
    trigger: 'strike',
    lagTicks: 1,
    effect: 'footTrafficShock',
    gain: -0.18,
  },
  {
    id: 'operations-heat',
    description: 'Informal operations add gradual enforcement heat.',
    trigger: 'operate',
    lagTicks: 2,
    effect: 'inspection',
    gain: 0.2,
  },
];

export function ruleFor(trigger: InfluenceRule['trigger']): InfluenceRule | undefined {
  return DEFAULT_RULES.find((rule) => rule.trigger === trigger);
}
