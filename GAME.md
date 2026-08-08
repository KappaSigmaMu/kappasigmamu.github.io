# GAME.md — Handoff: Society Canary fly pose + `/game` sandbox

**Audience:** DeepSeek (or any successor agent)  
**Branch:** `game-prototype`  
**Repo:** KappaSigmaMu / Kusama Society UI (`ksm-app`)  
**Date:** 2026-08-08  
**Status:** Sandbox works. **Fly-pose CLI failed badly.** Do **not** continue the numpy hinge approach.

---

## 1. Mission (what success looks like)

Ship a **small in-app experience** at **`/game`** that eventually shows the Kusama **3D canary in a flying loop**.

Near-term art goal (blocker for animation):

1. Produce a **static** canary mesh (GLB/OBJ) with **wings spread** and **legs/paws tucked**, still **recognizably the original canary** (not a deformed blob).
2. Match orientation usable by **Anything World Animate Anything** (see `reference.jpg`).
3. Upload that static mesh to Anything World → download a **fly / flap** animation GLB.
4. Play that animation on `/game`.

**Do not** port the full Society app to Polkadot Products DevNet in this workstream. DevNet/member-gate is later (`CANARY-GAME.md`, `DEVNET.md`).

---

## 2. Non-negotiables

| Rule | Why |
| --- | --- |
| **Preserve the original canary identity** | Brand mesh; users will notice butchering immediately |
| **No whole-mesh “smart” vertex polar/hinge deform as the delivery path** | Already tried; produced an embarrassing cape/manta blob |
| **Human-in-the-loop** after every small visual change | Orthos + `/game`; wait for user approve |
| **No UniRig / heavy local ML** unless user explicitly asks | Storage/time; not needed if Anything World works on a *good* static pose |
| **Do not break `/` landing canary** | Landing keeps wireframe + FX + member points |

---

## 3. What is already done (use this)

### 3.1 App sandbox — **good, keep**

| Item | Detail |
| --- | --- |
| Route | `/game` — **outside** navbar and chain connect overlay |
| File | `src/pages/GamePage.tsx` |
| Router | `src/pages/App.tsx` — `GameShell` vs `MainApp` split |
| Renderer | Reuses `ThreeCanary` with game flags |
| Look | Solid mesh (`wireframe: false`), **no** bloom/glitch, **no** particles, **no** member points, **grid on**, **static lights** (`animateLights: false`) |
| Mesh now | **`./static/canary.glb`** (original rest pose) |

Relevant flags on `ThreeCanary` / config:

- `showPoints`, `showParticles`, `showEffects`, `showGrid`, `animateLights`
- `model.wireframe` (default true for landing; false for game)

### 3.2 Source of truth mesh

| Path | Role |
| --- | --- |
| `public/static/canary.glb` | **Canonical rest mesh** (also `public/assets/canary.glb`, `public/assets/canary.obj`) |
| `src/static/canary.glb` | Duplicate of rest (historical) |
| `src/canary-component/` | R3F viewer (`ThreeCanary.js`, `Components.js`, configs) |

**Mesh facts (from analysis):**

- ~3586 verts, single welded mesh, **no armature / skins / morphs**
- **Y up**, elongated on **Z** (beak–tail; head toward **+Z**), thin **X** (wings folded)
- Standing / perched rest pose — **not** a flight rest

### 3.3 Reference for Anything World orientation

| Path | Role |
| --- | --- |
| `reference.jpg` | AW Animate Anything UI: **Rotation reference** (magenta bird) Front / Side / Top vs **Your model** |

AW target silhouette (generic low-poly **bird**, not a canary):

- Front: wings out left–right, body center  
- Side: **horizontal flyer** profile, wings thin, legs tucked  
- Top: wings as two lobes, head forward  

