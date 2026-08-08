# Canary fly pipeline (CLI)

Human-in-the-loop steps toward a fly loop via **static fly pose → Anything World Animate Anything**.

## Setup

```bash
cd scripts/canary-rig
python3 -m venv .venv
.venv/bin/pip install numpy trimesh pygltflib
```

`.venv/` is local tooling — do not commit.

## CP1 — Analyze (no deformation)

```bash
.venv/bin/python analyze_mesh.py
# → out/analysis.json
# → out/canary-regions-preview.glb
```

## CP2 — Static fly pose — **FAILED (do not use for delivery)**

Naive `pose_fly_static.py` vertex hinges **destroyed** the canary (cape/manta blob).  
See **`ANATOMY_NOTES.md`**. `/game` is back on **original** `canary.glb`.

Next attempt must be **Blender (careful weights / optional wing separation)** against real canary flight photos — not whole-mesh numpy polar blends.

## Orthographic screenshots (vs reference)

```bash
.venv/bin/python render_orthos.py --mesh ../../public/static/canary-fly-static.glb --tag fly
.venv/bin/python render_orthos.py --mesh ../../public/assets/canary.obj --tag rest
```

Outputs under `out/orthos/`:

| File | View |
| --- | --- |
| `fly_front.png` | Front (XY) |
| `fly_side_left.png` / `fly_side_right.png` | Side |
| `fly_top.png` | Top (XZ) |
| `fly_contact_sheet.png` | front+side+top stack |
| `compare_aw_vs_fly.png` | next to `reference.jpg` (if generated) |

## CP3 — Anything World

Upload `public/static/canary-fly-static.obj` as **bird**, align rotation to the reference, generate fly animations, save as `public/static/canary-fly-anim.glb`.

## Not used

UniRig / local ML auto-rig (by plan).
