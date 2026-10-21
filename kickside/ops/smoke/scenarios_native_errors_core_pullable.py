"""Thread event pullable failures retain native fields and existing envelopes."""
from harness import Scenario
from module_harness import run_focused_module_test


def pullable(ctx):
    run_focused_module_test(ctx, "kickside/core", "pullable_native_test")
    run_focused_module_test(ctx, "kickside/core", "events_pullable_test")


REGISTRY = [Scenario("native_errors_core_pullable", "regression", pullable, issues=("NE-117", "THREAD-EVENT-TYPE-REQUEST-FILTER"))]
