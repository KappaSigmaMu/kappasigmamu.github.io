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

---

## 13. BREAKTHROUGH (2026-08-08, session 3) — the mesh IS separable

**Sections 4.2, 5 and 12 are wrong on the central technical claim.** The asset is not an
unseparable fused shell. Correcting the record:

### 13.1 What the earlier agents missed

They welded by **position** (`trimesh` default / Blender OBJ import), which collapses 3471
raw verts to 1342 and makes the bird look like one blob with "smooth torso walls". But the
canary was modelled as **separate objects that were joined and welded**, and those part
boundaries survive as **normal/UV splits** in the GLB. Weld *normal-aware* instead
(`trimesh.load(...); m.merge_vertices()` → 2151 verts) and the parts fall straight out:

| Component | Faces | What it is |
| --- | --- | --- |
| #0 / #1 | 488 ×2 | legs + feet (L/R) |
| **#2 / #3** | **39 ×2** | **wing plates (L/R)** |
| #4, #5 | 28 ×2 | beak/brow, vent |
| 12-face cards ×33 | 12 | wing coverts / primaries / tail feathers |

**The wing plate shares only 2 vertices with the rest of the mesh.** It is effectively a
free-floating part. So a wing can be moved as a **rigid body** — zero vertex deformation,
so the silhouette *cannot* be destroyed the way `pose_fly_static.py` destroyed it.

### 13.2 New tooling (use this)

| Path | Role |
| --- | --- |
| `scripts/canary-rig/blender_render.py` | Headless Blender **shaded** ortho renderer (front/back/side_l/side_r/top/persp). Far better feedback than matplotlib silhouettes. Optional `--groups` paints regions by colour to verify them. |
| `scripts/canary-rig/extract_regions.py` | Dumps part regions as rounded **positions** (importer-stable) → `out/regions_pos.json` |
| `scripts/canary-rig/pose_fly.py` | **The working poser.** Rigid wing rotation about a shoulder pivot + positional leg tuck. |

```bash
# pose
scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py \
  --yaw 70 --dihedral 10 --sweep 10 --leg-tuck 1.0 -o public/static/canary-fly-static.glb
# look at it
blender -b -P scripts/canary-rig/blender_render.py -- \
  --mesh public/static/canary-fly-static.glb --tag fly
```

`pose_fly.py` params: `--yaw` swings the folded wing from pointing aft to pointing outboard
(~70° is right); `--sweep` rakes it back again (**positive = aft**; getting this sign wrong
rakes the wings *forward* over the head); `--dihedral` raises the tips; `--leg-tuck` 0..1
pulls the feet to the belly (positional, never a rigid rotation — a rotation swings the rear
of the foot downward). The right wing is posed by mirroring into left space, applying the
identical matrix, and mirroring back, so symmetry is exact.

### 13.3 Two more things the folded wing hides

Spreading the wing by yaw alone produced a bird, but two defects only became visible once
it was open, and both have the same cause — **a folded wing is a 3D stack read edge-on**:

1. **The wing was a vertical fin.** The folded wing lies flat against the flank, so its
   plane is *vertical*. Rotating it about a vertical axis keeps it vertical, giving a fin
   rather than an airfoil. A real wing also rotates ~90° about its own span axis when it
   opens. Fix: `--twist -85`. Sanity check is `reference.jpg` — **front view should show
   wings as thin lines, top view as broad lobes.** If front looks broad, twist is wrong.
2. **The wing read as loose slats.** The coverts and primaries are stacked with fore/aft
   offsets that are invisible when folded but show as gaps once the wing swings outboard.
   Fix: `--fan 20`, which rakes each card about the wrist in proportion to its rank so they
   radiate in one plane. This also lengthens the wing (span 4.25 → 5.05).

The tail is made of cards too, so the same trick fans it: `--tail-fan 22`.

### 13.4 Current state — delivered

```bash
scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py \
  --yaw 90 --dihedral 20 --sweep 5 --twist -85 --fan 20 --tail-fan 22 \
  --leg-tuck 1.0 --pitch 25 -o public/static/canary-fly-static.glb
```

| File | Purpose |
| --- | --- |
| `public/static/canary-fly-static.glb` | what `/game` loads |
| `public/static/canary-fly-static.obj` | same pose, OBJ |
| `public/static/canary-fly-aw.obj` | **`--pitch 0`** variant for Anything World, in case a baked pitch fights their rotation UI |

