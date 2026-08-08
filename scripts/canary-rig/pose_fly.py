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
# Leg vertices at or below this height are foot/toes rather than the shaft. The model has
# a real gap between the two: shaft ends at y=-0.03, foot starts at y=-0.20.
FOOT_Y = -0.10


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


def lay_out_feathers(pts, cards, idx, anchor, spread, base_span, sweep_back, scale=1.0,
                     min_len=0.5, min_aspect=2.0, tip_ratio=1.0, root_ratio=0.45):
    """Re-lay the wing's feather cards as a radiating fan.

    Reference canary flight photos show the wing as a fan of DISTINCT feather strips, not a
    solid blade. Rotating each card about its own quill (`--fan`) only splays the tips a
    little and bunches them at wide angles, because the cards start nearly parallel.

    This instead places each feather explicitly, still rigidly: keep its shape, but give it
    a new base along the wrist line and a new direction stepped across the fan. Longest
    feather (outer primary) points most outboard; shorter ones sweep progressively aft.

    Operates in left-wing space on `pts` (a copy of the wing vertices), where `cards` are
    index arrays into the same vertex numbering as `idx`.
    """
    pos = {v: i for i, v in enumerate(idx)}
    local = []
    excluded = []
    for vi in cards:
        loc = [pos[v] for v in vi if v in pos]
        if len(loc) < 3:
            continue
        # Only long, THIN cards are flight feathers. Measured on this wing:
        #   flight feathers  len 0.65-1.63, aspect 4.9-9.1
        #   wing plate       len 1.16, aspect 1.3  <- root structure, never fan it
        #   coverts          len 0.22-0.53, aspect 1.5-3.7  <- small, stay at the root
        # Fanning the plate and coverts alongside the feathers is what crams the mid-wing
        # into a lump instead of leaving elegant separate strips.
        q = pts[np.array(loc)]
        cq = q.mean(0)
        _, _, fv = np.linalg.svd(q - cq, full_matrices=False)
        ln = float(np.ptp((q - cq) @ fv[0]))
        wd = float(np.ptp((q - cq) @ fv[1]))
        if ln < min_len or ln / max(wd, 1e-6) < min_aspect:
            excluded.append(np.array(loc))
            continue
        local.append(np.array(loc))
    if len(local) < 2:
        return pts

    # Wing frame from all wing points: e1 outboard-ish, e2 chord, n plane normal.
    # World axes for a LEFT wing: outboard +X, aft -Z, wing-plane normal +Y.
    e1 = np.array([1.0, 0.0, 0.0])
    e2 = np.array([0.0, 0.0, -1.0])
    n = np.array([0.0, 1.0, 0.0])
    c = pts.mean(0)

    def feather_axis(q):
        cc = q.mean(0)
        _, _, fv = np.linalg.svd(q - cc, full_matrices=False)
        ax = fv[0]
        t = (q - cc) @ ax
        if np.linalg.norm(q[np.argmin(t)] - c) > np.linalg.norm(q[np.argmax(t)] - c):
            ax = -ax
        return ax / np.linalg.norm(ax), fv[2]

    # Longest feather first: that is the outer primary and takes the outboard-most slot.
    order = sorted(range(len(local)),
                   key=lambda i: -float(np.ptp((pts[local[i]] - pts[local[i]].mean(0)) @
                                               feather_axis(pts[local[i]])[0])))
    # Anchor the whole fan to the SHOULDER SOCKET, not to the outboard extreme of the
    # existing quills. Anchoring at the quills left the fan floating above and behind the
    # shoulder — the wings visibly did not join the body.
    # Bases run from the socket outboard: shortest feathers (secondaries) sit inboard near
    # the socket, the longest primary sits at the outboard end, as on a real wing.
    outward = e1

    longest = max(float(np.ptp((pts[loc] - pts[loc].mean(0)) @ feather_axis(pts[loc])[0]))
                  for loc in local)
    m = max(len(order) - 1, 1)
    for slot, i in enumerate(order):
        loc = local[i]
        q = pts[loc]
        ax, fn = feather_axis(q)
        quill = q[np.argmin((q - q.mean(0)) @ ax)]

        frac = slot / m
        ang = np.radians(sweep_back + spread * frac)
        # +e2, not -e2: with -e2 the fan sweeps toward the HEAD and half the feathers end
        # up pointing forward past the beak, giving a starburst instead of a swept wing.
        tgt = np.cos(ang) * e1 + np.sin(ang) * e2
        tgt /= np.linalg.norm(tgt)

        # Align (long axis, flat-side normal) -> (target direction, wing normal).
        src = np.column_stack([ax, fn / np.linalg.norm(fn), np.cross(ax, fn / np.linalg.norm(fn))])
        dst = np.column_stack([tgt, n, np.cross(tgt, n)])
        Rm = dst @ np.linalg.inv(src)

        base = anchor + outward * (base_span * (1.0 - frac))
        # The asset's feathers are short relative to the wing the reference shows. Stretch
        # each one ALONG ITS OWN AXIS only, so its width and shape are untouched and it
        # still reads as the same feather — just a longer one.
        local_q = (q - quill) @ Rm.T
        # Target length is set PER SLOT, not by scaling each feather's natural length.
        # Natural lengths run longest-outboard, which gives a long thin pointed wing. A
        # canary's wing is short and ROUND: the swept inner feathers are the long ones and
        # the outboard tip feathers are shorter, which fills the planform out.
        own = float(np.ptp(local_q @ tgt))
        if own > 1e-6:
            # Wing length profile, reading the reference: feathers are SHORT next to the
            # body (secondaries, coverts) and grow toward the outer wing (primaries), with
            # only the last couple tapering back for a rounded tip. frac 0 = outboard slot,
            # frac 1 = innermost, so length falls off as frac rises.
            prof = root_ratio + (1.0 - root_ratio) * (1.0 - frac)
            if frac < 0.3:                       # round off the very tip
                prof *= tip_ratio + (1.0 - tip_ratio) * (frac / 0.3)
            want = longest * scale * prof
            along = local_q @ tgt
            local_q = local_q + np.outer(along * (want / own - 1.0), tgt)
        pts[loc] = local_q + base

    # Cards the filter kept OUT of the fan (the 39-face plate, and anything too stubby to be
    # a flight feather) were previously left wherever the frame solve dropped them — up at
    # y 2.05 against a socket at 1.72, reading as a clump sitting on the shoulder. Seat them
    # against the socket instead, so the inner wing joins the body.
    for loc in excluded:
        q = pts[loc]
        seat = anchor + outward * 0.30
        pts[loc] = q - q.mean(0) + seat
    return pts



