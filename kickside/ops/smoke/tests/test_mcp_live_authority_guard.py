from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_mcp_security as guards


class LiveAuthorityGuardTests(unittest.TestCase):
    def run_guard(self, expanded_tools):
        requests = []
        tool_results = iter([set(), expanded_tools, {'FindKnowledgeBases'},
                             {'FindKnowledgeBases'}, set(), set(), set(), set(),
                             {'FindKnowledgeBases'}, set(), set(), {'FindKnowledgeBases'}])

        def request(method, path, *args, **kwargs):
            requests.append((method, path, kwargs))
            if path == '/api/v1/security/policies':
                return {'policies': [{'id': 'knowledge-access', 'surface': 'kickside.knowledge',
                                      'intent': 'module_access'}]}
            if path == '/api/v1/users':
                return {'user': {'user_id': 'authority-member'}}
            if path == '/api/v1/mcp/credentials':
                return {'credential': {'token': 'narrowed-bearer'}}
            if path == '/api/public/mcp':
                names = next(tool_results)
                if kwargs.get('expect') == (401,):
                    return {'error': 'revoked'}
                return {'result': {'tools': [{'name': name} for name in names]}}
            return {}

        inst = SimpleNamespace(request=request, install=Mock(), cleanup=Mock(),
                               password='fixture-password', redactor=Mock())
        with patch.object(guards, 'run_focused_module_test'), \
                patch('scenarios_issue_guards.login', return_value='member-session'):
            guards.authority_lifecycle(SimpleNamespace(inst=inst))
        return requests

    def test_live_addition_retains_every_reduction_and_narrowing_check(self):
        requests = self.run_guard({'FindKnowledgeBases'})
        tools = [kwargs for _, path, kwargs in requests if path == '/api/public/mcp']
        self.assertEqual(sum(row.get('expect') == (401,) for row in tools), 6)
        mint = [row for row in requests if row[1] == '/api/v1/mcp/credentials']
        self.assertEqual(len(mint), 4)

    def test_expansion_cannot_exceed_explicit_tool_ceiling(self):
        with self.assertRaisesRegex(Failure, 'ceiling'):
            self.run_guard({'FindKnowledgeBases', 'AskKB'})
