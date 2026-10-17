"""Repository CI gates and publication of one Release Please package."""
import argparse
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

import yaml

from release_content import unchanged_content

ROOT = Path(__file__).resolve().parents[2]

def run(args, cwd=ROOT, capture=False):
    print('+ ' + ' '.join(map(str, args)), flush=True)
    if not capture:
        subprocess.run(args, cwd=cwd, check=True)
        return ''
    process = subprocess.Popen(args, cwd=cwd, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, text=True)
    lines = []
    for line in process.stdout:
        print(line, end='', flush=True)
        lines.append(line)
    status = process.wait()
    if status:
        raise subprocess.CalledProcessError(status, args)
    return ''.join(lines)

def plan():
    data = json.loads((ROOT / '.github/modules.json').read_text())
    if data['repository'] == 'module':
        import yaml
        manifest = yaml.safe_load((ROOT / 'wippy.yaml').read_text())
        for key in ('organization', 'module', 'embed'):
            data['modules']['.'][key] = manifest[key]
    return data

def released_modules(modules, paths):
    if len(paths) != len(set(paths)) or any(path not in modules for path in paths):
        raise ValueError('invalid released module paths')
    return [modules[path] for path in paths]

def validate_identity(module):
    if module.get('organization') == 'acme' and module.get('module') == 'starter':
        raise ValueError('initialize the template before publishing its placeholder identity')

def publish_command(module, version, dry_run):
    if not re.fullmatch(r'\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?', version):
        raise ValueError('an explicit release version is required')
    if not dry_run and not os.environ.get('WIPPY_TOKEN'):
        raise ValueError('WIPPY_TOKEN is required for publication')
    if not dry_run:
        validate_identity(module)
    args = ['wippy', 'publish', '--config', module['path'], '--version', version,
            '--create', '--module-visibility', module['visibility'],
            '--module-type', module['type']]
    for entry in module['embed']:
        args += ['--embed', entry]
    if dry_run:
        args += ['--dry-run']
    return args

@contextmanager
def release_install_environment():
    path = ROOT / 'app/.wippy.yaml'
    original = path.read_bytes()
    config = yaml.safe_load(original)
    config.get('workspace', {}).pop('replacements', None)
    try:
        path.write_text(yaml.safe_dump(config, sort_keys=False))
        yield
    finally:
        path.write_bytes(original)

def lock_digest(root):
    return hashlib.sha256((root / 'app/wippy.lock').read_bytes()).hexdigest()

def write_app_lock_receipt(root, version):
    receipt = {'version': version, 'sha256': lock_digest(root)}
    (root / '.github/app-release-lock.json').write_text(json.dumps(receipt, indent=2) + '\n')

def check_app_lock_receipt(root, version):
    receipt = json.loads((root / '.github/app-release-lock.json').read_text())
    if receipt['version'] != version:
        raise ValueError('app lock receipt version differs from this release')
    if receipt['sha256'] != lock_digest(root):
        raise ValueError('app lock receipt digest differs from the committed lock')

def check_test_output(output):
    plain = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', output)
    verdicts = re.findall(r'^\s*(PASSED|FAILED)\b|^\s*\d+ tests (PASSED|FAILED)\s*$', plain, re.M)
    states = [first or second for first, second in verdicts]
    if 'No tests found' in plain or not states or 'FAILED' in states:
        raise ValueError('test runner does not report a nonempty passing suite')

def make(module, target):
    run(['make', '-C', module['path'], target])

def prepare_harness(module, harness):
    if (harness / 'prepare.sh').exists():
        run(['bash', './prepare.sh'], harness)
    manifest = yaml.safe_load((harness / 'wippy.yaml').read_text())
    source = manifest.get('directories', {}).get('src', 'src')
    run(['wippy', 'update', '--src-dir', source], harness)

def test_harness(module, harness, engine):
    prepare_harness(module, harness)
    import yaml
    config = yaml.safe_load((harness / '.wippy.yaml').read_text()) if (harness / '.wippy.yaml').exists() else {}
    args = []
    database_names = []
    databases = []
    if engine == 'postgres' and 'postgres' in module['profiles']:
        args += ['--profile', 'postgres']
        if module['pg_database']:
            database = 'ci_' + re.sub(r'[^a-z0-9_]', '_', module['path'].lower()) + '_' + str(os.getpid())
            profile = config.get('profiles', {}).get('postgres', {})
            variables = dict(config.get('vars', {}), **profile.get('vars', {}))
            for name, suffixes in sorted(module['pg_database'].items()):
                if name != 'pg_database' and name not in variables:
                    raise ValueError('Postgres database variable is undeclared: ' + name)
                value = database if name == 'pg_database' else database + '_' + hashlib.sha256(name.encode()).hexdigest()[:8]
                args += ['--set', 'vars.' + name + '=' + value]
                for suffix in suffixes:
                    owned = value + suffix
                    if not re.fullmatch(r'[a-z][a-z0-9_]{0,62}', owned):
                        raise ValueError('Postgres test database name is invalid: ' + owned)
                    if owned not in database_names:
                        database_names.append(owned)
            args += ['--set', 'vars.pg_host=127.0.0.1', '--set', 'vars.pg_port=5433']
    sqlite_path = None
    if engine == 'sqlite' and 'sqlite_path' in config.get('vars', {}):
        sqlite_path = harness / '.wippy' / ('ci-' + str(os.getpid()) + '.sqlite')
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        args += ['--set', 'vars.sqlite_path=' + str(sqlite_path)]
    try:
        for database in database_names:
            run(['createdb', database])
            databases.append(database)
        run(['wippy', 'lint', *args], harness)
        if module.get('test_runner') == 'crm':
            output = run(['bash', './run.sh', *args], harness, capture=True)
        else:
            output = run(['wippy', 'test', *args], harness, capture=True)
        check_test_output(output)
    finally:
        for database in reversed(databases):
            run(['dropdb', '--force', database])
        if sqlite_path:
            for path in (sqlite_path, Path(str(sqlite_path) + '-wal'), Path(str(sqlite_path) + '-shm')):
                path.unlink(missing_ok=True)

