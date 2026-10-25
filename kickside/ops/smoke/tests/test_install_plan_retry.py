import unittest
from unittest.mock import Mock, patch

from runtime import Instance

MOVED = {
    'success': False,
    'code': 'Conflict',
    'error': 'registry moved since the plan was computed',
    'details': {'plan_version': 24, 'current_version': 25},
}
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

    def test_install_conflict_replans_with_the_fresh_optimistic_lock_and_unique_receipts(self):
        stale = {'requirements': [], 'install_payload': {
            'component': 'kickside/discord', 'registry_version': 24}}
        fresh = {'requirements': [], 'install_payload': {
            'component': 'kickside/discord', 'registry_version': 25}}
        inst = self.instance([{'dependencies': []}, stale, MOVED, fresh, {'execution': []}])
        inst.redactor = Mock(value=lambda v: v)

        inst.install('kickside/discord')

        plans = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/plan')]
        installs = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/install')]
        self.assertEqual(len(plans), 2)
        self.assertEqual(len(installs), 2)
        self.assertEqual([call.kwargs['label'] for call in plans], ['kickside-discord-plan-1', 'kickside-discord-plan-2'])
        self.assertEqual([call.kwargs['label'] for call in installs], ['kickside-discord-install-1', 'kickside-discord-install-2'])
        self.assertEqual(installs[0].args[2]['registry_version'], 24)
        self.assertEqual(installs[1].args[2]['registry_version'], 25)

    def test_install_does_not_retry_an_unrelated_conflict(self):
        other = {'code': 'Conflict', 'error': 'component version conflict',
                 'details': {'plan_version': 24, 'current_version': 25}, 'execution': []}
        inst = self.instance([{'dependencies': []}, PLAN, other])
        inst.redactor = Mock(value=lambda v: v)

        with self.assertRaisesRegex(Exception, 'installation refused'):
            inst.install('kickside/discord')
        self.assertEqual(inst.request.call_count, 3)

    def test_replanned_payload_is_revalidated_before_a_second_install(self):
        invalid = {'requirements': [{'parameter_name': 'target_db', 'missing': True}], 'install_payload': {}}
        inst = self.instance([{'dependencies': []}, PLAN, MOVED, invalid])
        inst.redactor = Mock(value=lambda v: v)

        with self.assertRaisesRegex(Exception, 'unresolved requirements: target_db'):
            inst.install('kickside/discord')
        installs = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/install')]
        self.assertEqual(len(installs), 1)

    def test_persistently_moving_registry_stops_after_the_bounded_attempts(self):
        inst = self.instance([{'dependencies': []}, PLAN, MOVED, PLAN, MOVED, PLAN, MOVED])
        inst.redactor = Mock(value=lambda v: v)

        with self.assertRaisesRegex(Exception, 'registry continued moving after 3 install attempts'):
            inst.install('kickside/discord')
        plans = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/plan')]
        installs = [call for call in inst.request.call_args_list if call.args[1].endswith('/dependencies/install')]
        self.assertEqual(len(plans), 3)
        self.assertEqual(len(installs), 3)

    def test_plan_does_not_retry_an_unstructured_stale_conflict(self):
        unstructured = {'success': False, 'code': 'Conflict',
                        'error': 'registry moved since the plan was computed'}
        inst = self.instance([{'dependencies': []}, unstructured])
        inst.redactor = Mock(value=lambda v: v)

        with self.assertRaisesRegex(Exception, 'plan refused'):
            inst.install('kickside/discord')
        self.assertEqual(inst.request.call_count, 2)

    def test_any_other_plan_conflict_fails_the_install(self):
        other = {'success': False, 'error': 'component version conflict'}
        inst = self.instance([{'dependencies': []}, other])
        inst.redactor = Mock(value=lambda v: v)
        with self.assertRaises(Exception):
            inst.install('kickside/discord')
        self.assertEqual(inst.request.call_count, 2)


if __name__ == '__main__':
    unittest.main()
