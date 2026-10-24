"""Lease heartbeat process exits retain native causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def heartbeat(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_heartbeat_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_reclaim_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_supervision_test")


REGISTRY = [Scenario("native_errors_jobs_lease_heartbeat", "regression", heartbeat, issues=("NE-183",), parallel=('native-root:kickside/jobs',))]
