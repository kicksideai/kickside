"""Smoke page ownership and issue registration retain their strict source gates."""
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def smoke_audits(ctx):
    suite = Path(__file__).resolve().parent
    result = subprocess.run([sys.executable, '-m', 'unittest',
        'tests.test_integration.CapturePolicyTests', 'tests.test_ui_guard_audit',
        'tests.test_receipt_publication', 'tests.test_identity_crash_evidence',
        'tests.test_identity_evidence', 'tests.test_discord_responder_details',
        'tests.test_selected_install_fixture', 'tests.test_authority_fixture_isolation',
        'tests.test_browser_driver_lifetime', 'tests.test_security_model',
        'tests.test_process_supervision',
        'tests.test_access_ownership.OwnershipTests.test_store_facet_exercises_native_writable_contract_and_checks_destination',
        'tests.test_access_ownership.OwnershipTests.test_collection_facet_checks_native_rows_and_rejects_missing_fixture_data'],
        cwd=suite, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('smoke-audits', {'exit_code': result.returncode,
                                         'stdout': result.stdout, 'stderr': result.stderr})
    require(result.returncode == 0, 'Smoke ownership/issue audit: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('smoke_capture_and_issue_audit', 'regression', smoke_audits,
                    issues=('SMOKE-CAPTURE-OWNERSHIP', 'SMOKE-ISSUE-AUDIT-CONSISTENCY', 'R5-E02', 'R5-E03',
                            'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY', 'SMOKE-AUTHORITY-FIXTURE-ISOLATION',
                            'SMOKE-INDEPENDENT-BROWSER-DRIVER-LIFETIME',
                            'SMOKE-WORKER-CLEANUP-DEADLINE', 'SMOKE-NATIVE-CAPABILITY-RESULTS'))]
