#!/usr/bin/env bash
# One turn of the loop: pose -> numeric gate -> render -> contact sheet.
# Always run this rather than calling pose_fly.py by hand, so no change ships
# without the checks having looked at it.
set -uo pipefail
cd "$(dirname "$0")/../.."
PY=scripts/canary-rig/.venv/bin/python
TAG="${TAG:-it}"
OUT="/private/tmp/claude-501/-Users-laurogripa-code-kusama-kappasigmamu-github-io/53d0f158-c43c-4bea-8071-6a76a65d5d1d/scratchpad/${TAG}.glb"

$PY scripts/canary-rig/pose_fly.py "$@" -o "$OUT" | sed 's/^/  /'
echo "--- checks ---"
$PY scripts/canary-rig/diagnose.py --mesh "$OUT"; GATE=$?
blender -b -P scripts/canary-rig/blender_render.py -- --mesh "$OUT" --tag "$TAG" 2>&1 | grep -E "^Error" || true
$PY - "$TAG" <<'PYEOF'
import sys
from PIL import Image, ImageDraw
tag=sys.argv[1]; O='scripts/canary-rig/out/blender'; W=520
vs=['persp','top','front','side_r']
sh=Image.new('RGB',(W*2,W*2),(18,18,24)); d=ImageDraw.Draw(sh)
for i,v in enumerate(vs):
    x,y=(i%2)*W,(i//2)*W
    sh.paste(Image.open(f'{O}/{tag}_{v}.png').convert('RGB').resize((W,W)),(x,y))
    d.text((x+8,y+8),v,fill=(255,220,80))
sh.save(f'{O}/{tag}_sheet.png'); print('sheet ->', f'{O}/{tag}_sheet.png')
PYEOF
exit $GATE
