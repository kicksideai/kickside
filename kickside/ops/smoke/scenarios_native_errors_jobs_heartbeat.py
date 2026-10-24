"""Worker heartbeat failures preserve native fields through rollback and exit."""
from harness import Scenario
from module_harness import run_focused_module_test


def heartbeat(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pulse_test")
    run_focused_module_test(ctx, "kickside/jobs", "start_fence_native_test")


REGISTRY = [Scenario("native_errors_jobs_heartbeat", "regression", heartbeat, issues=("NE-144",), parallel=('native-root:kickside/jobs',))]
