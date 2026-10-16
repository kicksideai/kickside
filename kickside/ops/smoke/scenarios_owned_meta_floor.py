"""Owner metadata protection and durable monotonic storage."""
from harness import Scenario
from module_harness import run_focused_module_test


def owned_meta_floor(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'owned_meta_floor_test', lint=True)


REGISTRY = [Scenario('component_owned_meta_floor', 'regression', owned_meta_floor,
    issues=('COMPONENT-OWNED-METADATA-FLOOR',))]
