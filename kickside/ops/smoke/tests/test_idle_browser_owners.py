import unittest
from unittest.mock import Mock, patch

from harness import Cleanup, Scenario
from scenarios import Context
from smoke import execute_scenario


class IdleOwnerTests(unittest.TestCase):
    def context(self):
        inst = Mock(cleanup=Cleanup())
        inst.evidence.paths = []
        inst.redactor.text.side_effect = str
        ctx = Context(inst)
        ctx.browser = Mock(errors=[], crashes=())
        ctx.browser.navigation.return_value = {
            'url': 'http://fixture/sessions/current',
            'storage_state': {'cookies': [], 'origins': [{
                'origin': 'http://fixture', 'localStorage': [{'name': 'token', 'value': 'saved'}],
            }]},
        }
        return ctx

    def test_scenario_releases_browser_and_restores_route_and_auth_before_next_action(self):
        ctx = self.context()
        previous = ctx.browser
        saved = previous.navigation.return_value
        first = execute_scenario({'model': {}}, 'sqlite', Scenario('first', 'full', lambda c: None),
                                  ctx, {}, lambda: None)
        self.assertEqual(first.status, 'passed', first.error)
        self.assertIsNone(ctx.browser)
        previous.close.assert_called_once_with()
        with patch('scenarios.Browser') as factory:
            factory.return_value.errors = []
            factory.return_value.crashes = ()
            def action(c):
                factory.return_value.restore.assert_called_once_with(saved)
                self.assertIs(c.browser, factory.return_value)
            second = execute_scenario({'model': {}}, 'sqlite', Scenario('second', 'full', action),
                                  ctx, {}, lambda: None)
        self.assertEqual(second.status, 'passed', second.error)
        self.assertIsNone(ctx.browser)

    def test_failed_action_still_releases_inactive_owner(self):
        ctx = self.context()
        previous = ctx.browser
        def fail(c):
            raise ValueError('action fails')
        result = execute_scenario({'model': {}}, 'postgres', Scenario('failure', 'full', fail),
                                  ctx, {}, lambda: None)
        self.assertEqual(result.status, 'failed')
        self.assertIn('action fails', result.error)
        self.assertIsNone(ctx.browser)
        previous.close.assert_called_once_with()

    def test_capture_failure_releases_browser_and_fails_scenario(self):
        ctx = self.context()
        previous = ctx.browser
        previous.navigation.side_effect = ValueError('navigation capture fails')
        result = execute_scenario({'model': {}}, 'sqlite', Scenario('capture', 'full', lambda c: None),
                                  ctx, {}, lambda: None)
        self.assertEqual(result.status, 'failed')
        self.assertIn('navigation capture fails', result.error)
        self.assertIsNone(ctx.browser)
        previous.close.assert_called_once_with()

    def test_close_failure_remains_visible(self):
        ctx = self.context()
        ctx.browser.close.side_effect = ValueError('close fails')
        result = execute_scenario({'model': {}}, 'postgres', Scenario('close', 'full', lambda c: None),
                                  ctx, {}, lambda: None)
        self.assertEqual(result.status, 'failed')
        self.assertIn('close fails', result.error)
        self.assertIsNone(ctx.browser)

    def test_restore_failure_releases_browser_and_fails_before_action(self):
        ctx = self.context()
        execute_scenario({'model': {}}, 'sqlite', Scenario('save', 'full', lambda c: None),
                         ctx, {}, lambda: None)
        action = Mock()
        with patch('scenarios.Browser') as factory:
            factory.return_value.restore.side_effect = ValueError('restore fails')
            result = execute_scenario({'model': {}}, 'sqlite', Scenario('restore', 'full', action),
                                      ctx, {}, lambda: None)
        self.assertEqual(result.status, 'failed')
        self.assertIn('restore fails', result.error)
        self.assertIsNone(ctx.browser)
        factory.return_value.close.assert_called_once_with()
        action.assert_not_called()


if __name__ == '__main__':
    unittest.main()