Wings spread and flat, cards and tail fanned, legs fully tucked inside the belly
(`leg y[-0.09,0.19]` vs body `y[-0.55,1.50]`), body pitched into a flight attitude.
Head/body/tail geometry **unchanged** — every part moves rigidly.

`--pitch` sign: **positive levels the bird**; negative tips it further nose-up.
`--sweep` sign: **positive rakes aft**. Both are easy to get backwards.

### 13.5 Reference images

Real canary flight photos are scarce/blurry; nearest usable anatomy comes from other
**Fringillidae** (same family). Wikimedia Commons, freely licensed:

- `Carduelis_chloris_-Greenfinch_in_flight.jpg` — **best front view**, wings spread level
- `Passer_domesticus_flying.jpg` — 3/4 hover, wing root height + sweep
- `Flying_canary_cropped.jpg` — actual canary, horizontal body attitude, legs fully tucked

Rebuild the side-by-side camera-matched sheet with the montage step in this session's
history; output lands at `out/blender/compare_refs.png`.

---

## 14. Session 4 — a measured loop, and the structural limit it found

Section 13's pose was tuned by eye against thumbnail montages. That missed real defects
(wing geometry beside the eye, a torn torso). The loop was the problem, so it was rebuilt.

### 14.1 The loop — use `iterate.sh`, never `pose_fly.py` by hand

```bash
TAG=x1 scripts/canary-rig/iterate.sh --sweep 12 --rise 10 --fan 20 \
    --tail-fan 22 --leg-tuck 1.0 --pitch 25
```

pose -> **numeric gate** -> render -> 4-up contact sheet, exiting non-zero if the gate fails.

| Tool | Role |
| --- | --- |
| `diagnose.py` | pass/fail anatomy checks: wing clear of head, wing plane horizontal, span outboard, legs tucked, **body geometry provably untouched** |
| `blender_render.py --focus x,y,z --radius r` | close-up camera. Thumbnails cannot tell a hole in the shell from a wing seen edge-on; this can |
| `blender_render.py --groups regions.json` | paints regions by colour — the fastest way to check *classification* rather than pose |

**What the gate caught that eyeballing had not:** a string-edit that silently deleted the
whole wing loop; a 22-vertex tear where wings/legs shared vertices with the body; a
duplicated classifier in `extract_regions.py` that had drifted out of sync with the poser;
and wing-shaped holes torn in the back.

### 14.2 Euler angles replaced by a frame solve

Four coupled angles about a guessed pivot gave no guarantee about where the wing landed.
Now: build an orthonormal frame on the rest wing, build the frame it should occupy, solve
for the rotation between them (`wing_frame` / `target_frame`). Params are directly
geometric — `--sweep`, `--rise`, `--roll`, `--socket` — and the root lands on the socket by
construction. Note the rest wing's shoulder is its **forward** extreme; taking the
most-inboard vertex picks the aft primary tips instead and aims the wing backwards.

### 14.3 Part classification: the shell vs free cards

The decisive distinction, which proximity alone cannot give:

- **Positionally-welded shell** — 1762 of 2256 faces. Torso, wing plates, legs, tail
  structure. Removing any of it **tears a real hole**.
- **51 free-floating feather cards** — coverts, primaries, tail feathers laid on top.
  Safe to move.

A wing = its 39-face plate + free cards within `WING_ATTACH` (0.22) of it. Classifying by
face count and a bounding box (attempt 1) dropped coverts into `body` and left shards on
the spine; taking every nearby card regardless of shell membership (attempt 2) tore holes
in the back. Only the shell test gets both right.

### 14.4 STRUCTURAL LIMIT — read before trying to "fix" the back

**The folded wing's outer surface is part of the torso shell.** The 39-face plate is only
the wing's *under* surface. So spreading the wing necessarily exposes wing-shaped torso
skin, which reads as raised blades along the spine.

This is proven, not guessed: those blades are in the `body` group, and the gate reports
body shape change of **exactly 0.000000** — they were never moved. They were simply hidden
under the folded wing.

Three ways forward, in order of quality:

1. **Move the wing-skin shell faces with the wing and cap the boundary.** Correct fix.
   Needs hole-filling after the split — the boundary loop is small and roughly planar.
2. Leave them; position the wing to cover them. Cheap, reads as raised scapulars.
3. Accept a hole on the back — the spread wing hides it from most angles. Not recommended.

