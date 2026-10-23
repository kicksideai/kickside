import unittest
from unittest.mock import Mock, patch
import json

from harness import Failure, Scenario, select_scenarios
from smoke import parser, validate_args


class ChatSelectionTests(unittest.TestCase):
    def setUp(self):
        self.registry = [
            Scenario('setup', 'chat', lambda ctx: None),
            Scenario('command', 'chat', lambda ctx: None, ('setup',), issues=('CHAT-1',)),
            Scenario('quick', 'quick', lambda ctx: None),
            Scenario('regular', 'full', lambda ctx: None, issues=('REGULAR-1',)),
        ]

    def test_regular_tiers_exclude_chat_guards_and_setup(self):
        for tier in ('quick', 'full', 'regression'):
            with self.subTest(tier=tier):
                self.assertFalse({'setup', 'command'} & {
                    row.name for row in select_scenarios(self.registry, tier, [])})

    def test_default_and_regular_runs_exclude_every_registered_chat_scenario(self):
        from smoke import REGISTRY
        chat_names = {row.name for row in REGISTRY if row.tier == 'chat'}
        self.assertTrue(chat_names)
        self.assertEqual(parser().parse_args([]).tier, 'quick')
        for tier in ('quick', 'full', 'regression'):
            with self.subTest(tier=tier):
                self.assertFalse(chat_names & {row.name for row in select_scenarios(REGISTRY, tier, [])})

    def test_opt_in_chat_selects_the_actual_suite_and_its_guards(self):
        from smoke import REGISTRY
        selected = select_scenarios(REGISTRY, 'chat', [])
        self.assertEqual({row.name for row in selected},
                         {row.name for row in REGISTRY if row.tier == 'chat'})
        self.assertEqual({row.name for row in selected if row.owner != 'scenarios_chat'},
                         {'memory_checkpoint_real_chat', 'session_default_checkpoint_real_chat'})
        for row in selected:
            if row.name in {'memory_checkpoint_real_chat', 'session_default_checkpoint_real_chat'}:
                self.assertEqual(row.owner, 'scenarios_session_admission')
                self.assertTrue(row.model)
                self.assertIn('MEMORY-WORKING-CHECKPOINT', row.issues)
        self.assertTrue({'CHAT-KB-CREATE-CATALOG', 'CHAT-EMBEDDING-PREREQUISITE',
                         'CHAT-CAPABILITY-PARTIAL', 'CHAT-UPLOAD-PROVENANCE'} <=
                        {issue for row in selected for issue in row.issues})

    def test_stop_continuation_selects_the_real_model_and_guard(self):
        from smoke import REGISTRY
        selected = select_scenarios(REGISTRY, 'quick', ['chat_stop_continuation_admin'])
        self.assertEqual(['chat_setup', 'chat_stop_continuation_admin'], [row.name for row in selected])
        self.assertTrue(all(row.tier == 'chat' and row.model for row in selected))
        self.assertEqual({'SESSION-CHAT-STOP-CONTINUATION', 'SESSION-STOP-HISTORY-BOUNDARY'},
                         set(selected[-1].issues))

    def test_chat_tier_selects_only_chat(self):
        self.assertEqual([row.name for row in select_scenarios(self.registry, 'chat', [])],
                         ['setup', 'command'])

    def test_named_chat_command_includes_its_setup(self):
        self.assertEqual([row.name for row in select_scenarios(self.registry, 'quick', ['command'])],
                         ['setup', 'command'])

    def test_cli_accepts_explicit_chat_tier_with_both_engines(self):
        args = parser().parse_args(['--tier', 'chat', '--list'])
        self.assertEqual((args.tier, args.engine), ('chat', 'both'))

    def test_published_app_accepts_module_verification_replacements(self):
        args = parser().parse_args(['--published', '0.2.4', '--verify-replacements', '--replace', 'kickside/knowledge=/source'])
        validate_args(args)

    def test_external_chat_target_is_explicit_and_single_engine(self):
        args = parser().parse_args(['--chat-target', 'http://example.invalid', '--tier', 'chat', '--engine', 'sqlite'])
        validate_args(args)
        for arguments in (['--chat-target', 'http://example.invalid'],
                          ['--chat-target', 'http://example.invalid', '--tier', 'chat']):
            with self.subTest(arguments=arguments), self.assertRaises(ValueError):
                validate_args(parser().parse_args(arguments))


