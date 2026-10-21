# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Blocked consumers retain the input and delivery evidence needed for repair."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_block_retention(ctx):
    run_focused_module_test(ctx, "kickside/core", "block_retention_test")


def dead_ledger_retention(ctx):
    run_focused_module_test(ctx, "kickside/automation", "dead_retention_test")
    run_focused_module_test(ctx, "kickside/automation", "recovery_dispatch_test")


REGISTRY = [
    Scenario("projection_block_retention", "regression", projection_block_retention,
             issues=("PROJECTION-BLOCK-INPUT-RETENTION",)),
    Scenario("automation_dead_ledger_retention", "regression", dead_ledger_retention,
             issues=("AUTOMATION-DEAD-LEDGER-RETENTION",)),
]
