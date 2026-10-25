import json
import os
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
from mcp_client import MCPClient
import module_lifecycle_contract
import scenarios_automation as automation
import scenarios_core as core
import scenarios_release_qualification as qualification


class ReleaseScenarioContracts(unittest.TestCase):
    def test_immutable_source_guard_prefers_its_private_owner_tooling(self):
        owner = Path('/private/owner')
        public = Path('/public/source')
        inst = SimpleNamespace(env={'PATH': '/bin', 'TMPDIR': '/owned/run/temp',
                                    'PYTHONPATH': str(public / 'ops/smoke')})
        ctx = SimpleNamespace(inst=inst)
        with patch.object(qualification, '_private_suite_root', return_value=owner), \
             patch.object(qualification, '_command') as command:
            qualification.immutable_replacement_sources(ctx)

        _, label, invocation, cwd, environment, timeout = command.call_args.args
        self.assertEqual(label, 'immutable-replacement-sources')
        self.assertEqual(cwd, owner)
        self.assertEqual(timeout, 900)
        self.assertEqual(invocation[:3], [qualification.sys.executable, '-m', 'unittest'])
        self.assertEqual(environment['PYTHONPATH'].split(os.pathsep)[0],
                         str(owner / 'ops/smoke'))
        self.assertNotEqual(environment['PYTHONPATH'].split(os.pathsep)[0],
                            str(public / 'ops/smoke'))
        self.assertEqual(environment['TMPDIR'], '/owned/run/temp')
        self.assertEqual(inst.env['PYTHONPATH'], str(public / 'ops/smoke'))

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
