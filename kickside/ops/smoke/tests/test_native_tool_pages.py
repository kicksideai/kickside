import unittest

import scenarios_native_tool_pages as pages


class NativeToolPageCoverageTests(unittest.TestCase):
    def test_wires_each_native_result_boundary_to_its_focused_test(self):
        expected = {
            'mcp': ('kickside/mcp', ('repo_capability_grants_test',)),
            'google': ('kickside/google', ('google_smoke_test', 'gmail_test', 'tools_test', 'pull_core_test')),
            'crm': ('kickside/crm', ('crm_tool_shapes_test',)),
            'research': ('kickside/research', ('component_writer_test', 'deep_research_report_test')),
            'chestor_db_schema': ('chestor/db-schema', ('schema_backend_e2e_test',)),
            'chestor_graph': ('chestor/graph', ('graph_backend_e2e_test',)),
            'chestor_roadmap': ('chestor/roadmap', ('roadmap_backend_e2e_test',)),
            'chestor_journal': ('chestor/journal', ('journal_backend_e2e_test', 'journal_graph_projection_test')),
            'chestor_workspace': ('chestor/workspace', ('workspace_trait_bounds_test', 'entry_types_dynamic_test')),
            'knowledge': ('kickside/knowledge', ('traits_test', 'kb_tools_test', 'knowledge_manager_test', 'agentic_query_test')),
        }
        for name, suite in expected.items():
            with self.subTest(name=name):
                self.assertEqual(pages.NATIVE_SUITES[name], suite)

    def test_runs_the_documentation_native_page_harness(self):
        self.assertEqual(pages.NATIVE_APPLICATION_SUITES['documentation'],
                         ('app/test/documentation', 'documentation_test'))

    def test_mcp_catalog_guard_carries_its_specific_issue(self):
        scenarios = {scenario.name: scenario for scenario in pages.REGISTRY}
        self.assertEqual(scenarios['native_tool_pages_mcp'].issues,
                         ('EE2-2572', 'MCP-CATALOG-NATIVE-PAGE-SAFETY'))
