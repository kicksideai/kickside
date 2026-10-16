# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Section A: preserve explicit contracts and propagate owner failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def branding_read(ctx):
    run_focused_module_test(ctx, "kickside/ui", "branding_storage_test")


def sdk_context(ctx):
    run_focused_module_test(ctx, "kickside/code-execution", "code_execution_test")


def kb10_external_identity(ctx):
    run_focused_module_test(ctx, "kickside/kb10", "source_worker_test")
    run_focused_module_test(ctx, "kickside/kb10", "source_worker_lineage_test")


def snippet_validation(ctx):
    run_focused_module_test(ctx, "kickside/transform", "snippet_native_test")


def graph_error_kinds(ctx):
    run_focused_module_test(ctx, "chestor/journal", "journal_derivation_test")


def upload_folder_error(ctx):
    run_focused_module_test(ctx, "chestor/workspace", "workspace_upload_stage_test")


def journal_maintenance(ctx):
    run_focused_module_test(ctx, "chestor/journal", "journal_maintenance_test")


def model_unknown_limits(ctx):
    run_focused_module_test(ctx, "kickside/models", "tsplit_models_smoke_test_discovery_model_limits_floor")
    run_focused_module_test(ctx, "kickside/models", "discovery_retains_assignments_test")


def model_reference_error(ctx):
    run_focused_module_test(ctx, "kickside/models", "reference_openrouter_test")


def knowledge_plan_contract(ctx):
    run_focused_module_test(ctx, "kickside/knowledge", "planner_test")


def skill_file_content(ctx):
    run_focused_module_test(ctx, "kickside/skills", "access_errors_test")


def skill_prompt_reads(ctx):
    run_focused_module_test(ctx, "kickside/skills", "pinned_skills_test")
    run_focused_module_test(ctx, "kickside/skills", "active_skills_test")


REGISTRY = [
    Scenario("section_a_journal_maintenance", "regression", journal_maintenance,
             issues=("SLOP-CHESTOR-MAINTENANCE-COMPATIBILITY",)),
    Scenario("section_a_skill_prompt_reads", "regression", skill_prompt_reads,
             issues=("SLOP-SKILL-PROMPT-READ-ERROR",)),
    Scenario("section_a_model_unknown_limits", "regression", model_unknown_limits,
             issues=("SLOP-MODEL-UNKNOWN-LIMITS",)),
    Scenario("section_a_model_reference_error", "regression", model_reference_error,
             issues=("SLOP-MODEL-REFERENCE-ERROR",)),
    Scenario("section_a_knowledge_plan_contract", "regression", knowledge_plan_contract,
             issues=("SLOP-KNOWLEDGE-PLAN-CONTRACT",)),
    Scenario("section_a_skill_file_content", "regression", skill_file_content,
             issues=("SLOP-SKILL-FILE-CONTENT",)),
    Scenario("section_a_graph_error_kinds", "regression", graph_error_kinds,
             issues=("SLOP-CHESTOR-GRAPH-ERROR-KINDS",)),
    Scenario("section_a_upload_folder_error", "regression", upload_folder_error,
             issues=("SLOP-CHESTOR-UPLOAD-FOLDER-ERROR",)),
    Scenario("section_a_sdk_context", "regression", sdk_context,
             issues=("SLOP-SDK-CONTEXT-ERROR",)),
    Scenario("section_a_kb10_external_identity", "regression", kb10_external_identity,
             issues=("SLOP-KB10-EXTERNAL-IDENTITY",)),
    Scenario("section_a_snippet_validation", "regression", snippet_validation,
             issues=("SLOP-TRANSFORM-SNIPPET-VALIDATION",)),
    Scenario("section_a_branding_read", "regression", branding_read,
             issues=("SLOP-UI-READ-IMPORT",)),
]
