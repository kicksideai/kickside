"""Shared credential and policy authority owners retain their public boundaries."""
from pathlib import Path
from harness import Scenario, require
from module_harness import run_focused_module_test, run_focused_app_test


def credential_owner(ctx):
    root = Path(ctx.inst.config['source'])
    for source in ('platform/identity/src/credential_eligibility.lua',
                   'platform/mcp/src/credential_eligibility.lua', str(Path(ctx.inst.config['replace']['kickside/sso']) / 'src/persist/provisioner.lua')):
        text = (root / source).read_text()
        require('registry.find({[".id"] = "kickside.contract:host_credential_eligibility"})' not in text,
                'Consumer repeats shared credential orchestration: ' + source)
    run_focused_module_test(ctx, 'kickside/contract', 'credential_eligibility_test')


def coverage_owner(ctx):
    root = Path(ctx.inst.config['source'])
    text = (root / 'platform/users/src/persist/session_index.lua').read_text()
    require('local function action_matches' not in text and 'local function excluded_actions' not in text,
            'Users repeats the Security coverage interpreter')
    run_focused_module_test(ctx, 'kickside/security', 'policy_coverage_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_fencing_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_coverage_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_operation_test')


def delegation_operation(ctx):
    root = Path(ctx.inst.config['source'])
    text = (root / 'platform/security/src/service/scope_projection.lua').read_text()
    require('preserve_sessions = true' not in text and 'meta.delegation_fencer' in text
            and 'sessions_invalidator' not in text,
            'Projection selects delegation fencing through a session revocation flag')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_fencing_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_coverage_test')
    run_focused_module_test(ctx, 'kickside/users', 'token_continuity_operation_test')
    run_focused_module_test(ctx, 'kickside/users', 'login_scope_test')
    run_focused_module_test(ctx, 'kickside/users', 'delegation_fencing_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_projection_test')


def custom_revocation_binding(ctx):
    run_focused_module_test(ctx, "kickside/users", "custom_revocation_binding_test")


def policy_scope_capacity(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'policy_binding_continuity_test')
    run_focused_module_test(ctx, 'kickside/security', 'policy_coverage_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_projection_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_projector_lifecycle_test')
    root = Path(ctx.inst.config['replace']['kickside/security']).parents[1]
    run_focused_app_test(ctx, root / 'app/test', 'compact_user_runtime_policy_test')


REGISTRY = [
    Scenario('regression_composed_policy_scope_capacity', 'regression', policy_scope_capacity,
             issues=('DATAFLOW-EXECUTION-FRAME-POLICY-CAP', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario("regression_custom_session_revocation_binding", "regression", custom_revocation_binding,
             issues=("SECURITY-CUSTOM-REVOCATION-BINDING-CONTINUITY",)),
    Scenario('regression_shared_credential_eligibility', 'regression', credential_owner,
             issues=('CANON-CREDENTIAL-ELIGIBILITY-ORCHESTRATION',)),
    Scenario('regression_security_policy_coverage_owner', 'regression', coverage_owner,
             issues=('CANON-SECURITY-POLICY-COVERAGE-OWNER',)),
    Scenario('regression_explicit_delegation_fencing', 'regression', delegation_operation,
             issues=('CANON-EXPLICIT-DELEGATION-FENCING',)),
]
