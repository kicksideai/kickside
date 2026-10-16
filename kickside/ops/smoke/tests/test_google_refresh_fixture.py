import json
import unittest
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

from mocks import Fixtures


class GoogleRefreshFixture(unittest.TestCase):
    def setUp(self):
        self.fixtures = Fixtures()
        self.base = self.fixtures.start('google')

    def tearDown(self):
        self.fixtures.stop()

    def request(self, path, body=None, token=None):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        request = Request(self.base + path, data=json.dumps(body).encode() if body is not None else None,
                          headers=headers)
        with urlopen(request, timeout=5) as response:
            return json.load(response)

    def refresh(self):
        return self.request('/token', {'grant_type': 'refresh_token',
            'refresh_token': 'fictional-google-refresh', 'client_id': 'northwind-client',
            'client_secret': 'fictional-oidc-secret'})

    def test_refresh_issues_a_new_access_token_without_rotating_refresh_token(self):
        token = self.refresh()
        self.assertNotIn('refresh_token', token)
        self.assertEqual(token['expires_in'], 3600)
        self.assertIn('Northwind', json.dumps(self.request('/drive/v3/files', token=token['access_token'])))
        self.assertNotEqual(self.refresh()['access_token'], token['access_token'])

    def test_rejected_requests_and_refresh_errors_are_independently_controlled(self):
        self.request('/_fixture/oauth', {'api_rejections': 2, 'refresh_error': 'temporarily_unavailable'})
        for _ in range(2):
            with self.assertRaises(HTTPError) as rejected:
                self.request('/drive/v3/files', token='fictional-google-access')
            self.assertEqual(rejected.exception.code, 401)
        self.assertIn('files', self.request('/drive/v3/files', token='fictional-google-access'))
        with self.assertRaises(HTTPError) as unavailable:
            self.refresh()
        self.assertEqual(unavailable.exception.code, 503)
        self.assertEqual(json.load(unavailable.exception)['error'], 'temporarily_unavailable')
        self.request('/_fixture/oauth', {'refresh_error': 'invalid_grant'})
        with self.assertRaises(HTTPError) as invalid:
            self.refresh()
        self.assertEqual(invalid.exception.code, 400)
        self.assertEqual(json.load(invalid.exception)['error'], 'invalid_grant')

    def test_initial_token_expiry_is_configurable(self):
        class NoRedirect(HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None

        self.request('/_fixture/oauth', {'initial_expires_in': 1})
        query = urlencode({'client_id': 'northwind-client', 'state': 'northwind-state',
                           'redirect_uri': self.base + '/callback'})
        with self.assertRaises(HTTPError) as redirect:
            build_opener(NoRedirect).open(self.base + '/authorize?' + query, timeout=5)
        self.assertEqual(redirect.exception.code, 302)
        code = parse_qs(urlsplit(redirect.exception.headers['Location']).query)['code'][0]
        token = self.request('/token', {'grant_type': 'authorization_code', 'code': code,
                                      'client_secret': 'fictional-oidc-secret'})
        self.assertEqual(token['expires_in'], 1)
        self.assertEqual(token['refresh_token'], 'fictional-google-refresh')
