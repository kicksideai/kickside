import unittest
from unittest.mock import Mock

from browser import Browser
from tests.test_browser_crash import Pages, instance


class Request:
    url = 'http://app/api/v1/automations/a1/status'
    method = 'GET'
    failure = None
    resource_type = 'fetch'


class ReloadTests(unittest.TestCase):
    def setUp(self):
        pages = Pages()
        self.browser = Browser(instance(), session=pages.session)
        self.page = pages.pages[0]
        handlers = self.browser.context.handlers

        def navigate(**options):
            for request in list(self.browser.pending):
                request.failure = 'net::ERR_ABORTED'
                handlers['requestfailed'](request)
        self.page.reload.side_effect = navigate
        self.request = Request()
        handlers['request'](self.request)
        self.page.wait_for_timeout.side_effect = lambda ms: handlers['requestfinished'](self.request)

    def test_reload_lets_in_flight_application_requests_finish_first(self):
        self.browser.reload()
        self.page.reload.assert_called_once_with(wait_until='domcontentloaded', timeout=30000)
        self.assertIsNone(self.request.failure)
        self.assertEqual(self.browser.errors, [])
