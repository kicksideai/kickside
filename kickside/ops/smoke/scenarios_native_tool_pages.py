"""Native tool pages guard the unbounded-result causes without a shared wrapper."""
from pathlib import Path

from harness import Scenario
from module_harness import run_focused_app_test, run_focused_module_test


NATIVE_SUITES = {
    'gitlab': ('kickside/gitlab', ('connection_test',)),
    'bitbucket': ('kickside/bitbucket', ('connection_test',)),
    'atlassian': ('kickside/atlassian', ('jira_api_test', 'jira_traits_test', 'confluence_api_test', 'confluence_traits_test')),
    'mcp_client': ('kickside/mcp-client', ('protocol_test',)),
    'agents': ('kickside/agents', ('kickside_agents_registry__tools_registry_test', 'kickside_agents_api__list_tools_test')),
    'automation': ('kickside/automation', ('automations_read_test',)),
    'blocks': ('kickside/blocks', ('block_contract_test',)),
    'chestor_db_schema': ('chestor/db-schema', ('schema_backend_e2e_test',)),
    'chestor_graph': ('chestor/graph', ('graph_backend_e2e_test',)),
    'chestor_journal': ('chestor/journal', ('journal_backend_e2e_test', 'journal_graph_projection_test')),
    'chestor_roadmap': ('chestor/roadmap', ('roadmap_backend_e2e_test',)),
    'chestor_workspace': ('chestor/workspace', ('workspace_trait_bounds_test', 'entry_types_dynamic_test')),
    'code_execution': ('kickside/code-execution', ('code_execution_test', 'code_execution_sdk_reference_test', 'code_execution_recommend_test')),
    'crm': ('kickside/crm', ('crm_tool_shapes_test',)),
    'discord': ('kickside/discord', ('discord_tools_test',)),
    'fireflies': ('kickside/fireflies', ('traits_test',)),
    'github': ('kickside/github', ('traits_test',)),
    'google': ('kickside/google', ('google_smoke_test', 'gmail_test', 'tools_test', 'pull_core_test')),
    'hub': ('kickside/hub', ('requirement_evidence_test',)),
    'hubspot': ('kickside/hubspot', ('traits_test',)),
    'kb10': ('kickside/kb10', ('graph_test', 'node_tools_test', 'knowledge_bases_test')),
    'knowledge': ('kickside/knowledge', ('traits_test', 'kb_tools_test', 'knowledge_manager_test', 'agentic_query_test')),
    'memory': ('kickside/memory', ('runtime_test',)),
    'mcp': ('kickside/mcp', ('repo_capability_grants_test',)),
    'phantombuster': ('kickside/phantombuster', ('traits_test',)),
    'research': ('kickside/research', ('component_writer_test', 'deep_research_report_test')),
    'self_reflection': ('kickside/self-reflection', ('self_reflection_test',)),
    'simplefin': ('kickside/simplefin', ('row_output_test',)),
    'skills': ('kickside/skills', ('skill_tool_test',)),
    'slack': ('kickside/slack', ('slack_tools_test',)),
    'telegram': ('kickside/telegram', ('telegram_tools_test',)),
    'webscout': ('kickside/webscout', ('transport_limits_test', 'search_provider_test')),
    'workflows': ('kickside/workflows', ('agent_tools_test',)),
}

NATIVE_APPLICATION_SUITES = {
    'documentation': ('app/test/documentation', 'documentation_test'),
}

NATIVE_ISSUES = {
    'crm': ('EE2-2572', 'LISTS-CRM-RECORD-SUMMARIES', 'LISTS-CRM-ACTIVITY-SUMMARIES'),
    'chestor_workspace': ('EE2-2572', 'LISTS-WORKSPACE-ENTRY-SUMMARIES', 'LISTS-WORKSPACE-KIND-PAGING'),
    'chestor_roadmap': ('EE2-2572', 'LISTS-ROADMAP-SUMMARY-PAGING'),
    'chestor_journal': ('EE2-2572', 'LISTS-JOURNAL-COLLECTION-SUMMARIES', 'LISTS-JOURNAL-SEMANTIC-PAGING', 'LISTS-JOURNAL-CONTINUATION-PAGING'),
    'memory': ('EE2-2572', 'MEMORY-EMPTY-WORKING-CHECKPOINT', 'PROVIDER-MEMORY-COMPACT-LISTS'),
    'mcp': ('EE2-2572', 'MCP-CATALOG-NATIVE-PAGE-SAFETY'),
    'gitlab': ('EE2-2572', 'PROVIDER-GITLAB-COMPACT-LISTS'),
    'bitbucket': ('EE2-2572', 'PROVIDER-BITBUCKET-COMPACT-LISTS'),
    'google': ('EE2-2572', 'PROVIDER-GOOGLE-COMPACT-LISTS'),
    'slack': ('EE2-2572', 'PROVIDER-SLACK-COMPACT-LISTS'),
    'discord': ('EE2-2572', 'PROVIDER-DISCORD-COMPACT-LISTS'),
    'github': ('EE2-2572', 'PROVIDER-GITHUB-COMPACT-LISTS'),
    'hubspot': ('EE2-2572', 'PROVIDER-HUBSPOT-COMPACT-LISTS'),
    'phantombuster': ('EE2-2572', 'PROVIDER-PHANTOMBUSTER-COMPACT-LISTS'),
    'simplefin': ('EE2-2572', 'PROVIDER-SIMPLEFIN-COMPACT-LISTS'),
    'kb10': ('EE2-2572', 'PROVIDER-KB10-COMPACT-LISTS'),
    'code_execution': ('EE2-2572', 'PROVIDER-CODE-EXECUTION-COMPACT-LISTS'),
    'mcp_client': ('EE2-2572', 'PROVIDER-MCP-CLIENT-COMPACT-LISTS'),
    'research': ('EE2-2572', 'RESEARCH-COMPACT-LISTS'),
    'atlassian': ('EE2-2572', 'PROVIDER-JIRA-COMPACT-LISTS', 'PROVIDER-CONFLUENCE-COMPACT-LISTS'),
}


def native_pages(module, entries):
    def run(ctx):
        for entry in entries:
            run_focused_module_test(ctx, module, entry)
    return run


def native_application_pages(relative_root, entry):
    def run(ctx):
        run_focused_app_test(ctx, Path(ctx.inst.config['source']) / relative_root, entry)
    return run


REGISTRY = [Scenario('native_tool_pages_' + name, 'regression', native_pages(module, entries),
                     issues=NATIVE_ISSUES.get(name, ('EE2-2572',)))
            for name, (module, entries) in NATIVE_SUITES.items()]

REGISTRY += [Scenario('native_tool_pages_' + name, 'regression', native_application_pages(root, entry),
                      issues=('EE2-2572',))
             for name, (root, entry) in NATIVE_APPLICATION_SUITES.items()]


def provider_connection_errors(ctx):
    for module, entries in (
        ('kickside/atlassian', ('capacity_transport_test',)),
        ('kickside/google', ('capacity_transport_test', 'token_retry_test')),
        ('kickside/slack', ('connection_test',)),
        ('kickside/mcp-client', ('protocol_test',)),
    ):
        for entry in entries:
            run_focused_module_test(ctx, module, entry)


REGISTRY.append(Scenario('native_provider_connection_error_convention', 'regression', provider_connection_errors,
                         issues=('PROVIDER-SHARED-CONNECTION-TYPED-ERRORS', 'PROVIDER-CAPACITY-TYPED-ERRORS')))
