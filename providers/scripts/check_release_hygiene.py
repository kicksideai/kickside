#!/usr/bin/env python3
"""Fail closed on provider packaging rules that affect Hub installs."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IGNORED_PARTS = {"test", ".wippy", "node_modules"}
PUBLIC_ORGANIZATIONS = {"kickside"}


def private_organizations(root: Path) -> set[str]:
    path = root / "release" / "private-orgs.txt"
    if not path.is_file():
        return set()
    return {
        value
        for raw in path.read_text(encoding="utf-8").splitlines()
        if (value := raw.partition("#")[0].strip())
    }


def scalar(text: str, key: str) -> str | None:
    match = re.search(rf"(?m)^{re.escape(key)}\s*:\s*['\"]?([^'\"\s#]+)", text)
    return match.group(1) if match else None


def top_level_list(text: str, key: str) -> list[str]:
    values: list[str] = []
    active = False
    for line in text.splitlines():
        if re.fullmatch(rf"{re.escape(key)}:\s*", line):
            active = True
            continue
        if active and line and not line[0].isspace():
            break
        if active:
            match = re.match(r"^\s+-\s+['\"]?([^'\"\s#]+)", line)
            if match:
                values.append(match.group(1))
    return values


def production_yaml(module_dir: Path) -> list[Path]:
    return [
        path
        for path in module_dir.rglob("*.yaml")
        if not (set(path.relative_to(module_dir).parts) & IGNORED_PARTS)
    ]


def local_filesystems(module_dir: Path) -> set[str]:
    refs: set[str] = set()
    for path in production_yaml(module_dir):
        text = path.read_text(encoding="utf-8")
        namespace = scalar(text, "namespace")
        entry_name: str | None = None
        for line in text.splitlines():
            entry = re.match(r"^  - name:\s*['\"]?([\w.-]+)", line)
            if entry:
                entry_name = entry.group(1)
                continue
            if namespace and entry_name and re.match(r"^\s{4}kind:\s*fs\.directory\s*$", line):
                refs.add(f"{namespace}:{entry_name}")
    return refs


def check_dependency_constraints(path: Path, text: str, errors: list[str]) -> None:
    dependency = False
    for line_number, line in enumerate(text.splitlines(), start=1):
        if re.match(r"^  - name:\s*", line):
            dependency = False
        if re.match(r"^\s{4}kind:\s*ns\.dependency\s*$", line):
            dependency = True
            continue
        match = re.match(r"^\s{4}version:\s*['\"]?([^'\"\s#]+)", line)
        if not (dependency and match):
            continue
        constraint = match.group(1)
        if constraint != "*" and not any(op in constraint for op in "<>=~^"):
            errors.append(
                f"{path.relative_to(ROOT)}:{line_number}: exact dependency version "
                f"{constraint!r}; installable modules must declare a range"
            )


def check_delivery_metadata(root: Path, module_dir: Path) -> list[str]:
    import json
    import yaml
    manifest = yaml.safe_load((module_dir / 'wippy.yaml').read_text())
    relative = module_dir.relative_to(root).as_posix()
    metadata = json.loads((root / '.github/modules.json').read_text())['modules'].get(relative)
    if metadata is None:
        return [f'{relative}: missing GitHub publication metadata']
    errors = []
    expected = {key: manifest[key] for key in ('organization', 'module', 'type')}
    expected['embed'] = manifest.get('embed', [])
    expected['visibility'] = manifest.get('visibility', 'private' if manifest['organization'] in private_organizations(root) else 'public')
    for key, value in expected.items():
        if metadata.get(key) != value:
            errors.append(f'{relative}: GitHub publication {key} differs from manifest policy')
    return errors


def main() -> int:
    errors: list[str] = []
    expected_visibility = {organization: "public" for organization in PUBLIC_ORGANIZATIONS}
    expected_visibility.update(
        {organization: "private" for organization in private_organizations(ROOT)}
    )
    module_dirs = sorted(
        path.parent for path in ROOT.glob("*/wippy.yaml") if path.parent.is_dir()
    )
    module_names = {path.name for path in module_dirs}

    root_makefile = (ROOT / "Makefile").read_text(encoding="utf-8")
    modules_match = re.search(r"(?m)^MODULES\s*:=\s*(.+)$", root_makefile)
    listed = set(modules_match.group(1).split()) if modules_match else set()
    if listed != module_names:
        errors.append(
            "Makefile MODULES differs from installable manifests: "
            f"missing={sorted(module_names - listed)}, extra={sorted(listed - module_names)}"
        )

    for lock in ROOT.glob("*/wippy.lock"):
        errors.append(f"{lock.relative_to(ROOT)}: module roots must not contain wippy.lock")

    for module_dir in module_dirs:
        manifest_path = module_dir / "wippy.yaml"
        manifest = manifest_path.read_text(encoding="utf-8")
        organization = scalar(manifest, "organization")
        module = scalar(manifest, "module")
        default_visibility = expected_visibility.get(organization or "")
        if default_visibility is None:
            errors.append(
                f"{manifest_path.relative_to(ROOT)}: unsupported organization {organization!r}"
            )
            continue
        declared_visibility = scalar(manifest, "visibility")
        if declared_visibility not in (None, "public", "private"):
            errors.append(
                f"{manifest_path.relative_to(ROOT)}: visibility must be public or private"
            )
        if not module:
            errors.append(f"{manifest_path.relative_to(ROOT)}: missing module identity")

        if re.search(r"(?m)^replacements?:\s*", manifest):
            errors.append(
                f"{manifest_path.relative_to(ROOT)}: replacements belong only in test applications"
            )

        manifest_embeds = set(top_level_list(manifest, "embed"))
        fs_refs = local_filesystems(module_dir)
        if manifest_embeds != fs_refs:
            errors.append(
                f"{manifest_path.relative_to(ROOT)}: embed declarations must exactly match "
                f"published filesystems; declared={sorted(manifest_embeds)}, refs={sorted(fs_refs)}"
            )

        makefile_path = module_dir / "Makefile"
        if not makefile_path.exists():
            errors.append(
                f"{makefile_path.relative_to(ROOT)}: every installable module needs release targets"
            )
            continue
        makefile = makefile_path.read_text(encoding="utf-8")
        for duplicate in ("TYPE", "VIS", "EMBED"):
            if re.search(rf"(?m)^{duplicate}\s*:?=", makefile):
                errors.append(
                    f"{makefile_path.relative_to(ROOT)}: {duplicate} duplicates wippy.yaml"
                )
        if manifest_embeds and not re.search(r"(?m)^build:\s*$", makefile):
            errors.append(f"{makefile_path.relative_to(ROOT)}: embedded UI requires a build target")
        if 'Releases use GitHub Release Please' not in makefile or any('wippy publish' in line and '--dry-run' not in line for line in makefile.splitlines() if not line.lstrip().startswith('#')):
            errors.append(f"{makefile_path.relative_to(ROOT)}: local publication is forbidden")
        errors.extend(check_delivery_metadata(ROOT, module_dir))

        for path in production_yaml(module_dir):
            text = path.read_text(encoding="utf-8")
            if re.search(r"(?m)^\s*replacements?:\s*", text):
                errors.append(
                    f"{path.relative_to(ROOT)}: replacements belong only in test applications"
                )
            check_dependency_constraints(path, text, errors)

    release = (ROOT / "release.sh").read_text(encoding="utf-8")
    if 'Local releases only support --dry-run' not in release or 'TARGET=publish' in release:
        errors.append('release.sh: only local dry runs are permitted')
    workflow = ROOT / '.github/workflows/release.yml'
    if not workflow.is_file():
        errors.append('GitHub release workflow is required')

    if errors:
        print("release hygiene failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"release hygiene ok: {len(module_dirs)} public/private plugin manifests")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
