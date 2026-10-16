import unittest
import json
from ops.compat.inventory import ROOT
from ops.compat.migrations import migration_plan

class MigrationPlanTests(unittest.TestCase):
    def entry(self, stamp, source='return {}'):
        return {'Kind': 'function.lua', 'Meta': {'type': 'migration', 'timestamp': stamp}, 'Data': {'source': source, 'method': 'migrate'}}

    def test_orders_baseline_and_updates_and_detects_changed_history(self):
        old = {'m:one': self.entry('2026-01-01'), 'm:two': self.entry('2026-01-02')}
        new = dict(old, **{'m:three': self.entry('2026-01-03')})
        plan = migration_plan(old, new)
        self.assertEqual(plan['baseline'], ['m:one', 'm:two'])
        self.assertEqual(plan['added'], ['m:three'])
        new['m:one'] = self.entry('2026-01-01', 'changed')
        self.assertEqual(migration_plan(old, new)['changed'], ['m:one'])

    def test_each_added_migration_requires_its_own_data_recipe(self):
        from ops.compat.migrations import select_fixtures
        recipes = {'m:three': {'seed': ['INSERT'], 'assertions': [{'query': 'SELECT', 'rows': [{}]}]}}
        selected = select_fixtures(['m:three'], recipes)
        self.assertEqual(selected['seed'], ['INSERT'])
        with self.assertRaises(ValueError):
            select_fixtures(['m:four'], recipes)

    def test_step_assertions_remain_bound_to_their_migration(self):
        from ops.compat.migrations import select_fixtures
        cases = [{'query': 'SELECT COUNT(*) AS n FROM new_table', 'rows': [{'n': 0}]}]
        recipes = {'m:create': {'seed': ['INSERT baseline'],
            'assertions': [{'query': 'SELECT baseline', 'rows': [{}]}], 'step_after': cases},
            'm:extend': {'seed': ['INSERT baseline2'],
            'assertions': [{'query': 'SELECT baseline2', 'rows': [{}]}],
            'seed_before': ['INSERT new_table']}}
        selected = select_fixtures(['m:create', 'm:extend'], recipes)
        self.assertEqual(selected['step_after'], {'m:create': cases, 'm:extend': []})
        self.assertEqual(selected['before']['m:extend'], ['INSERT new_table'])

    def test_retrieval_observation_migration_has_a_preservation_recipe(self):
        from ops.compat.migrations import select_fixtures
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        selected = select_fixtures(['kickside.kb10.migrations:05_retrieval_observations'], recipes)
        self.assertTrue(selected['seed'])
        self.assertTrue(selected['assertions'])
        self.assertTrue(selected['after'])

    def test_delegation_migrations_have_preservation_recipes(self):
        from ops.compat.migrations import select_fixtures
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        for identity in ('kickside.mcp.migrations:04_authority_snapshot',
                         'kickside.users.migrations:12_delegation_epochs'):
            with self.subTest(identity=identity):
                selected = select_fixtures([identity], recipes)
                self.assertTrue(selected['seed'])
                self.assertTrue(selected['assertions'])
                self.assertTrue(selected['after'])

    def test_harness_preserves_environment_storage_metadata(self):
        import os
        from pathlib import Path
        import tempfile
        import yaml
        from ops.compat.migrations import write_entries
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            write_entries(Path(directory), {'m:env': {'Kind': 'env.storage.os', 'Meta': {'type': 'envstorage'}, 'Data': {}}})
            row = yaml.safe_load((Path(directory) / 'entries-0.yaml').read_text())['entries'][0]
            self.assertEqual(row['meta']['type'], 'envstorage')

class CheckpointTests(unittest.TestCase):
    def test_checkpoint_keeps_only_migrations_before_the_pending_step(self):
        from ops.compat.migrations import checkpoint_entries
        rows = {key: MigrationPlanTests().entry(stamp) for key, stamp in [('m:one', '1'), ('m:two', '2'), ('m:three', '3')]}
        rows['m:helper'] = {'Kind': 'library.lua', 'Meta': {}, 'Data': {}}
        before, through = checkpoint_entries(rows, 'm:two')
        self.assertEqual(set(before), {'m:one', 'm:helper'})
        self.assertEqual(set(through), {'m:one', 'm:two', 'm:helper'})

    def test_command_timeout_fails_without_printing_arguments(self):
        import os
        from pathlib import Path
        import subprocess
        import tempfile
        from unittest.mock import patch
        from ops.compat.migrations import command
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch('ops.compat.migrations.subprocess.run', side_effect=subprocess.TimeoutExpired(['secret-argument'], 600)):
                with self.assertRaisesRegex(ValueError, '^migration command times out; see command.log$'):
                    command(['secret-argument'], Path(directory), Path(directory) / 'command.log', {})

