"""Source acquisition observes both round and job lease fences."""
from harness import Scenario
from module_harness import run_focused_module_test


def pull_fence(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'round_pull_fence_test')
    run_focused_module_test(ctx, 'kickside/automation', 'source_samples_test')


REGISTRY = [Scenario('automation_source_pull_fence', 'regression', pull_fence,
                     issues=('AUTOMATION-SOURCE-PULL-FENCE',))]
