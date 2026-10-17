"""Known failing branding and skill-bundle update probes."""
from harness import Scenario
from module_harness import run_focused_module_test


def branding(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'branding_test')


def skill_bundles(ctx):
    run_focused_module_test(ctx, 'kickside/skills', 'bundles_test')


REGISTRY = [
    Scenario('hub_update_branding_image', 'regression', branding,
             issues=('UI-FILESYSTEM-BRANDING-UPDATE',)),
    Scenario('hub_update_skill_bundles', 'regression', skill_bundles,
             issues=('SKILLS-ARTIFACT-BUNDLE-UPDATE',)),
]
