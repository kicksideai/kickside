"""Worker assignment failures retain native fields and stop subsequent work."""
from harness import Scenario
from module_harness import run_focused_module_test


def assignment(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_assignment_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_release_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "loop_test")


REGISTRY = [Scenario("native_errors_jobs_worker_assignment", "regression", assignment, issues=("NE-276",), parallel=('native-root:kickside/jobs',))]
