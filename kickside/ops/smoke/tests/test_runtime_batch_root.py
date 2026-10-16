import unittest
from unittest.mock import Mock, patch

from scenarios_runtime_batch_root import install_bindings


class BatchBindingFixtureTests(unittest.TestCase):
    def test_qualified_override_preserves_other_bare_name_targets(self):
        dependency = {'id': 'app.dependencies:account', 'component': 'example/accounts',
                      'parameters': [{'name': 'access', 'value': 'old'}],
                      'entries': [{'id': 'example.accounts:definition', 'kind': 'ns.definition',
                                   'module': 'example/accounts'},
                                  {'id': 'example.accounts:access', 'kind': 'ns.requirement'},
                                  {'id': 'example.accounts.team:access', 'kind': 'ns.requirement'}]}
        inst = Mock()
        inst.request.return_value = {'install_payload': {}}
        with patch('scenarios_runtime_batch_root.assert_bindings'):
            install_bindings(inst, dependency, {'example.accounts:access': 'new'}, 'baseline')
        parameters = inst.request.call_args_list[0].args[2]['parameters']
        self.assertEqual({row['name']: row['value'] for row in parameters},
                         {'example.accounts:access': 'new', 'example.accounts.team:access': 'old'})
