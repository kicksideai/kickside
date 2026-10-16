import unittest
from unittest.mock import Mock

from browser import Browser, CHAT_STATE
from harness import require


class ToolErrorDetailsTests(unittest.TestCase):
    def test_user_opens_error_details_before_asserting_the_provider_diagnostic(self):
        browser = Mock()
        browser.frames = []
        chat = browser.frame.locator.return_value
        chat.locator.return_value.count.return_value = 1
        opened = []
        chat.locator.return_value.last.click.side_effect = lambda: opened.append(True)
        chat.get_by_placeholder.return_value.press.side_effect = lambda key: browser.frames.append(
            {'data': {'type': 'tool_call', 'id': 'invocation'}})
        chat.evaluate.side_effect = lambda script: (
            {'enabled': True, 'busy': False, 'text': 'The provider reports an error.'}
            if script == CHAT_STATE else 'packing station refused' if opened else 'Failed')
        browser.inst.wait.side_effect = lambda predicate, *args, **kwargs: require(predicate(), 'Not ready')
        Browser.tool_error(browser, 'Call the provider once.', 'packing station refused', 'remote-error')
        self.assertEqual(opened, [True])
        browser.screenshot.assert_called_once_with('remote-error-visible')
