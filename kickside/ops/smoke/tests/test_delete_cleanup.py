import unittest
from unittest.mock import Mock, patch

from cleanup_evidence import await_automation_deletion, delete_component, delete_visible_component
from harness import Failure
from types import SimpleNamespace


class DeleteCleanupTests(unittest.TestCase):
    def test_browser_is_released_before_its_visible_component_is_deleted(self):
        calls = []
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.browser.clean.side_effect = lambda start: calls.append('clean')
        with patch('cleanup_evidence.Browser.release', side_effect=lambda context: calls.append('release')), \
                patch('cleanup_evidence.delete_component', side_effect=lambda *args, **kwargs: calls.append('delete')):
            delete_visible_component(ctx, 'owned', '/api/v1/threads/owned')
        self.assertEqual(calls, ['clean', 'release', 'delete'])

    def test_browser_errors_propagate_and_resource_cleanup_still_runs(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.browser.clean.side_effect = Failure('unexpected browser error')
        with patch('cleanup_evidence.Browser.release') as release, patch('cleanup_evidence.delete_component') as delete:
            with self.assertRaisesRegex(Failure, 'unexpected browser error'):
                delete_visible_component(ctx, 'owned', '/api/v1/threads/owned')
        release.assert_called_once_with(ctx)
        delete.assert_called_once_with(ctx.inst, 'owned', '/api/v1/threads/owned', knowledge=False)

    def test_an_accepted_delete_waits_for_durable_completion_without_deleting_again(self):
        inst = Mock()
        pending = {'kickside_components': 0, 'kickside_thread': 1}
        completed = {'kickside_components': 0, 'kickside_thread': 0}
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        with patch('cleanup_evidence.cleanup_rows', side_effect=[pending, completed]):
            delete_component(inst, 'journal', '/api/v1/threads/journal')
        inst.request.assert_not_called()
        inst.evidence.save.assert_called_once_with('cleanup-completed-journal', completed)

    def test_cleanup_deletes_a_live_component_and_asserts_completion(self):
        inst = Mock()
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        with patch('cleanup_evidence.cleanup_rows', side_effect=[
                {'kickside_components': 1, 'kickside_thread': 1},
                {'kickside_components': 0, 'kickside_thread': 0}]):
            delete_component(inst, 'journal', '/api/v1/threads/journal')
        inst.request.assert_called_once_with('DELETE', '/api/v1/threads/journal', expect=(200, 202))

    def test_pending_automation_deletion_waits_for_listing_completion(self):
        inst = Mock()
        receipt = {'success': True, 'id': 'automation', 'status': 'in_progress', 'in_progress': True,
                   'deleted': False, 'cleanup_pending': True, 'retryable': True,
                   'details': {'cleanup_pending': True, 'wait_for': 'lease_release'}}
        inst.request.side_effect = [
            {'automations': [{'id': 'automation'}]},
            {'automations': []},
        ]

        def wait(predicate, *args, **kwargs):
            self.assertIsNone(predicate())
            return predicate()

        inst.wait.side_effect = wait
        await_automation_deletion(inst, 'automation', receipt)
        self.assertEqual(inst.request.call_args_list, [
            unittest.mock.call('GET', '/api/v1/automations'),
            unittest.mock.call('GET', '/api/v1/automations'),
        ])

    def test_bounded_automation_deletion_accepts_continuation_progress(self):
        inst = Mock()
        receipt = {'success': True, 'id': 'automation', 'status': 'in_progress', 'in_progress': True,
                   'deleted': False, 'cleanup_pending': True, 'retryable': True,
                   'details': {'cleanup_pending': True, 'needs_continue': True}}
        inst.request.return_value = {'automations': []}
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        await_automation_deletion(inst, 'automation', receipt)

    def test_terminal_installable_uninstall_receipt_waits_for_listing_absence(self):
        inst = Mock()
        receipt = {'success': True, 'id': 'automation', 'replayed': 3, 'replay_failed': 0}
        inst.request.return_value = {'automations': []}
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        await_automation_deletion(inst, 'automation', receipt)

    def test_terminal_automation_deletion_failure_propagates(self):
        inst = Mock()
        receipt = {'success': False, 'id': 'automation', 'status': 'failed', 'deleted': False,
                   'error': {'message': 'lease release fails'}}
        with self.assertRaisesRegex(Failure, 'Automation deletion fails'):
            await_automation_deletion(inst, 'automation', receipt)
        inst.wait.assert_not_called()
        inst.request.assert_not_called()

    def test_incomplete_automation_deletion_requires_declared_progress(self):
        inst = Mock()
        inst.request.return_value = {'automations': []}
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        with self.assertRaisesRegex(Failure, 'no declared completion progress'):
            await_automation_deletion(inst, 'automation', {'success': True, 'id': 'automation', 'deleted': False})
        inst.request.assert_not_called()

    def test_completed_automation_deletion_requires_listing_absence(self):
        inst = Mock()
        receipt = {'success': True, 'id': 'automation', 'status': 'completed', 'deleted': True}
        inst.request.return_value = {'automations': [{'id': 'automation'}]}
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        with self.assertRaisesRegex(Failure, 'does not complete'):
            await_automation_deletion(inst, 'automation', receipt)
