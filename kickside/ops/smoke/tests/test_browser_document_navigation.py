import unittest
from types import SimpleNamespace
from unittest.mock import Mock

from browser import Browser


class Request:
    method = 'GET'
    url = 'https://web-host.example/core.js'
    resource_type = 'script'
    failure = 'net::ERR_ABORTED'


class DocumentNavigationTests(unittest.TestCase):
    def browser(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock(base='http://app')
        browser.inst.redactor.text.side_effect = str
        browser.errors, browser.pending, browser.expected_document_navigations = [], {}, []
        browser.page = SimpleNamespace(url='http://app/system/users',
                                       main_frame=SimpleNamespace(url='http://app/system/users'))
        return browser

    def request(self, browser, **overrides):
        request = Request()
        request.frame = browser.page.main_frame
        for name, value in overrides.items():
            setattr(request, name, value)
        return request

    def test_verified_document_navigation_accepts_only_its_main_frame_script_abort(self):
        browser = self.browser()
        request = self.request(browser)
        with browser.document_navigation('/login'):
            browser.request_failed(request)
            browser.page.main_frame.url = 'http://app/login'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/login'
        self.assertEqual(browser.errors, [])
        browser.inst.evidence.save.assert_called_once_with('document-navigation-aborts', {
            'source': 'http://app/system/users',
            'target': 'http://app/login',
            'aborts': ['GET https://web-host.example/core.js: net::ERR_ABORTED'],
        })

    def test_abort_remains_an_error_when_the_navigation_does_not_reach_its_target(self):
        browser = self.browser()
        with browser.document_navigation('/login'):
            browser.request_failed(self.request(browser))
        self.assertEqual(browser.errors, ['GET https://web-host.example/core.js: net::ERR_ABORTED'])
        browser.inst.evidence.save.assert_not_called()

    def test_abort_remains_an_error_when_the_page_already_has_the_target_url(self):
        browser = self.browser()
        browser.page.url = 'http://app/login'
        with browser.document_navigation('/login'):
            browser.request_failed(self.request(browser))
            browser.document_navigated(browser.page, browser.page.main_frame)
        self.assertEqual(browser.errors, ['GET https://web-host.example/core.js: net::ERR_ABORTED'])

    def test_abort_remains_an_error_without_a_recorded_main_document_transition(self):
        browser = self.browser()
        with browser.document_navigation('/login'):
            browser.request_failed(self.request(browser))
            browser.page.url = 'http://app/login'
        self.assertEqual(browser.errors, ['GET https://web-host.example/core.js: net::ERR_ABORTED'])

    def test_non_script_or_non_main_frame_abort_remains_an_error_during_navigation(self):
        browser = self.browser()
        with browser.document_navigation('/login'):
            browser.request_failed(self.request(browser, resource_type='xhr'))
            browser.request_failed(self.request(browser, frame=object()))
            browser.page.url = 'http://app/login'
        self.assertEqual(browser.errors, [
            'GET https://web-host.example/core.js: net::ERR_ABORTED',
            'GET https://web-host.example/core.js: net::ERR_ABORTED',
        ])


if __name__ == '__main__':
    unittest.main()
