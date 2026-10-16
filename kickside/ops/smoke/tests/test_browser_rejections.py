import unittest
from unittest.mock import Mock
from contextlib import nullcontext
from harness import Failure

from browser import Browser


class BrowserRejectionTests(unittest.TestCase):
    def browser(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock(base='http://localhost:731')
        browser.inst.redactor.text.side_effect = lambda value: value
        browser.inst.redactor.value.side_effect = lambda value: value
        browser.errors, browser.uploads, browser.expected_http = [], [], []
        return browser

    def response(self, path, status):
        response = Mock(status=status, url='http://localhost:731' + path)
        response.request.method = 'POST'
        return response

    def test_unexpected_rejection_remains_a_browser_error(self):
        browser = self.browser()
        browser.response_received(self.response('/draft/undo', 409))
        self.assertEqual(browser.errors, ['HTTP 409: http://localhost:731/draft/undo'])

    def test_expected_rejection_matches_method_url_and_status_and_keeps_evidence(self):
        browser = self.browser()
        expected = {'method': 'POST', 'url': 'http://localhost:731/draft/undo', 'status': 409, 'observed': 0}
        browser.expected_http.append(expected)
        browser.response_received(self.response('/draft/undo', 409))
        self.assertEqual(expected['observed'], 1)
        self.assertEqual(browser.errors, [])
        browser.inst.evidence.save.assert_called_once()
        for response in (self.response('/other', 409), self.response('/draft/undo', 500)):
            browser.response_received(response)
        self.assertEqual(len(browser.errors), 2)

    def test_console_errors_are_only_expected_for_the_exact_rejected_response(self):
        browser = self.browser()
        browser.expected_http.append({'method': 'POST', 'url': 'http://localhost:731/draft/undo', 'status': 409, 'observed': 1})
        message = Mock(type='error', text='Failed to load resource: the server responded with a status of 409 (Conflict)',
                       location={'url': 'http://localhost:731/draft/undo'})
        browser.console_received(message)
        self.assertEqual(browser.errors, [])
        message.text = 'Uncaught application failure'
        browser.console_received(message)
        self.assertEqual(browser.errors, ['Uncaught application failure'])


class BrowserFailureFixtureTests(BrowserRejectionTests):
    def configured(self):
        browser = self.browser()
        browser.page = Mock()
        browser.settle = Mock()
        response = self.response('/catalog', 500)
        browser.page.expect_response.return_value = nullcontext(Mock(value=response))
        return browser, response

    def test_controls_the_mock_response_and_retains_real_server_errors(self):
        browser, response = self.configured()
        with browser.failure_response('POST', '/catalog', 500, {'error': 'controlled outage'}):
            browser.response_received(response)
            route = Mock(request=Mock(method='POST'))
            callback = browser.page.route.call_args.args[1]
            callback(route)
            route.fulfill.assert_called_once_with(status=500, content_type='application/json',
                                                  body='{"error": "controlled outage"}')
            browser.response_received(response)
        self.assertEqual(browser.errors, ['HTTP 500: http://localhost:731/catalog'])
        self.assertEqual(browser.expected_http, [])
        browser.page.unroute.assert_called_once()

    def test_missing_controlled_response_fails_and_removes_its_route(self):
        browser, _ = self.configured()
        with self.assertRaisesRegex(Failure, 'exactly one expected response'):
            with browser.failure_response('POST', '/catalog', 500, {'error': 'controlled outage'}):
                pass
        self.assertEqual(browser.expected_http, [])
        browser.page.unroute.assert_called_once()

    def test_repeated_controlled_responses_fail(self):
        browser, response = self.configured()
        with self.assertRaisesRegex(Failure, 'exactly one expected response'):
            with browser.failure_response('POST', '/catalog', 500, {'error': 'controlled outage'}):
                callback = browser.page.route.call_args.args[1]
                for _ in range(2):
                    callback(Mock(request=Mock(method='POST')))
                    browser.response_received(response)
        self.assertEqual(browser.expected_http, [])
        browser.page.unroute.assert_called_once()

    def test_fixture_does_not_intercept_another_method(self):
        browser, response = self.configured()
        with browser.failure_response('POST', '/catalog', 500, {'error': 'controlled outage'}):
            callback = browser.page.route.call_args.args[1]
            other = Mock(request=Mock(method='GET'))
            callback(other)
            other.continue_.assert_called_once()
            other.fulfill.assert_not_called()
            callback(Mock(request=Mock(method='POST')))
            browser.response_received(response)
        self.assertEqual(browser.errors, [])

    def test_live_rejection_context_keeps_its_client_error_only_contract(self):
        browser, _ = self.configured()
        with self.assertRaisesRegex(Failure, 'client-error status'):
            with browser.rejection('POST', '/catalog', 500):
                pass


class BrowserSuccessfulResponseTests(BrowserRejectionTests):
    def configured(self, status, body):
        browser = self.browser()
        browser.page = Mock()
        browser.settle = Mock()
        response = self.response('/catalog', status)
        response.json.return_value = body
        browser.page.expect_response.return_value = nullcontext(Mock(value=response))
        return browser

    def test_captures_successful_response_body_as_evidence(self):
        browser = self.configured(200, {'success': True})
        with browser.successful_response('POST', '/catalog', 'catalog-install'):
            pass
        self.assertEqual(browser.page.expect_response.call_args.kwargs['timeout'], 300000)
        browser.inst.evidence.save.assert_called_once_with('catalog-install', {
            'method': 'POST', 'url': 'http://localhost:731/catalog', 'status': 200,
            'body': {'success': True},
        })

    def test_retains_non_success_response_evidence_and_fails_immediately(self):
        browser = self.configured(409, {'error': 'plan conflict'})
        with self.assertRaisesRegex(Failure, 'POST http://localhost:731/catalog returns HTTP 409'):
            with browser.successful_response('POST', '/catalog', 'catalog-install'):
                pass
        browser.inst.evidence.save.assert_called_once_with('catalog-install', {
            'method': 'POST', 'url': 'http://localhost:731/catalog', 'status': 409,
            'body': {'error': 'plan conflict'},
        })
