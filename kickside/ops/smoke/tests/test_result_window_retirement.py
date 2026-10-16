from types import SimpleNamespace
import unittest
from unittest.mock import Mock
from urllib.parse import unquote

from harness import Failure
from scenarios_result_window_retirement import RETIRED_IDS, retired_result_window_registry_entries


class ResultWindowRetirementTests(unittest.TestCase):
    def context(self, request):
        inst = SimpleNamespace(request=request, install=Mock(), evidence=Mock())
        return SimpleNamespace(inst=inst)

    def test_every_retired_identity_is_absent(self):
        requests = []

        def request(method, path, **kwargs):
            requests.append((method, path, kwargs))
            return {'error': 'registry entry not found'}

        ctx = self.context(request)
        retired_result_window_registry_entries(ctx)
        self.assertEqual(ctx.inst.install.call_args_list[0].args, ('kickside/agents',))
        self.assertEqual(ctx.inst.install.call_args_list[1].args, ('kickside/contract',))
        self.assertEqual(ctx.inst.install.call_args_list[2].args, ('kickside/uploads',))
        self.assertEqual(len(requests), len(RETIRED_IDS))
        self.assertTrue(all(row[0] == 'GET' and row[2]['expect'] == (404,) for row in requests))
        self.assertEqual([identity for identity, row in zip(RETIRED_IDS, requests)
                          if unquote(row[1].partition('id=')[2]) == identity], list(RETIRED_IDS))

    def test_stray_retired_identity_fails_the_guard(self):
        def request(method, path, **kwargs):
            if path.endswith('kickside.agents%3Aread_tool_result'):
                return {'entry': {'id': 'kickside.agents:read_tool_result'}}
            return {'error': 'registry entry not found'}

        with self.assertRaisesRegex(Failure, 'remains available'):
            retired_result_window_registry_entries(self.context(request))


if __name__ == '__main__':
    unittest.main()
