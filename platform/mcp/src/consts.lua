-- Stable vocabulary for the kickside MCP slice. One place names the tables, the
-- token shape, the synthetic-principal convention, and the registry discovery
-- markers so the repo, dispatcher, and surface never re-spell them.

local M = {}

M.TABLES = {
    CREDENTIALS = "kickside_mcp_credentials",
}

-- Raw bearer tokens are "ksmcp_" + 48 random url-safe chars. Only the sha256 hash
-- and the prefix are persisted; the raw value is returned once at mint.
M.TOKEN = {
    PREFIX = "ksmcp_",
    RANDOM_LEN = 48,
    PREFIX_DISPLAY_LEN = 14, -- "ksmcp_" + 8 chars, for list display only
}

-- The trusted owner entry that resolves stored credential identities under its
-- own frame (kickside.execution:execution_identity deferred_owner).
M.DEFERRED_OWNER = "kickside.mcp.api:serve_mcp"
M.SCOPE_RESTRICTION_IDS = { "kickside.mcp.security:session_deny_control_plane" }

M.STATUS = {
    ACTIVE = "active",
    REVOKED = "revoked",
}

-- Tools the credential may surface are registry entries of this meta.type, the
-- same catalog agents consume. The credential's policy.allowed_tool_ids gates
-- which of them this token can see and call.
M.TOOL_META_TYPE = "tool"

-- Preset bundles: registry entries of this meta.type declare a named set of trait
-- and/or tool ids a credential can be minted with.
M.PRESET_META_TYPE = "mcp.preset"

-- Traits are the runtime capability packs — the SAME public traits agents use, so a
-- credential is configured exactly like an agent (pick traits, set per-trait
-- context). A trait is a registry entry of meta.type=agent.trait flagged
-- meta.public (the picker + MCP only surface public ones; meta.private overrides);
-- its `data.tools` are the tool ids it contributes. An agent discovers them
-- (find_traits) and activates them mid-session (use_trait), changing the visible
-- tool surface without re-minting. allowed_trait_ids is the credential's ceiling;
-- active_trait_ids is its mutable, persisted runtime state.
M.TRAIT_META_TYPE = "agent.trait"

-- The meta-tools always present on every credential's surface (independent of
-- traits). They drive discovery + runtime trait activation.
M.META_TOOLS = {
    "session_info",
    "list_traits", "find_traits", "describe_trait",
    "use_trait", "drop_trait", "set_traits", "reset_traits", "use_profile",
    "list_tools", "find_tools", "describe_tool", "call_tool",
}

M.OAUTH_LIMITS = {
    REGISTRATION_BODY_BYTES = 65536,
    TOKEN_BODY_BYTES = 120 * 1024 * 1024,
    CLIENT_NAME_CHARS = 256,
    REDIRECT_COUNT = 16,
    REDIRECT_URI_CHARS = 2048,
    STORED_CLIENTS = 10000,
    REGISTRATIONS_PER_MINUTE = 60,
}

M.DEFAULTS = {
    FIND_LIMIT = 5,
    LIST_LIMIT = 50,
}

-- MCP protocol constants.
M.PROTOCOL = {
    VERSION = "2025-03-26",
    SERVER_NAME = "kickside",
}

-- JSON-RPC methods that need no bearer (handshake + liveness).
M.PUBLIC_METHODS = {
    ["initialize"] = true,
    ["initialized"] = true,
    ["notifications/initialized"] = true,
    ["ping"] = true,
}

-- JSON Schema properties is an object, including for tools with no arguments.
local function empty_props(): any return table.create(0, 1) end

M.META_TOOL_DEFS = {
    { name = "session_info", description = "Return the MCP identity, scope, active + allowed traits, and visible tools. Call this first after connecting.", inputSchema = { type = "object", properties = empty_props() } },
    { name = "list_traits", description = "List allowed trait summaries in id order. Pass next_cursor as cursor for the next page; use describe_trait for a trait's tools and prompt.", inputSchema = { type = "object", properties = { limit = { type = "integer", minimum = 1, maximum = 100 }, cursor = { type = "string" } } } },
    { name = "find_traits", description = "Search allowed trait summaries by task intent. Pass next_cursor as cursor for the next page; use describe_trait for a trait's tools and prompt.", inputSchema = { type = "object", properties = { query = { type = "string" }, tags = { type = "array", items = { type = "string" } }, limit = { type = "integer", minimum = 1, maximum = 100 }, cursor = { type = "string" } } } },
    { name = "describe_trait", description = "Describe one trait: its tools, tags, and prompt.", inputSchema = { type = "object", properties = { id = { type = "string" } }, required = { "id" } } },
    { name = "use_trait", description = "Activate one or more traits and return the tools that became available.", inputSchema = { type = "object", properties = { ids = { type = "array", items = { type = "string" } }, id = { type = "string" } } } },
    { name = "drop_trait", description = "Deactivate one or more traits.", inputSchema = { type = "object", properties = { ids = { type = "array", items = { type = "string" } }, id = { type = "string" } } } },
    { name = "set_traits", description = "Replace the active trait set. An empty array leaves only meta tools visible.", inputSchema = { type = "object", properties = { ids = { type = "array", items = { type = "string" } } } } },
    { name = "reset_traits", description = "Reset active traits to this credential's default set.", inputSchema = { type = "object", properties = empty_props() } },
    { name = "use_profile", description = "Activate this credential's persisted preferred startup traits. Only activates already-allowed traits.", inputSchema = { type = "object", properties = { dry_run = { type = "boolean" } } } },
    { name = "list_tools", description = "List active (or, with available=true, every allowed) tool summaries in name order. Pass next_cursor as cursor for the next page; use describe_tool for schemas.", inputSchema = { type = "object", properties = { available = { type = "boolean" }, limit = { type = "integer", minimum = 1, maximum = 100 }, cursor = { type = "string" } } } },
    { name = "find_tools", description = "Search active (or available) tool summaries by intent. Pass next_cursor as cursor for the next page; use describe_tool for schemas.", inputSchema = { type = "object", properties = { query = { type = "string" }, available = { type = "boolean" }, limit = { type = "integer", minimum = 1, maximum = 100 }, cursor = { type = "string" } } } },
    { name = "describe_tool", description = "Return one active tool's full descriptor, including its input and output schemas. Set available=true for an allowed tool that is not active.", inputSchema = { type = "object", properties = { id = { type = "string" }, available = { type = "boolean" } }, required = { "id" } } },
    { name = "call_tool", description = "Call an active tool by its public name. Use when traits changed and the client has not refreshed native tool handles.", inputSchema = { type = "object", properties = { id = { type = "string" }, arguments = { type = "object" } }, required = { "id" } } },
}

return M
