"""Move the Anything World skeletal animations onto the current mesh.

Anything World rigs and animates whatever mesh you upload, so its output is welded to the
mesh it was given -- an older export. Rather than re-upload every time the pose changes, keep
its SKELETON and clips and transfer the skin weights onto the current mesh: the animation
lives on the joints, and the mesh only needs weights that say which joint moves what.

Usage:
  blender -b -P scripts/canary-rig/retarget.py -- --out public/static/canary-fly-anim.glb
"""
import bpy, sys, os

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None):
    return argv[argv.index(n) + 1] if n in argv else d

ANIM = 'scripts/canary-rig/animations'
MESH = arg('--mesh', 'public/static/canary-fly-static.glb')
OUT  = arg('--out',  'public/static/canary-fly-anim.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)

def bounds(o):
    pts = [o.matrix_world @ v.co for v in o.data.vertices]
    return (min(p.x for p in pts), max(p.x for p in pts))

# --- the rig and its first clip ---------------------------------------------------------
bpy.ops.import_scene.gltf(filepath=f'{ANIM}/fly/canary-fly-static_fly.glb')
rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
old = next(o for o in bpy.context.scene.objects if o.type == 'MESH' and o.parent == rig)
# Anything World ships a stray Icosphere in the scene; it is not part of the bird.
for o in [o for o in bpy.context.scene.objects if o.type == 'MESH' and o is not old]:
    bpy.data.objects.remove(o, do_unlink=True)
fly_act = bpy.data.actions[0]
fly_act.name = 'fly'

# --- the second clip, off an identical skeleton ------------------------------------------
before = set(bpy.data.actions)
bpy.ops.import_scene.gltf(filepath=f'{ANIM}/glide/canary-fly-static_glide.glb')
glide_act = next(iter(set(bpy.data.actions) - before))
glide_act.name = 'glide'
# The glide file's own rig and mesh are duplicates -- the node names and order match the fly
# file exactly, so its action drives this skeleton unchanged.
for o in list(bpy.context.scene.objects):
    if o is not rig and o is not old and o.type in ('ARMATURE', 'MESH'):
        bpy.data.objects.remove(o, do_unlink=True)

# --- the current mesh, scaled onto the rig ------------------------------------------------
before = set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=MESH)
new = next(o for o in set(bpy.context.scene.objects) - before if o.type == 'MESH')

o0, o1 = bounds(old)
n0, n1 = bounds(new)
# Wingspan is the stable landmark between versions (6.43-6.45 across every export), so it is
# what the scale is derived from rather than a bounding box that the leg pose keeps moving.
s = (o1 - o0) / max(n1 - n0, 1e-9)
new.scale = (s, s, s)
bpy.context.view_layer.update()
print(f'RETARGET scale {s:.3f}  old span {o1-o0:.2f}  new span {(n1-n0)*s:.2f}')

# --- weights ------------------------------------------------------------------------------
bpy.ops.object.select_all(action='DESELECT')
new.select_set(True)
bpy.context.view_layer.objects.active = new
mod = new.modifiers.new(name='DT', type='DATA_TRANSFER')
mod.object = old
mod.use_vert_data = True
mod.data_types_verts = {'VGROUP_WEIGHTS'}
mod.vert_mapping = 'POLYINTERP_NEAREST'
bpy.ops.object.datalayout_transfer(modifier=mod.name)
bpy.ops.object.modifier_apply(modifier=mod.name)
print(f'RETARGET vertex groups on new mesh: {len(new.vertex_groups)}')

# Bake the fitting scale into the vertices, then adopt the OLD mesh's object transform and
# parent-inverse verbatim. Anything World's rig carries a root rotation; giving the new mesh
# an identity parent-inverse made it inherit that rotation and the bird came out upside down,
# while cancelling the parent transform outright would put the mesh in a different space from
# the armature modifier. Copying the setup that already worked avoids both.
bpy.ops.object.select_all(action='DESELECT')
new.select_set(True)
bpy.context.view_layer.objects.active = new
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Cancel the rig's own transform instead of copying the old mesh's. Anything World stores its
# mesh data pre-flipped with an object matrix that flips it back, so copying that matrix onto
# our (unflipped) mesh applies the flip a second time and the bird exports upside down.
new.parent = rig
new.matrix_parent_inverse = rig.matrix_world.inverted()
am = new.modifiers.new(name='Armature', type='ARMATURE')
am.object = rig

