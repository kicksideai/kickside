"""Automation, workflow discovery, and transfer retain dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def slot_provision_failures(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'slot_provision_errors_test')


def dispatch_slot_lifecycle(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'recovery_dispatch_test')


def workflow_discovery_failures(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'published_catalog_errors_test')


def workflow_management_failures(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'agent_tools_test')


def transfer_cleanup_failures(ctx):
    run_focused_module_test(ctx, 'kickside/transfer', 'orchestrator_directory_test')
    run_focused_module_test(ctx, 'kickside/transfer', 'import_http_errors_test')
    run_focused_module_test(ctx, 'kickside/transfer', 'export_http_errors_test')


REGISTRY = [
    Scenario('automation_dispatch_slot_lifecycle', 'regression', dispatch_slot_lifecycle,
             issues=('AUTOMATION-UNSERVED-WAKE', 'AUTOMATION-STALE-SLOT-REFERENCE')),
    Scenario('automation_slot_provision_failures', 'regression', slot_provision_failures,
             issues=('DESIGN-AUTOMATION-SLOT-FAILURE',)),
    Scenario('workflow_discovery_failures', 'regression', workflow_discovery_failures,
             issues=('DESIGN-WORKFLOW-DISCOVERY-FAILURE',)),
    Scenario('workflow_management_failures', 'regression', workflow_management_failures,
             issues=('DESIGN-WORKFLOW-MANAGEMENT-FAILURE',)),
    Scenario('transfer_cleanup_failures', 'regression', transfer_cleanup_failures,
             issues=('DESIGN-TRANSFER-CLEANUP-FAILURE',)),
]
