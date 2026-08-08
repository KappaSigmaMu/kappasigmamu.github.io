"""Rigid-part fly pose for the Kusama canary.

This is NOT the discarded `pose_fly_static.py` approach. That one blended whole-mesh
vertex hinges by heuristic and destroyed the silhouette. This script instead uses the
artist's own part boundaries: the canary was modelled as separate objects (wings, legs,
feather cards, tail) and joined, and those seams survive as normal/UV splits. Splitting
on normal-aware face adjacency recovers them, and the wing plate turns out to share only
2 vertices with the rest of the shell.

So each wing is moved as a RIGID BODY about a shoulder pivot. No vertex is deformed, so
the wing cannot lose its shape — it can only be aimed correctly or incorrectly.

The right wing is posed by mirroring into left space, applying the identical transform,
and mirroring back, which makes symmetry exact by construction.

  python pose_fly.py --yaw 78 --dihedral 8 --sweep 6 --twist 0 --leg-tuck 0.7 -o out.glb
"""
import argparse, json, os
import numpy as np
import trimesh

GLTF_UP, GLTF_FWD = 1, 2  # Y up, +Z toward the head

# Max distance from the wing plate for a FREE-FLOATING feather card to count as part of
# the wing. Measured from the card-to-plate distance histogram: wing cards <= 0.20, the
# nearest non-wing card is 0.25. Only ever applied to non-shell cards.
WING_ATTACH = 0.22
# Same idea for the legs: free cards this close to a leg shell travel with it. Without
# this the toe cards stay behind and read as debris under the bird.
LEG_ATTACH = 0.15


def rot(axis, deg):
    axis = np.asarray(axis, float)
    axis = axis / np.linalg.norm(axis)
    t = np.radians(deg)
    c, s = np.cos(t), np.sin(t)
    x, y, z = axis
    return np.array([
        [c + x * x * (1 - c),     x * y * (1 - c) - z * s, x * z * (1 - c) + y * s],
        [y * x * (1 - c) + z * s, c + y * y * (1 - c),     y * z * (1 - c) - x * s],
        [z * x * (1 - c) - y * s, z * y * (1 - c) + x * s, c + z * z * (1 - c)],
    ])


