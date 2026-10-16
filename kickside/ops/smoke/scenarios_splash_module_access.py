"""Splash capability declarations preserve module group isolation."""
from harness import Scenario
from scenarios import all_checks
from module_harness import run_focused_module_test


def splash_module_access(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'splash_test')


REGISTRY = [Scenario('regression_splash_module_access', 'regression', splash_module_access,
                     issues=('SECURITY-HISTORICAL-GROUP-SHELL-ISOLATION',))]


def component_module_surfaces(ctx):
    all_checks(ctx.inst, [("Dashboard navigation", lambda: run_focused_module_test(ctx, "kickside/dashboard", 'module_access_policy')),
                         ("Onboarding capabilities", lambda: run_focused_module_test(ctx, "kickside/agent-onboarding", "suite"))])


REGISTRY.append(Scenario("regression_component_module_surfaces", "regression", component_module_surfaces,
                         issues=("SECURITY-HISTORICAL-GROUP-SHELL-ISOLATION", "IDENTITY-COMPONENT-HARNESS-ENGINE")))
