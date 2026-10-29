#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Require co-released module artifacts before application publication."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
from release_artifacts import companion_modules, installed_artifacts


def check(repository, paths, wippy):
    modules = companion_modules(repository, paths)
    if not modules:
        print('No companion modules in this release')
        return
    try:
        with installed_artifacts(modules, wippy):
            pass
        print('Verified ' + str(len(modules)) + ' companion module artifacts')
    except subprocess.CalledProcessError as error:
        print(error.stdout or '', file=sys.stderr)
        print(error.stderr or '', file=sys.stderr)
        raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, required=True)
    parser.add_argument('--wippy', default='wippy')
    args = parser.parse_args()
    check(args.repository.resolve(), json.loads(os.environ['RELEASE_PATHS_JSON']), args.wippy)
