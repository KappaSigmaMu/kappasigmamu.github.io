#!/usr/bin/env python3
"""Aggressive static flight pose for Anything World bird reference.

Produces public/static/canary-fly-static.{glb,obj}

Rest mesh: Y-up, +Z toward head, wings folded (thin X).
Target: wings horizontal & wide, legs tucked, mild flight pitch.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OBJ = ROOT / "public" / "assets" / "canary.obj"
OUT_DIR = Path(__file__).resolve().parent / "out"
PUBLIC_STATIC = ROOT / "public" / "static"


def load_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(path, force="mesh", process=False)
    if isinstance(loaded, trimesh.Scene):
        loaded = trimesh.util.concatenate(list(loaded.geometry.values()))
    mesh = loaded.copy()
    try:
        mesh.remove_unreferenced_vertices()
    except Exception:
        pass
    return mesh


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / max(edge1 - edge0, 1e-9), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def rot_x(deg: float) -> np.ndarray:
    a = np.deg2rad(deg)
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=np.float64)


def pose_flight(
    v: np.ndarray,
    wing_open: float = 0.95,
    wing_span_scale: float = 2.7,
    leg_tuck: float = 1.0,
    flight_pitch_deg: float = 55.0,
) -> tuple[np.ndarray, dict]:
    out = v.copy()
    x0, y0, z0 = v[:, 0].copy(), v[:, 1].copy(), v[:, 2].copy()

    y_lo = float(np.percentile(y0, 3))
    y_p15 = float(np.percentile(y0, 15))
    y_p30 = float(np.percentile(y0, 30))
    y_chest = float(np.percentile(y0, 50))
    y_hi = float(np.percentile(y0, 95))
    z_p20, z_p75, z_p88 = np.percentile(z0, [20, 75, 88])

    # --- Legs first (on REST pose weights so wings don't steal feet) ---
    leg_w = (1.0 - smoothstep(y_lo, y_p30, y0)) * leg_tuck
    # Feet are toward the head/front on this mesh (higher Z)
    leg_w = leg_w * (0.35 + 0.65 * smoothstep(float(np.percentile(z0, 35)), float(np.percentile(z0, 80)), z0))
    leg_w = np.clip(leg_w, 0.0, 1.0)

    belly_y = y_chest - 0.05
    z_mid = float(np.median(z0))
    out[:, 0] = out[:, 0] * (1.0 - 0.85 * leg_w)  # pull toward spine
    out[:, 1] = y0 * (1.0 - leg_w) + belly_y * leg_w
    out[:, 2] = z0 * (1.0 - 0.4 * leg_w) + (z0 * 0.4 + z_mid * 0.6) * (0.4 * leg_w)

    x, y, z = out[:, 0], out[:, 1], out[:, 2]

    # --- Wings: mid-height, lateral, torso Z; EXCLUDE legs ---
    lat = np.abs(x0)
    lat_score = smoothstep(0.08, 0.28, lat)
    # Prefer mid band (not feet, not crest-only)
    height_score = smoothstep(y_p30, y_chest - 0.05, y0) * (1.0 - smoothstep(y_chest + 0.7, y_hi, y0))
    torso_z = smoothstep(z_p20 - 0.1, z_p20, z0) * (1.0 - smoothstep(z_p75, z_p75 + 0.25, z0))
    head_pen = smoothstep(z_p88, float(np.percentile(z0, 97)), z0) * smoothstep(y_chest, y_hi, y0)
    leg_pen = leg_w  # already computed

    wing_w = np.clip(
        (0.5 * lat_score + 0.4 * height_score + 0.35 * torso_z) * wing_open - 0.9 * head_pen - 1.0 * leg_pen,
        0.0,
        1.0,
    )

    # Polar open in XY around chest
    dx = x - 0.0
    dy = y - y_chest
    radius = np.hypot(dx, dy)
    angle = np.arctan2(dy, dx)
    rest_dir = np.stack([np.cos(angle), np.sin(angle)], axis=1)
    rest_dir = np.where(radius[:, None] > 1e-6, rest_dir, np.array([1.0, 0.0]))
    target_angle = np.where(x0 >= 0.0, 0.0, np.pi)
    tgt_dir = np.stack([np.cos(target_angle), np.sin(target_angle)], axis=1)
    blend = wing_w[:, None]
    mixed = rest_dir * (1.0 - blend) + tgt_dir * blend
    mixed /= np.linalg.norm(mixed, axis=1, keepdims=True) + 1e-9

    tip = smoothstep(0.1, 0.4, lat) * (1.0 - leg_pen)
    new_radius = radius * (1.0 + (wing_span_scale - 1.0) * tip * wing_w)
    new_radius = new_radius + 0.12 * wing_w * wing_span_scale

    new_x = mixed[:, 0] * new_radius
    new_y = y_chest + mixed[:, 1] * new_radius
    # Flatten to wing plane
    flat = 0.75 * wing_w
    new_y = new_y * (1.0 - flat) + y_chest * flat

    out[:, 0] = x * (1.0 - wing_w) + new_x * wing_w
    out[:, 1] = y * (1.0 - wing_w) + new_y * wing_w

    # --- Flight pitch: rotate whole bird around X so body is more horizontal ---
    # Standing bird → pitch so +Z (head) lifts less relative; rotate so belly faces -Y-ish.
    # Positive rot_x lifts +Z? R_x: (y,z) -> (c y - s z, s y + c z)
    # We want head (+Z) to move forward/horizontal: pitch nose down-ish from standing...
    # For AW side profile (horizontal flyer), rotate so spine ~ along Z stays but
    # standing upright becomes belly-down: rotate -pitch around X so +Y moves toward +Z? 
    # Actually: standing Y-up to flight belly-down with nose +Z:
    # rotate +90° around X: Y->Z, Z->-Y would put head down. 
    # For nose-forward flight with belly down: common is pitch so body long axis is Z,
    # and "up" is still roughly Y — standing already has long axis Z and up Y.
    # AW side view bird is elongated horizontally — that's Z on screen with Y up.
    # Our side already shows elongated Z... the issue is LEGS and upright TORSO silhouette.
    # Mild pitch (nose up) for flight attitude:
    if abs(flight_pitch_deg) > 0.5:
        # Pivot around body center
        c = out.mean(axis=0)
        R = rot_x(-flight_pitch_deg)  # nose (+Z) up slightly for flight
        out = (R @ (out - c).T).T + c

    stats = {
        "wing_weight_mean": float(wing_w.mean()),
        "wing_weight_p90": float(np.percentile(wing_w, 90)),
        "leg_weight_mean": float(leg_w.mean()),
        "leg_weight_p90": float(np.percentile(leg_w, 90)),
        "extent_before": (v.max(0) - v.min(0)).tolist(),
        "extent_after": (out.max(0) - out.min(0)).tolist(),
        "y_chest": y_chest,
        "flight_pitch_deg": flight_pitch_deg,
    }
    return out, stats


def center_plant(mesh: trimesh.Trimesh) -> None:
    mesh.vertices -= mesh.vertices.mean(axis=0)
    mesh.vertices[:, 1] -= mesh.vertices[:, 1].min()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, default=DEFAULT_OBJ)
    p.add_argument("--wing-open", type=float, default=0.95)
    p.add_argument("--wing-span", type=float, default=2.7)
    p.add_argument("--leg-tuck", type=float, default=1.0)
    p.add_argument("--pitch", type=float, default=35.0, help="Flight pitch degrees (nose up)")
    args = p.parse_args()

    mesh = load_mesh(args.input)
    v0 = np.asarray(mesh.vertices, dtype=np.float64)
    v1, stats = pose_flight(
        v0,
        wing_open=args.wing_open,
        wing_span_scale=args.wing_span,
        leg_tuck=args.leg_tuck,
        flight_pitch_deg=args.pitch,
    )
    mesh.vertices = v1
    center_plant(mesh)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_STATIC.mkdir(parents=True, exist_ok=True)
    glb = PUBLIC_STATIC / "canary-fly-static.glb"
    obj = PUBLIC_STATIC / "canary-fly-static.obj"
    mesh.export(glb)
    mesh.export(obj)
    mesh.export(OUT_DIR / "canary-fly-static.glb")

    summary = {
        "glb": str(glb.relative_to(ROOT)),
        "obj": str(obj.relative_to(ROOT)),
        "params": {
            "wing_open": args.wing_open,
            "wing_span": args.wing_span,
            "leg_tuck": args.leg_tuck,
            "pitch": args.pitch,
        },
        "stats": stats,
        "bounds_min": mesh.vertices.min(0).tolist(),
        "bounds_max": mesh.vertices.max(0).tolist(),
    }
    (OUT_DIR / "fly_static_summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
