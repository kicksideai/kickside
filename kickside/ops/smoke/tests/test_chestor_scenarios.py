import json
from types import SimpleNamespace
import unittest
from harness import Cleanup
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_access as access


class ChestorScenarios(unittest.TestCase):
    def test_catalog_install_supplies_declared_member_requirement_bindings(self):
        ctx = SimpleNamespace(inst=Mock())
        access.install_package(ctx, 'chestor/workspace')
        ctx.inst.install.assert_called_once_with('chestor/workspace', parameters=[{
            'name': 'chestor.workspace.security:user_security_scope', 'value': 'app.security:members'}])

    def test_hidden_domain_reads_accept_declared_denials_and_require_error_envelope(self):
        for name in ('graph', 'database', 'roadmap'):
            kind = access.kind_named(name)
            ctx = SimpleNamespace(inst=Mock(), state={'access_users': {'stranger': {'bearer': 'member'}}})
            ctx.inst.request.return_value = {'success': False, 'error': 'access denied'}
            access.read(ctx, access.Fixture(kind, 'private', 'Private'), 'stranger', hidden=True)
            self.assertEqual(ctx.inst.request.call_args.kwargs['expect'], (403, 404))
            ctx.inst.request.return_value = {'success': True, name: {'id': 'private'}}
            with self.assertRaises(Failure):
                access.read(ctx, access.Fixture(kind, 'private', 'Private'), 'stranger', hidden=True)
            ctx.inst.request.return_value = {'success': False, 'error': 'access denied',
                                             'schema' if name == 'database' else name: {'private': 'content'}}
            with self.assertRaises(Failure):
                access.read(ctx, access.Fixture(kind, 'private', 'Private'), 'stranger', hidden=True)

    def test_workspace_upload_carries_declared_target_metadata(self):
        ctx = SimpleNamespace(inst=Mock())
        ctx.inst.wait.return_value = {'status': 'completed'}
        with patch.object(access, 'request', return_value={'uuid': 'blob'}) as request:
            access.upload(ctx, 'owner', 'receipt.txt', 'Receipt', target_parent_id='folder')
        raw = request.call_args.kwargs['raw'].decode()
        self.assertIn('name="metadata"', raw)
        self.assertIn(json.dumps({'target_parent_id': 'folder'}), raw)

    def test_link_matrix_verifies_declared_noncreatability_for_each_actor(self):
        kind = access.kind_named('link')
        ctx = SimpleNamespace(inst=Mock(), state={'access_declarations': {kind.binding: {
            'meta': {'class': 'link', 'component': {}}}}})
        ctx.inst.redactor.text.side_effect = lambda text: text
        with patch.object(access, 'registry'), patch.object(access, 'renew'), patch.object(access, 'request') as request:
            request.side_effect = [
                {'types': [{'value': 'link', 'creatable': False}]},
                {'success': False, 'error': 'kind is not creatable: link'},
            ]
            access.matrix(ctx, kind, 'read')
        self.assertEqual(request.call_args.args[1:4], ('read', 'POST', '/workspace/entries'))
        self.assertEqual(request.call_args.kwargs['expect'], (400,))

    def test_private_instances_enter_each_actors_declared_login_provisioning_path(self):
        ctx = SimpleNamespace(inst=Mock())
        ctx.inst.redactor.text.side_effect = lambda text: text
        kind = access.kind_named('inbox')
        activated = set()
        def own(ctx, kind, role):
            if role not in activated:
                raise Failure('Actor has no relay login for installed kind')
            return access.Fixture(kind, role, role)
        with patch.object(access, 'actor_browser', side_effect=lambda ctx, role, **kwargs: activated.add(role)), \
             patch.object(access, 'provisioned', side_effect=own), patch.object(access, 'read'):
            access.private_instances(ctx, access.Fixture(kind, 'owner', 'Inbox'))
        self.assertEqual(activated, {'owner', 'write', 'read', 'stranger'})

    def test_telegram_discovery_without_default_chat_has_declared_empty_result(self):
        kind = next(kind for kind in access.KINDS if kind.binding == 'kickside.telegram.connection:telegram_connection')
        fixture = access.Fixture(kind, 'telegram', 'Telegram', {'connection': True})
        with patch.object(access, 'request', return_value={'success': True, 'resources': [], 'items': []}):
            self.assertTrue(access.primary(Mock(), fixture, 'read', readonly=True)['success'])
        with patch.object(access, 'request', return_value={'success': True, 'resources': [{'id': 'fabricated'}], 'items': []}):
            with self.assertRaises(Failure):
                access.primary(Mock(), fixture, 'read', readonly=True)

    def test_telegram_metadata_mutation_does_not_assume_a_thread_contract(self):
        kind = next(kind for kind in access.KINDS if kind.binding == 'kickside.telegram.connection:telegram_connection')
        fixture = access.Fixture(kind, 'telegram', 'Telegram', {'connection': True})
        with patch.object(access, 'read', side_effect=[{'name': 'before'}, {'name': 'Telegram edited by write'}]), \
             patch.object(access, 'update') as update, patch.object(access, 'request') as request:
            access.produce_event(Mock(), fixture, 'write')
        update.assert_called_once_with(unittest.mock.ANY, fixture, 'write')
        request.assert_not_called()

    def test_repeated_telegram_edits_have_distinct_observable_names(self):
        kind = next(kind for kind in access.KINDS if kind.binding == 'kickside.telegram.connection:telegram_connection')
        fixture = access.Fixture(kind, 'telegram', 'Telegram', {'connection': True})
        ctx = SimpleNamespace(inst=Mock())
        with patch.object(access, 'request') as request, patch.object(access, 'read'):
            access.update(ctx, fixture, 'write')
            first = request.call_args.args[4]['name']
            access.update(ctx, fixture, 'write')
            second = request.call_args.args[4]['name']
        self.assertNotEqual(first, second)

    def test_skills_install_uses_parameters_from_the_declared_developer_profile(self):
        ctx = SimpleNamespace(inst=Mock())
        parameters = [{'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}]
        with patch.object(access, 'request', return_value={'entry': {'data': {'packages': [
            {'component': 'kickside/skills', 'parameters': parameters}]}}}):
            access.install_package(ctx, 'kickside/skills')
        ctx.inst.install.assert_called_once_with('kickside/skills', parameters=parameters)

    def test_skills_install_does_not_invent_missing_profile_bindings(self):
        ctx = SimpleNamespace(inst=Mock())
        with patch.object(access, 'request', return_value={'entry': {'data': {'packages': []}}}):
            with self.assertRaises(Failure):
                access.install_package(ctx, 'kickside/skills')
        ctx.inst.install.assert_not_called()

    def test_pinned_cascade_checks_refusal_and_unchanged_placement(self):
        ctx = SimpleNamespace(inst=Mock())
        fixture = access.Fixture(access.kind_named('inbox'), 'inbox', 'Inbox', {'scope': 'user'})
        before = {'entry': {'id': 'inbox', 'parent_id': None}}
        with patch.object(access, 'workspace', return_value=before), patch.object(access, 'delete'), \
             patch.object(access, 'component_rows', return_value=[{'component_id': 'inbox', 'parent_id': None}]), \
             patch.object(access, 'request') as request:
            request.side_effect = [{'entry': {'id': 'folder', 'name': 'Destination'}},
                                   {'success': False, 'error': 'this entry is pinned and cannot be moved'}]
            access.cascade(ctx, fixture, 'read')
        self.assertTrue(request.call_args.kwargs['denied'])

    def test_provisioning_login_uses_isolated_browser_storage(self):
        previous, browser, order = Mock(), Mock(), Mock()
        previous.errors = []
        browser.errors = []
        browser.frame.locator.return_value.count.return_value = 0
        from scenarios import Context
        ctx = Context(Mock(cleanup=Cleanup()))
        ctx.browser, ctx.browser_check = previous, Mock(return_value=browser)
        ctx.state = {'access_users': {'read': {'email': 'reader@example.invalid'}}}
        ctx.inst.cleanup.add('browser', previous.close)
        order.attach_mock(previous.close, 'release')
        order.attach_mock(ctx.browser_check, 'create')
        order.attach_mock(browser.login, 'login')
        access.actor_browser(ctx, 'read')
        previous.close.assert_called_once_with()
        ctx.browser_check.assert_called_once_with()
        calls = [call[0] for call in order.mock_calls]
        self.assertLess(calls.index('release'), calls.index('create'))
        self.assertLess(calls.index('create'), calls.index('login'))

    def test_skill_fixture_uses_declared_active_status(self):
        kind = access.kind_named('skill')
        ctx = SimpleNamespace(inst=Mock(), state={'access_declarations': {kind.binding: {'meta': {'class': 'skill'}}}})
        with patch.object(access, 'install_package'), patch.object(access, 'renew'), \
             patch.object(access, 'registry'), patch.object(access, 'request', return_value={'skill_id': 'skill'}) as request:
            access.create(ctx, kind)
        self.assertEqual(request.call_args.args[4]['status'], 'active')

    def test_file_use_fetches_bytes_through_the_declared_workspace_viewer_route(self):
        kind = access.kind_named('file')
        ctx = SimpleNamespace(inst=Mock(base='http://smoke.invalid'), state={'access_users': {'read': {'bearer': 'member'}}})
        fixture = access.Fixture(kind, 'file', 'File', {'upload': 'blob'})
        response = Mock(status=200)
        response.read.return_value = b'Northwind NW-ACCESS-731'
        with patch('urllib.request.urlopen') as opened, patch.object(access, 'read'):
            opened.return_value.__enter__.return_value = response
            self.assertIn('NW-ACCESS-731', access.primary(ctx, fixture, 'read', readonly=True))
        request = opened.call_args.args[0]
        self.assertEqual(request.full_url, 'http://smoke.invalid/api/v1/uploads/blob/raw')
        self.assertEqual(request.get_header('Authorization'), 'Bearer member')

    def test_file_metadata_write_checks_do_not_require_a_thread_event_contract(self):
        fixture = access.Fixture(access.kind_named('file'), 'file', 'File', {'upload': 'blob'})
        with patch.object(access, 'update') as update, patch.object(access, 'request') as request:
            access.produce_event(Mock(), fixture, 'read', denied=True)
        self.assertTrue(update.call_args.kwargs['denied'])
        request.assert_not_called()
