from contextlib import nullcontext
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_token_continuity as guard


class SavedTokenContinuityTests(unittest.TestCase):
    def observe(self, profile):
        expected = {'retained': True, 'removed': False, 'added': True}
        scopes = {'saved': expected, 'live': expected}
        inst = Mock()
        inst.base = 'http://fixture'
        def request(method, path, **kwargs):
            if path == guard.PATH:
                return scopes
            if path == '/api/v1/user/me':
                return {'success': True, 'user': profile}
            if path == '/api/v1/user-agents':
                return {'success': True, 'agents': []}
            raise AssertionError(path)
        inst.request.side_effect = request
        browser = Mock()
        browser.context.request.get.return_value = SimpleNamespace(status=200, json=lambda: scopes)
        updated = (SimpleNamespace(inst=inst), {'user_id': 'original-member'},
                   'api-credential', browser, 'browser-credential', {'stored': 'unchanged'}, {'live': expected})
        with patch.object(guard, 'updated_policy_fixture', return_value=nullcontext(updated)), \
             patch.object(guard, 'token_payloads', return_value={'stored': 'unchanged'}):
            guard.hub_policy_update(None)
        self.assertEqual(inst.request.call_count, 6)

    def test_native_profile_id_preserves_saved_credential_identity(self):
        self.observe({'id': 'original-member'})

    def test_changed_native_profile_id_fails(self):
        with self.assertRaisesRegex(Failure, 'self-service identity'):
            self.observe({'id': 'another-member'})

    def test_missing_native_profile_id_fails(self):
        with self.assertRaisesRegex(Failure, 'self-service identity'):
            self.observe({})
