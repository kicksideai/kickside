"""Focused, fresh module and application harness execution for smoke guards."""
import copy
from contextlib import contextmanager
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import shutil
import tempfile
import subprocess
import uuid

import yaml

from harness import require
from runtime import drop_database, source_directory


DEFAULT_TIMEOUT = 900
SOURCE_COPY_IGNORED = frozenset(('.git', '.wippy', 'node_modules', '__pycache__'))


def _private_suite_root():
    """Return the checkout that owns smoke-only checks and harness tooling."""
    return Path(__file__).resolve().parents[2]


def _owned_overlay_path(path, owner):
    """Validate a private fixture name before it is copied into an overlay."""
    relative = Path(path)
    require(relative.parts and not relative.is_absolute() and '..' not in relative.parts,
            'Private overlay fixture must be a relative non-traversing path: ' + str(path))
    fixture = owner / relative
    candidate = fixture.resolve()
    require(candidate.is_relative_to(owner),
            'Private overlay fixture escapes its owning checkout: ' + str(path))
    require(candidate.exists(), 'Private overlay fixture is absent: ' + str(relative))
    return relative, fixture


def _overlay_destination_path(path):
    relative = Path(path)
    require(relative.parts and not relative.is_absolute() and '..' not in relative.parts,
            'Private overlay destination must be a relative non-traversing path: ' + str(path))
    return relative


def _planned_symlink_target(link, destination):
    raw = Path(os.readlink(link))
    return raw.resolve() if raw.is_absolute() else (destination.parent / raw).resolve()


def _validate_copied_links(source, destination, source_root, overlay_root, label):
    """Refuse links which would point outside their source or disposable copy."""
    def copied_links():
        if source.is_symlink():
            yield source
            return
        for directory, directories, files in os.walk(source, followlinks=False):
            directories[:] = [name for name in directories if name not in SOURCE_COPY_IGNORED]
            for name in (*directories, *files):
                path = Path(directory) / name
                if name not in SOURCE_COPY_IGNORED and path.is_symlink():
                    yield path
    for link in copied_links():
        planned = destination if link == source else destination / link.relative_to(source)
        require(link.resolve().is_relative_to(source_root),
                label + ' source symlink escapes its owned tree: ' + str(link))
        require(_planned_symlink_target(link, planned).is_relative_to(overlay_root),
                label + ' symlink escapes the disposable source: ' + str(link))


def _overlay_module_overrides(overlay, overrides):
    """Apply explicitly selected product modules to an otherwise public copy."""
    resolved_overlay = overlay.resolve()
    for relative, source in (overrides or {}).items():
        destination = overlay / _overlay_destination_path(relative)
        selected = Path(source).resolve()
        require(selected.is_dir(), 'Public overlay module source is absent: ' + str(selected))
        require(destination.resolve().is_relative_to(resolved_overlay),
                'Public overlay module escapes the disposable source: ' + str(relative))
        _validate_copied_links(selected, destination, selected, resolved_overlay,
                               'Public overlay module')
        if destination.is_symlink() or destination.is_file():
            destination.unlink()
        elif destination.is_dir():
            shutil.rmtree(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(selected, destination, symlinks=True,
                        ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))


def selected_module_overrides(ctx, modules):
    """Map explicit product module replacements onto their public tree paths."""
    replacements = ctx.inst.config.get('replace', {})
    return {relative: Path(replacements[component]).resolve()
            for relative, component in modules if replacements.get(component)}


def selected_module_file(source, overrides, relative):
    """Resolve a product file from its selected module replacement, if any."""
    candidate = Path(relative)
    for module, selected in overrides.items():
        module_path = Path(module)
        if candidate.is_relative_to(module_path):
            return selected / candidate.relative_to(module_path)
    return Path(source) / candidate


