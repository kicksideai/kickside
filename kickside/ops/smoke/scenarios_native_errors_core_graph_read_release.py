"""Core topology contracts retain native failures and complete release causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def topology(ctx):
    run_focused_module_test(ctx, "kickside/core", "graph_read_release_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_graph_read_release", "regression", topology, issues=("NE-238",))]
