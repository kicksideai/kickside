import copy
import tempfile
import json
from pathlib import Path
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from harness import Failure
from shell_vendor import shell_origin_only, shell_vendor_build, verify_shell_requests


class ShellVendorNetworkTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.source = Path(directory.name) / 'checkout'
        self.source.mkdir()
        self.run_root = str(Path(directory.name) / 'run')
        self.base = 'http://127.0.0.1:8085'
        self.file = 'vendor/@example/library@2.1.3/index.js'
        self.url = self.base + '/app/app/main/' + self.file
        self.imports = {'@example/library': '/app/app/main/' + self.file}
        self.manifest = {
            'imports': {'@example/library': {'package': '@example/library', 'version': '2.1.3',
                                            'integrity': 'sha512-package', 'file': self.file}},
            'files': {self.file: 'sha256-content'},
        }
        self.lock = {'packages': {'node_modules/@example/library': {
            'version': '2.1.3', 'integrity': 'sha512-package'}}}
        self.requests = [{'url': self.url, 'initiator': {'type': 'script'}}]
        self.responses = [{'url': self.url, 'status': 200, 'digest': 'sha256-content'}]

    def verify(self):
        return verify_shell_requests(self.base, self.imports, self.manifest, self.lock,
                                     self.requests, self.responses)

    def test_all_specifiers_have_observed_lock_verified_origin_assets(self):
        self.assertEqual(self.verify(), {'@example/library': self.url})

    def test_unrequested_mapping_fails(self):
        self.requests.clear()
        with self.assertRaisesRegex(Failure, 'not requested'):
            self.verify()

    def test_remote_map_fails_even_with_valid_local_response(self):
        self.imports['@example/library'] = 'https://esm.sh/@example/library@2.1.3'
        with self.assertRaisesRegex(Failure, 'instance asset'):
            self.verify()

    def test_missing_mapping_fails(self):
        self.imports.clear()
        with self.assertRaisesRegex(Failure, 'specifier'):
            self.verify()

    def test_changed_version_or_package_integrity_fails(self):
        for field in ('version', 'integrity'):
            with self.subTest(field=field):
                original = copy.deepcopy(self.manifest)
                self.manifest['imports']['@example/library'][field] = 'changed'
                with self.assertRaisesRegex(Failure, 'lockfile'):
                    self.verify()
                self.manifest = original

    def test_stale_or_failed_served_asset_fails(self):
        for response in ({'url': self.url, 'status': 200, 'digest': 'sha256-stale'},
                         {'url': self.url, 'status': 404, 'digest': 'sha256-content'}):
            with self.subTest(response=response):
                self.responses = [response]
                with self.assertRaisesRegex(Failure, 'served asset'):
                    self.verify()

    def test_transitive_external_request_from_owned_asset_fails(self):
        self.requests.append({'url': 'https://arbitrary.example/dependency.js', 'initiator': {
            'stack': {'callFrames': [], 'parent': {'callFrames': [{'url': self.url}]}}}})
        with self.assertRaisesRegex(Failure, 'third-party'):
            self.verify()

    def test_upstream_requests_do_not_replace_required_shell_assets(self):
        self.requests.append({'url': 'https://host.example/vue.js', 'initiator': {
            'stack': {'callFrames': [{'url': 'https://host.example/managed-layout.js'}]}}})
        self.assertEqual(self.verify(), {'@example/library': self.url})
        self.responses.clear()
        with self.assertRaisesRegex(Failure, 'served asset'):
            self.verify()

    def test_request_ownership_follows_the_executing_frame_across_host_callbacks(self):
        request = {'url': 'https://assets.example/styles.css', 'initiator': {
            'stack': {'callFrames': [{'url': 'https://host.example/element.js'}, {'url': self.url}]}}}
        self.requests.append(request)
        self.assertEqual(self.verify(), {'@example/library': self.url})
        request['initiator']['stack']['callFrames'].reverse()
        with self.assertRaisesRegex(Failure, 'third-party'):
            self.verify()

    def test_host_injected_scripts_have_html_initiator_provenance(self):
        self.manifest['files']['app.html'] = 'sha256-source-template'
        self.requests.append({'url': 'https://host.example/proxy.js', 'initiator': {
            'type': 'parser', 'url': self.base + '/app/app/main/app.html'}})
        self.assertEqual(self.verify(), {'@example/library': self.url})

    def test_owned_websockets_use_the_instance_host(self):
        socket = {'url': 'ws://127.0.0.1:8085/socket', 'initiator': {
            'stack': {'callFrames': [{'url': self.url}]}}}
        self.requests.append(socket)
        self.assertEqual(self.verify(), {'@example/library': self.url})
        socket['url'] = 'wss://outside.example/socket'
        with self.assertRaisesRegex(Failure, 'third-party'):
            self.verify()

    def test_build_runs_in_a_copy_and_leaves_the_source_untouched(self):
        source = self.source
        (source / 'app/static/app/main').mkdir(parents=True)
        (source / 'app/static/app/main/index.js').write_text('built')
        (source / 'node_modules').mkdir()
        (source / 'app/scripts').mkdir()
        (source / 'app/scripts/check.mjs').write_text('script')
        Path(self.run_root).mkdir()
        fixture = Path(self.run_root) / 'owned-shell-vendor.test.mjs'
        fixture.write_text('private shell contract')
        ran = []
        def run(command, cwd, **kwargs):
            cwd = Path(cwd)
            self.assertNotEqual(cwd, source)
            self.assertTrue((cwd / 'app/scripts/check.mjs').is_file())
            self.assertEqual((cwd / 'app/scripts/check-shell-vendor.test.mjs').read_text(),
                             'private shell contract')
            self.assertFalse((cwd / 'node_modules').exists())
            self.assertEqual((cwd / 'app/static/app').exists(), bool(ran))
            (cwd / 'app/static/app').mkdir(parents=True, exist_ok=True)
            (cwd / 'app/static/app/main.js').write_text('rebuilt')
            ran.append(command)
            return SimpleNamespace(returncode=0, stdout='', stderr='')
        root = Path(self.run_root)
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'source': str(source)}, root=str(root), env={}, evidence=Mock()))
        with patch('shell_vendor.PRIVATE_SHELL_VENDOR_TEST', fixture), patch('shell_vendor.subprocess.run', side_effect=run):
            shell_vendor_build(ctx)
        self.assertEqual(len(ran), 3)
        self.assertEqual((source / 'app/static/app/main/index.js').read_text(), 'built')
        self.assertFalse((source / 'app/static/app/main.js').exists())
        self.assertFalse((source / 'app/scripts/check-shell-vendor.test.mjs').exists())
        self.assertEqual(list((root / 'temp').iterdir()), [])

    def test_vendor_check_refuses_to_run_without_its_private_owned_fixture(self):
        evidence = Mock()
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'source': str(self.source)}, root=self.run_root, env={}, evidence=evidence))
        missing = Path(self.run_root) / 'missing-shell-vendor.test.mjs'
        with patch('shell_vendor.PRIVATE_SHELL_VENDOR_TEST', missing), self.assertRaisesRegex(
                Failure, 'Private shell vendor contract fixture is absent'):
            shell_vendor_build(ctx)
        evidence.save.assert_called_once_with('shell-vendor-build', {'commands': []})

    def test_vendor_check_builds_the_locked_shell_bundle_before_validation(self):
        completed = SimpleNamespace(returncode=0, stdout='completed', stderr='')
        evidence = Mock()
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'source': str(self.source)}, root=self.run_root, env={'PATH': '/bin'}, evidence=evidence))
        with patch('shell_vendor.subprocess.run', return_value=completed) as run:
            shell_vendor_build(ctx)
        self.assertEqual([call.args[0] for call in run.call_args_list], [
            ['make', 'install', 'MOD=app-main'],
            ['make', 'build', 'MOD=app-main'],
            ['node', '--test', 'app/scripts/check-shell-vendor.test.mjs'],
        ])
        self.assertTrue(all(call.kwargs['cwd'] != self.source for call in run.call_args_list))
        self.assertTrue(all(call.kwargs['env'] == ctx.inst.env for call in run.call_args_list))
        evidence.save.assert_called_once_with('shell-vendor-build', {'commands': [
            {'command': ['make', 'install', 'MOD=app-main'], 'code': 0, 'output': 'completed', 'error': ''},
            {'command': ['make', 'build', 'MOD=app-main'], 'code': 0, 'output': 'completed', 'error': ''},
            {'command': ['node', '--test', 'app/scripts/check-shell-vendor.test.mjs'],
             'code': 0, 'output': 'completed', 'error': ''},
        ]})

    def test_vendor_check_preserves_failed_dependency_setup_evidence(self):
        failed = SimpleNamespace(returncode=1, stdout='dependency setup failed', stderr='')
        evidence = Mock()
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'source': str(self.source)}, root=self.run_root, env={'PATH': '/bin'}, evidence=evidence))
        with patch('shell_vendor.subprocess.run', return_value=failed) as run:
            with self.assertRaisesRegex(Failure, 'dependency setup failed'):
                shell_vendor_build(ctx)
        self.assertEqual([call.args[0] for call in run.call_args_list], [['make', 'install', 'MOD=app-main']])
        evidence.save.assert_called_once_with('shell-vendor-build', {'commands': [
            {'command': ['make', 'install', 'MOD=app-main'], 'code': 1,
             'output': 'dependency setup failed', 'error': ''},
        ]})

    def test_browser_event_callbacks_register_and_login_failure_closes_context(self):
        from playwright._impl._impl_to_api_mapping import ImplToApiMapping
        mapping = ImplToApiMapping()
        callbacks = {}
        def register(event, handler):
            callbacks[event] = mapping.wrap_handler(handler)
        browser = Mock()
        browser.page.on.side_effect = register
        browser.context.new_cdp_session.return_value.on.side_effect = browser.page.on.side_effect
        response = Mock(url=self.url, status=200)
        response.body.return_value = b'export const value = 1'
        request = Mock(url=self.url)
        request.response.return_value = response
        def login():
            callbacks['requestfinished'](request)
            response.body.assert_called_once_with()
            redirect = Mock(url=self.url, status=302)
            redirect.body.side_effect = AssertionError('Redirect responses have no retrievable body')
            redirected_request = Mock(url=self.url)
            redirected_request.response.return_value = redirect
            callbacks['requestfinished'](redirected_request)
            redirect.body.assert_not_called()
            raise RuntimeError('login fixture failure')
        browser.login.side_effect = login
        case = Mock()
        case.browser_check.return_value = browser
        ctx = SimpleNamespace(inst=SimpleNamespace(config={'source': str(self.source)}, base=self.base,
                                                    evidence=Mock(), install=Mock()), browser_session=None)
        with patch('scenarios.Context', return_value=case), patch('shell_vendor.Path.read_text',
                side_effect=[json.dumps(self.manifest), json.dumps(self.lock)]):
            with self.assertRaisesRegex(RuntimeError, 'login fixture failure'):
                shell_origin_only(ctx)
        case.close_browser.assert_called_once_with()
        ctx.inst.install.assert_called_once_with('kickside/workflows')
        network = next(call.args[1] for call in ctx.inst.evidence.save.call_args_list
                       if call.args[0] == 'origin-only-network')
        self.assertEqual(network['served_assets'][-1], {'url': self.url, 'status': 302, 'digest': None})
        manifest = copy.deepcopy(self.manifest)
        manifest['files'][self.file] = network['served_assets'][0]['digest']
        with self.assertRaisesRegex(Failure, 'served asset'):
            verify_shell_requests(self.base, self.imports, manifest, self.lock,
                                  self.requests, network['served_assets'])
