"""Actor-source identity failures retain native classification."""
from harness import Scenario
from module_harness import run_focused_module_test


def actor_identity_errors(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'actor_instance_native_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')


REGISTRY = [Scenario('native_errors_automation_actor_identity', 'regression', actor_identity_errors,
                     issues=('NE-47',))]