class DatabaseBaselineTests(unittest.TestCase):
    def test_external_baseline_setup_is_reported_and_added_steps_stay_mandatory(self):
        from ops.compat.migrations import database_baseline
        plan = {'baseline': ['m:create', 'm:docker'], 'added': ['m:update']}
        recipes = {'m:docker': {'baseline_setup': {'reason': 'Builds an external image; does not create database schema', 'proof': 'ops/compat/tests/test_migrations.py'}}}
        ids, external = database_baseline(plan, recipes)
        self.assertEqual(ids, ['m:create'])
        self.assertEqual(external, {'m:docker': recipes['m:docker']['baseline_setup']})
        plan['added'] = ['m:docker']
        with self.assertRaisesRegex(ValueError, 'added migration'):
            database_baseline(plan, recipes)

    def test_external_setup_declaration_requires_a_repository_proof_and_reason(self):
        from ops.compat.migrations import database_baseline
        plan = {'baseline': ['m:docker'], 'added': []}
        for value in ({}, {'reason': 'external', 'proof': '../outside.py'}):
            with self.subTest(value=value), self.assertRaises(ValueError):
                database_baseline(plan, {'m:docker': {'baseline_setup': value}})

    def test_published_pending_checkpoint_requires_a_removed_step(self):
        from ops.compat.migrations import database_baseline
        plan = {'baseline': ['m:create', 'm:retired', 'm:later'], 'added': ['m:native']}
        recipes = {'m:retired': {'baseline_checkpoint': {'reason': 'Owner retires the unfinished old model', 'proof': 'ops/compat/tests/test_migrations.py'}}}
        ids, external = database_baseline(plan, recipes, current={'m:create': {}, 'm:native': {}})
        self.assertEqual(ids, ['m:create'])
        self.assertIn('m:retired', external)
        with self.assertRaisesRegex(ValueError, 'removed'):
            database_baseline(plan, recipes, current={'m:retired': {}})

    def test_checkpoint_leaves_unrelated_module_migrations_in_the_baseline(self):
        from ops.compat.migrations import database_baseline
        plan = {'baseline': ['m:create', 'm:retired', 'other:latest', 'm:later'], 'added': ['m:native']}
        recipes = {'m:retired': {'baseline_checkpoint': {'reason': 'Retire only this model', 'proof': 'ops/compat/tests/test_migrations.py'}}}
        ids, _ = database_baseline(plan, recipes, current={})
        self.assertEqual(ids, ['m:create', 'other:latest'])

    def test_pending_checkpoint_rehearses_its_own_migration_namespace(self):
        from ops.compat.migrations import checkpoint_entries
        rows = {key: MigrationPlanTests().entry(stamp) for key, stamp in
                [('m:one', '1'), ('other:bootstrap', '1'), ('m:two', '2')]}
        rows['other:helper'] = {'Kind': 'library.lua', 'Meta': {}, 'Data': {}}
        before, through = checkpoint_entries(rows, 'm:two')
        self.assertEqual(set(before), {'m:one', 'other:helper'})
        self.assertEqual(set(through), {'m:one', 'm:two', 'other:helper'})


class HarnessEnvironmentTests(unittest.TestCase):
    def test_baseline_boot_environment_belongs_to_the_harness(self):
        from ops.compat.migrations import HARNESS_ENV, harness_env
        self.assertEqual(HARNESS_ENV['KICKSIDE_USERS_ADMIN_GROUP_ID'], 'app:admins')
        self.assertEqual(HARNESS_ENV['KICKSIDE_USERS_ADMIN_INIT_ENABLED'], 'false')
        env = harness_env({}, {})
        for key, value in HARNESS_ENV.items():
            self.assertEqual(env[key], value, 'a run without added migration recipes still boots the baseline app')
        self.assertEqual(harness_env({}, {'MIGRATION_ONLY': 'x'})['MIGRATION_ONLY'], 'x')

    def test_recipes_do_not_redeclare_harness_environment(self):
        from ops.compat.migrations import HARNESS_ENV
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        for identity, recipe in recipes.items():
            self.assertFalse(set(recipe.get('env', {})) & set(HARNESS_ENV), identity)
