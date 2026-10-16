import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from mocks.mcp import MCP
from mcp_limits_contracts import mcp_limits


class MCPLimitsContracts(unittest.TestCase):
    def test_complete_large_results_and_transport_errors_preserve_the_fixture_contract(self):
        fixture = MCP('http://127.0.0.1:731')
        records = []
        def probe_value(ctx, **kwargs):
            name = kwargs['context'].get('remote_tool_name')
            message = {'id': 1, 'method': 'tools/call', 'params': {'name': name, 'arguments': {}}}
            records.append({'body': message})
            if kwargs['connection'] is None:
                return {'isError': True, 'content': [{'text': 'MCP connection is not configured'}]}
            if name is None:
                return {'isError': True, 'content': [{'text': 'MCP tool binding is invalid'}]}
            _, _, response = fixture.dispatch('POST', '/mcp/limits', {}, message, {})
            if isinstance(response, str):
                response = json.loads(response.split('data: ', 1)[1])
            if 'error' in response:
                return {'isError': True, 'content': [{'text': response['error']['message']}]}
            result = response['result']
            if result.get('isError'):
                return {'success': False, 'error': result['content'][0]['text']}
            return result
        ctx = SimpleNamespace(inst=Mock(), fixtures=Mock(), state={'provider_bases': {'mcp': 'http://127.0.0.1:731'}})
        ctx.inst.request.return_value = {'resources': [{} for _ in range(80)]}
        ctx.fixtures.requests.side_effect = lambda name: records
        with patch('scenarios_providers.connect', return_value='fixture-connection'), \
             patch('scenarios_providers.probe_value', side_effect=probe_value):
            mcp_limits(ctx)
