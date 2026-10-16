-- The stateless MCP JSON-RPC dispatcher. One handler serves every credential: each
-- request re-resolves its bearer, protected identity and visible tool surface.
-- The visible tool surface = meta-tools (always) + the real tools of the
-- credential's active traits. tools/call routes a meta-tool to the trait engine, or
-- a real tool through two-layer authz (Layer 1 = it must be in the current surface;
-- Layer 2 = core execution resolves its live principal and restrictions).
-- Also serves resources/* (session + scope snapshots) and prompts/* (registry).

local json = require("json")
local registry = require("registry")
local security = require("security")
local consts = require("mcp_consts")
local mcp_security = require("mcp_core_security")
local surface = require("mcp_surface")
local meta_tools = require("mcp_meta_tools")
local repo = require("mcp_repo")
local traits = require("mcp_traits")
local canonical_json = require("canonical_json")
local tool_arguments = require("tool_arguments")

local M = {}

local JSONRPC = "2.0"

local function rpc_result(id: any, result: any): any
    return { jsonrpc = JSONRPC, id = id, result = result }
end
local function rpc_error(id: any, code: integer, message: string): any
    return { jsonrpc = JSONRPC, id = id, error = { code = code, message = message } }
end

-- Shape a tool/meta result into MCP content. Strings pass through; tables are JSON.
-- A failed JSON conversion is itself a native runtime error and must be returned
-- to the caller rather than producing malformed MCP content.
local function content(result: any, is_error: boolean): (any?, any?)
    if type(result) == "string" then
        return { content = { { type = "text", text = result } }, isError = is_error }, nil
    end
    local text, encode_err = json.encode(result)
    if encode_err then return nil, encode_err end
    return { content = { { type = "text", text = text } }, isError = is_error }, nil
end

local function content_error(prefix: string, err: any): any
    local result = content(prefix .. tostring(err), true)
    if type(err) ~= "userdata" then return result end
    result.structuredContent = { error = {
        kind = err:kind(),
        message = err:message(),
        retryable = err:retryable(),
        details = err:details(),
    } }
    return result
end

local function extract_bearer(auth_header: any): string?
    if type(auth_header) ~= "string" then return nil end
    local h = auth_header :: string
    if h:lower():sub(1, 7) ~= "bearer " then return nil end
    local raw = h:sub(8):gsub("^%s+", ""):gsub("%s+$", "")
    if raw == "" then return nil end
    return raw
end

local function handle_initialize(id: any): any
    return rpc_result(id, {
        protocolVersion = consts.PROTOCOL.VERSION,
        -- These capabilities are supported. Allocate object tables explicitly:
        -- an empty Lua literal encodes as [], which strict MCP clients reject.
        capabilities = { tools = { listChanged = false }, resources = table.create(0, 1), prompts = table.create(0, 1) },
        serverInfo = { name = consts.PROTOCOL.SERVER_NAME, version = "0.1.0" },
    })
end

local function handle_handshake(method: string, id: any): (any, integer)
    if method == "initialize" then return handle_initialize(id), 200 end
    if method == "ping" then return rpc_result(id, table.create(0, 1)), 200 end
    return nil, 202
end

local function handle_tools_list(id: any, principal: any): any
    local descriptors, _, err = surface.build(principal)
    if err then return rpc_error(id, -32603, tostring(err)) end
    local out: { any } = {}
    for _, d in ipairs(meta_tools.definitions(principal)) do out[#out + 1] = d end
    for _, d in ipairs(descriptors :: { any }) do out[#out + 1] = d end
    return rpc_result(id, { tools = out })
end

local function handle_tools_call(id: any, principal: any, authorized: any, params: any, session_id: any, original: string?): any
    if type(params) ~= "table" then return rpc_error(id, -32602, "invalid params") end
    local name = (params :: any).name
    if type(name) ~= "string" or name == "" then return rpc_error(id, -32602, "tool name is required") end
    local arguments = (params :: any).arguments
    if arguments == nil then arguments = canonical_json.object({}) end

    local ctx: { [string]: any } = {}
    if type((principal :: any).context) == "table" then
        for k, v in pairs((principal :: any).context :: { [string]: any }) do ctx[k] = v end
    end
    ctx.mcp_session_id = session_id
    ctx.mcp_credential_id = (principal :: any).credential_id
    ctx.mcp_actor_id = (principal :: any).actor_id
    ctx.mcp_whitelist_component_ids = (principal :: any).whitelist_component_ids

    -- The invoker the trait engine uses for call_tool; the same path real tools take.
    local function invoke(tool_id: string, targs: any, path: { string }?): (any, any)
        local descriptor, descriptor_err = surface.descriptor_for(tool_id)
        if descriptor_err or not descriptor then return nil, descriptor_err or "tool descriptor unavailable" end
        local argument_err = tool_arguments.validate(tool_id, descriptor.inputSchema, targs, original,
            path or { "params", "arguments" })
        if argument_err then return nil, argument_err end
        local tool_ctx: { [string]: any } = {}
        for k, v in pairs(ctx) do tool_ctx[k] = v end
        local profile = type(principal.agent_profile) == "table" and principal.agent_profile or {}
        local contexts = type(profile.trait_contexts) == "table" and profile.trait_contexts or {}
        local assigned: { [string]: any } = {}
        for _, trait_id in ipairs(principal.active_trait_ids or {}) do
            local allowed = principal.allowed_trait_ids
            if traits.is_allowed(trait_id, allowed, principal.restrict_traits) then
                local trait, trait_err = traits.get(trait_id)
                if trait_err then return nil, trait_err end
                local matches = false
                for _, id in ipairs(trait and trait.tool_ids or {}) do
                    if id == tool_id then matches = true; break end
                end
                if matches and type(contexts[trait_id]) == "table" then
                    for k, v in pairs(contexts[trait_id]) do
                        if assigned[k] ~= nil then
                            local prior, prior_err = canonical_json.encode(assigned[k])
                            local current, current_err = canonical_json.encode(v)
                            if prior_err or current_err then return nil, prior_err or current_err end
                            if prior ~= current then return nil, "conflicting active trait context: " .. tostring(k) end
                        end
                        assigned[k] = v
                        tool_ctx[k] = v
                    end
                end
            end
        end
        tool_ctx.mcp_session_id = ctx.mcp_session_id
        tool_ctx.mcp_credential_id = ctx.mcp_credential_id
        tool_ctx.mcp_actor_id = ctx.mcp_actor_id
        tool_ctx.mcp_whitelist_component_ids = ctx.mcp_whitelist_component_ids
        return mcp_security.invoke(tool_id, targs, principal, tool_ctx, authorized)
    end

    if meta_tools.is_meta(name) then
        local definition = meta_tools.definition(name)
        local argument_err = tool_arguments.validate(name, definition.inputSchema, arguments, original,
            { "params", "arguments" })
        if argument_err then return rpc_result(id, content_error("error: ", argument_err)) end
    end

    if meta_tools.is_meta(name) then
        local result, merr = meta_tools.handle(name, arguments, principal, invoke)
        if merr then return rpc_result(id, content_error("error: ", merr)) end
        local shaped, encode_err = content(result, false)
        if encode_err then return rpc_result(id, content_error("error: ", encode_err)) end
        return rpc_result(id, shaped)
    end

    -- Real tool: Layer 1 — must be in the current surface (active-trait/direct).
    local _, name_to_id, surface_err = surface.build(principal)
    if surface_err then return rpc_error(id, -32603, tostring(surface_err)) end
    local tool_id = (name_to_id :: { [string]: string })[name]
    if type(tool_id) ~= "string" or tool_id == "" then
        return rpc_result(id, content("tool not available to this credential: " .. name
            .. ". Call session_info to see the current tools, or find_traits to find a trait that provides it.", true))
    end
    -- Layer 2 — run in the frame built by the core identity resolver.
    local result, err = invoke(tool_id, arguments)
    if err then return rpc_result(id, content_error("tool error: ", err)) end
    -- A tool fails with a typed error (above) or a domain error table; both are
    -- MCP tool errors, and a domain error keeps its fields as structured content.
    local domain_error = type(result) == "table" and result.success == false
    local shaped, encode_err = content(result, domain_error)
    if encode_err then return rpc_result(id, content_error("tool result error: ", encode_err)) end
    if domain_error then shaped.structuredContent = result end
    return rpc_result(id, shaped)
end

-- Resources: a compact session snapshot + the credential's scope. Read-only.
local function handle_resources_list(id: any): any
    return rpc_result(id, { resources = {
        { uri = "mcp://session", name = "session", description = "This credential's identity, scope, active traits, and visible tools.", mimeType = "application/json" },
        { uri = "mcp://scope", name = "scope", description = "The component subtrees this credential is confined to.", mimeType = "application/json" },
    } })
end

local function handle_resources_read(id: any, principal: any, params: any): any
    local uri = type(params) == "table" and (params :: any).uri or nil
    local payload: any
    if uri == "mcp://session" then
        local session, err = meta_tools.handle("session_info", {}, principal, nil)
        if err then return rpc_error(id, -32603, tostring(err)) end
        payload = session
    elseif uri == "mcp://scope" then
        payload = { whitelist_component_ids = (principal :: any).whitelist_component_ids, scoped = ((principal :: any).whitelist_prefixes ~= nil) }
    else
        return rpc_error(id, -32602, "unknown resource uri")
    end
    return rpc_result(id, { contents = { { uri = uri, mimeType = "application/json", text = json.encode(payload) } } })
end

-- Prompts: declared in the registry (meta.type=mcp.prompt). Empty is valid.
local function handle_prompts_list(id: any): any
    local entries, err = registry.find({ ["meta.type"] = "mcp.prompt" })
    if err then return rpc_error(id, -32603, tostring(err)) end
    entries = entries or {}
    local out: { any } = {}
    for _, e in ipairs(entries) do
        local meta: any = e.meta or {}
        out[#out + 1] = { name = type(meta.title) == "string" and meta.title or tostring(e.id), description = type(meta.comment) == "string" and meta.comment or "" }
    end
    return rpc_result(id, { prompts = out })
end

local function handle_prompts_get(id: any, params: any): any
    local name = type(params) == "table" and (params :: any).name or nil
    if type(name) ~= "string" or name == "" then return rpc_error(id, -32602, "prompt name is required") end
    local entries, err = registry.find({ ["meta.type"] = "mcp.prompt" })
    if err then return rpc_error(id, -32603, tostring(err)) end
    entries = entries or {}
    for _, e in ipairs(entries) do
        local meta: any = e.meta or {}
        if meta.title == name or tostring(e.id) == name then
            return rpc_result(id, { description = meta.comment or "", messages = {
                { role = "user", content = { type = "text", text = type(meta.prompt) == "string" and meta.prompt or "" } },
            } })
        end
    end
    return rpc_error(id, -32602, "unknown prompt")
end

-- handle: dispatch one parsed JSON-RPC request. Returns (response_or_nil, status).
function M.handle(body: any, auth_header: any, session_id: any): (any, integer)
    local req, derr = json.decode(type(body) == "string" and body or "")
    if derr or type(req) ~= "table" then return rpc_error(nil, -32700, "parse error"), 200 end
    local method = (req :: any).method
    local id = (req :: any).id
    if type(method) ~= "string" then return rpc_error(id, -32600, "invalid request"), 200 end

    local handshake = method == "initialized" or method == "notifications/initialized"
        or method == "initialize" or method == "ping"
    if handshake and (auth_header == nil or auth_header == "") then
        local response, status = handle_handshake(method :: string, id)
        return response, status
    end

    local raw = extract_bearer(auth_header)
    if not raw then return rpc_error(id, -32001, "authorization required"), 401 end
    local principal, perr = repo.resolve_token(raw)
    if not principal then
        local unavailable = type(perr) == "userdata"
            and (perr:kind() == errors.UNAVAILABLE or perr:kind() == errors.TIMEOUT or perr:kind() == errors.INTERNAL)
        return rpc_error(id, unavailable and -32002 or -32001, tostring(perr or "invalid token")),
            unavailable and 503 or 401
    end
    if handshake then
        local response, status = handle_handshake(method :: string, id)
        return response, status
    end
    local authorized, auth_err = mcp_security.authorize(principal)
    if auth_err or not authorized then
        local unavailable = type(auth_err) == "userdata"
            and (auth_err:kind() == errors.UNAVAILABLE or auth_err:kind() == errors.TIMEOUT)
        return rpc_error(id, unavailable and -32002 or -32001, tostring(auth_err or "identity unavailable")),
            unavailable and 503 or 401
    end

    local result, dispatch_err = mcp_security.invoke("kickside.mcp:dispatch_authenticated", {
        request = req, credential_id = principal.credential_id, session_id = session_id, original_body = body,
    }, principal, nil, authorized)
    if dispatch_err or not result then
        return rpc_error(id, -32001, tostring(dispatch_err or "authenticated dispatch unavailable")), 403
    end
    return result.response, result.status
end

function M.dispatch_authenticated(args: any): any
    local req = type(args) == "table" and args.request or nil
    if type(req) ~= "table" then return { response = rpc_error(nil, -32600, "invalid request"), status = 200 } end
    local id, method = req.id, req.method
    local principal, load_err = repo.restriction_get(args.credential_id)
    if load_err or not principal then
        return { response = rpc_error(id, -32001, tostring(load_err or "credential unavailable")), status = 401 }
    end
    local actor = security.actor()
    local meta = actor and actor:meta() or {}
    if not actor or actor:id() ~= principal.actor_id or meta.credential_id ~= principal.credential_id then
        return { response = rpc_error(id, -32001, "credential execution context required"), status = 403 }
    end
    local authorized = { actor = actor, scope = security.scope(), credential_id = principal.credential_id }
    local session_id = args.session_id
    local function dispatch(): (any, integer)
    if method == "tools/list" then return handle_tools_list(id, principal), 200 end
    if method == "tools/call" then return handle_tools_call(id, principal, authorized, (req :: any).params, session_id, args.original_body), 200 end
    if method == "resources/list" then return handle_resources_list(id), 200 end
    if method == "resources/read" then return handle_resources_read(id, principal, (req :: any).params), 200 end
    if method == "prompts/list" then return handle_prompts_list(id), 200 end
    if method == "prompts/get" then return handle_prompts_get(id, (req :: any).params), 200 end

    return rpc_error(id, -32601, "method not found: " .. method), 200
    end
    local response, status = dispatch()
    return { response = response, status = status }
end

return M