def add_membranes(m, reg, thickness, stations=14):
    """Author a wing surface by LOFTING along the span.

    The asset has no spread-wing surface (see 15.2): a 39-face root plate plus thin feather
    cards shaped to read as a wing only while folded. Spread, they are blades with air
    between them at any fan angle, so a surface has to be generated.

    An earlier version used the convex hull of the wing points. That is not a wing planform
    — in the app it rendered as a huge flat paddle. This version instead walks the span in
    `stations` steps and, at each one, takes the wing's leading and trailing extremes in
    chord. Lofting between consecutive stations follows the real outline, including its
    taper and concavity, and stays inside the feather tips instead of bridging across them.

    Built in the wing's own best-fit plane and extruded slightly so it reads solid from
    both sides rather than vanishing under backface culling.

    This is the ONLY place geometry is added. Head, body and tail stay rigid-only.
    """
    V = list(m.vertices)
    F = list(m.faces)
    for key in ('wing_L', 'wing_R'):
        pts = m.vertices[reg[key]]
        c = pts.mean(0)
        _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
        e1, e2, n = vt[0], vt[1], vt[2]
        if np.sign(e1[0]) != np.sign(c[0] if c[0] else 1.0):
            e1 = -e1                       # span axis points outboard
        u = (pts - c) @ e1
        v = (pts - c) @ e2
        w = (pts - c) @ n

        edges = []
        lo_u, hi_u = np.percentile(u, 1), np.percentile(u, 99)
        for t in np.linspace(lo_u, hi_u, stations):
            band = np.abs(u - t) <= (hi_u - lo_u) / (stations - 1)
            if band.sum() < 3:
                continue
            edges.append((t, np.percentile(v[band], 4), np.percentile(v[band], 96),
                          float(np.median(w[band]))))
        if len(edges) < 3:
            continue
        arr = np.array(edges)
        # Smooth the two chord edges so single stray feather tips do not scallop the outline.
        for col in (1, 2):
            arr[:, col] = np.convolve(arr[:, col], np.ones(3) / 3, mode='same')
            arr[0, col], arr[-1, col] = edges[0][col], edges[-1][col]

        base = len(V)
        for t, vlo, vhi, wm in arr:
            mid = c + e1 * t + n * wm
            for sgn in (1.0, -1.0):
                V.append(mid + e2 * vlo + n * (thickness / 2) * sgn)
                V.append(mid + e2 * vhi + n * (thickness / 2) * sgn)
        k = len(arr)
        # 4 verts per station: [lo_top, hi_top, lo_bot, hi_bot]
        for i in range(k - 1):
            a0, a1, a2, a3 = base + 4 * i, base + 4 * i + 1, base + 4 * i + 2, base + 4 * i + 3
            b0, b1, b2, b3 = a0 + 4, a1 + 4, a2 + 4, a3 + 4
            F += [[a0, a1, b1], [a0, b1, b0]]        # top skin
            F += [[a2, b3, a3], [a2, b2, b3]]        # bottom skin
            F += [[a0, b0, b2], [a0, b2, a2]]        # trailing rim
            F += [[a1, a3, b3], [a1, b3, b1]]        # leading rim
        reg[key] = np.concatenate([reg[key], np.arange(base, len(V))])
    m.vertices = np.array(V)
    m.faces = np.array(F)
    return m


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


