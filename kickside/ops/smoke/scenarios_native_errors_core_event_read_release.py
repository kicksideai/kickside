"""Core event reads preserve native operations and ordered release failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def event_reads(ctx):
    run_focused_module_test(ctx, "kickside/core", "event_read_release_test")
    run_focused_module_test(ctx, "kickside/core", "events_pullable_test")


REGISTRY = [Scenario("native_errors_core_event_read_release", "regression", event_reads, issues=("NE-237",))]
