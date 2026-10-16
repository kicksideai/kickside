"""Malformed transform apply requests retain native error metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def transform_request_errors(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'apply_native_validation_test')
    run_focused_module_test(ctx, 'kickside/transform', 'tsplit_strategy_test_strategy_contract')


REGISTRY = [Scenario('native_errors_transform_request', 'regression', transform_request_errors,
                     issues=('NE-41',))]
