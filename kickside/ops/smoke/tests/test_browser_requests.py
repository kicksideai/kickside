import gc
import unittest
import weakref
from unittest.mock import patch

from browser import Browser
from harness import Failure
from tests.test_browser_crash import Pages, instance


class Request:
    url = 'http://asset/preview.worker.js'
    method = 'GET'
    failure = 'net::ERR_FAILED'
    # Ordinary application work uses a real Playwright resource type too; this
    # double must not masquerade as a worker bootstrap merely because its URL
    # happens to resemble one.
    resource_type = 'fetch'


class WorkerRequest(Request):
    resource_type = 'script'

    @property
    def frame(self):
        # Playwright refuses Request.frame for a worker-owned script.
        raise RuntimeError('Request.frame: Cannot access frame for worker request')


class RequestTrackingTests(unittest.TestCase):
    def setUp(self):
        pages = Pages()
        self.browser = Browser(instance(), session=pages.session)
        self.handlers = self.browser.context.handlers
        self.page_handlers = pages.pages[0].handlers

    def test_pending_request_keeps_its_identity_until_completion(self):
        request = Request()
        reference = weakref.ref(request)
        self.handlers['request'](request)
        del request
        gc.collect()
        self.assertIsNotNone(reference(), 'Pending request loses its event identity')
        self.handlers['requestfinished'](reference())
        self.assertFalse(self.browser.pending)
        gc.collect()
        self.assertIsNone(reference(), 'Completed request remains retained')

    def test_same_url_requests_finish_independently(self):
        first, second = Request(), Request()
        self.handlers['request'](first)
        self.handlers['request'](second)
        self.handlers['requestfinished'](first)
        self.assertEqual(list(self.browser.pending.values()), [second.url])
        self.handlers['requestfailed'](second)
        self.assertFalse(self.browser.pending)
        self.assertEqual(self.browser.errors, ['GET ' + second.url + ': net::ERR_FAILED'])

    def test_finishing_another_request_does_not_clear_pending_work(self):
        request = Request()
        self.handlers['request'](request)
        self.handlers['requestfinished'](Request())
        self.assertEqual(list(self.browser.pending.values()), [request.url])

    def test_settling_timeout_reports_only_redacted_request_urls(self):
        request = Request()
        self.browser.inst.redactor.text.side_effect = lambda value: 'redacted-worker-url'
        self.handlers['request'](request)
        with patch('browser.time.monotonic', side_effect=[0, 31]):
            with self.assertRaises(Failure) as failure:
                self.browser.settle()
        message = str(failure.exception)
        self.assertIn('Browser requests do not settle within 30 seconds:', message)
        self.assertIn('redacted-worker-url', message)
        self.assertNotIn(request.url, message)

    def test_worker_requests_finish_through_the_browser_context(self):
        handlers = self.browser.context.handlers
        request = WorkerRequest()
        handlers['request'](request)
        self.assertEqual(list(self.browser.pending.values()), [request.url])
        self.assertFalse(hasattr(self.browser, 'request_groups'))
        handlers['requestfinished'](request)
        self.assertFalse(self.browser.pending)
        self.assertNotIn('request', self.page_handlers, 'Page and context track the same request twice')

    def test_worker_failures_reach_the_strict_browser_error_check(self):
        handlers = self.browser.context.handlers
        request = Request()
        handlers['request'](request)
        handlers['requestfailed'](request)
        self.assertFalse(self.browser.pending)
        with self.assertRaisesRegex(Failure, 'net::ERR_FAILED'):
            self.browser.clean(0)
