"""CRM alias claims distinguish record lifetimes and report durable records."""
from harness import Scenario
from module_harness import run_focused_module_test


def record_lifetime(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'crm_resolve_lifetime_test')
    run_focused_module_test(ctx, 'kickside/crm', 'crm_alias_migration_test')


REGISTRY = [
    Scenario('crm_resolve_record_lifetime', 'regression', record_lifetime,
             issues=('CRM-RESOLVE-RECORD-LIFETIME', 'MIGRATION-LEDGER-ACTIVE-SCHEMA')),
]
