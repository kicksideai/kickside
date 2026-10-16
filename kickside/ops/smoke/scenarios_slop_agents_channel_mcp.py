"""Platform owner boundaries preserve errors and existing installation data."""
from harness import Scenario
from module_harness import run_focused_module_test

def artifacts_catalog_owner(ctx):
    run_focused_module_test(ctx, "kickside/agents", "artifacts_catalog_test")
    run_focused_module_test(ctx, "kickside/agents", "kickside_agents_traits__artifacts_test")

def agent_context_schema(ctx):
    run_focused_module_test(ctx, "kickside/agents", "kickside_agents_traits__master_traits_test")

def connection_reply_errors(ctx):
    run_focused_module_test(ctx, "kickside/connection", "reply_sender_test")
    run_focused_module_test(ctx, "kickside/connection", "reply_authorization_test")

def mcp_tool_name_collision(ctx):
    run_focused_module_test(ctx, "kickside/mcp", "catalog_errors_test")

def inbox_item_event_integrity(ctx):
    run_focused_module_test(ctx, "kickside/inbox", "projection_test")

def knowledge_producer_errors(ctx):
    run_focused_module_test(ctx, "kickside/knowledge", "projection_lookup_test")

def hub_setup_registry_envelope(ctx):
    run_focused_module_test(ctx, "kickside/hub", "required_setup_test")

def hub_artifact_errors(ctx):
    run_focused_module_test(ctx, "kickside/hub", "requirement_evidence_test")

def identity_cleanup_owner(ctx):
    run_focused_module_test(ctx, "kickside/identity", "link_service_test")

def channel_policy_owner(ctx):
    run_focused_module_test(ctx, "kickside/channel", "responder_test")
    run_focused_module_test(ctx, "kickside/channel", "receive_test")

REGISTRY = [
    Scenario("slop_artifacts_catalog_owner", "regression", artifacts_catalog_owner, issues=('SLOP-ARTIFACT-CATALOG-OWNER',)),
    Scenario("slop_agent_context_schema", "regression", agent_context_schema, issues=('SLOP-AGENT-CONTEXT-SCHEMA',)),
    Scenario("slop_connection_reply_errors", "regression", connection_reply_errors, issues=('SLOP-CONNECTION-REPLY-ERRORS',)),
    Scenario("slop_mcp_tool_name_collision", "regression", mcp_tool_name_collision, issues=('SLOP-MCP-TOOL-NAME-COLLISION', 'SLOP-MCP-PRESET-ERRORS')),
    Scenario("slop_inbox_item_event_integrity", "regression", inbox_item_event_integrity, issues=('SLOP-INBOX-ITEM-EVENT-INTEGRITY',)),
    Scenario("slop_knowledge_producer_errors", "regression", knowledge_producer_errors, issues=('SLOP-KNOWLEDGE-APPEND-ERRORS', 'SLOP-KNOWLEDGE-JSON-OWNER')),
    Scenario("slop_hub_setup_registry_envelope", "regression", hub_setup_registry_envelope, issues=('SLOP-HUB-SETUP-REGISTRY-ENVELOPE',)),
    Scenario("slop_hub_artifact_errors", "regression", hub_artifact_errors, issues=('SLOP-HUB-ARTIFACT-ERRORS',)),
    Scenario("slop_identity_cleanup_owner", "regression", identity_cleanup_owner, issues=('SLOP-IDENTITY-CLEANUP-OWNER',)),
    Scenario("slop_channel_policy_owner", "regression", channel_policy_owner, issues=('SLOP-CHANNEL-POLICY-OWNER', 'SLOP-CHANNEL-RESPONDER-READ-ERRORS')),
]
