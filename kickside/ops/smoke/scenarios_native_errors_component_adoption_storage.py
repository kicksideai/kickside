"""Adoption preserves native storage and codec failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def adoption_storage(ctx):
    for pattern in ("adoption_storage_native_test", "adopt_component_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_adoption_storage", "regression", adoption_storage, issues=("NE-227",), parallel=('native-root:kickside/component',))]
