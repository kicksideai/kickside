-- MCP credential resolve + dispatcher authz suite. It seeds a credential row
-- directly (the mint path's actor-access validation is covered by live e2e, since it
-- drives the component service), then proves the security-critical read path:
-- token hashing/lookup, status + expiry gating, the whitelist -> path-prefix ->
-- access_filter resolution, the JSON-RPC handshake, and the two-layer tools/call
-- authz (Layer 1 = the credential's tool allowlist surface, Layer 2 = running the
-- tool as the actor the credential acts for).

local test = require("test")
local canonical_json = require("canonical_json")
local sql = require("sql")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local repo = require("mcp_repo")
local mcp_security = require("mcp_security")
local dispatcher = require("mcp_dispatcher")
local consts = require("mcp_consts")
local presets = require("mcp_presets")
local subjects = require("subjects")
local placement = require("placement")

local function identity_json(user_id: string, credential_id: string): string
    return json.encode({ version = 2, principal = { kind = "user", id = user_id },
        authorized_by = { kind = "user", id = user_id }, credential_id = credential_id,
        captured_at = "2026-09-26T00:00:00Z" }) :: string
end

local DUMMY_TOOL_ID = "app:dummy_tool"

-- The public MCP endpoint's security block (kickside.mcp.api:serve_mcp).
local ENDPOINT_ACTOR_ID = "kickside.mcp.api:serve_mcp"
local ENDPOINT_POLICIES = {
    "kickside.mcp.security:endpoint_db_access",
    "kickside.mcp.security:endpoint_actor_create",
    "kickside.mcp.security:endpoint_deferred_execution",
    "kickside.mcp.security:endpoint_identity_resolver",
    "kickside.mcp.security:endpoint_identity_call",
    "kickside.mcp.security:endpoint_identity_binding",
    "kickside.mcp.security:endpoint_runtime_exec",
    "kickside.mcp.security:endpoint_registry_read",
    "app:resolver_binding_open",
}

