-- MCP credential resolve + dispatcher authz suite. It seeds a credential row
-- directly (the mint path's actor-access validation is covered by live e2e, since it
-- drives the component service), then proves the security-critical read path:
-- token hashing/lookup, status + expiry gating, the whitelist -> path-prefix ->
-- access_filter resolution, the JSON-RPC handshake, and the two-layer tools/call
-- authz (Layer 1 = the credential's tool allowlist surface, Layer 2 = running the
-- tool as the actor the credential acts for).

local test = require("test")
local sql = require("sql")
local json = require("json")
local registry = require("registry")
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

        local function seed(status: string, expires_at: any, policy: any?, whitelist_json: string?)
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
                    context_json = "{}",
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

        local function rpc(method: string, params: any, bearer: string?, session_id: string?): (any, any)
            local body = json.encode({ jsonrpc = "2.0", id = 1, method = method, params = params })
            local resp, status = dispatcher.handle(body, bearer and ("Bearer " .. bearer) or nil, session_id or "authorization-session")
            return resp, status
        end

        test.it("dispatches credential-owned trait configuration and preserves it through patches", function()
            seed(consts.STATUS.ACTIVE, nil, {
                allowed_trait_ids = { "app:trait_dummy" }, default_active_trait_ids = { "app:trait_dummy" },
                agent_profile = { trait_contexts = { ["app:trait_dummy"] = { tool_ids = { "app:dummy_tool" } } } },
            })
            local renamed, rename_err = repo.update_management(credential_id, actor_id, { label = "Configured" })
            test.is_true(renamed)
            test.is_nil(rename_err)
            local result, status = rpc("tools/call", { name = "dummy", arguments = { tool_ids = { "app:other" } } }, raw_token)
            test.eq(status, 200)
            test.is_false(result.result.isError)
            local payload = json.decode(result.result.content[1].text)
            test.eq(payload.configured_tool_ids[1], "app:dummy_tool")
            test.eq(#payload.configured_tool_ids, 1)
            local updated, update_err = repo.update_management(credential_id, actor_id, {
                agent_profile = { trait_contexts = { ["app:trait_dummy"] = { tool_ids = { "app:second" } } } },
            })
            test.is_true(updated)
            test.is_nil(update_err)
            local next_result = rpc("tools/call", { name = "dummy", arguments = table.create(0, 1) }, raw_token)
            local next_payload = json.decode(next_result.result.content[1].text)
            test.eq(next_payload.configured_tool_ids[1], "app:second")
        end)

        test.it("token_hash yields exactly one value for strict-parameter drivers", function()
            -- hash.sha256 returns (hex, nil); a forwarded second value becomes an
            -- extra bound parameter that Postgres rejects at token lookup.
            test.eq(select("#", repo.token_hash("arity-probe")), 1)
        end)

        test.it("resolve_token returns the principal for an active token; rejects unknown", function()
            seed(consts.STATUS.ACTIVE, nil)
            local p, err = repo.resolve_token(raw_token)
            test.is_nil(err)
            test.not_nil(p)
            test.eq((p :: any).actor_id, actor_id)
            test.eq((p :: any).credential_id, credential_id)
            -- Empty whitelist => no narrowing (whole actor tree), so no prefixes.
            test.is_nil((p :: any).whitelist_prefixes)
            test.is_true((p :: any).allowed_tool_ids[DUMMY_TOOL_ID] == true)

            local none, nerr = repo.resolve_token("ksmcp_does_not_exist")
            test.is_nil(none)
            test.not_nil(nerr)
        end)

        test.it("keeps a persisted empty trait set after resolving the next request", function()
            seed(consts.STATUS.ACTIVE, nil, {
                allowed_trait_ids = { "app:trait-a" },
                default_active_trait_ids = { "app:trait-a" },
            })
            local initial, initial_err = repo.resolve_token(raw_token)
            test.is_nil(initial_err)
            test.eq((initial :: any).active_trait_ids[1], "app:trait-a")
            local saved, save_err = repo.persist_active_traits(credential_id, {})
            test.is_true(saved)
            test.is_nil(save_err)
            local next_request, resolve_err = repo.resolve_token(raw_token)
            test.is_nil(resolve_err)
            test.eq(#(next_request :: any).active_trait_ids, 0)
            test.eq((next_request :: any).default_active_trait_ids[1], "app:trait-a")
        end)

        test.it("binds stored active trait context to direct and meta tool dispatch", function()
            seed(consts.STATUS.ACTIVE, nil, {
                allowed_trait_ids = { "app:trait_dummy" },
                default_active_trait_ids = { "app:trait_dummy" },
                agent_profile = { trait_contexts = {
                    ["app:trait_dummy"] = { fixture_context = "owned-kb" },
                } },
            })
            for _, call in ipairs({
                { name = "dummy", arguments = table.create(0, 1) },
                { name = "call_tool", arguments = { id = "dummy", arguments = table.create(0, 1) } },
            }) do
                local result, status = rpc("tools/call", call, raw_token)
                test.eq(status, 200)
                test.is_false(result.result.isError == true)
                local decoded = assert(json.decode(result.result.content[1].text))
                test.eq(decoded.fixture_context, "owned-kb")
            end
        end)


        test.it("refuses malformed protected authority documents before bearer admission", function()
            for _, document in ipairs({"false", "{}", '{"policy_ids":[null],"groups":[]}',
                '{"policy_ids":[],"groups":[null]}', '{"policy_ids":[],"groups":[],"epochs":{"provider":-1}}'}) do
                seed(consts.STATUS.ACTIVE, nil)
                local d = db()
                local _, write_err = d:execute("UPDATE " .. consts.TABLES.CREDENTIALS .. " SET authority_json=$1 WHERE credential_id=$2", {document, credential_id})
                d:release()
                test.is_nil(write_err)
                local principal, resolve_err = repo.resolve_token(raw_token)
                test.is_nil(principal); test.not_nil(resolve_err)
                local restriction, restriction_err = repo.restriction_get(credential_id)
                test.is_nil(restriction); test.not_nil(restriction_err)
                local denied, status = rpc("tools/list", {}, raw_token)
                test.eq(status, 401); test.not_nil(denied.error)
            end
        end)

        test.it("permanently refuses legacy credentials after a delegated authority reduction", function()
            seed(consts.STATUS.ACTIVE, nil)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, {}, nil, { delegation = 0 })
            local admitted, initial_status = rpc("tools/list", {}, raw_token)
            test.eq(initial_status, 200)
            test.not_nil(admitted.result)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, { "app:limited_owner" }, "app:limited_owner", { delegation = 1 })
            local reduced, reduced_status = rpc("tools/list", {}, raw_token)
            test.eq(reduced_status, 401)
            test.not_nil(reduced.error)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, {}, nil, { delegation = 1 })
            local restored, restored_status = rpc("tools/list", {}, raw_token)
            test.eq(restored_status, 401)
            test.not_nil(restored.error)
        end)



        test.it("refuses malformed policy patches without changing stored restrictions", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_trait_ids = { "app:trait_dummy" } })
            for _, patch in ipairs({ { allowed_trait_ids = "limited" }, { allowed_trait_ids = { false } },
                { allowed_tool_ids = { tool = "limited" } }, { default_active_trait_ids = { "" } },
                { agent_profile = "profile" } }) do
                local updated, patch_err = repo.update_management(credential_id, actor_id, patch)
                test.is_false(updated)
                test.not_nil(patch_err)
                local principal, resolve_err = repo.resolve_token(raw_token)
                test.is_nil(resolve_err)
                test.is_true(principal.allowed_trait_ids["app:trait_dummy"])
            end
        end)
        test.it("management preset updates retain a finite ceiling through unrelated patches", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_tool_ids = { DUMMY_TOOL_ID }, allowed_trait_ids = { "app:trait_dummy" } })
            local updated, update_err = repo.update_management(credential_id, actor_id, { preset = "kickside.mcp:preset.reader" })
            test.is_nil(update_err)
            test.is_true(updated)
            local principal, resolve_err = repo.resolve_token(raw_token)
            test.is_nil(resolve_err)
            test.is_true(principal.restrict_traits)
            test.is_nil(next(principal.allowed_tool_ids))
            updated, update_err = repo.update_management(credential_id, actor_id, { label = "finite guard" })
            test.is_nil(update_err)
            test.is_true(updated)
            principal, resolve_err = repo.resolve_token(raw_token)
            test.is_nil(resolve_err)
            test.is_true(principal.restrict_traits)
            local listed, list_err = repo.list(actor_id)
            test.is_nil(list_err)
            test.is_true(listed[1].restrict_traits)
        end)
        test.it("management patches preserve omitted policy groups and enforce ownership", function()
            seed(consts.STATUS.ACTIVE, nil, {
                allowed_tool_ids = { DUMMY_TOOL_ID },
                allowed_trait_ids = { "app:trait-a" },
                default_active_trait_ids = { "app:trait-a" },
                agent_profile = { tone = "concise" },
                future_extension = { enabled = true },
            })

            local denied, denied_err = repo.update_management(credential_id, actor_id .. "-other", {
                allowed_trait_ids = { "app:trait-b" },
            })
            test.is_false(denied)
            test.is_nil(denied_err)

            local updated, update_err = repo.update_management(credential_id, actor_id, {
                allowed_trait_ids = { "app:trait-b" },
            })
            test.is_true(updated)
            test.is_nil(update_err)

            local principal, resolve_err = repo.resolve_token(raw_token)
            test.is_nil(resolve_err)
            test.is_true((principal :: any).allowed_tool_ids[DUMMY_TOOL_ID] == true)
            test.is_true((principal :: any).allowed_trait_ids["app:trait-b"] == true)
            test.is_false((principal :: any).allowed_trait_ids["app:trait-a"] == true)
            test.eq((principal :: any).default_active_trait_ids[1], "app:trait-a")
            test.eq((principal :: any).agent_profile.tone, "concise")

            local cleared, clear_err = repo.update_management(credential_id, actor_id, {
                label = "renamed",
                allowed_tool_ids = {},
            })
            test.is_true(cleared)
            test.is_nil(clear_err)

            local after_clear = repo.resolve_token(raw_token)
            test.is_false((after_clear :: any).allowed_tool_ids[DUMMY_TOOL_ID] == true)
            test.is_true((after_clear :: any).allowed_trait_ids["app:trait-b"] == true)
            test.eq((after_clear :: any).default_active_trait_ids[1], "app:trait-a")
            test.eq((after_clear :: any).agent_profile.tone, "concise")

            local listed = repo.list(actor_id)
            test.eq((listed :: any)[1].label, "renamed")

            local d = db()
            local rows, raw_err = d:query(
                "SELECT policy_json FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1",
                { credential_id }
            )
            d:release()
            test.is_nil(raw_err)
            local policy_json = (rows :: any)[1].policy_json
            test.eq(type(policy_json), "string")
            local stored, decode_err = json.decode(policy_json :: string)
            test.is_nil(decode_err)
            test.is_true((stored :: any).future_extension.enabled)
        end)

        test.it("rejects a credential bound to a different resource before dispatch", function()
            seed(consts.STATUS.ACTIVE, nil)
            local d = db()
            local _, err = d:execute("UPDATE kickside_mcp_credentials SET oauth_resource=$1 WHERE credential_id=$2",
                { "https://foreign.example/api/public/mcp", credential_id })
            d:release()
            test.is_nil(err)
            local response, status = rpc("tools/list", {}, raw_token)
            test.eq(status, 401)
            test.contains(response.error.message, "resource")
        end)

        test.it("distinguishes an empty declared preset from an unknown preset", function()
            local reader_ids, reader_found, reader_err = presets.resolve("kickside.mcp:preset.reader")
            test.is_nil(reader_err)
            test.is_true(reader_found)
            test.eq(#(reader_ids or {}), 0)

            local unknown_ids, unknown_found, unknown_err = presets.resolve("kickside.mcp:not-a-preset")
            test.is_nil(unknown_err)
            test.is_false(unknown_found)
            test.eq(#(unknown_ids or {}), 0)
        end)

        test.it("revoked + expired tokens do not resolve", function()
            seed(consts.STATUS.REVOKED, nil)
            local p1 = repo.resolve_token(raw_token)
            test.is_nil(p1)

            seed(consts.STATUS.ACTIVE, time.now():unix() - 60)
            local p2 = repo.resolve_token(raw_token)
            test.is_nil(p2)
        end)

        test.it("corrupt credentials without an actor_id fail closed", function()
            seed(consts.STATUS.ACTIVE, nil)
            local d = db()
            sql.builder.update(consts.TABLES.CREDENTIALS)
                :set("actor_id", "")
                :where("credential_id = ?", credential_id)
                :run_with(d):exec()
            d:release()

            local p, err = repo.resolve_token(raw_token)
            test.is_nil(p)
            test.is_true(tostring(err):find("actor_id", 1, true) ~= nil)
        end)

        test.it("principal cleanup removes all credentials for the actor", function()
            seed(consts.STATUS.ACTIVE, nil)
            local second = credential_id .. "-second"
            local d = db()
            sql.builder.insert(consts.TABLES.CREDENTIALS)
                :set_map({
                    credential_id = second,
                    token_hash = repo.token_hash(raw_token .. "-second"),
                    token_prefix = "ksmcp_second",
                    actor_id = actor_id,
                    execution_identity_json = identity_json(actor_id, second),
                    whitelist_json = "[]",
                    label = "second",
                    status = consts.STATUS.ACTIVE,
                    policy_json = "{}",
                    context_json = "{}",
                    created_at = time.now():unix(),
                    updated_at = time.now():unix(),
                })
                :run_with(d):exec()
            d:release()

            local result = repo.cleanup_principal({ user_id = actor_id })
            test.eq((result :: any).success, true)
            local rows = repo.list(actor_id)
            test.eq(#(rows :: any), 0)
        end)

        test.it("initialize + ping need no bearer", function()
            local init, st = rpc("initialize", {}, nil)
            test.eq(st, 200)
            test.eq((init :: any).result.protocolVersion, consts.PROTOCOL.VERSION)
            test.eq((init :: any).result.serverInfo.name, consts.PROTOCOL.SERVER_NAME)

            local pong, st2 = rpc("ping", {}, nil)
            test.eq(st2, 200)
            test.not_nil((pong :: any).result)
            test.eq(json.encode((pong :: any).result), "{}")
        end)

        test.it("initialize serializes supported capabilities as JSON objects", function()
            local init, status = rpc("initialize", {}, nil)
            test.eq(status, 200)
            local capabilities = (init :: any).result.capabilities
            for _, name in ipairs({ "tools", "resources", "prompts" }) do
                local encoded, err = json.encode(capabilities[name])
                test.is_nil(err)
                -- Empty Lua tables serialize as arrays; strict MCP clients reject them.
                test.eq(encoded:sub(1, 1), "{")
            end
            test.eq(capabilities.tools.listChanged, false)
            test.eq(json.encode(capabilities.resources), "{}")
            test.eq(json.encode(capabilities.prompts), "{}")
        end)

        test.it("tools/list and tools/call require a valid bearer", function()
            local r, st = rpc("tools/list", {}, nil)
            test.eq(st, 401)
            test.not_nil((r :: any).error)

            local r2, st2 = rpc("tools/list", {}, "ksmcp_bad_token")
            test.eq(st2, 401)
        end)

        test.it("tools/list exposes only the credential's allowed tools", function()
            seed(consts.STATUS.ACTIVE, nil)
            local r, st = rpc("tools/list", {}, raw_token)
            test.eq(st, 200)
            local tools = (r :: any).result.tools
            test.not_nil(tools)
            local names = {}
            for _, t in ipairs(tools :: { any }) do names[(t :: any).name] = true end
            test.is_true(names["dummy"] == true)
            for _, tool in ipairs(tools :: { any }) do
                local schema = (tool :: any).inputSchema
                test.eq(schema.type, "object")
                if schema.properties ~= nil then
                    test.eq(json.encode(schema.properties):sub(1, 1), "{")
                end
            end
        end)

        test.it("marks a failed tool envelope as an MCP error and preserves its content", function()
            seed(consts.STATUS.ACTIVE, nil)
            local response, status = rpc("tools/call", { name = "dummy", arguments = { reject = true } }, raw_token)
            test.eq(status, 200)
            test.is_true(response.result.isError)
            local result, err = json.decode(response.result.content[1].text)
            test.is_nil(err)
            test.eq(result.success, false)
            test.eq(result.error, "fixture access denied")
            test.eq(result.code, "fixture_denied")
            test.eq(response.result.structuredContent.success, false)
            test.eq(response.result.structuredContent.error, "fixture access denied")
            test.eq(response.result.structuredContent.code, "fixture_denied")
        end)

        test.it("tools/call: Layer 1 allows a surfaced tool, denies an unsurfaced one", function()
            seed(consts.STATUS.ACTIVE, nil)
            -- Allowed: the dummy tool runs as the synthesized principal and echoes.
            local ok, st = rpc("tools/call", { name = "dummy", arguments = { hello = "world" } }, raw_token)
            test.eq(st, 200)
            test.is_false((ok :: any).result.isError == true)
            local text = (ok :: any).result.content[1].text
            local decoded, derr = json.decode(text :: string)
            test.is_nil(derr)
            test.is_true((decoded :: any).ok == true)

            -- Denied: a name not in the credential's surface is rejected at Layer 1.
            local no, st2 = rpc("tools/call", { name = "not_a_tool", arguments = table.create(0, 1) }, raw_token)
            test.eq(st2, 200)
            test.is_nil(no.error)
            test.eq(no.result.isError, true)
            test.contains(no.result.content[1].text, "not available to this credential: not_a_tool")
        end)

        test.it("MCP invoke fails closed when actor or scope binding is missing", function()
            test.is_nil(mcp_security._execution_identity)
            test.is_nil(mcp_security._repo)
            test.is_nil(mcp_security._funcs)
            local result, err = mcp_security.invoke(DUMMY_TOOL_ID, {}, nil, {})
            test.is_nil(result)
            test.not_nil(err)

            local result2, err2 = mcp_security.invoke(DUMMY_TOOL_ID, {}, { actor_id = "" }, {})
            test.is_nil(result2)
            test.not_nil(err2)
        end)

        test.it("constructs credential authorization with private dependencies", function()
            local calls: { string } = {}
            local instance = mcp_security.new({
                repo = { restriction_get = function(id: string)
                    calls[#calls + 1] = "load:" .. id
                    return { actor_id = "owner", execution_identity = { version = 2 } }, nil
                end },
                execution_identity = { resolve = function(_identity: any, _opts: any)
                    calls[#calls + 1] = "resolve"
                    return { actor = {}, scope = {} }, nil
                end },
                funcs = { new = function() error("authorize must not invoke a tool") end },
            })
            local frame, err = instance.authorize({ credential_id = "credential", actor_id = "owner" })
            test.is_nil(err)
            test.eq(frame.credential_id, "credential")
            test.eq(table.concat(calls, ","), "load:credential,resolve")
        end)

        test.it("a tool call runs under the public endpoint's own security context", function()
            seed(consts.STATUS.ACTIVE, nil)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, { "app.security:owner-group" })
            local p = repo.resolve_token(raw_token)
            test.not_nil(p)
            -- The serve_mcp actor and exactly its declared policies (kickside.mcp.api:serve_mcp).
            local policies = {}
            for _, id in ipairs(ENDPOINT_POLICIES) do
                local pol, perr = security.policy(id)
                test.is_nil(perr)
                policies[#policies + 1] = pol
            end
            local endpoint_actor = security.new_actor(ENDPOINT_ACTOR_ID, {})
            local out, cerr = funcs.new()
                :with_actor(endpoint_actor)
                :with_scope(security.new_scope(policies))
                :call("app:endpoint_invoke_probe", {
                    tool_id = DUMMY_TOOL_ID,
                    tool_args = { ping = "pong" },
                    principal = p,
                })
            test.is_nil(cerr)
            local o: any = out
            test.eq(o.actor_id, ENDPOINT_ACTOR_ID)
            -- The endpoint scope carries no control-plane capability of its own.
            test.eq(o.can_registry_apply, false)
            test.is_nil(o.err)
            test.is_true(o.ok)
            test.eq(o.result.echoed.ping, "pong")
        end)

        test.it("the owner's live module groups bound credential grants and discovery", function()
            seed(consts.STATUS.ACTIVE, nil, { allowed_tool_ids = { DUMMY_TOOL_ID, "app:dummy_allowed" },
                allowed_trait_ids = { "app:trait_dummy" }, default_active_trait_ids = { "app:trait_dummy" } })
            subjects.put(actor_id, subjects.STATUS.ACTIVE, { "app:limited_owner" }, "app:limited_owner")
            local principal, principal_err = repo.resolve_token(raw_token)
            test.is_nil(principal_err)
            local frame, auth_err = mcp_security.authorize(principal)
            test.is_nil(auth_err)
            test.eq(frame.scope:evaluate(frame.actor, "funcs.call", DUMMY_TOOL_ID), "undefined")
            test.eq(frame.scope:evaluate(frame.actor, "registry.apply", "app:test"), "deny")
            test.eq(frame.scope:evaluate(frame.actor, "funcs.call", "kickside.mcp:dispatch_authenticated"), "allow")
            local names = tool_names(rpc("tools/list", {}, raw_token))
            test.is_true(names.dummy ~= true)
            test.is_true(names.session_info == true)
            test.is_true(names.dummy_allowed == true)
            local allowed_call, allowed_status = rpc("tools/call", { name = "dummy_allowed", arguments = { module = "allowed" } }, raw_token)
            test.eq(allowed_status, 200)
            test.eq(allowed_call.result.isError, false)
            local session = rpc("tools/call", { name = "session_info", arguments = table.create(0, 1) }, raw_token)
            local info = json.decode(session.result.content[1].text)
            test.eq(#info.active_traits, 0)
            test.eq(#info.allowed_traits, 0)
            local prompts = rpc("prompts/list", {}, raw_token)
            test.eq(#prompts.result.prompts, 0)
            local denied_call, denied_status = rpc("tools/call", { name = "dummy", arguments = table.create(0, 1) }, raw_token)
            test.eq(denied_status, 200)
            test.eq(denied_call.result.isError, true)
            local direct, direct_err = mcp_security.invoke(DUMMY_TOOL_ID, {}, principal, {})
            test.is_nil(direct)
            test.not_nil(direct_err)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, {})
            local restored = tool_names(rpc("tools/list", {}, raw_token))
            test.is_true(restored.dummy == true)
        end)

        test.it("meta-tools are always present and session_info reports identity", function()
            seed(consts.STATUS.ACTIVE, nil, nil)
            local names = tool_names(rpc("tools/list", {}, raw_token))
            test.is_true(names["session_info"] == true)
            test.is_true(names["use_trait"] == true)
            test.is_true(names["call_tool"] == true)

            local si, st = rpc("tools/call", { name = "session_info", arguments = table.create(0, 1) }, raw_token)
            test.eq(st, 200)
            local info, derr = json.decode((si :: any).result.content[1].text :: string)
            test.is_nil(derr)
            test.eq((info :: any).identity, actor_id)
        end)

        test.it("a whitelist resolves to path prefixes and rides in the actor's access_filter", function()
            -- A component with a known stored path; the whitelist names it by id.
            local comp_id = uuid.v7()
            local d = db()
            local comp_path = placement.build_path(d, comp_id, nil)
            d:execute("DELETE FROM kickside_components WHERE component_id = $1", { comp_id })
            sql.builder.insert("kickside_components"):set_map({
                component_id = comp_id, impl_id = "kickside.test:mcp_wl", private_context = "{}",
                created_at = time.now():format(time.RFC3339), updated_at = time.now():format(time.RFC3339),
                path = comp_path,
            }):run_with(d):exec()
            d:release()

            seed(consts.STATUS.ACTIVE, nil, nil, json.encode({ comp_id }))
            local p = repo.resolve_token(raw_token)
            test.not_nil(p)
            test.not_nil((p :: any).whitelist_prefixes)
            test.eq(#((p :: any).whitelist_prefixes), 1)
            test.eq((p :: any).whitelist_prefixes[1], comp_path)

            -- The one core resolver applies freshly resolved paths to the actor.
            local frame, rerr = mcp_security.authorize(p)
            test.is_nil(rerr)
            test.not_nil(frame.scope)
            test.eq(frame.actor:id(), actor_id)
            local af = (frame.actor:meta() :: any).access_filter
            test.not_nil(af)
            test.eq((af :: any).prefixes[1], comp_path)

            local dd = db()
            dd:execute("DELETE FROM kickside_components WHERE component_id = $1", { comp_id })
            dd:release()
        end)

        test.it("refuses corrupt stored policies at every credential boundary", function()
            for _, raw in ipairs({ "{broken", "42", "[1]", '{"allowed_trait_ids":"restricted"}',
                '{"allowed_trait_ids":[42]}', '{"allowed_tool_ids":{"tool":true}}',
                '{"default_active_trait_ids":[false]}', '{"agent_profile":[1]}' }) do
                seed(consts.STATUS.ACTIVE, nil)
                local d = db()
                local _, write_err = d:execute("UPDATE kickside_mcp_credentials SET policy_json=$1 WHERE credential_id=$2",
                    { raw, credential_id })
                d:release()
                test.is_nil(write_err, tostring(write_err))
                local principal, resolve_err = repo.resolve_token(raw_token)
                test.is_nil(principal, raw)
                test.not_nil(resolve_err)
                local protected, protected_err = repo.restriction_get(credential_id)
                test.is_nil(protected, raw)
                test.not_nil(protected_err)
                local updated, update_err = repo.update_management(credential_id, actor_id, { allowed_tool_ids = {} })
                test.is_false(updated, raw)
                test.not_nil(update_err)
                local listed, list_err = repo.list(actor_id)
                test.is_nil(listed, raw)
                test.not_nil(list_err)
            end
        end)
        test.it("rejects raw JSON null elements before restriction decoding", function()
            for _, raw in ipairs({ '{"allowed_trait_ids":[null]}', '{"allowed_tool_ids":[null]}',
                '{"default_active_trait_ids":[null]}' }) do
                seed(consts.STATUS.ACTIVE, nil)
                local d = db()
                local _, write_err = d:execute("UPDATE kickside_mcp_credentials SET policy_json=$1 WHERE credential_id=$2",
                    { raw, credential_id })
                d:release()
                test.is_nil(write_err, tostring(write_err))
                local principal, resolve_err = repo.resolve_token(raw_token)
                test.is_nil(principal, raw)
                test.not_nil(resolve_err)
                local protected, protected_err = repo.restriction_get(credential_id)
                test.is_nil(protected, raw)
                test.not_nil(protected_err)
                local updated, update_err = repo.update_management(credential_id, actor_id, { allowed_tool_ids = {} })
                test.is_false(updated, raw)
                test.not_nil(update_err)
                local listed, list_err = repo.list(actor_id)
                test.is_nil(listed, raw)
                test.not_nil(list_err)
            end
            seed(consts.STATUS.ACTIVE, nil, nil, "[null]")
            local principal, resolve_err = repo.resolve_token(raw_token)
            test.is_nil(principal, "raw whitelist null element")
            test.not_nil(resolve_err)
            local protected, protected_err = repo.restriction_get(credential_id)
            test.is_nil(protected)
            test.not_nil(protected_err)
            local listed, list_err = repo.list(actor_id)
            test.is_nil(listed)
            test.not_nil(list_err)
        end)
        test.it("preserves legacy empty policy documents and restriction lists", function()
            for _, raw in ipairs({ "{}", "[]", '{"allowed_trait_ids":[],"allowed_tool_ids":[],"agent_profile":[]}',
                '{"allowed_trait_ids":null,"allowed_tool_ids":null,"agent_profile":null}' }) do
                seed(consts.STATUS.ACTIVE, nil)
                local d = db()
                local _, write_err = d:execute("UPDATE kickside_mcp_credentials SET policy_json=$1 WHERE credential_id=$2",
                    { raw, credential_id })
                d:release()
                test.is_nil(write_err, tostring(write_err))
                local principal, resolve_err = repo.resolve_token(raw_token)
                test.not_nil(principal)
                test.is_nil(resolve_err)
                local listed, list_err = repo.list(actor_id)
                test.not_nil(listed)
                test.is_nil(list_err)
                test.eq(#listed[1].allowed_trait_ids, 0)
            end
        end)

        test.it("a corrupt whitelist fails the token resolve (deny, never broaden)", function()
            -- Non-empty whitelist_json that is not valid JSON is corrupt stored narrowing
            -- data; resolution must fail closed rather than treat it as 'no whitelist'.
            seed(consts.STATUS.ACTIVE, nil, nil, "{not json")
            local p, err = repo.resolve_token(raw_token)
            test.is_nil(p)
            test.not_nil(err)

            -- A JSON value that is not an array is equally invalid -> deny.
            seed(consts.STATUS.ACTIVE, nil, nil, "\"oops\"")
            local p2 = repo.resolve_token(raw_token)
            test.is_nil(p2)

            -- An array with an invalid element cannot collapse to the empty,
            -- unscoped whitelist.
            seed(consts.STATUS.ACTIVE, nil, nil, "[42]")
            local p3, err3 = repo.resolve_token(raw_token)
            test.is_nil(p3)
            test.not_nil(err3)
        end)

        test.it("uses only core resolution and carries the owner's live group grant subjects", function()
            seed(consts.STATUS.ACTIVE, nil)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, { "app.security:owner-group" })
            local p = repo.resolve_token(raw_token)
            test.is_nil((mcp_security :: any).reconstruct)
            local frame, err = mcp_security.authorize(p)
            test.is_nil(err)
            test.not_nil(frame.scope)
            test.eq(frame.actor:id(), actor_id)
            local meta = frame.actor:meta() :: any
            test.eq(#meta.security_groups, 1)
            test.eq(meta.security_groups[1], "app.security:owner-group")
            test.eq(meta.credential_id, credential_id)
            test.is_nil(meta.access_filter)
        end)

        test.it("live owner groups keep the MCP control-plane denies through a function hop", function()
            seed(consts.STATUS.ACTIVE, nil)
            subjects.put(actor_id, subjects.STATUS.ACTIVE, { "app.security:owner-group" })
            local principal, token_err = repo.resolve_token(raw_token)
            test.is_nil(token_err)
            local frame, frame_err = mcp_security.authorize(principal)
            test.is_nil(frame_err)
            local result, err = funcs.new():with_actor(frame.actor):with_scope(frame.scope)
                :call("app:scope_probe", { scope_id = "kickside.mcp.security:session" })
            test.is_nil(err)
            test.is_true(result.ok)
            test.eq(result.group_count, 1)
            test.is_true(result.can_ordinary)
            test.is_false(result.can_registry_apply)
        end)

        test.it("refuses a forged credential actor before core dispatch", function()
            seed(consts.STATUS.ACTIVE, nil)
            local frame, err = mcp_security.authorize({ credential_id = credential_id, actor_id = "other" })
            test.is_nil(frame)
            test.not_nil(err)
        end)

        -- The regression the stubbed-_security tests cannot catch: the MCP session scope
        -- must RESOLVE for a NO-GROUPS principal at a deep frame, AND still carry the
        -- deny hardening. The scope_probe runs security.named_scope + security.can UNDER
        -- the bound no-groups actor -- the exact condition of a deep contract hop where
        -- the scope is re-resolved. A security.scope ENTRY would fail the resolution here
        -- for a no-groups actor; the group named scope resolves unconditionally.
        test.it("the MCP session scope resolves for a no-groups principal and keeps the deny hardening", function()
            local no_groups = security.new_actor("probe-actor", { security_groups = {} })
            local bound = security.named_scope("kickside.mcp.security:session")
            test.not_nil(bound)
            local res, err = funcs.new()
                :with_actor(no_groups)
                :with_scope(bound)
                :call("app:scope_probe", { scope_id = "kickside.mcp.security:session" })
            test.is_nil(err)
            test.not_nil(res)
            local r: any = res
            -- Re-resolves under the no-groups actor at the callee frame (deep-hop shape).
            test.is_true(r.ok == true)
            test.eq(r.group_count, 0)
            -- Allow base grants ordinary work; deny hardening still forbids the control plane.
            test.is_true(r.can_ordinary == true)
            test.is_false(r.can_registry_apply == true)
        end)

        local TRAIT = "app:trait_dummy"

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
