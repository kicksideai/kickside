#!/usr/bin/env python3
"""Validate module packaging rules before a KickSide release."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

import yaml

EXACT_VERSION = re.compile(r"^v?\d+\.\d+\.\d+(?:[-+].+)?$")
VALID_TYPES = {"application", "agent", "library", "plugin"}
VALID_VISIBILITIES = {"private", "public"}
DOCUMENTATION_KEYS = {"comment", "description", "title", "input_schema", "output_schema"}
PUBLIC_FORBIDDEN_APP_COMPONENTS = {
    "kickside/orders",
    "kickside/pim",
}

REQUIRE_ALIAS = re.compile(
    r'^\s*local\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*require\(["\'][^"\']+["\']\)',
    re.MULTILINE,
)
TRIVIAL_FORWARD_WRAPPER = re.compile(
    r'local\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\(([^)]*)\)(?:\s*:\s*[^\n]+)?\n'
    r'\s*return\s+([A-Za-z_][A-Za-z0-9_.:]*)\(([^()]*)\)\s*\nend',
)


def parameter_names(source: str) -> list[str]:
    """Return the declared names from a flat Lua parameter list."""
    if not source.strip():
        return []
    return [part.strip().split(":", 1)[0].strip() for part in source.split(",")]


def argument_names(source: str) -> list[str]:
    """Return a flat direct-call argument list, or a sentinel for expressions."""
    if not source.strip():
        return []
    return [part.strip() for part in source.split(",")]


def is_host_owned_reference(value: Any) -> bool:
    """Return whether a reusable package default selects an application resource."""
    return isinstance(value, str) and value.strip().startswith(("app:", "app."))


def host_owned_bindings(value: Any, path: tuple[str, ...] = ()) -> list[tuple[str, str]]:
    """Find executable/configuration values that select host-owned IDs."""
    found: list[tuple[str, str]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            key_text = str(key)
            if key_text in DOCUMENTATION_KEYS:
                continue
            found.extend(host_owned_bindings(child, (*path, key_text)))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(host_owned_bindings(child, (*path, f"[{index}]")))
    elif is_host_owned_reference(value):
        found.append((".".join(path), value.strip()))
    return found


def load_yaml(path: Path) -> dict[str, Any]:
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise RuntimeError(f"failed to parse {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise TypeError(f"{path} must contain a YAML map")
    return value


def repo_path(path: Path, root: Path) -> str:
    """Return a stable repository-relative path for diagnostics."""
    return path.relative_to(root).as_posix()


def configured_values(path: Path) -> set[str]:
    """Read one configured value per line; an absent file means no values."""
    if not path.is_file():
        return set()
    values: set[str] = set()
    for raw in path.read_text(encoding="utf-8").splitlines():
        value = raw.partition("#")[0].strip()
        if value:
            values.add(value)
    return values


def private_organizations(root: Path) -> set[str]:
    return configured_values(root / "release" / "private-orgs.txt")


def forbidden_app_components(root: Path) -> set[str]:
    return PUBLIC_FORBIDDEN_APP_COMPONENTS | configured_values(
        root / "release" / "private-app-components.txt"
    )


def is_within(path: Path, root: Path) -> bool:
    """Return whether path resolves inside root, including through symlinks."""
    try:
        path.resolve().relative_to(root.resolve())
    except ValueError:
        return False
    return True


def production_modules(root: Path) -> list[Path]:
    # KickSide keeps its packages under core/ and platform/, while companion
    # repositories such as Providers and Chestor keep packages one level down.
    # Deliberately do not recurse: nested test/eval harnesses are not releases.
    paths = list(root.glob("*/wippy.yaml"))
    paths.extend((root / "core").glob("*/wippy.yaml"))
    paths.extend((root / "platform").glob("*/wippy.yaml"))
    return sorted(path.parent for path in paths if path.is_file())


def make_value(makefile: Path, key: str) -> str | None:
    if not makefile.is_file():
        return None
    text = makefile.read_text(encoding="utf-8")
    pattern = re.compile(rf"^{re.escape(key)}\s*[:?]?=\s*([^#\s]+)")
    for line in text.splitlines():
        match = pattern.match(line)
        if match:
            return match.group(1)
    publish_flag = {"TYPE": "--module-type", "VIS": "--module-visibility"}.get(key)
    if publish_flag:
        match = re.search(rf"{re.escape(publish_flag)}\s+([^#\s]+)", text)
        if match and not match.group(1).startswith("$("):
            return match.group(1)
    return None


def source_entries(module: Path) -> list[tuple[Path, str | None, dict[str, Any]]]:
    rows: list[tuple[Path, str | None, dict[str, Any]]] = []
    source = module / "src"
    if not source.is_dir():
        return rows
    for path in sorted(source.rglob("*.yaml")):
        data = load_yaml(path)
        namespace = data.get("namespace")
        if not isinstance(namespace, str) or not namespace:
            namespace = None
        for entry in data.get("entries") or []:
            if isinstance(entry, dict):
                rows.append((path, namespace, entry))
    return rows


def check_lua_contract_usage(root: Path, module: Path) -> list[str]:
    """Reject compatibility probes around modules that are declared dependencies."""
    errors: list[str] = []
    source = module / "src"
    if not source.is_dir():
        return errors
    for path in sorted(source.rglob("*.lua")):
        if path.name.endswith("_test.lua") or "testing" in path.relative_to(source).parts:
            continue
        text = path.read_text(encoding="utf-8")
        label = repo_path(path, root)
        aliases = set(REQUIRE_ALIAS.findall(text))
        for alias in aliases:
            method_probe = re.compile(
                rf'type\(\s*\(?{re.escape(alias)}(?:\s*::\s*[^)]+)?\)?\.'
                r'[A-Za-z_][A-Za-z0-9_]*\s*\)\s*(?:==|~=)\s*["\']function["\']'
            )
            if method_probe.search(text):
                errors.append(
                    f"{label}: required module {alias!r} must be called through its "
                    "declared API; remove method-existence fallback probing"
                )
            availability_probe = re.compile(
                rf'\bif\s+not\s+{re.escape(alias)}\s+(?:then|and|or)'
            )
            if availability_probe.search(text):
                errors.append(
                    f"{label}: required module {alias!r} cannot be optional at runtime"
                )
        if re.search(
            r'type\([^\n]*(?:\.message|\.kind|\.code)\)\s*(?:==|~=)\s*["\']function["\']',
            text,
        ):
            errors.append(
                f"{label}: error method-shape probing is forbidden; use errors.is and tostring"
            )
        for wrapper in TRIVIAL_FORWARD_WRAPPER.finditer(text):
            if parameter_names(wrapper.group(2)) == argument_names(wrapper.group(4)):
                errors.append(
                    f"{label}: remove trivial {wrapper.group(1)} wrapper and reference "
                    f"{wrapper.group(3)} directly"
                )
    return errors


def makefile_embed_overrides(makefile: Path) -> list[str]:
    """Return explicit --embed values used by the publish target, if any."""
    if not makefile.is_file():
        return []
    text = makefile.read_text(encoding="utf-8")
    assignment = ""
    for line in text.splitlines():
        match = re.match(r"^EMBED\s*[:?]?=\s*(.*)$", line)
        if match:
            assignment = match.group(1)
            break

    publish_lines = [
        line for line in text.splitlines()
        if line.startswith("\t") and "publish" in line and "--embed" in line
    ]
    values = re.findall(r"--embed\s+([^\s]+)", assignment)
    for line in publish_lines:
        values.extend(re.findall(r"--embed\s+([^\s]+)", line))
    return values


def check_application_history(config: dict) -> list[str]:
    errors: list[str] = []
    profiles = {"application": config, "postgres": {}, **(config.get("profiles") or {})}
    for name, profile in profiles.items():
        registry = {**(config.get("registry") or {}), **(profile.get("registry") or {})}
        storage = registry.get("history_type")
        if storage not in {"memory", "sqlite", "postgres"}:
            errors.append(f"{name} registry history must select memory, SQLite or PostgreSQL storage")
        elif storage == "memory":
            if any(key in registry for key in ("history_dsn", "history_path", "history_schema")):
                errors.append(f"{name} memory history must not configure a durable backend")
        elif storage == "sqlite":
            if not registry.get("history_path"):
                errors.append(f"{name} SQLite history must configure its storage path")
        elif storage == "postgres":
            dsn = registry.get("history_dsn")
            derived = isinstance(dsn, str) and all("${postgres_" + field + "}" in dsn
                         for field in ("host", "port", "database", "username", "password", "sslmode"))
            if dsn != "${postgres_history_dsn}" and not derived:
                errors.append(f"{name} postgres history DSN must derive from application connection variables or its explicit history DSN")
            elif dsn == "${postgres_history_dsn}" and 'postgres_history_dsn' not in (config.get('vars') or {}):
                errors.append(f"{name} explicit postgres history DSN must declare its application variable")
            if registry.get("history_schema") != "${postgres_history_schema}":
                errors.append(f"{name} postgres history must map its schema variable")
        overrides = profile.get("override") or {}
        if (name == "postgres" or overrides.get("app:db:kind") == "db.sql.postgres") and storage != "postgres":
            errors.append(f"{name} must select PostgreSQL history")
    return errors


def declared_sibling_source(root: Path, target: Path, component: str) -> bool:
    for sibling in root.parent.iterdir():
        inventory = sibling / ".github/modules.json"
        if sibling.resolve() == root.resolve() or not inventory.is_file():
            continue
        for relative in json.loads(inventory.read_text())["modules"]:
            directory = sibling / relative
            if directory.resolve() == target.resolve():
                manifest = load_yaml(directory / "wippy.yaml")
                return manifest["organization"] + "/" + manifest["module"] == component
    return False


def check_module(root: Path, module: Path) -> list[str]:
    errors: list[str] = []
    manifest_path = module / "wippy.yaml"
    manifest = load_yaml(manifest_path)
    label = repo_path(module, root)
    organization = manifest.get("organization")
    private_orgs = private_organizations(root)
    errors.extend(check_lua_contract_usage(root, module))

    if module != root / "app" and (module / "wippy.lock").exists():
        errors.append(f"{label}: production modules must not have a root wippy.lock")
    if module == root / "app":
        alternate_locks = sorted(path.name for path in module.glob("wippy.lock*") if path.name != "wippy.lock")
        if alternate_locks:
            errors.append(f"{label}: remove alternate application locks: {', '.join(alternate_locks)}")

    test_lock_paths = [
        path for path in module.rglob("wippy.lock")
        if "test" in path.relative_to(module).parts
    ]
    for test_lock_path in sorted(test_lock_paths):
        test_label = repo_path(test_lock_path, root)
        test_lock = load_yaml(test_lock_path)
        locked_modules = test_lock.get("modules") or []
        if test_lock.get("replacements"):
            errors.append(
                f"{test_label}: test replacements belong in .wippy.yaml "
                "workspace.replacements, not the lock"
            )
        if not locked_modules:
            errors.append(f"{test_label}: test lock must retain a non-empty module graph")
        for locked_module in locked_modules:
            if not isinstance(locked_module, dict):
                errors.append(f"{test_label}: test lock modules must be maps")
                continue
            version = locked_module.get("version")
            if not isinstance(version, str) or not EXACT_VERSION.fullmatch(version.strip()):
                errors.append(
                    f"{test_label}:{locked_module.get('name') or '<unnamed>'}: "
                    f"test lock must pin an exact Hub version, not {version!r}"
                )

    test_workspace_paths = [
        path for path in module.rglob(".wippy.yaml")
        if "test" in path.relative_to(module).parts
    ]
    for workspace_path in sorted(test_workspace_paths):
        workspace_label = repo_path(workspace_path, root)
        workspace_config = load_yaml(workspace_path)
        workspace = workspace_config.get("workspace") or {}
        if not isinstance(workspace, dict):
            errors.append(f"{workspace_label}: workspace must be a map")
            continue
        replacements = workspace.get("replacements") or {}
        if not isinstance(replacements, dict):
            errors.append(f"{workspace_label}: workspace.replacements must be a map")
            continue
        for component, replacement in replacements.items():
            if not isinstance(replacement, str):
                errors.append(
                    f"{workspace_label}:{component}: replacement path must be a string"
                )
                continue
            target = workspace_path.parent / replacement
            if not is_within(target, root) and not declared_sibling_source(root, target, component):
                errors.append(
                    f"{workspace_label}:{component}: test replacement {replacement!r} "
                    "escapes the repository; keep self/harness replacements local and "
                    "resolve dependencies from the exact test lock"
                )
    if "version" in manifest:
        errors.append(f"{label}: persist no package version; release auto-bumps Hub latest")
    for key in ("replace", "replacement", "replacements"):
        if key in manifest:
            errors.append(f"{label}: production manifest must not declare {key}")

    declared_type = make_value(module / "Makefile", "TYPE")
    declared_visibility = make_value(module / "Makefile", "VIS")
    if declared_type and declared_type not in VALID_TYPES:
        errors.append(f"{label}: invalid Makefile TYPE={declared_type}")
    if declared_visibility and declared_visibility not in VALID_VISIBILITIES:
        errors.append(f"{label}: invalid Makefile VIS={declared_visibility}")
    if declared_visibility is None:
        errors.append(f"{label}: publish visibility must be declared")
    if declared_visibility == "private" and organization not in private_orgs:
        errors.append(
            f"{label}: only organizations listed in release/private-orgs.txt may be private; "
            f"{organization or '<missing>'}/* must be public for Hub discovery"
        )
    if declared_visibility == "public" and organization in private_orgs:
        errors.append(
            f"{label}: organizations listed in release/private-orgs.txt must remain private"
        )
    manifest_type = manifest.get("type")
    if manifest_type is None:
        errors.append(f"{label}: wippy.yaml must declare type")
    elif manifest_type not in VALID_TYPES:
        errors.append(f"{label}: invalid wippy.yaml type={manifest_type}")
    if declared_type and manifest_type in VALID_TYPES and declared_type != manifest_type:
        errors.append(
            f"{label}: Makefile TYPE={declared_type} does not match "
            f"wippy.yaml type={manifest_type}"
        )
    if module == root / "app" and manifest_type != "application":
        errors.append(f"{label}: root app must be published as type application")
    if module != root / "app" and (declared_type == "application" or manifest_type == "application"):
        errors.append(f"{label}: only the root app may be published as type application")

    entries = source_entries(module)
    definitions = [
        f"{namespace}:{entry.get('name')}"
        for _, namespace, entry in entries
        if entry.get("kind") == "ns.definition" and namespace and entry.get("name")
    ]
    if len(definitions) != 1:
        errors.append(
            f"{label}: publishable module must contain exactly one ns.definition; "
            f"found {len(definitions)} ({', '.join(definitions) or 'none'})"
        )

    entry_locations: dict[str, Path] = {}
    for path, namespace, entry in entries:
        name = entry.get("name")
        if not namespace or not isinstance(name, str) or not name:
            continue
        entry_id = f"{namespace}:{name}"
        previous = entry_locations.get(entry_id)
        if previous is not None:
            errors.append(
                f"{label}: duplicate registry entry {entry_id} in "
                f"{repo_path(previous, root)} and {repo_path(path, root)}"
            )
        else:
            entry_locations[entry_id] = path

    for path, namespace, entry in entries:
        meta = entry.get("meta")
        if not isinstance(meta, dict):
            meta = {}
        if meta.get("type") in {"test", "test_helper"}:
            continue
        if module == root / "app":
            continue
        name = entry.get("name")
        entry_id = f"{namespace}:{name}" if namespace else str(name)
        for field, value in host_owned_bindings(entry):
            errors.append(
                f"{repo_path(path, root)}:{entry_id}:{field}: reusable package "
                f"must not select host-owned resource {value!r}; expose a requirement "
                "and let the application or test harness bind it"
            )

    all_fs_ids = {
        f"{namespace}:{entry.get('name')}"
        for _, namespace, entry in entries
        if entry.get("kind") == "fs.directory"
        and namespace
        and entry.get("name")
    }
    required_fs_ids = {
        f"{namespace}:{entry.get('name')}"
        for _, namespace, entry in entries
        if entry.get("kind") == "fs.directory"
        and namespace
        and entry.get("name")
        and not entry.get("auto_init")
    }
    embedded = manifest.get("embed") or []
    if not isinstance(embedded, list):
        errors.append(f"{label}: embed must be a list")
        embedded = []
    embedded_ids = {str(value) for value in embedded}
    missing_embeds = sorted(required_fs_ids - embedded_ids)
    if missing_embeds:
        errors.append(f"{label}: fs.directory entries are not embedded: {', '.join(missing_embeds)}")
    unknown_embeds = sorted(embedded_ids - all_fs_ids)
    if unknown_embeds:
        errors.append(f"{label}: embed entries are not fs.directory IDs: {', '.join(unknown_embeds)}")

    overrides = makefile_embed_overrides(module / "Makefile")
    if overrides:
        suffix_matches: dict[str, list[str]] = {}
        for embed_id in embedded_ids:
            suffix_matches.setdefault(embed_id.rsplit(":", 1)[-1], []).append(embed_id)
        override_ids: set[str] = set()
        for value in overrides:
            if ":" in value:
                override_ids.add(value)
                continue
            matches = suffix_matches.get(value, [])
            override_ids.add(matches[0] if len(matches) == 1 else value)
        if override_ids != embedded_ids:
            errors.append(
                f"{label}: Makefile publish --embed overrides {sorted(override_ids)!r} "
                f"but wippy.yaml declares {sorted(embedded_ids)!r}"
            )

    for path, _, entry in entries:
        if entry.get("kind") != "ns.dependency":
            continue
        version = entry.get("version")
        name = entry.get("name") or "<unnamed>"
        if not isinstance(version, str) or not version.strip():
            errors.append(
                f"{repo_path(path, root)}:{name}: dependency version must be explicit "
                "and forward-resolvable (for example '*' or '>=1.2.3')"
            )
        elif EXACT_VERSION.fullmatch(version.strip()):
            errors.append(
                f"{repo_path(path, root)}:{name}: dependency version must be a range, not {version!r}"
            )

    if module == root / "app":
        excluded_paths = set(manifest.get("exclude") or [])
        if "wippy.lock" not in excluded_paths:
            errors.append(f"{label}: published application must exclude wippy.lock")

        publish_runtime = ((manifest.get("publish") or {}).get("runtime") or {})
        published_sections = publish_runtime.get("sections") or []
        if "registry" not in published_sections:
            errors.append(
                f"{label}: published application must include registry in "
                "publish.runtime.sections"
            )

        runtime_config_path = module / ".wippy.yaml"
        if not runtime_config_path.is_file():
            errors.append(f"{label}: .wippy.yaml is required")
        else:
            runtime_config = load_yaml(runtime_config_path)
            errors.extend(f"{label}: {error}" for error in check_application_history(runtime_config))

        lock_path = module / "wippy.lock"
        lock = load_yaml(lock_path) if lock_path.is_file() else {}
        if lock.get("replacements"):
            errors.append(f"{label}: application lock must not contain replacements")
        locked_modules = {
            row.get("name")
            for row in lock.get("modules") or []
            if isinstance(row, dict) and isinstance(row.get("name"), str)
        }
        forbidden_components = forbidden_app_components(root)
        root_components: set[str] = set()
        for path, _, entry in entries:
            if entry.get("kind") != "ns.dependency":
                continue
            component = entry.get("component")
            version = entry.get("version")
            if isinstance(component, str):
                root_components.add(component)
            if isinstance(component, str) and component.startswith("kickside/") and version != "*":
                errors.append(
                    f"{repo_path(path, root)}:{entry.get('name')}: KickSide app roots must use version '*'"
                )
            if component in forbidden_components:
                errors.append(f"{repo_path(path, root)}: lean app must not include {component}")
        if lock_path.is_file():
            missing_roots = sorted(root_components - locked_modules)
            if missing_roots:
                errors.append(f"{label}: lock is missing declared roots: {', '.join(missing_roots)}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    root = Path(args.root).resolve()

    errors: list[str] = []
    for module in production_modules(root):
        try:
            errors.extend(check_module(root, module))
        except RuntimeError as exc:
            errors.append(str(exc))

    if errors:
        print("release hygiene check failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("release hygiene check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