class ChatTransportTests(unittest.TestCase):
    def test_relay_welcome_is_received_before_session_open(self):
        from chat_transport import await_relay_welcome
        socket = Mock()
        socket.recv.side_effect = map(json.dumps, [
            {'topic': 'component.changed', 'data': {'component_id': 'inbox'}},
            {'topic': 'welcome', 'data': {'user_id': 'smoke@example.invalid'}},
        ])
        events = []
        await_relay_welcome(socket, events)
        self.assertEqual([event['topic'] for event in events], ['component.changed', 'welcome'])

    def test_persisted_reply_equals_stream_chunks_exactly(self):
        from chat_transport import assert_persisted_reply
        events = [
            {'topic': 'session:own:message:reply', 'data': {'type': 'chunk', 'content': 'Hello'}},
            {'topic': 'session:other:message:reply', 'data': {'type': 'chunk', 'content': 'unrelated'}},
            {'topic': 'session:own:message:reply', 'data': {'type': 'chunk', 'content': ' world'}},
            {'topic': 'session:own:message:reply', 'data': {'session_id': 'own', 'type': 'content',
                                                         'content': 'Hello world', 'using_tools': False}},
        ]
        rows = [{'type': 'user', 'data': 'Hello'}, {'type': 'assistant', 'data': 'Hello world'}]
        self.assertEqual(assert_persisted_reply(events, 'own', rows), 'Hello world')
        for text in ('Hello worldHello world', 'Hello world ', 'Hello'):
            with self.subTest(text=text), self.assertRaisesRegex(Failure, 'persisted assistant'):
                assert_persisted_reply(events, 'own', rows[:-1] + [{'type': 'assistant', 'data': text}])

    def test_terminal_snapshot_does_not_credit_duplicated_content(self):
        from chat_transport import assert_persisted_reply
        events = [
            {'topic': 'session:own:message:reply', 'data': {'type': 'chunk', 'content': 'answer'}},
            {'topic': 'session:own:message:reply', 'data': {'session_id': 'own', 'type': 'content',
                                                         'content': 'answeranswer'}},
        ]
        with self.assertRaisesRegex(Failure, 'streamed text'):
            assert_persisted_reply(events, 'own', [{'type': 'assistant', 'data': 'answeranswer'}])

    def test_attachment_message_preserves_owned_upload_ids(self):
        from chat_transport import message_payload
        payload = message_payload('session', 'Add this document', ['upload'])
        self.assertEqual(payload['type'], 'session_message')
        self.assertEqual(payload['data'], {'text': 'Add this document', 'file_uuids': ['upload']})
        self.assertEqual(payload['session_id'], 'session')

    def test_completion_ignores_other_sessions_and_initial_idle(self):
        from chat_transport import receive_turn
        socket = Mock()
        socket.recv.side_effect = map(json.dumps, [
            {'data': {'session_id': 'own', 'status': 'idle', 'type': 'update'}},
            {'data': {'session_id': 'other', 'type': 'content', 'content': 'wrong'}},
            {'data': {'session_id': 'own', 'type': 'chunk', 'content': 'answer'}},
            {'data': {'session_id': 'other', 'status': 'idle', 'type': 'update'}},
            {'data': {'session_id': 'own', 'type': 'content', 'content': 'answer'}},
            {'data': {'session_id': 'own', 'status': 'idle', 'type': 'update'}},
        ])
        events = []
        self.assertEqual(receive_turn(socket, 'own', events), 'answer')
        self.assertEqual(len(events), 6)

    def test_stream_error_fails_the_command(self):
        from chat_transport import receive_turn
        from harness import Failure
        socket = Mock()
        socket.recv.return_value = json.dumps({'data': {'session_id': 'own', 'type': 'error',
                                                        'error': 'provider unavailable'}})
        with self.assertRaisesRegex(Failure, 'provider unavailable'):
            receive_turn(socket, 'own', [])

    def test_invalidated_response_fails_the_command(self):
        from chat_transport import receive_turn
        socket = Mock()
        socket.recv.return_value = json.dumps({'data': {'session_id': 'own', 'type': 'invalidate',
                                                        'reason': 'model response is unavailable'}})
        with self.assertRaisesRegex(Failure, 'model response is unavailable'):
            receive_turn(socket, 'own', [])


