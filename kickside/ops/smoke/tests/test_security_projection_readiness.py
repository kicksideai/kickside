import unittest
from unittest.mock import Mock, call

from browser import Browser
from harness import Failure
from runtime import Instance


class SecurityProjectionReadinessTests(unittest.TestCase):
    def instance(self, responses):
        inst = Instance.__new__(Instance)
        inst.request = Mock(side_effect=responses)
        return inst

    def test_retries_stale_status_until_current_with_unique_evidence_labels(self):
        inst = self.instance([
            {'current': False, 'scope_name': 'app.security.scopes:set_stale'},
            {'current': True, 'scope_name': 'app.security.scopes:set_ready'},
        ])

        def wait(condition, label):
            self.assertEqual(label, 'Hub security projection: security projection becomes current')
            self.assertIsNone(condition())
            return condition()

        inst.wait = Mock(side_effect=wait)
        result = inst.await_current_security_projection('Hub security projection')

        self.assertTrue(result['current'])
        inst.request.assert_has_calls([
            call('GET', '/api/v1/security/projection', label='security-projection-readiness-1'),
            call('GET', '/api/v1/security/projection', label='security-projection-readiness-2'),
        ])
        inst.wait.assert_called_once_with(unittest.mock.ANY,
                                          'Hub security projection: security projection becomes current')

    def test_read_error_fails_without_retry(self):
        inst = self.instance([Failure('GET /api/v1/security/projection: HTTP 500: {"kind":"Internal"}')])
        inst.wait = Mock(side_effect=lambda condition, _label: condition())

        with self.assertRaisesRegex(Failure, 'HTTP 500'):
            inst.await_current_security_projection('Hub security projection')

        inst.request.assert_called_once_with(
            'GET', '/api/v1/security/projection', label='security-projection-readiness-1')

    def test_missing_or_malformed_status_fails_without_retry(self):
        for response in ({}, {'current': 'true'}, {'current': 1},
                         {'current': False}, {'current': True, 'scope_name': ''}):
            with self.subTest(response=response):
                inst = self.instance([response])
                inst.wait = Mock(side_effect=lambda condition, _label: condition())

                with self.assertRaisesRegex(Failure, 'security projection status has no (boolean current|nonempty scope_name)'):
                    inst.await_current_security_projection('Hub security projection')

                inst.request.assert_called_once_with(
                    'GET', '/api/v1/security/projection', label='security-projection-readiness-1')

    def test_failed_paused_body_restarts_without_claiming_readiness(self):
        inst = Mock()
        inst.cleanup.run.return_value = []

        with self.assertRaisesRegex(RuntimeError, 'fixture write fails'):
            with Browser.paused(inst, [], lambda context, action: action(context)):
                raise RuntimeError('fixture write fails')

        inst.start.assert_called_once_with()
        inst.await_keeper.assert_not_called()
        inst.await_current_security_projection.assert_not_called()
