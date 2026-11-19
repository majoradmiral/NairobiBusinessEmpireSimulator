# Risk Register — Kanairo Ledger (Early Design)

Compiled from review of `src/sim/`, `src/worker/`, `src/hooks/`, `src/data/`, `docs/GDD.md`, and `docs/SCALING_RISKS.md`.

## A. Immediate / In-Scaffold Risks (present today)

### A1. Non-deterministic reset seed — breaks replay determinism
**File:** `src/hooks/useSimulation.ts:47`  
**Code:** `const reset = useCallback((seed = Date.now() >>> 0) => { ... });`  
**Risk:** `Date.now()` is wall-clock time. A reset with the default seed produces a different world every time, violating "same seed + command script = same world."  
**Impact:** Critical — determinism is pillar #1; replays, bug reports, golden tests become non-reproducible.  
**Likelihood:** High — exercised every time the user clicks reset without a seed.  
**Mitigation:** Derive default seed from the seeded RNG module, or require an explicit seed. Do not call `Date.now()` inside the sim boundary.

### A2. `structuredClone` of entire `GameState` every tick
**File:** `src/sim/engine.ts:30`  
**Code:** `const state: GameState = structuredClone(previous);`  
**Risk:** Full deep-copy of districts, actors, markets, events, and effects on every tick is O(total entities). Fine at 9 districts / 30 actors; a problem at scale.  
**Impact:** High — engine compute blow-up is the first scaling ceiling.  
**Likelihood:** High — happens on every tick unconditionally.  
**Mitigation:** Move to structural sharing / incremental patches, then district sharding. Do not reach for WASM until O(N²) rule graph and clone cost are addressed.

### A3. Event log grows forever in memory; no compaction
**File:** `src/sim/engine.ts` (events array appended every tick, never trimmed)  
**Risk:** Every action and effect is appended to `state.events` indefinitely and cloned every tick (compounding A2).  
**Impact:** High — memory pressure and slower ticks over a session.  
**Likelihood:** High — inherent to event-sourced design without snapshot+tail.  
**Mitigation:** Snapshot every N ticks + discard events older than the snapshot; keep `causeIds` index for trace across boundary.

### A4. Snapshot written to IndexedDB every 10 ticks with no throttle or error handling
**File:** `src/hooks/useSimulation.ts:28`  
**Code:** `if (event.data.state.tick % 10 === 0) void saveSnapshot(event.data.state);`  
**Risk:** (a) Writes entire state to IndexedDB every 10 ticks — I/O amplification on a growing object. (b) `void` discards the promise, so IndexedDB failures (quota exceeded, IO error) are silently swallowed. (c) No `navigator.storage.estimate()` or `persist()` call.  
**Impact:** High — storage quota exhaustion, silent data loss, jank.  
**Likelihood:** High — fires every 10 ticks on every STATE message.  
**Mitigation:** Debounce snapshots, await/persist errors, call `storage.estimate()` and `persist()`, expose "Export save" UI.

### A5. Command log is write-only; never replayed on restore
**File:** `src/hooks/useSimulation.ts:40` (appendCommand) vs `src/sim/persistence.ts:38` (loadCommands exists but is never called)  
**Risk:** Commands are appended to IndexedDB but on reload only the snapshot is loaded (`loadSnapshot`). The command tail is ignored, so if the snapshot is stale or missing, the replay-from-command-log recovery path (the whole point of event sourcing) is dead code.  
**Impact:** High — save corruption or snapshot/stale-state mismatch cannot be recovered via command replay.  
**Likelihood:** Medium — only bites on save corruption or version mismatch.  
**Mitigation:** Implement snapshot + command tail restore: load latest snapshot, then replay commands after snapshot tick.

### A6. Float arithmetic for currency (`capital` is `number`)
**File:** `src/sim/types.ts:42` (`capital: number`) and `engine.ts` (e.g. line 88 `player.capital += revenue`)  
**Risk:** JavaScript floats are binary64; repeated additions of revenue/penalties can produce rounding drift (e.g. 0.1 + 0.2). Money conservation invariants become fragile.  
**Impact:** High — financial correctness is core to the "dual ledgers" USP; small drift breaks audit/trust.  
**Likelihood:** Medium — noticeable only after many ticks or large economies.  
**Mitigation:** Store money in integer minor units (cents) throughout the engine; format for display only.

