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

    def test_navigation_abort_clears_pending_work_without_settling_native_traffic(self):
        browser = self.browser()
        request = self.request(browser)
        browser.pending[request] = request.url
        with browser.document_navigation('/login'):
            browser.request_failed(request)
            browser.page.main_frame.url = 'http://app/login'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/login'
        self.assertFalse(browser.pending)
        self.assertFalse(browser.errors)

    def test_verified_navigation_retires_only_its_old_main_document_in_both_ledgers(self):
        browser = self.browser()
        source, target = browser.page.url, 'http://app/login'
        browser.page_scopes = {id(browser.page): 7}
        browser.page_main_frames = {7: 'main'}
        old = self.request(browser, url=source, resource_type='document')
        browser.pending[old] = old.url
        old_identity = (7, 'page:7', 'old-document')
        api_identity = (7, 'page:7', 'api')
        worker_identity = (7, 'worker:7', 'worker-document')
        new_identity = (7, 'page:7', 'new-document')
        subframe_identity = (7, 'page:7', 'subframe-document')
        browser.native_network = {
            old_identity: {'method': 'GET', 'url': source, 'type': 'Document', 'frame_id': 'main', 'failed': False},
            api_identity: {'method': 'GET', 'url': 'http://app/api/v1/user/me', 'type': 'Fetch', 'frame_id': 'main', 'failed': False},
            worker_identity: {'method': 'GET', 'url': source, 'type': 'Document', 'frame_id': 'main', 'failed': False},
            new_identity: {'method': 'GET', 'url': target, 'type': 'Document', 'frame_id': 'main', 'failed': False},
            subframe_identity: {'method': 'GET', 'url': source, 'type': 'Document', 'frame_id': 'child', 'failed': False},
        }
        with browser.document_navigation('/login'):
            browser.page.main_frame.url = target
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = target
        self.assertFalse(browser.pending)
        self.assertNotIn(old_identity, browser.native_network)
        self.assertEqual(set(browser.native_network), {api_identity, worker_identity, new_identity, subframe_identity})
        browser.inst.evidence.save.assert_called_once_with('document-navigation-aborts', {
            'source': source, 'target': target, 'aborts': [],
            'retired_documents': [{'request': 'old-document', 'source': source}],
        })

    def test_source_document_remains_pending_without_its_main_frame_playwright_request(self):
        browser = self.browser()
        source, target = browser.page.url, 'http://app/login'
        browser.page_scopes = {id(browser.page): 7}
        browser.page_main_frames = {7: 'main'}
        identity = (7, 'page:7', 'old-document')
        browser.native_network = {identity: {
            'method': 'GET', 'url': source, 'type': 'Document', 'frame_id': 'main', 'failed': False}}
        with browser.document_navigation('/login'):
            browser.page.main_frame.url = target
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = target
        self.assertEqual(browser.native_network, {identity: {
            'method': 'GET', 'url': source, 'type': 'Document', 'frame_id': 'main', 'failed': False}})
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

    def test_verified_navigation_accepts_only_its_declared_stylesheet_after_fragment_return(self):
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        stylesheet = 'http://app/api/public/facade/variables.css'
        with browser.document_navigation('/', stylesheet_cleanup=(stylesheet,)):
            browser.page.url = 'http://app/login#sso_token=redacted'
            browser.request_failed(self.request(browser, url=stylesheet, resource_type='stylesheet'))
            browser.page.main_frame.url = 'http://app/'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/'
        self.assertEqual(browser.errors, [])
        browser.inst.evidence.save.assert_called_once_with('document-navigation-aborts', {
            'source': 'http://app/login',
            'target': 'http://app/',
            'aborts': ['GET http://app/api/public/facade/variables.css: net::ERR_ABORTED'],
        })

    def test_declared_stylesheet_remains_an_error_without_the_verified_transition(self):
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        stylesheet = 'http://app/api/public/facade/variables.css'
        with browser.document_navigation('/', stylesheet_cleanup=(stylesheet,)):
            browser.page.url = 'http://app/login#sso_token=redacted'
            browser.request_failed(self.request(browser, url=stylesheet, resource_type='stylesheet'))
        self.assertEqual(browser.errors, ['GET http://app/api/public/facade/variables.css: net::ERR_ABORTED'])

    def test_other_stylesheet_remains_an_error_during_verified_navigation(self):
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        with browser.document_navigation('/', stylesheet_cleanup=('http://app/api/public/facade/variables.css',)):
            browser.request_failed(self.request(browser, url='http://app/unexpected.css', resource_type='stylesheet'))
            browser.page.main_frame.url = 'http://app/'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/'
        self.assertEqual(browser.errors, ['GET http://app/unexpected.css: net::ERR_ABORTED'])

    def test_verified_navigation_accepts_only_its_declared_image_asset_abort(self):
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        icon = 'http://app/app/kickside-icon.svg'
        with browser.document_navigation('/', asset_cleanup=(icon,)):
            browser.request_failed(self.request(browser, url=icon, resource_type='image'))
            browser.page.main_frame.url = 'http://app/'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/'
        self.assertEqual(browser.errors, [])
        browser.inst.evidence.save.assert_called_once_with('document-navigation-aborts', {
            'source': 'http://app/login', 'target': 'http://app/',
            'aborts': ['GET http://app/app/kickside-icon.svg: net::ERR_ABORTED'],
        })

    def test_other_or_unverified_image_abort_remains_an_error(self):
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        icon = 'http://app/app/kickside-icon.svg'
        with browser.document_navigation('/', asset_cleanup=(icon,)):
            browser.request_failed(self.request(browser, url='http://app/app/other-icon.svg', resource_type='image'))
            browser.page.main_frame.url = 'http://app/'
            browser.document_navigated(browser.page, browser.page.main_frame)
            browser.page.url = 'http://app/'
        self.assertEqual(browser.errors, ['GET http://app/app/other-icon.svg: net::ERR_ABORTED'])
        browser = self.browser()
        browser.page.url = browser.page.main_frame.url = 'http://app/login'
        with browser.document_navigation('/', asset_cleanup=(icon,)):
            browser.request_failed(self.request(browser, url=icon, resource_type='image'))
        self.assertEqual(browser.errors, ['GET http://app/app/kickside-icon.svg: net::ERR_ABORTED'])


if __name__ == '__main__':
    unittest.main()
