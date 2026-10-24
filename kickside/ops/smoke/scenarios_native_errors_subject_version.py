"""Subject version reads retain native causes and require successful proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def subject_fields(ctx):
    run_focused_module_test(ctx, "kickside/core", "subject_version_native_test")
    run_focused_module_test(ctx, "kickside/core", "subject_test")


REGISTRY = [Scenario("native_errors_subject_version", "regression", subject_fields, issues=("NE-132",), parallel=('native-root:kickside/core',))]