### A7. Satire / parody sensitivity
**File:** `src/data/seed.ts`, `docs/GDD.md §7`  
**Risk:** Parody names ("Mayor Kajasa", "MP Wetanguka", "Kanjo Officer", "Kajasa Tower") map closely onto real Nairobi institutions and roles. Even clearly fictional names can be read as pointing at real people or offices.  
**Impact:** High — reputational, community backlash, workshop/school adoption blocked.  
**Likelihood:** Medium — depends on release audience and how close parody hews to reality.  
**Mitigation:** Maintain a parody/safety checklist for all named NPCs (already noted in SCALING_RISKS §4), use clearly fictitious surnames, add disclaimer in-game, avoid real-title + real-name combinations.

### A8. Zero backend = single device, single save, no sync
**File:** `src/sim/persistence.ts` (IndexedDB only), `docs/GDD.md §6.3`  
**Risk:** All progress lives in one browser's IndexedDB. Clearing site data, switching devices, or browser updates can erase the save with no recovery. No cross-device play, no leaderboards, no shared scenarios.  
**Impact:** Medium — player frustration, lost progress.  
**Likelihood:** High — IndexedDB eviction is real and common.  
**Mitigation:** "Export save" / "Import save" (seed + command log) as canonical backup; `navigator.storage.persist()`; plan optional backend for Phase 3.

## B. Scaling / Architecture Risks (triggered as the game grows)

These mirror and expand on `docs/SCALING_RISKS.md`; included here for early visibility.

| # | Risk | Why it bites | Impact | Likelihood | Early design action |
|---|------|-------------|--------|------------|---------------------|
| B1 | Engine compute blow-up | `structuredClone` every tick is O(entities); influence rules can become O(N²) | High | High | Patch-based state, district sharding, typed arrays |
| B2 | Event log growth | Immutable events accumulate; months of ticks = hundreds of thousands of rows | High | High | Snapshot + compact old events; replay from snapshot |
| B3 | DuckDB-WASM memory ceiling | Bounded WASM address space + per-tab browser limit; large JSON registration copies data | High | Medium | Windowed datasets, pre-aggregated tables, optional server-side DuckDB |
| B4 | IndexedDB quota & eviction | Quotas vary by browser/device; storage can be evicted under pressure; no cross-device sync | High | Medium | `storage.estimate()`, `persist()`, export/import, compression |
| B5 | Determinism drift | Float order, object key order, `Date.now()`/`Math.random()` leak, worker/main differences | Critical | Medium | Golden replay tests, integer money, sorted iteration, CI replays |
| B6 | React render storms | Every tick pushes new state object; map markers and charts re-render | Medium | High | Memoized selectors, virtualization, decoupled render rate |
| B7 | Map/POI density | Thousands of Leaflet markers destroy frame rate | Medium | High | Clustering, canvas renderer, aggregate to districts |
| B8 | Pyodide weight | ~10–30 MB download; doubles memory with DuckDB | Medium | Medium | Separate "Python lab" route, hard opt-in, SQL-only fallback |
| B9 | Content/balance combinatorics | NPCs × campaigns × strikes × policies = untested exploit paths | High | High | Monte Carlo balance sims, invariant tests, seeded scenario fuzzing |
| B10 | Single-player → multiplayer pivot | Local authority, no anti-cheat, no conflict resolution | High | Medium (if added) | Server-verifiable commands, authoritative tick service |
| B11 | Rules change breaks replay | Every rule change can silently break golden replay snapshots | High | High | Property-based invariants (money conservation, heat bounds), replay CI job |
| B12 | Analyst ergonomics decay | Ad-hoc SQL becomes unmaintainable as schemas grow | Medium | Medium | Curated views, query templates, schema docs in UI |

## C. Recommendations (Priority order for Phase 0–1)

1. **Fix A1:** Remove `Date.now()` from `reset`; use a deterministic default seed.
2. **Fix A4:** Throttle snapshots, await/persist errors, add `navigator.storage.estimate()` + `persist()`.
3. **Implement A5:** Snapshot + command tail restore so saves are recoverable.
4. **Implement A6:** Store money in integer minor units (cents).
5. **Add replay CI test:** Run same seed + command script twice, compare state hash (extend `engine.test.ts`).
6. **Add parody/safety checklist** for NPC names before public release.
7. **Add "Export save / Import save"** UI before adding content volume.