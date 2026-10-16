from pathlib import Path
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[1]


class KeeperHostGroupsTests(unittest.TestCase):
    def test_app_binds_keeper_to_the_users_owned_directory_function(self):
        entries = yaml.safe_load((ROOT / 'app/src/app/deps/_index.yaml').read_text())['entries']
        keeper = next(e for e in entries if e.get('component') == 'keeper/keeper')
        parameters = {p['name']: p['value'] for p in keeper['parameters']}
        self.assertEqual(parameters['keeper:mcp_group_resolver'], 'kickside.users.directory:directory_groups')
        directory = yaml.safe_load((ROOT / 'platform/users/src/directory/_index.yaml').read_text())['entries']
        function = next(e for e in directory if e['name'] == 'directory_groups')
        self.assertEqual(function['security']['actor']['id'], parameters['keeper:mcp_group_resolver'])
        self.assertEqual(function['security']['policies'], ['kickside.users.directory:subject_lookup_access'])
        lookup_access = next(e for e in directory if e['name'] == 'subject_lookup_access')
        self.assertEqual(lookup_access['policy'], {
            'resources': 'kickside.users.binding:subject_lookup', 'actions': 'funcs.call', 'effect': 'allow'})
        binding = next(e for e in directory if e['kind'] == 'contract.binding')
        self.assertEqual(binding['contracts'][0]['methods']['groups'], parameters['keeper:mcp_group_resolver'])
