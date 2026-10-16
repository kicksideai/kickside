"""Ensured projection declarations converge without resetting their read models."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_declaration_refresh(ctx):
    run_focused_module_test(ctx, "kickside/core", "registration_ensure_test")
    run_focused_module_test(ctx, "kickside/core", "thread_projection_declarations_test")
    run_focused_module_test(ctx, "chestor/journal", "journal_maintenance_test")
    run_focused_module_test(ctx, "chestor/journal", "journal_adversarial_test")


REGISTRY = [Scenario("core_projection_declaration_refresh", "regression", projection_declaration_refresh,
                     issues=("DESIGN-CORE-PROJECTION-ENSURE-FILTER",))]