def patch_shell(m, reg, faces):
    """Leave a copy of each wing plate welded into the torso.

    The 39-face wing plate is part of the positionally-welded shell — it IS the torso's
    wing-shaped skin. Moving it with the wing therefore opens a hole in the back, which is
    plainly visible in the app as a black gap at the shoulder.

    Duplicating it costs 78 faces: one copy travels with the wing, one stays behind and
    keeps the shell closed. The copy that stays reads as the scapular area, which is what
    that part of a bird looks like anyway.
    """
    key = np.round(m.vertices, 5)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    welded = trimesh.Trimesh(vertices=np.unique(key, axis=0), faces=inv[m.faces], process=False)
    wcc = sorted(trimesh.graph.connected_components(
        welded.face_adjacency, nodes=np.arange(len(welded.faces))), key=len, reverse=True)
    shell = np.zeros(len(m.faces), bool)
    shell[wcc[0]] = True

    V = list(m.vertices)
    F = list(m.faces)
    added = []
    for k in ('wing_L', 'wing_R'):
        plate = np.array([f for f in faces[k] if shell[f]], dtype=int)
        if not len(plate):
            continue
        vs = np.unique(m.faces[plate])
        remap = {}
        for v in vs:
            remap[int(v)] = len(V)
            V.append(m.vertices[v])
        for f in m.faces[plate]:
            F.append([remap[int(x)] for x in f])
        added.extend(remap.values())
    if not added:
        return m, reg
    out = trimesh.Trimesh(vertices=np.array(V), faces=np.array(F), process=False)
    reg['body'] = np.unique(np.concatenate([reg['body'], np.array(added, dtype=int)]))
    return out, reg


