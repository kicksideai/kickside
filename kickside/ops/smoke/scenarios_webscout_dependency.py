"""Search providers require a core that supplies their pagination protocol."""
from harness import Scenario
from module_harness import run_focused_module_test


def provider_protocol(ctx):
    for component in ("kickside/webscout-brave", "kickside/webscout-tavily"):
        run_focused_module_test(ctx, component, "provider_test")


REGISTRY = [Scenario("webscout_provider_dependency", "regression", provider_protocol,
                     issues=("WEBSCOUT-PROVIDER-CORE-MINIMUM",))]
