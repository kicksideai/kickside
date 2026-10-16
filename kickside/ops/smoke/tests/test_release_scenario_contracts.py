import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
from mcp_client import MCPClient
import module_lifecycle_contract
import scenarios_automation as automation
import scenarios_core as core


class ReleaseScenarioContracts(unittest.TestCase):
    def test_large_code_result_requires_the_complete_native_value(self):
        payload = 'Northwind 😀\n' * 12000
        result = {'success': True, 'result': payload}
        client = SimpleNamespace(call=Mock(side_effect=AssertionError('Native result uses its raw tool receipt')),
            tool_result=Mock(return_value={'content': [{'type': 'text', 'text': json.dumps(result)}]}),
            text=MCPClient.text, decode_text=MCPClient.decode_text)
        ctx = SimpleNamespace(inst=Mock())
        with patch.object(automation, 'mint', return_value={'token': 'fixture'}), \
             patch.object(automation, 'MCPClient', return_value=client):
            automation.bounded_results(ctx)
        client.tool_result.assert_called_once_with('RunCode', {
            'code': 'return __cx_args.payload', 'args': {'payload': payload}})
        client.call.assert_not_called()
        client.tool_result.return_value = {'content': [{'type': 'text', 'text': json.dumps({
            'success': True, 'result': payload[:-1]})}]}
        with patch.object(automation, 'mint', return_value={'token': 'fixture'}), \
             patch.object(automation, 'MCPClient', return_value=client), \
             self.assertRaisesRegex(Failure, 'complete result'):
            automation.bounded_results(ctx)

    def test_artifact_inspection_uses_a_published_version_with_local_replacements(self):
        ctx = SimpleNamespace(inst=Mock())
        ctx.inst.app = None
        with patch.object(module_lifecycle_contract, 'versions', return_value=['0.1.1', '0.1.2']) as versions, \
             patch.object(core, 'mcp_call', return_value=[{'component': 'kickside/hub', 'entries': []},
                 {'kickside.channel:channel_kind': 'kickside.channel'}]) as call:
            core.core_hub_inspection(ctx)
        versions.assert_called_once_with(ctx.inst, 'kickside/hub')
        self.assertEqual(call.call_args.args[2][0],
                         ('InspectModuleArtifact', {'component': 'kickside/hub', 'version': '0.1.2'}))
