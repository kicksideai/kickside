import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock, patch

from browser import Browser


class BrowserLoginTests(unittest.TestCase):
    def test_login_waits_for_previous_navigation_requests_to_finish(self):
        browser = Browser.__new__(Browser)
        browser.inst = SimpleNamespace(base='http://localhost:8085', email='member@example.test', password='password')
        browser.pending = {1: 'previous navigation request'}
        browser.page = MagicMock()
        browser.ensure_alive = Mock()
        browser.page.wait_for_timeout.side_effect = lambda _: browser.pending.clear()
        browser.page.expect_response.return_value.__enter__.return_value.value.status = 200

        def navigate(url, **kwargs):
            self.assertFalse(browser.pending, 'Login aborts an unfinished navigation request')

        browser.page.goto.side_effect = navigate
        ticks = iter(i / 5 for i in range(100))
        with patch('browser.time.monotonic', side_effect=lambda: next(ticks)):
            browser.login()

        browser.page.wait_for_url.assert_called_once_with('http://localhost:8085/', timeout=30000)
