"""Chestor uses native indexes, stored hierarchy columns and explicit failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def journal_design_integrity(ctx):
    run_focused_module_test(ctx, "chestor/journal", "journal_design_integrity_test")


def roadmap_json_integrity(ctx):
    run_focused_module_test(ctx, "chestor/roadmap", "roadmap_materializer_integrity_test")


REGISTRY = [
    Scenario("slop_chestor_journal_integrity", "regression", journal_design_integrity,
             issues=("SLOP-CHESTOR-VECTOR-DIMENSIONS", "SLOP-CHESTOR-MAINTAINER-FAILURES",
                     "SLOP-CHESTOR-GRAPH-HIERARCHY-COLUMNS", "SLOP-CHESTOR-JUDGE-CONTRACT",
                     "SLOP-CHESTOR-HANDLE-RESOLUTION")),
    Scenario("slop_chestor_roadmap_json", "regression", roadmap_json_integrity,
             issues=("SLOP-CHESTOR-ROADMAP-JSON",)),
]
