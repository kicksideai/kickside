"""Thread natural identity survives delimiter collisions and old/new execution."""
from harness import Scenario
from module_harness import run_focused_module_test


def natural_key_integrity(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'natural_key_integrity_test')


REGISTRY = [
    Scenario('core_thread_natural_key_integrity', 'regression', natural_key_integrity,
             issues=('CORE-THREAD-NATURAL-KEY-AMBIGUITY',)),
]


def published_natural_key_upgrade(ctx):
    from ops.compat.integration.thread_natural_key_upgrade import verify
    verify(ctx)


REGISTRY.append(Scenario('core_thread_natural_key_hub_update', 'regression', published_natural_key_upgrade,
                         issues=('CORE-THREAD-NATURAL-KEY-AMBIGUITY',), instance_setup=True))