def build_regions(m, want_parts=False):
    """Recover artist parts from normal-aware seams (see module docstring).

    With want_parts, also returns each wing's individual feather cards, ordered
    distal-first, so they can be fanned relative to one another.
    """
    comps = sorted(
        trimesh.graph.connected_components(m.face_adjacency, nodes=np.arange(len(m.faces))),
        key=len, reverse=True)
    # Which faces belong to the single positionally-welded shell (torso + wing plates +
    # legs + tail structure), and which are free-floating feather cards laid on top.
    # This is the discriminator that proximity alone cannot give: shell faces cannot be
    # taken into a moving part, because removing them tears an actual hole in the bird.
    key = np.round(m.vertices, 5)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    welded = trimesh.Trimesh(vertices=np.unique(key, axis=0), faces=inv[m.faces], process=False)
    wcc = sorted(trimesh.graph.connected_components(
        welded.face_adjacency, nodes=np.arange(len(welded.faces))), key=len, reverse=True)
    shell = np.zeros(len(m.faces), bool)
    shell[wcc[0]] = True

    boxes = []
    for c in comps:
        vi = np.unique(m.faces[c])
        v = m.vertices[vi]
        boxes.append((c, vi, v, v.min(0), v.max(0)))

    # Seed each wing with its 39-face plate, then attach cards by PROXIMITY to that
    # plate. Classifying by face count and a bounding box instead (the first attempt)
    # silently dropped every 2- and 4-face covert into `body`, so they stayed welded to
    # the back while the wing rotated away — visible as loose shards along the spine.
    # Measured, card-to-plate distance separates cleanly: wing cards land under 0.20,
    # the nearest non-wing card is at 0.25.
    plates = {}
    for c, vi, v, lo, hi in boxes:
        cx = (lo[0] + hi[0]) / 2
        if len(c) >= 30 and abs(cx) > 0.2 and 1.0 < (lo[1] + hi[1]) / 2 < 2.0:
            plates['L' if cx > 0 else 'R'] = v

    def plate_dist(v, side):
        P = plates.get(side)
        if P is None:
            return np.inf
        return float(np.sqrt(((v[:, None, :] - P[None, :, :]) ** 2).sum(-1)).min())

    legs = {}
    for c, vi, v, lo, hi in boxes:
        if len(c) >= 300 and lo[1] < -0.2:
            legs['L' if (lo[0] + hi[0]) / 2 > 0 else 'R'] = v

    def near(v, seed, limit):
        if seed is None:
            return False
        return float(np.sqrt(((v[:, None, :] - seed[None, :, :]) ** 2).sum(-1)).min()) <= limit

    reg = {}
    faces = {}
    parts = {'wing_L': [], 'wing_R': [], 'tail': []}
    for c, vi, v, lo, hi in boxes:
        cx = (lo[0] + hi[0]) / 2
        ay, az = (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2
        side = 'L' if cx > 0 else 'R'
        if len(c) >= 300 and lo[1] < -0.2:
            k = f'leg_{side}'
        elif plates.get(side) is not None and v is plates[side]:
            k = f'wing_{side}'
        elif (abs(cx) > 0.05 and not shell[c].any()
              and plate_dist(v, side) <= WING_ATTACH):
            k = f'wing_{side}'      # free-floating covert / primary lying on the wing
        elif not shell[c].any() and near(v, legs.get(side), LEG_ATTACH):
            k = f'leg_{side}'       # toe/claw cards, else stranded under the bird
        elif az < -0.5 and (abs(cx) <= 0.25 or not shell[c].any()):
            k = 'tail'              # aft cards regardless of how far off-centre they sit
        else:
            k = 'body'
        reg.setdefault(k, []).append(vi)
        faces.setdefault(k, []).append(np.asarray(c))
        if k in parts:
            # Wings rank by how far aft the card reaches (aft-most = outer primary,
            # fans furthest). Tail feathers rank left-to-right across the fan instead.
            parts[k].append((cx if k == 'tail' else lo[2], vi))
    out = {k: np.unique(np.concatenate(v)) for k, v in reg.items()}
    fout = {k: np.unique(np.concatenate(v)) for k, v in faces.items()}
    if want_parts:
        for k in parts:
            parts[k] = [vi for _, vi in sorted(parts[k], key=lambda t: t[0])]
        return out, parts, fout
    return out, fout


def detach_parts(m, reg, faces, keys=('wing_L', 'wing_R', 'leg_L', 'leg_R')):
    """Give each moving part its own copy of any vertex it shares with the body.

    The wing plate shares 2 vertices with the rest of the shell and each leg a handful.
    Left welded, rotating a wing drags those vertices and tears the torso; the numeric
    'body geometry untouched' check catches it. Splitting them costs nothing visually —
    the mesh is already full of normal seams and the split sits inside the torso — and it
    makes the parts genuinely independent, which is what the artist's originals were.

    Deterministic, so pose and diagnose derive identical indices from the same rest mesh.
    """
    V = list(m.vertices)
    F = m.faces.copy()
    for k in keys:
        fk = faces[k]
        n = len(V)                            # V grows as earlier keys split off
        mine = np.zeros(n, bool)
        mine[np.unique(F[fk])] = True
        other = np.zeros(n, bool)
        mask = np.ones(len(F), bool); mask[fk] = False
        other[np.unique(F[mask])] = True
        shared = np.where(mine & other)[0]
        if not len(shared):
            continue
        remap = {}
        for v in shared:
            remap[v] = len(V)
            V.append(V[v])
        sub = F[fk]
        for a in range(sub.shape[0]):
            for b in range(3):
                if sub[a, b] in remap:
                    sub[a, b] = remap[sub[a, b]]
        F[fk] = sub
    out = trimesh.Trimesh(vertices=np.array(V), faces=F, process=False)
    return out


def prepare(path):
    """Load the rest mesh, recover parts, detach them. Shared by pose and diagnose."""
    m = trimesh.load(path, force='mesh')
    m.merge_vertices()
    reg, parts, faces = build_regions(m, want_parts=True)
    m = detach_parts(m, reg, faces)
    reg, parts, faces = build_regions(m, want_parts=True)
    return m, reg, parts


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--mesh', default='public/static/canary.glb')
    p.add_argument('-o', '--out', required=True)
    p.add_argument('--sweep', type=float, default=12.0,
                   help='degrees the span axis rakes aft from straight-out (0 = pure T)')
    p.add_argument('--rise', type=float, default=10.0, help='degrees the span axis rises (dihedral)')
    p.add_argument('--roll', type=float, default=0.0,
                   help='leading-edge-down roll of the wing plane about its own span axis')
    p.add_argument('--socket', type=float, nargs=3, default=[0.26, 1.72, 0.78],
                   help='where the LEFT wing root attaches, inside the torso shoulder')
    p.add_argument('--fan', type=float, default=0.0,
                   help='extra outboard rotation spread across the feather cards, distal card '
                        'gets the most; opens the folded stack into a coherent wing plane')
    p.add_argument('--wrist', type=float, nargs=3, default=None, help='LEFT wrist pivot for --fan')
    p.add_argument('--tail-fan', type=float, default=0.0,
                   help='spread the tail feathers about the tail base, as a bird does in flight')
    p.add_argument('--leg-fold', type=float, default=0.0,
                   help='degrees to fold each leg rigidly about its hip, swinging the foot '
                        'aft and up under the belly (rigid: never changes the foot size)')
    p.add_argument('--pitch', type=float, default=0.0, help='pitch the whole bird into a flight attitude')
    A = p.parse_args()

    m, reg, parts = prepare(A.mesh)
    V = m.vertices.copy()

    # --- wing transform -------------------------------------------------------
    # Composing yaw/sweep/dihedral/twist about a guessed pivot couples four angles and
    # gives no guarantee about where the wing actually lands — that is how wing geometry
    # ended up beside the head. Instead: build an orthonormal frame on the rest wing,
    # build the frame we want it to occupy, and solve for the rotation between them.
    # The wing then lands where it is specified to land, by construction.

    def wing_frame(pts):
        """(root, e1 span, e2 surface-normal, e3) for a left wing in rest space."""
        c = pts.mean(0)
        _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
        axis = vt[0]
        if axis[GLTF_FWD] < 0:
            axis = -axis                     # orient forward: the shoulder end
        t = (pts - c) @ axis
        # Shoulder is the FORWARD extreme of the folded wing; the aft extreme is the
        # primary tips. Taking the most-inboard vertex instead picks the wrong end,
        # because the primaries taper toward the body as they run aft.
        root = pts[np.argsort(t)[-8:]].mean(0)
        tip = pts[np.argsort(t)[:8]].mean(0)
        e1 = tip - root
        e1 /= np.linalg.norm(e1)
        n = vt[2]
        if n[0] < 0:
            n = -n                           # folded wing normal faces outboard
        e2 = n - e1 * (n @ e1)
        e2 /= np.linalg.norm(e2)
        return root, e1, e2, np.cross(e1, e2)

    def target_frame(sweep_deg, rise_deg, roll_deg):
        sw, ri = np.radians(sweep_deg), np.radians(rise_deg)
        E1 = np.array([np.cos(ri) * np.cos(sw), np.sin(ri), -np.cos(ri) * np.sin(sw)])
        E1 /= np.linalg.norm(E1)
        up = np.array([0.0, 1.0, 0.0])
        E2 = up - E1 * (up @ E1)
        E2 /= np.linalg.norm(E2)
        E2 = rot(E1, roll_deg) @ E2          # leading-edge-down roll about the span axis
        return E1, E2, np.cross(E1, E2)

    socket = np.array(A.socket, float)
    print('left wing socket', np.round(socket, 3))

    def quill(pts):
        """A feather card's own base: its forward (proximal) end."""
        z = pts[:, GLTF_FWD]
        return pts[np.argsort(z)[-3:]].mean(0)

    for key, mirror in (('wing_L', 1.0), ('wing_R', -1.0)):
        idx = reg[key]
        pts = V[idx].copy()
        pts[:, 0] *= mirror                      # into left space

        if A.fan:
            cards = parts[key]
            n = max(len(cards) - 1, 1)
            pos = {v: i for i, v in enumerate(idx)}
            for r, vi in enumerate(cards):
                loc = [pos[v] for v in vi if v in pos]
                if not loc:
                    continue
                # Pivot each card about ITS OWN quill, not a shared wrist. Rotating every
                # card about one point translates the far ones bodily away and tears holes
                # between them; pivoting at the base keeps every card attached where it
                # meets the wing and splays only the tip, which is how feathers open.
                F = rot([0, 1, 0], -A.fan * (1.0 - r / n))
                q = quill(pts[loc])
                pts[loc] = (pts[loc] - q) @ F.T + q

        # Fan first, then frame: fanning moves the primary tips, so the span axis must
        # be measured after it or the solve aims the wrong direction.
        root, e1, e2, e3 = wing_frame(pts)
        E1, E2, E3 = target_frame(A.sweep, A.rise, A.roll)
        Rm = np.column_stack([E1, E2, E3]) @ np.column_stack([e1, e2, e3]).T
        pts = (pts - root) @ Rm.T + socket

        pts[:, 0] *= mirror                      # back out
        V[idx] = pts
    if A.tail_fan:
        # Tail feathers are cards too, stacked closed in the perched pose. Splay them
        # about the tail base, symmetric about the centreline.
        tail_cards = parts['tail']
        xs = np.array([V[vi][:, 0].mean() for vi in tail_cards])
        rng = max(np.abs(xs).max(), 1e-6)
        for vi, cx in zip(tail_cards, xs):
            # Same rule as the wing: pivot at each feather's own base, so the fan opens
            # without pulling feathers off the tail stub.
            T = rot([0, 1, 0], -A.tail_fan * (cx / rng))
            q = quill(V[vi])
            V[vi] = (V[vi] - q) @ T.T + q

    if A.leg_fold:
        # RIGID fold about the hip. An earlier version pulled leg vertices toward a belly
        # point, which is a scale, not a rotation: it shrank the legs to 26% of size and
        # read as tiny paws. A rigid rotation cannot change the foot's size at all.
        for key in ('leg_L', 'leg_R'):
            idx = reg[key]
            pts = V[idx]
            hip = pts[pts[:, GLTF_UP] > np.percentile(pts[:, GLTF_UP], 92)].mean(0)
            # Fold about the left-right axis so the tarsus swings aft and up under the
            # belly, the way a bird actually stows it.
            Rm = rot([1, 0, 0], A.leg_fold)
            V[idx] = (pts - hip) @ Rm.T + hip


    m.vertices = V

    if A.pitch:
        m.vertices = m.vertices @ rot([1, 0, 0], A.pitch).T

    if A.leg_fold:
        # After the global pitch, not before: pitch rotates about X, so which vertex is
        # lowest depends on z and the pre-pitch ordering does not survive it.
        W = m.vertices
        floor = W[reg['body']][:, GLTF_UP].min()
        for key in ('leg_L', 'leg_R'):
            idx = reg[key]
            lift = floor - W[idx][:, GLTF_UP].min()
            if lift > 0:
                W[idx] = W[idx] + np.array([0.0, lift + 0.03, 0.0])
        m.vertices = W

    os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
    m.export(A.out)

    b = m.bounds
    print('wrote', A.out)
    print('bounds', np.round(b, 3).tolist())
    print('span X %.2f  Y %.2f  Z %.2f' % tuple(b[1] - b[0]))
    json.dump({k: v.tolist() for k, v in reg.items()},
              open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                'out', 'regions_idx.json'), 'w'))


if __name__ == '__main__':
    main()
