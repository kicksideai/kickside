"""Generator request refusals retain native validation metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def generation_request_errors(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'generation_native_validation_test')
    run_focused_module_test(ctx, 'kickside/transform', 'gen_flow_test')


REGISTRY = [Scenario('native_errors_transform_generation', 'regression', generation_request_errors,
                     issues=('NE-51',))]
