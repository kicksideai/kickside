#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Build and publish companion modules from the exact Release Please tags."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

from release_artifacts import companion_modules, installed_artifacts


def git(repository, *args):
    return subprocess.check_output(['git', *args], cwd=repository, text=True).strip()


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def publish(repository, paths, wippy):
    modules = companion_modules(repository, paths)
    packages = json.loads((repository / 'release-please-config.json').read_text())['packages']
    head = git(repository, 'rev-parse', 'HEAD')
    if modules and git(repository, 'status', '--porcelain', '--untracked-files=all'):
        raise ValueError('Release must have a clean checkout before building')
    # Validate the entire cohort before starting a build or publication.
    for module in modules:
        tag = packages[module['path']]['component'] + '-v' + module['version']
        if git(repository, 'rev-parse', tag + '^{commit}') != head:
            raise ValueError('Publish from the exact release tag: ' + tag)
    # Source artifacts (including UI Kit) must exist before frontend builds
    # materialize their published dependencies through the maintained Make targets.
    modules.sort(key=lambda item: ('build' in item['targets'], item['path']))
    for module in modules:
        name, version = module['name'], module['version']
        print('Preparing ' + name + '@' + version, flush=True)
        if 'build' in module['targets']:
            subprocess.run(['make', '-C', str(repository / module['path']), 'build'], check=True)
        args = [wippy, 'publish', '--config', str(repository / module['path']), '--version', version,
                '--module-type', module['type']]
        for entry in module['embed']:
            args += ['--embed', entry]
        packed = subprocess.run([*args, '--dry-run'], cwd=repository, check=True, capture_output=True, text=True)
        # The pinned native CLI deletes dry-run packs; its emitted digest is the
        # comparison boundary. Do not recreate its module packing algorithm here.
        digests = re.findall(r'^\s*Digest: sha256:([a-f0-9]{64})\s*$', packed.stdout + packed.stderr, re.MULTILINE)
        if len(digests) != 1:
            raise ValueError('Native dry-run did not report one artifact digest: ' + name)
        expected = digests[0]
        filename = module['module'] + '-' + version + '.wapp'
        try:
            with installed_artifacts([module], wippy) as vendor:
                published = vendor / module['organization'] / filename
                if not published.is_file() or digest(published) != expected:
                    raise ValueError('Published artifact differs from the prepared release: ' + name + '@' + version)
                print('Already published with matching digest: ' + name + '@' + version, flush=True)
                continue
        except subprocess.CalledProcessError as error:
            missing = 'failed to download module: ' + name + '@' + version + ': module not found'
            if missing not in (error.stdout or '') + (error.stderr or ''):
                raise
        subprocess.run([*args, '--create', '--module-visibility', module['visibility']], cwd=repository, check=True)
        with installed_artifacts([module], wippy) as vendor:
            if digest(vendor / module['organization'] / filename) != expected:
                raise ValueError('Published artifact digest differs: ' + name + '@' + version)
        print('Verified ' + name + '@' + version, flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, required=True)
    parser.add_argument('--wippy', default='wippy')
    args = parser.parse_args()
    try:
        publish(args.repository.resolve(), json.loads(os.environ['RELEASE_PATHS_JSON']), args.wippy)
    except subprocess.CalledProcessError as error:
        print(error.stdout or '', file=sys.stderr)
        print(error.stderr or '', file=sys.stderr)
        raise
