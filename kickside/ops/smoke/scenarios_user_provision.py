"""Provisioning uses the target owner's module authority and preserves lookup failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def owner_scope(ctx):
    run_focused_module_test(ctx, "kickside/core", "provision_test")


def declaration_read(ctx):
    run_focused_module_test(ctx, "kickside/component", "autoinit_test")
    run_focused_module_test(ctx, "kickside/core", "provision_native_test")


REGISTRY = [
    Scenario("user_provision_owner_scope", "regression", owner_scope,
             issues=("UPLOAD-INTENT-RECOVERY-REGISTRY-ACCESS",)),
    Scenario("user_provision_declaration_read", "regression", declaration_read,
             issues=("USER-PROVISION-DECLARATION-READ-ERROR", "DRAIN-AWARE-DECLARATION")),
]