### 14.5 Current state

`--sweep 12 --rise 10 --fan 20 --tail-fan 22 --leg-tuck 1.0 --pitch 25`, all gate checks
passing, span 5.06. Holes and shards gone; wings coplanar, outboard, clear of the head.
Remaining known defect is 14.4.

**zsh does not word-split unquoted variables** — `$ARGS` reaches argparse as one token and
errors. Write pose arguments out in full, or use an array.

---

## 15. Session 5 — the four defects, and the wing's real limit

Reported: holes in the wings, holes in the back, shrunken paws, leftovers underneath.
All four turned out to be measurable, and three were my bugs.

### 15.1 Fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| **Paws tiny** | the "tuck" pulled leg verts *toward a belly point* — that is a **scale**, not a rotation. Legs came out at **26%** of size | `--leg-fold`: rigid rotation about the hip, plus an auto lift into the belly. A rotation cannot change size |
| **Leftovers underneath** | free toe/claw cards were classified `body`, so the leg moved and they stayed | free-card proximity attachment extended to legs and tail, not just wings (`LEG_ATTACH`) |
| **Holes between feathers** | `--fan` pivoted every card about one shared wrist, translating distant cards bodily away | pivot each card about **its own quill** (its proximal end), so the base stays put and only the tip splays |

Two new gate checks encode these permanently:

- **`<part> not scaled`** — per-part edge lengths must stay within 2% of rest. Catches the
  whole shrink/stretch bug class.
- **`nothing stranded`** — link islands closer than 0.15 and require **one cluster**.
  Measure against the *nearest island*, not the torso: a posed wing plate legitimately
  separates from the torso and carries its cards. Rest-mesh baseline: 51 free cards, max
  gap 0.123, zero over threshold — so the threshold is calibrated, and any stranded island
  in a posed mesh is a real regression.

Also: apply the leg lift **after** `--pitch`. Pitch rotates about X, so which vertex is
lowest depends on z and the pre-pitch ordering does not survive it.

### 15.2 STRUCTURAL — the wing has no surface

**Do not spend more time tuning wing parameters.** Rendered at `--fan 0`, `8` and `20`, the
spread wing is thin spiky blades with air between them in every case. The fan is not the
cause. The asset's wing is:

- a **39-face plate** — only the small root/under surface
- **~14 thin feather cards**, shaped to read as a wing *while stacked against the flank*
- an **outer surface that belongs to the torso shell** (see 14.4)

There is no spread-wing membrane anywhere in the mesh, because the model was only ever
built to be seen perched. No rigid arrangement of these parts can produce a solid wing.

Options, in order of quality:

1. **Author a wing membrane** — loft a low-poly surface from the wing's leading edge to the
   fanned primary tips, matching the facet style, and cap the 14.4 back opening at the same
   time. This is the only route to a real spread wing from this asset. It *adds* geometry,
   so it breaks the "rigid parts only" guarantee — that guarantee has protected the head,
   body and tail all along, so keep it scoped to the wing.
2. **Commission / sculpt a fly-rest canary** on-brand.
3. **Do not spread the wings at all** — animate a folded-wing idle, hop, or stylised flight.

### 15.3 Current state

```bash
scripts/canary-rig/iterate.sh --sweep 12 --rise 10 --fan 10 \
    --tail-fan 18 --leg-fold 140 --pitch 25
```

All 14 gate checks pass. Span 5.07. Legs correct size and tucked, nothing stranded, body
shape change exactly 0. Known remaining defects are 14.4 (back) and 15.2 (wing surface),
both structural.

---

## 16. Session 6 — two-joint legs, and the authored wing membrane

### 16.1 Legs have two segments and two joints

Measured, the leg is not one limb:

| Segment | Verts | Extent |
| --- | --- | --- |
| shaft (tibiotarsus) | 40 | `y -0.03..0.35`, `z 0.16..0.46`, near vertical |
| foot / toes | 210 | `y -0.32..-0.20`, projecting **forward** to `z 1.01` |

