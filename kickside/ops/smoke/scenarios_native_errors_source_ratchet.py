"""Converted modules reject new string error returns and message decisions."""
from pathlib import Path
import subprocess
import sys
from harness import Scenario, require
from module_harness import _private_suite_root


def ratchet(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Native-error source ratchet requires the configured public source checkout')
    root = Path(source).resolve()
    require(root.is_dir(), 'Native-error source ratchet requires the configured public source checkout')
    suite = _private_suite_root()
    tests = suite / 'ops/smoke/coverage/tests'
    require(tests.is_dir(), 'Private native-error tests are absent: ' + str(tests))
    for label, cwd, command in [
        ("native-error-private-tests", root, [sys.executable, "-m", "unittest", "discover", "-s", str(tests), "-p", "test_native_error_source.py"]),
        ("native-error-source-conventions", root, [sys.executable, "scripts/check-source-conventions.py"]),
    ]:
        result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=60)
        ctx.inst.evidence.save(label, {"command": command, "exit_code": result.returncode,
            "stdout": result.stdout, "stderr": result.stderr})
        require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario("native_errors_source_ratchet", "regression", ratchet, issues=("NE-272", "SMOKE-NATIVE-SOURCE-CHECKOUT"))]