@contextmanager
def public_source_overlay(ctx, owned_paths, *, owner=None, module_overrides=None):
    """Copy public product source and add named private-only harness files.

    The product source is never changed. Private paths are deliberately
    constrained to files absent from that source, so this helper cannot replace
    public implementation code with a similarly named private file.
    """
    source = Path(ctx.inst.config['source']).resolve()
    require(source.is_dir(), 'Public source overlay requires a source directory: ' + str(source))
    owner = Path(owner).resolve() if owner else _private_suite_root()
    require(owner.is_dir(), 'Private overlay owner is absent: ' + str(owner))
    fixtures = []
    for path in owned_paths:
        source_path, destination_path = path if isinstance(path, tuple) else (path, path)
        relative, fixture = _owned_overlay_path(source_path, owner)
        fixtures.append((_overlay_destination_path(destination_path), fixture))
    temporary = Path(ctx.inst.root) / 'temp'
    temporary.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='public-source-overlay-', dir=temporary) as directory:
        overlay = Path(directory) / source.name
        _validate_copied_links(source, overlay, source, overlay.resolve(), 'Public source')
        shutil.copytree(source, overlay, symlinks=True,
                        ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))
        _overlay_module_overrides(overlay, module_overrides)
        resolved_overlay = overlay.resolve()
        for relative, fixture in fixtures:
            destination = overlay / relative
            require(destination.resolve().is_relative_to(resolved_overlay),
                    'Private overlay fixture escapes the disposable source: ' + str(relative))
            require(not destination.exists() and not destination.is_symlink(),
                    'Private overlay fixture would replace public source: ' + str(relative))
            _validate_copied_links(fixture, destination, owner, resolved_overlay,
                                   'Private overlay fixture')
            destination.parent.mkdir(parents=True, exist_ok=True)
            if fixture.is_symlink():
                destination.symlink_to(os.readlink(fixture), target_is_directory=fixture.is_dir())
            elif fixture.is_dir():
                shutil.copytree(fixture, destination, symlinks=True, dirs_exist_ok=True,
                                ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))
            else:
                shutil.copy2(fixture, destination)
        yield overlay


@contextmanager
def selected_module_overlay(ctx, component, owned_paths, *, owner=None):
    """Stage private checks beside a disposable copy of one selected module.

    Provider modules are selected independently from the application source
    tree.  Their smoke-only checks therefore need the same ownership boundary
    as application frontend checks: selected product bytes are copied first,
    and private fixtures may only fill paths absent from those bytes.
    """
    selected = ctx.inst.config.get('replace', {}).get(component)
    require(selected, 'Selected module overlay requires a local replacement for ' + component)
    source = Path(selected).resolve()
    require(source.is_dir(), 'Selected module source is absent: ' + str(source))
    owner = Path(owner).resolve() if owner else _private_suite_root()
    require(owner.is_dir(), 'Private overlay owner is absent: ' + str(owner))
    fixtures = []
    for path in owned_paths:
        source_path, destination_path = path if isinstance(path, tuple) else (path, path)
        relative, fixture = _owned_overlay_path(source_path, owner)
        fixtures.append((_overlay_destination_path(destination_path), fixture))
    temporary = Path(ctx.inst.root) / 'temp'
    temporary.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='selected-module-overlay-', dir=temporary) as directory:
        overlay = Path(directory) / source.name
        _validate_copied_links(source, overlay, source, overlay.resolve(), 'Selected module')
        shutil.copytree(source, overlay, symlinks=True,
                        ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))
        resolved_overlay = overlay.resolve()
        for relative, fixture in fixtures:
            destination = overlay / relative
            require(destination.resolve().is_relative_to(resolved_overlay),
                    'Private overlay fixture escapes the disposable module: ' + str(relative))
            require(not destination.exists() and not destination.is_symlink(),
                    'Private overlay fixture would replace selected module source: ' + str(relative))
            _validate_copied_links(fixture, destination, owner, resolved_overlay,
                                   'Private overlay fixture')
            destination.parent.mkdir(parents=True, exist_ok=True)
            if fixture.is_symlink():
                destination.symlink_to(os.readlink(fixture), target_is_directory=fixture.is_dir())
            elif fixture.is_dir():
                shutil.copytree(fixture, destination, symlinks=True, dirs_exist_ok=True,
                                ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))
            else:
                shutil.copy2(fixture, destination)
        yield overlay


