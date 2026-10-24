"""Core HTTP reads preserve complete native failure envelopes."""
from harness import Scenario
from module_harness import run_focused_module_test


def http_reads(ctx):
    run_focused_module_test(ctx, "kickside/core", "http_read_native_test")
    run_focused_module_test(ctx, "kickside/core", "job_history_pagination_test")


REGISTRY = [Scenario("native_errors_core_http_reads", "regression", http_reads, issues=("NE-234",), parallel=('native-root:kickside/core',))]
