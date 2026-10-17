"""Explicit transform skips preserve reasons and prepared delivery outcomes."""
from harness import Scenario
from module_harness import run_focused_module_test


def transform_skip(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'skip_outcome_test')
    run_focused_module_test(ctx, 'kickside/sync', 'round_delivery_test')


REGISTRY = [Scenario('regression_transform_skip', 'regression', transform_skip,
                     issues=('TRANSFORM-EXPLICIT-SKIP',))]
