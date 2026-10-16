import unittest
from ops.compat.migrations import closure, select_fixtures

class RuntimeConfigTests(unittest.TestCase):
    def test_migration_keeps_declared_config_dependency(self):
        rows = {'m:run': {'Kind': 'function.lua', 'Meta': {'depends_on': ['ns:wippy.migration', 'm:config']}, 'Data': {}},
                'm:config': {'Kind': 'registry.entry', 'Meta': {}, 'Data': {'db_id': ''}}}
        self.assertIn('m:config', closure(rows, ['m:run']))

    def test_recipe_carries_resolved_host_configuration(self):
        recipe = {'seed': ['INSERT'], 'assertions': [{'query': 'SELECT', 'rows': []}],
                  'registry': {'m:config': {'Meta': {'db_id': 'app:db'}}}}
        self.assertEqual(select_fixtures(['m:run'], {'m:run': recipe})['registry'], recipe['registry'])
