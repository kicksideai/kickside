# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Release dependency locks name published artifacts, including sibling modules."""
from pathlib import Path
import subprocess
import sys

import yaml

from harness import Scenario, require


def release_app_lock_hub_pins(ctx):
    root = Path(__file__).resolve().parents[2]
    scratch = ctx.inst.root / 'temp' / 'release-app-lock'
    scratch.mkdir(parents=True)
    lock = scratch / 'wippy.lock'
    sys.path.insert(0, str(root / '.github/scripts'))
    from delivery import app_update_command

    completed = subprocess.run(
        [*app_update_command(), '--lock-file', str(lock),
         '--modules-dir', str(scratch / 'vendor')],
        cwd=root / 'app', capture_output=True, text=True, timeout=120,
    )
    require(completed.returncode == 0,
            'Release app dependency resolution fails: ' + completed.stdout + completed.stderr)
    modules = yaml.safe_load(lock.read_text())['modules']
    require(modules, 'Release app lock has no dependencies')
    unpinned = [row['name'] for row in modules if not row.get('hash')]
    ctx.inst.evidence.save('release-app-lock-pins', {'modules': len(modules),
                                                   'without_hub_hash': unpinned})
    require(not unpinned, 'Release app lock selects local sources without Hub artifact hashes: '
            + ', '.join(unpinned))


REGISTRY = [Scenario('release_app_lock_hub_pins', 'regression', release_app_lock_hub_pins,
                     issues=('RELEASE-APP-LOCK-HUB-PINS',))]
