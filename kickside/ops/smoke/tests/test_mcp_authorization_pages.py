from contextlib import nullcontext
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from browser import Browser
import scenarios_mcp_security as guards


class AuthorizationPageOwnershipTests(unittest.TestCase):
    def test_consent_failures_close_the_owned_context_and_preserve_the_application(self):
        for scenario in (guards.validated_consent, guards.consent_destination,
                         guards.preset_catalog_errors, guards.consent_preset_scope):
            with self.subTest(scenario=scenario.__name__):
                inst = Mock(base='http://application.test', password='fixture-password')
                inst.request.return_value = {'redirect_uri': 'http://client.test/callback'}
                application = Mock()
                authorization = Mock()
                application.goto.side_effect = ValueError('authorization navigation fails')
                authorization.goto.side_effect = ValueError('authorization navigation fails')
                browser = Mock(page=application, context=Mock(), errors=[], inst=inst,
                               navigation_urls={})
                previous = browser.context
                browser.open_page.return_value = authorization
                browser.presentation.side_effect = lambda **options: Browser.presentation(browser, **options)
                browser.rejection.side_effect = lambda *args: nullcontext()
                browser.failure_response.side_effect = lambda *args: nullcontext()
                ctx = SimpleNamespace(inst=inst, browser_check=lambda: browser)
                with patch.object(guards, 'run_focused_module_test'), \
                        patch.object(guards, 'member_identity', return_value={'email': 'member@example.test', 'token': 'member'}), \
                        patch.object(guards, 'oauth_request', return_value=({'redirect_uri': 'http://client.test/callback'}, 'verifier')):
                    with self.assertRaisesRegex(ValueError, 'authorization navigation fails'):
                        scenario(ctx)
                application.goto.assert_not_called()
                authorization.goto.assert_called_once()
                browser.browser.new_context.return_value.close.assert_called_once()
                self.assertIs(browser.page, application)
                self.assertIs(browser.context, previous)
