#!/usr/bin/env python3
"""Reject parameters supplied by a deployment root that does not declare them."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable

import yaml


def load_yaml(path: Path) -> dict[str, Any]:
    try:
        data = yaml.safe_load(path.read_text())
    except Exception as exc:
        raise RuntimeError(f"failed to parse {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise RuntimeError(f"{path} must contain a YAML map")
    return data


def requirement_owners(app_dir: Path, lock_path: Path, wippy: str) -> dict[str, str]:
    result = subprocess.run(
        [
            wippy,
            "registry",
            "list",
            "--lock-file",
            lock_path.name,
            "--kind",
            "ns.requirement",
            "--registry-meta",
            "--yaml",
        ],
        cwd=app_dir,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"failed to read requirement metadata from {lock_path}: {detail}")

    rows = yaml.safe_load(result.stdout) or []
    if not isinstance(rows, list):
        raise RuntimeError("wippy registry requirement output must be a YAML list")

    owners: dict[str, str] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        requirement_id = row.get("id")
        registry = row.get("registry")
        if not isinstance(registry, dict):
            raise RuntimeError(f"registry omitted owned metadata for {requirement_id}")
        owner = registry.get("owner")
        if isinstance(requirement_id, str) and isinstance(owner, str) and owner:
            owners[requirement_id] = owner
    return owners


def dependency_roots(index_path: Path) -> Iterable[tuple[str, str, list[Any]]]:
    for entry in load_yaml(index_path).get("entries") or []:
        if not isinstance(entry, dict) or entry.get("kind") != "ns.dependency":
            continue
        component = entry.get("component")
        if isinstance(component, str) and component:
            yield f"{index_path}:{entry.get('name', '<unnamed>')}", component, entry.get("parameters") or []


def check_roots(
    roots: Iterable[tuple[str, str, list[Any]]], requirement_owner: dict[str, str]
) -> list[str]:
    errors: list[str] = []
    for source, component, parameters in roots:
        for parameter in parameters:
            if not isinstance(parameter, dict):
                continue
            name = parameter.get("name")
            if not isinstance(name, str) or ":" not in name:
                continue
            owner = requirement_owner.get(name)
            if owner is None:
                errors.append(f"{source}: {component} supplies unknown qualified requirement {name}")
            elif owner != component:
                errors.append(f"{source}: {component} supplies {name}, declared by {owner}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-dir", type=Path, default=Path("."))
    parser.add_argument("--wippy", default="wippy")
    args = parser.parse_args()

    app_dir = args.app_dir.resolve()
    lock_path = app_dir / "wippy.lock"
    owners = requirement_owners(app_dir, lock_path, args.wippy)
    roots = list(dependency_roots(app_dir / "src/app/deps/_index.yaml"))
    errors = check_roots(roots, owners)
    if errors:
        print("dependency parameter ownership check failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"dependency parameter ownership check passed ({len(roots)} roots)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
