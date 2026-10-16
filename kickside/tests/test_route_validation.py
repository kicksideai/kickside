import importlib.util
import io
import tempfile
from contextlib import redirect_stdout, redirect_stderr
import json
import sys
import unittest
from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'app/scripts/validate_wippy_routes.py'
spec = importlib.util.spec_from_file_location('route_validation', SCRIPT)
routes = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = routes
spec.loader.exec_module(routes)


class ResolvedRouteTests(unittest.TestCase):
    def registry_run(self, command, **kwargs):
        kind = command[command.index('--kind') + 1] if '--kind' in command else None
        if kind == 'http.endpoint':
            data = [{'id': 'keeper.agents.api:list.endpoint', 'kind': kind,
                     'meta': {'router': 'app:api'}}]
        elif command[2] == 'show' and command[3] == 'app:api':
            data = {'id': 'app:api', 'kind': 'http.router', 'data': {'prefix': '/api/v1'}}
        else:
            data = {'id': 'keeper.agents.api:list.endpoint', 'kind': 'http.endpoint',
                    'data': {'method': 'GET', 'path': '/keeper/agents/list'},
                    'meta': {'router': 'app:api'}}
        return CompletedProcess(command, 0, json.dumps(data), '')

    def test_validates_packed_endpoint_without_extracted_source_files(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            (app / 'wippy.lock').write_text('directories: {src: src, modules: .wippy}\nmodules: [{name: keeper/keeper}]\n')
            output, diagnostic = io.StringIO(), io.StringIO()
            with patch.object(routes.subprocess, 'run', side_effect=self.registry_run), \
                    patch.object(sys, 'argv', [str(SCRIPT), '--app-dir', str(app)]), \
                    redirect_stdout(output), redirect_stderr(diagnostic):
                result = routes.main()
        self.assertEqual(result, 0)
        self.assertEqual(diagnostic.getvalue(), '')
        self.assertIn('route pattern validation passed (2 effective routes)', output.getvalue())

    def test_refuses_endpoint_with_missing_path(self):
        def malformed(command, **kwargs):
            response = self.registry_run(command, **kwargs)
            if command[2] == 'show' and command[3] != 'app:api':
                response.stdout = json.dumps({'id': command[3], 'kind': 'http.endpoint', 'data': {'method': 'GET'}})
            return response
        with patch.object(routes.subprocess, 'run', side_effect=malformed):
            with self.assertRaisesRegex(ValueError, 'keeper.agents.api:list.endpoint.*path'):
                routes.resolved_declarations(Path('/app'), Path('/app/wippy.lock'), 'wippy')

    def test_preserves_registry_command_failure(self):
        with patch.object(routes.subprocess, 'run', return_value=CompletedProcess([], 7, '', 'registry failed')):
            with self.assertRaises(SystemExit) as error:
                routes.resolved_declarations(Path('/app'), Path('/app/wippy.lock'), 'wippy')
        self.assertEqual(error.exception.code, 7)


if __name__ == '__main__':
    unittest.main()