There is a real gap between them (`y -0.06..-0.18` is empty). Folding all 250 vertices
rigidly about the top swings the forward-projecting foot right around the bird — the thin
shaft disappears into the body and only the foot blob shows, which reads as a leg hinged at
the paw. Hence `--knee-fold` (whole leg, about where the shaft enters the body) and
`--ankle-fold` (foot only, about the **heel** — the foot's upper-REAR corner).

Chosen by measuring protrusion below the belly across a grid, not by eye:

| knee\ankle | 90 | 110 | 130 | 150 |
| --- | --- | --- | --- | --- |
| 60 | -0.273 | -0.161 | -0.105 | -0.087 |
| **75** | -0.082 | -0.008 | **+0.011** | +0.003 |
| 105 | +0.235 | +0.235 | +0.235 | +0.221 |

Perched rest is -0.233. `knee 75 / ankle 130` sits flush; 105+ buries the leg inside the
body — that was the "tucked way too far".

`legs tucked` now requires >= -0.12 rather than 0. Full concealment is stricter than this
model can do while the leg still reads as a leg; the bar is "clearly tucked, not perched",
which is roughly a 50% reduction in protrusion.

**Rigidity is checked per SEGMENT, not per part.** A joint necessarily stretches the edges
crossing it — that is what bending is. Shaft and foot are each verified rigid (0%).

### 16.2 The authored wing membrane (`--membrane`)

Per 15.2 the asset has no spread-wing surface, so one is generated. Per wing, after posing:
best-fit plane of the wing vertices, convex hull of their in-plane projection (a bird's
planform is close to convex), triangulated as a fan and extruded slightly so it reads solid
from both sides instead of vanishing under backface culling.

**This is the only place geometry is added.** Head, body and tail remain rigid-only and the
gate still proves it (`body geometry untouched` = 0.000000). `diagnose.py` compares the
leading `len(rest)` vertices so the added geometry does not break the index mapping.

### 16.3 Current state — all 16 checks pass

```bash
scripts/canary-rig/iterate.sh --sweep 12 --rise 10 --fan 10 --tail-fan 18 \
    --knee-fold 75 --ankle-fold 130 --membrane 0.03 --pitch 25
```

Wings solid, legs correctly jointed and tucked, nothing stranded, body untouched.
**Still open:** the exposed scapular blades on the back (14.4) and the membrane's straight
hull chord where it crosses the shoulder.

### 16.4 Two traps that cost real time

- **`str.replace('', x)` inserts between every character.** Building an edit as
  `s[s.index(A):s.index(B)]` yields `''` when B precedes A in the file, which blew
  `pose_fly.py` up to 439k lines. Always assert the slice is non-empty before replacing.
- **zsh does not word-split unquoted variables** — this bit `$ARGS`, `$P` and `set -- $combo`.
  Write arguments out in full, or use a shell function taking `"$1" "$2"`.

---

## 17. Session 7 — REVIEW IN THE APP, NOT IN BLENDER

### 17.1 The process failure

Sessions 3-6 validated against Blender Workbench renders and `diagnose.py`. The deliverable
is a **three.js page**. Blender renders backfaces and shades differently, so it hid holes
that `/game` shows plainly, and the gate only measures geometry (rigid, connected,
unscaled) — all of which can pass on something that looks bad. 16/16 green while the app
showed a giant flat paddle for a wing.

**Always review at `http://localhost:3000/game` before calling anything done.**
`?cam=x,y,z` overrides the camera so any angle can be checked without an edit-and-reload:

```
/game?cam=8,1.5,0.01     right side
/game?cam=-8,1.5,0.01    left side
/game?cam=4,2,8          three-quarter
```

A straight-overhead camera (`cam=0,9,0`) does **not** give a top view — the up-vector
degenerates when the view direction is parallel to it, and OrbitControls resolves it to a
front-ish view. A true top-down needs the controls' up vector changed, not just a position.

Two things only the app showed:
- The camera was at 3.4 units for a 5-unit wingspan, so the bird was cropped off-screen.
- `--membrane` (the convex-hull wing surface) renders as an enormous flat paddle. **Turned
  off.** A convex hull of the wing points is not a wing planform. If revisited, it must be
  a lofted surface following the leading edge and feather tips, reviewed in the app.

### 17.2 Back hole — fixed by duplicating the wing plate

The 39-face wing plate is part of the welded shell: it *is* the torso's wing-shaped skin.
Moving it with the wing opened a hole at the shoulder. `patch_shell()` duplicates it — one
copy travels with the wing, one stays welded into the torso. Costs 78 faces and closes the
opening. The copy left behind reads as the scapular area.

### 17.3 Paws

Toe direction was measured rather than guessed: at `--ankle-fold` 180-200 the toe tip
points aft **and up**, which is the natural tucked position; below 155 the toes still point
down. Shipping `--knee-fold 85 --ankle-fold 190`, which puts the lowest leg vertex +0.01
above the belly floor with toes trailing aft.

### 17.4 Current state

```bash
scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py \
  --sweep 12 --rise 10 --fan 10 --tail-fan 18 \
  --knee-fold 85 --ankle-fold 190 --pitch 0 -o public/static/canary-fly-static.glb
```

Gate passes. Back hole largely closed, paws tucked with toes aft. **Wings still read as
thin slats** — 15.2 stands, the asset has no wing surface and that is not fixable by posing.

---

## 18. Session 8 — flat feet, lofted membrane

### 18.1 Feet were standing on edge

Measured: the sole is **1.5deg** from horizontal at rest but **83.6deg** after posing. Cause —
`--knee-fold` and `--ankle-fold` both rotate about X, so their angles **add** on the foot
(85 + 190 = 275), tipping the sole vertical. It read as thin blades, not feet.

`--foot-flat` levels each sole with the **minimal rotation taking its normal to vertical**.
Rotating about X alone cannot do it — the sole's normal also has an X component because the
toes fan sideways, which left a 33deg residual. The general rotation gives **0.0deg**.

Watch this whenever either fold angle changes — the tilt is the SUM, so it silently
reappears. `--foot-flat` recomputes from the actual plane, so it self-corrects.

**Fold angles matter separately from tilt.** At knee 85 / ankle 190 the foot ended up
*above* the shaft (foot y 0.39..0.58 vs shaft 0.12..0.44), so what hung down was the leg
bone with the foot folded up behind it. Sweep for "foot below shaft AND protrusion near
zero" — knee 65 / ankle 40 gives foot y -0.18..-0.04 with protrusion -0.00.

### 18.2 Membrane: loft, not hull

The convex-hull membrane (16.2) rendered in the app as a huge flat paddle — a hull is not a
wing planform. Replaced with a **span-wise loft**: walk the span in `stations` steps, take
the wing's leading and trailing chord extremes at each (4th/96th percentile, smoothed over
3 stations), and loft between consecutive stations. This follows the real outline including
taper and concavity, and stays inside the feather tips instead of bridging across them.

