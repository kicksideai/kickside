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
    repositories = ctx.inst.config.get('source_checkouts', {}).get('public-repositories')
    require(repositories, 'Public source boundary guard requires declared public-repositories checkout')
    repositories = Path(repositories).resolve()
    public_root = repositories / 'kickside'
    require(public_root.is_dir() and (public_root / '.git').exists(),
            'Public source boundary guard requires a real public-repositories/kickside Git checkout')
    checker = Path(__file__).resolve().parents[2] / 'tests/test_public_source_hygiene.py'
    require(checker.is_file(), 'Public source boundary guard requires its private hygiene checker')
    result = subprocess.run(
        [sys.executable, str(checker), '--root', str(public_root)],
        cwd=checker.parent, text=True, capture_output=True, timeout=120,
    )
    ctx.inst.evidence.save('publication-boundary', {'exit_code': result.returncode,
                                                   'output': result.stdout + result.stderr})
    require(result.returncode == 0, 'Public source boundary guard fails: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('regression_publication_boundary', 'regression', publication_boundary,
                     issues=('PUBLIC-SOURCE-INTERNAL-BOUNDARY', 'PUBLIC-SOURCE-LICENSE-METADATA', 'PUBLIC-HARNESS-CONTENT-CLASSIFICATION'),
                     source_checkout_roots=('public-repositories',))]
