#!/usr/bin/env python3
"""Validate that every ns.requirement declares the resource kind it accepts.

The keeper install planner reads meta.value_kind to offer real registry
candidates and to reject a supplied value of the wrong kind. Without it the
planner falls back to guessing from the requirement name or target path, which
is how an install ends up pre-filled with the wrong router.

Requirements whose value is a scalar (a byte cap, a cache directive, a boolean),
a resource pattern, a structured grant, or a contract implementation do not name
a host resource. Those are listed here by name so a new undeclared requirement
fails the check instead of joining them silently.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import yaml

# The resource vocabulary a host supplies at install time.
#
# db.sql is absent on purpose. A database resource is declared with a concrete
# kind (db.sql.sqlite, db.sql.postgres), and the planner's kind_matches only
# accepts an exact match unless the expected kind is in its KIND_PREFIX_SEARCH
# table, which lists env.storage alone. Declaring db.sql therefore matched no
# entry at all: the planner offered zero candidates and rejected a supplied
# app:db as "value must reference an existing db.sql". Restore the declaration
# on target_db once the planner prefix-matches db.sql the way it does
# env.storage.
VALID_VALUE_KINDS = {
    "env.storage",
    "fs.directory",
    "http.router",
    "http.service",
    "process.host",
    "security.policy",
    "security.scope",
}

# Requirements that carry no host resource. Each entry states why.
NON_RESOURCE_REQUIREMENTS = {
    "admin_lifecycle_grant": "structured provision grant, not an entry id",
    "archive_max_zip_bytes": "byte cap",
    "database_resource": "database resource; awaiting planner prefix matching for db.sql",
    "component_lifecycle_impl": "contract implementation wired by the host",
    "document_image_artifacts_enabled": "boolean",
    "facade_static_no_store": "cache-control directive",
    "lifecycle_impl": "contract implementation wired by the host",
    "login_role_resource": "role resource pattern, not an entry id",
    "storage_s3": "cloud storage resource declared outside this repo",
    "target_db": "database resource; awaiting planner prefix matching for db.sql",
    "user_lifecycle_grant": "structured provision grant, not an entry id",
}

SKIP_PARTS = {"node_modules", ".wippy", "dist", ".git"}


def index_files(root: Path) -> list[Path]:
    return [p for p in root.rglob("_index.yaml") if not SKIP_PARTS & set(p.parts)]


def entries(path: Path) -> list[dict[str, Any]]:
    try:
        doc = yaml.safe_load(path.read_text())
    except yaml.YAMLError as exc:
        raise SystemExit(f"{path}: unreadable YAML: {exc}")
    if not isinstance(doc, dict):
        return []
    return [e for e in (doc.get("entries") or []) if isinstance(e, dict)]


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    failures: list[str] = []
    declared = 0
    exempt = 0

    for path in index_files(root):
        rel = path.relative_to(root)
        for entry in entries(path):
            if entry.get("kind") != "ns.requirement":
                continue
            name = str(entry.get("name") or "")
            value_kind = (entry.get("meta") or {}).get("value_kind")
            if value_kind is None:
                if name in NON_RESOURCE_REQUIREMENTS:
                    exempt += 1
                    continue
                failures.append(
                    f"{rel}: requirement '{name}' declares no meta.value_kind "
                    f"(add one of {sorted(VALID_VALUE_KINDS)}, or list it in "
                    f"NON_RESOURCE_REQUIREMENTS with the reason)"
                )
                continue
            if value_kind not in VALID_VALUE_KINDS:
                failures.append(
                    f"{rel}: requirement '{name}' declares value_kind "
                    f"'{value_kind}', which is outside the resource vocabulary"
                )
                continue
            declared += 1

    for failure in failures:
        print(failure, file=sys.stderr)
    if failures:
        print(f"{len(failures)} requirement(s) need a value_kind decision.", file=sys.stderr)
        return 1

    print(f"Requirement value_kind is canonical: {declared} declared, {exempt} non-resource.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
