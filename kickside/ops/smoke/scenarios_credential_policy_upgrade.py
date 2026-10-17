"""Revoke obsolete captured policy ceilings without changing their evidence."""
from harness import Scenario
from module_harness import run_focused_module_test


def credentials(ctx):
    run_focused_module_test(ctx, "kickside/mcp", "policy_retirement_upgrade_test")


REGISTRY = [
    Scenario("credential_policy_retirement_upgrade", "regression", credentials,
             issues=("MCP-STORED-RETIRED-POLICY-CREDENTIALS",)),
]
