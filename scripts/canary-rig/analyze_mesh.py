#!/usr/bin/env python3
"""CP1 — inspect canary mesh (no deformation).

Usage:
  .venv/bin/python analyze_mesh.py [path/to/canary.obj]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OBJ = ROOT / "public" / "assets" / "canary.obj"
OUT_DIR = Path(__file__).resolve().parent / "out"


def load_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(path, force="mesh", process=False)
    if isinstance(loaded, trimesh.Scene):
        geoms = list(loaded.geometry.values())
        if not geoms:
            raise SystemExit(f"No geometry in {path}")
        loaded = trimesh.util.concatenate(geoms)
    return loaded


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OBJ
    mesh = load_mesh(path)
    v = np.asarray(mesh.vertices, dtype=np.float64)
    faces = np.asarray(mesh.faces)

    mins = v.min(axis=0)
    maxs = v.max(axis=0)
    center = v.mean(axis=0)
    extents = maxs - mins

    # Axis heuristics for a bird-ish mesh: longest horizontal span often wings;
    # smallest vertical may be height depending on orientation.
    axis_names = ["X", "Y", "Z"]
    order = np.argsort(extents)[::-1]  # largest extent first

    report = {
        "source": str(path.relative_to(ROOT) if path.is_relative_to(ROOT) else path),
        "vertex_count": int(len(v)),
        "face_count": int(len(faces)),
        "bounds_min": mins.tolist(),
        "bounds_max": maxs.tolist(),
        "center_mean": center.tolist(),
        "extents": extents.tolist(),
        "extent_axes_desc": [axis_names[i] for i in order],
        "notes": {
            "largest_extent_axis": axis_names[order[0]],
            "mid_extent_axis": axis_names[order[1]],
            "smallest_extent_axis": axis_names[order[2]],
            "hint": (
                "Largest axis is a candidate for wing span; "
                "smallest for thickness. Confirm against /game view."
            ),
        },
        # Percentile slices for later region proposals
        "percentiles": {
            "x": np.percentile(v[:, 0], [5, 25, 50, 75, 95]).tolist(),
            "y": np.percentile(v[:, 1], [5, 25, 50, 75, 95]).tolist(),
            "z": np.percentile(v[:, 2], [5, 25, 50, 75, 95]).tolist(),
        },
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_json = OUT_DIR / "analysis.json"
    out_json.write_text(json.dumps(report, indent=2) + "\n")

    # Color-by-axis-extremes preview mesh for visual region sanity
    colors = np.tile(np.array([[180, 180, 180, 255]], dtype=np.uint8), (len(v), 1))
    # mark lateral extremes on largest horizontal-ish axes
    for axis, color in ((0, [0, 255, 255, 255]), (2, [255, 0, 122, 255])):
        lo, hi = np.percentile(v[:, axis], [12, 88])
        colors[v[:, axis] <= lo] = color
        colors[v[:, axis] >= hi] = color
    # bottom (likely legs) on Y
    y_lo = np.percentile(v[:, 1], 15)
    colors[v[:, 1] <= y_lo] = [255, 220, 0, 255]

    preview = mesh.copy()
    preview.visual.vertex_colors = colors
    preview_path = OUT_DIR / "canary-regions-preview.glb"
    preview.export(preview_path)

    print(json.dumps(report, indent=2))
    print(f"\nWrote {out_json.relative_to(ROOT)}")
    print(f"Wrote {preview_path.relative_to(ROOT)} (cyan/magenta=lateral, yellow=low Y)")


if __name__ == "__main__":
    main()
