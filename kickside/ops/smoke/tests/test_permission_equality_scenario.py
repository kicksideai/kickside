from pathlib import Path
import sys
import unittest


SMOKE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SMOKE))


class PermissionEqualityScenarioTests(unittest.TestCase):
    def test_native_proof_is_a_registered_focused_scenario(self):
        from scenarios_permission_equality import REGISTRY

        self.assertEqual([scenario.name for scenario in REGISTRY], ['permission_equality_native_proof'])
        self.assertEqual(REGISTRY[0].requires, ())

