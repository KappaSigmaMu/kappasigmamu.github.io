"""Numeric pass/fail checks for a posed canary — the objective half of the loop.

Eyeballing montages let a wing drift up beside the head without it being obvious.
These checks state the anatomy as numbers so a bad pose fails loudly instead of
looking "roughly ok" at thumbnail size.

  python diagnose.py --mesh public/static/canary-fly-static.glb
"""
import argparse, json, os, sys
import numpy as np
import trimesh

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pose_fly import prepare

UP, FWD = 1, 2


def landmarks(rest):
    """Locate anatomy on the REST mesh, where it is unambiguous."""
    V = rest.vertices
    head = V[(V[:, FWD] > 1.4) & (V[:, UP] > 1.7)]
    return {
        'beak_tip': V[np.argmax(V[:, FWD])],
        'head_centre': head.mean(0),
        'crown': V[np.argmax(V[:, UP])],
        'tail_tip': V[np.argmin(V[:, FWD])],
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--mesh', required=True)
    p.add_argument('--rest', default='public/static/canary.glb')
    p.add_argument('--json', action='store_true')
    A = p.parse_args()

    rest, reg, _ = prepare(A.rest)
    # No merge_vertices here: posing leaves detached parts sharing positions, so a
    # positional weld would collapse them and break the index mapping to the rest mesh.
    posed = trimesh.load(A.mesh, force='mesh', process=False)
    if len(posed.vertices) != len(rest.vertices):
        print('FATAL: vertex count changed, regions do not map'); sys.exit(2)

    V, R = posed.vertices, rest.vertices
    lm = landmarks(rest)
    # The head does not move, so rest landmarks are still valid for a posed mesh
    # unless --pitch was baked; re-derive the head from the posed body to be safe.
    body = V[reg['body']]
    head_posed = body[(body[:, FWD] > np.percentile(body[:, FWD], 88))]
    eye = head_posed.mean(0)

    checks, results = [], {}

    def check(name, ok, detail):
        checks.append((name, bool(ok), detail))

    torso = V[reg['body']]
    for side in ('L', 'R'):
        w = V[reg[f'wing_{side}']]
        d = np.linalg.norm(w - eye, axis=1)
        results[f'wing_{side}_min_dist_to_head'] = float(d.min())
        check(f'wing_{side} clear of head', d.min() > 0.75,
              f'closest wing vert is {d.min():.2f} from head centre (want > 0.75)')

        # Wing must be a roughly horizontal plate: its best-fit normal should point up.
        c = w.mean(0)
        _, _, vt = np.linalg.svd(w - c, full_matrices=False)
        n = vt[2] / np.linalg.norm(vt[2])
        tilt = np.degrees(np.arccos(abs(n[UP])))
        results[f'wing_{side}_plane_tilt_deg'] = float(tilt)
        check(f'wing_{side} plane horizontal', tilt < 30,
              f'wing plane is {tilt:.0f}deg off horizontal (want < 30)')

        span = vt[0] / np.linalg.norm(vt[0])
        lateral = np.degrees(np.arccos(min(abs(span[0]), 1.0)))
        results[f'wing_{side}_span_off_lateral_deg'] = float(lateral)
        check(f'wing_{side} points outboard', lateral < 35,
              f'span axis is {lateral:.0f}deg off lateral (want < 35)')

    legmin = min(V[reg['leg_L']][:, UP].min(), V[reg['leg_R']][:, UP].min())
    bellymin = torso[:, UP].min()
    results['leg_below_belly'] = float(bellymin - legmin)
    check('legs tucked', legmin >= bellymin - 0.02,
          f'lowest leg vert is {legmin - bellymin:+.2f} vs belly floor (want >= -0.02)')

    # --pitch is a global rotation, so compare shapes rather than positions: the body's
    # pairwise vertex distances are invariant under any rigid transform.
    bi = reg['body'][:400]
    def gram(P):
        return np.linalg.norm(P[:, None, :] - P[None, :, :], axis=2)
    bodymove = float(np.abs(gram(V[bi]) - gram(R[bi])).max())
    results['max_body_shape_change'] = bodymove
    check('body geometry untouched', bodymove < 1e-5,
          f'largest body shape change is {bodymove:.6f} (want ~0)')

    # Rigid parts must not change size. The first leg 'tuck' scaled the legs toward a
    # belly point, shrinking them to 26% — it read as tiny paws rather than tucked feet.
    E = posed.edges_unique
    for k in ('leg_L', 'leg_R', 'wing_L', 'wing_R', 'tail'):
        idx = set(reg[k].tolist())
        e = np.array([x for x in E if x[0] in idx and x[1] in idx])
        if not len(e):
            continue
        lr = np.linalg.norm(R[e[:, 0]] - R[e[:, 1]], axis=1)
        lp = np.linalg.norm(V[e[:, 0]] - V[e[:, 1]], axis=1)
        ok = np.abs(lp / np.maximum(lr, 1e-9) - 1)
        results[f'{k}_scale_err'] = float(ok.max())
        check(f'{k} not scaled', ok.max() < 0.02,
              f'edge lengths differ by up to {ok.max() * 100:.0f}% (want < 2%)')

    # Nothing may be left stranded: every island must still touch the bird. Catches
    # feather cards abandoned by a part that moved, and wing cards fanned so far they
    # tear gaps in the wing surface.
    keyp = np.round(V, 5)
    _, iv = np.unique(keyp, axis=0, return_inverse=True)
    wl = trimesh.Trimesh(vertices=np.unique(keyp, axis=0), faces=iv[posed.faces], process=False)
    cc = sorted(trimesh.graph.connected_components(
        wl.face_adjacency, nodes=np.arange(len(wl.faces))), key=len, reverse=True)
    # Measure against the NEAREST island, not against the torso. A posed wing plate
    # legitimately separates from the torso and carries its cards with it; what must not
    # happen is any piece ending up with nothing near it. So: link islands closer than
    # ISLAND_GAP and require the whole bird to remain one cluster.
    ISLAND_GAP = 0.15
    isl = [wl.vertices[np.unique(wl.faces[c])] for c in cc]
    n = len(isl)
    link = {i: set() for i in range(n)}
    nearest = [np.inf] * n
    for i in range(n):
        for j in range(i + 1, n):
            d = float(np.sqrt(((isl[i][:, None, :] - isl[j][None, :, :]) ** 2).sum(-1)).min())
            nearest[i] = min(nearest[i], d)
            nearest[j] = min(nearest[j], d)
            if d <= ISLAND_GAP:
                link[i].add(j); link[j].add(i)
    seen, stack = {0}, [0]
    while stack:
        for j in link[stack.pop()]:
            if j not in seen:
                seen.add(j); stack.append(j)
    loose = [i for i in range(n) if i not in seen]
    results['loose_islands'] = len(loose)
    results['worst_island_gap'] = float(max([nearest[i] for i in loose], default=0.0))
    check('nothing stranded', not loose,
          f'{len(loose)} island(s) disconnected, worst gap '
          f'{results["worst_island_gap"]:.2f} (want 0)')

    b = posed.bounds
    results['span_x'] = float(b[1][0] - b[0][0])
    results['len_z'] = float(b[1][2] - b[0][2])

    if A.json:
        print(json.dumps({'checks': [{'name': n, 'ok': o, 'detail': d} for n, o, d in checks],
                          'metrics': results}, indent=2))
    else:
        for n, ok, d in checks:
            print(f'{"PASS" if ok else "FAIL"}  {n:<28} {d}')
        print('\nspan X %.2f   length Z %.2f' % (results['span_x'], results['len_z']))
    sys.exit(0 if all(o for _, o, _ in checks) else 1)


if __name__ == '__main__':
    main()
