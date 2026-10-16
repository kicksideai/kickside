import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ClusterOwnershipTest(unittest.TestCase):
    def test_registered_actors_use_their_declared_ownership_plane(self):
        spec = importlib.util.spec_from_file_location("cluster_runner", ROOT / "tests/cluster-2node/run.py")
        runner = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(runner)
        inventory = runner.inventory()
        self.assertGreaterEqual(len(inventory["registrations"]), 12)

if __name__ == "__main__":
    unittest.main()
