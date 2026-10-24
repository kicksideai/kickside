import json
import unittest
from pathlib import Path
from types import SimpleNamespace

import yaml
from unittest.mock import Mock
from unittest.mock import patch

import scenarios_automation
import workflow_failure_contract
from cleanup_evidence import own_visible_automation
from harness import Cleanup, Failure


class DispatchWorkflowFixtureTests(unittest.TestCase):
    @staticmethod
    def summary(identifier):
        return {'id': identifier, 'title': identifier, 'source_kind': 'tool', 'tool': True}

    def test_inbox_event_destination_cleanup_uses_durable_component_delete(self):
        for resolved in (False, True):
            with self.subTest(resolved=resolved):
                registered = []

                class Cleanup:
                    def add(self, name, callback, *, scope):
                        registered.append((name, callback, scope))

                created = iter(('primer', 'event-item'))
                pending = {'kickside_components': 1, 'kickside_thread': 1,
                           'kickside_projection': 0, 'kickside_projection_cursor': 0,
                           'kickside_component_thread_reap': 0}
                completed = {table: 0 for table in pending}

                def request(method, path, *args, **kwargs):
                    if method == 'POST' and path == '/api/v1/inbox':
                        return {'item': {'id': next(created)}}
                    if method == 'GET' and path == '/api/v1/inbox?status=pending&limit=200':
                        return {'items': [{'id': 'event-item'}]}
                    if method == 'POST' and path == '/api/v1/inbox/event-item/dismiss':
                        return {}
                    if method == 'DELETE' and path == '/api/v1/threads/destination':
                        return {'success': True, 'cleanup_pending': True, 'in_progress': True,
                                'retryable': True, 'details': {'wait_for': 'lease_release'}}
                    self.fail('Unexpected request: ' + repr((method, path, args, kwargs)))

                def wait(predicate, message, **kwargs):
                    if message == 'Inbox event item projects before resolution':
                        return predicate()
                    self.assertEqual(message, 'Durable bounded cleanup completes')
                    self.assertIsNone(predicate())
                    return predicate()

                inst = SimpleNamespace(cleanup=Cleanup(), request=Mock(side_effect=request),
                                       wait=Mock(side_effect=wait), evidence=Mock())
                ctx = SimpleNamespace(inst=inst)
                with patch('scenarios_crm_chestor.crm_destination', return_value=('destination', {})), \
                     patch('scenarios_crm_chestor.sync_trigger'), \
                     patch('scenarios_crm_chestor.delivered'), \
                     patch('cleanup_evidence.cleanup_rows', side_effect=[
                         {'kickside_components': 1}, pending, completed]):
                    scenarios_automation.inbox_event_delivery(ctx, resolved=resolved)
                    destination_cleanup = next(callback for name, callback, scope in registered
                                               if name == 'Inbox event destination')
                    destination_cleanup()

                inst.request.assert_any_call('DELETE', '/api/v1/threads/destination', expect=(200, 202))
                inst.evidence.save.assert_called_once_with('cleanup-completed-destination', completed)

    def test_sdk_block_catalog_pages_summaries_by_cursor_before_asserting_membership(self):
        ctx = Mock()
        pages = [
            {'blocks': [self.summary('fixture:first')], 'next_cursor': 'fixture:first'},
            {'blocks': [self.summary('fixture:second')], 'next_cursor': 'fixture:second'},
            {'blocks': [self.summary('kickside.code_execution:block.run_code')]},
        ]
        with patch.object(scenarios_automation, 'mint', return_value={'token': 'fixture-token'}), \
             patch.object(scenarios_automation, 'call', side_effect=[{'success': True, 'result': page} for page in pages]) as call:
            scenarios_automation.sdk_blocks(ctx)
        self.assertEqual([item.args[3]['args'] for item in call.call_args_list], [
            {'limit': 25}, {'limit': 25, 'cursor': 'fixture:first'}, {'limit': 25, 'cursor': 'fixture:second'},
        ])
        self.assertIn('return r', call.call_args.args[3]['code'])

    def test_sdk_block_catalog_rejects_nonadvancing_pages(self):
        page = {'blocks': [self.summary('fixture:first')], 'next_cursor': 'fixture:first'}
        with patch.object(scenarios_automation, 'mint', return_value={'token': 'fixture-token'}), \
             patch.object(scenarios_automation, 'call', return_value={'success': True, 'result': page}):
            with self.assertRaisesRegex(Failure, 'advance'):
                scenarios_automation.sdk_blocks(Mock())

    def test_sdk_block_catalog_rejects_identity_only_pages(self):
        page = {'blocks': ['fixture:first']}
        with patch.object(scenarios_automation, 'mint', return_value={'token': 'fixture-token'}), \
             patch.object(scenarios_automation, 'call', return_value={'success': True, 'result': page}):
            with self.assertRaisesRegex(Failure, 'incomplete summaries'):
                scenarios_automation.sdk_blocks(Mock())

    def test_scoped_recommendation_keeps_candidate_scope_in_credential_context(self):
        ctx = Mock()
        ctx.inst.request.return_value = {'tools': [{'id': 'kickside.blocks:list', 'input_schema': {'type': 'object'},
                                                   'output_schema': {'type': 'object'}}]}
        credential = {'token': 'fixture-token'}
        with patch.object(scenarios_automation, 'mint', return_value=credential) as mint, \
             patch.object(scenarios_automation, 'assert_mcp_tool_arguments') as validate, \
             patch.object(scenarios_automation, 'call', return_value={'tools': [{'id': 'kickside.blocks:list',
                 'input_schema': {'type': 'object'}, 'output_schema': {'type': 'object'}}]}) as tool:
            scenarios_automation.code_recommend_scoped(ctx)
        requested = {'need': 'List available executable workflow blocks.', 'fields': ['input_schema', 'output_schema']}
        self.assertEqual(tool.call_args.args[3], requested)
        self.assertEqual(validate.call_args.args[1:],
                         ('fixture-token', 'RecommendTools', requested))
        self.assertEqual(mint.call_args.kwargs['trait_contexts'], {
            'kickside.code_execution.traits:code_execution': {
                'tool_ids': ['kickside.blocks:list', 'kickside.code_execution.traits:run_code_tool'],
            },
        })

    def test_code_assist_bounds_its_catalog_without_allowing_sdk_calls(self):
        ctx = Mock()
        ctx.inst.request.return_value = {
            'validated': True,
            'code': 'local total = 0; for _, order in ipairs(__cx_args.orders) do total = total + order.crates end; return {crates = total}',
        }
        with patch.object(scenarios_automation, 'member_identity', return_value={'token': 'member-token'}), \
             patch.object(scenarios_automation, 'mint', return_value={'token': 'run-code-token'}), \
             patch.object(scenarios_automation, 'call', return_value={'success': True, 'result': {'crates': 48}}):
            scenarios_automation.code_assist(ctx)
        body = ctx.inst.request.call_args.args[2]
        self.assertEqual(body['tool_ids'], ['kickside.blocks:list'])

    def test_code_assist_rejects_sdk_calls_in_a_pure_lua_fixture(self):
        ctx = Mock()
        ctx.inst.request.return_value = {
            'validated': True,
            'code': 'return sdk.tools["kickside.blocks:list"]({})',
        }
        with patch.object(scenarios_automation, 'member_identity', return_value={'token': 'member-token'}), \
             patch.object(scenarios_automation, 'mint', return_value={'token': 'run-code-token'}), \
             patch.object(scenarios_automation, 'call') as call:
            with self.assertRaisesRegex(Failure, 'unexpectedly calls the SDK'):
                scenarios_automation.code_assist(ctx)
        call.assert_not_called()

    def test_workflow_import_uses_the_portable_artifact_from_the_reader_result(self):
        artifact = {
            'api_version': 'kickside.flow/v1', 'kind': 'flow', 'key': 'dispatch', 'title': 'Dispatch',
            'version': 1, 'refs': [], 'document': {'nodes': [], 'edges': []}, 'checksum': '0' * 64,
        }
        manifest = yaml.safe_load((Path(__file__).resolve().parents[3] / 'platform/workflows/src/agent/_index.yaml').read_text())
        declared = next(entry for entry in manifest['entries'] if entry['name'] == 'flows_manage')
        client = Mock()
        client.rpc.return_value = {'tools': [{'name': 'FlowsManage', 'inputSchema': json.loads(declared['meta']['input_schema'])}]}
        request = {'action': 'import', 'flow': artifact}
        with patch.object(scenarios_automation, 'MCPClient', return_value=client):
            scenarios_automation.assert_mcp_tool_arguments(Mock(), 'fixture-token', 'FlowsManage', request)
            with self.assertRaisesRegex(Failure, 'declared MCP schema'):
                scenarios_automation.assert_mcp_tool_arguments(Mock(), 'fixture-token', 'FlowsManage', {
                    'action': 'import', 'flow': {'artifact': artifact},
                })

    def test_mcp_arguments_validate_against_the_published_tool_schema(self):
        inst = Mock()
        schema = {'type': 'object', 'properties': {'need': {'type': 'string'}},
                  'required': ['need'], 'additionalProperties': False}
        client = Mock()
        client.rpc.return_value = {'tools': [{'name': 'RecommendTools', 'inputSchema': schema}]}
        with patch.object(scenarios_automation, 'MCPClient', return_value=client):
            scenarios_automation.assert_mcp_tool_arguments(inst, 'fixture-token', 'RecommendTools', {'need': 'Find tools'})
            with self.assertRaisesRegex(Failure, 'declared MCP schema'):
                scenarios_automation.assert_mcp_tool_arguments(inst, 'fixture-token', 'RecommendTools',
                                                                {'need': 'Find tools', 'tool_ids': []})

    def test_automation_menu_catalog_uses_the_live_installable_type_order(self):
        rows = [
            {'id': 'kickside.channel:responder', 'title': 'Channel Responder', 'installable': True},
            {'id': 'kickside.automation.manual:task', 'title': 'Manual task', 'installable': True},
            {'id': 'kickside.internal:managed', 'title': 'Managed internally', 'installable': False},
            {'id': 'kickside.automation.recurring:task', 'title': 'Recurring task'},
        ]
        self.assertEqual(scenarios_automation.installable_automation_titles(rows), [
            'Channel Responder', 'Manual task', 'Recurring task',
        ])

    def test_automation_menu_catalog_rejects_duplicate_api_or_rendered_titles(self):
        with self.assertRaisesRegex(Failure, 'duplicate'):
            scenarios_automation.installable_automation_titles([
                {'id': 'fixture:first', 'title': 'Repeated'},
                {'id': 'fixture:second', 'title': 'Repeated'},
            ])
        with self.assertRaisesRegex(Failure, 'duplicate'):
            scenarios_automation.require_automation_menu_titles(['Manual task'], ['Manual task', 'Manual task'])

    def test_dispatch_workflow_routes_run_code_error_port_to_error_boundary(self):
        ctx = Mock()
        ctx.inst.request.side_effect = [
            {'flow_id': 'workflow-1'},
            {},
            {'version': 1},
        ]

        scenarios_automation.dispatch_workflow(ctx)

        commands = ctx.inst.request.call_args_list[1].args[2]['commands']
        error_node = next(command['body'] for command in commands
                          if command['type'] == 'node.add' and command['body']['kind'] == 'error')
        self.assertEqual(error_node['config']['error_schema'], {
            'type': 'object',
            'additionalProperties': False,
            'required': ['kind', 'message'],
            'properties': {
                'kind': {'type': 'string'},
                'message': {'type': 'string'},
            },
        })
        self.assertIn({
            'type': 'edge.add',
            'body': {
                'id': 'receipt-code-error',
                'source_id': 'receipt',
                'source_port': 'error',
                'target_id': 'code-error',
                'target_port': 'in',
                'transform': 'output.error',
            },
        }, commands)

    def test_failure_workflow_reuses_dispatch_error_boundary_and_cleanup(self):
        ctx = Mock()
        ctx.inst.request.side_effect = [{}, {'version': 2}]

        with patch('scenarios_automation.dispatch_workflow', return_value=('workflow-1', 1)):
            workflow_id, version, marker = workflow_failure_contract.failure_workflow(ctx)

        self.assertEqual((workflow_id, version), ('workflow-1', 2))
        self.assertTrue(marker.startswith('Northwind missing stock NW-FAIL-'))
        commands = ctx.inst.request.call_args_list[0].args[2]['commands']
        error_update = next(command['body'] for command in commands
                            if command['type'] == 'node.update' and command['body']['id'] == 'code-error')
        self.assertEqual(error_update['config']['error_schema'], {
            'type': 'object',
            'additionalProperties': False,
            'required': ['message'],
            'properties': {
                'code': {'type': 'string'},
                'kind': {'type': 'string'},
                'message': {'type': 'string'},
                'fail': {'type': 'boolean'},
            },
        })
        self.assertFalse(any(command['type'] == 'node.add' and command['body']['kind'] == 'error'
                             for command in commands))
        self.assertIn({
            'type': 'edge.add',
            'body': {
                'id': 'decision-code-error',
                'source_id': 'decision',
                'source_port': 'true',
                'target_id': 'code-error',
                'target_port': 'in',
                'transform': 'output.result',
            },
        }, commands)
        cleanup = ctx.inst.cleanup.add.call_args.args[1]
        with patch.object(workflow_failure_contract, 'delete_workflow') as delete_workflow:
            cleanup()
        delete_workflow.assert_called_once_with(ctx, 'workflow-1')

    def test_schedule_releases_its_viewed_automation_before_owned_cleanup_deletes_it(self):
        inst = Mock(cleanup=Cleanup())
        ctx = SimpleNamespace(inst=inst, browser=Mock())
        calls = []

        def request(method, path, body=None, **kwargs):
            if method == 'POST' and path == '/api/v1/automations':
                return {'id': 'schedule-1'}
            if method == 'GET' and path == '/api/v1/workflows/workflow-1/runs':
                return {'runs': [{'status': 'completed', 'run_id': 'run-1'}]}
            if method == 'GET' and path == '/api/v1/workflows/workflow-1/runs/run-1':
                return {'run': {'output': {'result': {'marker': 'NW-SCHEDULE-DISPATCH', 'crates': 48}}}}
            if method == 'DELETE' and path == '/api/v1/automations/schedule-1':
                self.assertIsNone(ctx.browser, 'Automation deletion leaves the viewed status poller alive')
                calls.append('delete')
                return {'success': True, 'id': 'schedule-1', 'deleted': True}
            if method == 'GET' and path == '/api/v1/automations':
                return {'automations': []}
            raise AssertionError((method, path, body))

        def release(context):
            self.assertIs(context, ctx)
            calls.append('release')
            context.browser = None

        inst.request.side_effect = request
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        ctx.browser.clean.side_effect = lambda start: calls.append('clean')
        with patch.object(scenarios_automation, 'dispatch_workflow', return_value=('workflow-1', 1)), \
             patch.object(scenarios_automation, 'nav') as nav, \
             patch.object(scenarios_automation, 'screen') as screen, \
             patch('cleanup_evidence.Browser.release', side_effect=release):
            scenarios_automation.workflow_launch(ctx)

        nav.assert_called_once_with(ctx, 'Automations')
        screen.assert_called_once_with(ctx, 'northwind-workflow-schedule')
        self.assertEqual(inst.cleanup.run(scope='scenario'), [])
        self.assertEqual(calls, ['clean', 'release', 'delete'])

    def test_visible_automation_cleanup_stays_registered_after_a_delete_failure(self):
        inst = Mock(cleanup=Cleanup())
        ctx = SimpleNamespace(inst=inst, browser=None)
        deletes = []

        def request(method, path, body=None, **kwargs):
            if method == 'DELETE' and path == '/api/v1/automations/schedule-1':
                deletes.append(path)
                if len(deletes) == 1:
                    raise RuntimeError('delete retry')
                return {'success': True, 'id': 'schedule-1', 'deleted': True}
            if method == 'GET' and path == '/api/v1/automations':
                return {'automations': []}
            raise AssertionError((method, path, body))

        inst.request.side_effect = request
        inst.wait.side_effect = lambda predicate, *args, **kwargs: predicate()
        cleanup = own_visible_automation(ctx, 'schedule-1')

        with self.assertRaisesRegex(RuntimeError, 'delete retry'):
            cleanup()
        self.assertEqual(inst.cleanup.run(scope='scenario'), [])
        self.assertEqual(deletes, ['/api/v1/automations/schedule-1'] * 2)


