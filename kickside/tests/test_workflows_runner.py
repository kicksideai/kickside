import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class WorkflowsRunnerTests(unittest.TestCase):
    def invoke(self, result="PASSED\n1 tests", status=0, args=""):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as scratch:
            directory = Path(scratch)
            binary = directory / "wippy"
            binary.write_text(
                "#!/usr/bin/env python3\n"
                "import json, os, sys\n"
                "from pathlib import Path\n"
                "Path(os.environ['RUNNER_ARGUMENTS']).write_text(json.dumps(sys.argv[1:]))\n"
                "print(os.environ['RUNNER_RESULT'])\n"
                "sys.exit(int(os.environ['RUNNER_STATUS']))\n"
            )
            binary.chmod(0o755)
            environment = dict(os.environ, PATH=str(directory) + os.pathsep + os.environ["PATH"],
                               TMPDIR=str(directory), RUNNER_ARGUMENTS=str(directory / "arguments.json"),
                               RUNNER_RESULT=result, RUNNER_STATUS=str(status), WIPPY_TEST_ARGS=args)
            run = subprocess.run(["make", "-C", str(ROOT / "platform/workflows"), "test"],
                                 env=environment, capture_output=True, text=True, timeout=30)
            return run, json.loads((directory / "arguments.json").read_text())

    def test_make_target_forwards_postgres_profile_and_scratch_database(self):
        run, arguments = self.invoke(args="--profile postgres --set vars.pg_database=owned_scratch")
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertEqual(arguments, ["test", "--profile", "postgres", "--set", "vars.pg_database=owned_scratch"])

    def test_rejects_failed_assertions_despite_zero_runtime_status(self):
        run, _ = self.invoke(result="FAILED\n1 passed 1 failed")
        self.assertNotEqual(run.returncode, 0)

    def test_rejects_nonzero_runtime_status_despite_successful_tally(self):
        run, _ = self.invoke(status=2)
        self.assertNotEqual(run.returncode, 0)

    def test_rejects_no_terminal_verdict(self):
        run, _ = self.invoke(result="runner starts")
        self.assertNotEqual(run.returncode, 0)

    def test_rejects_a_successful_zero_case_tally(self):
        run, _ = self.invoke(result="PASSED\n0 tests")
        self.assertNotEqual(run.returncode, 0)
