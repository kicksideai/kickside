"""Provider discovery, enrichment, graph identity and mapping failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def recommendation_errors(ctx):
    run_focused_module_test(ctx, "kickside/code-execution", "code_execution_recommend_test")


def enrichment_state_errors(ctx):
    run_focused_module_test(ctx, "kickside/kb10", "enrichment_state_test")


def concept_identity(ctx):
    run_focused_module_test(ctx, "kickside/kb10", "placement_tools_test")
    run_focused_module_test(ctx, "kickside/kb10", "graph_test")


def mapping_errors(ctx):
    run_focused_module_test(ctx, "kickside/hubspot", "config_test")
    run_focused_module_test(ctx, "kickside/hubspot", "pull_core_test")


def memory_lifecycle_errors(ctx):
    run_focused_module_test(ctx, "kickside/memory", "runtime_test")


def ocr_page_batches(ctx):
    run_focused_module_test(ctx, "kickside/llm-ocr", "ocr_stage_test")


REGISTRY = [
    Scenario("slop_providers_memory_lifecycle_errors", "regression", memory_lifecycle_errors,
             issues=("SLOP-PROVIDERS-MEMORY-LIFECYCLE-FAILURE",)),
    Scenario("slop_providers_ocr_page_batches", "regression", ocr_page_batches,
             issues=("SLOP-PROVIDERS-OCR-SPARSE-BATCH",)),
    Scenario("slop_providers_recommendation_errors", "regression", recommendation_errors,
             issues=("SLOP-PROVIDERS-RECOMMEND-MODEL-FAILURE",)),
    Scenario("slop_providers_enrichment_state_errors", "regression", enrichment_state_errors,
             issues=("SLOP-PROVIDERS-ENRICHMENT-STATE-FAILURE",)),
    Scenario("slop_providers_concept_identity", "regression", concept_identity,
             issues=("SLOP-PROVIDERS-CONCEPT-SCAN-CAP",)),
    Scenario("slop_providers_mapping_errors", "regression", mapping_errors,
             issues=("SLOP-PROVIDERS-HUBSPOT-MAPPING-FAILURE",)),
]
