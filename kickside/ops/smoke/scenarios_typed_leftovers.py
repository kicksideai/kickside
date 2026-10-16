"""Native guards for complete records and typed callable failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def connection_errors(ctx):
    run_focused_module_test(ctx, 'kickside/connection', 'base_connection_test')
    run_focused_module_test(ctx, 'kickside/connection', 'capacity_floor_test')


def provider_connection_errors(ctx):
    for module in ('bitbucket', 'gitlab', 'slack'):
        run_focused_module_test(ctx, 'kickside/' + module, 'connection_test')
    run_focused_module_test(ctx, 'kickside/mcp-client', 'protocol_test')


def provider_data_errors(ctx):
    for module, entries in (
        ('atlassian', ('source_sink_errors_test',)),
        ('discord', ('message_sink_test', 'worker_failure_test')),
        ('fireflies', ('pull_core_test', 'writer_test')),
        ('github', ('pull_core_test',)),
        ('google', ('pull_core_test',)),
        ('hubspot', ('pull_core_test', 'association_pull_test', 'object_sink_test')),
        ('phantombuster', ('pull_core_test',)),
        ('simplefin', ('sources_conformance_test',)),
        ('telegram', ('message_sink_test', 'inbound_attachment_test')),
    ):
        for entry in entries:
            run_focused_module_test(ctx, 'kickside/' + module, entry)


def crm_fixture(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'isolated_database_test')


def queryable_offset(ctx):
    run_focused_module_test(ctx, 'kickside/contract', 'contract_smoke_test')


def crm_reads(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'crm_read_faces_test')


def crm_statuses(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'crm_query_api_test')
    run_focused_module_test(ctx, 'kickside/crm', 'crm_resolve_api_test')


def journal_records(ctx):
    run_focused_module_test(ctx, 'chestor/journal', 'journal_backend_e2e_test')
    run_focused_module_test(ctx, 'chestor/journal', 'journal_packaging_test')
    run_focused_module_test(ctx, 'chestor/journal', 'journal_tool_failure_test')


def research_titles(ctx):
    run_focused_module_test(ctx, 'kickside/research', 'component_writer_test')
    run_focused_module_test(ctx, 'kickside/research', 'request_graph_test')


def webscout_http(ctx):
    for entry in ('transport_limits_test', 'google_provider_test', 'search_provider_test', 'source_test'):
        run_focused_module_test(ctx, 'kickside/webscout', entry)


REGISTRY = [
    Scenario('typed_connection_errors', 'regression', connection_errors,
             issues=('TOOL-CONNECTION-TYPED-ERRORS', 'CONNECTION-BASE-TYPED-ERRORS')),
    Scenario('typed_provider_connection_errors', 'regression', provider_connection_errors,
             issues=('CONNECTION-BASE-TYPED-ERRORS',)),
    Scenario('typed_provider_data_errors', 'regression', provider_data_errors,
             issues=('TOOL-CONNECTION-TYPED-ERRORS',)),
    Scenario('crm_fixture_registry_plan', 'regression', crm_fixture,
             issues=('CRM-HARNESS-REGISTRY-SNAPSHOT-CONFLICT',)),
    Scenario('queryable_offset_contract', 'regression', queryable_offset,
             issues=('CONTRACT-QUERYABLE-OFFSET',)),
    Scenario('crm_callable_typed_reads', 'regression', crm_reads,
             issues=('CRM-CALLABLE-READ-TYPED-ERRORS',)),
    Scenario('crm_typed_http_statuses', 'regression', crm_statuses,
             issues=('CRM-HTTP-TYPED-STATUS',)),
    Scenario('journal_complete_records', 'regression', journal_records,
             issues=('JOURNAL-COMPLETE-TOOL-RECORDS', 'JOURNAL-GRAPH-CATALOG-CONTINUATION',
                     'JOURNAL-QUERY-TYPED-ERRORS')),
    Scenario('research_complete_titles', 'regression', research_titles,
             issues=('RESEARCH-COMPLETE-TITLES',)),
    Scenario('webscout_http_results', 'regression', webscout_http,
             issues=('WEBSCOUT-HTTP-DOMAIN-RESULTS',)),
]
