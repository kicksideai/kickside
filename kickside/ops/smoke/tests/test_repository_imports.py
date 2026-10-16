from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


class SmokeRepositoryImports(unittest.TestCase):
    def test_standalone_cli_resolves_shared_repository_helpers(self):
        suite = Path(__file__).resolve().parents[1]
        program = """
from pathlib import Path
import sys
sys.path.insert(0, sys.argv[1])
import smoke
from ops.compat import fetch_baselines
from ops.compat.integration import test_run_as_upgrade
root = Path(sys.argv[1]).parents[1]
assert Path(fetch_baselines.__file__) == root / 'ops/compat/fetch_baselines.py'
assert Path(test_run_as_upgrade.__file__) == root / 'ops/compat/integration/test_run_as_upgrade.py'
assert callable(test_run_as_upgrade.write_published_entries)
"""
        with tempfile.TemporaryDirectory(prefix='smoke-cli-imports-') as directory:
            result = subprocess.run([sys.executable, '-I', '-c', program, str(suite)],
                                    cwd=directory, capture_output=True, text=True, timeout=35)
        self.assertEqual(result.returncode, 0, result.stderr)
