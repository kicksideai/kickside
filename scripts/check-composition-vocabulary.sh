#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

roots=(platform/automation platform/workflows app/src)
for optional_root in ../providers; do
  [[ -e "$optional_root" ]] && roots+=("$optional_root")
done
pattern='trigger_point|trigger-point|flow_point|flow-point|kickside\.flow\.point|kickside\.recipes|kickside-recipe|automation-catalog|automation_catalog|kickside\.automation\.installable|kickside\.automation\.suggested_binding|suggested_binding|install_via|manual_spec|sync_spec|script_ref|body_backend'

if rg -n --hidden -g '!node_modules' -g '!dist' -g '!static' -g '!.git' "$pattern" "${roots[@]}"; then
  echo "Composition vocabulary drift detected." >&2
  exit 1
fi

if rg -n --hidden -g '!node_modules' -g '!dist' -g '!static' -g '!.git' \
  'kickside[./]code[-_.]execution|kickside-code-body|kickside-action-body|codeExecution|CodeBody|ActionBody' \
  platform/workflows/src platform/workflows/ui; then
  echo "Workflows must consume Blocks generically; Code Execution ownership leaked into Workflows." >&2
  exit 1
fi

echo "Composition vocabulary is canonical in ${#roots[@]} checked roots: Workflow, Block, Trigger, Automation, Port."
