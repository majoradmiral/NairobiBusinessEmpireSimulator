# Scaling Risk Register — Kanairo Ledger

## 1. Context and tripwires

**Phase 1 baseline (this scaffold):** single-player, offline, desktop browser, ~9 districts, ~30 actors, ~5 commodities, 1 tick/sec, event log in the tens of thousands per long session.

**"Scale further" means any of:** 100+ districts/agents, 10k+ actors, 100k+ events (months of ticks), 20+ concurrent players, Python case files loaded, or synthetic datasets above ~100 MB.

**Hard tripwires — revisit architecture when any is hit:**

| Signal | Threshold | Action |
| --- | --- | --- |
| Tick compute | > 16 ms p95 | Profile engine; shard by district; move hot state to typed arrays |
| Event log | > 50k events | Snapshot + compaction; stop replaying from tick 0 at load |
| DuckDB query | > 2 s interactive | Pre-aggregate; window data; consider backend |
| IndexedDB usage | > 50% quota estimate | Force export; prune historical events |
| Bundle initial load | > 5 s | Defer Pyodide/DuckDB; code-split map and charts |
| Actor count | > 5k | Replace full-state clone with incremental patches |

---

## 2. Risk register

| # | Risk | Why it bites at scale | Impact | Likelihood | Scaffold mitigation | Required next step |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Engine compute blow-up | `structuredClone` of entire state every tick is O(total entities); influence rules can become O(N²) | High | High | Worker isolation; small entity set; rules in data | Incremental patches, district sharding, typed arrays, WASM core |
| 2 | Event log growth | Every action/effect is immutable; months of ticks = hundreds of thousands of rows | High | High | Append-only log with `causeIds` | Snapshot every N ticks; compact old events; replay from snapshot |
| 3 | DuckDB-WASM memory ceiling | WASM has a bounded linear address space; browsers impose per-tab memory limits; large JSON registration copies data | High | Medium | Lazy load; query only when console opened | Windowed datasets, pre-aggregated tables, optional server-side DuckDB |
| 4 | IndexedDB quota and eviction | Quotas vary by browser/device; storage can be evicted under pressure; no cross-device sync | High | Medium | Snapshot persistence via `idb` | `navigator.storage.estimate()`, export/import, compression, backend sync |
| 5 | Determinism drift | Float order, object key order, worker/main differences, any `Date.now()`/`Math.random()` leak | Critical | Medium | Seeded PRNG with external state; no ambient time/random in engine | Golden replay tests, integer/fixed-point for money, sorted iteration, CI replays |
| 6 | React render storms | Every tick pushes a new state object; map markers and charts re-render | Medium | High | Worker decouples compute; tick interval throttled | Memoized selectors, virtualization, canvas/WebGL overlays, decoupled render rate |
| 7 | Map/POI density | Thousands of Leaflet markers and heatmap layers destroy frame rate | Medium | High | One marker per district now | Clustering, canvas renderer, vector tiles, aggregate to districts |
| 8 | Pyodide weight | ~10–30 MB download and cold-start; doubles memory with DuckDB | Medium | Medium | Not loaded in scaffold; planned lazy import | Separate "Python lab" route, explicit opt-in, progress UI, SQL-only fallback |
| 9 | Content/balance combinatorics | More NPCs × campaigns × strikes × policies creates untested exploit paths | High | High | Rules as data in `data/rules.ts` | Monte Carlo balance sims, invariant tests, content linting, seeded scenario fuzzing |
| 10 | Single-player → multiplayer pivot | Event log is authoritative locally; no server authority, anti-cheat, or conflict resolution | High | Medium (if multiplayer added) | Commands are explicit and serializable — good protocol seed | Server-verifiable commands, authoritative tick service, shared seed/snapshot model |
| 11 | Synthetic data realism vs safety | Faker/SDV output can accidentally mirror real names/IDs; "satire" can drift into real-person claims | Medium | Medium | Static fictional seed; Faker only in build script | Documented fictional disclaimer, PII pattern checks, parody review checklist |
| 12 | Browser/platform support | WASM threads, Web Workers, IndexedDB behave differently in Safari/iOS and locked-down environments | Medium | Medium | Feature detection in analytics fallback | Graceful degradation matrix, no-thread DuckDB bundle, localStorage fallback |
| 13 | Testing burden | Determinism is a promise; every rule change can silently break replay | High | High | Vitest wired up | Golden snapshots, property-based invariants (money conservation, heat bounds), replay CI job |
| 14 | Analyst ergonomics decay | As schemas grow, ad-hoc SQL becomes unmaintainable; learners get lost | Medium | Medium | Case Files with fixed schemas | Semantic layer / curated views, query templates, schema docs in UI |

---

## 3. Deep dives

### 3.1 The simulation core is the first ceiling
The current engine clones the whole `GameState` each tick. That is fine at 9 districts and 30 actors and wrong at 5,000 actors. Influence rules also currently iterate a small rule list, but a full causal graph with lags and gains will grow edges faster than nodes.

**Mitigation path:** (1) replace clone with structural sharing / Immer-style patches; (2) shard state by district and only step active districts; (3) store hot numeric state in typed arrays with stable integer IDs; (4) only then consider a Rust/WASM core. Do the first three before reaching for WASM — WASM raises build and debug cost without fixing an O(N²) rule graph.

### 3.2 Event log and the replay paradox
Replay-from-genesis is great for determinism and terrible for load time after 100k events. The fix is **snapshot + command tail**: persist a compact snapshot every N ticks, keep commands and events after it, and replay only the tail. Keep `causeIds` so causal trace still works across the boundary — either retain a lightweight event index for all history or store causal summaries in the snapshot.

### 3.3 DuckDB-WASM is an analytics engine, not a database
It is excellent for interactive queries over a few hundred thousand rows, but it is not your source of truth. Do not try to make the full event log the DuckDB table forever. Register bounded, pre-aggregated views; page older history in on demand. If interactive queries exceed ~2 seconds, move heavy aggregation to an optional backend and keep DuckDB for the "last N ticks" exploration.

### 3.4 Browser storage is not durable storage
IndexedDB can be evicted; quotas vary wildly. Treat it as a cache, not an archive. Expose "Export save" prominently, store the seed + command log as the canonical save, and treat snapshots as disposable acceleration. Add `navigator.storage.persist()` requests and quota estimates.

### 3.5 Determinism is a feature you must defend
Money should be integer minor units (cents), not floats. Iterate entity IDs in sorted order. Never read wall-clock time inside the engine — ticks carry the date. Add a CI test that runs the same seed + command script twice and compares a state hash. Any library used inside the engine must be deterministic and deterministic across browsers.

### 3.6 Multiplayer is a different product
If a shared world is ever wanted, the command log is the right protocol seed, but local authority is not acceptable. Design commands to be server-verifiable now: pure functions, explicit seeds, no ambient state. Add an authoritative tick service later rather than trying to reconcile diverged client states.

---

## 4. Recommended evolution path

**Now (Phase 0–1):** keep the worker, small state, and snapshot cadence. Add determinism tests and export/import before adding content volume.

**Before 50k events:** implement snapshot + command tail; add storage estimate and export UI.

**Before 100+ districts or 5k actors:** shard by district, move to patches, profile tick p95.

**Before Python case files:** ship SQL case files first; lazy-load Pyodide in a separate route with a hard opt-in.

**Before multiplayer:** introduce authoritative commands and a thin server; do not retrofit.

**Ongoing:** run seeded Monte Carlo balance sims on every rules change; maintain a parody/safety checklist for all named NPCs.
