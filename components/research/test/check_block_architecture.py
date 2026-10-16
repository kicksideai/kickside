#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT.name
SRC = ROOT / "src"

BANNED = {
    "kickside.workflows.node": "retired Workflow node declaration",
    "kickside.workflows:resume": "retired Workflow-owned resume seam",
    "component: kickside/workflows": "visual Workflows dependency",
    "engine_node_type:": "retired provider lowering",
    ".workflow:": "Block identity leaked through a Workflow namespace",
    "workflow_await": "retired Workflow-await correlation vocabulary",
    "arm_await": "retired await-specific arm name",
    "await_id": "retired await-specific correlation key",
    "BLOCK_WAIT_STATUS": "retired wait-specific status name",
}
EXPECTED = {
    "research": {
        "index": SRC / "blocks" / "_index.yaml",
        "block_id": "name: block.research",
        "arm_id": "arm_id: kickside.research:arm_research_block",
    },
    "stat-analysis": {
        "index": SRC / "blocks" / "_index.yaml",
        "block_id": "name: block.analyze_data",
        "arm_id": "arm_id: acme.stat_analysis:arm_analyze_data_block",
    },
}

errors: list[str] = []
for path in sorted(SRC.rglob("*")):
    if not path.is_file() or path.suffix not in {".lua", ".yaml", ".md"}:
        continue
    text = path.read_text()
    for token, label in BANNED.items():
        if token in text:
            errors.append(f"{path.relative_to(ROOT)}: {label}: {token}")

if (ROOT / "wippy.lock").exists():
    errors.append("module root must not contain wippy.lock")

spec = EXPECTED[PACKAGE]
index_text = spec["index"].read_text()
for token in (
    spec["block_id"],
    "type: kickside.block",
    "api_version: kickside.block/v1",
    "kind: wait",
    spec["arm_id"],
):
    if token not in index_text:
        errors.append(f"src/blocks/_index.yaml: missing canonical Block token: {token}")

root_index = (SRC / "_index.yaml").read_text()
if "component: kickside/blocks" not in root_index:
    errors.append("src/_index.yaml: missing direct kickside/blocks dependency")
if "kickside.blocks:resume" not in (SRC / "blocks" / "block_signal.lua").read_text():
    errors.append("block_signal.lua: missing canonical kickside.blocks:resume")

if errors:
    print("\n".join(errors), file=sys.stderr)
    raise SystemExit(1)
print(f"{PACKAGE}: canonical Block boundary verified")
