# 3D Background Dilemma — Kanairo Ledger

**Context:** Considering whether to use a 3D city background model (e.g. Sketchfab low-poly neighbourhood model) instead of 2D/CSS backgrounds in a browser-based, zero-backend sim.

**Decision needed:** Do we introduce WebGL/3D rendering for backgrounds, or stay 2D for Phase 0–1?

---

## 1. The core conflict

| Constraint | 3D background (Sketchfab model) | 2D / CSS background |
|------------|----------------------------------|---------------------|
| **Engine required** | No game engine, but need Three.js / React Three Fiber + GLB loader | None — React + Leaflet + CSS already in stack |
| **Bundle impact** | High (~600 KB–1 MB+ for 3D lib + model) | Negligible (CSS / compressed image) |
| **Initial load budget** | Threatens `< 5 s` target (`GDD §6.2`) | Fits easily |
| **Art direction** | Generic low-poly; unlikely to match "Data-noir Nairobi" palette | Can match matatu neon, terracotta, deep-navy UI |
| **Nairobi specificity** | Generic city; not Nairobi-specific unless custom-made | Can illustrate actual districts (Gikomba, Kibera, CBD) |
| **Latency at runtime** | GPU-bound; weak phones/tablets may stutter | CPU-cheap; works on all devices |
| **Interactivity** | Orbit/zoom camera possible | Static or CSS-animated only |

---

## 2. What the Sketchfab model actually is

- A **3D low-poly city / neighbourhood modular model** (likely GLB/GLTF)
- Not a 2D background image
- Requires a WebGL context, camera, lights, and a 3D renderer to display
- **Not a drop-in `background-image`** for Leaflet or React

---

## 3. Licensing considerations (Sketchfab)

- Licenses vary per model: CC-BY (free + attribution), paid commercial, or non-commercial only
- Must verify the license on the exact model page before use
- Generally: raw 3D files cannot be offered as standalone downloads to users; they must be embedded in the experience

---

## 4. Options

### Option A — Static 2D render from the 3D model (recommended for Phase 0–1)
- Render the Sketchfab model to a static image (screenshot / orthographic view) in Blender or a viewer
- Optimize to WebP / compressed JPG (~100–300 KB)
- Use as CSS background or `` behind the map / UI panels
- **Pros:** Zero WebGL, zero bundle bloat, instant load
- **Cons:** Not interactive; no camera movement

### Option B — Lazy-loaded 3D route
- Build a separate `/city-view` route with React Three Fiber / Three.js
- Load the 3D library and GLB only when the user navigates there
- Keep the main game 2D and fast
- **Pros:** Actual 3D exploration
- **Cons:** Adds build complexity; art style may not match Nairobi satire; still heavy for mobile

### Option C — Skip 3D entirely
- Use Leaflet tiles + CSS-drawn district shapes + illustrated markers
- Matches existing stack and `Data-noir` palette
- **Pros:** Fast, cohesive, Nairobi-specific if illustrated
- **Cons:** No 3D depth/parallax

---

## 5. Recommendation (Phase 0–1)

**Do not pull in a live 3D model yet.**

The latency and art-direction mismatch are not worth it at this stage. If you want background art:

1. **Render Option A** — static image from the Sketchfab model (if license allows), or commission stylized Nairobi district illustrations
2. **Layer with CSS** behind `MapView.tsx` or district panels
3. **Lazy-load** any heavy visuals so they don't block initial load
4. **Reconsider Option B** only after the vertical slice is stable and if a dedicated 3D city view is genuinely required

---

## 6. Files that would be affected if we proceed

- `src/components/MapView.tsx` — where map/background layers live
- `src/styles.css` — UI backgrounds and palette
- `vite.config.ts` / build config — if adding Three.js or React Three Fiber
- New route/component under `src/components/` or `src/pages/` for a 3D view

---

**Bottom line:** You don't need Unity/Unreal/Godot, but you do need a 3D web library to render that Sketchfab asset. For now, stay 2D.