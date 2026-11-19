import type { Actor } from '../sim/types';

/** Fictional seed cast. Parody names only — no real-person likenesses. */
export const INITIAL_ACTORS: Actor[] = [
  { id: 'player', name: 'You (kibanda owner)', kind: 'player', districtId: 'gikomba', capital: 12000, reputation: 0.6, heat: 0.05, favors: 0, stance: 'neutral' },
  { id: 'kajasa', name: 'Mayor Kajasa', kind: 'politician', districtId: 'cbd', capital: 900000, reputation: 0.45, heat: 0.2, favors: 4, stance: 'neutral' },
  { id: 'wetanguka', name: 'MP Wetanguka', kind: 'politician', districtId: 'cbd', capital: 700000, reputation: 0.5, heat: 0.15, favors: 3, stance: 'neutral' },
  { id: 'gaucho', name: 'Dr. Gaucho', kind: 'institution', districtId: 'westlands', capital: 400000, reputation: 0.7, heat: 0.05, favors: 1, stance: 'friendly' },
  { id: 'hahe', name: 'Hahe Moving', kind: 'vendor', districtId: 'thika', capital: 80000, reputation: 0.55, heat: 0.1, favors: 2, stance: 'neutral' },
  { id: 'manade', name: 'Manade', kind: 'influencer', districtId: 'kilimani', capital: 150000, reputation: 0.5, heat: 0.1, favors: 1, stance: 'courted' },
  { id: 'mbavu', name: 'Mbavu', kind: 'influencer', districtId: 'eastleigh', capital: 90000, reputation: 0.42, heat: 0.18, favors: 2, stance: 'neutral' },
  { id: 'kanjo', name: 'Kanjo Officer', kind: 'kanjo', districtId: 'gikomba', capital: 30000, reputation: 0.35, heat: 0.25, favors: 0, stance: 'hostile' },
  { id: 'mamamboga', name: 'Mama Mboga', kind: 'vendor', districtId: 'kibra', capital: 25000, reputation: 0.68, heat: 0.08, favors: 0, stance: 'friendly' },
  { id: 'sacco', name: 'Mathree SACCO', kind: 'vendor', districtId: 'eastleigh', capital: 220000, reputation: 0.58, heat: 0.2, favors: 2, stance: 'neutral' },
];

export function makeActors(): Record<string, Actor> {
  return Object.fromEntries(INITIAL_ACTORS.map((actor) => [actor.id, { ...actor }]));
}
