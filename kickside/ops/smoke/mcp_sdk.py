"""Run the official MCP SDK protocol suite against a live instance."""
import json
import os
import shutil
import subprocess
from pathlib import Path

from harness import require

CLIENT = Path(__file__).resolve().parents[2] / 'platform' / 'mcp' / 'test' / 'client'


def run_sdk_protocol(inst, bearer, oauth, session, *, endpoint=None):
    work = inst.root / 'sdk-client'
    shutil.copytree(CLIENT, work, ignore=shutil.ignore_patterns('node_modules'))
    try:
        env = dict(os.environ)
        install = subprocess.run(['npm', 'ci', '--no-audit', '--no-fund'], cwd=work, env=env,
                                 capture_output=True, text=True, timeout=300)
        require(install.returncode == 0, 'MCP SDK client dependencies fail to install: ' + install.stderr[-500:])
        tokens = work / 'tokens.json'
        tokens.write_text(json.dumps({'url': endpoint or inst.base + '/api/public/mcp', 'bearer': bearer, 'oauth': oauth}))
        tokens.chmod(0o600)
        env.update(MCP_TEST_TOKEN_FILE=str(tokens), MCP_TEST_SESSION_TOKEN=session)
        done = subprocess.run(['node', 'sdk_protocol_test.mjs'], cwd=work, env=env,
                              capture_output=True, text=True, timeout=300)
        inst.evidence.save('mcp-sdk-protocol', {'code': done.returncode, 'output': done.stdout, 'error': done.stderr})
        require(done.returncode == 0, 'Official MCP SDK protocol suite fails: ' + inst.redactor.text(done.stderr[-800:]))
    finally:
        shutil.rmtree(work, ignore_errors=True)
