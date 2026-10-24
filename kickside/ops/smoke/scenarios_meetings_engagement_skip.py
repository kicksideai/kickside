"""Unmatched engagements declare a transform skip with a reason."""
from harness import Scenario
from module_harness import run_focused_module_test


def meetings_engagement_skip(ctx):
    run_focused_module_test(ctx, 'spiralscout/meetings', 'crm_engagement_test')


def meetings_nested_library_injection(ctx):
    run_focused_module_test(ctx, 'spiralscout/meetings', 'inbox_resolve_test')


def meetings_shared_access(ctx):
    for entry in ('api_test_part_2', 'api_test_part_4', 'api_test_part_5'):
        run_focused_module_test(ctx, 'spiralscout/meetings', entry)


REGISTRY = [Scenario('regression_meetings_engagement_skip', 'regression',
                     meetings_engagement_skip, issues=('MEETINGS-EXPLICIT-SKIP',),
                     source_components=('spiralscout/meetings',)),
            Scenario('regression_meetings_nested_library_injection', 'regression',
                     meetings_nested_library_injection,
                     issues=('MEETINGS-HARNESS-NESTED-INJECTION',),
                     source_components=('spiralscout/meetings',)),
            Scenario('regression_meetings_shared_access', 'regression',
                     meetings_shared_access,
                     issues=('MEETINGS-SHARED-IMPLEMENTATION-ACCESS',),
                     source_components=('spiralscout/meetings',))]