In the app the wings now read as continuous tapered surfaces rather than slats.

### 18.3 Current state

```bash
scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py \
  --sweep 12 --rise 10 --fan 10 --tail-fan 18 \
  --knee-fold 85 --ankle-fold 190 --foot-flat --membrane 0.04 \
  --pitch 0 -o public/static/canary-fly-static.glb
```

Gate passes; body shape change 0.000000. Back closed (17.2), feet flat and tucked, wings
lofted. Remaining: the wing chord is narrow (reads glider-ish rather than finch-ish) and
there is a dark seam at the wing root in three-quarter views.

### 18.4 Feet: flat AND facing forward

`--foot-flat` does three things, in order, all pivoted on the ankle:

1. **Level the sole** with the *minimal* rotation taking its normal to vertical. Rotating
   about X alone cannot do it — the normal also has an X component because the toes fan
   sideways, which left a 33deg residual. General rotation gives **0.0deg**.
2. **Spin 180deg about the vertical** if the toes ended up trailing aft, so they face
   forward. The sole is normal to that axis, so this cannot re-tilt it.

Fold angles are a separate concern from tilt: at knee 85 / ankle 190 the foot ended up
*above* the shaft, so what hung down was the leg bone with the foot folded behind it.
Sweep for "foot below shaft AND protrusion near zero" — knee 65 / ankle 40.

### 18.5 Orbit was clamped to the horizon

`Components.js` hard-coded `minPolarAngle = PI/2.8`, `maxPolarAngle = PI/1.8` — a ~36deg band
around the horizon, so a top-down view was impossible. These are now read from config with
those values as defaults, so the landing canary is unchanged, and `GamePage` overrides them
with `minPolarAngle: 0, maxPolarAngle: Math.PI` for the full sphere.

### 18.6 Feet: aim them, do not level them (reference photos)

Real canary flight photos settle it: the legs hang **down and slightly forward** under the
belly and the toes **curl downward into a loose fist**. A sole held flat and parallel to the
ground is wrong — that is a perched foot.

