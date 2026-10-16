import json
import unittest
from pathlib import Path

import yaml
from unittest.mock import Mock
from unittest.mock import patch

import scenarios_automation
import workflow_failure_contract
from harness import Failure


class DispatchWorkflowFixtureTests(unittest.TestCase):
    @staticmethod
    def summary(identifier):
        return {'id': identifier, 'title': identifier, 'source_kind': 'tool', 'tool': True}

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
