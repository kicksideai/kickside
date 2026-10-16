import unittest
from unittest.mock import Mock

from browser import Browser


class IconMirrorAbortTests(unittest.TestCase):
    def browser(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock()
        browser.inst.redactor.text.side_effect = str
        browser.errors, browser.pending, browser.expected_http, browser.frame_refusals = [], {}, [], []
        return browser

    def test_cancelled_iconify_mirror_requests_are_not_errors(self):
        browser = self.browser()
        for host in ('api.iconify.design', 'api.simplesvg.com', 'api.unisvg.com'):
            browser.request_failed(Mock(method='GET', url=f'https://{host}/tabler.json?icons=x', failure='net::ERR_ABORTED'))
        self.assertEqual(browser.errors, [])

    def test_other_icon_mirror_failures_and_other_aborts_stay_errors(self):
        browser = self.browser()
        browser.request_failed(Mock(method='GET', url='https://api.unisvg.com/tabler.json?icons=x', failure='net::ERR_NAME_NOT_RESOLVED'))
        browser.request_failed(Mock(method='GET', url='http://host/api/v1/thing', failure='net::ERR_ABORTED'))
        self.assertEqual(len(browser.errors), 2)


if __name__ == '__main__':
    unittest.main()
