# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Platform catalog, projection and skill version integrity regressions."""
from harness import Scenario
from module_harness import run_focused_module_test


def security_catalog_failures(ctx):
    run_focused_module_test(ctx, "kickside/security", "catalog_registry_failure_test")
    run_focused_module_test(ctx, "kickside/security", "catalog_native_failure_test")
    run_focused_module_test(ctx, "kickside/security", "scope_catalog_test")

def security_projection_reads(ctx):
    run_focused_module_test(ctx, "kickside/security", "projection_registry_failure_test")

def security_fencer_configuration(ctx):
    run_focused_module_test(ctx, "kickside/security", "scope_projection_test")

def security_database_configuration(ctx):
    run_focused_module_test(ctx, "kickside/security", "database_config_test")

def security_request_delivery(ctx):
    run_focused_module_test(ctx, "kickside/security", "trigger_request_failure_test")
    run_focused_module_test(ctx, "kickside/security", "scope_reconcile_handoff_test")

def skills_version_integrity(ctx):
    run_focused_module_test(ctx, "kickside/skills", "skill_runtime_test")
    run_focused_module_test(ctx, "kickside/skills", "version_append_test")
    run_focused_module_test(ctx, "kickside/skills", "owned_bundle_test")
    run_focused_module_test(ctx, "kickside/skills", "state_test")
    run_focused_module_test(ctx, "kickside/skills", "http_status_test")
    run_focused_module_test(ctx, "kickside/skills", "storage_config_test")

def reflection_related_read(ctx):
    run_focused_module_test(ctx, "kickside/self-reflection", "self_reflection_test")


REGISTRY = [
    Scenario("slop_security_projection_reads", "regression", security_projection_reads, issues=("SLOP-SECURITY-PROJECTION-REGISTRY-ERROR",)),
    Scenario("slop_security_catalog_failures", "regression", security_catalog_failures, issues=('SLOP-SECURITY-CATALOG-REGISTRY-ERROR', 'SLOP-SECURITY-CATALOG-UNKNOWN-POLICY')),
    Scenario("slop_security_fencer_configuration", "regression", security_fencer_configuration, issues=('SLOP-SECURITY-FENCER-UNCONFIGURED',)),
    Scenario("slop_security_database_configuration", "regression", security_database_configuration, issues=('SLOP-SECURITY-DB-CONFIGURATION',)),
    Scenario("slop_security_request_delivery", "regression", security_request_delivery, issues=('SLOP-SECURITY-TRIGGER-ERROR',)),
    Scenario("slop_skills_version_integrity", "regression", skills_version_integrity, issues=('SLOP-SKILLS-PINNED-VERSION', 'SLOP-SKILLS-MANIFEST-LOSS', 'SLOP-SKILLS-MISSING-PROJECTION', 'SLOP-SKILLS-DUPLICATE-EVENT-LOOKUP', 'SLOP-SKILLS-LATEST-VERSION-EVENT')),
    Scenario("slop_reflection_related_read", "regression", reflection_related_read, issues=('SLOP-REFLECTION-RELATED-READ-ERROR',)),
]