def build(module):
    if 'build-component' in module['targets']:
        directory = ROOT / module['path']
        if (directory / 'component/Cargo.toml').exists():
            run(['cargo', 'build', '--locked', '--release', '--target', 'wasm32-wasip2'], directory / 'component')
        make(module, 'build-component')
        artifact = directory / 'src' / module['path'] / 'assets' / (module['path'] + '.wasm')
        first = hashlib.sha256(artifact.read_bytes()).hexdigest()
        make(module, 'clean')
        make(module, 'build-component')
        if hashlib.sha256(artifact.read_bytes()).hexdigest() != first:
            raise ValueError('WASM build is not reproducible')
        run(['git', 'diff', '--exit-code', '--', module['path'] + '/component/Cargo.lock'])
    elif 'build' in module['targets']:
        make(module, 'build')

def verify_module(module, engine):
    directory = ROOT / module['path']
    if plan()['repository'] == 'module':
        make(module, 'setup')
        make(module, 'check')
        make(module, 'check-handbook')
        make(module, 'lint')
        make(module, 'typecheck')
        make(module, 'build')
        make(module, 'test-pg' if engine == 'postgres' else 'test')
        run(['git', 'diff', '--exit-code', '--', 'static'])
    else:
        build(module)
        if (directory / 'lint-harness/wippy.yaml').exists():
            prepare_harness(module, directory / 'lint-harness')
        if module['harness']:
            harness = directory / module['harness']
            prepare_harness(module, harness)
        if 'lint' in module['targets']:
            make(module, 'lint')
        if module['harness']:
            test_harness(module, harness, engine)
            if module['path'] == 'app':
                for child in ('composition', 'documentation', 'health'):
                    test_harness(module, harness / child, engine)
        elif 'test' in module['targets']:
            make(module, 'test')
        if module.get('extra_tests'):
            for args in module['extra_tests']:
                run(args, directory)
    version = json.loads((ROOT / '.release-please-manifest.json').read_text())[module['path']]
    run([sys.executable, '-B', '.github/scripts/test_packaging.py',
         '--module', module['path'], '--embed'])
    run(publish_command(module, version, True))
    if module['path'] == 'app':
        with release_install_environment():
            make(module, 'preboot-check')
            if os.environ.get('RELEASE_PR') == 'true':
                check_app_lock_receipt(ROOT, version)
                run(['wippy', 'update'], directory)
                run(['git', 'diff', '--exit-code', '--', 'app/wippy.lock'])


def repository_checks():
    for args in plan()['checks']:
        run(args)
    run([sys.executable, '-B', '-m', 'unittest', 'discover', '-s', 'ops/smoke/coverage'])
    run([sys.executable, '-B', 'ops/smoke/coverage/export_map.py', '--check'])
    run([sys.executable, '-B', '.github/scripts/test_delivery.py'])
    run([sys.executable, '-B', '.github/scripts/test_release_content.py'])

def refresh_app():
    with release_install_environment():
        run(['wippy', 'update'], ROOT / 'app')
        module = plan()['modules']['app']
        make(module, 'preboot-check')
        version = json.loads((ROOT / '.release-please-manifest.json').read_text())['app']
        write_app_lock_receipt(ROOT, version)


def publish(module, version, dry_run, *, publish_unchanged=False):
    publish_args = publish_command(module, version, dry_run)
    run(['make', 'compat'])
    if not dry_run and module['path'] == 'app':
        with release_install_environment():
            check_app_lock_receipt(ROOT, version)
            run(['wippy', 'update'], ROOT / 'app')
            run(['git', 'diff', '--exit-code', '--', 'app/wippy.lock'])
            make(module, 'preboot-check')
    build(module)
    if plan()['repository'] == 'chestor':
        run(['python3', 'scripts/validate-package.py', module['path']])
    run([sys.executable, '-B', '.github/scripts/test_packaging.py',
         '--module', module['path'], '--embed'])
    if unchanged_content(module, version) and not publish_unchanged:
        return
    run(publish_command(module, version, True))
    if not dry_run:
        run(publish_args)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['repository', 'verify', 'publish', 'refresh-app'])
    parser.add_argument('--module')
    parser.add_argument('--engine', choices=['sqlite', 'postgres'])
    parser.add_argument('--version')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--publish-unchanged', action='store_true',
                        help='publish the requested version even when verified content is unchanged')
    args = parser.parse_args()
    if args.action == 'repository':
        repository_checks()
    elif args.action == 'refresh-app':
        refresh_app()
    else:
        module = released_modules(plan()['modules'], [args.module])[0]
        if args.action == 'verify':
            verify_module(module, args.engine)
        else:
            publish(module, args.version, args.dry_run, publish_unchanged=args.publish_unchanged)

if __name__ == '__main__':
    main()
