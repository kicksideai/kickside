import argparse
import json
import os
import re
from pathlib import Path
import unittest
from unittest.mock import Mock, call, patch

from harness import Cleanup, Redactor, Result, aggregate, select_scenarios, validate_run_root
from scenarios import REGISTRY
from smoke import parser


class RegistryTests(unittest.TestCase):
    def test_unique_names_and_valid_dependencies(self):
        self.assertEqual(len(REGISTRY), len({s.name for s in REGISTRY}))
        known = set()
        for scenario in REGISTRY:
            self.assertLessEqual(set(scenario.requires), known)
            known.add(scenario.name)

    def test_quick_contract(self):
        names = [s.name for s in select_scenarios(REGISTRY, 'quick', [])]
        self.assertEqual(names, ['boot', 'platform_onboarding', 'first_agent', 'chat_streams',
                                 'upload_attach_send', 'kb_cited_answer', 'crm_record', 'restart_continuation'])

    def test_full_contains_quick(self):
        self.assertLess({s.name for s in select_scenarios(REGISTRY, 'quick', [])},
                        {s.name for s in select_scenarios(REGISTRY, 'full', [])})

    def test_selection_includes_prerequisites_in_order(self):
        chosen = select_scenarios(REGISTRY, 'full', ['restart_continuation'])
        self.assertEqual(chosen[-1].name, 'restart_continuation')
        self.assertIn('chat_streams', [s.name for s in chosen])
        self.assertNotIn('kb_cited_answer', [s.name for s in chosen])

    def test_unknown_selection_fails(self):
        with self.assertRaisesRegex(ValueError, 'Unknown scenario'):
            select_scenarios(REGISTRY, 'full', ['typo'])


class ResultsTests(unittest.TestCase):
    def test_skips_are_explicit_and_not_passes(self):
        value = aggregate([Result('chat', 'sqlite', 'skipped: no model configured', 0)])
        self.assertEqual(value, {'passed': 0, 'failed': 0, 'skipped': 1, 'exit_code': 0})

    def test_any_engine_or_cleanup_failure_fails_run(self):
        value = aggregate([Result('boot', 'sqlite', 'passed', 1),
                           Result('boot', 'postgres', 'failed', 2, 'boot error'),
                           Result('cleanup', 'sqlite', 'failed', 1, 'drop error')])
        self.assertEqual(value['failed'], 2)
        self.assertEqual(value['exit_code'], 1)

    def test_json_schema(self):
        self.assertEqual(set(Result('boot', 'sqlite', 'passed', 1).as_dict()),
                         {'scenario', 'engine', 'status', 'duration', 'error', 'evidence_paths', 'features', 'owner', 'blocked_by', 'failure_roots'})

    def test_invalid_status_fails(self):
        with self.assertRaises(ValueError):
            aggregate([Result('boot', 'sqlite', 'unknown', 0)])


class CleanupTests(unittest.TestCase):
    def test_reverse_order_once(self):
        calls = []
        cleanup = Cleanup()
        cleanup.add('temp', lambda: calls.append('temp'))
        cleanup.add('database', lambda: calls.append('database'))
        cleanup.add('process', lambda: calls.append('process'))
        self.assertEqual(cleanup.run(), [])
        self.assertEqual(cleanup.run(), [])
        self.assertEqual(calls, ['process', 'database', 'temp'])

    def test_errors_retained_and_remaining_resources_cleaned(self):
        calls = []
        cleanup = Cleanup()
        cleanup.add('temp', lambda: calls.append('temp'))
        def fail():
            raise RuntimeError('database drop fails')
        cleanup.add('database', fail)
        cleanup.add('process', lambda: calls.append('process'))
        self.assertEqual(cleanup.run(), ['database: RuntimeError: database drop fails'])
        self.assertEqual(calls, ['process', 'temp'])