class GroundingTests(unittest.TestCase):
    def test_structured_retrieval_cites_the_passage_containing_the_fact(self):
        from scenarios_chat import assert_grounded
        source = '01a12252-794e-7f11-83e2-cf6acc2fad26'
        result = {'success': True, 'count': 1, 'results': [
            {'id': source, 'content': 'The release code is ORCHID-FACT.',
             'meta': {'node_type': 'chunk'}}]}
        assert_grounded('ORCHID-FACT. Source: ' + source, 'ORCHID-FACT', [result])

    def test_structured_retrieval_rejects_unrelated_or_invented_citations(self):
        from scenarios_chat import assert_grounded
        source = '01a12252-794e-7f11-83e2-cf6acc2fad26'
        other = '01a12252-794e-7f11-83e2-cf6acc2fad27'
        upload = '01a12252-794e-7f11-83e2-cf6acc2fad28'
        result = {'success': True, 'results': [
            {'id': source, 'content': 'The release code is ORCHID-FACT.',
             'meta': {'upload_id': upload}},
            {'id': other, 'content': 'An unrelated document.'}]}
        for citation in ('invented', other, upload, ''):
            with self.subTest(citation=citation), self.assertRaises(Failure):
                assert_grounded('ORCHID-FACT. Source: ' + citation, 'ORCHID-FACT', [result])
        with self.assertRaises(Failure):
            assert_grounded('Wrong fact. Source: ' + source, 'ORCHID-FACT', [result])

    def test_structured_retrieval_requires_passage_content_and_identity(self):
        from scenarios_chat import assert_grounded
        source = '01a12252-794e-7f11-83e2-cf6acc2fad26'
        for row in ({'content': 'ORCHID-FACT'},
                    {'id': source, 'meta': {'description': 'ORCHID-FACT'}}):
            with self.subTest(row=row), self.assertRaises(Failure):
                assert_grounded('ORCHID-FACT. Source: ' + source, 'ORCHID-FACT', [{'results': [row]}])

    def test_citation_identifies_an_actual_retrieved_passage(self):
        from scenarios_chat import assert_grounded
        from harness import Failure
        source = '01a12252-794e-7f11-83e2-cf6acc2fad26'
        result = '## Sources\n- ' + source + ' · Fictional document: ORCHID-FACT'
        assert_grounded('ORCHID-FACT. Source: ' + source, 'ORCHID-FACT', [result])
        for reply in ('ORCHID-FACT. Source: invented', 'ORCHID-FACT', 'Wrong fact. Source: ' + source):
            with self.subTest(reply=reply), self.assertRaises(Failure):
                assert_grounded(reply, 'ORCHID-FACT', [result])


