#!/usr/bin/env python3
"""Guard high-risk app dependency pins before boot/release."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

import yaml

FORBIDDEN_COMPONENTS = {
    "kickside/code-execution",
    "kickside/code_execution",
    "kickside/kb10",
    "kickside/knowledge",
    "kickside/orders",
    "kickside/pim",
    "kickside/products",
}

NON_DEFAULT_ROOT_COMPONENTS = {
    "kickside/workflows",
}

REQUIRED_AUTH_COMPONENTS = {
    "kickside/sso",
    "kickside/sso-google",
}

REQUIRED_CONVERTER_COMPONENTS = {
    # Doc2MD is supplied transitively by uploads. PDF rasterization is a
    # capability plugin and therefore must be an explicit root.
    "kickside/pdf2image",
}

BOOTLOADER_OWNED_ENV = {"ENCRYPTION_KEY"}

EXACT_SEMVER = re.compile(
    r"^v?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)


def load_yaml(path: Path) -> dict[str, Any]:
    try:
        data = yaml.safe_load(path.read_text())
    except Exception as exc:
        raise RuntimeError(f"failed to parse {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise RuntimeError(f"{path} must contain a YAML map")
    return data


def dependency_components(index_path: Path) -> dict[str, str | None]:
    data = load_yaml(index_path)
    components: dict[str, str | None] = {}
    for entry in data.get("entries") or []:
        if not isinstance(entry, dict):
            continue
        if entry.get("kind") != "ns.dependency":
            continue
        component = entry.get("component")
        if isinstance(component, str) and component:
            version = entry.get("version")
            components[component] = version if isinstance(version, str) else None
    return components


def lock_modules(lock_path: Path) -> set[str]:
    data = load_yaml(lock_path)
    modules: set[str] = set()
    for row in data.get("modules") or []:
        if not isinstance(row, dict):
            continue
        name = row.get("name")
        if isinstance(name, str) and name:
            modules.add(name)
    return modules


def lock_replacements(lock_path: Path) -> bool:
    return bool(load_yaml(lock_path).get("replacements"))


def private_organizations(root: Path) -> set[str]:
    path = root / "release" / "private-orgs.txt"
    if not path.is_file():
        return set()
    return {
        value
        for raw in path.read_text(encoding="utf-8").splitlines()
        if (value := raw.partition("#")[0].strip())
    }


def check(
    index_path: Path,
    lock_path: Path,
    env_index_path: Path,
    private_orgs: set[str] | None = None,
) -> list[str]:
    private_orgs = private_orgs or set()
    roots = dependency_components(index_path)
    modules = lock_modules(lock_path) if lock_path.is_file() else set()
    errors: list[str] = []

    env_index = load_yaml(env_index_path)
    for entry in env_index.get("entries") or []:
        if not isinstance(entry, dict) or entry.get("kind") != "env.variable":
            continue
        variable = entry.get("variable")
        if variable in BOOTLOADER_OWNED_ENV:
            errors.append(
                f"bootloader-owned environment variable must not be redeclared in {env_index_path}: {variable}"
            )

    forbidden = FORBIDDEN_COMPONENTS
    if "kickside/agent-onboarding" in roots:
        forbidden = forbidden - {"kickside/knowledge"}
    for component in sorted(forbidden):
        if component in roots:
            errors.append(f"forbidden root dependency in {index_path}: {component}")
        if component in modules:
            errors.append(f"forbidden module in {lock_path}: {component}")

    for component in sorted(roots):
        if component.partition("/")[0] in private_orgs:
            errors.append(f"private-organization package must not be a default root dependency in {index_path}: {component}")
    for component in sorted(modules):
        if component.partition("/")[0] in private_orgs:
            errors.append(f"private-organization package must not be present in the default app lock {lock_path}: {component}")

    for component in sorted(NON_DEFAULT_ROOT_COMPONENTS):
        if component in roots:
            errors.append(f"optional module must not be a default root dependency in {index_path}: {component}")

    for component, version in sorted(roots.items()):
        if not isinstance(version, str) or not version.strip():
            errors.append(f"root dependency version must be a non-empty range: {component} has {version!r}")
        elif EXACT_SEMVER.fullmatch(version.strip()):
            errors.append(f"root dependency must not use a concrete version: {component} has {version!r}")

    if lock_path.is_file():
        missing = sorted(set(roots) - modules)
        if missing:
            errors.append(f"lock is missing declared roots: {', '.join(missing)}")
    missing_auth = sorted(REQUIRED_AUTH_COMPONENTS - set(roots))
    if missing_auth:
        errors.append(
            "default authentication roots are missing: " + ", ".join(missing_auth)
        )
    missing_converters = sorted(REQUIRED_CONVERTER_COMPONENTS - set(roots))
    if missing_converters:
        errors.append(
            "default converter roots are missing: " + ", ".join(missing_converters)
        )
    if lock_path.is_file() and lock_replacements(lock_path):
        errors.append(f"application lock must not contain replacements: {lock_path}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-dir", default=".", help="Wippy app directory")
    parser.add_argument(
        "--deps-index",
        default="src/app/deps/_index.yaml",
        help="dependency index path relative to app dir",
    )
    parser.add_argument("--lock-file", default="wippy.lock", help="lock file path relative to app dir")
    parser.add_argument(
        "--env-index",
        default="src/app/env/_index.yaml",
        help="application environment index path relative to app dir",
    )
    args = parser.parse_args()

    app_dir = Path(args.app_dir).resolve()
    errors = check(
        (app_dir / args.deps_index).resolve(),
        (app_dir / args.lock_file).resolve(),
        (app_dir / args.env_index).resolve(),
        private_organizations(app_dir.parent),
    )
    if errors:
        print("dependency pin check failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
