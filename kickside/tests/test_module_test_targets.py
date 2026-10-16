import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def invoke(module, result="PASSED\n1 tests", status=0, arguments=""):
    with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as scratch:
        directory = Path(scratch)
        binary = directory / "wippy"
        binary.write_text(
            "#!/usr/bin/env python3\n"
            "import json, os, sys\n"
            "from pathlib import Path\n"
            "Path(os.environ['GATE_ARGUMENTS']).write_text(json.dumps(sys.argv[1:]))\n"
            "print('RUN_DIRECTORY=' + os.getcwd())\n"
            "print(os.environ['GATE_RESULT'])\n"
            "sys.exit(int(os.environ['GATE_STATUS']))\n"
        )
        binary.chmod(0o755)
        environment = dict(os.environ, PATH=str(directory) + os.pathsep + os.environ["PATH"],
                           TMPDIR=str(directory), GATE_ARGUMENTS=str(directory / "arguments.json"),
                           GATE_RESULT=result, GATE_STATUS=str(status), WIPPY_TEST_ARGS=arguments)
        run = subprocess.run(["make", "-C", str(ROOT / module), "test"],
                             env=environment, capture_output=True, text=True, timeout=30)
        run.scratch_files = sorted(path.name for path in directory.iterdir())
        return run, json.loads((directory / "arguments.json").read_text())


class KnowledgeTestTargetTests(unittest.TestCase):
    module = "platform/knowledge"
    def test_forwards_the_scratch_postgres_database(self):
        run, arguments = invoke(self.module, arguments="--profile postgres --set vars.pg_database=owned_scratch")
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertEqual(arguments, ["test", "--profile", "postgres", "--set", "vars.pg_database=owned_scratch"])

    def test_propagates_runtime_failure(self):
        run, _ = invoke(self.module, status=2)
        self.assertNotEqual(run.returncode, 0)

    def test_propagates_assertion_failure(self):
        run, _ = invoke(self.module, result="FAILED\n1 passed 1 failed")
        self.assertNotEqual(run.returncode, 0)

    def test_refuses_a_missing_terminal_result(self):
        run, _ = invoke(self.module, result="runner starts")
        self.assertNotEqual(run.returncode, 0)

    def test_refuses_zero_executed_cases(self):
        run, _ = invoke(self.module, result="PASSED\n0 tests")
        self.assertNotEqual(run.returncode, 0)


class CoreTestTargetTests(unittest.TestCase):
    module = "core/core"

    def test_uses_a_file_database_for_process_restart_cases_and_cleans_it(self):
        run, arguments = invoke(self.module)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        paths = [value.split("=", 1)[1] for value in arguments if value.startswith("vars.sqlite_path=")]
        self.assertEqual(len(paths), 1, arguments)
        self.assertNotEqual(paths[0], ":memory:")
        self.assertEqual(run.scratch_files, ["arguments.json", "wippy"])

    def test_preserves_postgres_arguments_and_cleans_the_file_after_runtime_failure(self):
        run, arguments = invoke(self.module, status=2,
                                arguments="--profile postgres --set vars.pg_database=owned_scratch")
        self.assertNotEqual(run.returncode, 0)
        self.assertIn("owned_scratch", [value.split("=", 1)[1] for value in arguments if "=" in value])
        self.assertEqual(run.scratch_files, ["arguments.json", "wippy"])


class JobsTestTargetTests(CoreTestTargetTests):
    module = "core/jobs"


class InboxTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/inbox"


class SelfReflectionTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/self-reflection"


class AgentsTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/agents"


class TransformTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/transform"


class UITestTargetTests(KnowledgeTestTargetTests):
    module = "platform/ui"


class UsersTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/users"


class ExecutionTestTargetTests(KnowledgeTestTargetTests):
    module = "core/execution"


class BlocksTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/blocks"


class ConnectionTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/connection"


class HubTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/hub"


class IdentityTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/identity"


class McpTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/mcp"


class ModelsTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/models"


class OauthTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/oauth"


class RealtimeTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/realtime"


class SecurityTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/security"


class SettingsTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/settings"


class SkillsTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/skills"


class SyncTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/sync"


class TransferTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/transfer"


class UploadsTestTargetTests(KnowledgeTestTargetTests, CoreTestTargetTests):
    module = "platform/uploads"

    def test_forwards_the_scratch_postgres_database(self):
        run, arguments = invoke(self.module, arguments="--profile postgres --set vars.pg_database=owned_scratch")
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        database_argument = next(value for value in arguments if value.startswith("vars.sqlite_path="))
        self.assertEqual(arguments, ["test", "--set", database_argument, "--profile", "postgres", "--set", "vars.pg_database=owned_scratch"])
        self.assertEqual(run.scratch_files, ["arguments.json", "wippy"])


class WebhooksTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/webhooks"


class SsoTestTargetTests(KnowledgeTestTargetTests):
    module = "../components/sso"


class DmTestTargetTests(KnowledgeTestTargetTests):
    module = "platform/dm"

    def test_runs_its_own_module_harness(self):
        run, _ = invoke(self.module)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertIn("RUN_DIRECTORY=" + str(ROOT / self.module / "test"), run.stdout)


class AutomationTestTargetTests(UploadsTestTargetTests):
    module = "platform/automation"
