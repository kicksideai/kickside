"""Native supervisor-state checks for compatibility HTTP readiness."""
import os
from pathlib import Path
import shutil
import socket
import tempfile
import unittest

import yaml

from ops.compat.integration.test_run_as_upgrade import attach_http_readiness
from ops.compat.inventory import ROOT
from ops.compat.migrations import command


class HttpReadinessTests(unittest.TestCase):
    def test_native_supervisor_readiness_preserves_deadlines_and_errors(self):
        lane_tmp = Path(os.environ['TMPDIR'])
        with tempfile.TemporaryDirectory(prefix='http-readiness-', dir=lane_tmp) as directory:
            work = Path(directory)
            source = work / 'src'
            source.mkdir()
            with socket.socket() as listener:
                listener.bind(('127.0.0.1', 0))
                failed_port = listener.getsockname()[1]
                index = {'version': '1.0', 'namespace': 'app', 'entries': [
                    {'name': 'scope', 'kind': 'security.policy',
                     'policy': {'resources': '*', 'actions': '*', 'effect': 'allow'}},
                    {'name': 'gateway', 'kind': 'http.service', 'addr': ':0',
                     'lifecycle': {'auto_start': True}},
                    {'name': 'failed_gateway', 'kind': 'http.service', 'addr': ':' + str(failed_port),
                     'lifecycle': {'auto_start': True}},
                    {'name': 'test', 'kind': 'ns.dependency', 'component': 'wippy/test', 'version': '*'},
                ]}
                suite = {'name': 'suite', 'kind': 'function.lua', 'source': 'file://suite.lua', 'method': 'run',
                         'meta': {'type': 'test', 'suite': 'http_readiness', 'timeout': '300s'},
                         'modules': ['time'], 'imports': {'test': 'wippy.test:test'}}
                attach_http_readiness(source, index, suite)
                index['entries'].append(suite)
                (source / '_index.yaml').write_text(yaml.safe_dump(index, sort_keys=False))
                shutil.copy(ROOT / 'ops/compat/integration/http_readiness_native_test.lua', source / 'suite.lua')
                (work / 'wippy.yaml').write_text(yaml.safe_dump({
                    'organization': 'kickside', 'module': 'http-readiness', 'type': 'application',
                    'directories': {'src': 'src', 'modules': '.wippy'},
                }, sort_keys=False))
                log = work / 'readiness.log'
                environment = dict(os.environ)
                command(['wippy', 'init', '--src-dir', 'src', '--modules-dir', '.wippy'], work, log, environment)
                command(['wippy', 'update'], work, log, environment)
                try:
                    command(['wippy', 'test'], work, log, environment)
                    result = log.read_text()
                    self.assertIn('PASSED', result, result[-4000:])
                    self.assertNotIn('FAILED', result, result[-4000:])
                finally:
                    evidence = Path(tempfile.mkdtemp(prefix='http-readiness-', dir=lane_tmp))
                    shutil.copy2(log, evidence / log.name)
