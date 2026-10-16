"""HTTP responses preserve native payloads across shared and Core adapters."""
from harness import Scenario
from module_harness import run_focused_module_test


def http_response(ctx):
    run_focused_module_test(ctx, "kickside/contract", "http_response_test")
    run_focused_module_test(ctx, "kickside/core", "http_error_matrix_test")


REGISTRY = [Scenario("native_errors_http_response", "regression", http_response, issues=("NE-233",))]
