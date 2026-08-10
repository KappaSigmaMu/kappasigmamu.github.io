"""Fit the archived canary-component animations into this project's scene.

github.com/KappaSigmaMu/canary-component (branch `animations`) carries idle / walk / hop as
already-skinned, already-animated GLBs of the ORIGINAL canary. Nothing needs retargeting — the
mesh they animate is the model we still ship on the landing page. They only sit at ~19x this
project's scale, and off-centre.

  python scripts/canary-rig/fit_legacy_anims.py --src <clone>/public/assets

The mesh, skeleton and clips are untouched. Each file's roots gain one parent node carrying
scale and offset; animation channels address nodes by index, so none of them move. Same trick
as scripts/canary-rig/retarget.py.

Two things learned the hard way here:

  - No rotation is needed. An earlier version assumed the files were Z-up and added -90deg
    about X, which stood the bird on its tail. Measure before rotating.
  - VERIFY WITH BLENDER (scripts/canary-rig/animbounds-style evaluation) OR THE BROWSER, not
    with trimesh. trimesh applies node transforms without applying skinning, so for a skinned
    mesh it happily reported bounds matching the reference exactly while Blender and the
    browser both showed the bird upended. It cannot see this class of error.

Doing the fit inside Blender instead does NOT work: its glTF exporter drops an armature's
object-level transform, so the file comes back out at the original scale.
"""
import argparse
import json
import os
import struct

import trimesh

CLIPS = {'canary_idle.glb': 'canary-idle.glb',
         'canary_walk.glb': 'canary-walk.glb',
         'canary_hop.glb': 'canary-hop.glb'}


def read_glb(path):
    raw = open(path, 'rb').read()
    jlen = struct.unpack('<I', raw[12:16])[0]
    doc = json.loads(raw[20:20 + jlen])
    blen = struct.unpack('<I', raw[20 + jlen:24 + jlen])[0]
    return doc, raw[28 + jlen:28 + jlen + blen]


def write_glb(path, doc, blob):
    jb = json.dumps(doc, separators=(',', ':')).encode()
    jb += b' ' * ((4 - len(jb) % 4) % 4)
    bb = blob + b'\x00' * ((4 - len(blob) % 4) % 4)
    out = (b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jb) + 8 + len(bb))
           + struct.pack('<I', len(jb)) + b'JSON' + jb
           + struct.pack('<I', len(bb)) + b'BIN\x00' + bb)
    open(path, 'wb').write(out)


def wrap(doc, scale, translation):
    doc = json.loads(json.dumps(doc))
    roots = [i for i in range(len(doc['nodes']))
             if not any(i in n.get('children', []) for n in doc['nodes'])]
    doc['nodes'].append({'name': 'fit_to_scene', 'children': roots,
                         'scale': [scale] * 3, 'translation': list(translation)})
    doc['scenes'][0]['nodes'] = [len(doc['nodes']) - 1]
    return doc


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', required=True, help='the cloned repo public/assets directory')
    p.add_argument('--out', default='public/static')
    p.add_argument('--reference', default='public/static/canary.glb')
    a = p.parse_args()

    ref = trimesh.load(a.reference).bounds
    ref_span, ref_centre = ref[1] - ref[0], (ref[0] + ref[1]) / 2

    for src_name, out_name in CLIPS.items():
        src = os.path.join(a.src, src_name)
        doc, blob = read_glb(src)

        raw = trimesh.load(src).bounds
        scale = float(ref_span.max() / (raw[1] - raw[0]).max())

        tmp = os.path.join(a.out, '.fit_tmp.glb')
        write_glb(tmp, wrap(doc, scale, (0, 0, 0)), blob)
        got = trimesh.load(tmp).bounds
        offset = ref_centre - (got[0] + got[1]) / 2
        os.remove(tmp)

        out = os.path.join(a.out, out_name)
        write_glb(out, wrap(doc, scale, offset), blob)
        clip = [x.get('name') for x in doc.get('animations', [])]
        print(f'{out_name:18} scale {scale:.4f}  clip {clip}')


if __name__ == '__main__':
    main()
