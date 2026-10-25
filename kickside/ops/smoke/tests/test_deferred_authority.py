from types import SimpleNamespace
import unittest
from unittest.mock import Mock, call

import scenarios_deferred_authority as authority
from harness import Failure


class ScopeProjectionReadinessTests(unittest.TestCase):
    def test_retries_only_the_native_projection_timeout_until_success(self):
        inst = Mock()
        inst.request.side_effect = [
            {'success': False, 'error': 'scope projection reconcile timed out waiting for kickside.security.service:scope_projection.service'},
            {'success': True, 'result': {'scope_name': 'app.security.scopes:set_ready'}},
        ]

        def wait(condition, label):
            self.assertEqual(label, 'projection: scope projection becomes ready')
            self.assertIsNone(condition())
            return condition()

        inst.wait.side_effect = wait
        result = authority._wait_for_scope_projection(SimpleNamespace(inst=inst), ['app.security:user', 'app.security:operators'],
                                                       'projection')

        self.assertTrue(result['success'])
        inst.request.assert_has_calls([
            call('POST', '/api/v1/identity-authority/projection',
                 {'groups': ['app.security:user', 'app.security:operators']}, expect=(200, 409), label='projection-attempt-1'),
            call('POST', '/api/v1/identity-authority/projection',
                 {'groups': ['app.security:user', 'app.security:operators']}, expect=(200, 409), label='projection-attempt-2'),
        ])
        inst.wait.assert_called_once()

    def test_does_not_retry_an_unexpected_projection_409(self):
        inst = Mock()
        inst.request.return_value = {
            'success': False,
            'error': 'scope projection reconcile timed out waiting for kickside.security.service:another_projection.service',
        }
        condition = None

        def wait(callback, _label):
            nonlocal condition
            condition = callback
            return callback()

        inst.wait.side_effect = wait
        with self.assertRaisesRegex(Failure, 'scope projection fails'):
            authority._wait_for_scope_projection(SimpleNamespace(inst=inst), ['app.security:user'], 'projection')

        self.assertIsNotNone(condition)
        inst.request.assert_called_once_with('POST', '/api/v1/identity-authority/projection',
                                             {'groups': ['app.security:user']}, expect=(200, 409), label='projection-attempt-1')
