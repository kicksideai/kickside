"""Host delegation declares its trusted component read ownership."""
from harness import Scenario
from module_harness import run_focused_module_test


def roster(ctx):
    run_focused_module_test(ctx, "kickside/component", "trusted_read_guard_test")


REGISTRY = [Scenario("native_errors_delegation_read_roster", "regression", roster, issues=("NE-112",))]
