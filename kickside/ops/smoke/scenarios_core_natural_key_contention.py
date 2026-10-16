"""Natural thread registration resolves the transaction winner without polling."""
from harness import Scenario
from module_harness import run_focused_module_test


def natural_key_contention(ctx):
    run_focused_module_test(ctx, "kickside/core", "natural_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "natural_key_integrity_test")
    run_focused_module_test(ctx, "kickside/core", "natural_key_native_test")
    run_focused_module_test(ctx, "kickside/core", "natural_transient_native_test")


REGISTRY = [Scenario("core_natural_key_contention", "regression", natural_key_contention,
                     issues=("DESIGN-CORE-NATURAL-KEY-CONTENTION",))]
