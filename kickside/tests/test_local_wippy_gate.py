import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/local-wippy-gate.sh"


class LocalWippyGateTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "app").mkdir()
        self.lock = self.root / "app/wippy.lock"
        self.lock.write_text("modules: []\n")
        self.calls = self.root / "calls.jsonl"
        tools = self.root / "bin"
        tools.mkdir()
        python = tools / "python3"
        python.write_text("#!/bin/sh\nexit 0\n")
        python.chmod(0o700)
        node = tools / "node"
        node.write_text("#!/bin/sh\nexit 0\n")
        node.chmod(0o700)
        wippy = tools / "wippy"
        wippy.write_text(
            f"#!{sys.executable}\n"
            "import json, os, sys\n"
            "from pathlib import Path\n"
            "with Path(os.environ['GATE_TEST_CALLS']).open('a') as output:\n"
            "    output.write(json.dumps(sys.argv[1:]) + '\\n')\n"
            "if sys.argv[1] in {'init', 'update'}:\n"
            "    raise SystemExit('Dependency resolution is not allowed')\n"
            "if sys.argv[1] == 'install':\n"
            "    if os.environ.get('GATE_TEST_MUTATE') == '1':\n"
            "        Path('wippy.lock').write_text('modules: [changed]\\n')\n"
            "    raise SystemExit(int(os.environ.get('GATE_TEST_INSTALL_EXIT', '0')))\n"
        )
        wippy.chmod(0o700)
        self.environment = os.environ | {
            "PATH": str(tools) + os.pathsep + os.environ["PATH"],
            "GATE_TEST_CALLS": str(self.calls),
        }

    def run_gate(self, **environment):
        result = subprocess.run(
            ["sh", str(SCRIPT)], cwd=self.root, env=self.environment | environment,
            capture_output=True, text=True,
        )
        calls = [json.loads(line) for line in self.calls.read_text().splitlines()] if self.calls.exists() else []
        return result, calls

    def test_installs_the_existing_lock_before_app_lint(self):
        before = self.lock.read_bytes()
        result, calls = self.run_gate()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(calls, [["install"], ["lint", "--level", "error", "--ns", "app", "--ns", "app.*"]])
        self.assertEqual(self.lock.read_bytes(), before)

    def test_rejects_a_lock_change_before_app_lint(self):
        result, calls = self.run_gate(GATE_TEST_MUTATE="1")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(calls, [["install"]])
        self.assertIn("FAILED", result.stdout + result.stderr)

    def test_rejects_a_missing_lock_without_dependency_resolution(self):
        self.lock.unlink()
        result, calls = self.run_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(calls, [])
        self.assertFalse(self.lock.exists())

    def test_install_failure_stops_before_app_lint(self):
        result, calls = self.run_gate(GATE_TEST_INSTALL_EXIT="17")
        self.assertEqual(result.returncode, 17)
        self.assertEqual(calls, [["install"]])


if __name__ == "__main__":
    unittest.main()