The model's toes are rigid geometry and cannot be curled without deforming them. But aiming
the whole toe fan DOWNWARD foreshortens it to nearly the same silhouette. Hence
`--foot-aim X Y Z`: a rigid rotation about the ankle putting the foot's heel->toe axis along
the given direction. `--foot-aim 0 -1 0.35` (down, slightly forward) matches the references.

`--foot-flat` (level the sole, spin toes forward) is superseded and removed — it produced a
perched foot on a flying bird.

Shipping `--knee-fold 85 --ankle-fold 0 --foot-aim 0 -1 0.35`.

`--knee-fold` is the tuck dial — it swings the whole leg aft about the knee. Measured as the
knee->foot angle from vertical, and the drop of the foot below the belly floor:

| knee-fold | aft angle | drop below belly |
| --- | --- | --- |
| 40 | +1deg | -0.69 |
| 55 | +12deg | -0.60 |
| 70 | +23deg | -0.49 |
| **85** | **+35deg** | **-0.35** |
| 100 | +48deg | -0.20 |

`--foot-aim` is applied AFTER the knee fold, so changing the tuck does not disturb the toe
direction — the foot is re-aimed from wherever the leg ends up.

### 18.7 Two review gotchas

- **A camera inside the model's bounds renders nothing.** The bird spans about +-2.5 in x
  and z, so `?cam=1.8,0.2,2.6` sits inside it and the page looks blank.
- **A fresh navigate needs ~15s** before the canary appears; a blank screenshot at 6-10s is
  usually still loading, not broken. Wait again on the loaded page rather than re-navigating.

---

## 19. Session 9 — the wing, finally

Reference canary flight photos show the wing as a **fan of distinct feather strips**, widely
spread, and essentially the same from above and below. Not a solid blade.

### 19.1 `--feather-fan`: re-lay the feathers, do not just rotate them

`--fan` rotates each card about its own quill. At wide angles it only bunches them, because
the cards start nearly parallel. `--feather-fan` instead **places each feather explicitly**:
keep its shape, give it a new base along the wrist line and a new direction stepped across
the fan. Longest feather (outer primary) takes the outboard slot; shorter ones sweep aft.

Two things that had to be right:

- **It runs in the FOLDED wing's space**, before the frame solve. There the wing runs
  fore-aft with the shoulder forward, so the spanwise axis must be oriented root -> tip,
  i.e. pointing **aft**. Orienting it by +z aims the whole fan at the head and bunches every
  feather into a blob.
- **`--feather-scale`**: the asset's feathers are far too short for a reference-like wing.
  Re-basing them at the wrist without scaling makes the wing *shorter*. 2.2 works. Each
  feather is stretched **along its own axis only**, so its width and shape are untouched.

Shipping `--feather-fan 70 --feather-scale 2.2 --feather-base-span 0.5`, membrane **off** —
the membrane fills exactly the gaps between feathers that make the wing read as strips.

### 19.2 Feather cards are single-sided

From below the wings rendered solid black: the cards are single-sided planes and we were
seeing backfaces. `model.doubleSided: true` (GamePage) sets `THREE.DoubleSide`, so the wing
reads the same from above and below. **Blender Workbench renders backfaces by default and
hides this entirely** — another thing only the app shows.

### 19.3 Rigidity check split

`--feather-scale` is deliberate, so a blanket "wing not scaled" check would fail a correct
pose. The check now covers `wing_L_plate` / `wing_R_plate` (which must stay rigid); the
feathers are intentionally lengthened. Do not simply delete the check if it fires — work out
whether the pose or the target is wrong.

### 19.4 Refining the fan — two bugs behind the "lump"

Measuring the wing cards gave a clean three-way split:

| kind | length | aspect | |
| --- | --- | --- | --- |
| flight feathers | 0.65-1.63 | 4.9-9.1 | the thin strips |
| **wing plate** | 1.16 | **1.3** | 31 verts, root structure |
| coverts | 0.22-0.53 | 1.5-3.7 | small, belong at the root |

**Bug 1: the plate and the coverts were being laid out as feathers.** Scaled and slotted
into the fan they became wide chunks that overlapped into a lump at mid-wing.
`--feather-min-len` / `--feather-min-aspect` restrict the fan to genuinely thin cards.

**Bug 2: the layout ran in the FOLDED wing's frame.** There "outboard" and "aft" are not
well defined, so target directions came out arbitrary — half the feathers pointed forward
past the beak, a starburst rather than a swept wing. Flipping signs did not fix it because
the frame itself was the problem. The layout now runs **after** the frame solve, in
left-wing world space, where the axes are simply outboard +X, aft -Z, up +Y.

