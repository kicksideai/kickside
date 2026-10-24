"""Lease and termination recovery preserves native dependency and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def reclaim(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "reclaim_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "reclaim_native_test_terminated")
    run_focused_module_test(ctx, "kickside/jobs", "reclaim_native_test_live")
    run_focused_module_test(ctx, "kickside/jobs", "termination_recovery_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_reclaim_test")
    run_focused_module_test(ctx, "kickside/jobs", "run_history_reclaim_test")
    run_focused_module_test(ctx, "kickside/jobs", "termination_recovery_test")


REGISTRY = [Scenario("native_errors_reclaim", "regression", reclaim, issues=("NE-166", "RECLAIM-PROCESS-LOOKUP-TRANSACTION"), parallel=('native-root:kickside/jobs',))]
