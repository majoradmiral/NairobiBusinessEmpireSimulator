# Game Design Document — Kanairo Ledger

**Team members:** [Owner] Game Design · [Owner] Systems/Data · [Owner] Frontend · [Owner] Content/Satire · [Owner] Art/Audio · [Owner] QA

**Document overview:** Defines a browser-based Nairobi enterprise-and-civic simulator where a single causal data model drives businesses, government, media, and city growth. Every action is logged, every consequence delayed and traceable, and the player's primary tool is data.

## 1. Game Overview & Concept

### 1.1 Executive Summary
A satirical city-and-enterprise sim set in alternate-near-future Nairobi. Players run kibandas, mama mboga stalls, Gikomba stalls and matatu routes; navigate kanjo, taxes and parody politicians; and manipulate or expose influencer narratives. Cheap shortcuts accrue hidden liability ("heat") that becomes expensive later. Built-in SQL analytics, causal tracing and counterfactual branching make the consequence engine the core entertainment.

### 1.2 High Concept & Core Pillars
"A city builder where the spreadsheet is the weapon."
1. **Causal Integrity** — every number has a traceable cause.
2. **Informal Economy First** — the real economy is modeled, not decorative.
3. **Satirical Mirrors** — parody factions, never real likenesses.
4. **Analyst's Playground** — query, fork, export.

### 1.3 Target Audience & Genre
Genre: systems/tycoon sim + investigative data game. Audience: students and junior analysts in East Africa; civic-tech and media-literacy workshops secondary. Tone: satirical but grounded.

### 1.4 USPs
- Dual ledgers: formal books vs shadow books; corruption is the measurable gap.
- Delayed consequence scheduler: bribes become fines with interest, months later.
- Causal trace: click any value to see the event chain that produced it.
- Real SQL on synthetic Kenyan data inside Case Files.
- Counterfactual branching: fork a save, compare outcomes.

## 2. Core Logic & Systems

### 2.1 System Architecture Overview
Player/NPC action → command → deterministic tick engine (Web Worker) → append-only event log → influence-graph rules (lags + gains) → materialized views → React UI / map / charts. Rules are data so balance is tunable without code changes.

### 2.2 Core State Machines & Logic Flows
Actor: `Operating → UnderAudit → penalized/Shutdown`. District: `Growing → Stagnant → Declining → Gentrifying`. Market: `Stable → Shocked → Recovering`. NPC stance: `Neutral/Courted/Friendly/Hostile`. Flows: heat accrual → threshold → inspection → penalty + reputation hit; strike trigger → demand shock → decay + recovery curve.

### 2.3 Data Structures & Persistence
Entities: Actor, District, Commodity, Tender, Permit, Campaign, Event, Effect. Event log in IndexedDB; analytics views in DuckDB-WASM; save = seed + command log (replayable); export to CSV.

## 3. Gameplay Mechanics & Loop

### 3.1 Primary Core Loop
Observe (map + dashboards) → decide (invest / bribe / lobby / campaign / build) → resolve tick → inspect causal trace → adjust. Micro (daily stall management), Meso (monthly budgets/taxes/audits), Macro (seasonal elections, strikes, shocks).

### 3.2 Player Controls & Movement
Click-to-inspect map + panel interactions; optional light top-down avatar later. Query console toggle for analyst mode; keyboard shortcuts for speed.

### 3.3 Combat / Interaction Systems
Reframed as **Investigation & Influence**. No combat. Interactions are queries, bribes, negotiations, campaigns, audits. An Evidence/Integrity meter rises when claims are backed by correct metrics and drops on unsupported accusations.

### 3.4 Progression & Leveling
Case Files ramp: tender audit → duplicate payroll → ghost project → influencer exposure → mayoral run. Skill tracks: Operator (business), Analyst (SQL/Python), Fixer (influence). Unlocks districts, tools, NPC access.

## 4. Nairobi World Design & Map

### 4.1 World Lore & Setting
"Kanairo" — alternate-near-future Nairobi where county and national power tug against an economy that actually runs on the informal sector.

### 4.2 Map Layout & Zones
CBD, Westlands, Eastleigh, Kibra, Gikomba, Kilimani, Embakasi, Thika Road corridor, university town. Each zone: foot traffic, rent index, enforcement density, land use, sentiment.

### 4.3 Environmental Hazard & Dynamic Weather
Rain seasons hit mama mboga supply and matatu speeds; flooding in low-lying zones; "economic weather" = fuel, forex and strike shocks layered on top.

### 4.4 Points of Interest
Gikomba market, County Hall ("Kajasa Tower"), parliament, MP constituency office, university, influencer studios, kanjo checkpoints, matatu stages.

## 5. Economy & Logistics

### 5.1 Currencies & Resources
KSh cash · Favors (political capital) · Heat (latent liability) · Trust (public sentiment) · Data/Evidence (intel). Inventory per commodity.

### 5.2 Supply Chain & Logistics
Farm → mama mboga → kibanda → consumer; Gikomba imports via forex; matatu routes move people and goods. Disruptions propagate through the influence graph.

### 5.3 Trading, Markets & Vendors
Price = f(supply, demand, transport cost, shocks), smoothed so it stays "ideal" enough to plan around. Vendors have margins and can undercut you.

### 5.4 Monetization Strategy
Free core with optional paid Analyst Pro case packs and institutional workshop licensing. No exploitative in-game economy.

## 6. Engine & Technical Stack

### 6.1 Engine Selection & Pipeline
React + TS + Vite; deterministic sim in Web Worker; DuckDB-WASM analytics; IndexedDB persistence; Leaflet/OSM; D3 charts; optional lazy Pyodide. Chosen over Streamlit/Tableau for replayability, offline play and hosting cost.

### 6.2 Platforms & Performance
Modern desktop browsers first, tablet support; 60fps UI via worker isolation and tick batching; <5s initial load (Pyodide deferred).

### 6.3 Networking & Multiplayer
Phase 1 single-player offline. Later: lightweight backend for seasonal leaderboards and shared scenarios; no real-time multiplayer initially.

### 6.4 Third-Party Plugins & Tooling
Leaflet, OSM, D3, DuckDB-WASM, Faker (build-time synthetic data), Zustand, Vitest for determinism.

## 7. Art & Audio Direction

### 7.1 Visual Style & Color Palette
"Data-noir Nairobi": matatu neon green, terracotta markets, deep-navy UI, paper-cream reports.

### 7.2 Character & Environment Concept Guidelines
Exaggerated silhouettes; clearly fictional parody NPCs; recognizable-but-fictional market geography.

### 7.3 Animation Style
Tick-based motion, flowing money/goods Sankeys, heatmap pulses, strike crowd movement, subtle UI feedback.

### 7.4 Audio Palette
Original/cleared genge-afrobeats loops, matatu horns, market ambience, kanjo whistles, calculator-like UI clicks.

## 8. UI/UX Design

### 8.1 User Flow
Main menu → Career / Case Files / Sandbox → map + dashboard → inspect → decide → causal trace → next tick.

### 8.2 HUD & Overlays
Top bar: date, cash, heat, trust, heat forecast. Left: map. Right: analytics. Bottom: action tray. Drawers: Causal Trace, Analyst Console.

### 8.3 Menu Systems
Main menu; Case File briefings; Ledger (formal/shadow toggle); Inventory/assets; Query console; Settings (seed, sim speed, accessibility).

### 8.4 Accessibility
Keyboard nav, colorblind-safe palettes, text scaling, reduced motion, screen-reader labels, plain-language mode.
