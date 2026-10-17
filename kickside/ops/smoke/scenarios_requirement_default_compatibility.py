"""Published requirement defaults remain available to existing dependency roots."""
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def published_requirement_defaults(ctx):
    command = [sys.executable, '-m', 'unittest',
               'ops.compat.tests.test_compare.CompareTests.test_requirement_default_removal_fails_with_resource_metadata']
    result = subprocess.run(command, cwd=Path(__file__).resolve().parents[2],
                            capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('published-requirement-defaults', {
        'command': command, 'exit_code': result.returncode,
        'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario('published_requirement_default_compatibility', 'regression',
                     published_requirement_defaults,
                     issues=('REQUIREMENT-DEFAULT-REMOVAL-COMPATIBILITY',))]
