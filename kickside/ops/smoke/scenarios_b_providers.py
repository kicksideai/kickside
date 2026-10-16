"""Connection supervisor readiness and converter native error contracts."""
from harness import Scenario, require
from module_harness import run_focused_app_test, run_focused_module_test


def hub_readiness(ctx):
    run_focused_module_test(ctx, "kickside/connection", "worker_plan_test")
    for provider in ("discord", "slack", "telegram"):
        run_focused_module_test(ctx, "kickside/" + provider, "hub_readiness_test")


def connection_soak(ctx):
    run_focused_module_test(ctx, "kickside/discord", "hub_soak_test")


def converter_errors(ctx):
    for module in ("doc2md", "html2pdf", "pdf2image"):
        root = ctx.inst.config.get("replace", {}).get("kickside/" + module)
        require(root, "Converter guard requires a local replacement: " + module)
        run_focused_app_test(ctx, root, "native_errors_test")


REGISTRY = [
    Scenario("b_providers_hub_readiness", "regression", hub_readiness,
             issues=("B6-CONNECTION-WORKER-READINESS",)),
    Scenario("b_providers_connection_soak", "regression", connection_soak,
             issues=("B6-CONNECTION-WORKER-READINESS",)),
    Scenario("b_providers_converter_errors", "regression", converter_errors,
             issues=("B10-CONVERTER-NATIVE-ERRORS",)),
]
