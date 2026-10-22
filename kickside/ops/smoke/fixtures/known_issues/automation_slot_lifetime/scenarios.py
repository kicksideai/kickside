"""Strict slot lifecycle probes retained for their owning fixes."""
from harness import Scenario
from module_harness import run_focused_module_test


def open_slot_lifetime(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'slot_open_lifetime_test')


REGISTRY = [
    Scenario('automation_open_slot_lifetime', 'regression', open_slot_lifetime,
             issues=('AUTOMATION-UNSERVED-WAKE', 'AUTOMATION-STALE-SLOT-REFERENCE',
                     'AUTOMATION-SOURCE-SLOT-CANCEL-RACE')),
]
