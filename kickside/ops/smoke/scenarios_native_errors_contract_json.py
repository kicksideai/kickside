"""Regression coverage for native function-result failures."""
from harness import Scenario


def cyclic_function_result(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    run_focused_app_test(ctx, Path(ctx.inst.config['source']) / 'ops/smoke/fixtures/runtime-cyclic-result',
                         'cyclic_result_test')


REGISTRY = [Scenario('upstream_funcs_cyclic_result', 'regression', cyclic_function_result,
                     issues=('UPSTREAM-FUNCS-CYCLIC-RESULT',))]
