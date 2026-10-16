"""Missing mutation completion proof retains permanent retry policy."""
from harness import Scenario
from module_harness import run_focused_module_test

def proof(ctx):
    run_focused_module_test(ctx, "kickside/core", "mutation_proof_test")
    run_focused_module_test(ctx, "kickside/core", "mutation_proof_retry_test")
    run_focused_module_test(ctx, "kickside/core", "resource_mutations_test")
    run_focused_module_test(ctx, "kickside/core", "resource_mutations_retry_test")

REGISTRY = [Scenario("native_errors_core_mutation_proof", "regression", proof, issues=("NE-289",))]
