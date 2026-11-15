#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Resolve the single commit tagged by a Release Please release cohort."""
import argparse
import json
import os
from pathlib import Path
import subprocess


def released_commit(repository, outputs):
    paths = json.loads(outputs['paths_released'])
    if not isinstance(paths, list) or not paths or any(not isinstance(path, str) for path in paths):
        raise ValueError('Release Please must supply the released paths')
    commits = set()
    for path in paths:
        tag = outputs[path + '--tag_name']
        commit = subprocess.check_output(
            ['git', 'rev-parse', '--verify', 'refs/tags/' + tag + '^{commit}'],
            cwd=repository, text=True).strip()
        commits.add(commit)
    if len(commits) != 1:
        raise ValueError('Released tags must point to one commit')
    return commits.pop()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, required=True)
    args = parser.parse_args()
    commit = released_commit(args.repository, json.loads(os.environ['RELEASE_OUTPUTS_JSON']))
    with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
        output.write('released_commit=' + commit + '\n')