@contextmanager
def source_checkout_overlay(ctx, name):
    """Copy one named non-module source checkout for a disposable native gate."""
    checkout = ctx.inst.config.get('source_checkouts', {}).get(name)
    require(checkout, 'Selected source checkout is absent: ' + name)
    source = Path(checkout).resolve()
    require(source.is_dir(), 'Selected source checkout is absent: ' + str(source))
    temporary = Path(ctx.inst.root) / 'temp'
    temporary.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='source-checkout-overlay-', dir=temporary) as directory:
        overlay = Path(directory) / source.name
        _validate_copied_links(source, overlay, source, overlay.resolve(),
                               'Selected source checkout')
        shutil.copytree(source, overlay, symlinks=True,
                        ignore=shutil.ignore_patterns(*SOURCE_COPY_IGNORED))
        yield overlay


def copy_harness(original,repository,scratch):
    container=scratch/'repository'
    container.mkdir(parents=True)
    destination=container/repository.name
    for sibling in repository.parent.iterdir():
        if sibling!=repository and sibling.is_dir() and not destination.is_relative_to(sibling):
            (container/sibling.name).symlink_to(sibling,target_is_directory=True)
    patterns=shutil.ignore_patterns('.git','.wippy','node_modules','__pycache__','*.log',
                                    'wippy.lock')
    def ignore(directory,names):
        excluded=set(patterns(directory,names))
        excluded.update(name for name in names if destination.is_relative_to(Path(directory)/name)
                        and not original.is_relative_to(Path(directory)/name))
        return excluded
    shutil.copytree(repository,destination,ignore=ignore,symlinks=True)
    root=destination/original.relative_to(repository)
    for name in ('wippy.lock',):
        if (original/name).exists():shutil.copy2(original/name,root/name)
    return root



def run_focused_module_test(ctx, component, entry, *, timeout=DEFAULT_TIMEOUT, lint=False):
    """Refresh and run one named test entry, with optional harness lint."""
    source = ctx.inst.config['replace'].get(component)
    require(source, 'Focused module test requires a local replacement for ' + component)
    module_root = Path(source)
    test_root = module_root / 'test'
    require(test_root.is_dir(), 'Focused module test has no test directory: ' + str(test_root))
    return _run(ctx, test_root, entry, timeout=timeout, module_root=module_root,
                label=component.replace('/', '-'), lint=lint)


def run_focused_module_suite(ctx, component, suite, *, timeout=DEFAULT_TIMEOUT):
    """Run a named suite through its module's native Makefile test gate."""
    source = ctx.inst.config['replace'].get(component)
    require(source, 'Focused module suite requires a local replacement for ' + component)
    module_root = Path(source).resolve()
    gate_root = module_root if (module_root / 'Makefile').exists() else module_root.parent
    require((gate_root / 'Makefile').exists(), 'Module repository has no Makefile: ' + str(module_root))
    require((module_root / 'test').is_dir(), 'Module has no test harness: ' + str(module_root))
    return _run(ctx, module_root / 'test', suite, timeout=timeout, module_root=gate_root,
                label=component.replace('/', '-'), repository_gate=True)


def run_focused_app_test(ctx, app_root, entry, *, timeout=DEFAULT_TIMEOUT):
    """Create a fresh config and run one named test entry from a standalone test app."""
    app_root = Path(app_root)
    require(app_root.is_dir(), 'Focused application test root is absent: ' + str(app_root))
    return _run(ctx, app_root, entry, timeout=timeout, module_root=None,
                label=app_root.name.replace('_', '-'))


def valid_focused_selection(entry):
    """Allow a native test name, suite, or fully-qualified test identity."""
    return isinstance(entry, str) and re.fullmatch(
        r'[A-Za-z0-9_.]+(?::[A-Za-z0-9_]+)?', entry) is not None


