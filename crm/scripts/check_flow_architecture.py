#!/usr/bin/env python3
"""Protect CRM's headless Block and optional Flow composition boundary."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_SUFFIXES = {".lua", ".yaml", ".yml", ".ts", ".vue", ".md"}
RETIRED = {
    "kickside.workflows.node": "publish a canonical kickside.block/v1 declaration",
    "kickside.workflows.flow_template": "publish a canonical kickside.flow/v1 declaration",
    "kickside.workflows.behavior": "bind CRM ports to exact published Flows through Automation",
    "kickside.workflows:resume": "resume the native Signal through kickside.blocks:resume",
    "kickside.workflows.node.await": "lower wait Blocks through kickside.blocks",
    "workflow_definition": "use the exact Flow kind 'flow'",
    "workflow_ref": "use the canonical exact 'flow_ref' vocabulary",
    "inbox_decision": "reference the exact Inbox review Block",
    "list_behaviors": "do not recreate a package-specific Flow catalog",
    "kickside-workflow-builder": "use the optional canonical Flow authoring surface outside CRM",
    "preview_await": "name Block preview functions with Block vocabulary",
    "arm_await": "name Block arm functions with Block vocabulary",
    "field_review_arm": "do not restore the orphaned field-review Block arm",
}


def production_files() -> list[Path]:
    files: list[Path] = []
    for base in (ROOT / "src", ROOT / "ui" / "src"):
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            if not path.is_file() or path.suffix not in SOURCE_SUFFIXES:
                continue
            if path.stem.endswith("_test") or path.name.endswith((".test.ts", ".spec.ts")):
                continue
            files.append(path)
    files.extend(path for path in (ROOT / "README.md", ROOT / "CRM_WRITE_ORIGIN_CONTRACT.md") if path.is_file())
    return sorted(files)


def check() -> list[str]:
    errors: list[str] = []
    if (ROOT / "wippy.lock").exists():
        errors.append("wippy.lock: installable modules must not carry a root resolved lock")
    if (ROOT / "src" / "workflows").exists():
        errors.append("src/workflows: retired parallel Behavior/template subsystem must not exist")

    allowed_root = {"_index.yaml", "consts.lua", "types.lua", "crm.lua"}
    root_files = {
        path.name for path in (ROOT / "src").iterdir()
        if path.is_file()
    }
    unexpected_root = sorted(root_files - allowed_root)
    if unexpected_root:
        errors.append(
            "src: canonical root may contain only _index.yaml, consts.lua, types.lua, and crm.lua; "
            f"found {', '.join(unexpected_root)}"
        )

    for index in (ROOT / "src").glob("*/_index.yaml"):
        expected = "kickside.crm." + index.parent.name
        text = index.read_text()
        if f"namespace: {expected}" not in text:
            errors.append(
                f"{index.relative_to(ROOT)}: namespace must match its child directory ({expected})"
            )

    for path in production_files():
        text = path.read_text()
        for token, replacement in RETIRED.items():
            if token in text:
                errors.append(f"{path.relative_to(ROOT)}: retired vocabulary {token!r}; {replacement}")

    source_index = (ROOT / "src" / "_index.yaml").read_text()
    for component in ("kickside/workflows", "kickside/automation"):
        if re.search(rf"component:\s*{re.escape(component)}(?:\s|$)", source_index):
            errors.append(f"src/_index.yaml: CRM must remain independent of {component}")
    if not re.search(r"component:\s*kickside/blocks(?:\s|$)", source_index):
        errors.append("src/_index.yaml: CRM Block ownership requires an explicit kickside/blocks dependency")
    ports_index = (ROOT / "src" / "ports" / "_index.yaml").read_text()
    if "type: kickside.automation.port" not in ports_index:
        errors.append("src/ports/_index.yaml: generic CRM Automation source ports disappeared")

    block_index = ROOT / "src" / "blocks" / "_index.yaml"
    if not block_index.is_file():
        errors.append("src/blocks/_index.yaml: canonical CRM Block catalog is missing")
    else:
        text = block_index.read_text()
        if len(re.findall(r"^\s+type:\s*kickside\.block\s*$", text, re.MULTILINE)) != 2:
            errors.append("src/blocks/_index.yaml: expected exactly two canonical CRM Blocks")
        for snippet in (
            "namespace: kickside.crm.blocks",
            "name: resolve",
            "title: Resolve CRM record",
            "function_id: kickside.crm.resolution:block_resolve",
            "name: merge_review",
            "title: Review CRM record merge",
            "arm_id: kickside.crm.resolution:merge_arm",
        ):
            if snippet not in text:
                errors.append(f"src/blocks/_index.yaml: missing canonical declaration {snippet!r}")
    return errors


def main() -> int:
    errors = check()
    if errors:
        print("CRM Flow architecture violations:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    print("CRM composition architecture: canonical headless Blocks, generic ports, no visual Workflows dependency.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
