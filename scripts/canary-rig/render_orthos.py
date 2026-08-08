#!/usr/bin/env python3
"""Orthographic screenshots of a canary mesh for comparison with reference.jpg.

Views match Anything World rotation panels as closely as practical:
  - front: looking toward -Z (nose +Z faces camera), Y up, X right
  - side (left): looking toward +X, Y up, Z right (nose to the right if +Z)
  - side (right): looking toward -X, Y up, -Z as screen-right
  - top: looking toward -Y (from above), Z up on image (nose up), X right

Usage:
  .venv/bin/python render_orthos.py
  .venv/bin/python render_orthos.py --mesh public/static/canary-fly-static.glb --tag fly
  .venv/bin/python render_orthos.py --mesh public/assets/canary.obj --tag rest
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import trimesh
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = Path(__file__).resolve().parent / "out" / "orthos"


def load_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(path, force="mesh", process=False)
    if isinstance(loaded, trimesh.Scene):
        loaded = trimesh.util.concatenate(list(loaded.geometry.values()))
    return loaded


def project(v: np.ndarray, view: str) -> np.ndarray:
    """Return Nx2 screen coords (right, up) for orthographic view."""
    x, y, z = v[:, 0], v[:, 1], v[:, 2]
    if view == "front":
        # camera from +Z looking to -Z? AW front shows wings left-right, body center.
        # Nose +Z facing camera ⇒ look from +Z toward origin: screen (x, y)
        return np.stack([x, y], axis=1)
    if view == "side_left":
        # from -X looking +X: screen (z, y) — nose +Z to the right
        return np.stack([z, y], axis=1)
    if view == "side_right":
        # from +X looking -X: screen (-z, y)
        return np.stack([-z, y], axis=1)
    if view == "top":
        # from +Y looking -Y: screen (x, z) with +Z up on page
        return np.stack([x, z], axis=1)
    raise ValueError(view)


def face_depth(v: np.ndarray, faces: np.ndarray, view: str) -> np.ndarray:
    """Painter's algorithm key (farther first)."""
    c = v[faces].mean(axis=1)
    if view == "front":
        return c[:, 2]  # larger Z closer if looking from +Z
    if view == "side_left":
        return -c[:, 0]  # from -X, smaller X is farther
    if view == "side_right":
        return c[:, 0]
    if view == "top":
        return c[:, 1]
    return c[:, 2]


def render_view(mesh: trimesh.Trimesh, view: str, out_path: Path, title: str) -> None:
    v = np.asarray(mesh.vertices, dtype=np.float64)
    faces = np.asarray(mesh.faces)

    # Subsample faces if huge (ours is small)
    depth = face_depth(v, faces, view)
    order = np.argsort(depth)  # far → near for painter when far is smaller depth key
    # For front, larger Z is closer — draw small Z first
    if view == "front":
        order = np.argsort(depth)  # ascending Z: far first if camera +Z
    elif view == "top":
        order = np.argsort(depth)  # low Y first
    else:
        order = np.argsort(depth)

    faces_sorted = faces[order]
    # Limit face count for speed
    if len(faces_sorted) > 4000:
        faces_sorted = faces_sorted[:: max(1, len(faces_sorted) // 4000)]

    polys2d = []
    for f in faces_sorted:
        pts = project(v[f], view)
        polys2d.append(pts)

    fig, ax = plt.subplots(figsize=(6, 6), facecolor="#1a1030")
    ax.set_facecolor("#1a1030")

    from matplotlib.collections import PolyCollection

    coll = PolyCollection(
        polys2d,
        facecolors="#c0b8d0",
        edgecolors="#7a6a9a",
        linewidths=0.15,
        alpha=0.95,
    )
    ax.add_collection(coll)

    pts = project(v, view)
    pad = 0.08
    mins = pts.min(axis=0)
    maxs = pts.max(axis=0)
    span = (maxs - mins).max()
    mid = (maxs + mins) / 2
    ax.set_xlim(mid[0] - span / 2 * (1 + pad), mid[0] + span / 2 * (1 + pad))
    ax.set_ylim(mid[1] - span / 2 * (1 + pad), mid[1] + span / 2 * (1 + pad))
    ax.set_aspect("equal")
    ax.axhline(0, color="#e6007a", lw=0.6, alpha=0.5)
    ax.axvline(0, color="#01ffff", lw=0.6, alpha=0.5)
    ax.set_title(title, color="white", fontsize=12)
    ax.tick_params(colors="#888")
    for spine in ax.spines.values():
        spine.set_color("#444")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def render_contact_sheet(paths: list[Path], out_path: Path, sheet_title: str) -> None:
    """Stack views like reference.jpg (front, side, top)."""
    imgs = [plt.imread(p) for p in paths if p.exists()]
    if not imgs:
        return
    n = len(imgs)
    fig, axes = plt.subplots(n, 1, figsize=(5, 4 * n), facecolor="#120a22")
    if n == 1:
        axes = [axes]
    for ax, img, p in zip(axes, imgs, paths):
        ax.imshow(img)
        ax.set_title(p.stem, color="white", fontsize=11)
        ax.axis("off")
    fig.suptitle(sheet_title, color="white", fontsize=14, y=0.995)
    fig.tight_layout()
    fig.savefig(out_path, dpi=140, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mesh", type=Path, default=ROOT / "public" / "static" / "canary-fly-static.glb")
    ap.add_argument("--tag", type=str, default="fly")
    args = ap.parse_args()

    mesh = load_mesh(args.mesh)
    # Normalize for stable framing
    mesh = mesh.copy()
    mesh.vertices -= mesh.vertices.mean(axis=0)
    mesh.vertices[:, 1] -= mesh.vertices[:, 1].min()

    tag = args.tag
    views = [
        ("front", f"{tag}_front.png", f"{tag} — Front (XY, +Z toward camera)"),
        ("side_left", f"{tag}_side_left.png", f"{tag} — Side left (ZY)"),
        ("side_right", f"{tag}_side_right.png", f"{tag} — Side right"),
        ("top", f"{tag}_top.png", f"{tag} — Top (XZ, +Z up)"),
    ]
    written = []
    for view, name, title in views:
        path = OUT_DIR / name
        render_view(mesh, view, path, title)
        written.append(path)
        print(f"Wrote {path.relative_to(ROOT)}")

    sheet = OUT_DIR / f"{tag}_contact_sheet.png"
    # AW-like order: front, side, top
    ordered = [OUT_DIR / f"{tag}_front.png", OUT_DIR / f"{tag}_side_left.png", OUT_DIR / f"{tag}_top.png"]
    render_contact_sheet(ordered, sheet, f"Canary orthos ({tag}) vs reference.jpg")
    print(f"Wrote {sheet.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
