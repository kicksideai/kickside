# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Blocked consumers retain the input and delivery evidence needed for repair."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_block_retention(ctx):
    run_focused_module_test(ctx, "kickside/core", "block_retention_test")


def existing_projection_block_retention(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_pin_migration_test")


def existing_drive_repair(ctx):
    for entry in ("drive_repair_test", "drive_repair_deep_test", "drive_repair_alias_test",
                  "drive_repair_races_test", "drive_repair_forward_test"):
        run_focused_module_test(ctx, "kickside/automation", entry, lint=entry == "drive_repair_test")
    run_focused_module_test(ctx, "kickside/jobs", "lifecycle_helpers_test")


def dead_ledger_retention(ctx):
    run_focused_module_test(ctx, "kickside/automation", "dead_retention_test")
    run_focused_module_test(ctx, "kickside/automation", "recovery_dispatch_test")


REGISTRY = [
    Scenario("automation_existing_drive_repair", "regression", existing_drive_repair,
             issues=("AUTOMATION-EXISTING-SLOT-REFERENCES",)),
    Scenario("existing_projection_block_retention", "regression", existing_projection_block_retention,
             issues=("PROJECTION-EXISTING-BLOCK-RETENTION",)),
    Scenario("projection_block_retention", "regression", projection_block_retention,
             issues=("PROJECTION-BLOCK-INPUT-RETENTION",)),
    Scenario("automation_dead_ledger_retention", "regression", dead_ledger_retention,
             issues=("AUTOMATION-DEAD-LEDGER-RETENTION",)),
]