if __name__ == '__main__':
    unittest.main()


class BlockReplacementFixtureTests(unittest.TestCase):
    def test_agent_replacement_reconciles_error_routing_with_live_ports(self):
        class PublishCaptured(Exception):
            pass
        ctx = Mock(state={'model': 'analysis-model'})
        commands = []
        def request(method, path, body=None, **kwargs):
            if path == '/api/v1/workflows/blocks?id=kickside.agents%3Ablock.agent':
                return {'block': {'id': 'kickside.agents:block.agent', 'ports': [
                    {'id': 'result', 'direction': 'out'}, {'id': 'failed', 'direction': 'out'}]}}
            if path.endswith('/state'):
                return {'state': {'nodes': [{'id': 'receipt', 'kind': 'block'}], 'edges': [
                    {'id': 'start-receipt', 'source_id': 'start', 'source_port': 'out', 'target_id': 'receipt', 'target_port': 'in'},
                    {'id': 'receipt-finish', 'source_id': 'receipt', 'source_port': 'result', 'target_id': 'finish', 'target_port': 'in'},
                    {'id': 'receipt-code-error', 'source_id': 'receipt', 'source_port': 'error', 'target_id': 'code-error', 'target_port': 'in'},
                ]}}
            if path.endswith('/apply'):
                commands.extend(body['commands'])
                return {}
            if path.endswith('/publish'):
                raise PublishCaptured
            raise AssertionError(path)
        ctx.inst.request.side_effect = request
        with patch.object(scenarios_automation, 'dispatch_workflow', return_value=('workflow-1', 1)):
            with self.assertRaises(PublishCaptured):
                scenarios_automation.agent_workflow(ctx)
        self.assertIn({'type': 'edge.update', 'body': {'id': 'receipt-code-error', 'source_port': 'failed'}}, commands)
        self.assertIn({'type': 'edge.update', 'body': {'id': 'receipt-finish', 'transform': ''}}, commands)
        self.assertFalse(any(command['type'] in ('edge.remove', 'node.remove') for command in commands))
        self.assertTrue(any(call.args[1] == '/api/v1/workflows/blocks?id=kickside.agents%3Ablock.agent' for call in ctx.inst.request.call_args_list))

    def test_replacement_maps_arbitrary_ports_and_preserves_other_edges(self):
        inst = Mock()
        inst.request.side_effect = [
            {'block': {'id': 'custom:block', 'ports': [
                {'id': 'items', 'direction': 'out'}, {'id': 'refused', 'direction': 'out'}]}},
            {'state': {'nodes': [{'id': 'work', 'kind': 'block'}], 'edges': [
                {'id': 'a', 'source_id': 'work', 'source_port': 'rows'},
                {'id': 'b', 'source_id': 'work', 'source_port': 'refused'},
                {'id': 'c', 'source_id': 'other', 'source_port': 'untouched'},
            ]}}, {},
        ]
        scenarios_automation.replace_workflow_block(inst, 'flow', 'work', 'custom:block',
            title='Replacement', config={'option': True}, port_map={'rows': 'items'}, transforms={'rows': 'input'})
        commands = inst.request.call_args.args[2]['commands']
        self.assertEqual(commands, [
            {'type': 'node.update', 'body': {'id': 'work', 'ref': 'custom:block', 'title': 'Replacement', 'config': {'option': True}}},
            {'type': 'edge.update', 'body': {'id': 'a', 'source_port': 'items', 'transform': 'input'}},
        ])

    def test_replacement_refuses_undeclared_ports_before_mutating_the_graph(self):
        from harness import Failure
        inst = Mock()
        inst.request.side_effect = [
            {'block': {'id': 'custom:block', 'ports': [{'id': 'rows', 'direction': 'out'}]}},
            {'state': {'nodes': [{'id': 'work', 'kind': 'block'}], 'edges': [
                {'id': 'a', 'source_id': 'work', 'source_port': 'error'},
            ]}},
        ]
        with self.assertRaisesRegex(Failure, 'does not declare routed source port'):
            scenarios_automation.replace_workflow_block(inst, 'flow', 'work', 'custom:block',
                title='Replacement', config={}, port_map={'error': 'missing'}, transforms={})
        self.assertTrue(all(call.args[0] == 'GET' for call in inst.request.call_args_list))