local function define_tests()
    test.describe("MCP credential + dispatcher", function()
        local suffix = tostring(time.now():unix())
        local raw_token = consts.TOKEN.PREFIX .. "testtoken_" .. suffix
        local credential_id = "cred-" .. suffix
        local actor_id = "actor-" .. suffix

        local function db()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            return d
        end

        local function seed(status: string, expires_at: any, policy: any?, whitelist_json: string?, context: any?)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, {})
            local d = db()
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1", { credential_id })
            local ts = time.now():unix()
            local _, err = sql.builder.insert(consts.TABLES.CREDENTIALS)
                :set_map({
                    credential_id = credential_id,
                    token_hash = repo.token_hash(raw_token),
                    token_prefix = raw_token:sub(1, consts.TOKEN.PREFIX_DISPLAY_LEN),
                    actor_id = actor_id,
                    execution_identity_json = identity_json(actor_id, credential_id),
                    whitelist_json = whitelist_json or "[]",
                    label = "test",
                    status = status,
                    policy_json = json.encode(policy or { allowed_tool_ids = { DUMMY_TOOL_ID } }),
                    context_json = json.encode(context or {}),
                    expires_at = expires_at,
                    created_at = ts,
                    updated_at = ts,
                })
                :run_with(d):exec()
            d:release()
            if err then error("seed failed: " .. tostring(err)) end
        end

        local function tool_names(result: any): { [string]: boolean }
            local names: { [string]: boolean } = {}
            for _, t in ipairs(((result :: any).result.tools or {}) :: { any }) do names[(t :: any).name] = true end
            return names
        end

        local function rpc(method: string, params: any, bearer: string?): (any, any)
            local body = json.encode({ jsonrpc = "2.0", id = 1, method = method, params = params })
            local resp, status = dispatcher.handle(body, bearer and ("Bearer " .. bearer) or nil, nil)
            return resp, status
        end

        test.it("validates complete real-tool schemas before direct and meta invocation", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_tool_ids = { "app:schema_tool" } })
            for _, arguments in ipairs({ '{"ids":[null]}', '{"ids":["wrong"]}', '{}',
                '{"ids":[],"unexpected":true}', '[]', 'null', 'false' }) do
                for _, params in ipairs({ '{"name":"schema_probe","arguments":' .. arguments .. '}',
                    '{"name":"call_tool","arguments":{"id":"schema_probe","arguments":' .. arguments .. '}}' }) do
                    local response, status = dispatcher.handle('{"jsonrpc":"2.0","id":1,"method":"tools/call","params":' .. params .. '}',
                        "Bearer " .. raw_token, nil)
                    test.eq(status, 200)
                    test.eq(response.result.isError, true, params)
                    test.eq(response.result.structuredContent.error.kind, errors.INVALID)
                end
            end
            for _, request in ipairs({ { name = "schema_probe", arguments = { ids = { "id:one" } } },
                { name = "call_tool", arguments = { id = "schema_probe", arguments = { ids = { "id:one" } } } } }) do
                local response = rpc("tools/call", request, raw_token)
                test.eq(response.result.isError, false)
                local payload = json.decode(response.result.content[1].text)
                test.eq(payload.echoed.ids[1], "id:one")
            end
            for _, request in ipairs({ { name = "schema_probe" }, { name = "call_tool", arguments = { id = "schema_probe" } } }) do
                local response = rpc("tools/call", request, raw_token)
                test.eq(response.result.isError, true)
                test.eq(response.result.structuredContent.error.kind, errors.INVALID)
            end
        end)

        test.it("validates meta schemas against original JSON before state changes", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { "app:trait_dummy" } })
            for _, params in ipairs({ '{"name":"use_trait","arguments":{"ids":[null],"id":"app:trait_dummy"}}',
                '{"name":"list_tools","arguments":{"available":"true"}}',
                '{"name":"list_traits","arguments":[]}', '{"name":"list_traits","arguments":null}' }) do
                local response = dispatcher.handle('{"jsonrpc":"2.0","id":1,"method":"tools/call","params":' .. params .. '}',
                    "Bearer " .. raw_token, nil)
                test.eq(response.result.isError, true, params)
                test.eq(response.result.structuredContent.error.kind, errors.INVALID)
            end
            test.is_false(tool_names(rpc("tools/list", {}, raw_token))["dummy"] == true)
            local response = rpc("tools/call", { name = "session_info" }, raw_token)
            test.eq(response.result.isError, false)
        end)

        test.it("exposes declared output schemas and trait prompts", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { "app:trait_dummy" }, allowed_tool_ids = { DUMMY_TOOL_ID } })
            local response = rpc("tools/list", {}, raw_token)
            local found = false
            for _, descriptor in ipairs(response.result.tools) do
                if descriptor.name == "dummy" then
                    found = true
                    test.eq(descriptor.outputSchema.type, "object")
                    test.eq(descriptor.outputSchema.properties.ok.type, "boolean")
                end
            end
            test.eq(found, true)
            local detail = rpc("tools/call", { name = "describe_trait", arguments = { id = "app:trait_dummy" } }, raw_token)
            local payload = json.decode(detail.result.content[1].text)
            test.eq(payload.prompt, "Use the declared fixture tool.")
        end)

        test.it("isolates transport identity without inventing a domain connection on direct and meta calls", function()
            seed(consts.STATUS.ACTIVE, nil)
            for _, connection in ipairs({ "client-one", "client-two" }) do
                for _, args in ipairs({ { name = "dummy", arguments = table.create(0, 1) }, { name = "call_tool", arguments = { id = "dummy", arguments = table.create(0, 1) } } }) do
                    local body = json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call", params = args })
                    local response, status = dispatcher.handle(body, "Bearer " .. raw_token, connection)
                    test.eq(status, 200)
                    test.eq(response.result.isError, false)
                    local payload = json.decode(response.result.content[1].text)
                    test.eq(payload.mcp_session_id, connection)
                    test.is_nil(payload.connection_id)
                end
            end
        end)

        test.it("preserves credential and trait domain context across transport sessions", function()
            for _, trait_bound in ipairs({ false, true }) do
                local policy = { allowed_tool_ids = { DUMMY_TOOL_ID } }
                if trait_bound then
                    policy.allowed_trait_ids = { "app:trait_dummy" }
                    policy.default_active_trait_ids = { "app:trait_dummy" }
                    policy.agent_profile = { trait_contexts = {
                        ["app:trait_dummy"] = { connection_id = "trait-domain", fixture_context = "trait-context",
                            mcp_session_id = "untrusted-trait-transport" },
                    } }
                end
                seed(consts.STATUS.ACTIVE, nil, policy, nil,
                    { connection_id = "credential-domain", fixture_context = "credential-context",
                        mcp_session_id = "untrusted-credential-transport" })
                for _, session in ipairs({ "transport-one", "transport-two" }) do
                    for _, args in ipairs({ { name = "dummy", arguments = table.create(0, 1) },
                        { name = "call_tool", arguments = { id = "dummy", arguments = table.create(0, 1) } } }) do
                        local body = json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call", params = args })
                        local response, status = dispatcher.handle(body, "Bearer " .. raw_token, session)
                        test.eq(status, 200)
                        test.is_false(response.result.isError)
                        local payload = json.decode(response.result.content[1].text)
                        test.eq(payload.mcp_session_id, session)
                        test.eq(payload.connection_id, trait_bound and "trait-domain" or "credential-domain")
                        test.eq(payload.fixture_context, trait_bound and "trait-context" or "credential-context")
                    end
                end
            end
        end)

        test.it("preserves native tool failures in structuredContent on direct and meta calls", function()
            seed(consts.STATUS.ACTIVE, nil)
            for _, failure in ipairs({
                { kind = errors.NOT_FOUND, retryable = false },
                { kind = errors.ALREADY_EXISTS, retryable = true },
                { kind = errors.INVALID, retryable = false },
                { kind = errors.PERMISSION_DENIED, retryable = false },
                { kind = errors.UNAVAILABLE, retryable = true },
                { kind = errors.INTERNAL, retryable = false },
                { kind = errors.CANCELED, retryable = false },
                { kind = errors.CONFLICT, retryable = true },
                { kind = errors.TIMEOUT, retryable = true },
                { kind = errors.RATE_LIMITED, retryable = true },
            }) do
                for _, request in ipairs({
                    { name = "dummy", arguments = { fail = true, kind = failure.kind, retryable = failure.retryable } },
                    { name = "call_tool", arguments = { id = "dummy", arguments = { fail = true, kind = failure.kind, retryable = failure.retryable } } },
                }) do
                    local response, status = rpc("tools/call", request, raw_token)
                    test.eq(status, 200)
                    test.is_nil(response.error)
                    test.eq(response.result.isError, true)
                    test.eq(response.result.content[1].type, "text")
                    test.contains(response.result.content[1].text, "requested fixture failure " .. failure.kind)
                    test.not_nil(response.result.structuredContent)
                    local error_payload = response.result.structuredContent.error
                    test.not_nil(error_payload)
                    test.eq(error_payload.kind, failure.kind)
                    test.eq(error_payload.message, "requested fixture failure " .. failure.kind)
                    test.eq(error_payload.retryable, failure.retryable)
                    test.eq(error_payload.details.code, "PROBE_MCP")
                    test.eq(error_payload.details.nested.marker, "kept")
                end
            end
            local response = rpc("tools/call", { name = "dummy", arguments = { value = 7 } }, raw_token)
            test.eq(response.result.isError, false)
            local result = json.decode(response.result.content[1].text)
            test.eq(result.ok, true)
            test.eq(result.echoed.value, 7)
        end)

        test.it("preserves native JSON result failures on direct and meta calls", function()
            seed(consts.STATUS.ACTIVE, nil)
            local cycle = {ok = true}
            cycle.loop = cycle
            local _, native_error = json.encode(cycle)
            test.eq(type(native_error), "userdata")
            for _, request in ipairs({
                { name = "dummy", arguments = { unserializable = true } },
                { name = "call_tool", arguments = { id = "dummy", arguments = { unserializable = true } } },
            }) do
                local response, status = rpc("tools/call", request, raw_token)
                test.eq(status, 200)
                test.eq(response.result.isError, true)
                local error_payload = response.result.structuredContent.error
                test.eq(error_payload.kind, native_error:kind())
                test.eq(error_payload.retryable, native_error:retryable())
                test.eq(type(error_payload.details), type(native_error:details()))
                for key, value in pairs(native_error:details() or {}) do
                    test.eq(error_payload.details[key], value)
                end
                test.contains(error_payload.message, native_error:message())
            end
        end)

        test.it("returns readable tool errors for unavailable names without truncation", function()
            seed(consts.STATUS.ACTIVE, nil)
            for _, name in ipairs({ "wild_echo", "unavailable_" .. string.rep("x", 100000) }) do
                local response, status = rpc("tools/call", { name = name, arguments = table.create(0, 1) }, raw_token)
                test.eq(status, 200)
                test.eq(response.jsonrpc, "2.0")
                test.eq(response.id, 1)
                test.is_nil(response.error)
                test.eq(response.result.isError, true)
                test.eq(response.result.content[1].type, "text")
                test.contains(response.result.content[1].text, "not available to this credential")
                test.contains(response.result.content[1].text, name)
                local encoded, encode_err = json.encode(response)
                test.is_nil(encode_err, tostring(encode_err))
                local decoded, decode_err = json.decode(encoded)
                test.is_nil(decode_err, tostring(decode_err))
                test.eq(decoded.result.content[1].text, response.result.content[1].text)
            end
        end)

        local TRAIT = "app:trait_dummy"

        test.it("use_trait reveals a capability pack's tools at runtime; persists across requests", function()
            -- Allowed the trait, but NO direct tools and none active: dummy is hidden.
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { TRAIT } })
            test.is_false(tool_names(rpc("tools/list", {}, raw_token))["dummy"] == true)

            -- Activate the trait; the persisted active set now surfaces its tools.
            local r, st = rpc("tools/call", { name = "use_trait", arguments = { id = TRAIT } }, raw_token)
            test.eq(st, 200)
            test.is_false((r :: any).result.isError == true)

            -- A fresh request re-resolves the credential and sees the activated tool.
            test.is_true(tool_names(rpc("tools/list", {}, raw_token))["dummy"] == true)
            local ok = rpc("tools/call", { name = "dummy", arguments = table.create(0, 1) }, raw_token)
            local decoded = json.decode((ok :: any).result.content[1].text :: string)
            test.is_true((decoded :: any).ok == true)
        end)

        test.it("preserves declared string and table schemas on protocol and meta detail surfaces", function()
            local expected = {
                wild_echo = '{"type":"object","properties":{"payload":{},"options":{"type":"object","properties":{}}},"required":[],"additionalProperties":false,"default":{},"examples":[{},[]]}',
                wild_count = '{"type":"object","properties":{"items":{"type":"array","items":{}}},"required":[]}',
                probe_component = '{"type":"object","properties":{"component_id":{"type":"string"}}}',
            }
            local function check_surface()
                local response = rpc("tools/list", {}, raw_token)
                local encoded, encode_err = json.encode(response)
                test.is_nil(encode_err, tostring(encode_err))
                local wire = json.decode(encoded)
                local seen = 0
                for _, tool in ipairs(wire.result.tools) do
                    if expected[tool.name] then
                        test.eq(canonical_json.encode(tool.inputSchema), canonical_json.encode(json.decode(expected[tool.name])), tool.name)
                        seen = seen + 1
                    end
                end
                test.eq(seen, 3)
                test.contains(json.encode(response), '"properties":{}')
            end
            seed(consts.STATUS.ACTIVE, nil, { allowed_tool_ids = { "app.wildcard:*", "app:probe_tool" } })
            check_surface()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { "app:trait_wildcard" }, allowed_tool_ids = { "app:probe_tool" } })
            local response = rpc("tools/call", { name = "use_trait", arguments = { id = "app:trait_wildcard" } }, raw_token)
            test.is_false(response.result.isError == true)
            check_surface()
            local listed = rpc("tools/call", { name = "list_tools", arguments = { limit = 100 } }, raw_token)
            local listed_value = json.decode(listed.result.content[1].text)
            local listed_names: { [string]: boolean } = {}
            for _, tool in ipairs(listed_value.tools) do
                listed_names[tool.name] = true
                test.is_nil(tool.inputSchema)
                test.is_nil(tool.outputSchema)
            end
            for name, schema in pairs(expected) do
                test.is_true(listed_names[name] == true, "list_tools lists " .. name)
                local detail = rpc("tools/call", { name = "describe_tool", arguments = { id = name } }, raw_token)
                test.is_false(detail.result.isError == true)
                local descriptor = json.decode(detail.result.content[1].text).tool
                test.eq(canonical_json.encode(descriptor.inputSchema), canonical_json.encode(json.decode(schema)), name)
            end

            local all_names: { string } = {}
            for _, tool in ipairs(listed_value.tools) do all_names[#all_names + 1] = tool.name end
            table.sort(all_names)
            local paged: { string } = {}
            local cursor: string? = nil
            repeat
                local page = rpc("tools/call", { name = "list_tools", arguments = { limit = 1, cursor = cursor } }, raw_token)
                local value = json.decode(page.result.content[1].text)
                test.is_true(#value.tools <= 1)
                for _, tool in ipairs(value.tools) do
                    paged[#paged + 1] = tool.name
                    test.is_nil(tool.inputSchema)
                    test.is_nil(tool.outputSchema)
                end
                cursor = value.next_cursor
            until cursor == nil
            test.eq(table.concat(paged, ","), table.concat(all_names, ","))
        end)

        test.it("a trait outside the allowlist cannot be activated", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { TRAIT } })
            rpc("tools/call", { name = "use_trait", arguments = { id = "app:not_allowed_trait" } }, raw_token)
            -- Nothing surfaced; the disallowed id was filtered.
            test.is_false(tool_names(rpc("tools/list", {}, raw_token))["dummy"] == true)
        end)

        local WILD_TRAIT = "app:trait_wildcard"

        local function meta_result(name: string, args: any): any
            local r = rpc("tools/call", { name = name, arguments = args }, raw_token)
            test.is_false((r :: any).result.isError == true)
            return json.decode((r :: any).result.content[1].text :: string)
        end

        test.it("a trait declaring <ns>:* surfaces that namespace's tools and only its tools", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { WILD_TRAIT } })
            meta_result("use_trait", { id = WILD_TRAIT })

            local names = tool_names(rpc("tools/list", {}, raw_token))
            test.is_true(names["wild_echo"] == true)
            test.is_true(names["wild_count"] == true)
            -- A non-tool function in the namespace is never surfaced.
            test.is_false(names["wild_helper"] == true)

            -- The expanded tool is callable through Layer 1 + Layer 2.
            local ok = rpc("tools/call", { name = "wild_echo", arguments = { payload = { x = 1 } } }, raw_token)
            test.is_false((ok :: any).result.isError == true)
            local decoded = json.decode((ok :: any).result.content[1].text :: string)
            test.is_true((decoded :: any).ok == true)
            test.eq((decoded :: any).echoed.payload.x, 1)

            -- describe_trait reports the concrete tools the trait contributes.
            local described = meta_result("describe_trait", { id = WILD_TRAIT })
            local ids: { [string]: boolean } = {}
            for _, id in ipairs(((described :: any).tool_ids or {}) :: { string }) do ids[id] = true end
            test.is_true(ids["app.wildcard:echo"] == true)
            test.is_true(ids["app.wildcard:count"] == true)
            test.is_false(ids["app.wildcard:helper"] == true)
            test.is_false(ids["app.wildcard:*"] == true)
        end)

        test.it("a wildcard trait outside the allowlist contributes nothing", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { TRAIT } })
            meta_result("use_trait", { id = WILD_TRAIT })
            local names = tool_names(rpc("tools/list", {}, raw_token))
            test.is_false(names["wild_echo"] == true)
            test.is_false(names["wild_count"] == true)
            local denied = rpc("tools/call", { name = "wild_echo", arguments = table.create(0, 1) }, raw_token)
            test.is_nil(denied.error)
            test.eq(denied.result.isError, true)
            test.contains(denied.result.content[1].text, "not available to this credential: wild_echo")
            test.contains(denied.result.content[1].text, "find_traits")
        end)

        test.it("a <ns>:* direct tool grant expands to that namespace's tools", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_tool_ids = { "app.wildcard:*" } })
            local names = tool_names(rpc("tools/list", {}, raw_token))
            test.is_true(names["wild_echo"] == true)
            test.is_true(names["wild_count"] == true)
            test.is_false(names["wild_helper"] == true)

            local available = meta_result("list_tools", { available = true })
            local listed: { [string]: boolean } = {}
            for _, d in ipairs(((available :: any).tools or {}) :: { any }) do listed[(d :: any).name] = true end
            test.is_true(listed["wild_echo"] == true)
            test.is_false(listed["wild_helper"] == true)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
