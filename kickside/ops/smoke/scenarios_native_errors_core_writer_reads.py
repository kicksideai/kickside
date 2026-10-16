"""Writer dialect/read/authority gates retain native failures and mandatory proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def reads(ctx):
    run_focused_module_test(ctx, "kickside/core", "writer_read_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_writer_reads", "regression", reads, issues=("NE-249",))]