class RedactionTests(unittest.TestCase):
    def setUp(self):
        self.redactor = Redactor(['test-supersecret'], ['https://model.smoke.example/v1'])

    def test_nested_keys_and_known_secrets(self):
        result = self.redactor.value({'token': 'new-token', 'nested': [{'api_key': 'new-key'}],
                                      'message': 'test-supersecret at https://model.smoke.example/v1'})
        self.assertEqual(result['token'], '[redacted]')
        self.assertEqual(result['nested'][0]['api_key'], '[redacted]')
        self.assertNotIn('test-supersecret', json.dumps(result))
        self.assertNotIn('model.smoke.example', json.dumps(result))

    def test_dynamic_tokens_registered_before_saving(self):
        self.redactor.value({'credential': {'secret': 'fresh-token'}})
        self.assertEqual(self.redactor.text('fresh-token'), '[redacted]')

    def test_url_auth_and_headers(self):
        rendered = self.redactor.text('url?x-auth-token=abc&token=def Authorization: Bearer ghi password=jkl')
        for secret in ['abc', 'def', 'ghi', 'jkl']:
            self.assertNotIn(secret, rendered)

    def test_endpoint_host_and_encoded_secrets(self):
        self.redactor.add('some/key+value')
        self.assertNotIn('model.smoke.example', self.redactor.text('request to model.smoke.example:443'))
        self.assertNotIn('some%2Fkey%2Bvalue', self.redactor.text('some%2Fkey%2Bvalue'))

    def test_empty_values_do_not_replace_every_character(self):
        self.redactor.add('')
        self.assertEqual(self.redactor.text('safe text'), 'safe text')

    def test_structured_response_builds_secret_pattern_once(self):
        value = {'password': 'dynamic/secret+', 'rows': [
            {'message': 'test-supersecret dynamic/secret+ dynamic%2Fsecret%2B'} for _ in range(100)]}
        with patch('harness.re.escape', wraps=re.escape) as escape:
            rendered = self.redactor.value(value)
        self.assertEqual(escape.call_count, len(self.redactor.secrets))
        self.assertEqual(rendered['password'], '[redacted]')
        self.assertTrue(all(row['message'] == '[redacted] [redacted] [redacted]' for row in rendered['rows']))

    def test_text_reuses_secret_pattern_until_a_secret_is_added(self):
        for index in range(50):
            self.redactor.add(f'accumulated-secret-{index}')
        with patch('harness.re.escape', wraps=re.escape) as escape:
            lines = [self.redactor.text(f'log line {index} accumulated-secret-7') for index in range(200)]
            self.assertEqual(escape.call_count, 0)
            self.redactor.add('fresh-secret')
            self.assertEqual(self.redactor.text('fresh-secret accumulated-secret-9'), '[redacted] [redacted]')
        self.assertTrue(all(line.endswith(' [redacted]') for line in lines))

    def test_text_discovers_secrets_registered_during_string_conversion(self):
        redactor = self.redactor
        class Message:
            def __str__(self):
                redactor.add('late-registered-secret')
                return 'late-registered-secret'
        self.assertEqual(redactor.text(Message()), '[redacted]')


class CLITests(unittest.TestCase):
    def test_list_needs_no_runtime_or_secrets(self):
        args = parser().parse_args(['--list'])
        self.assertTrue(args.list)

    def test_modes_are_exclusive(self):
        with self.assertRaises(SystemExit):
            parser().parse_args(['--published', 'latest', '--source', '.'])

    def test_replacements_require_source(self):
        from smoke import validate_args
        with self.assertRaisesRegex(ValueError, 'replace requires --source'):
            validate_args(parser().parse_args(['--published', 'latest', '--replace', 'org/module=path']))

    def test_repository_output_is_rejected(self):
        # Keep this focused on the repository boundary.  A real test-file path
        # lives under the system temporary directory in disposable checkouts,
        # where the earlier safety boundary correctly takes precedence.
        repository = Mock(returncode=0, stderr='', stdout='/worktree\n')
        with patch('harness.subprocess.run', return_value=repository) as run:
            with self.assertRaisesRegex(ValueError, 'outside a git repository'):
                validate_run_root(Path('/safe-smoke-output'))
        run.assert_called_once_with(
            ['git', '-C', '/', 'rev-parse', '--show-toplevel'],
            capture_output=True, text=True, timeout=10)

    def test_system_temp_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'system temporary'):
            validate_run_root(Path('/' + 'tmp') / 'smoke-test')


