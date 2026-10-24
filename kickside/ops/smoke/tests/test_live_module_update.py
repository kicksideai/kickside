import os
import sys
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch
import tempfile
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from module_lifecycle_contract import update_source, install_latest


class LiveModuleUpdateTest(unittest.TestCase):
    def test_restrictive_update_refreshes_administrator_session_before_verification(self):
        events = []
        dep = {'version': '*', 'parameters': [],
               'entries': [{'module': 'kickside/security', 'module_version': '1.0.0'}]}
        def request(method, path, body=None, **kwargs):
            events.append(path)
            if path.endswith('/plan'):
                return {'install_payload': {}, 'graph': [{'module': 'kickside/security', 'version': '1.0.0'}]}
            return {'execution': []}
        def installed(*args):
            events.append('dependency')
            return dep
        inst = SimpleNamespace(request=request, login=lambda: events.append('login'), await_keeper=lambda: None)
        with patch('module_lifecycle_contract.dependency', side_effect=installed):
            install_latest(inst, module='kickside/security', replacement=True, refresh_session=True)
        self.assertEqual(events[-2:], ['login', 'dependency'])
        self.assertEqual(events.count('login'), 1)

    def test_replan_preserves_installed_dependency_parameters(self):
        parameters = [{'name': 'module:scope', 'value': 'app:user'}]
        dep = {'version': '*', 'parameters': parameters,
               'entries': [{'module': 'kickside/uploads', 'module_version': '1.0.0'}]}
        inst = SimpleNamespace(request=MagicMock(side_effect=[
            {'install_payload': {'component': 'kickside/uploads', 'parameters': parameters}},
            {'execution': []}]), await_keeper=MagicMock())
        with patch('module_lifecycle_contract.dependency', return_value=dep):
            install_latest(inst, expected='1.0.0', module='kickside/uploads')
        body = inst.request.call_args_list[0].args[2]
        self.assertEqual(body['parameters'], parameters)

    def test_update_keeps_runtime_and_session_running(self):
        self.assert_live_update([{'name': 'kickside/uploads', 'version': '1.0.0'}])

    def test_hub_installed_module_does_not_require_a_boot_lock_entry(self):
        self.assert_live_update([{'name': 'kickside/kickside', 'version': '1.0.0'}])

    def assert_live_update(self, boot_modules):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / '.wippy.yaml').write_text('version: "1.0"\n')
            (root / 'wippy.lock').write_text(yaml.safe_dump({'modules': boot_modules}))
            process = SimpleNamespace(pid=731, poll=lambda: None)
            inst = SimpleNamespace(app=root, config={'replace': {}}, process=process,
                evidence=MagicMock(), manifest=MagicMock(),
                resolve_dependencies=MagicMock(side_effect=AssertionError('CLI resolution locks the live workspace')))
            ctx = SimpleNamespace(inst=inst)
            dependency = {'entries': [{'module': 'kickside/uploads', 'module_version': '1.0.0'}]}
            with patch('browser.Browser.paused', side_effect=AssertionError('runtime stops')), patch(
                    'module_lifecycle_contract.install_latest', return_value=dependency):
                update_source(ctx, str(root), 'kickside/uploads', live=True)
            self.assertEqual(inst.process.pid, 731)
            inst.resolve_dependencies.assert_not_called()
            self.assertEqual(inst.config['replace']['kickside/uploads'], str(root))


if __name__ == '__main__':
    unittest.main()
