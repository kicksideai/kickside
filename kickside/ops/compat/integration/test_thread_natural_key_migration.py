"""The additive identity migration preserves published threads and resumes safely."""
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.fetch_baselines import Hub
from ops.compat.inventory import ROOT, discover, local_entries, source_roots
from ops.compat.migrations import checkpoint_entries, rehearse


class ThreadNaturalKeyMigrationTests(unittest.TestCase):
    def test_published_threads_survive_idempotent_identity_schema_on_both_engines(self):
        with tempfile.TemporaryDirectory(prefix='natural-key-', dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            baseline = Hub().fetch('kickside/core', work)
            (Path(os.environ['TMPDIR']) / 'natural-key-published-baseline.json').write_text(
                json.dumps({'version': baseline['version'], 'sha256': baseline['sha256']}))
            published = baseline['entries']
            current = local_entries(discover(source_roots())['kickside/core'], work / 'pack')
            identity = 'kickside.core.migrations:10_thread_natural_keys'
            old, _ = checkpoint_entries(dict(published, **{identity: current[identity]}), identity)
            self.assertNotIn(identity, old)
            new = dict(old, **{identity: current[identity]})
            recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
            recipe = recipes[identity]
            repeat = copy.deepcopy(current[identity])
            repeat['Meta']['timestamp'] = '2026-10-08T00:00:01Z'
            new['compat:repeat_natural_key_schema'] = repeat
            recipes['compat:repeat_natural_key_schema'] = copy.deepcopy(recipe)
            # Both steps share the representative published row without duplicating it.
            recipes['compat:repeat_natural_key_schema']['seed'] = [
                "UPDATE kickside_thread SET thread_class=thread_class WHERE thread_class='published:natural'"]
            result = rehearse(old, new, work / 'runtime', recipes)
            self.assertEqual(set(result['engines']), {'sqlite', 'postgres'})
            self.assertTrue(all(row['status'] == 'pass' for row in result['engines'].values()), result)
