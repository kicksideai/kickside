"""Slot purge retains native dependency and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def slot_purge(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "slot_purge_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "owner_retention_test")
    run_focused_module_test(ctx, "kickside/jobs", "slot_purge_race_test")


REGISTRY = [Scenario("native_errors_slot_purge", "regression", slot_purge, issues=("NE-157",))]
