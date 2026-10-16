import unittest
from unittest.mock import Mock

from harness import Failure
from scenarios_providers import probe_value
from mcp_client import MCPClient


class ProviderErrorTests(unittest.TestCase):
    def context(self, response):
        ctx = Mock()
        ctx.state = {}
        ctx.state['provider_probe_client'] = MCPClient(ctx.inst, 'fixture', '/api/public/mcp', stateful=False)
        ctx.inst.request.side_effect = lambda method, path, body, **kwargs: dict(response, jsonrpc='2.0', id=body['id'])
        return ctx

    def test_expected_tool_error_retains_the_wire_diagnostics(self):
        error = {'isError': True, 'content': [{'type': 'text', 'text': 'tool error: packing station refused'}]}
        self.assertEqual(probe_value(self.context({'result': error}), tool='tool', expect_error=True), error)

    def test_unexpected_tool_errors_and_unexpected_success_stay_failures(self):
        errors = self.context({'result': {'isError': True, 'content': []}})
        with self.assertRaises(Failure):
            probe_value(errors, tool='tool')
        success = self.context({'result': {'content': [{'text': '{"value": {"success": true}}'}]}})
        with self.assertRaises(Failure):
            probe_value(success, tool='tool', expect_error=True)

    def test_complete_wire_result_reaches_the_provider_probe(self):
        response = {'result': {'isError': False, 'content': [{'type': 'text',
            'text': '{"value": "' + 'x' * (24 * 1024) + '"}'}]}}
        self.assertEqual(probe_value(self.context(response), tool='tool'), 'x' * (24 * 1024))

    def test_protocol_errors_are_never_accepted_as_tool_errors(self):
        with self.assertRaises(Failure):
            probe_value(self.context({'error': {'message': 'bad protocol'}}), tool='tool', expect_error=True)
