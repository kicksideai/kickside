import json
import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.inventory import ROOT, discover, local_entries
from ops.compat.fetch_baselines import Hub
from ops.compat.migrations import rehearse, upgrade_checkpoint


class DelegationUpgradeTests(unittest.TestCase):
    def test_existing_credentials_and_users_survive_delegation_migrations(self):
        steps = {'kickside.mcp.migrations:04_authority_snapshot',
                 'kickside.users.migrations:12_delegation_epochs'}
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            current, published = {}, {}
            hub = Hub()
            for index, (identity, module) in enumerate(discover([ROOT]).items()):
                module_work = work / str(index)
                module_work.mkdir()
                current.update(local_entries(module, module_work / 'current'))
                published.update(hub.fetch(identity, module_work)['entries'])
            self.assertTrue(steps <= current.keys())
            baseline, current = upgrade_checkpoint(published, current, steps)
            result = rehearse(baseline, current, work / 'migration', recipes)
            self.assertEqual(set(result['plan']['added']), steps)
            self.assertEqual(result['engines']['sqlite']['status'], 'pass')
            self.assertEqual(result['engines']['postgres']['status'], 'pass')
            print(json.dumps({'added': result['plan']['added'], 'engines': result['engines']}, sort_keys=True), flush=True)