Shipping:

```bash
--feather-fan 50 --feather-sweep 12 --feather-scale 1.9 --feather-base-span 1.0 \
--feather-min-aspect 2.0 --feather-min-len 0.3
```

Dials: `--feather-min-aspect` controls density (2.0 admits the secondaries for a fuller
wing; 4.0 gives only the long primaries and reads sparse), `--feather-fan` the spread,
`--feather-scale` the length. Span is now 8.64.

### 19.5 Anchor the fan at the socket, and the leftover inner-wing clump

**Anchor bug.** `lay_out_feathers` originally based the fan on the outboard extreme of the
existing quills. That left the whole wing floating above and behind the shoulder — visibly
not joined to the body. Bases now run from the **shoulder socket** outboard: shortest
feathers (secondaries) inboard near the socket, longest primary at the outboard end.

**Known remaining defect — the inner-wing clump.** Measured vertical spread of `wing_L`
against outboard distance:

| x | spread | max y |
| --- | --- | --- |
| 0.2-0.8 | 0.23 | 1.91 |
| 0.8-1.6 | **0.39** | **2.09** |
| 1.6-2.6 | 0.03 | 1.73 |
| 2.6-4.5 | 0.04 | 1.73 |

The fanned feathers are coplanar to within 0.04 — they are fine. The clump is the cards the
aspect/length filter **excludes** from the fan (coverts + the 39-face plate): they are never
repositioned, so they stay where the frame solve put them, at y up to 2.09 versus a socket
at 1.72. From the side they read as a dark lump sitting on the back.

Fix direction: give the excluded cards their own placement pass — lay them as the wing's
inner surface just outboard of and slightly below the socket, rather than leaving them
wherever the frame solve landed.

### 19.6 Rounding the wing, and seating the inner cards

**Per-slot target length (`--feather-tip-ratio`).** Scaling each feather by its *natural*
length keeps the longest feather outboard, which gives a long thin pointed wing — far wider
than a canary's. Length is now set **per slot**: `longest * scale * (tip_ratio + (1-tip_ratio)
* frac)`, so the swept inner feathers are the long ones and the outboard tip feathers are
shorter. That fills the planform out into the rounded shape a canary actually has.
`tip_ratio` 1.0 = old pointed behaviour. 0.65 over-corrected (span 4.56, too compact);
**0.80 with `--feather-scale 1.55` is shipping, span 6.03** — between the 8.53 pointed wing
and the 4.56 stubby one.

**Seating the excluded cards.** `--feather-min-aspect` / `--feather-min-len` keep the plate
and stubby cards out of the fan, but nothing then placed them, so they stayed where the
frame solve dropped them — y up to 2.05 against a socket at 1.72, a clump on the shoulder.
They are now seated at `socket + outward*0.30`. Max y 2.05 -> **1.88**, spread 0.36 -> 0.18.

Shipping:

```bash
--feather-fan 55 --feather-sweep 12 --feather-scale 1.2 --feather-tip-ratio 0.65 \
--feather-base-span 0.8 --feather-min-aspect 1.5 --feather-min-len 0.15
```

### 19.7 The length profile was inverted

Reading the reference properly: a wing is **short next to the body** (coverts, secondaries)
and grows **longer toward the outer wing** (primaries), with only the last couple of
feathers tapering back for a rounded tip.

19.6's profile did the opposite — longest inboard — which is why every blade looked the same
size and the inner ones looked too big. Corrected:

```
prof = root_ratio + (1 - root_ratio) * (1 - frac)      # frac 0 = outboard, 1 = innermost
if frac < 0.3:  prof *= tip_ratio + (1 - tip_ratio) * (frac / 0.3)   # round the tip
```

`--feather-root-ratio` (0.45) is how short the innermost feather is; `--feather-tip-ratio`
(0.88) only rounds off the outermost few now, rather than driving the whole gradient.

Feathers also needed to sit **close together** — `--feather-fan` came down 55 -> 40 so the
blades nearly touch instead of leaving gaps.

Shipping:

```bash
--feather-fan 40 --feather-sweep 12 --feather-scale 1.55 --feather-tip-ratio 0.88 \
--feather-root-ratio 0.45 --feather-base-span 0.8 \
--feather-min-aspect 1.5 --feather-min-len 0.15
```

Span 6.42.
