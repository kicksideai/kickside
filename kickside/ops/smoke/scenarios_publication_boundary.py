# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Public product source keeps internal material and infrastructure references private."""
import subprocess
import sys
from pathlib import Path

from harness import Scenario, require


def publication_boundary(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Public source boundary guard requires the configured public source checkout')
    root = Path(source).resolve()
    require(root.is_dir(), 'Public source boundary guard requires the configured public source checkout')
    result = subprocess.run(
        [sys.executable, '-m', 'unittest', 'tests.test_public_source_hygiene'],
        cwd=root, text=True, capture_output=True, timeout=120,
    )
    ctx.inst.evidence.save('publication-boundary', {'exit_code': result.returncode,
                                                   'output': result.stdout + result.stderr})
    require(result.returncode == 0, 'Public source boundary guard fails: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('regression_publication_boundary', 'regression', publication_boundary,
                     issues=('PUBLIC-SOURCE-INTERNAL-BOUNDARY', 'PUBLIC-SOURCE-LICENSE-METADATA', 'PUBLIC-HARNESS-CONTENT-CLASSIFICATION'))]