def _run(ctx, root, entry, *, timeout, module_root, label, repository_gate=False, lint=False):
    require(valid_focused_selection(entry),
            'Focused test entry is invalid: ' + str(entry))
    inst = ctx.inst
    root = Path(root).resolve()
    lock_path = root / '.wippy' / 'focused-module.lock'
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open('a+') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        source=Path(inst.config['source']).resolve() if inst.config.get('source') else None
        repository=source if source and root.is_relative_to(source) else next(
            (parent for parent in root.parents if (parent/'.github/modules.json').is_file()),
            Path(module_root).resolve() if module_root else root)
        temporary=Path(inst.root)/'temp'
        temporary.mkdir(parents=True,exist_ok=True)
        try:
            with tempfile.TemporaryDirectory(prefix='focused-',dir=temporary) as directory:
                copied=copy_harness(root,repository,Path(directory))
                copied_module=None
                if module_root:
                    copied_module=copied
                    for _ in root.relative_to(Path(module_root).resolve()).parts:
                        copied_module=copied_module.parent
                replace = dict(inst.config.get('replace', {}))
                verify_source_profile = bool(source and module_root and not root.is_relative_to(source))
                copied_repository = copied
                for _ in root.relative_to(repository).parts:
                    copied_repository = copied_repository.parent
                if repository_gate:
                    for name, path in replace.items():
                        if Path(path).resolve().is_relative_to(repository):
                            replace[name] = str(copied_repository / Path(path).resolve().relative_to(repository))
                return _run_locked(ctx, copied, entry, timeout=timeout, module_root=copied_module,
                                   label=label, repository_gate=repository_gate, lint=lint, replace=replace,
                                   verify_source_profile=verify_source_profile,
                                   copied_repository=copied_repository)
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)


def _verify_focused_source_profile(config_path, replace, copied_repository, root, original):
    """Keep selected replacements exact, allowing only owned fixture aliases."""
    configured = yaml.safe_load(config_path.read_text()) or {}
    actual = configured.get('workspace', {}).get('replacements', {})
    require(isinstance(actual, dict),
            'Focused module replacement profile has invalid replacements')
    expected = {name: str(Path(path).resolve()) for name, path in replace.items()}
    missing = sorted(expected.keys() - actual.keys())
    changed = sorted(name for name in expected.keys() & actual.keys()
                     if actual[name] != expected[name])
    require(not missing,
            'Focused module replacement profile is missing selected mappings: ' + ', '.join(missing))
    declared = (yaml.safe_load(original) or {}).get('workspace', {}).get('replacements', {}) if original else {}
    require(isinstance(declared, dict),
            'Focused module fixture declarations are invalid')
    boundary = Path(copied_repository).resolve()
    focused_root = Path(root).resolve()
    selected_fixture_remaps = []
    invalid_changed = []
    for name in changed:
        declared_path = declared.get(name)
        path = actual[name]
        if not (isinstance(declared_path, str) and declared_path and
                not Path(declared_path).is_absolute() and isinstance(path, str) and path):
            invalid_changed.append(name)
            continue
        candidate = Path(path).resolve()
        if (candidate != (focused_root / declared_path).resolve() or not candidate.is_dir() or
                not candidate.is_relative_to(focused_root) or not candidate.is_relative_to(boundary)):
            invalid_changed.append(name)
            continue
        selected_fixture_remaps.append(name)
    require(not invalid_changed,
            'Focused module replacement profile changed selected mappings: ' + ', '.join(invalid_changed))
    extras = sorted(actual.keys() - expected.keys())
    for name in extras:
        declared_path = declared.get(name)
        require(isinstance(declared_path, str) and declared_path and not Path(declared_path).is_absolute(),
                'Focused module fixture alias is not declared locally: ' + name)
        path = actual[name]
        require(isinstance(path, str) and path,
                'Focused module fixture alias has invalid source: ' + name)
        candidate = Path(path).resolve()
        require(candidate == (focused_root / declared_path).resolve(),
                'Focused module fixture alias does not match its declared path: ' + name)
        require(candidate.is_dir(),
                'Focused module fixture alias is absent: ' + name)
        require(candidate.is_relative_to(boundary),
                'Focused module fixture alias escapes the owned copy: ' + name)
    for name, path in actual.items():
        require(isinstance(path, str) and Path(path).is_dir(),
                'Focused module replacement profile contains an absent source: ' + str(name))
    return {'replacements': actual, 'owned_fixture_aliases': extras,
            'owned_selected_fixture_remaps': selected_fixture_remaps}