class BrowserSecurityTests(unittest.TestCase):
    def test_screenshots_mask_all_input_values(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        frame = Mock()
        browser.page = Mock(frames=[frame])
        browser.settle = Mock()
        frame.locator.return_value.all.return_value = []
        browser.inst = Mock()
        browser.inst.root = Path(__file__).resolve().parents[3] / 'scratch-smoke-unit-output'
        browser.inst.evidence.label = 'test'
        browser.inst.redactor.secrets = {'private-model-secret'}
        # Avoid filesystem writes; verify mask construction independently of Chromium.
        with patch.object(Path, 'mkdir'):
            browser.screenshot('masked')
        frame.locator.assert_any_call('input, textarea')


class RuntimeTests(unittest.TestCase):
    def test_published_command_has_root_and_no_replacements(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.config = {'binary': 'wippy', 'published': '0.1.145'}
        inst.engine = 'sqlite'
        inst.port, inst.base, inst.email, inst.password = 12345, 'http://smoke.example:12345', 'admin@smoke.example', 'generated'
        inst.root = Path('/run/smoke-example')
        command = inst.command()
        self.assertEqual(command[command.index('run') + 1], 'kickside/kickside@0.1.145')
        self.assertNotIn('--replace', command)
        self.assertIn('vars.instance_data_dir=/run/smoke-example/data', command)

    def test_latest_uses_hub_resolution(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.config = {'binary': 'wippy', 'published': 'latest'}
        inst.engine = 'sqlite'
        inst.port, inst.base, inst.email, inst.password = 12345, 'http://smoke.example:12345', 'admin@smoke.example', 'generated'
        inst.root = Path('/run/smoke-example')
        command = inst.command()
        self.assertEqual(command[command.index('run') + 1], 'kickside/kickside')

    def test_postgres_drop_only_after_creation(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.db_created = False
        inst.root = Path('/run/smoke-example')
        inst.pg = Mock()
        inst.drop_db()
        inst.pg.assert_not_called()
        inst.db_created, inst.db = True, 'smoke_unit'
        inst.drop_db()
        self.assertEqual(inst.pg.call_count, 2)
        self.assertFalse(inst.db_created)

    def test_drop_failure_remains_failure(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.db_created, inst.db = True, 'smoke_unit'
        inst.pg = Mock(side_effect=RuntimeError('drop failure'))
        with self.assertRaisesRegex(RuntimeError, 'drop failure'):
            inst.drop_db()
        self.assertTrue(inst.db_created)


class LoginReadinessTests(unittest.TestCase):
    def instance(self, responses):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.email, inst.password = 'member@smoke.example', 'secret'
        inst.redactor = Mock()
        inst.request = Mock(side_effect=responses)
        inst.wait = lambda condition, label: condition() or condition()
        return inst

    def test_login_waits_for_explicit_retryable_authority_readiness(self):
        inst = self.instance([{'kind': 'Unavailable', 'retryable': True, 'success': False}, {'token': 'ready'}])
        inst.login()
        self.assertEqual(inst.token, 'ready')
        self.assertEqual(inst.request.call_count, 2)
        inst.redactor.add.assert_called_once_with('ready')

    def test_login_rejects_nonretryable_failures(self):
        inst = self.instance([{'kind': 'Invalid', 'retryable': False, 'error': 'invalid credentials'}])
        with self.assertRaises(RuntimeError):
            inst.login()
        self.assertEqual(inst.request.call_count, 1)


class HubInstallTests(unittest.TestCase):
    def instance(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.await_keeper = Mock()
        return inst

    def test_successful_install_waits_for_keeper_reconciliation_before_callers_continue(self):
        inst = self.instance()
        calls = []
        def request(method, path, body=None, **kwargs):
            calls.append(path)
            if path.endswith('dependencies?entries=0&migrations=1'):
                return {'dependencies': []}
            if path.endswith('/plan'):
                return {'requirements': [], 'install_payload': {'component': 'kickside/automation'}}
            if path.endswith('/install'):
                return {'execution': [{'status': 'completed'}]}
            raise AssertionError(path)
        inst.request = Mock(side_effect=request)
        inst.await_keeper.side_effect = lambda: calls.append('await-keeper')

        inst.install('kickside/automation')

        self.assertEqual(calls, [
            '/api/v1/keeper/hub/dependencies?entries=0&migrations=1',
            '/api/v1/keeper/hub/dependencies/plan',
            '/api/v1/keeper/hub/dependencies/install',
            'await-keeper',
        ])

    def test_install_propagates_keeper_readiness_failure(self):
        inst = self.instance()
        inst.request = Mock(side_effect=[
            {'dependencies': []},
            {'requirements': [], 'install_payload': {'component': 'kickside/automation'}},
            {'execution': [{'status': 'completed'}]},
        ])
        inst.await_keeper.side_effect = RuntimeError('Keeper state reconciliation times out')

        with self.assertRaisesRegex(RuntimeError, 'reconciliation times out'):
            inst.install('kickside/automation')
        inst.await_keeper.assert_called_once_with()

    def test_existing_dependency_needs_no_reinstall(self):
        inst = self.instance()
        inst.request = Mock(return_value={'dependencies': [{'component': 'kickside/crm'}]})
        inst.install('kickside/crm')
        self.assertEqual(inst.request.call_count, 1)

    def test_unresolved_requirements_fail_before_install(self):
        inst = self.instance()
        inst.request = Mock(side_effect=[{'dependencies': []},
            {'requirements': [{'parameter_name': 'target_db', 'missing': True}], 'install_payload': {}}])
        with self.assertRaisesRegex(RuntimeError, 'unresolved requirements: target_db'):
            inst.install('kickside/crm')
        self.assertEqual(inst.request.call_count, 2)

    def test_install_uses_plan_without_pinning_version(self):
        inst = self.instance()
        inst.request = Mock(side_effect=[{'dependencies': []},
            {'requirements': [], 'install_payload': {'component': 'kickside/crm', 'version': 'old-version', 'parameters': []}},
            {'success': True, 'execution': [{'status': 'completed'}]}])
        inst.install('kickside/crm')
        payload = inst.request.call_args_list[-1].args[2]
        self.assertNotIn('version', payload)
        self.assertTrue(payload['run_migrations'])

    def test_historical_baseline_selection_keeps_explicit_parameters(self):
        inst = self.instance()
        parameters = [{'name': 'module:scope', 'value': 'app:user'}]
        inst.request = Mock(side_effect=[{'dependencies': []},
            {'requirements': [], 'install_payload': {'component': 'kickside/module',
                'version': '=0.1.17', 'parameters': []}},
            {'execution': [{'status': 'completed'}]}])
        inst.install('kickside/module', parameters=parameters, version='=0.1.17')
        plan, install = inst.request.call_args_list[1:3]
        self.assertEqual(plan.args[2]['version'], '=0.1.17')
        self.assertEqual(install.args[2]['version'], '=0.1.17')
        self.assertEqual(install.args[2]['parameters'], parameters)

    def test_explicit_host_parameters_reach_the_install_plan(self):
        inst = self.instance()
        parameters = [{'name': 'kickside.transfer:scratch_storage', 'value': 'app:tmp'}]
        inst.request = Mock(side_effect=[{'dependencies': []},
            {'requirements': [], 'install_payload': {'component': 'kickside/transfer', 'parameters': parameters}},
            {'execution': [{'status': 'completed'}]}])
        inst.install('kickside/transfer', parameters=parameters)
        self.assertEqual(inst.request.call_args_list[1].args[2]['parameters'], parameters)
        self.assertEqual(inst.request.call_args_list[2].args[2]['parameters'], parameters)

    def test_install_preserves_explicit_host_values_and_planned_defaults(self):
        inst = self.instance()
        explicit = [{'name': 'module:scope', 'value': 'app:user'},
                    {'name': 'module:discovery_scope', 'value': 'app:restricted'}]
        planned = [{'name': 'module:scope', 'value': 'app:admin'},
                   {'name': 'module:db', 'value': 'app:db'}]
        inst.request = Mock(side_effect=[{'dependencies': []},
            {'requirements': [], 'install_payload': {'component': 'kickside/module', 'parameters': planned}},
            {'execution': [{'status': 'completed'}]}])
        inst.install('kickside/module', parameters=explicit)
        payload = inst.request.call_args_list[-1].args[2]
        self.assertEqual({row['name']: row['value'] for row in payload['parameters']}, {
            'module:scope': 'app:user', 'module:discovery_scope': 'app:restricted', 'module:db': 'app:db'})

    def test_failed_execution_is_a_failure(self):
        inst = self.instance()
        inst.request = Mock(side_effect=[{'dependencies': []}, {'requirements': [], 'install_payload': {}},
            {'success': True, 'execution': [{'status': 'failed', 'error': 'migration error'}]}])
        with self.assertRaisesRegex(RuntimeError, 'migration error'):
            inst.install('kickside/crm')


class ScenarioPrerequisiteTests(unittest.TestCase):
    def test_browser_navigation_scenarios_include_workspace_access(self):
        for name in ('crm_record', 'kb_cited_answer', 'workflow_inbox_restart', 'dashboard', 'provider_dialogs'):
            chosen = select_scenarios(REGISTRY, 'full', [name])
            self.assertIn('first_agent', [item.name for item in chosen], name)

    def test_first_agent_does_not_require_a_model(self):
        self.assertFalse(next(s for s in REGISTRY if s.name == 'first_agent').model)


class ChatComposerTests(unittest.TestCase):
    def test_stream_uses_websocket_progress_when_dom_snapshots_coalesce(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        browser.page = Mock()
        browser.inst = Mock()
        browser.frames, browser.frame_sockets = [], []
        socket = object()
        frame = Mock()
        chat = frame.locator.return_value
        chat.evaluate.side_effect = [
            {'text': '', 'busy': True, 'enabled': False},
            {'text': 'one', 'busy': True, 'enabled': False},
            {'text': 'one READY', 'busy': False, 'enabled': True},
        ]
        chat.locator.return_value.all_text_contents.return_value = []
        chat.get_attribute.return_value = 'unit'
        browser.page.frame_locator.return_value = frame
        def record(data):
            browser.frames.append({'topic': 'session:unit:message:reply', 'data': data})
            browser.frame_sockets.append(socket)

        pumps = 0
        def pump(ms):
            nonlocal pumps
            pumps += 1
            if pumps == 1:
                record({'type': 'received', 'session_id': 'unit', 'message_id': 'prompt',
                        'text': 'Fictional prompt'})
                record({'type': 'response_started', 'session_id': 'unit', 'message_id': 'prompt',
                        'response_id': 'reply'})
            record({'type': 'chunk', 'content': str(pumps)})
            if pumps == 3:
                record({'type': 'content', 'content': 'one READY'})
        browser.page.wait_for_timeout.side_effect = pump
        self.assertEqual(browser.stream('Fictional prompt', 'READY', 'test'),
                         {'updates': 3, 'marker': 'READY'})
        chat.get_by_placeholder.assert_any_call('Type a message', exact=True)
        chat.get_by_label.assert_not_called()
        chat.get_by_placeholder.return_value.press.assert_called_once_with('Enter')

    def test_stream_events_ignore_stale_and_other_session_frames(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        socket = object()
        def frame(session, kind, **data):
            return {'topic': 'session:' + session + ':message:' + data.pop('response', 'reply'),
                    'data': {'session_id': session, 'type': kind, **data}}
        browser.frames = [frame('stale', 'chunk', content='old')]
        browser.frames += [
            {'topic': 'control', 'data': None}, {'topic': 'control', 'data': 'keepalive'},
            frame('other', 'received', message_id='other-prompt', text='Prompt'),
            frame('other', 'response_started', message_id='other-prompt', response_id='other-reply'),
            *[frame('other', 'chunk', response='other-reply', content=str(index)) for index in range(4)],
            frame('other', 'content', response='other-reply', content='READY'),
            frame('unit', 'received', message_id='prompt', text='Prompt'),
            frame('unit', 'response_started', message_id='prompt', response_id='reply'),
            frame('unit', 'chunk', content=''), frame('unit', 'chunk', content='one'),
            frame('unit', 'chunk', content='two'),
        ]
        browser.frame_sockets = [socket] * len(browser.frames)
        self.assertEqual(browser.chat_stream_events(1, 'unit', 'Prompt', 'READY'),
                         {'updates': 2, 'completed': False})


class StructuredLogRedactionTests(unittest.TestCase):
    def test_unknown_credential_fields_in_runtime_text_are_redacted(self):
        redactor = Redactor()
        rendered = redactor.text('{"token":"runtime-token","api_key":"runtime-key","password":"runtime-pass"}')
        for value in ('runtime-token', 'runtime-key', 'runtime-pass'):
            self.assertNotIn(value, rendered)

    def test_jwt_and_database_uri_are_redacted(self):
        redactor = Redactor()
        rendered = redactor.text('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.signature postgres://user:dbsecret@db.smoke.example/smoke')
        self.assertNotIn('dbsecret', rendered)
        self.assertNotIn('eyJzdWIiOiJhZG1pbiJ9', rendered)


class PublishedContractTests(unittest.TestCase):
    def test_public_converters_cover_all_public_formats(self):
        import tempfile
        from scenarios import converters
        with tempfile.TemporaryDirectory() as directory:
            inst = Mock(root=Path(directory))
            (inst.root / 'temp').mkdir()
            inst.upload.return_value = {'uuid': 'converter-unit'}
            inst.request.side_effect = lambda method, path, **kw: {'upload': {'status': 'completed'}} if path.endswith('/converter-unit') else {'primary': {'raw_url': '/primary'}}
            inst.wait.side_effect = lambda condition, label, **kw: condition()
            with patch('scenarios.nav'):
                converters(Mock(inst=inst))
            extensions = {call.args[0].suffix for call in inst.upload.call_args_list}
            self.assertEqual(extensions, {'.pdf', '.txt', '.md', '.html', '.docx', '.xlsx', '.pptx', '.png'})

    def test_research_reads_durable_run_instead_of_chat_session(self):
        from scenarios import research
        inst = Mock()
        inst.request.side_effect = [
            {'success': True, 'research_id': 'research-unit', 'thread_id': 'thread-unit', 'status': 'running'},
            {'success': True, 'run': {'research_id': 'research-unit', 'status': 'complete', 'title': 'Unit research title', 'prompt': 'unit research prompt',
             'result_md': 'Northwind stock includes 47 crates and 12 reserve crates.'},
             'events': [{'type': 'kickside.research.events:result', 'body': {'markdown': 'Northwind stock includes 47 crates and 12 reserve crates.'}}]},
            {'items': [{'research_id': 'research-unit'}]},
        ]
        inst.wait.side_effect = lambda condition, label, **kw: condition()
        ctx = Mock(inst=inst)
        ctx.state = {'agent': 'unit-agent'}
        with patch('playwright.sync_api.expect') as rendered:
            research(ctx)
        paths = [call.args[1] for call in inst.request.call_args_list]
        self.assertIn('/api/v1/research/research-unit/events', paths)
        self.assertNotIn('/api/v1/sessions/messages?session_id=research-unit', paths)
        ctx.browser.frame.locator.assert_called_once_with('research-app .kx-row')
        row = ctx.browser.frame.locator.return_value
        row.locator.assert_any_call('.kx-name')
        row.locator.assert_any_call('.kx-row-head')
        row.locator.assert_any_call('wc-render-markdown')
        rendered.return_value.to_contain_text.assert_has_calls([
            call('47', timeout=30000),
            call('12', timeout=30000),
        ])

    def test_research_terminal_failure_is_retained(self):
        from scenarios import research
        inst = Mock()
        inst.request.side_effect = [
            {'research_id': 'research-unit'},
            {'run': {'status': 'failed'}, 'events': [{'type': 'kickside.research.events:failed', 'body': {'error': 'research failed'}}]},
        ]
        inst.wait.side_effect = lambda condition, label, **kw: condition()
        ctx = Mock(inst=inst)
        ctx.state = {'agent': 'unit-agent'}
        with self.assertRaisesRegex(RuntimeError, 'research failed'):
            research(ctx)


class SessionNavigationTests(unittest.TestCase):
    def test_session_title_selector_allows_metadata_in_row(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        browser.page = Mock()
        browser.inst = Mock()
        browser.inst.request.return_value = {'sessions': [{'session_id': 'unit-session', 'title': 'Northwind chat'}]}
        frame = Mock()
        browser.page.frame_locator.return_value = frame
        browser.open_session('unit-session')
        frame.locator.return_value.first.locator.assert_any_call('.kx-row-main')
        frame.get_by_role.assert_not_called()


class BrowserSettlingTests(unittest.TestCase):
    def test_waits_for_inflight_requests_before_navigation(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        browser.pending = {'request-unit': 'asset'}
        browser.page = Mock()
        def pump(ms):
            browser.pending.clear()
        browser.page.wait_for_timeout.side_effect = pump
        browser.settle()
        browser.page.wait_for_timeout.assert_called()
        self.assertFalse(browser.pending)

    def test_failed_requests_are_removed_and_remain_errors(self):
        from browser import Browser
        browser = Browser.__new__(Browser)
        browser.pending = {'request-unit': 'asset'}
        browser.errors = []
        browser.inst = Mock()
        browser.inst.redactor.text.side_effect = str
        request = Mock(method='GET', url='https://asset.smoke.example/icon', failure='connection fails')
        browser.pending = {request: request.url}
        browser.request_failed(request)
        self.assertFalse(browser.pending)
        self.assertTrue(browser.errors)
        with self.assertRaisesRegex(RuntimeError, 'connection fails'):
            browser.clean(0)


class MCPPolicyTests(unittest.TestCase):
    def test_control_plane_and_allowed_query_are_visible(self):
        from scenarios import assert_scoped_tools
        assert_scoped_tools([{'name': 'session_info'}, {'name': 'list_tools'}, {'name': 'QueryKB'}])

    def test_other_product_tools_fail_policy(self):
        from scenarios import assert_scoped_tools
        with self.assertRaisesRegex(RuntimeError, 'CRMCreateRecord'):
            assert_scoped_tools([{'name': 'QueryKB'}, {'name': 'CRMCreateRecord'}])

    def test_missing_allowed_query_fails(self):
        from scenarios import assert_scoped_tools
        with self.assertRaisesRegex(RuntimeError, 'QueryKB'):
            assert_scoped_tools([{'name': 'session_info'}])


class WebhookSurfaceTests(unittest.TestCase):
    def test_webhooks_use_declared_system_settings_tab(self):
        from scenarios import webhooks
        inst = Mock()
        inst.request.side_effect = [{'webhook': {'webhook_id': 'webhook-unit', 'secret': 'fictional-token'}}] + [{}] * 7
        ctx = Mock(inst=inst)
        webhooks(ctx)
        ctx.browser.frame.get_by_role.assert_any_call('tab', name='Webhooks', exact=True)
        deliveries = [call for call in inst.request.call_args_list if call.kwargs.get('label', '').startswith('webhook-delivery')]
        self.assertTrue(all(call.kwargs['expect'] == (202,) for call in deliveries))
