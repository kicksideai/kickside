from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import scenarios_providers as providers


class OAuthNavigationLifetimeTests(unittest.TestCase):
    def test_oauth_owns_and_closes_a_page_without_navigating_the_application(self):
        for fails in (False, True):
            with self.subTest(fails=fails):
                browser = Mock()
                page = browser.open_page.return_value
                inst = Mock()
                inst.request.side_effect = [
                    {'success': True}, {'success': True},
                    {'authorization_url': 'http://oauth.test/authorize'},
                ]
                if fails:
                    inst.wait.side_effect = ValueError('callback fails')
                else:
                    inst.wait.return_value = {'component_id': 'connection-1'}
                ctx = SimpleNamespace(inst=inst, state={'provider_bases': {'google': 'http://oauth.test'}},
                    fixtures=Mock())
                ctx.fixtures.requests.return_value = [{'method': 'POST', 'status': 200, 'path': '/token'}]
                with patch.object(providers, 'provider_browser', return_value=browser):
                    if fails:
                        with self.assertRaisesRegex(ValueError, 'callback fails'):
                            providers.oauth_origin_connect(ctx, 'google')
                    else:
                        self.assertEqual(providers.oauth_origin_connect(ctx, 'google'), 'connection-1')
                        self.assertEqual(ctx.state['google_oauth_connection'], 'connection-1')
                        self.assertEqual(inst.cleanup.add.call_count, 1)
                page.goto.assert_called_once_with('http://oauth.test/authorize', wait_until='domcontentloaded')
                page.close.assert_called_once_with()
                browser.page.goto.assert_not_called()
                self.assertEqual(inst.wait.call_args.kwargs['pump'], page.wait_for_timeout)
