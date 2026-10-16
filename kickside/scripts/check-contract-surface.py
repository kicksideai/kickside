#!/usr/bin/env python3
"""Every contract method needs a production invocation path or explicit declaration.

Jobs must not declare or import Core; producing owners compose thread output.
Scan registered core/*/src, platform/*/src and app/src sources;
only core/platform contract definitions and requirements are checked.
Exclude tests, fixtures, generated bundles, caches, migrations and test metadata.
A quoted literal contract ID in registered executable Lua (comments excluded)
covers that proxy's methods. This is static surface coverage, not runtime proof
of each method call. Dynamic dispatch declarations name a registered source,
exact contract/method pairs and a reason, without wildcards or expression matching.
An explicit external invoker names its module and source in that same declaration;
its source is not loaded or required to be registered in this repository.
Bindings and external provider releases are outside this gate's scope.
Only requirements of modules declared by app dependencies or onboarding
composition are checked; undeclared optional modules are the install planner's
responsibility. A requirement is satisfied by a non-null default or an app dependency/package
parameter. Fully-qualified parameters match directly; module-relative names
resolve within the matching component package. App parameters may live in deps
or app-owned onboarding composition declarations.
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
import yaml

EXCLUDED = {'test', 'tests', 'live-test', 'lint-harness', 'migration-test', 'fixtures', 'testing', 'node_modules', '.wippy', 'static', 'dist', 'migrations'}


def production_paths(root: Path):
    for base in ('core', 'platform', 'app/src'):
        for path in sorted((root / base).rglob('*.yaml')):
            rel = path.relative_to(root)
            if 'src' in rel.parts and not EXCLUDED.intersection(rel.parts):
                yield path


def uncomment(source: str) -> str:
    # Keep quoted strings; drop Lua/JS comments, including long comments.
    tokens = re.compile(r'''(?P<quoted>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|--\[(?P<equals>=*)\[.*?\](?P=equals)\]|/\*.*?\*/|--[^\n]*|//[^\n]*''', re.S)
    return tokens.sub(lambda m: m['quoted'] or '', source)


def jobs_layering_errors(root: Path) -> list[str]:
    errors = []
    # Check every shipped Jobs declaration, including migrations. Jobs shares
    # Core's namespace prefix, but its own imports belong to the lower module.
    for path in sorted((root / 'core/jobs/src').rglob('*.yaml')):
        document = yaml.safe_load(path.read_text()) or {}
        for entry in document.get('entries') or []:
            if entry.get('kind') == 'ns.dependency' and entry.get('component') == 'kickside/core':
                errors.append('Jobs must not declare a dependency on Core')
            for target in (entry.get('imports') or {}).values():
                if isinstance(target, str) and re.match(r'^kickside\.core(?:[.:/]|$)', target) \
                        and not re.match(r'^kickside\.core\.jobs(?:[.:/]|$)', target):
                    errors.append('Jobs must not import Core: ' + target)
    return errors


def check(root: Path) -> tuple[list[str], dict[str, int]]:
    errors = jobs_layering_errors(root)
    definitions = {}; requirements = set(); defaults = set(); parameters = set(); sources = {}; short_parameters = []; module_requirements = {}; declared_components = set()
    for path in production_paths(root):
        document = yaml.safe_load(path.read_text()) or {}
        namespace = document.get('namespace', '')
        for entry in document.get('entries') or []:
            entry_id = namespace + ':' + entry.get('name', '')
            kind = entry.get('kind')
            if (entry.get('meta') or {}).get('type') in ('test', 'test_dependency'): continue
            if kind == 'contract.definition' and not path.is_relative_to(root / 'app/src'):
                definitions[entry_id] = {method['name'] for method in entry.get('methods') or []}
            elif kind == 'ns.requirement':
                if path.is_relative_to(root / 'app/src'): continue
                requirements.add(entry_id)
                if entry.get('default') is not None: defaults.add(entry_id)
                parts = path.relative_to(root).parts
                package = parts[1]
                module_requirements.setdefault('kickside/' + package, set()).add(entry_id)
            if path.is_relative_to(root / 'app/src') and kind == 'ns.dependency':
                declared_components.add(entry.get('component'))
                for parameter in entry.get('parameters') or []:
                    if parameter.get('value') is None: continue
                    name = parameter['name']
                    if ':' in name: parameters.add(name)
                    else: short_parameters.append((entry.get('component'), name))
            if path.is_relative_to(root / 'app/src'):
                for package in entry.get('packages') or []:
                    declared_components.add(package.get('component'))
                    for parameter in package.get('parameters') or []:
                        if parameter.get('value') is not None:
                            name = parameter['name']
                            if ':' in name: parameters.add(name)
                            else: short_parameters.append((package.get('component'), name))
            source = entry.get('source', '')
            if kind in ('library.lua', 'function.lua', 'process.lua') and source.startswith('file://'):
                file = (path.parent / source[7:]).resolve()
                if file.is_file() and file.is_relative_to(root.resolve()):
                    sources[str(file.relative_to(root.resolve()))] = uncomment(file.read_text())
    requirements.intersection_update(set().union(*(module_requirements.get(component, set()) for component in declared_components)))
    defaults.intersection_update(requirements)
    for package, name in short_parameters:
        parameters.update(r for r in module_requirements.get(package, set()) if r.split(':')[-1] == name)
    invoked = set()
    for contract, methods in definitions.items():
        if any(re.search(r'''["']''' + re.escape(contract) + r'''["']''', source) for source in sources.values()):
            invoked.update((contract, method) for method in methods)
    declaration = root / 'scripts/contract-dispatch.json'
    for dispatch in json.loads(declaration.read_text()) if declaration.is_file() else []:
        path = dispatch['source']; source = sources.get(path)
        if (source is None and not dispatch.get('module')) or not str(dispatch.get('reason', '')).strip():
            errors.append(f'invalid generic dispatch declaration: {path}')
            continue
        for contract, methods in dispatch['contracts'].items():
            for method in methods:
                if method not in definitions.get(contract, set()):
                    errors.append(f'unknown dispatched method: {contract}.{method}')
                else: invoked.add((contract, method))
    for contract, methods in sorted(definitions.items()):
        for method in sorted(methods):
            if (contract, method) not in invoked: errors.append(f'no production invocation: {contract}.{method}')
    errors.extend('unbound app requirement: ' + r for r in sorted(requirements - defaults - parameters))
    return errors, {'contracts': len(definitions), 'methods': sum(map(len, definitions.values())), 'requirements': len(requirements), 'defaults': len(defaults)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    errors, counts = check(parser.parse_args().root.resolve())
    for error in errors: print(error, file=sys.stderr)
    if errors: return 1
    print(f"Contract surface holds: {counts['contracts']} contracts, {counts['methods']} methods, {counts['requirements']} satisfied requirements ({counts['defaults']} with defaults).")
    return 0

if __name__ == '__main__': sys.exit(main())
