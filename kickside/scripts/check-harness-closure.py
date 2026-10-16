#!/usr/bin/env python3
"""Validate local dependency closure in disposable module test harnesses."""
import argparse
import os
from pathlib import Path
import sys

from release_order import dependencies, load, module_dirs


def catalog(root):
    return {f"{manifest['organization']}/{manifest['module']}": module
            for module in module_dirs(root)
            for manifest in [load(module / 'wippy.yaml')]}


def harness_dependencies(harness):
    manifest = harness / 'wippy.yaml'
    selected = load(manifest).get('directories', {}).get('src') if manifest.is_file() else None
    source = harness / (selected or ('src' if (harness / 'src').is_dir() else '.'))
    found = set()
    for directory, children, files in os.walk(source):
        children[:] = [name for name in children if name not in {'.wippy', '.git', 'node_modules', 'static'}]
        for name in files:
            if name.endswith(('.yaml', '.yml')):
                for entry in load(Path(directory) / name).get('entries') or []:
                    if isinstance(entry, dict) and entry.get('kind') == 'ns.dependency':
                        component = entry.get('component')
                        if isinstance(component, str):
                            found.add(component)
    return found


def check_harness(root, config, modules=None, graph=None):
    modules = modules if modules is not None else catalog(root)
    graph = graph if graph is not None else {name: dependencies(module) for name, module in modules.items()}
    replacements = load(config).get('workspace', {}).get('replacements', {})
    lock_path = config.parent / 'wippy.lock'
    locked = {row['name']: row for row in load(lock_path).get('modules', [])} if lock_path.is_file() else {}
    pending = [name for name in harness_dependencies(config.parent) if name in modules]
    seen = set()
    errors = []
    label = config.relative_to(root)
    while pending:
        name = pending.pop()
        if name in seen:
            continue
        seen.add(name)
        replacement = replacements.get(name)
        if replacement is None:
            errors.append(f'{label}: local dependency {name} requires a replacement')
        else:
            selected = config.parent / replacement
            manifest = selected / 'wippy.yaml'
            identity = load(manifest) if manifest.is_file() else {}
            if f"{identity.get('organization')}/{identity.get('module')}" != name:
                errors.append(f'{label}: replacement for {name} selects a different module')
        row = locked.get(name, {})
        if row.get('version') != '0.0.0' or row.get('hash'):
            errors.append(f'{lock_path.relative_to(root)}: local dependency {name} requires version 0.0.0 and no Hub hash')
        pending.extend(dependency for dependency in graph[name] if dependency in modules)
    return errors


def check_ownership(root, modules=None, graph=None):
    modules = modules if modules is not None else catalog(root)
    graph = graph if graph is not None else {name: dependencies(module) for name, module in modules.items()}
    return [f'{module.relative_to(root)}: core capability depends on platform module {dependency}'
            for name, module in modules.items() if module.parent == root / 'core'
            for dependency in sorted(graph[name])
            if dependency in modules and modules[dependency].parent == root / 'platform']


def harness_configs(root):
    for module in module_dirs(root):
        for directory, children, files in os.walk(module):
            children[:] = [name for name in children if name not in {'.wippy', '.git', 'node_modules', 'static'}]
            path = Path(directory)
            if path != module and '.wippy.yaml' in files and 'wippy.yaml' in files and load(path / 'wippy.yaml').get('type') == 'application':
                yield path / '.wippy.yaml'
            if path != module and 'wippy.yaml' in files:
                children[:] = []


def check_repository(root):
    modules = catalog(root)
    graph = {name: dependencies(module) for name, module in modules.items()}
    errors = check_ownership(root, modules, graph)
    for config in sorted(harness_configs(root)):
        errors.extend(check_harness(root, config, modules, graph))
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='.')
    args = parser.parse_args()
    errors = check_repository(Path(args.root).resolve())
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print('harness dependency closure check passes')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
