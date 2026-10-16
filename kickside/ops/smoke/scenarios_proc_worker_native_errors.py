"""Proc workers carry native failures through the runtime EXIT boundary."""
from harness import Scenario
from module_harness import run_focused_module_test


def proc_worker_native_errors(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_worker_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "dispatch_outcome_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "dispatch_cause_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "loop_test")
    run_focused_module_test(ctx, "kickside/jobs", "child_exit_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_supervision_test")
    run_focused_module_test(ctx, "kickside/uploads", "text_processor_test")
    run_focused_module_test(ctx, "kickside/kb10", "source_worker_test")
    run_focused_module_test(ctx, "chestor/journal", "journal_backend_e2e_test")


REGISTRY = [Scenario("proc_worker_native_errors", "regression", proc_worker_native_errors,
                     issues=("DESIGN-PROC-WORKER-NATIVE-ERRORS",))]
