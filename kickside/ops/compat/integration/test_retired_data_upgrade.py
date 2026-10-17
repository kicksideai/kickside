"""Published schemas retain threads, job history and credential audit evidence."""
import json
import os
from pathlib import Path
import shutil
import unittest

from ops.compat.integration.test_run_as_upgrade import evidence_directory
from ops.compat.fetch_baselines import Hub
from ops.compat.inventory import ROOT, discover, local_entries
from ops.compat.migrations import closure, rehearse, select_fixtures, upgrade_checkpoint


class RetiredDataUpgradeTests(unittest.TestCase):
    def test_published_data_survives_added_migrations_on_both_engines(self):
        modules = discover([ROOT])
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        with evidence_directory(Path(os.environ['TMPDIR'])) as directory:
            work = Path(directory)
            published, current, baselines = {}, {}, {}
            hub = Hub()
            for number, identity in enumerate(('kickside/component', 'kickside/core',
                                               'kickside/jobs', 'kickside/mcp')):
                item = work / str(number)
                item.mkdir()
                baseline = hub.fetch(identity, item)
                baselines[identity] = {key: baseline[key] for key in ('version', 'sha256')}
                published.update(baseline['entries'])
                current.update(local_entries(modules[identity], item / 'current'))
            for number, (identity, module) in enumerate(modules.items()):
                if identity not in baselines:
                    current.update(local_entries(module, work / ('helper-' + str(number))))
            steps = ['kickside.core.migrations:11_bind_legacy_natural_keys',
                     'kickside.core.jobs.migrations:21_retire_upload_intent_slot',
                     'kickside.mcp.migrations:05_retired_policy_credentials']
            configuration = list(select_fixtures(steps, recipes)['registry'])
            published, checkpoint = upgrade_checkpoint(published, current, steps)
            current = dict(checkpoint, **closure(current, configuration))
            try:
                result = rehearse(published, current, work / 'migration', recipes)
            finally:
                for log in (work / 'migration').glob('*.log'):
                    shutil.copy2(log, work / log.name)
            self.assertEqual(set(result['plan']['added']), {
                'kickside.core.migrations:11_bind_legacy_natural_keys',
                'kickside.core.jobs.migrations:21_retire_upload_intent_slot',
                'kickside.mcp.migrations:05_retired_policy_credentials',
            })
            self.assertEqual(set(result['engines']), {'sqlite', 'postgres'})
            self.assertTrue(all(row['status'] == 'pass' for row in result['engines'].values()), result)
            print(json.dumps({'baselines': baselines, 'result': result}, sort_keys=True), flush=True)
