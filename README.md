# Kanairo Ledger

A browser-based, satirical Nairobi enterprise simulator where every action is logged, every consequence is delayed, and the spreadsheet is the weapon.

> Working defaults: React + TypeScript + Vite · deterministic Web Worker sim core · DuckDB-WASM analytics · IndexedDB persistence · Leaflet/OSM map · D3 charts · Career sim with Case Files as onboarding · audience: students + junior analysts.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. The simulation ticks automatically; use the action tray to operate, bribe, invest, campaign, trigger a university strike, or file taxes. Open **Causal Trace** to see why a number changed, and **Analyst Console** to run SQL over the event log.

```bash
npm run typecheck   # static checks
npm run test        # determinism tests
npm run build       # production bundle
```

Optional: regenerate synthetic source datasets with `npm run generate:data` (writes into `src/data/generated/`).

## Architecture

```
src/
  sim/          deterministic engine, event log, rules, persistence, analytics
  worker/       Web Worker host for the sim core
  data/         Nairobi districts, commodities, rules, seed actors
  game/         Case Files
  hooks/        React bridge to the worker
  components/   Map, Dashboard, Action Tray, Causal Trace, Analyst Console
docs/
  GDD.md            Game Design Document
  SCALING_RISKS.md  scale risk register and evolution path
```

Data flow:

```
player action -> Command -> Web Worker engine -> append-only Event Log
             -> scheduled effects -> materialized state -> React UI / map / charts
             -> DuckDB-WASM query layer (lazy) + IndexedDB snapshots
```

## Design constraints

- **Deterministic:** seed + command log replays the same world. No `Date.now()` or `Math.random()` inside the engine.
- **Event-sourced:** state is derived from events; nothing is silently overwritten.
- **Delayed consequences:** shortcuts schedule effects on future ticks (inspections, penalties, sentiment backlash).
- **Zero backend:** all of this runs in the browser. Networking is a later phase.

## Roadmap

0. Vertical slice (this scaffold): one city, one player, bribe → heat → audit chain, causal trace.
1. Economy loop: markets, dual ledgers, NPC factions, kanjo policy.
2. City + society: districts, influencers, university strikes, satire content.
3. Analytics depth: counterfactual branching, Python case files, exports.

See `docs/SCALING_RISKS.md` before adding scale-heavy features.
