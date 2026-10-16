"""Security policy and persistence failures keep native classifications."""
from harness import Scenario
from module_harness import run_focused_module_test


def security_policy_persistence_errors(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'policy_composition_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'security_persistence_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'producer_scope_test')
    run_focused_module_test(ctx, 'kickside/security', 'membership_native_failure_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_projection_test')


def security_transport_errors(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'registry_fixture_test', lint=True)
    run_focused_module_test(ctx, 'kickside/security', 'scope_reconcile_handoff_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_projector_lifecycle_test')


def security_authority_errors(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'membership_native_failure_test')


def policy_authority_coverage(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'scope_projection_test')


def scope_projector_upgrade(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'scope_projector_upgrade_test')


def scope_projection_liveness(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'scope_projector_lifecycle_test')


REGISTRY = [
    Scenario('regression_scope_projection_liveness', 'regression', scope_projection_liveness,
             issues=('SECURITY-SCOPE-PROJECTION-LIVENESS',)),
    Scenario('security_policy_authority_coverage', 'regression', policy_authority_coverage,
             issues=('SECURITY-POLICY-EXPANSION-FENCE', 'USERS-UNCHANGED-AUTHORITY-DELEGATION-REVOCATION')),
    Scenario('native_errors_security_policy_persistence', 'regression', security_policy_persistence_errors,
             issues=('NE-26', 'NE-27', 'NE-28', 'NE-38')),
    Scenario('native_errors_security_transport', 'regression', security_transport_errors,
             issues=('NE-29', 'NE-30', 'NE-31', 'SMOKE-SECURITY-REGISTRY-FIXTURE-CONFLICT', 'SMOKE-SECURITY-FIXTURE-ENTRY-TYPING', 'SMOKE-SECURITY-FENCE-OBSERVATION', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario('native_errors_security_authority', 'regression', security_authority_errors,
             issues=('NE-32', 'SMOKE-NATIVE-GUARD-SELECTIONS')),
    Scenario('regression_scope_projector_native_upgrade', 'regression', scope_projector_upgrade,
             issues=('SECURITY-SCOPE-PROJECTOR-HOT-UPGRADE', 'SECURITY-NEW-MEMBER-HOT-LOGIN', 'SMOKE-SECURITY-REGISTRY-FIXTURE-CONFLICT')),
]
