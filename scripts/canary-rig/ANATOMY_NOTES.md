# Why the CLI fly pose failed + real canary reference

## Verdict on the butchered mesh

**Not acceptable.** Soft vertex hinges / polar “wing open” on a **fused, low-poly, folded-wing** canary does not produce a bird. It produces a manta/cape blob:

- No separate wing bones or wing meshes to rotate
- “Opening” by swinging lateral vertices flattens the torso into the wing plane
- Feathers, wing chord, and elbow/wrist joints do not exist in the topology to preserve
- Result was embarrassing and is **discarded** (`/game` uses original `canary.glb` again)

**Lesson:** Do not ship heuristic whole-mesh deformation as a fly pose for this asset.

## What a real canary with wings spread looks like

Search themes (use these as visual targets, not the destroyed GLB):

| View | What you should see |
| --- | --- |
| **Front / head-on flight** | Small rounded body center; two **distinct** wings left/right, each with clear leading edge, primary tips, and gap at the body root — not a continuous diamond “cape” |
| **Side** | Classic bird silhouette: head, short neck, plump body, tail; wing as a **separate** plane attached mid-torso (often swept); legs **tucked under body**, not a standing perch pose |
| **Top** | Head forward, tail aft, wings as two **lobes** with visible wrist bend — not a single stretched sheet |

Stock / photo search queries that match the goal:

- `canary bird flying wings spread`
- `canary in flight side view`
- `yellow canary wings open front view`
- `domestic canary flight silhouette`

Useful starting points (web):

- Adobe Stock / Getty: “canary flying”, “canary wings spread”
- Shutterstock: “canary wing”, “flying canary”
- Museum note: spread-wing specimens (e.g. Burke Museum spread-wing collections) show **real** wing planform — useful for silhouette even though species varies

Anything World’s magenta bird in `reference.jpg` is a **generic low-poly flyer**, not a canary, but the **silhouette contract** is the same: articulated wings, readable side profile, clean top planform.

## What this mesh actually is

`public/assets/canary.obj` / `canary.glb`:

- Standing / perched rest pose
- Wings **folded** against the body (thin X extent)
- Single welded mesh, **no** armature, **no** shape keys, **no** named wing parts

You cannot “pose” it into a flying canary with a few numpy rotations without destroying form. That requires one of:

1. **Blender (or equivalent) sculpt/rig** — separate or weight-paint wings, pose carefully, preserve head/body/tail
2. **Author a second mesh** — fly-rest canary built or retargeted properly, still on-brand
3. **Accept rest pose for AW** and only use AW if their pipeline can invent a rig from standing birds (unlikely for good fly cycles)

## Correct next path (do not repeat the butcher)

1. Keep `/game` on **original** canary for visual QA of the real model  
2. Orthos of **rest only** for documentation (`render_orthos.py --tag rest`)  
3. **Blender** (headless or MCP):  
   - Import OBJ  
   - Identify wing vertex groups **manually** with soft weights that **do not** include torso  
   - Small, iterative wing raise — compare every step to real canary photos  
   - Export only when front/side/top still read as a canary  
4. Then Anything World — only if the static mesh still looks like a bird  

`pose_fly_static.py` remains in the repo as a **failed experiment**, not a pipeline step to run for delivery.
