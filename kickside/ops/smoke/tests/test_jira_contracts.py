import unittest
from harness import Failure
from jira_contracts import assert_tool_turn, assert_documents, assert_paused_drive, assert_discord_reply, assert_sync_config, assert_responder_failure, assert_responder_tool_failure
from mocks.jira_network import jira_endpoints


class JiraRegressionContracts(unittest.TestCase):
    def test_capability_actions_keep_selected_and_managed_capabilities_disabled(self):
        from jira_contracts import assert_capability_action
        states = (
            {'label': 'Add capability', 'disabled': False, 'active': False},
            {'label': 'Capability added', 'disabled': True, 'active': True},
            {'label': 'Managed in agent settings', 'disabled': True, 'active': False},
        )
        for state in states:
            assert_capability_action(state)
            with self.assertRaises(Failure):
                assert_capability_action({**state, 'disabled': not state['disabled']})
        for state in ({**states[0], 'active': True}, {**states[1], 'active': False},
                      {**states[2], 'active': True}, {**states[0], 'label': 'Unknown action'}):
            with self.assertRaises(Failure):
                assert_capability_action(state)

    def test_only_native_provider_endpoints_use_loopback_fixtures(self):
        endpoints = jira_endpoints({'fireflies': 'http://127.0.0.1:1001',
                                   'discord': 'http://127.0.0.1:1002', 'google': 'http://127.0.0.1:1003'})
        self.assertEqual(endpoints['kickside.fireflies:endpoint_api'], 'http://127.0.0.1:1001/graphql')
        self.assertEqual(endpoints['kickside.discord:endpoint_api'], 'http://127.0.0.1:1002/api/v10')
        self.assertEqual(endpoints['kickside.google:endpoint_token'], 'http://127.0.0.1:1003/token')
        self.assertTrue(all(value.startswith('http://127.0.0.1:') for value in endpoints.values()))
        self.assertFalse(any('sso.' in key or 'github' in key for key in endpoints))
        with self.assertRaises(ValueError):
            jira_endpoints({'fireflies': 'https://api.fireflies.ai', 'discord': 'http://127.0.0.1:1002', 'google': 'http://127.0.0.1:1003'})

    def test_tool_error_requires_observable_failure_and_a_finished_interactive_turn(self):
        state = {'enabled': True, 'busy': False, 'text': 'An actionable tool failure is visible'}
        assert_tool_turn(state, {'tool-1'}, 1, 1)
        for invalid in ({**state, 'busy': True}, {**state, 'enabled': False}, {**state, 'text': ''}):
            with self.assertRaises(Failure):
                assert_tool_turn(invalid, {'tool-1'}, 1, 1)
        for ids, badges, failed in ((set(), 0, 0), ({str(i) for i in range(5)}, 5, 1), ({'tool-1'}, 1, 0)):
            with self.assertRaises(Failure):
                assert_tool_turn(state, ids, badges, failed)

    def test_document_count_does_not_replace_exact_upload_provenance(self):
        result = {'success': True, 'total': 2, 'nodes': [
            {'id': 'doc-1', 'metadata': {'upload_id': 'upload-1'}},
            {'id': 'doc-2', 'metadata': {'upload_id': 'upload-2'}},
        ]}
        assert_documents(result, {'upload-1', 'upload-2'})
        with self.assertRaises(Failure):
            assert_documents({**result, 'nodes': result['nodes'][:1]}, {'upload-1', 'upload-2'})
        with self.assertRaises(Failure):
            assert_documents(result, {'upload-1', 'missing'})
        with self.assertRaises(Failure):
            assert_documents({**result, 'success': False}, {'upload-1', 'upload-2'})

    def test_pause_requires_the_main_drive_to_be_disabled_and_paused(self):
        assert_paused_drive({'success': True, 'drives': [{'drive_key': 'main', 'enabled': False, 'phase': 'paused'}]})
        for drive in ({'drive_key': 'main', 'enabled': True, 'phase': 'paused'},
                      {'drive_key': 'main', 'enabled': False, 'phase': 'active'},
                      {'drive_key': 'other', 'enabled': False, 'phase': 'paused'}):
            with self.assertRaises(Failure):
                assert_paused_drive({'success': True, 'drives': [drive]})

    def test_discord_reply_requires_a_message_write_to_the_configured_channel(self):
        rows = [{'method': 'POST', 'path': '/api/v10/channels/NW/messages', 'status': 200, 'body': {'content': 'A fixture reply'}}]
        self.assertTrue(assert_discord_reply(rows, 'NW'))
        for changed in ({'status': 401}, {'method': 'GET'}, {'path': '/api/v10/channels/other/messages'}, {'body': {'content': ''}}):
            self.assertFalse(assert_discord_reply([{**rows[0], **changed}], 'NW'))

    def test_responder_failure_requires_a_rejection_and_persisted_health(self):
        failure = {'success': False, 'accepted': False, 'status': 'error', 'reason': 'agent_missing',
                   'error': 'Configured agent no longer exists', 'health_reported': True}
        self.assertEqual(assert_responder_failure(failure), failure['error'])
        for changed in ({'success': True}, {'accepted': True}, {'status': 'routed'}, {'reason': ''},
                        {'error': ''}, {'health_reported': False}):
            with self.assertRaises(Failure):
                assert_responder_failure({**failure, **changed})

    def test_responder_tool_failure_requires_structured_domain_error(self):
        failure = {'success': False, 'accepted': False, 'status': 'error', 'reason': 'agent_missing',
                   'error': 'Configured agent no longer exists', 'health_reported': True}
        result = {'isError': True, 'structuredContent': failure}
        self.assertEqual(assert_responder_tool_failure(result), failure['error'])
        for changed in ({'isError': False}, {'structuredContent': None},
                        {'structuredContent': {**failure, 'health_reported': False}}):
            with self.assertRaises(Failure):
                assert_responder_tool_failure({**result, **changed})

    def test_sync_requires_enabled_canonical_drive_and_exact_stored_destination(self):
        declaration = {'enabled': True, 'sink_port': 'kickside.knowledge.sink:kb_embed', 'sink_config': {'kb_ids': ['kb-1']}}
        config = {'success': True, 'config': {'enabled': True, '_portable_input': declaration}}
        status = {'success': True, 'drives': [{'drive_key': 'main', 'enabled': True}]}
        assert_sync_config(config, status, 'kb-1')
        for invalid in ({**config, 'success': False}, {'success': True, 'config': {'enabled': False, '_portable_input': declaration}},
                        {'success': True, 'config': {'enabled': True, '_portable_input': {**declaration, 'sink_config': {'kb_ids': ['other']}}}}):
            with self.assertRaises(Failure):
                assert_sync_config(invalid, status, 'kb-1')
        with self.assertRaises(Failure):
            assert_sync_config(config, {'success': True, 'drives': [{'drive_key': 'main', 'enabled': False}]}, 'kb-1')
