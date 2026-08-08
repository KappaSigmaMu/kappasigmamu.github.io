"""Dump canary part regions as rounded vertex POSITIONS for the region overlay render.

Classification lives in pose_fly.build_regions — this script must never re-implement it.
An earlier copy here drifted out of sync and reported regions the poser was not using.

Positions rather than indices, because every importer dedups differently.

  python extract_regions.py [--mesh public/static/canary.glb]
"""
import argparse, json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pose_fly import prepare

P = argparse.ArgumentParser()
P.add_argument('--mesh', default='public/static/canary.glb')
P.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                             'out', 'regions_pos.json'))
A = P.parse_args()

m, reg, _ = prepare(A.mesh)
out = {k: np.round(m.vertices[v], 5).tolist() for k, v in reg.items()}
os.makedirs(os.path.dirname(A.out), exist_ok=True)
json.dump(out, open(A.out, 'w'))
print('wrote', A.out)
for k in sorted(out):
    a = np.array(out[k])
    print(f'{k:>8}: {len(a):>5} verts  x[{a[:,0].min():>6.2f},{a[:,0].max():>6.2f}] '
          f'y[{a[:,1].min():>6.2f},{a[:,1].max():>6.2f}] z[{a[:,2].min():>6.2f},{a[:,2].max():>6.2f}]')