class BrowserReplyTests(unittest.TestCase):
    def browser_context(self, states):
        ctx = Mock()
        browser = ctx.browser_check.return_value
        browser.frames = []
        browser.frame.locator.return_value.evaluate.side_effect = states
        return ctx

    def stream_reply(self, ctx, text):
        frames = ctx.browser_check.return_value.frames
        def deliver(_seconds):
            if not frames:
                frames.extend([
                    {'topic': 'session:session:message:reply', 'data': {'type': 'chunk', 'content': text}},
                    {'topic': 'session:session:message:reply', 'data': {'session_id': 'session',
                     'type': 'content', 'content': text}},
                ])
        ctx.browser_check.return_value.page.wait_for_timeout.side_effect = deliver

    def test_browser_waits_for_durable_reply_after_idle_between_tools(self):
        from scenarios_chat import browser_command
        idle = {'busy': False, 'enabled': True, 'text': 'Previous answer'}
        ctx = self.browser_context([dict(idle, busy=True), idle, idle])
        pending = [{'type': 'user', 'message_id': 'new', 'data': 'Add attachment'},
                   {'type': 'assistant', 'data': 'I add the document now'},
                   {'type': 'function', 'data': '{}'}]
        complete = pending + [{'type': 'assistant', 'data': 'Document added'}]
        self.stream_reply(ctx, 'Document added')
        with patch('scenarios_chat.messages', side_effect=[[], pending, complete]) as fetch:
            reply, transcript, session_id = browser_command(ctx, 'Add attachment', session_id='session')
        self.assertEqual((reply, transcript, session_id), ('Document added', complete, 'session'))
        self.assertEqual(fetch.call_count, 3)

    def test_browser_does_not_accept_previous_reply_for_repeated_prompt(self):
        from scenarios_chat import browser_command
        idle = {'busy': False, 'enabled': True, 'text': 'Previous answer'}
        ctx = self.browser_context([dict(idle, busy=True), idle, idle])
        previous = [{'type': 'user', 'message_id': 'old', 'data': 'List files'},
                    {'type': 'assistant', 'data': 'Previous answer'}]
        complete = previous + [{'type': 'user', 'message_id': 'new', 'data': 'List files'},
                               {'type': 'assistant', 'data': 'Current answer'}]
        self.stream_reply(ctx, 'Current answer')
        with patch('scenarios_chat.messages', side_effect=[previous, previous, complete]):
            reply, transcript, _ = browser_command(ctx, 'List files', session_id='session')
        self.assertEqual((reply, transcript), ('Current answer', complete))

    def test_browser_missing_reply_fails_at_existing_deadline_with_evidence(self):
        from scenarios_chat import browser_command
        idle = {'busy': False, 'enabled': True, 'text': 'Previous answer'}
        ctx = self.browser_context([dict(idle, busy=True), idle])
        pending = [{'type': 'user', 'message_id': 'new', 'data': 'Add attachment'}]
        with patch('scenarios_chat.messages', side_effect=[[], pending, pending]), \
                patch('scenarios_chat.time.monotonic', side_effect=[0, 1, 2, 180]):
            with self.assertRaisesRegex(Failure, 'within 180 seconds'):
                browser_command(ctx, 'Add attachment', session_id='session')
        evidence = {call.args[0].rsplit('-', 1)[-1]: call.args[1]
                    for call in ctx.inst.evidence.save.call_args_list}
        self.assertEqual(evidence['stream'], [])
        self.assertEqual(evidence['transcript']['messages'], pending)

    def test_reply_excludes_previous_turn_success(self):
        from chat_transport import completed_reply
        rows = [{'type': 'user', 'data': 'Create'},
                {'type': 'assistant', 'data': 'Created successfully'},
                {'type': 'user', 'data': 'Add attachment'},
                {'type': 'function', 'data': '{}'},
                {'type': 'assistant', 'data': 'Attachment ingestion fails'}]
        self.assertEqual(completed_reply(rows), 'Attachment ingestion fails')

    def test_reply_requires_a_completed_assistant_in_this_turn(self):
        from chat_transport import completed_reply
        from harness import Failure
        rows = [{'type': 'user', 'data': 'Create'},
                {'type': 'assistant', 'data': 'Created successfully'},
                {'type': 'user', 'data': 'Add attachment'}]
        with self.assertRaises(Failure):
            completed_reply(rows)

    def test_reply_requires_completion_after_a_tool_call(self):
        from chat_transport import completed_reply
        pending = [{'type': 'user', 'data': 'Search'},
                   {'type': 'assistant', 'data': 'I search the knowledge base'},
                   {'type': 'function', 'data': '{}'}]
        with self.assertRaises(Failure):
            completed_reply(pending)
        self.assertEqual(completed_reply(pending + [{'type': 'assistant', 'data': 'Passage found'}]),
                         'Passage found')