bpy.data.objects.remove(old, do_unlink=True)

# --- stash both clips so the exporter emits two animations --------------------------------
if rig.animation_data is None:
    rig.animation_data_create()
rig.animation_data.action = None
# The glTF importer already stashed the imported clip in its own NLA track, so adding two more
# gave three animations on export ("rig|rig|fly" alongside "fly"). Clear the tracks first.
for t in list(rig.animation_data.nla_tracks):
    rig.animation_data.nla_tracks.remove(t)
# Drop every action except the two clips. Importing two glTFs leaves extra action datablocks
# behind, and the exporter emits them as duplicate animations ("rig|rig|fly" alongside "fly").
for a in list(bpy.data.actions):
    if a not in (fly_act, glide_act):
        bpy.data.actions.remove(a)
for act in (fly_act, glide_act):
    tr = rig.animation_data.nla_tracks.new()
    tr.name = act.name
    tr.strips.new(act.name, 0, act)

# Prove the skinning actually deforms: sample the fly clip and see the mesh move.
rig.animation_data.action = fly_act
dg = bpy.context.evaluated_depsgraph_get()
def sample(frame):
    bpy.context.scene.frame_set(frame)
    dg.update()
    ev = new.evaluated_get(dg)
    return [ (new.matrix_world @ v.co).copy() for v in ev.to_mesh().vertices ]
a = sample(int(fly_act.frame_range[0]))
b = sample(int(sum(fly_act.frame_range) / 2))
import math
d = max(math.dist(p, q) for p, q in zip(a, b)) if a and b else 0.0
print(f'RETARGET skin check: largest vertex motion across the fly clip = {d:.2f}')
rig.animation_data.action = None

print('RETARGET actions before export:', [a.name for a in bpy.data.actions])
print('RETARGET nla tracks:', [t.name for t in rig.animation_data.nla_tracks])
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB',
                          export_animations=True, export_animation_mode='NLA_TRACKS',
                          export_skins=True, export_apply=False)

# Blender's glTF exporter drops an armature's OBJECT scale (it writes the skeleton at its own
# rest scale), so the file comes out at Anything World's ~12x. Baking the scale into the
# armature is not safe -- bone translation F-curves are in bone space and would not be scaled
# with it, which breaks the clip. Instead wrap the scene in a scaled root node: a pure
# node-graph edit, and animation channels address nodes by index, so none of them move.
import json, struct
raw = open(OUT, 'rb').read()
jlen = struct.unpack('<I', raw[12:16])[0]
doc = json.loads(raw[20:20 + jlen])
blen = struct.unpack('<I', raw[20 + jlen:24 + jlen])[0]
bin_chunk = raw[28 + jlen:28 + jlen + blen]

k = 1.0 / s
roots = [i for i in range(len(doc['nodes']))
         if not any(i in n.get('children', []) for n in doc['nodes'])]
# ...and a -90deg turn about X. Cancelling the rig's transform leaves our mesh in Blender's
# Z-up frame while the exporter has already put the skeleton in glTF's Y-up, so the two come
# out with Y and Z exchanged. Verified by comparing bounds against the static export.
r2 = 0.7071067811865476
doc['nodes'].append({'name': 'fit_to_model', 'children': roots,
                     'scale': [k, k, k], 'rotation': [-r2, 0.0, 0.0, r2]})
doc['scenes'][0]['nodes'] = [len(doc['nodes']) - 1]

jb = json.dumps(doc, separators=(',', ':')).encode()
jb += b' ' * ((4 - len(jb) % 4) % 4)
bb = bin_chunk + b'\x00' * ((4 - len(bin_chunk) % 4) % 4)
out = (b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jb) + 8 + len(bb))
       + struct.pack('<I', len(jb)) + b'JSON' + jb
       + struct.pack('<I', len(bb)) + b'BIN\x00' + bb)
open(OUT, 'wb').write(out)
print(f'RETARGET wrapped in root node scaled {k:.5f}')
print('RETARGET wrote', OUT)
