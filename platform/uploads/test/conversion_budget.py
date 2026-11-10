#!/usr/bin/env python3
"""Exercise a 95 second conversion through the upload job worker."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import tempfile
import uuid

import yaml


def run(engine, root, wippy):
    harness = Path(__file__).resolve().parent
    config = yaml.safe_load((harness / '.wippy.yaml').read_text())
    database = 'uploads_budget_' + uuid.uuid4().hex[:16]
    config['vars']['sqlite_path'] = str(root / (database + '.sqlite'))
    config['vars']['pg_database'] = database
    for name in ('host', 'port', 'username', 'password'):
        variable = {'username': 'PGUSER', 'password': 'PGPASSWORD'}.get(name, 'PG' + name.upper())
        if variable in os.environ:
            config['vars']['pg_' + name] = int(os.environ[variable]) if name == 'port' else os.environ[variable]
    wasm = harness / 'delayed-converter/target/delayed_converter.wasm'
    digest = 'sha256:' + hashlib.sha256(wasm.read_bytes()).hexdigest()
    overrides = config.setdefault('override', {})
    overrides['app:uploads_conversion_budget_test:meta.type'] = 'test'
    overrides['kickside.convert.doc2md:assets:directory'] = str(wasm.parent)
    overrides['kickside.convert.doc2md:converter:imports'] = ['wasi:io', 'wasi:cli', 'wasi:random', 'wasi:clocks']
    for entry in ('converter', 'page_resources'):
        overrides['kickside.convert.doc2md:' + entry + ':path'] = wasm.name
        overrides['kickside.convert.doc2md:' + entry + ':hash'] = digest
    pg_env = dict(os.environ, PGDATABASE='postgres', PGHOST=str(config['vars']['pg_host']),
                  PGPORT=str(config['vars']['pg_port']), PGUSER=config['vars']['pg_username'],
                  PGPASSWORD=config['vars']['pg_password'])
    created = False
    with tempfile.NamedTemporaryFile(mode='w', prefix='.conversion-budget-', suffix='.yaml', dir=harness) as handle:
        path = Path(handle.name)
        path.write_text(yaml.safe_dump(config, sort_keys=False))
        command = [wippy, '--config', str(path)]
        if engine == 'postgres':
            command += ['--profile', 'postgres']
        catalog = json.loads(subprocess.check_output(command + ['registry', 'list', '--meta', 'type=test', '--json'], cwd=harness))
        for entry in catalog:
            if entry['id'] != 'app:uploads_conversion_budget_test':
                overrides[entry['id'] + ':meta.type'] = 'test_focus_excluded'
        path.write_text(yaml.safe_dump(config, sort_keys=False))
        try:
            if engine == 'postgres':
                subprocess.run(['psql', '-v', 'ON_ERROR_STOP=1', '-c', f'CREATE DATABASE "{database}"'], env=pg_env, check=True)
                created = True
            result = subprocess.run(command + ['-c', 'test'], cwd=harness, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            (root / (engine + '.log')).write_text(result.stdout)
            print(result.stdout)
            if result.returncode or 'FAILED' in result.stdout or 'PASSED' not in result.stdout:
                raise RuntimeError('conversion budget tests fail on ' + engine)
        finally:
            if created:
                subprocess.run(['psql', '-v', 'ON_ERROR_STOP=1', '-c', f'DROP DATABASE "{database}"'], env=pg_env, check=True)
            for suffix in ('', '-wal', '-shm'):
                Path(config['vars']['sqlite_path'] + suffix).unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--engine', choices=('sqlite', 'postgres', 'both'), default='both')
    parser.add_argument('--run-root', type=Path, required=True)
    args = parser.parse_args()
    root = args.run_root.resolve()
    root.mkdir(parents=True, exist_ok=True)
    for engine in ('sqlite', 'postgres') if args.engine == 'both' else (args.engine,):
        run(engine, root, os.environ.get('WIPPY', 'wippy'))


if __name__ == '__main__':
    main()
