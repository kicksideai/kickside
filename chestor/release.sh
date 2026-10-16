#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if [ "${1:-}" != --dry-run ]; then
  echo "Local releases only support --dry-run; GitHub Release Please owns publication." >&2
  exit 1
fi
shift
python3 - "$@" <<'PYTHON'
import json, subprocess, sys
from pathlib import Path
versions=json.loads(Path('.release-please-manifest.json').read_text())
selected=sys.argv[1:] or list(versions)
if len(selected) != len(set(selected)) or any(path not in versions for path in selected):
    raise SystemExit('Invalid module selection')
for path in selected:
    subprocess.run(['python3','.github/scripts/delivery.py','publish','--module',path,
                    '--version',versions[path],'--dry-run'],check=True)
PYTHON
