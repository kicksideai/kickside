# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Upload admission is atomic and OCR failures remain visible on retained files."""
from harness import Scenario
from module_harness import run_focused_module_test


def atomic_admission(ctx):
    run_focused_module_test(ctx, "kickside/uploads", "uploads_component_ownership_test")
    run_focused_module_test(ctx, "kickside/uploads", "uploads_gateway_completion_test")
    run_focused_module_test(ctx, "kickside/uploads", "uploads_filtered_metadata_test")
    run_focused_module_test(ctx, "kickside/uploads", "intent_bootstrap_test")


def ocr_failure(ctx):
    run_focused_module_test(ctx, "kickside/llm-ocr", "ocr_stage_test")


def metadata_durability(ctx):
    run_focused_module_test(ctx, "kickside/uploads", "uploads_durable_failures_test")


def archive_folders(ctx):
    run_focused_module_test(ctx, "chestor/workspace", "workspace_upload_stage_test")
    run_focused_module_test(ctx, "kickside/uploads", "uploads_operation_archive_test")


REGISTRY = [
    Scenario("b_uploads_archive_folders", "regression", archive_folders,
             issues=("UPLOAD-ARCHIVE-FOLDER-RACE",)),
    Scenario("b_uploads_atomic_admission", "regression", atomic_admission,
             issues=("UPLOAD-ATOMIC-JOB-ADMISSION",)),
    Scenario("b_uploads_ocr_failure", "regression", ocr_failure,
             issues=("UPLOAD-OCR-ERROR-VISIBILITY",)),
    Scenario("b_uploads_metadata_durability", "regression", metadata_durability,
             issues=("UPLOAD-STAGE-METADATA-DURABILITY",)),
]
