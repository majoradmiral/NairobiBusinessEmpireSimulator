export type Tick = number;
export type ActorId = string;
export type DistrictId = string;
export type CommodityId = string;

export interface Vec2 {
  lat: number;
  lng: number;
}

export type ZoneType = 'cbd' | 'market' | 'residential' | 'informal' | 'university' | 'corridor';

export interface District {
  id: DistrictId;
  name: string;
  center: Vec2;
  zone: ZoneType;
  footTraffic: number;
  rentIndex: number;
  enforcement: number;
  landValue: number;
  vitality: number;
  sentiment: number;
}

export interface Commodity {
  id: CommodityId;
  name: string;
  basePrice: number;
  elasticity: number;
  transportSensitivity: number;
}

export type ActorKind = 'player' | 'vendor' | 'politician' | 'influencer' | 'kanjo' | 'institution';
export type Stance = 'neutral' | 'friendly' | 'hostile' | 'courted';

export interface Actor {
  id: ActorId;
  name: string;
  kind: ActorKind;
  districtId: DistrictId;
  capital: number;
  reputation: number;
  heat: number;
  favors: number;
  stance: Stance;
}

export interface MarketState {
  key: string;
  districtId: DistrictId;
  commodityId: CommodityId;
  supply: number;
  demand: number;
  price: number;
  inventory: number;
}

export type EffectKind =
  | 'inspection'
  | 'footTrafficShock'
  | 'sentimentShock'
  | 'priceShock'
  | 'strikeRecovery';

export interface EventRecord {
  id: number;
  tick: Tick;
  type: string;
  payload: Record<string, number | string | boolean>;
  causeIds: number[];
  actorId?: ActorId;
  districtId?: DistrictId;
}

export interface ScheduledEffect {
  id: number;
  dueTick: Tick;
  kind: EffectKind;
  payload: Record<string, number | string>;
  causeId: number;
}

export interface StrikeState {
  active: boolean;
  districtId?: DistrictId;
  remaining: number;
}

export interface GameState {
  tick: Tick;
  seed: number;
  rngState: number;
  playerId: ActorId;
  districts: Record<DistrictId, District>;
  commodities: Record<CommodityId, Commodity>;
  actors: Record<ActorId, Actor>;
  markets: Record<string, MarketState>;
  events: EventRecord[];
  effects: ScheduledEffect[];
  nextEventId: number;
  nextEffectId: number;
  strike: StrikeState;
  status: 'running' | 'paused' | 'gameover';
}

export type Command =
  | { type: 'OPERATE' }
  | { type: 'BRIBE' }
  | { type: 'INVEST' }
  | { type: 'CAMPAIGN'; narrative: string }
  | { type: 'TRIGGER_STRIKE' }
  | { type: 'FILE_TAX' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };

export interface StepResult {
  state: GameState;
  emitted: EventRecord[];
}
