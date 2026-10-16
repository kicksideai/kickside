"""Audit policy dependencies retain native failures and permanent configuration errors stop retries."""
from harness import Scenario
from module_harness import run_focused_module_test

def audit_policy(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'audit_policy_native_test')

REGISTRY = [Scenario('native_errors_component_audit_policy', 'regression', audit_policy, issues=('NE-82',))]
