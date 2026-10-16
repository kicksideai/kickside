import json
import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from harness import Failure
import mcp_sdk


class SdkProtocolTests(unittest.TestCase):
    def run_suite(self, node_code):
        directory = tempfile.mkdtemp(dir=os.environ['TMPDIR'])
        inst = Mock(root=Path(directory), base='http://127.0.0.1:1')
        inst.redactor.text.side_effect = str
        seen = {}
        def run(command, **kwargs):
            if command[0] == 'node':
                tokens = Path(kwargs['env']['MCP_TEST_TOKEN_FILE'])
                seen['tokens'] = json.loads(tokens.read_text())
                seen['mode'] = tokens.stat().st_mode & 0o777
                seen['session'] = kwargs['env']['MCP_TEST_SESSION_TOKEN']
                return SimpleNamespace(returncode=node_code, stdout='ok', stderr='sdk failure')
            return SimpleNamespace(returncode=0, stdout='', stderr='')
        with patch.object(mcp_sdk.subprocess, 'run', side_effect=run):
            try:
                mcp_sdk.run_sdk_protocol(inst, 'bearer-token', 'oauth-token', 'member-session')
                error = None
            except Failure as failure:
                error = failure
        return inst, seen, error, Path(directory)

    def test_suite_receives_bearer_oauth_and_session_through_a_private_token_file(self):
        inst, seen, error, directory = self.run_suite(0)
        self.assertIsNone(error)
        self.assertEqual(seen['tokens'], {'url': 'http://127.0.0.1:1/api/public/mcp', 'bearer': 'bearer-token', 'oauth': 'oauth-token'})
        self.assertEqual(seen['mode'], 0o600)
        self.assertEqual(seen['session'], 'member-session')
        self.assertFalse((directory / 'sdk-client').exists())

    def test_nonzero_exit_fails_the_scenario_and_still_removes_the_tokens(self):
        inst, seen, error, directory = self.run_suite(1)
        self.assertRegex(str(error), 'MCP SDK protocol suite fails: sdk failure')
        self.assertFalse((directory / 'sdk-client').exists())


if __name__ == '__main__':
    unittest.main()
