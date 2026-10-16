import unittest
from unittest.mock import Mock

from scenarios_providers import research_workflow_fixture


class ResearchWorkflowFixtureTests(unittest.TestCase):
    def test_research_graph_uses_the_selected_block_from_creation(self):
        for provider in ('phantombuster', 'webscout'):
            with self.subTest(provider=provider):
                ctx = Mock()
                schema = {'type': 'object', 'required': ['operation']}
                ref = 'kickside.' + provider + '.research:block.source'
                config = Mock(return_value={'owner_component_id': 'workflow-id'})
                applied = []

                def request(method, path, body=None, **kwargs):
                    if path == '/api/v1/workflows':
                        return {'flow_id': 'workflow-id'}
                    if path.startswith('/api/v1/keeper/registry/entry?id='):
                        self.assertEqual(path.split('id=')[1], ref)
                        return {'entry': {'data': {'block': {'input': schema}}}}
                    if path.endswith('/apply'):
                        applied.extend(body['commands'])
                        return {'success': True}
                    if path.endswith('/publish'):
                        return {'version': 1}
                    self.fail('Unexpected fixture request: ' + method + ' ' + path)

                ctx.inst.request.side_effect = request
                self.assertEqual(research_workflow_fixture(ctx, provider, config), ('workflow-id', 1))
                config.assert_called_once_with('workflow-id')
                nodes = {c['body']['id']: c['body'] for c in applied if c['type'] == 'node.add'}
                self.assertEqual(set(nodes), {'start', 'receipt', 'finish'})
                self.assertEqual(nodes['receipt']['ref'], ref)
                self.assertEqual(nodes['receipt']['config'], config.return_value)
                self.assertEqual(nodes['start']['config']['input_schema'], schema)
                edges = [c['body'] for c in applied if c['type'] == 'edge.add']
                self.assertEqual([(e['source_id'], e['source_port'], e['target_id']) for e in edges],
                                 [('start', 'out', 'receipt'), ('receipt', 'result', 'finish')])
                self.assertEqual(edges[1].get('transform', ''), '')
                ctx.inst.cleanup.add.assert_called_once()
