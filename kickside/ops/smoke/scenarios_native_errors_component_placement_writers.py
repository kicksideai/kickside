"""Creation and placement writers preserve native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def placement_writers(ctx):
    for pattern in ("placement_writer_native_test", "placement_test", "canonical_register_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_placement_writers", "regression", placement_writers, issues=("NE-228",), parallel=('native-root:kickside/component',))]
