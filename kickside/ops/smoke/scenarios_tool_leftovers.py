"""Tool failures preserve errors and full engine records remain reachable."""
from harness import Scenario
from module_harness import run_focused_module_test


def focused(module, *entries):
    def run(ctx):
        for entry in entries:
            run_focused_module_test(ctx, module, entry)
    return run


REGISTRY = [
    Scenario('tool_mcp_call_errors', 'regression', focused('kickside/mcp', 'catalog_errors_test'), issues=('TOOL-MCP-CALL-ERROR-KINDS',)),
    Scenario('tool_kb_access_errors', 'regression', focused('kickside/knowledge', 'kb_tools_test'), issues=('TOOL-KB-READ-ERROR-KINDS',)),
    Scenario('tool_kb_node_errors', 'regression', focused('kickside/kb10', 'node_tools_test', 'node_tools_errors_test'), issues=('TOOL-KB-READ-ERROR-KINDS',)),
    Scenario('tool_kb_search_continuation', 'regression', focused('kickside/knowledge', 'kb_search_paging_test'), issues=('TOOL-KB-SEARCH-CONTINUATION', 'TOOL-KB-SEARCH-DOMAIN-ERRORS')),
    Scenario('tool_workflow_artifact_integrity', 'regression', focused('kickside/workflows', 'tool_integrity_test'), issues=('TOOL-WORKFLOW-JSON-ERRORS', 'TOOL-WORKFLOW-CHILD-INTERFACE-ERRORS')),
    Scenario('tool_uploads_view_inputs', 'regression', focused('kickside/uploads', 'tool_errors_test'), issues=('TOOL-VIEWFILES-UNUSED-FORMAT',)),
    Scenario('tool_kb_engine_records', 'regression', focused('kickside/knowledge', 'knowledge_manager_test'), issues=('TOOL-KB-ENGINE-FULL-RECORDS',)),
    Scenario('tool_connection_error_kinds', 'regression', focused('kickside/connection', 'connections_registry_test', 'reply_providers_test'), issues=('TOOL-CONNECTION-ERROR-KINDS',)),
]
