import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, call

SMOKE = Path(__file__).resolve().parents[1] / 'ops/smoke'
sys.path.insert(0, str(SMOKE))
SPEC = importlib.util.spec_from_file_location('scenarios_packaging', SMOKE / 'scenarios_packaging.py')
SCENARIO = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SCENARIO)


class PackageCompositionSmokeTest(unittest.TestCase):
    def context(self, running):
        inst = Mock()
        inst.process = Mock() if running else None
        inst.request.return_value = {'dependencies': [
            {'component': 'chestor/' + name}
            for name in ('workspace', 'graph', 'db-schema', 'journal', 'roadmap')
        ]}
        return Mock(inst=inst)

    def test_installs_all_five_on_a_fresh_runtime(self):
        ctx = self.context(False)
        SCENARIO.chestor_package_composition(ctx)
        ctx.inst.prepare.assert_called_once_with()
        ctx.inst.start.assert_called_once_with()
        self.assertEqual(ctx.inst.install.call_args_list, [call('chestor/' + name)
            for name in ('workspace', 'graph', 'db-schema', 'journal', 'roadmap')])

    def test_composes_with_the_existing_full_suite_runtime(self):
        ctx = self.context(True)
        SCENARIO.chestor_package_composition(ctx)
        ctx.inst.prepare.assert_not_called()
        ctx.inst.start.assert_not_called()
        self.assertEqual(ctx.inst.install.call_count, 5)

    def test_refuses_missing_modules(self):
        ctx = self.context(True)
        ctx.inst.request.return_value = {'dependencies': []}
        with self.assertRaisesRegex(Exception, 'misses modules'):
            SCENARIO.chestor_package_composition(ctx)

    def test_refuses_leaked_http_fixtures(self):
        ctx = self.context(True)
        ctx.inst.request.return_value['dependencies'][0]['entries'] = ['app.http_errors_test:contract']
        with self.assertRaisesRegex(Exception, 'includes HTTP test fixtures'):
            SCENARIO.chestor_package_composition(ctx)


if __name__ == '__main__':
    unittest.main()