def _run_locked(ctx, root, entry, *, timeout, module_root, label, replace, repository_gate=False, lint=False,
                verify_source_profile=False, copied_repository=None):
    inst = ctx.inst
    identifier = re.sub(r'[^a-z0-9_]+', '_', label.lower()).strip('_')[-20:] or 'app'
    database = 'smoke_focused_' + identifier + '_' + uuid.uuid4().hex[:12]
    created = []
    config_path, original = _write_config(inst, root, database, replace)
    environment = dict(inst.env)
    environment['PATH'] = str(Path(inst.config['binary']).parent) + os.pathsep + environment.get('PATH', '')
    preparation = root / 'prepare.sh'
    refresh = _refresh_command(inst, root, config_path, module_root)
    try:
        if inst.engine == 'postgres':
            for name in _postgres_database_names(config_path, database):
                inst.pg('CREATE DATABASE "' + name + '" TEMPLATE template0')
                created.append(name)
        _discard_harness_lock(root)
        if module_root is None and preparation.is_file():
            _command(inst, label + '-prepare', ['bash', preparation.name], root, environment, timeout)
        refresh_root = root if refresh[0] == inst.config['binary'] else module_root or root
        _command(inst, label + '-refresh', refresh, refresh_root, environment, timeout)
        if verify_source_profile:
            inst.evidence.save('focused-' + label + '-source-profile',
                               _verify_focused_source_profile(config_path, replace, copied_repository,
                                                               root, original))
        available = _loaded_test_ids(inst, root, environment, timeout, label)
        if lint:
            command = [inst.config['binary'], '--config', config_path.name, 'lint']
            if inst.engine == 'postgres':
                command.extend(('--profile', 'postgres'))
            _command(inst, label + '-lint', command, root, environment, timeout)
        focused_config = yaml.safe_load(config_path.read_text())
        _focus_tests(root, focused_config, None if repository_gate else entry, available=available)
        config_path.write_text(yaml.safe_dump(focused_config, sort_keys=False))
        test = [inst.config['binary'], '--config', config_path.name, 'test']
        if inst.engine == 'postgres':
            test.extend(('--profile', 'postgres', '--set', 'vars.pg_database=' + database))
        cwd = root
        if repository_gate:
            options = '--profile postgres --set vars.pg_database=' + database if inst.engine == 'postgres' else ''
            test = ['make', 'test', 'SUITES=' + entry, 'WIPPY_TEST_ARGS=' + options]
            cwd = module_root
        return _command(inst, label + '-' + entry, test, cwd, environment, timeout, require_tests=True)
    finally:
        for name in reversed(created):
            drop_database(name, inst.pg)


