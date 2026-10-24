"""Jobs supervision lookup and delivery failures preserve native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def supervisor(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "supervisor_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "service_signal_test")


REGISTRY = [Scenario("native_errors_jobs_supervisor", "regression", supervisor, issues=("NE-110",), parallel=('native-root:kickside/jobs',))]
