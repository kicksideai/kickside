"""Compact tool discovery retains complete detail reads and continuation."""
from harness import Scenario
from module_harness import run_focused_module_test


def focused(module, *entries):
    def run(ctx):
        for entry in entries:
            run_focused_module_test(ctx, module, entry)
    return run


REGISTRY = [
    Scenario('list_detail_blocks', 'regression', focused('kickside/blocks', 'block_contract_test'),
             issues=('LIST-DETAIL-BLOCKS',)),
    Scenario('list_detail_automation', 'regression', focused('kickside/automation', 'automations_read_test', 'automations_read_error_test'),
             issues=('LIST-DETAIL-AUTOMATIONS', 'LIST-DETAIL-AUTOMATION-TYPES', 'LIST-DETAIL-AUTOMATION-CATALOG', 'LIST-DETAIL-AUTOMATION-ERROR-PROPAGATION', 'LIST-DETAIL-AUTOMATION-HEALTH', 'LIST-DETAIL-AUTOMATION-STATUS')),
    Scenario('list_detail_recurring', 'regression', focused('kickside/automation', 'kickside_automation_recurring'),
             issues=('LIST-DETAIL-RECURRING-TASKS',)),
    Scenario('list_detail_hub_artifact', 'regression', focused('kickside/hub', 'requirement_evidence_test'),
             issues=('LIST-DETAIL-HUB-ARTIFACT',)),
    Scenario('list_detail_workflows', 'regression', focused('kickside/workflows', 'agent_tools_test'),
             issues=('LIST-DETAIL-WORKFLOW-CATALOG', 'LIST-DETAIL-WORKFLOWS', 'LIST-DETAIL-WORKFLOW-RUNS', 'LIST-DETAIL-WORKFLOW-EVENTS')),
    Scenario('list_detail_workflow_http', 'regression', focused('kickside/workflows', 'http_error_matrix_test'),
             issues=('LIST-DETAIL-WORKFLOW-HTTP-CATALOGS', 'LIST-DETAIL-WORKFLOW-BLOCK-DETAIL')),
    Scenario('list_detail_agents', 'regression', focused('kickside/agents', 'kickside_agents_traits__platform_manager_test', 'kickside_agents_traits__agents_action_test', 'kickside_agents_traits__master_traits_test'),
             issues=('LIST-DETAIL-PLATFORM', 'LIST-DETAIL-AGENT-ROSTER', 'LIST-DETAIL-CAPABILITIES', 'SMOKE-DISPOSABLE-HARNESS-RESTORE')),
    Scenario('list_detail_agent_memory_fixture', 'regression', focused('kickside/agents', 'memory_runtime_test'),
             issues=('AGENT-MEMORY-PROVIDER-PAGING-FIXTURE',)),
    Scenario('list_detail_skills', 'regression', focused('kickside/skills', 'skill_tool_test', 'owned_bundle_test'),
             issues=('LIST-DETAIL-SKILL-FILES', 'LIST-DETAIL-SKILLS')),
    Scenario('list_detail_knowledge', 'regression', focused('kickside/knowledge', 'traits_test', 'kb_tools_test', 'kb_search_paging_test', 'knowledge_manager_test', 'agentic_query_test'),
             issues=('LIST-DETAIL-KNOWLEDGE-RESULTS', 'LIST-DETAIL-KNOWLEDGE-BASES', 'LIST-DETAIL-KNOWLEDGE-ENGINES')),
    Scenario('list_detail_mcp', 'regression', focused('kickside/mcp', 'meta_tool_list_test'),
             issues=('LIST-DETAIL-MCP-TOOLS', 'LIST-DETAIL-MCP-TRAITS')),
    Scenario('list_detail_self_reflection', 'regression', focused('kickside/self-reflection', 'self_reflection_test'),
             issues=('LIST-DETAIL-REFLECTION-COMPARISON', 'SMOKE-NATIVE-HARNESS-CONFIGS')),
    Scenario('list_detail_uploads', 'regression', focused('kickside/uploads', 'uploads_event_callbacks_test', 'uploads_indexed_parts_test'),
             issues=('LIST-DETAIL-UPLOADS',)),
]
