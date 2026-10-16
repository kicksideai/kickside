from pathlib import Path
import tempfile
import unittest
import urllib.request
from ops.compat.fetch_baselines import HubOnly, app_lock

class FetchTests(unittest.TestCase):
    def test_hub_artifact_redirect_strips_credentials(self):
        handler = HubOnly(artifact=True)
        req = urllib.request.Request('https://hub.wippy.ai/api/v1/modules/a/b/versions/1/download', headers={'Authorization': 'Bearer secret'})
        redirected = handler.redirect_request(req, None, 307, 'redirect', {}, 'https://wippy-hub-bucket-prod-gen2.s3.dualstack.us-east-1.amazonaws.com/a.wapp?signature=secret')
        self.assertFalse(redirected.has_header('Authorization'))

    def test_unrelated_redirect_and_insecure_redirect_fail(self):
        req = urllib.request.Request('https://hub.wippy.ai/metadata')
        for target in ('https://example.com/artifact', 'http://hub.wippy.ai/artifact'):
            with self.assertRaises(ValueError):
                HubOnly().redirect_request(req, None, 302, 'redirect', {}, target)

    def test_app_lock_is_exact_and_complete(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'wippy.lock'
            path.write_text('modules:\n- name: a/b\n  version: 1.2.3\n  hash: abc\n')
            self.assertEqual(app_lock(path, ['a/b'])['a/b']['version'], '1.2.3')
            with self.assertRaises(ValueError):
                app_lock(path, ['a/c'])


class UnreleasedBaselineTests(unittest.TestCase):
    def hub(self, outcome):
        from ops.compat.fetch_baselines import Hub
        hub = Hub.__new__(Hub)
        hub.url, hub.token = 'https://hub.wippy.ai', None
        def request(url, binary=False):
            if isinstance(outcome, Exception):
                raise outcome
            return outcome
        hub.request = request
        return hub

    def test_never_released_module_compares_against_an_empty_baseline(self):
        from ops.compat.fetch_baselines import HubRequestError
        baseline = self.hub(HubRequestError('Hub request fails (HTTP 404)', 404)).baseline('sample/fresh', None, released=False)
        self.assertEqual(baseline['entries'], {})
        self.assertIsNone(baseline['sha256'])

    def test_first_release_candidate_has_no_published_baseline(self):
        from ops.compat.fetch_baselines import HubRequestError
        baseline = self.hub(HubRequestError('Hub request fails (HTTP 404)', 404)).baseline(
            'sample/fresh', None, released=True)
        self.assertEqual(baseline, {'version': 'unreleased', 'sha256': None, 'entries': {}})

    def test_locked_module_requires_a_published_baseline(self):
        from ops.compat.fetch_baselines import HubRequestError
        with self.assertRaises(HubRequestError):
            self.hub(HubRequestError('Hub request fails (HTTP 404)', 404)).baseline(
                'sample/shipped', None, {'version': '1.2.3', 'hash': 'abc'}, released=True)

    def test_candidate_transport_failure_is_not_an_empty_baseline(self):
        from ops.compat.fetch_baselines import HubRequestError
        with self.assertRaises(HubRequestError):
            self.hub(HubRequestError('Hub request fails (HTTP 500)', 500)).baseline(
                'sample/fresh', None, released=True)

    def test_unreleased_declaration_requires_the_hub_to_lack_the_module(self):
        with self.assertRaises(ValueError):
            self.hub({'latest_version': '0.1.0'}).baseline('sample/fresh', None, released=False)

    def test_other_hub_failures_still_fail_the_gate(self):
        from ops.compat.fetch_baselines import HubRequestError
        with self.assertRaises(HubRequestError):
            self.hub(HubRequestError('Hub request fails (HTTP 500)', 500)).baseline('sample/fresh', None, released=False)
