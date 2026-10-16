import unittest
from unittest.mock import Mock, patch

from harness import Cleanup
from scenarios import Context
from scenarios_crm_chestor import journal_recall_ready, workspace_preview


class JournalRecallReadinessTests(unittest.TestCase):
    def test_event_visibility_does_not_supply_graph_search_readiness(self):
        inst = Mock(cleanup=Cleanup())
        ctx = Context(inst)
        self.assertIsNone(ctx.browser)
        inst.request.side_effect = [
            {'success': True, 'graphs': {'graphs': []}},
            {'success': True, 'graphs': {'graphs': [{'id': 'map'}]}},
            {'success': True, 'result': {'items': []}},
            {'success': True, 'result': {'items': [{'label': 'marker dispatch 204'}]}},
        ]
        def wait(predicate, *args, **kwargs):
            self.assertNotIn("pump", kwargs)
            self.assertEqual(kwargs["seconds"], 60)
            self.assertIsNone(predicate())
            return predicate()
        inst.wait.side_effect = wait
        journal_recall_ready(ctx, '/api/v1/workspace/journals/j', 'marker dispatch 204')
        self.assertEqual(inst.request.call_count, 4)
        self.assertTrue(all('/graphs' in call.args[1] for call in inst.request.call_args_list))


class WorkspacePreviewReadinessTests(unittest.TestCase):
    def test_preview_acquires_browser_before_navigation_after_install(self):
        ctx = Context(Mock(cleanup=Cleanup()))
        ctx.state['nw_graph_root'] = {'id': 'graph', 'name': 'Graph'}
        with patch('scenarios.Browser') as browser, patch('scenarios_crm_chestor.nav') as nav:
            def navigate(context, label):
                self.assertIs(context.browser, browser.return_value)
                browser.return_value.login.assert_called_once()
                raise StopIteration('navigation reached')
            nav.side_effect = navigate
            with self.assertRaisesRegex(StopIteration, 'navigation reached'):
                workspace_preview(ctx, 'root')
