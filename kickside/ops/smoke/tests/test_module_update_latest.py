import unittest
from unittest.mock import Mock

from module_lifecycle_contract import MODULE, install_latest


class LatestModuleUpdateTests(unittest.TestCase):
    def test_install_requests_a_range_and_checks_the_freshest_release(self):
        inst = Mock()
        inst.request.side_effect = [
            {'items': [{'version': '0.1.16'}, {'version': '0.1.17'}]},
            {'dependencies': []},
            {'requirements': [], 'install_payload': {'component': MODULE}},
            {'execution': [{'status': 'completed'}]},
            {'dependencies': [{'component': MODULE, 'version': '*', 'entries': [{'module': MODULE, 'module_version': '0.1.17'}]}]},
        ]
        install_latest(inst)
        plan, install = inst.request.call_args_list[2:4]
        self.assertEqual(plan.args[2]['version'], '*')
        self.assertEqual(install.args[2]['version'], '*')

    def source_install(self, applied='0.1.16'):
        inst = Mock()
        inst.request.side_effect = [
            {'dependencies': []},
            {'requirements': [], 'install_payload': {'component': MODULE},
             'graph': [{'module': MODULE, 'version': '0.1.16', 'source': 'replacement-tree-v1'}]},
            {'execution': [{'status': 'completed'}]},
            {'dependencies': [{'component': MODULE, 'version': '*', 'entries': [
                {'module': MODULE, 'module_version': applied}]}]},
        ]
        return inst

    def test_source_install_uses_live_hub_plan_selection_instead_of_published_versions(self):
        inst = self.source_install()
        dep = install_latest(inst, replacement=True)
        self.assertEqual(dep['entries'][0]['module_version'], '0.1.16')
        self.assertFalse(any('/versions?' in call.args[1] for call in inst.request.call_args_list))
        plan, install = inst.request.call_args_list[1:3]
        self.assertEqual(plan.args[2]['version'], '*')
        self.assertEqual(install.args[2]['version'], '*')

    def test_source_install_rejects_applied_ownership_that_differs_from_the_hub_plan(self):
        from harness import Failure
        with self.assertRaisesRegex(Failure, 'resolves to'):
            install_latest(self.source_install(applied='0.1.17'), replacement=True)
