"""Regression coverage for native function-result failures."""
from harness import Scenario, require


def cyclic_function_result(ctx):
    from module_harness import _private_suite_root, run_focused_app_test

    fixture = _private_suite_root() / 'ops/smoke/fixtures/runtime-cyclic-result'
    require(fixture.is_dir(), 'Private cyclic-result fixture is absent: ' + str(fixture))
    run_focused_app_test(ctx, fixture, 'cyclic_result_test')


REGISTRY = [Scenario('upstream_funcs_cyclic_result', 'regression', cyclic_function_result,
                     issues=('UPSTREAM-FUNCS-CYCLIC-RESULT',))]