def _write_config(inst, root, database, replace=None):
    config_path = root / '.wippy.yaml'
    original = config_path.read_text() if config_path.exists() else None
    config = yaml.safe_load(original) if original is not None else {}
    config = copy.deepcopy(config or {})
    config.setdefault('version', '1.0')
    config.setdefault('vars', {})
    config['vars']['sqlite_path'] = str(Path(inst.root) / 'temp' / (database + '.sqlite'))
    if 'http_port' in config['vars']:
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0))
            config['vars']['http_port'] = listener.getsockname()[1]
    config['vars'].update({
        'pg_host': inst.config.get('pg', {}).get('host', ''),
        'pg_port': int(inst.config.get('pg', {}).get('port', 5432)),
        'pg_database': database,
        'pg_username': inst.config.get('pg', {}).get('user', ''),
        'pg_password': inst.config.get('pg', {}).get('password', ''),
    })
    local = config.setdefault('workspace', {}).get('replacements', {})
    resolved = dict(inst.config.get('replace', {}) if replace is None else replace)
    for name, path in local.items():
        local_path = (root / path).resolve() if not Path(path).is_absolute() else Path(path).resolve()
        if (name not in resolved or Path(path).is_absolute() or local_path == root or
                local_path.is_relative_to(root)):
            resolved[name] = str(local_path)
    if resolved:
        config.setdefault('workspace', {})['replacements'] = resolved
    config['profiles'] = copy.deepcopy(config.get('profiles', {}))
    postgres = config['profiles'].setdefault('postgres', {})
    if not postgres:
        postgres['vars'] = {'pg_database': database}
    if 'http_port' in config['vars'] and 'http_port' in postgres.get('vars', {}):
        postgres['vars']['http_port'] = config['vars']['http_port']
    database_configured = any(key.startswith('app:db:') for overrides in (
        config.get('override', {}), postgres.get('override', {})) for key in overrides)
    if database_configured:
        override = postgres.setdefault('override', {})
        override.setdefault('app:db:kind', 'db.sql.postgres')
        override.setdefault('app:db:host', '${pg_host}')
        override.setdefault('app:db:port', '${pg_port}')
        override.setdefault('app:db:database', '${pg_database}')
        override.setdefault('app:db:username', '${pg_username}')
        override.setdefault('app:db:password', '${pg_password}')
        override.setdefault('app:db:options.sslmode', 'disable')
    if inst.engine == 'postgres':
        _isolate_postgres_variables(config, database)
    config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    return config_path, original


def test_entries(root):
    entries = {}
    for path in (root / source_directory(root)).rglob('*.yaml'):
        if '.wippy' in path.relative_to(root).parts:
            continue
        document = yaml.safe_load(path.read_text()) or {}
        if not isinstance(document, dict) or not document.get('namespace'):
            continue
        for entry in document.get('entries', []):
            if (entry.get('meta') or {}).get('type') == 'test':
                entries[document['namespace'] + ':' + entry['name']] = entry
    return entries


def replacement_test_entries(root, config):
    entries = {}
    replacements = config.get('workspace', {}).get('replacements', {})
    for path in replacements.values():
        if not isinstance(path, str) or not path:
            continue
        candidate = Path(path)
        candidate = candidate.resolve() if candidate.is_absolute() else (root / candidate).resolve()
        if not candidate.is_dir() or candidate == root or candidate.is_relative_to(root):
            continue
        entries.update(test_entries(candidate))
    return entries


def _loaded_test_ids(inst, root, environment, timeout, label):
    command = [inst.config['binary'], '--config', '.wippy.yaml', 'registry', 'list',
               '--meta', 'type=test', '--json']
    if inst.engine == 'postgres':
        command.extend(('--profile', 'postgres'))
    completed = _command(inst, label + '-test-catalog', command, root, environment, timeout)
    entries = json.loads(completed.stdout)
    require(isinstance(entries, list) and all(isinstance(row, dict) and
            isinstance(row.get('id'), str) and row['id'] for row in entries),
            'Native test catalog has invalid entries')
    return {row['id'] for row in entries}


def _focus_tests(root, config, selection=None, *, available=None):
    entries = test_entries(root)
    if available is not None:
        entries = {identifier: entry for identifier, entry in entries.items() if identifier in available}
    if selection is None:
        selected = set(entries)
    else:
        selected = {identifier for identifier, entry in entries.items()
                    if selection in (identifier, entry['name'], entry.get('meta', {}).get('suite'))}
        require(selected, 'Focused harness selection matches no test: ' + selection)
        selected.update(identifier for identifier, entry in entries.items()
                        if str(entry.get('meta', {}).get('suite', '')).startswith('00_'))
    overrides = config.setdefault('override', {})
    foreign = (replacement_test_entries(root, config).keys() if available is None
               else set(available) - entries.keys())
    excluded = (entries.keys() - selected) | foreign
    for identifier in excluded:
        overrides[identifier + ':meta.type'] = 'test_focus_excluded'


def _discard_harness_lock(root):
    (root / 'wippy.lock').unlink(missing_ok=True)



