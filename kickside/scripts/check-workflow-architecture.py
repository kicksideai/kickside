#!/usr/bin/env python3
"""Protect the one-way Automation/Flow composition boundary.

This is deliberately a source-architecture check, not a generated-bundle check.
Runtime behavior is covered by the Workflow harness; this guard prevents a later
change from quietly recreating the retired engines or reversing ownership.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any, Iterable

import yaml


RETIRED_PACKAGE_DIRS = ("platform/execution",)
WORKFLOWS_IDENTIFIERS = re.compile(r"kickside(?:/|\.)workflows(?=[:./\s'\"]|$)")
CANONICAL_BLOCK_TYPE = "kickside.block"
RETIRED_DECLARATION_TYPES = {
    "kickside.workflows.node",
    "kickside.workflows.node_kind",
    "kickside.workflows.flow_template",
    "flow_template",
    "behavior",
    "recipe",
    "playbook",
    "callable",
}
RETIRED_FLOW_SOURCE = {
    "workflow_definition": "use the exact Flow kind 'flow'",
    "workflow_ref": "use 'flow_ref'",
    "${slot:": "declare a typed artifact ref and materialize it before compilation",
    "kickside.workflows:resume": "use the canonical wait/resume Block contract",
    "kickside.workflows.node.await": "use the canonical wait Block",
}
RETIRED_CONSUMER_SOURCE = {
    "workflow_consumers": "exact Flow refs need no consumer reverse index",
    "binding_consumers": "Automation must not publish a Flow-consumer recovery adapter",
    "pinned_version": "the revision belongs inside the exact Flow ref",
    "confirm_compatibility": "publishing a new revision cannot change exact consumers",
    "compatibility_warning": "publishing a new revision cannot change exact consumers",
    "consumer_dependents": "exact consumers are independent of later Flow revisions",
    "project_published_consumers": "do not project exact refs into a second ownership model",
}
WORKFLOW_UI_OWNERS = (
    (
        "Workflow canvas",
        Path("platform/workflows/ui/src/app/canvas/WorkflowCanvas.vue"),
        Path("platform/workflows/ui/src/app/WorkflowCanvas.vue"),
    ),
    (
        "Node configuration panel",
        Path("platform/workflows/ui/src/app/panels/NodeConfigPanel.vue"),
        Path("platform/workflows/ui/src/app/NodeConfigPanel.vue"),
    ),
)
ASSIST_WIRE_FILES = (
    Path("platform/workflows/src/assist.lua"),
    Path("platform/workflows/src/api/assist_api.lua"),
    Path("platform/workflows/ui/src/app/panels/assist.ts"),
    Path("platform/workflows/ui/src/app/canvas/EdgeIntentPopover.vue"),
)
WORKFLOW_FREE_LAYERS = (
    ("Core", Path("core")),
    ("Automation", Path("platform/automation")),
    ("Blocks", Path("platform/blocks")),
    ("Data Sync", Path("platform/sync")),
)


def load_yaml(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a YAML map")
    return value


def repo_path(path: Path, root: Path) -> str:
    """Return a stable repository-relative path for diagnostics."""
    return path.relative_to(root).as_posix()


def source_entries(module: Path) -> Iterable[tuple[Path, dict[str, Any]]]:
    source = module / "src"
    if not source.is_dir():
        return
    for path in sorted(source.rglob("*.yaml")):
        document = load_yaml(path)
        for entry in document.get("entries") or []:
            if isinstance(entry, dict):
                yield path, entry


def production_source_files(module: Path) -> Iterable[Path]:
    """Yield authored package files, excluding harnesses and generated output."""
    excluded = {"node_modules", "static", "dist", "coverage", "test", "live-test", ".wippy"}
    suffixes = {".lua", ".yaml", ".yml", ".ts", ".vue", ".js", ".md"}
    for path in sorted(module.rglob("*")):
        if not path.is_file() or path.suffix not in suffixes:
            continue
        if excluded.intersection(path.relative_to(module).parts):
            continue
        yield path


def architecture_source_files(module: Path) -> Iterable[Path]:
    """Production files whose text must contain only the canonical Workflow vocabulary."""
    for path in production_source_files(module):
        if path.stem.endswith("_test") or path.name.endswith(".spec.ts"):
            continue
        yield path


def architecture_modules(root: Path) -> Iterable[Path]:
    """Yield authored production roots whose wire vocabulary is repository-owned."""
    for parent_name in ("platform", "core"):
        parent = root / parent_name
        if not parent.is_dir():
            continue
        for module in sorted(parent.iterdir()):
            if module.is_dir():
                yield module
    for name in ("app",):
        module = root / name
        if module.is_dir():
            yield module


def check(root: Path) -> list[str]:
    root = root.resolve()
    errors: list[str] = []

    for relative in RETIRED_PACKAGE_DIRS:
        if (root / relative).exists():
            errors.append(f"{relative}: retired parallel engine must not exist")

    blocks = root / "platform" / "blocks"
    automation = root / "platform" / "automation"
    workflows = root / "platform" / "workflows"
    if not blocks.is_dir():
        errors.append("platform/blocks: headless Block contract package is missing")
    if not automation.is_dir():
        errors.append("platform/automation: generic Automation package is missing")
    if not workflows.is_dir():
        errors.append("platform/workflows: Workflow provider package is missing")
    if errors:
        return errors

    # These large UI surfaces were moved into their owning feature directories.
    # Keeping an old top-level copy is especially dangerous: Vitest and Vite can
    # exercise the canonical entrypoints while vue-tsc still discovers the stale
    # copy, leaving tests and production builds green but the release gate broken.
    for title, canonical, legacy in WORKFLOW_UI_OWNERS:
        canonical_exists = (root / canonical).is_file()
        legacy_exists = (root / legacy).is_file()
        if legacy_exists and canonical_exists:
            errors.append(
                f"{legacy.as_posix()}: stale duplicate {title} owner; "
                f"keep only canonical {canonical.as_posix()}"
            )
        elif legacy_exists:
            errors.append(
                f"{legacy.as_posix()}: non-canonical {title} owner; "
                f"move it to {canonical.as_posix()}"
            )

    # Core and the native Automation products are lower layers than visual
    # Workflows. They expose contracts, Blocks, Sources, and Destinations without
    # probing or depending on the optional Workflow package.
    for title, relative in WORKFLOW_FREE_LAYERS:
        module = root / relative
        for path in production_source_files(module):
            for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                if WORKFLOWS_IDENTIFIERS.search(line):
                    label = repo_path(path, root)
                    errors.append(
                        f"{label}:{line_no}: {title} must not reference the Workflow package"
                    )

    workflow_entries = list(source_entries(workflows))
    dependencies = [
        (path, entry)
        for path, entry in workflow_entries
        if entry.get("kind") == "ns.dependency"
        and entry.get("component") == "kickside/automation"
    ]
    if len(dependencies) != 1:
        errors.append(
            "platform/workflows: declare exactly one explicit "
            f"Workflows -> Automation dependency; found {len(dependencies)}"
        )

    block_dependencies = [
        (path, entry)
        for path, entry in workflow_entries
        if entry.get("kind") == "ns.dependency"
        and entry.get("component") == "kickside/blocks"
    ]
    if len(block_dependencies) != 1:
        errors.append(
            "platform/workflows: declare exactly one explicit "
            f"Workflows -> Blocks dependency; found {len(block_dependencies)}"
        )

    workflow_creation_surfaces = [
        (path, entry)
        for path, entry in workflow_entries
        if isinstance(entry.get("meta"), dict)
        and entry["meta"].get("type") == "kickside.automation"
    ]
    if workflow_creation_surfaces:
        errors.append(
            "platform/workflows: must not expose an Automation creation type; "
            "Automation owns the trigger-to-Flow creation surface"
        )

    automation_entries = list(source_entries(automation))
    binding_views = [
        (path, entry)
        for path, entry in automation_entries
        if entry.get("name") == "binding_config_view"
    ]
    if len(binding_views) != 1:
        errors.append(
            "platform/automation: expose exactly one generic trigger-to-Flow "
            f"creation surface; found {len(binding_views)}"
        )
    else:
        path, surface = binding_views[0]
        meta = surface.get("meta") if isinstance(surface.get("meta"), dict) else {}
        expected = {
            "type": "view.component",
            "title": "Connect a Trigger",
            "announced": True,
            "auto_register": True,
            "tag_name": "kickside-automation-binding-config",
        }
        actual = {
            "type": meta.get("type"),
            "title": meta.get("title"),
            "announced": meta.get("announced"),
            "auto_register": meta.get("auto_register"),
            "tag_name": meta.get("tag_name"),
        }
        if actual != expected:
            errors.append(
                f"{repo_path(path, root)}: generic Automation binding surface must be "
                f"the single public 'Connect a Trigger' component; got {actual!r}"
            )

    component_bindings = [
        (path, entry)
        for path, entry in workflow_entries
        if entry.get("name") == "workflow_kind"
    ]
    if len(component_bindings) != 1:
        errors.append(
            "platform/workflows: declare exactly one Flow component binding; "
            f"found {len(component_bindings)}"
        )
    else:
        path, binding = component_bindings[0]
        meta = binding.get("meta") if isinstance(binding.get("meta"), dict) else {}
        contracts = binding.get("contracts") or []
        contract_ids = {
            declaration.get("contract")
            for declaration in contracts
            if isinstance(declaration, dict)
        }
        expected_contracts = {
            "kickside.contract:component",
            "kickside.contract:deletable",
        }
        if meta.get("class") != "flow" or contract_ids != expected_contracts:
            errors.append(
                f"{repo_path(path, root)}: workflow_kind must be the pure Flow "
                f"authoring component with contracts {sorted(expected_contracts)!r}; "
                f"got class={meta.get('class')!r}, contracts={sorted(contract_ids)!r}"
            )
        forbidden_meta = {
            key for key in (
                "trigger_handler",
                "actions",
                "inputs",
                "public_state_schema",
            )
            if key in meta
        }
        if forbidden_meta:
            errors.append(
                f"{repo_path(path, root)}: workflow_kind carries retired Automation "
                f"behavior metadata: {sorted(forbidden_meta)!r}"
            )

    retired_workflow_entries = {
        "kind",
        "kind_install",
        "kind_trigger_apply",
        "kind_write",
        "kind_status",
        "kind_pause",
        "kind_resume",
        "workflow_control",
        "run_flow_port",
    }
    for path, entry in workflow_entries:
        if entry.get("name") in retired_workflow_entries:
            errors.append(
                f"{repo_path(path, root)}:{entry.get('name')}: retired Flow component "
                "Automation behavior must not exist"
            )

    launch_source = workflows / "src" / "runs" / "launch.lua"
    if launch_source.is_file():
        launch_text = launch_source.read_text(encoding="utf-8")
        if "versions.head(workflow_id)" in launch_text:
            errors.append(
                "platform/workflows/src/runs/launch.lua: published execution must not "
                "substitute the latest Flow version"
            )

    canonical_blocks = 0
    for module in sorted((root / "platform").iterdir()):
        if not module.is_dir():
            continue
        for path, entry in source_entries(module):
            meta = entry.get("meta")
            meta_type = meta.get("type") if isinstance(meta, dict) else None
            if meta_type == CANONICAL_BLOCK_TYPE:
                canonical_blocks += 1
            elif meta_type in RETIRED_DECLARATION_TYPES:
                errors.append(
                    f"{repo_path(path, root)}:{entry.get('name') or '<unnamed>'}: "
                    f"reusable production declarations must use {CANONICAL_BLOCK_TYPE}; "
                    "the retired type must not remain"
                )
    if canonical_blocks == 0:
        errors.append(
            f"platform: no production {CANONICAL_BLOCK_TYPE} contributors were found"
        )

    destination_map = root / "platform/sync/src/destination_map.lua"
    if not destination_map.is_file():
        errors.append("platform/sync: destination ownership must live in destination_map.lua")
    else:
        destination_map_source = destination_map.read_text(encoding="utf-8")
        if re.search(r"\bany\b", destination_map_source):
            errors.append(
                "platform/sync/src/destination_map.lua: destination ownership types "
                "must not use the any escape hatch"
            )
        if len(destination_map_source.splitlines()) > 200:
            errors.append(
                "platform/sync/src/destination_map.lua: destination ownership module "
                "must remain below 200 lines"
            )

    # Greenfield rule: old shapes are removed, not translated. A compatibility
    # reader or compatibility layer would make both vocabularies live again, so reject the
    # retired spellings in authored production code.
    for module in architecture_modules(root):
        for path in architecture_source_files(module):
            text = path.read_text(encoding="utf-8")
            for token, replacement in RETIRED_FLOW_SOURCE.items():
                if token in text:
                    errors.append(
                        f"{repo_path(path, root)}: retired Flow vocabulary {token!r}; "
                        f"{replacement}"
                    )
            if module.name in {"automation", "workflows"}:
                for token, replacement in RETIRED_CONSUMER_SOURCE.items():
                    if token in text:
                        errors.append(
                            f"{repo_path(path, root)}: retired floating-consumer subsystem "
                            f"{token!r}; {replacement}"
                        )
            if re.search(r"\bkind\s*:\s*slot\b", text):
                errors.append(
                    f"{repo_path(path, root)}: retired untyped slot ref; declare a typed "
                    "artifact ref and materialize it before compilation"
                )

    # Flow assist names reusable catalog entries as Blocks. Graph internals may
    # still use nodes and node.kind, but those implementation names must not leak
    # back onto the structured-output or HTTP wire contract.
    for relative in ASSIST_WIRE_FILES:
        path = root / relative
        if not path.is_file():
            continue
        if re.search(r"\bnode_(?:kind|title)\b", path.read_text(encoding="utf-8")):
            errors.append(
                f"{relative.as_posix()}: retired Flow-assist wire field; "
                "use block_id/block_title"
            )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    errors = check(args.root)
    if errors:
        print("Workflow architecture violations:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    print(
        "Workflow architecture is one-way: Core, Blocks, Automation, and Data Sync remain Workflow-free; "
        "Workflows consume native lower layers through canonical contracts, with no parallel engines."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
