#!/usr/bin/env bash
# The parameter set that is actually shipped, in one place.
#
# These lived only in shell history for most of the build, which meant a fresh session
# could not reproduce the export at all. Every tuned value below was arrived at from a
# specific review note, so changing one is a deliberate art decision, not a free knob.
#
#   ./scripts/canary-rig/ship.sh            # pose + gate + render, writes nothing final
#   ./scripts/canary-rig/ship.sh --export   # also write public/static/
set -uo pipefail
cd "$(dirname "$0")/../.."

ARGS=(
  --sweep 12 --rise 10 --fan 0
  --feather-fan 70 --feather-extra 11 --feather-sweep 12 --feather-scale 1.32
  --feather-tip-ratio 0.88 --feather-root-ratio 0.45
  --feather-width 0.16 --feather-tip-keep 0.4 --feather-base-span 0.8
  --feather-min-aspect 1.4 --feather-min-len 0.15
  --feather-seat-out 0.55
  --mirror-wing L --knee-cap 0.3 --knee-cap-rings 2
  --tail-fan 18 --knee-fold 75
  --membrane 0 --pitch 0
)

TAG="${TAG:-ship}" scripts/canary-rig/iterate.sh "${ARGS[@]}"
GATE=$?

if [ "${1:-}" = "--export" ] && [ $GATE -eq 0 ]; then
  SRC="/private/tmp/claude-501/-Users-laurogripa-code-kusama-kappasigmamu-github-io/53d0f158-c43c-4bea-8071-6a76a65d5d1d/scratchpad/ship.glb"
  scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py "${ARGS[@]}" \
    -o public/static/canary-fly-static.glb >/dev/null
  scripts/canary-rig/.venv/bin/python scripts/canary-rig/pose_fly.py "${ARGS[@]}" \
    -o public/static/canary-fly-static.obj >/dev/null
  cp public/static/canary-fly-static.obj public/static/canary-fly-aw.obj
  echo "exported -> public/static/ (glb, obj, aw.obj)"
fi
exit $GATE
