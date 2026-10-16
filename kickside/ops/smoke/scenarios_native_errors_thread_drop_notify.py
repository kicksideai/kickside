"""Thread drop notification errors remain native through teardown."""
from harness import Scenario
from module_harness import run_focused_module_test


def drop_fields(ctx):
    run_focused_module_test(ctx, "kickside/core", "drop_notify_native_test")
    run_focused_module_test(ctx, "kickside/core", "component_port_native_test")
    run_focused_module_test(ctx, "kickside/core", "contract_lifecycle_test")


REGISTRY = [Scenario("native_errors_thread_drop_notify", "regression", drop_fields, issues=("NE-131",))]
