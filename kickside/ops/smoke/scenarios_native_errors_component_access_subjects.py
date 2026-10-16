"""Access subjects preserve native dependency error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def access_subjects(ctx):
    run_focused_module_test(ctx, "kickside/component", "access_subject_native_test")
    run_focused_module_test(ctx, "kickside/component", "access_subjects_test")


REGISTRY = [Scenario("native_errors_component_access_subjects", "regression", access_subjects, issues=("NE-212",))]
