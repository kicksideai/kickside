# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Section B: retain native failure causes and durable process decisions."""
from harness import Scenario
from module_harness import run_focused_module_test


def channel_persistence(ctx):
    run_focused_module_test(ctx, 'kickside/channel', 'turn_upgrade_test')


def security_nonblocking_drain(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'scope_projector_lifecycle_test')


def skill_frontmatter(ctx):
    run_focused_module_test(ctx, 'kickside/skills', 'frontmatter_test')


def reflection_tree(ctx):
    run_focused_module_test(ctx, 'kickside/self-reflection', 'self_reflection_test')


def realtime_error_cause(ctx):
    run_focused_module_test(ctx, 'kickside/realtime', 'realtime_cause_test')


def navigation_errors(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'nav_providers_test')


def current_user_id(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_admin_creation_test')


REGISTRY = [
    Scenario('section_b_current_user_id', 'regression', current_user_id,
             issues=('B-MISC-CURRENT-USER-ID',)),
    Scenario('section_b_skill_frontmatter', 'regression', skill_frontmatter,
             issues=('B-MISC-SKILLS-FRONTMATTER',)),
    Scenario('section_b_reflection_tree', 'regression', reflection_tree,
             issues=('B-MISC-REFLECTION-DEPTH',)),
    Scenario('section_b_realtime_error_cause', 'regression', realtime_error_cause,
             issues=('B-MISC-REALTIME-ERROR-CAUSE',)),
    Scenario('section_b_navigation_errors', 'regression', navigation_errors,
             issues=('B-MISC-NAVIGATION-ERRORS',)),
    Scenario('section_b_channel_persistence', 'regression', channel_persistence,
             issues=('B-MISC-CHANNEL-PERSISTENCE',)),
    Scenario('section_b_security_nonblocking_drain', 'regression', security_nonblocking_drain,
             issues=('SECURITY-SCOPE-PROJECTION-LIVENESS',)),
]
