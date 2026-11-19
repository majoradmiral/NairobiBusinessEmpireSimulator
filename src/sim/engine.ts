import { makeCommodities, makeDistricts, makeMarkets, universityDistrictId } from '../data/nairobi';
import { makeActors } from '../data/seed';
import { makeEffect, makeEvent } from './events';
import { nextRandom } from './rng';
import { ruleFor } from './rules';
import type { Command, EffectKind, GameState, StepResult } from './types';

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

export function createInitialState(seed = 20261119): GameState {
  return {
    tick: 0,
    seed,
    rngState: seed >>> 0,
    playerId: 'player',
    districts: makeDistricts(),
    commodities: makeCommodities(),
    actors: makeActors(),
    markets: makeMarkets(),
    events: [],
    effects: [],
    nextEventId: 1,
    nextEffectId: 1,
    strike: { active: false, remaining: 0 },
    status: 'running',
  };
}

export function step(previous: GameState, commands: Command[]): StepResult {
  const state: GameState = structuredClone(previous);
  state.tick += 1;

  const emitted: StepResult['emitted'] = [];

  const emit = (
    type: string,
    payload: Record<string, number | string | boolean>,
    causeIds: number[] = [],
    actorId?: string,
    districtId?: string,
  ) => {
    const event = makeEvent(
      state.nextEventId++,
      state.tick,
      type,
      payload,
      causeIds,
      actorId,
      districtId,
    );
    state.events.push(event);
    emitted.push(event);
    return event;
  };

  const schedule = (
    dueTick: number,
    kind: EffectKind,
    payload: Record<string, number | string>,
    causeId: number,
  ) => {
    const effect = makeEffect(state.nextEffectId++, dueTick, kind, payload, causeId);
    state.effects.push(effect);
    return effect;
  };

  const rand = (): number => {
    const [value, next] = nextRandom(state.rngState);
    state.rngState = next;
    return value;
  };

  const player = state.actors[state.playerId];
  const playerDistrict = state.districts[player.districtId];

  for (const command of commands) {
    switch (command.type) {
      case 'OPERATE': {
        let revenue = 0;
        for (const key of Object.keys(state.markets).sort()) {
          const market = state.markets[key];
          if (market.districtId !== player.districtId) continue;
          const sold = Math.max(0, Math.min(market.inventory, market.demand * 0.04));
          market.inventory = market.inventory - sold + 2;
          revenue += sold * market.price;
        }
        revenue = Math.round(revenue);
        player.capital += revenue;
        player.heat = clamp01(player.heat + 0.01);
        const event = emit('operate', { revenue }, [], player.id, player.districtId);
        const rule = ruleFor('operate');
        if (rule && player.heat > 0.35 && rand() < rule.gain) {
          schedule(state.tick + rule.lagTicks, 'inspection', { severity: player.heat }, event.id);
        }
        break;
      }
      case 'BRIBE': {
        const cost = Math.max(50, Math.round(player.capital * 0.02));
        player.capital -= cost;
        player.heat = clamp01(player.heat + 0.08);
        player.favors += 1;
        const event = emit(
          'bribe',
          { cost, heatAfter: player.heat, favors: player.favors },
          [],
          player.id,
          player.districtId,
        );
        const rule = ruleFor('bribe');
        if (rule) {
          const lag = 3 + Math.floor(rand() * 6);
          schedule(state.tick + lag, 'inspection', { severity: player.heat }, event.id);
        }
        break;
      }
      case 'INVEST': {
        const cost = Math.max(100, Math.round(player.capital * 0.05));
        if (player.capital <= cost) break;
        player.capital -= cost;
        playerDistrict.vitality = clamp01(playerDistrict.vitality + 0.04);
        playerDistrict.footTraffic = clamp01(playerDistrict.footTraffic + 0.03);
        playerDistrict.landValue = clamp01(playerDistrict.landValue + 0.02);
        emit('invest', { cost, districtId: playerDistrict.id }, [], player.id, playerDistrict.id);
        break;
      }
      case 'CAMPAIGN': {
        const cost = Math.max(80, Math.round(player.capital * 0.03));
        player.capital -= cost;
        const influencerId = rand() < 0.5 ? 'manade' : 'mbavu';
        playerDistrict.sentiment = clamp01(playerDistrict.sentiment + 0.08);
        playerDistrict.footTraffic = clamp01(playerDistrict.footTraffic + 0.02);
        const event = emit(
          'campaign',
          { cost, narrative: command.narrative, influencerId },
          [],
          influencerId,
          playerDistrict.id,
        );
        const rule = ruleFor('campaign');
        if (rule && rand() < 0.2) {
          schedule(
            state.tick + rule.lagTicks,
            'sentimentShock',
            { gain: rule.gain, districtId: playerDistrict.id },
            event.id,
          );
        }
        break;
      }
      case 'TRIGGER_STRIKE': {
        if (state.strike.active) break;
        const districtId = universityDistrictId();
        state.strike = { active: true, districtId, remaining: 10 };
        const event = emit('strike_start', { districtId }, [], 'gaucho', districtId);
        for (let i = 1; i <= 10; i += 1) {
          const gain = -0.18 * (1 - i / 12);
          schedule(
            state.tick + i,
            'footTrafficShock',
            { gain, districtId },
            event.id,
          );
        }
        schedule(state.tick + 11, 'strikeRecovery', { gain: 0.05, districtId }, event.id);
        break;
      }
      case 'FILE_TAX': {
        const tax = Math.round(player.capital * 0.01 + 100);
        player.capital -= tax;
        player.heat = clamp01(player.heat - 0.12);
        emit('tax_filed', { tax, heatAfter: player.heat }, [], player.id, player.districtId);
        break;
      }
      case 'PAUSE': {
        state.status = 'paused';
        break;
      }
      case 'RESUME': {
        state.status = 'running';
        break;
      }
    }
  }

  // Price discovery: demand/supply plus transport and vitality shocks, smoothed.
  for (const key of Object.keys(state.markets).sort()) {
    const market = state.markets[key];
    const district = state.districts[market.districtId];
    const commodity = state.commodities[market.commodityId];
    const demand = 80 * district.footTraffic * (1 + district.sentiment * 0.2);
    const supply = 60 + market.inventory;
    const ratio = Math.max(0.5, Math.min(2, demand / Math.max(1, supply)));
    const transportShock = 1 + commodity.transportSensitivity * (1 - district.footTraffic) * 0.15;
    const target = commodity.basePrice * Math.pow(ratio, commodity.elasticity) * transportShock;
    market.price = market.price * 0.8 + target * 0.2;
    market.demand = demand;
    market.supply = supply;
  }

  // Resolve scheduled effects that are due.
  const due = state.effects
    .filter((effect) => effect.dueTick <= state.tick)
    .sort((a, b) => a.id - b.id);
  state.effects = state.effects.filter((effect) => effect.dueTick > state.tick);

  for (const effect of due) {
    switch (effect.kind) {
      case 'inspection': {
        const severity = Number(effect.payload.severity ?? 0.5);
        if (rand() < 0.6 + severity * 0.3) {
          const penalty = Math.round(player.capital * (0.04 + severity * 0.15));
          player.capital -= penalty;
          player.reputation = clamp01(player.reputation - 0.08);
          player.heat = clamp01(player.heat - 0.25);
          emit(
            'audit_penalty',
            { penalty, severity },
            [effect.causeId],
            player.id,
            player.districtId,
          );
        } else {
          emit('inspection_cleared', { severity }, [effect.causeId], player.id, player.districtId);
        }
        break;
      }
      case 'footTrafficShock': {
        const districtId = String(effect.payload.districtId ?? player.districtId);
        const district = state.districts[districtId];
        if (district) {
          const gain = Number(effect.payload.gain ?? 0);
          district.footTraffic = clamp01(district.footTraffic * (1 + gain));
          district.vitality = clamp01(district.vitality * (1 + gain * 0.5));
          emit('foot_traffic_shock', { gain, districtId }, [effect.causeId], undefined, districtId);
        }
        break;
      }
      case 'sentimentShock': {
        const districtId = String(effect.payload.districtId ?? player.districtId);
        const district = state.districts[districtId];
        if (district) {
          const gain = Number(effect.payload.gain ?? 0);
          district.sentiment = clamp01(district.sentiment + gain);
          emit('sentiment_shock', { gain, districtId }, [effect.causeId], undefined, districtId);
        }
        break;
      }
      case 'priceShock': {
        const districtId = String(effect.payload.districtId ?? player.districtId);
        const gain = Number(effect.payload.gain ?? 0);
        for (const key of Object.keys(state.markets).sort()) {
          const market = state.markets[key];
          if (market.districtId !== districtId) continue;
          market.price = Math.max(1, market.price * (1 + gain));
        }
        emit('price_shock', { gain, districtId }, [effect.causeId], undefined, districtId);
        break;
      }
      case 'strikeRecovery': {
        const districtId = String(effect.payload.districtId ?? player.districtId);
        const district = state.districts[districtId];
        if (district) {
          const gain = Number(effect.payload.gain ?? 0);
          district.footTraffic = clamp01(district.footTraffic + gain);
          emit('strike_recovery', { gain, districtId }, [effect.causeId], undefined, districtId);
        }
        break;
      }
    }
  }

  // Natural drift.
  player.heat = clamp01(player.heat - 0.002);
  player.reputation = clamp01(player.reputation + (0.5 - player.reputation) * 0.01);
  for (const id of Object.keys(state.actors).sort()) {
    const actor = state.actors[id];
    if (actor.id !== player.id) actor.heat = clamp01(actor.heat - 0.001);
  }

  if (state.strike.active) {
    state.strike.remaining -= 1;
    if (state.strike.remaining <= 0) {
      const districtId = state.strike.districtId ?? universityDistrictId();
      state.strike = { active: false, remaining: 0 };
      emit('strike_end', { districtId }, [], undefined, districtId);
    }
  }

  return { state, emitted };
}
