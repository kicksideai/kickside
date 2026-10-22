"""Authorized resume retains positions and receipts after authority restoration."""
from harness import Scenario
from module_harness import run_focused_module_test


def restored_identity_resume(ctx):
    run_focused_module_test(ctx, "kickside/automation", "round_control_test")
    run_focused_module_test(ctx, "kickside/automation", "round_authority_test")


REGISTRY = [Scenario("automation_restored_identity_resume", "regression", restored_identity_resume,
                     issues=("AUTOMATION-RESTORED-IDENTITY-RESUME",))]