Product: [Animate Anything](https://everythinguniver.se/animate-anything) / [app](https://app.anything.world/animation-rigging)

### 3.4 Tooling present (partially useful)

```
scripts/canary-rig/
  .venv/                 # local; gitignored
  analyze_mesh.py        # OK — bounds / percentiles
  render_orthos.py       # OK — front / side L/R / top PNGs
  pose_fly_static.py     # FAILED experiment — do not use for delivery
  ANATOMY_NOTES.md       # postmortem + real canary photo guidance
  README.md
  out/                   # analysis + orthos (may include failed fly frames)
```

Venv setup:

```bash
cd scripts/canary-rig
python3 -m venv .venv
.venv/bin/pip install numpy trimesh pillow matplotlib
```

Ortho render (rest mesh):

```bash
.venv/bin/python render_orthos.py --mesh ../../public/static/canary.glb --tag rest
# → scripts/canary-rig/out/orthos/rest_{front,side_left,side_right,top}.png
```

### 3.5 Related docs (context only)

| Doc | Use |
| --- | --- |
| `CANARY-GAME.md` | Broader product vision (member gate, DevNet later) |
| `DEVNET.md` | Full-app DevNet port plan — **out of scope** for fly art |
| `scripts/canary-rig/ANATOMY_NOTES.md` | Why CLI failed + real canary references |

---

## 4. What failed (do not repeat)

### 4.1 `pose_fly_static.py` (numpy “wing open”)

- Soft lateral vertex swings / polar blends toward horizontal  
- **Destroyed** head/body/wing readability → cape / manta blob  
- User feedback: *completely butchered, looks awful*  
- **Discarded** as delivery path  

Artifacts named `canary-fly-static.*` may exist but were **restored from original** or are untrustworthy — **prefer regenerating only after a good Blender pose**.

### 4.2 Root cause

The asset is a **single fused mesh** with **folded wings**. There are no wing bones, no separate wing objects, no shape keys. Moving “side” vertices **moves the torso**. You cannot get a flying canary from a few global hinge heuristics.

---

## 5. Visual truth: real canaries (search these)

Use **real canary flight / wings-spread photos** as anatomy reference (not only `reference.jpg`):

**Search queries:**

- `canary bird flying wings spread`
- `canary in flight side view`
- `yellow canary wings open front view`
- `domestic canary flight wings outstretched`

**What a correct result must show:**

| View | Correct canary |
| --- | --- |
| Front | Round body; **two distinct wings** with roots, leading edge, primary tips — **not** one diamond sheet |
| Side | Head, plump body, tail; wing as **own plane** mid-torso; legs **tucked** under — **not** a standing perch with a cape |
| Top | Head forward, tail aft; wings as **two lobes** with wrist bend — **not** a stretched manta |

AW `reference.jpg` = orientation + category **bird**. Real photos = **shape** of a canary.

---

## 6. Recommended path for the next agent

### Phase A — Stabilize (if needed)

1. Confirm `/game` shows **original** canary, no navbar, no chain overlay.  
2. `yarn start` → `http://localhost:3000/game`  
3. Confirm `/` landing still has wireframe + effects.

### Phase B — Careful fly **rest** pose (hard part)

**Use Blender** (headless and/or GUI/MCP). Do **not** resume numpy delivery.

Suggested Blender workflow:

1. Import `public/assets/canary.obj` (or GLB).  
2. **Manually** assign vertex groups: `wing_L`, `wing_R`, `leg_L`, `leg_R`, `body`, `head`, `tail` — body weights must **not** bleed into wings.  
3. Optional: separate wing shells if topology allows **without** destroying silhouette.  
4. Pose wings open **incrementally** (small rotations at shoulder-like hinges).  
5. Tuck legs under belly.  
6. After **each** small step: export GLB → run `render_orthos.py` → compare to real canary photos + `reference.jpg`.  
7. **Stop for human review** before the next step.

Export targets:

- `public/static/canary-fly-static.glb`  
- `public/static/canary-fly-static.obj` (AW upload)

Wire `/game` only when the user accepts the static pose:

```ts
// GamePage.tsx
const GAME_OBJECT_URL = './static/canary-fly-static.glb'
```

**Quality gate before Anything World:**

- [ ] Still looks like **this** canary (not a new bird, not a blob)  
- [ ] Front/side/top orthos vs real canary photos are defensible  
- [ ] Wings read as wings; legs not splayed standing  
- [ ] User **explicitly approves**

### Phase C — Anything World Animate Anything

1. Upload approved `canary-fly-static.obj` as category **bird**.  
2. Align rotation UI to match left column of `reference.jpg`.  
3. Generate fly/flap (or closest bird locomotion).  
4. Download GLB → e.g. `public/static/canary-fly-anim.glb`.  
5. Human review in AW + files.

### Phase D — Play loop on `/game`

1. `useGLTF` + `useAnimations` (drei) on the animated GLB.  
2. Auto-play fly loop; no transition polish required yet.  
3. Keep bare sandbox (no navbar, no chain overlay, solid, static lights, grid).

### Phase E — Later (out of this handoff unless asked)

- Society **member** wallet gate (read-only `Society.Members` on Kusama)  
- Polkadot Products DevNet `pad` publish  
- See `CANARY-GAME.md` / `DEVNET.md`

---

## 7. Fallback ladder (if Blender pose still fails)

1. **Blender MCP / interactive** weight painting with user feedback  
2. **Commission / sculpt** a dedicated fly-rest canary consistent with brand  
3. **AW on rest pose** only as a long-shot experiment (low expectation)  
4. **Not recommended:** UniRig / regenerate bird with Meshy-like tools (loses brand mesh)

---

## 8. Commands cheat sheet

```bash
# Branch
git checkout game-prototype

# App
yarn start
# → http://localhost:3000/game
# → http://localhost:3000/   (landing must stay intact)

# Mesh analysis
scripts/canary-rig/.venv/bin/python scripts/canary-rig/analyze_mesh.py

# Orthos of current mesh
scripts/canary-rig/.venv/bin/python scripts/canary-rig/render_orthos.py \
  --mesh public/static/canary.glb --tag rest
```

**Do not run for delivery:**

```bash
# FAILED PATH — destroys mesh quality
scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly_static.py ...
```

---

## 9. File map (edit surface)

| Path | Action |
| --- | --- |
| `src/pages/GamePage.tsx` | Game config + which GLB to load |
| `src/pages/App.tsx` | `/game` outside MainApp (keep this split) |
| `src/canary-component/ThreeCanary.js` | Effects/grid/points/particles flags |
| `src/canary-component/Components.js` | Wireframe default, lights static flag, material styling |
| `public/static/canary.glb` | Rest source — **do not overwrite** |
| `public/static/canary-fly-static.*` | Only write **approved** fly rest exports |
| `public/static/canary-fly-anim.glb` | Future AW output (create when ready) |
| `reference.jpg` | AW orientation target |
| `scripts/canary-rig/*` | Analysis, orthos, failed pose experiment |

---

## 10. Acceptance criteria (end-to-end)

1. `/game`: original-quality canary or **approved** fly-rest mesh; no chrome/overlay.  
2. Static fly mesh: wings spread, legs tucked, **still a canary** under real-photo comparison.  
3. AW produces a fly loop user accepts.  
4. `/game` plays that loop.  
5. Landing `/` unchanged in look and behavior.

---

## 11. Message to DeepSeek (start here)

You inherit a working **bare Three.js canary sandbox** and a **failed** automatic fly-pose experiment. Your job is **not** to invent more numpy mesh destruction. Your job is to get a **hand-quality (Blender) flight rest pose** of **this** canary, validate with orthos + real canary flight images + user review, then use **Anything World** for the fly loop and wire playback on `/game`.

Read `scripts/canary-rig/ANATOMY_NOTES.md` and open `reference.jpg` before changing any mesh.

**First action:** confirm `/game` shows the clean rest canary; render rest orthos; propose a Blender step plan with the **smallest** first wing change for human approval.

## 12. New-agent warning (2026-08-08, from an aborted attempt)

A prior agent **installed Blender 5.2** (`brew install --cask blender`, headless `blender -b -P` works) and got **one step working** before being reverted. Findings worth keeping, all repo files from that attempt were removed:

- **Leg tuck (safe, local) works.** Pull low-Y foot verts toward a belly point `(0, -0.10, 0.72)` with a smoothstep weight that is 1 at the very bottom (`y≈-0.32`) and 0 at the ankle (`y≈-0.22`). Rest feet sit at `y∈[-0.32,-0.20]`, clustered at `z∈[0.4,1.1]` (head side). Result: feet rise to `y≈-0.18..-0.225`, torso untouched (max body move 0.0).
- **Do NOT use a rigid rotation around a single pivot for the tuck** — rear feet swing *down* (pivot-z dependent). Use a positional pull toward the belly instead.
- **Blender `bmesh` vertex order ≠ `mesh.vertices` order.** Compute weights directly from `obj.data.vertices` (a prior script zipped bmesh-derived weights against mesh verts — silently corrupted the export).
- **OBJ import in Blender merges dup verts** (1342 vs 3471 raw); GLB export round-trips fine and keeps edits. Verify via `trimesh` y-min / foot-y range after export, not by trusting the exporter.
- **The mesh still has NO separable wings** — lateral extremes are smooth torso wall (no crease/step, normals vary smoothly). A "wing raise" via the lateral band will deform the torso; only attempt it incrementally (`--wing-deg` ~5–12°) and check front/top orthos each step.
- This agent could not view images (no vision). Use real orthos + human review; if you can render, do so directly.

Reference tooling removed but reproducible: an ASCII-silhouette renderer (`render_ascii.py`, projects front/side/top to a 96×44 char grid) proved useful as "eyes" for a no-vision agent — recreate if needed.
