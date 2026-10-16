import unittest
from unittest.mock import Mock, patch

from runtime import Instance

MOVED = {'success': False, 'error': 'registry moved since the plan was computed (plan 24, current 25)'}
PLAN = {'requirements': [], 'install_payload': {'component': 'kickside/discord', 'version': '1.0.0'}}


class InstallPlanRetryTests(unittest.TestCase):
    def instance(self, responses):
        inst = object.__new__(Instance)
        inst.request = Mock(side_effect=responses)
        inst.await_keeper = Mock()
        return inst

    def test_plan_is_requested_again_when_a_permission_projection_commit_moves_the_registry(self):
        inst = self.instance([{'dependencies': []}, MOVED, PLAN, {'execution': []}])
        inst.redactor = Mock(value=lambda v: v)
        with patch('runtime.time.sleep'):
            inst.install('kickside/discord')
        plans = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/plan')]
        self.assertEqual(len(plans), 2)
        installs = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/install')]
        self.assertEqual(installs[0].args[2]['component'], 'kickside/discord')

    def test_any_other_plan_conflict_fails_the_install(self):
        other = {'success': False, 'error': 'component version conflict'}
        inst = self.instance([{'dependencies': []}, other])
        inst.redactor = Mock(value=lambda v: v)
        with self.assertRaises(Exception):
            inst.install('kickside/discord')
        self.assertEqual(inst.request.call_count, 2)


if __name__ == '__main__':
    unittest.main()
