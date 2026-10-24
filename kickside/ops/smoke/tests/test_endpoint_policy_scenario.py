"""The endpoint-policy guard starts from the package root it imports."""
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import scenarios_endpoint_policy_components as scenarios


class EndpointPolicyScenarioTests(unittest.TestCase):
    def test_architecture_guard_runs_from_package_root(self):
        context = SimpleNamespace(inst=SimpleNamespace(
            env={'PATH': '/bin'}, config={'source': '/sources/app', 'replace': {'kickside/core': '/sources/core'}},
            evidence=SimpleNamespace(save=lambda *args: None)))
        completed = SimpleNamespace(returncode=0, stdout='', stderr='')
        with patch.object(scenarios.subprocess, 'run', return_value=completed) as run:
            scenarios.endpoint_policy_architecture(context)
        command = run.call_args.args[0]
        options = run.call_args.kwargs
        self.assertEqual(command[-1], 'ops.smoke.tests.test_endpoint_policy_components')
        self.assertEqual(options['cwd'], scenarios.Path(scenarios.__file__).resolve().parents[2])
        self.assertEqual(options['env']['SECURITY_MODULE_ROOTS'], '/sources/app:/sources/core')
