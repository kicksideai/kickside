"""Converted modules reject new string error returns and message decisions."""
from pathlib import Path
import subprocess
import sys
from harness import Scenario, require


def ratchet(ctx):
    root = Path(__file__).resolve().parents[2]
    mirror = root.parent / "kickside-internal/kickside/ops/smoke/coverage/tests"
    for label, command in [
        ("native-error-overlay-tests", [sys.executable, "-m", "unittest", "discover", "-s", str(mirror), "-p", "test_native_error_source.py"]),
        ("native-error-source-tests", [sys.executable, "-m", "unittest", "discover", "-s", "ops/smoke/coverage/tests", "-p", "test_native_error_source.py"]),
        ("native-error-source-check", [sys.executable, "ops/scripts/check-native-errors.py"]),
    ]:
        result = subprocess.run(command, cwd=root, capture_output=True, text=True, timeout=60)
        ctx.inst.evidence.save(label, {"command": command, "exit_code": result.returncode,
            "stdout": result.stdout, "stderr": result.stderr})
        require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario("native_errors_source_ratchet", "regression", ratchet, issues=("NE-272", "SMOKE-NATIVE-SOURCE-CHECKOUT"))]
