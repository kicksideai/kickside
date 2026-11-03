#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Native, exact-version artifact installs shared by release publication gates."""
from contextlib import contextmanager
import json
from pathlib import Path
import subprocess
import tempfile


@contextmanager
def prepared_artifact(repository, module, wippy):
    # Let the native CLI select and pack only this owner. Publish these exact
    # bytes; a separate `publish --dry-run` produces a different envelope.
    with tempfile.TemporaryDirectory(prefix='kickside-release-pack-') as directory:
        root = Path(directory)
        lock = root / 'wippy.lock'
        lock.write_text(json.dumps({'directories': {'src': 'empty', 'modules': '.wippy'},
                                   'modules': [{'name': module['name'], 'version': module['version']}]}))
        config = root / '.wippy.yaml'
        config.write_text(json.dumps({'version': '1.0', 'workspace': {'replacements': {
            module['name']: str(repository / module['path'])}}}))
        output = root / 'module.wapp'
        args = [wippy, 'pack', '--lock-file', str(lock), '--config', str(config),
                '--module', module['name']]
        for entry in module['embed']:
            args += ['--embed', entry]
        subprocess.run([*args, str(output)], cwd=repository, check=True)
        yield output


def companion_modules(repository, paths):
    if not isinstance(paths, list) or not paths or any(not isinstance(path, str) for path in paths):
        raise ValueError('Release Please must supply the released paths')
    catalog = json.loads((repository / '.github/modules.json').read_text())['modules']
    versions = json.loads((repository / '.release-please-manifest.json').read_text())
    modules = []
    for path in sorted(set(paths) - {'app'}):
        module = catalog[path]
        modules.append({**module, 'path': path, 'name': module['organization'] + '/' + module['module'],
                        'version': versions[path]})
    return modules


@contextmanager
def installed_artifacts(modules, wippy):
    # A lock install fetches only the named versions and verifies their digests.
    # It does not resolve checkout replacements or execute module code.
    with tempfile.TemporaryDirectory(prefix='kickside-release-artifacts-') as directory:
        root = Path(directory)
        (root / 'empty').mkdir()
        lock = root / 'wippy.lock'
        vendor = root / 'modules/vendor'
        lock.write_text(json.dumps({'directories': {'src': str(root / 'empty'), 'modules': str(root / 'modules')},
                                    'modules': [{'name': item['name'], 'version': item['version']} for item in modules]}))
        config = root / '.wippy.yaml'
        config.write_text(json.dumps({'version': '1.0', 'registry': {
            'dependency_lock_path': str(lock), 'dependency_vendor_dir': str(vendor)},
            'workspace': {'include_host_dependencies': False}}))
        subprocess.run([wippy, '--config', str(config), 'install'], cwd=root, check=True,
                       capture_output=True, text=True)
        yield vendor
