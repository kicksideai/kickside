#!/usr/bin/env python3
"""Reject Chestor packages whose published registry/UI contract is incomplete."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any, Iterable

try:
    import yaml
except ImportError as exc:  # pragma: no cover - release-host prerequisite
    raise SystemExit("PyYAML is required to validate Chestor packages") from exc


RANGE_OPERATOR = re.compile(r"(?:\*|[<>=~^])")


def read_yaml(path: Path) -> dict[str, Any]:
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise ValueError(f"{path}: invalid YAML: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{path}: expected a YAML mapping")
    return value


def non_empty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def walk_view_refs(value: Any, path: str = "meta") -> Iterable[tuple[str, str]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key == "view" and non_empty(child):
                yield child_path, child.strip()
            yield from walk_view_refs(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_view_refs(child, f"{path}[{index}]")


def validate(module_dir: Path) -> list[str]:
    module_dir = module_dir.resolve()
    manifest_path = module_dir / "wippy.yaml"
    if not manifest_path.is_file():
        return [f"{module_dir}: missing wippy.yaml"]

    manifest = read_yaml(manifest_path)
    source_files = sorted((module_dir / "src").glob("**/_index.yaml"))
    if not source_files:
        return [f"{module_dir}: no src/**/_index.yaml registry sources"]

    documents: list[tuple[Path, dict[str, Any]]] = []
    definitions: list[tuple[Path, str]] = []
    entries: dict[str, tuple[Path, dict[str, Any]]] = {}
    errors: list[str] = []

    for path in source_files:
        document = read_yaml(path)
        documents.append((path, document))
        namespace = document.get("namespace")
        if not non_empty(namespace):
            errors.append(f"{path}: namespace must be non-empty")
            continue
        namespace = namespace.strip()
        raw_entries = document.get("entries", [])
        if not isinstance(raw_entries, list):
            errors.append(f"{path}: entries must be a list")
            continue
        for raw_entry in raw_entries:
            if not isinstance(raw_entry, dict) or not non_empty(raw_entry.get("name")):
                errors.append(f"{path}: every entry must have a non-empty name")
                continue
            entry_id = f"{namespace}:{raw_entry['name'].strip()}"
            if entry_id in entries:
                errors.append(f"{path}: duplicate entry id {entry_id}")
            entries[entry_id] = (path, raw_entry)
            if raw_entry.get("kind") == "ns.definition":
                definitions.append((path, namespace))

    if len(definitions) != 1:
        errors.append(
            f"{module_dir}: package must contain exactly one root ns.definition; found {len(definitions)}"
        )
        root_namespace = ""
    else:
        root_namespace = definitions[0][1]

    if root_namespace:
        for path, document in documents:
            namespace = str(document.get("namespace", ""))
            if namespace != root_namespace and not namespace.startswith(root_namespace + "."):
                errors.append(
                    f"{path}: namespace {namespace!r} is outside root namespace {root_namespace!r}"
                )
        for embed in manifest.get("embed", []) or []:
            if not non_empty(embed) or not embed.startswith(root_namespace + ":"):
                errors.append(
                    f"{manifest_path}: embed {embed!r} must reference the root namespace {root_namespace!r}"
                )

    components: dict[str, dict[str, Any]] = {}
    tags: dict[str, str] = {}
    for entry_id, (path, entry) in entries.items():
        kind = entry.get("kind")
        meta = entry.get("meta") if isinstance(entry.get("meta"), dict) else {}

        if kind == "ns.dependency":
            if entry.get("component") == "chestor/test-support":
                errors.append(f"{path}: {entry_id} imports test-only chestor/test-support into production")
            version = entry.get("version")
            if not non_empty(version) or not RANGE_OPERATOR.search(version):
                errors.append(
                    f"{path}: {entry_id} uses concrete dependency version {version!r}; declare a range"
                )

        imports = entry.get("imports")
        if isinstance(imports, dict):
            for target in imports.values():
                if isinstance(target, str) and target.startswith("chestor.test_support:"):
                    errors.append(f"{path}: {entry_id} imports test-only {target} into production")

        if kind != "registry.entry":
            continue
        entry_type = meta.get("type")
        if entry_type == "ui.nav_item" and not non_empty(meta.get("title")):
            errors.append(f"{path}: {entry_id} ui.nav_item requires non-empty meta.title")
        if entry_type != "view.component":
            continue

        components[entry_id] = meta
        tag = meta.get("tag_name")
        if not non_empty(tag) or "-" not in tag:
            errors.append(f"{path}: {entry_id} requires a hyphenated meta.tag_name")
        else:
            if tag in tags:
                errors.append(f"{path}: duplicate component tag {tag!r} ({tags[tag]} and {entry_id})")
            tags[tag] = entry_id
        if meta.get("announced") is not True:
            errors.append(f"{path}: {entry_id} must set meta.announced: true so loadByTagName can discover it")
        for field in ("base_path", "entry_point"):
            if not non_empty(meta.get(field)):
                errors.append(f"{path}: {entry_id} requires non-empty meta.{field}")

    static_mounts: dict[str, Path] = {}
    for entry_id, (path, entry) in entries.items():
        if entry.get("kind") not in {"http.static", "http.mount"}:
            continue
        fs_id = entry.get("fs")
        mount_path = entry.get("path")
        if not non_empty(fs_id) or not non_empty(mount_path):
            continue
        fs_entry = entries.get(fs_id)
        if not fs_entry:
            errors.append(f"{path}: {entry_id} references missing filesystem entry {fs_id!r}")
            continue
        fs_data = fs_entry[1]
        directory = fs_data.get("directory")
        if not non_empty(directory):
            errors.append(f"{fs_entry[0]}: {fs_id} requires a source directory before packing")
            continue
        static_mounts[mount_path.strip("/")] = (module_dir / directory).resolve()

    for entry_id, meta in components.items():
        base_path = str(meta.get("base_path", "")).strip("/")
        entry_point = str(meta.get("entry_point", ""))
        static_dir = static_mounts.get(base_path)
        if static_dir is None:
            errors.append(f"{entries[entry_id][0]}: {entry_id} base_path {base_path!r} has no matching http.static mount")
        elif not (static_dir / entry_point).is_file():
            errors.append(
                f"{entries[entry_id][0]}: {entry_id} renderer asset is missing: {static_dir / entry_point}"
            )

    for owner_id, (path, entry) in entries.items():
        meta = entry.get("meta") if isinstance(entry.get("meta"), dict) else {}
        for ref_path, reference in walk_view_refs(meta):
            if ":" in reference and root_namespace and reference.startswith(root_namespace + ":"):
                if reference not in components:
                    errors.append(f"{path}: {owner_id} {ref_path} references missing local view.component {reference}")
            elif ":" not in reference and "-" in reference and reference not in tags:
                errors.append(f"{path}: {owner_id} {ref_path} references undeclared local component tag {reference}")

    return errors


def validate_harness(harness: Path) -> list[str]:
    config = read_yaml(harness / ".wippy.yaml")
    replacement = config.get("workspace", {}).get("replacements", {}).get("chestor/test-support")
    if not non_empty(replacement):
        return [f"{harness}: missing local chestor/test-support replacement"]
    support = (harness / replacement).resolve()
    manifest = support / "wippy.yaml"
    if not manifest.is_file() or not (support / "src/scope_resolver.lua").is_file():
        return [f"{harness}: incomplete local chestor/test-support source at {support}"]
    identity = read_yaml(manifest)
    if identity.get("organization") != "chestor" or identity.get("module") != "test-support":
        return [f"{manifest}: expected chestor/test-support identity"]
    return []


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("module", type=Path, nargs="?")
    parser.add_argument("--harness", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.harness:
            errors = validate_harness(args.harness)
        elif args.module:
            errors = validate(args.module)
        else:
            parser.error("module or --harness is required")
    except ValueError as exc:
        errors = [str(exc)]
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"package contract valid: {(args.harness or args.module).resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
