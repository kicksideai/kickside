from io import BytesIO
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError

from runtime import Instance


class ResponseHeaderTests(unittest.TestCase):
    def test_error_response_retains_the_oauth_discovery_challenge(self):
        inst = Instance.__new__(Instance)
        inst.base, inst.token = 'http://127.0.0.1:8085', ''
        inst.redactor = Mock()
        inst.redactor.value.side_effect = lambda value: value
        headers = {}
        error = HTTPError(inst.base, 401, 'authorization required',
                          {'WWW-Authenticate': 'Bearer resource_metadata="http://127.0.0.1:8085/.well-known/oauth-protected-resource"'},
                          BytesIO(b'{"error":"authorization required"}'))
        with patch('runtime.urllib.request.urlopen', side_effect=error):
            inst.request('POST', '/api/public/mcp', {}, expect=(401,), response_headers=headers)
        self.assertEqual(headers['WWW-Authenticate'], error.headers['WWW-Authenticate'])