class ExistingMCPEffectTests(unittest.TestCase):
    def test_expected_reply_cannot_replace_owning_api_effect(self):
        from unittest.mock import patch
        from scenarios_chat import remote_mcp
        from harness import Failure
        ctx = Mock()
        ctx.inst.config = {'external': True}
        ctx.inst.request.return_value = {'note': 'unchanged'}
        transcript = [{'type': 'user', 'data': 'Write note'},
                      {'type': 'function', 'data': '{"action":"activate"}',
                       'metadata': {'function_name': 'Capabilities', 'status': 'success'}}]
        profile = {'SMOKE_CHAT_MCP_CONNECTION_ID': 'owned',
                   'SMOKE_CHAT_MCP_EXPECTED_TEXT': 'LANTERN-MCP',
                   'SMOKE_CHAT_MCP_COMMAND': 'Write and read the note',
                   'SMOKE_CHAT_MCP_EFFECT_PATH': '/api/v1/owned/packing-note'}
        with patch.dict('os.environ', profile), \
                patch('scenarios_chat.api_command', return_value=('LANTERN-MCP', transcript, 'session')):
            with self.assertRaisesRegex(Failure, 'owning API'):
                remote_mcp(ctx)


class AnswerTurnTests(unittest.TestCase):
    def test_previous_retrieval_does_not_credit_an_uncited_answering_turn(self):
        from scenarios_chat import answer_effect
        from harness import Failure
        rows = [{'type': 'user', 'data': 'Search'},
                {'type': 'function', 'data': '{"kb_id":"kb"}',
                 'metadata': {'function_name': 'QueryKB', 'status': 'success', 'result': 'ORCHID-FACT'}},
                {'type': 'user', 'data': 'Answer'},
                {'type': 'assistant', 'data': 'ORCHID-FACT'}]
        with self.assertRaisesRegex(Failure, 'no knowledge base retrieval'):
            answer_effect('ORCHID-FACT', rows, 'kb', 'ORCHID-FACT')


class HubOutcomeTests(unittest.TestCase):
    def test_hub_inventory_uses_the_host_browser_and_preserves_owning_versions(self):
        from unittest.mock import patch
        from scenarios_chat import hub
        ctx = Mock()
        ctx.inst.token = 'admin'
        ctx.state = {'chat_admin': {'token': 'admin'}}
        ctx.inst.request.return_value = {'modules': [{'name': 'acme/example', 'version': '1.2.3'}]}
        transcript = [{'type': 'function', 'data': '{}',
                       'metadata': {'status': 'success', 'registry_id': 'keeper.hub.tools:dependencies'}}]
        with patch('scenarios_chat.api_command', side_effect=AssertionError('Hub bypasses Host chat')), \
                patch('scenarios_chat.browser_command', return_value=('acme/example 1.2.3', transcript, 'session')) as command:
            hub(ctx)
            command.assert_called_once_with(ctx, 'List all installed Hub modules and their exact installed versions, one module per line.')

    def test_installed_names_do_not_credit_invented_versions(self):
        from unittest.mock import patch
        from scenarios_chat import hub
        from harness import Failure
        ctx = Mock()
        ctx.inst.token = 'admin'
        ctx.state = {'chat_admin': {'token': 'admin'}}
        ctx.inst.request.return_value = {'modules': [
            {'name': 'kickside/kb10', 'version': '0.2.2'},
            {'name': 'kickside/knowledge', 'version': '0.1.26'}]}
        transcript = [{'type': 'function', 'data': '{}',
                       'metadata': {'status': 'success', 'registry_id': 'keeper.hub.tools:dependencies'}}]
        with patch('scenarios_chat.browser_command', return_value=(
                'kickside/kb10 9.0.0\nkickside/knowledge 8.0.0', transcript, 'session')):
            with self.assertRaisesRegex(Failure, 'owning API version'):
                hub(ctx)
