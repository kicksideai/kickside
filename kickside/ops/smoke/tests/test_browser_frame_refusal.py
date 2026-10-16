import unittest
from unittest.mock import Mock

from browser import Browser


class FrameRefusalTests(unittest.TestCase):
    def browser(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock()
        browser.inst.redactor.text.side_effect = str
        browser.errors, browser.pending, browser.expected_http = [], {}, []
        browser.frame_refusals = [{'url': 'http://host/consent', 'console': [], 'requests': []}]
        return browser

    def test_expected_refusal_retains_evidence_without_losing_other_errors(self):
        browser = self.browser()
        message = Mock(type='error', text="Framing 'http://host/' violates frame-ancestors 'none' and is blocked",
                       location={'url': 'http://host/consent'})
        browser.console_received(message)
        request = Mock(method='GET', url='http://host/consent', failure='net::ERR_BLOCKED_BY_RESPONSE')
        browser.request_failed(request)
        self.assertEqual(browser.errors, [])
        self.assertEqual(browser.frame_refusals[0]['console'], [message.text])
        self.assertEqual(len(browser.frame_refusals[0]['requests']), 1)
        message.text = 'Uncaught application failure'
        browser.console_received(message)
        request.failure = 'net::ERR_FAILED'
        browser.request_failed(request)
        self.assertEqual(len(browser.errors), 2)

    def test_unrelated_frame_refusal_is_still_an_error(self):
        browser = self.browser()
        message = Mock(type='error', text="frame-ancestors 'none' blocked", location={'url': 'http://host/other'})
        browser.console_received(message)
        browser.request_failed(Mock(method='GET', url='http://host/other', failure='net::ERR_BLOCKED_BY_RESPONSE'))
        self.assertEqual(len(browser.errors), 2)
