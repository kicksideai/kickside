"""Transactional append refuses missing mandatory SQL and wake completion proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def proof(ctx):
    run_focused_module_test(ctx, "kickside/core", "append_proof_test")
    run_focused_module_test(ctx, "kickside/core", "append_native_test")
    run_focused_module_test(ctx, "kickside/core", "append_test")


REGISTRY = [Scenario("native_errors_core_append_proof", "regression", proof, issues=("NE-256",))]
