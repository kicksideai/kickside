#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Require co-released module artifacts before application publication."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile


def check(repository, paths, wippy):
    catalog = json.loads((repository / '.github/modules.json').read_text())['modules']
    versions = json.loads((repository / '.release-please-manifest.json').read_text())
    if not isinstance(paths, list) or not paths or any(not isinstance(path, str) for path in paths):
        raise ValueError('Release Please must supply the released paths')
    modules = []
    for path in sorted(set(paths) - {'app'}):
        module = catalog[path]
        modules.append({'name': module['organization'] + '/' + module['module'], 'version': versions[path]})
    if not modules:
        print('No companion modules in this release')
        return
    # A fresh native install verifies exact versions and artifact digests without
    # resolving against checkout replacements or executing module code.
    with tempfile.TemporaryDirectory(prefix='kickside-release-dependencies-') as directory:
        root = Path(directory)
        (root / 'empty').mkdir()
        lock = root / 'wippy.lock'
        lock.write_text(json.dumps({'directories': {'src': str(root / 'empty'), 'modules': str(root / 'modules')},
                                    'modules': modules}))
        config = root / '.wippy.yaml'
        config.write_text(json.dumps({'version': '1.0', 'registry': {
            'dependency_lock_path': str(lock), 'dependency_vendor_dir': str(root / 'modules/vendor')},
            'workspace': {'include_host_dependencies': False}}))
        subprocess.run([wippy, '--config', str(config), 'install'], cwd=root, check=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, required=True)
    parser.add_argument('--wippy', default='wippy')
    args = parser.parse_args()
    check(args.repository.resolve(), json.loads(os.environ['RELEASE_PATHS_JSON']), args.wippy)
