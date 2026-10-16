"""The CLA signature-store setup runs the pinned action without GitHub writes."""
import json
from pathlib import Path
import shutil
import subprocess
import sys

from harness import Scenario, require


EMPTY_STORE = '{\n   "signedContributors": []\n}\n'


def launch_cla_signature_store(ctx):
    root = ctx.inst.root / 'temp' / 'cla-action-dry-run'
    store = root / 'signatures/kickside-cla-v1.json'
    root.mkdir(parents=True, exist_ok=True)
    store.parent.mkdir(parents=True, exist_ok=True)
    store.write_text(EMPTY_STORE)
    harness = Path(__file__).with_name('cla_action_dry_run.py')
    try:
        completed = subprocess.run(
            [sys.executable, str(harness), '--store', str(store), '--run-root', str(root / 'run')],
            text=True, capture_output=True, timeout=120, check=False,
        )
        require(completed.returncode == 0,
                'Pinned CLA action dry run fails: ' + completed.stdout + completed.stderr)
        result = json.loads(completed.stdout)
        require(result == {
            'missing_store_created_signature': False,
            'missing_store_exit': 1,
            'persisted_contributor_id': 424242,
            'signed_exit': 0,
            'source': 'contributor-assistant/github-action@ca4a40a7d1004f18d9960b404b97e5f30a505a08',
            'subsequent_exit': 0,
            'unsigned_exit': 1,
        }, 'Pinned CLA action dry run has unexpected result: ' + completed.stdout)
        require(store.read_text() == EMPTY_STORE,
                'Pinned CLA action dry run changes its synthetic signature-store fixture')
        ctx.inst.evidence.save('cla-action-dry-run', result)
    finally:
        if root.exists():
            shutil.rmtree(root)


REGISTRY = [Scenario('launch_cla_signature_store', 'regression', launch_cla_signature_store,
                     issues=('LAUNCH-CLA-SIGNATURE-STORE',))]
