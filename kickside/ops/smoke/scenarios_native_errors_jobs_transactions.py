"""Public Jobs transaction boundaries preserve native dependency and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def transactions(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "transaction_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "job_enqueue_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_cancellation_test")
    run_focused_module_test(ctx, "kickside/jobs", "completion_contract_test")


REGISTRY = [Scenario("native_errors_jobs_transactions", "regression", transactions, issues=("NE-168",), parallel=('native-root:kickside/jobs',))]
