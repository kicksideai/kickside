"""Canonical enqueue preserves native dependencies, rollback causes and insert proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def enqueue(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "enqueue_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "job_enqueue_test")


REGISTRY = [Scenario("native_errors_enqueue", "regression", enqueue, issues=("NE-164",), parallel=('native-root:kickside/jobs',))]
