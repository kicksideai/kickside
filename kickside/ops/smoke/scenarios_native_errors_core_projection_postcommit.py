"""Postcommit projection notifications retain causes and stop durable replay."""
from harness import Scenario
from module_harness import run_focused_module_test


def completion(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_postcommit_test")
    run_focused_module_test(ctx, "kickside/core", "projection_postcommit_retry_test")
    run_focused_module_test(ctx, "kickside/core", "control_error_test")


REGISTRY = [Scenario("native_errors_core_projection_postcommit", "regression", completion, issues=("NE-265",), parallel=('native-root:kickside/core',))]
