"""Core consumers preserve Component service error envelopes."""
from harness import Scenario
from module_harness import run_focused_module_test


def core_component_native_errors(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'canonical_register_test')
    run_focused_module_test(ctx, 'kickside/core', 'component_port_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'contract_test')


REGISTRY = [
    Scenario('native_errors_core_component_port', 'regression', core_component_native_errors,
             issues=('NE-17', 'NE-19'), parallel=('native-root:kickside/component', 'native-root:kickside/core')),
]
