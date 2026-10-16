import json
import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.inventory import ROOT, discover, local_entries
from ops.compat.migrations import rehearse


class DelegationUpgradeTests(unittest.TestCase):
    def test_existing_credentials_and_users_survive_delegation_migrations(self):
        steps = {'kickside.mcp.migrations:04_authority_snapshot',
                 'kickside.users.migrations:12_delegation_epochs'}
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            current = {}
            for index, module in enumerate(discover([ROOT]).values()):
                current.update(local_entries(module, work / str(index)))
            self.assertTrue(steps <= current.keys())
            baseline = {identity: row for identity, row in current.items() if identity not in steps}
            result = rehearse(baseline, current, work / 'migration', recipes)
            self.assertEqual(set(result['plan']['added']), steps)
            self.assertEqual(result['engines']['sqlite']['status'], 'pass')
            self.assertEqual(result['engines']['postgres']['status'], 'pass')
            print(json.dumps({'added': result['plan']['added'], 'engines': result['engines']}, sort_keys=True), flush=True)
