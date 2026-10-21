"""Jobs transitions preserve ordered locks, retry floors and parked history."""
from harness import Scenario
from module_harness import run_focused_module_test


def output_completion(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_apply_native_test_outcomes")
    run_focused_module_test(ctx, "kickside/jobs", "wake_recovery_test")

def infrastructure_failure(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "terminal_failure_test")

def slot_retry_floor(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "backoff_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_outcomes_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_completion_native_test")

def independent_parking(ctx):
    run_focused_module_test(ctx, "kickside/core", "slot_failure_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_completion_test")


REGISTRY = [
    Scenario("jobs_output_completion", "regression", output_completion, issues=("JOBS-OUTPUT-COMPLETION-LOCK-ORDER",)),
    Scenario("jobs_infrastructure_failure", "regression", infrastructure_failure, issues=("JOBS-INFRASTRUCTURE-CLASSIFICATION",)),
    Scenario("jobs_slot_retry_floor", "regression", slot_retry_floor, issues=("JOBS-SLOT-RETRY-FLOOR",)),
    Scenario("jobs_independent_parking", "regression", independent_parking, issues=("JOBS-INDEPENDENT-PARKING",)),
]
