"""Dependency refresh follows a replacement's declared source version."""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import yaml

from harness import Scenario, require


def replacement_declared_version(ctx):
    inst = ctx.inst
    with TemporaryDirectory(prefix='replacement-version-', dir=inst.root) as directory:
        root = Path(directory)
        source = root / 'module'
        host = root / 'host'
        source.mkdir()
        host.mkdir()
        (root / 'temp').mkdir()
        (source / '_index.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'namespace': 'example.module',
            'entries': [{'name': 'definition', 'kind': 'ns.definition'}],
        }))
        (host / '_index.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'namespace': 'app', 'entries': [{
                'name': 'module', 'kind': 'ns.dependency',
                'component': 'example/module', 'version': '*',
            }],
        }))
        (host / '.wippy.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'workspace': {'replacements': {'example/module': str(source)}},
        }))
        env = dict(inst.env, TMPDIR=str(root / 'temp'))
        for version in ('1.0.0', '2.0.0'):
            (source / 'wippy.yaml').write_text(yaml.safe_dump({
                'organization': 'example', 'module': 'module', 'version': version,
            }))
            command = [inst.config['binary'], 'update', '--src-dir', '.']
            result = subprocess.run(command, cwd=host, env=env, capture_output=True,
                                    text=True, timeout=120)
            lock_path = host / 'wippy.lock'
            lock = yaml.safe_load(lock_path.read_text()) if lock_path.exists() else {}
            inst.evidence.save('replacement-version-' + version, {
                'exit_code': result.returncode, 'stdout': result.stdout,
                'stderr': result.stderr, 'lock': lock,
            })
            require(result.returncode == 0, 'Replacement refresh fails: ' + result.stdout + result.stderr)
            modules = [row for row in lock.get('modules', []) if row['name'] == 'example/module']
            require(len(modules) == 1 and modules[0]['version'] == version,
                    'Replacement refresh does not select its declared source version')


REGISTRY = [Scenario('regression_replacement_declared_version', 'regression',
                     replacement_declared_version,
                     issues=('RUNTIME-REPLACEMENT-DECLARED-VERSION',))]