def prepare(path):
    """Load the rest mesh, recover parts, detach them. Shared by pose and diagnose."""
    m = trimesh.load(path, force='mesh')
    m.merge_vertices()
    reg, parts, faces = build_regions(m, want_parts=True)
    m = detach_parts(m, reg, faces)
    reg, parts, faces = build_regions(m, want_parts=True)
    m, reg = patch_shell(m, reg, faces)
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
    p.add_argument('--feather-fan', type=float, default=0.0, metavar='SPREAD',
                   help='re-lay the wing feathers as a radiating fan spanning this many '
                        'degrees, the way reference flight photos show them')
    p.add_argument('--feather-base-span', type=float, default=0.45,
                   help='how far the feather quills spread inboard from the wrist')
    p.add_argument('--feather-tip-ratio', type=float, default=1.0,
                   help='length of the outboard tip feather relative to the inboard ones. '
                        '<1 rounds the wing out; 1.0 gives a long thin pointed wing')
    p.add_argument('--feather-root-ratio', type=float, default=0.45,
                   help='length of the innermost feather relative to the longest. Real wings '
                        'are short at the body and long at the outer wing')
    p.add_argument('--feather-min-len', type=float, default=0.5,
                   help='cards shorter than this are coverts, not flight feathers')
    p.add_argument('--feather-min-aspect', type=float, default=2.0,
                   help='cards fatter than this length:width ratio are the plate or coverts')
    p.add_argument('--feather-scale', type=float, default=1.0,
                   help='lengthen each feather along its own axis (shape/width unchanged)')
    p.add_argument('--feather-sweep', type=float, default=10.0,
                   help='angle of the outermost feather from straight outboard')
    p.add_argument('--fan', type=float, default=0.0,
                   help='extra outboard rotation spread across the feather cards, distal card '
                        'gets the most; opens the folded stack into a coherent wing plane')
    p.add_argument('--wrist', type=float, nargs=3, default=None, help='LEFT wrist pivot for --fan')
    p.add_argument('--tail-fan', type=float, default=0.0,
                   help='spread the tail feathers about the tail base, as a bird does in flight')
    p.add_argument('--knee-fold', type=float, default=0.0,
                   help='degrees to draw the whole leg up and aft about the knee (rigid)')
    p.add_argument('--ankle-fold', type=float, default=0.0,
                   help='degrees to fold the foot up and aft about the heel (rigid)')
    p.add_argument('--foot-aim', type=float, nargs=3, default=None,
                   metavar=('X', 'Y', 'Z'),
                   help='aim each foot rigidly about its ankle so the heel->toe axis points '
                        'this way. Reference canaries in flight hang the toes DOWN and a '
                        'little forward, e.g. 0 -1 0.35')
    p.add_argument('--pitch', type=float, default=0.0, help='pitch the whole bird into a flight attitude')
    p.add_argument('--membrane', type=float, default=0.0,
                   help='author a wing surface of this thickness (see add_membranes). The '
                        'asset has no spread-wing surface, so without this the wing is blades')
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

        if A.feather_fan:
            # AFTER the frame solve, in left-wing world space. Laying the fan out in the
            # folded wing's frame gave a starburst: there "outboard" and "aft" are not
            # well defined, so target directions came out arbitrary. Here they are simply
            # world axes — outboard +X, aft -Z, up +Y — and the fan is unambiguous.
            pts = lay_out_feathers(pts, parts[key], idx, socket, A.feather_fan,
                                   A.feather_base_span, A.feather_sweep, A.feather_scale,
                                   A.feather_min_len, A.feather_min_aspect,
                                   A.feather_tip_ratio, A.feather_root_ratio)

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

    if A.knee_fold or A.ankle_fold:
        # The leg has two segments and two joints, and they must be driven separately.
        # Folding all 250 leg vertices rigidly about the top swings the forward-projecting
        # foot right around the bird, which reads as an over-tucked leg hinged at the ankle.
        #   shaft (tibiotarsus):  40 verts, y -0.03..0.35, near vertical
        #   foot  (toes):        210 verts, y -0.32..-0.20, projecting forward to z 1.01
        # Both moves stay rigid, so neither can change the foot's size.
        for key in ('leg_L', 'leg_R'):
            idx = reg[key]
            pts = V[idx].copy()
            foot = pts[:, GLTF_UP] <= FOOT_Y

            if A.ankle_fold and foot.any():
                # Ankle = the heel, the foot's upper-REAR corner. Folding there swings the
                # toes up and aft; folding at the toe tip would swing the whole foot out.
                fv = pts[foot]
                top = fv[fv[:, GLTF_UP] > fv[:, GLTF_UP].max() - 0.06]
                ankle = top[np.argsort(top[:, GLTF_FWD])[:4]].mean(0)
                Rm = rot([1, 0, 0], A.ankle_fold)
                pts[foot] = (pts[foot] - ankle) @ Rm.T + ankle

            if A.knee_fold:
                # Knee = where the shaft enters the body; draws the whole leg up and aft.
                knee = pts[pts[:, GLTF_UP] > np.percentile(pts[:, GLTF_UP], 92)].mean(0)
                Rm = rot([1, 0, 0], A.knee_fold)
                pts = (pts - knee) @ Rm.T + knee

            if A.foot_aim is not None and foot.any():
                # Real canaries in flight (reference photos) do NOT hold the foot flat: the
                # tarsus hangs down-and-slightly-forward under the belly and the toes curl
                # downward into a loose fist. The model's toes are rigid, so they cannot be
                # curled — but aiming the whole toe fan DOWNWARD foreshortens it to almost
                # the same silhouette, which a level sole never does.
                #
                # Rotate rigidly about the ankle so the foot's long axis (heel -> toe) points
                # along --foot-aim.
                fv = pts[foot]
                top = fv[fv[:, GLTF_UP] > fv[:, GLTF_UP].max() - 0.06]
                ankle2 = top[np.argsort(top[:, GLTF_FWD])[:4]].mean(0)

                c = fv.mean(0)
                _, _, vt = np.linalg.svd(fv - c, full_matrices=False)
                axis_f = vt[0] / np.linalg.norm(vt[0])
                # Orient heel -> toe: the toe end is the one further from the ankle.
                if (fv @ axis_f).max() - (ankle2 @ axis_f) < (ankle2 @ axis_f) - (fv @ axis_f).min():
                    axis_f = -axis_f

                tgt = np.array(A.foot_aim, float)
                tgt /= np.linalg.norm(tgt)
                cross = np.cross(axis_f, tgt)
                sn = np.linalg.norm(cross)
                if sn > 1e-8:
                    ang = np.degrees(np.arctan2(sn, float(axis_f @ tgt)))
                    pts[foot] = (pts[foot] - ankle2) @ rot(cross / sn, ang).T + ankle2

            V[idx] = pts


    m.vertices = V

    if A.membrane:
        add_membranes(m, reg, A.membrane)

    if A.pitch:
        m.vertices = m.vertices @ rot([1, 0, 0], A.pitch).T


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
