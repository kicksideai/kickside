from pathlib import Path
from contextlib import nullcontext
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from harness import Failure
import scenarios_security_model as model


class PublishedBindings(unittest.TestCase):
    def test_hub_update_preserves_an_explicit_nondefault_member_binding(self):
        from unittest.mock import Mock, patch
        from tests.test_endpoint_policy_components import entries, module_repositories, module_sources
        modules = module_sources(module_repositories())
        host_values = {'http.router': 'app:api', 'http.service': 'app:gateway',
                       'db.sql': 'app:db', 'process.host': 'app:processes',
                       'security.scope': 'app.security:admin'}
        inst = Mock()
        installed = {}
        inst.install.side_effect = lambda module, parameters=None: installed.update({module: parameters})
        def request(method, path, body, **kwargs):
            module = body['component']
            if kwargs['label'].endswith('-host-plan'):
                requirements = []
                for identifier, entry in entries(modules[module] / 'src').items():
                    if entry['kind'] != 'ns.requirement':
                        continue
                    kind = entry.get('meta', {}).get('value_kind')
                    if kind in host_values:
                        default = entry.get('default', host_values[kind])
                        requirements.append({'module': module, 'name': identifier.split(':')[1],
                            'full_id': identifier, 'expected_kind': kind, 'default': default,
                            'value': default, 'value_source': 'default',
                            'missing': False, 'invalid': False})
                return {'requirements': requirements}
            identifier = module.replace('/', '.') + '.security:user_security_scope'
            default = 'kickside.security.groups:members'
            parameters = installed.get(module)
            return {'requirements': [{'module': module, 'name': 'user_security_scope',
                'full_id': identifier, 'expected_kind': 'security.scope', 'default': default,
                'value': parameters[0]['value'] if parameters else default,
                'value_source': 'existing' if parameters else 'default',
                'missing': False, 'invalid': False}]}
        inst.request.side_effect = request
        inst.cleanup.run.return_value = []
        ctx = SimpleNamespace(inst=SimpleNamespace(config={}, engine='sqlite',
            evidence=Mock(root=Path('fixture'), label='binding')))
        with patch('runtime.Instance', return_value=inst):
            model.hub_requirement_defaults(ctx)
        self.assertEqual(len(installed), 3)
        self.assertEqual(sum(call.kwargs['label'].endswith('-host-plan')
                             for call in inst.request.call_args_list), 8)
        for module, parameters in installed.items():
            self.assertEqual(parameters, [{'name': module.replace('/', '.') + '.security:user_security_scope',
                                          'value': 'app.security:members'}])

    def test_probe_rebuilds_after_scenario_state_rolls_back(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            ctx = SimpleNamespace(state={}, inst=SimpleNamespace(app=app), paused=nullcontext)
            model.install_probe(ctx)
            fixture = app / 'src/security-model-probe'
            expected = {path.name: path.read_bytes() for path in fixture.iterdir()}
            ctx.state.clear()
            (fixture / 'probe.lua').write_text('incomplete prior attempt')
            model.install_probe(ctx)
            self.assertEqual({path.name: path.read_bytes() for path in fixture.iterdir()}, expected)
            self.assertTrue(ctx.state['security_model_probe'])

    def test_probe_retry_preserves_a_source_copy_failure(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src/security-model-probe').mkdir(parents=True)
            ctx = SimpleNamespace(state={}, inst=SimpleNamespace(app=app), paused=nullcontext)
            with patch.object(model.shutil, 'copyfile', side_effect=OSError('fixture source unreadable')):
                with self.assertRaisesRegex(OSError, 'fixture source unreadable'):
                    model.install_probe(ctx)
            self.assertNotIn('security_model_probe', ctx.state)

    def test_module_groups_install_through_declared_requirement_defaults(self):
        installed = []
        inst = SimpleNamespace(install=lambda module, parameters=None: installed.append((module, parameters)),
                               request=lambda *args, **kwargs: {'policies': []})
        ctx = SimpleNamespace(inst=inst, state={'security_model_probe': True})
        with self.assertRaisesRegex(Failure, 'Excluded module has no selectable policy'):
            model.scope_without(ctx, 'kickside.crm')
        self.assertEqual(installed, [('kickside/crm', None), ('chestor/workspace', None),
                                    ('kickside/knowledge', None), ('kickside/mcp', None)])

    def test_member_first_agent_waits_for_its_composer_without_reloading_away_start_intent(self):
        """The shell keeps a just-created agent's start token only in SPA state."""
        stop = RuntimeError('stream reached')
        policies = [{'id': 'security.model:crm', 'intent': 'module_access', 'surface': 'kickside.crm'}]
        policies += [{'id': 'security.model:module_' + str(index), 'intent': 'module_access',
                      'surface': 'kickside.module_' + str(index)} for index in range(12)]
        tokens = iter(('initial-token', 'narrow-token'))
        groups = {'scope-a', 'scope-b', 'app.security:user'}

        def request(method, path, body=None, *, auth=None, expect=None, **kwargs):
            if path == '/api/v1/security/policies':
                return {'policies': policies}
            if method == 'POST' and path == '/api/v1/users':
                return {'user': {'user_id': 'member'}}
            if method == 'POST' and path == '/api/public/user/token':
                return {'token': next(tokens)}
            if path == '/api/v1/user/me':
                if expect == (401,):
                    return {}
                if auth == 'initial-token':
                    return {'security': {'groups': ['app.security:members']}}
                return {'security': {'groups': list(groups)}, 'user': {'metadata': {
                    'scope_id': 'kickside.security.scopes:set_' + 'a' * 64}}}
            if path.startswith('/api/v1/security-model/inspect'):
                return {'excluded_routes': [{'id': 'forbidden', 'method': 'GET', 'path': '/api/v1/forbidden'}],
                        'excluded_entries': [{'id': 'forbidden.entry'}]}
            if path == '/api/v1/security-model/visible':
                return {'entries': []}
            if path == '/api/v1/agents/traits':
                return {'traits': []}
            if method == 'POST' and path == '/api/v1/mcp/credentials':
                return {'credential': {'token': 'credential-token'}}
            return {}

        inst = Mock()
        inst.password = 'password'
        inst.request.side_effect = request
        sidebar, splash, chat, composer = Mock(), Mock(), Mock(), Mock()
        splash.count.return_value = 1
        splash.is_visible.return_value = True
        splash.get_by_label.return_value = Mock()
        splash.get_by_role.return_value = Mock()
        browser = Mock()
        browser.frame.locator.side_effect = lambda selector: {
            '.sidebar': sidebar, 'kickside-agent-onboarding': splash, 'wippy-chat': chat,
        }[selector]
        chat.get_by_placeholder.return_value = composer
        browser.stream.side_effect = stop
        ctx = SimpleNamespace(inst=inst, state={'security_model_probe': True}, browser_check=Mock(return_value=browser))
        client = Mock()
        client.tools.return_value = ['FindKnowledgeBases']

        with patch('scenarios_security_ui.compose_scope', side_effect=['scope-a', 'scope-b']), \
                patch('scenarios_security_ui.assign_scopes'), \
                patch.object(model, 'MCPClient', return_value=client), \
                patch.object(model, 'denied'), \
                patch.object(model.Browser, 'release'), \
                patch('playwright.sync_api.expect') as expect:
            with self.assertRaisesRegex(RuntimeError, 'stream reached'):
                model.scope_without(ctx, 'kickside.crm', split_groups=True)

        splash.get_by_role.return_value.click.assert_called_once_with()
        composer.wait_for.assert_called_once_with(timeout=30000)
        chat.wait_for.assert_not_called()
        browser.reload.assert_not_called()
        expect.return_value.to_be_visible.assert_any_call(timeout=30000)
        browser.stream.assert_called_once()

    def test_probe_methods_receive_the_shared_source_dependencies(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            ctx = SimpleNamespace(state={}, inst=SimpleNamespace(app=app), paused=nullcontext)
            model.install_probe(ctx)
            entries = yaml.safe_load((app / 'src/security-model-probe/_index.yaml').read_text())['entries']
            methods = [entry for entry in entries if entry.get('source') == 'file://probe.lua']
            self.assertTrue(methods)
            for entry in methods:
                self.assertEqual(set(entry['modules']), {'http', 'registry', 'security'}, entry['name'])
                self.assertEqual(entry['imports']['execution_identity'],
                                 'kickside.execution:execution_identity', entry['name'])

    def test_probe_compares_only_the_declared_historical_surface(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            ctx = SimpleNamespace(state={}, inst=SimpleNamespace(app=app), paused=nullcontext)
            model.install_probe(ctx)
            entries = yaml.safe_load((app / 'src/security-model-probe/_index.yaml').read_text())['entries']
            historical = next(entry for entry in entries if entry['name'] == 'historical')
            self.assertEqual(historical['kind'], 'registry.entry')
            self.assertGreater(len(historical['ids']), 1000)
            self.assertNotIn('kickside.security.groups:members_composition', historical['ids'])
            self.assertIn('kickside.crm:definition', historical['ids'])

    def test_rebinds_existing_root_dependencies_before_module_installation(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            source = app / 'src'
            source.mkdir()
            index = source / '_index.yaml'
            index.write_text(yaml.safe_dump({'namespace': 'app.deps', 'entries': [{
                'name': 'accounts', 'kind': 'ns.dependency', 'component': 'acme/accounts',
                'parameters': [{'name': 'user_security_scope', 'value': 'app.security:members'},
                               {'name': 'database', 'value': 'app:db'}]}]}))
            bindings = [{'component': 'acme/accounts', 'parameters': [{
                'name': 'acme.accounts.security:user_security_scope', 'value': 'app.security:user'}]}]
            model.apply_dependency_bindings(app, bindings)
            entry = yaml.safe_load(index.read_text())['entries'][0]
            self.assertEqual(entry['name'], 'accounts')
            self.assertEqual(entry['parameters'], [
                {'name': 'database', 'value': 'app:db'}, *bindings[0]['parameters']])

    def test_rejects_a_fixture_binding_that_the_root_does_not_declare(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(Failure):
                model.apply_dependency_bindings(Path(directory), [{
                    'component': 'acme/absent', 'parameters': [{'name': 'scope', 'value': 'app:user'}]}])

    def test_published_bare_bindings_replace_the_same_qualified_root_requirement(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            index = app / 'src/_index.yaml'
            index.write_text(yaml.safe_dump({'entries': [{
                'name': 'accounts', 'kind': 'ns.dependency', 'component': 'acme/accounts',
                'parameters': [
                    {'name': 'acme.accounts:user_security_scope', 'value': 'app.security:members'},
                    {'name': 'other.package:user_security_scope', 'value': 'other:members'},
                    {'name': 'database', 'value': 'app:db'},
                ]}]}))
            bindings = [{'component': 'acme/accounts', 'parameters': [
                {'name': 'user_security_scope', 'value': 'app.security:user'}]}]
            model.apply_dependency_bindings(app, bindings)
            entry = yaml.safe_load(index.read_text())['entries'][0]
            self.assertEqual(entry['parameters'], [
                {'name': 'other.package:user_security_scope', 'value': 'other:members'},
                {'name': 'database', 'value': 'app:db'}, *bindings[0]['parameters']])
