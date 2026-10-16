#!/usr/bin/env python3
"""Print local Wippy modules in dependency order."""

from __future__ import annotations

import argparse
import heapq
import sys
from pathlib import Path
from typing import Any

import yaml


def load(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text())
    if not isinstance(value, dict):
        raise RuntimeError(f"{path} must contain a YAML map")
    return value


def module_dirs(root: Path) -> list[Path]:
    manifests = [root / "app" / "wippy.yaml"]
    manifests.extend((root / "core").glob("*/wippy.yaml"))
    manifests.extend((root / "platform").glob("*/wippy.yaml"))
    return sorted(path.parent for path in manifests if path.is_file())


def dependencies(module: Path) -> set[str]:
    found: set[str] = set()
    source = module / "src"
    if not source.is_dir():
        return found
    for path in source.rglob("*.yaml"):
        for entry in load(path).get("entries") or []:
            if not isinstance(entry, dict) or entry.get("kind") != "ns.dependency":
                continue
            component = entry.get("component")
            if isinstance(component, str):
                found.add(component)
    return found


def private_organizations(root: Path) -> set[str]:
    path = root / "release" / "private-orgs.txt"
    if not path.is_file():
        return set()
    return {
        value
        for raw in path.read_text(encoding="utf-8").splitlines()
        if (value := raw.partition("#")[0].strip())
    }


def ordered_modules(root: Path, requested: list[str] | None = None) -> list[Path]:
    """Return release modules foundation-first.

    An explicit consumer selection includes every local dependency reachable from
    that consumer.  This is a release-safety boundary: local test replacements
    may validate source changes together, but a consumer must never reach Hub
    before the providers it was validated against.
    """
    dirs = module_dirs(root)
    allowed_organizations = {"kickside", *private_organizations(root)}
    names: dict[str, Path] = {}
    identities: dict[Path, str] = {}
    for module in dirs:
        manifest = load(module / "wippy.yaml")
        if manifest.get("organization") not in allowed_organizations:
            continue
        identity = f"{manifest['organization']}/{manifest['module']}"
        if identity in names:
            first = names[identity].relative_to(root)
            second = module.relative_to(root)
            raise RuntimeError(
                f"duplicate local module identity {identity}: {first}, {second}"
            )
        names[identity] = module
        identities[module.resolve()] = identity

    selected_names = set(names)
    if requested:
        selected_names = set()
        pending: list[str] = []
        for raw in requested:
            module = (root / raw).resolve()
            identity = identities.get(module)
            if identity is None:
                raise RuntimeError(f"not a local production module: {raw}")
            if identity in selected_names:
                raise RuntimeError(f"duplicate module argument: {raw}")
            selected_names.add(identity)
            pending.append(identity)

        while pending:
            identity = pending.pop()
            for dependency in dependencies(names[identity]):
                if dependency in names and dependency not in selected_names:
                    selected_names.add(dependency)
                    pending.append(dependency)

    incoming: dict[str, set[str]] = {name: set() for name in selected_names}
    outgoing: dict[str, set[str]] = {name: set() for name in selected_names}
    for name in selected_names:
        for dependency in dependencies(names[name]):
            if dependency not in selected_names:
                continue
            incoming[name].add(dependency)
            outgoing[dependency].add(name)

    ready = [name for name, deps in incoming.items() if not deps]
    heapq.heapify(ready)
    ordered: list[str] = []
    while ready:
        name = heapq.heappop(ready)
        ordered.append(name)
        for dependent in sorted(outgoing[name]):
            incoming[dependent].discard(name)
            if not incoming[dependent]:
                heapq.heappush(ready, dependent)

    if len(ordered) != len(selected_names):
        cycle = sorted(name for name, deps in incoming.items() if deps)
        raise RuntimeError(f"local module dependency cycle: {', '.join(cycle)}")

    app_name = "kickside/kickside"
    if app_name in ordered:
        ordered.remove(app_name)
        ordered.append(app_name)
    return [names[name] for name in ordered]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("modules", nargs="*")
    args = parser.parse_args()
    root = Path(args.root).resolve()

    for module in ordered_modules(root, args.modules):
        print(module.relative_to(root))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"release order failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