def _postgres_database_templates(config):
    profile = config.get('profiles', {}).get('postgres', {})
    overrides = dict(config.get('override', {}), **profile.get('override', {}))
    return [value for key, value in overrides.items() if key.endswith(':database')]


def _isolate_postgres_variables(config, database):
    profile = config['profiles']['postgres']
    variables = dict(config['vars'], **profile.get('vars', {}))
    names = set()
    for template in _postgres_database_templates(config):
        require(isinstance(template, str), 'Focused Postgres database declaration is not a string')
        referenced = re.findall(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}', template)
        require(referenced, 'Focused Postgres database requires an isolated variable: ' + template)
        for name in referenced:
            require(name in variables, 'Focused Postgres database variable is undeclared: ' + name)
            names.add(name)
    names.add('pg_database')
    for name in sorted(names):
        value = database if name == 'pg_database' else database + '_' + hashlib.sha256(name.encode()).hexdigest()[:8]
        config['vars'][name] = value
        if name in profile.get('vars', {}):
            profile['vars'][name] = value
    _postgres_database_names_from_config(config, database)
    return {name: config['vars'][name] for name in sorted(names)}


def _declared_postgres_database_names(config):
    variables = dict(config['vars'], **config['profiles']['postgres'].get('vars', {}))
    names = []
    for template in _postgres_database_templates(config):
        name = re.sub(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}', lambda match: str(variables[match[1]]), template)
        require(re.fullmatch(r'[a-z][a-z0-9_]{0,62}', name) is not None,
                'Focused Postgres database name is invalid: ' + name)
        if name not in names:
            names.append(name)
    return names


def _postgres_database_names_from_config(config, database):
    names = [database, database + '_mig']
    names.extend(name for name in _declared_postgres_database_names(config) if name not in names)
    return names


def _postgres_database_names(config_path, database):
    return _postgres_database_names_from_config(yaml.safe_load(config_path.read_text()), database)

def _refresh_command(inst, root, config_path, module_root):
    if module_root is None:
        command = [inst.config['binary']]
        if config_path.exists():
            command.extend(('--config', config_path.name))
        return command + ['update', '--src-dir', source_directory(root)]
    src_dir = source_directory(root)
    target = 'lockrefresh-' + root.name
    makefile = Path(module_root) / 'Makefile'
    if not makefile.is_file() or not re.search(r'^' + re.escape(target) + r'\s*:', makefile.read_text(), re.MULTILINE):
        if makefile.is_file() and re.search(r'^lockrefresh\s*:', makefile.read_text(), re.MULTILINE):
            target = 'lockrefresh'
        elif root.name == 'test' and root.parent == Path(module_root):
            return [inst.config['binary'], '--config', config_path.name, 'update', '--src-dir', str(src_dir)]
        else:
            target = 'lockrefresh'
    command = ['make', target, 'WIPPY_UPDATE_ARGS=--src-dir ' + str(src_dir)]
    if inst.config.get('source'):
        command.append('KICKSIDE_ROOT=' + str(Path(inst.config['source']).resolve()))
    return command


def _command(inst, label, command, cwd, environment, timeout, *, require_tests=False):
    try:
        completed = subprocess.run(command, cwd=cwd, env=environment, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired as error:
        inst.evidence.save('focused-' + label, {
            'command': command, 'timeout': timeout,
            'output': error.stdout or '', 'error': error.stderr or '',
        })
        raise
    payload = {'command': command, 'code': completed.returncode,
               'output': completed.stdout, 'error': completed.stderr}
    inst.evidence.save('focused-' + label, payload)
    require(completed.returncode == 0,
            'Focused harness fails: ' + inst.redactor.text(completed.stdout + completed.stderr))
    if require_tests:
        output = completed.stdout + completed.stderr
        require('PASSED' in output and re.search(r'\b[1-9][0-9]* tests?\b', output) is not None
                and 'No tests match filter' not in output and 'No tests found' not in output,
                'Focused harness does not run ' + label + ': ' + inst.redactor.text(output))
    return completed
