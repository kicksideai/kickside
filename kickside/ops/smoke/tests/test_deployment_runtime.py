from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import scenarios_deployment_runtime


class DeploymentRuntimeScenarioTests(unittest.TestCase):
    def test_requirements_run_from_private_suite_against_selected_source(self):
        inst = SimpleNamespace(config={'source': '/selected/product'}, env={'PATH': '/bin'})
        ctx = SimpleNamespace(inst=inst)
        suite_root = Path(scenarios_deployment_runtime.__file__).resolve().parents[2]

        with patch.object(scenarios_deployment_runtime, '_command') as command:
            scenarios_deployment_runtime.deployment_runtime_release(ctx)

        called_inst, label, invocation, cwd, environment, timeout = command.call_args.args
        self.assertIs(called_inst, inst)
        self.assertEqual(label, 'deployment-runtime-release')
        self.assertEqual(invocation[-1], 'tests.test_deployment_requirements')
        self.assertEqual(cwd, suite_root)
        self.assertEqual(environment['KICKSIDE_SOURCE_ROOT'], '/selected/product')
        self.assertEqual(environment['PATH'], '/bin')
        self.assertEqual(inst.env, {'PATH': '/bin'})
        self.assertEqual(timeout, 60)
