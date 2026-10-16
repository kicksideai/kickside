from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import jsonschema

import scenarios_ai as ai


class KnowledgeCapabilityArgumentsTests(unittest.TestCase):
    def test_manager_calls_the_published_component_id_contract(self):
        kid = 'library-id'
        schema = {'type': 'object', 'properties': {'action': {'type': 'string'},
                  'component_id': {'type': 'string'}}, 'required': ['action'], 'additionalProperties': False}
        rpc = Mock(side_effect=[{'tools': [{'name': 'Knowledge', 'inputSchema': schema}]}, {'tools': []}])
        def tool(rpc, alias, args, label):
            if alias == 'Knowledge':
                jsonschema.validate(args, schema)
                self.assertEqual(args['component_id'], kid)
                return kid
            return ''
        scenario = next(s for s in ai.REGISTRY if s.name == 'ai_knowledge_capability_knowledge_manager')
        with patch.object(ai, 'kb_create', return_value=kid), patch.object(ai, 'kb_ingest'), \
                patch.object(ai, 'mcp', return_value=rpc), patch.object(ai, 'tool_value', side_effect=tool):
            scenario.run(SimpleNamespace())
