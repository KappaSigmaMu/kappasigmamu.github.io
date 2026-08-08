"""Headless Blender shaded ortho renderer — the "eyes" for pose iteration.

Usage:
  blender -b -P blender_render.py -- --mesh <glb> --tag <name> [--groups <json>]

Renders front / side / top / three-quarter Workbench passes to out/blender/<tag>_*.png.
If --groups is given (JSON: {"name": [[x,y,z], ...]} of rounded rest positions),
each group is painted a distinct flat colour so regions can be verified visually
before posing. Positions are used rather than indices because every importer
dedups vertices differently.
"""
import bpy, sys, os, json, math

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default


MESH = arg('--mesh')
TAG = arg('--tag', 'render')
GROUPS = arg('--groups')
FOCUS = arg('--focus')      # "x,y,z" in glTF coords — close-up on a suspect area
RADIUS = float(arg('--radius', '0.9'))
OUT = arg('--out', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'blender'))
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=MESH)
obj = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = obj

# Flatten any glTF node transform into the mesh so ortho framing is predictable.
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

PALETTE = [
    (0.92, 0.20, 0.22, 1), (0.20, 0.55, 0.95, 1), (0.25, 0.80, 0.35, 1),
    (0.98, 0.75, 0.10, 1), (0.75, 0.35, 0.90, 1), (0.10, 0.85, 0.85, 1),
]

mesh = obj.data
mesh.materials.clear()
base = bpy.data.materials.new('base')
base.use_nodes = False
base.diffuse_color = (0.78, 0.78, 0.82, 1)
mesh.materials.append(base)

legend = []
if GROUPS:
    groups = json.loads(open(GROUPS).read())
    # Map rounded rest position -> local vertex index for this import.
    lut = {}
    for v in mesh.vertices:
        lut.setdefault((round(v.co.x, 5), round(v.co.y, 5), round(v.co.z, 5)), []).append(v.index)
    for i, (name, positions) in enumerate(sorted(groups.items())):
        idxs = []
        for x, y, z in positions:
            # glTF Y-up -> Blender Z-up: (x, y, z)_gltf == (x, -z, y)_blender
            idxs += lut.get((round(x, 5), round(-z, 5), round(y, 5)), [])
        col = PALETTE[i % len(PALETTE)]
        mat = bpy.data.materials.new(name)
        mat.use_nodes = False
        mat.diffuse_color = col
        mesh.materials.append(mat)
        slot = len(mesh.materials) - 1
        want = set(idxs)
        # A face joins the group only if every one of its verts is in the group,
        # so boundary faces stay neutral and the seam stays readable.
        for poly in mesh.polygons:
            if all(v in want for v in poly.vertices):
                poly.material_index = slot
        legend.append((name, col, len(idxs)))

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.show_object_outline = True
scene.display.render_aa = '16'
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.film_transparent = False
scene.world = bpy.data.worlds.new('w')
scene.world.color = (0.05, 0.05, 0.07)

lo, hi = [min(v.co[i] for v in mesh.vertices) for i in range(3)], [max(v.co[i] for v in mesh.vertices) for i in range(3)]
ctr = [(lo[i] + hi[i]) / 2 for i in range(3)]
span = max(hi[i] - lo[i] for i in range(3)) * 1.15

cam_data = bpy.data.cameras.new('cam')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = span
cam = bpy.data.objects.new('cam', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

D = span * 3
# glTF import puts the model Y-up -> Blender Z-up, so the mesh nose is along -Y.
VIEWS = {
    'front':  ((ctr[0], ctr[1] - D, ctr[2]), (math.pi / 2, 0, 0)),
    'back':   ((ctr[0], ctr[1] + D, ctr[2]), (math.pi / 2, 0, math.pi)),
    'side_l': ((ctr[0] - D, ctr[1], ctr[2]), (math.pi / 2, 0, -math.pi / 2)),
    'side_r': ((ctr[0] + D, ctr[1], ctr[2]), (math.pi / 2, 0, math.pi / 2)),
    'top':    ((ctr[0], ctr[1], ctr[2] + D), (0, 0, 0)),
    'persp':  ((ctr[0] - D * 0.62, ctr[1] - D * 0.62, ctr[2] + D * 0.45),
               (math.radians(60), 0, math.radians(-45))),
}

if FOCUS:
    # Thumbnails cannot distinguish a hole in the shell from a wing seen edge-on.
    # A tight camera on a named point can. Input is glTF (Y-up); Blender is Z-up.
    fx, fy, fz = [float(t) for t in FOCUS.split(',')]
    f = (fx, -fz, fy)
    cam_data.ortho_scale = RADIUS * 2
    d = span * 3
    VIEWS = {
        'zoom_side':  ((f[0] + d, f[1], f[2]), (math.pi / 2, 0, math.pi / 2)),
        'zoom_front': ((f[0], f[1] - d, f[2]), (math.pi / 2, 0, 0)),
        'zoom_top':   ((f[0], f[1], f[2] + d), (0, 0, 0)),
        'zoom_persp': ((f[0] - d * 0.6, f[1] - d * 0.6, f[2] + d * 0.45),
                       (math.radians(60), 0, math.radians(-45))),
    }
    # An ortho camera frames about its own axis, so offset the two free axes onto f.
    VIEWS = {k: ((v[0][0], v[0][1], v[0][2]), v[1]) for k, v in VIEWS.items()}

for name, (loc, rot) in VIEWS.items():
    cam.location = loc
    cam.rotation_euler = rot
    scene.render.filepath = os.path.join(OUT, f'{TAG}_{name}.png')
    bpy.ops.render.render(write_still=True)
    print('WROTE', scene.render.filepath)

if legend:
    print('LEGEND:', ', '.join(f'{n}({c}) n={k}' for n, c, k in legend))
print('BOUNDS', lo, hi)
