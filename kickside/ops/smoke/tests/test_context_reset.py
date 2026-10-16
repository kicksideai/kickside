import unittest
from unittest.mock import Mock

from browser import Browser


class ContextResetTests(unittest.TestCase):
    def test_account_switch_waits_for_the_old_context_requests(self):
        browser = Browser.__new__(Browser)
        browser.pending = {'users': 'http://localhost/api/v1/users'}
        previous = browser.context = Mock()
        browser.browser = Mock()
        browser.open_page = Mock()
        def complete():
            browser.pending.pop('users')
        browser.settle = Mock(side_effect=complete)
        previous.close.side_effect = lambda: self.assertEqual(browser.pending, {})
        browser.reset_context()
        previous.close.assert_called_once()
        self.assertIs(browser.context, browser.browser.new_context.return_value)

    def test_unsettled_request_stops_context_replacement(self):
        browser = Browser.__new__(Browser)
        previous = browser.context = Mock()
        browser.browser = Mock()
        browser.open_page = Mock()
        browser.settle = Mock(side_effect=RuntimeError('request does not finish'))
        with self.assertRaisesRegex(RuntimeError, 'request does not finish'):
            browser.reset_context()
        previous.close.assert_not_called()
        browser.browser.new_context.assert_not_called()
