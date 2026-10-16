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
    test.describe("MCP credential mint validation", function()
        local suffix = "mint-" .. tostring(time.now():unix())
        local actor = "actor-" .. suffix
        local A = uuid.v7()  -- exists AND granted to the actor
        local D = uuid.v7()  -- exists but the actor holds NO grant

        local function db()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            return d
        end

        local function seed()
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local A_path = placement.build_path(d, A, nil)
            local D_path = placement.build_path(d, D, nil)
            for _, row in ipairs({ { id = A, path = A_path, grant = true }, { id = D, path = D_path, grant = false } }) do
                sql.builder.insert("kickside_components"):set_map({
                    component_id = row.id, impl_id = "kickside.test:mcp_mint", private_context = "{}",
                    created_at = ts, updated_at = ts, path = row.path,
                }):run_with(d):exec()
                if row.grant then
                    sql.builder.insert("kickside_component_access"):set_map({
                        access_id = uuid.v7(), component_id = row.id, source_component_id = row.id,
                        subject_id = actor, subject_type = "user", access_mask = 15, created_at = ts,
                    }):run_with(d):exec()
                end
            end
            d:release()
            subjects.put(actor, subjects.STATUS.ACTIVE, {})
        end

        local function cleanup()
            local d = db()
            for _, id in ipairs({ A, D }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", id):run_with(d):exec()
            end
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE actor_id = $1", { actor })
            d:release()
            subjects.remove(actor)
        end

        -- Mint under an authenticated user frame; bearer dispatch cannot mint a
        -- fresh credential through its restricted MCP scope.
        local function mint_as_actor(whitelist: any): any
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local policy = security.policy("app:mcp_suite_policy")
            local scope = security.new_scope({ policy })
            return funcs.new():with_actor(live_actor):with_scope(scope):call("app:mint_func",
                { whitelist_component_ids = whitelist, label = "mint-test", policy = {} })
        end

        test.before_each(function() cleanup(); seed() end)
        test.after_each(cleanup)

        test.it("captures native issuing policies and refuses stale issuing epochs", function()
            subjects.put(actor, subjects.STATUS.ACTIVE, {}, nil, { delegation = 0 })
            local native_actor = security.new_actor(actor, { user_id = actor, security_groups = {},
                authority_epochs = { delegation = 0 } })
            local native_scope = security.new_scope({ security.policy("app:mcp_suite_policy") })
            local builder = funcs.new():with_actor(native_actor):with_scope(native_scope)
            local issued = builder:call("app:mint_func", { policy = { allowed_tool_ids = { DUMMY_TOOL_ID } } })
            test.is_nil(issued.error)
            local stored, stored_err = repo.restriction_get(issued.result.credential_id)
            test.is_nil(stored_err)
            test.not_nil(stored.authority)
            test.eq(stored.authority.policy_ids[1], "app:mcp_suite_policy")
            test.eq(stored.authority.epochs.delegation, 0)
            subjects.put(actor, subjects.STATUS.ACTIVE, {}, nil, { delegation = 1 })
            local stale = builder:call("app:mint_func", { policy = {} })
            test.is_nil(stale.result)
            test.not_nil(stale.error)
            local principal = assert(repo.resolve_token(issued.result.token))
            local frame, revoked_err = mcp_security.authorize(principal)
            test.is_nil(frame)
            test.not_nil(revoked_err)
            native_actor = security.new_actor(actor, { user_id = actor, security_groups = {},
                authority_epochs = { delegation = 1 } })
            local fresh = funcs.new():with_actor(native_actor):with_scope(native_scope):call("app:mint_func", { policy = {} })
            test.is_nil(fresh.error)
            test.not_nil((mcp_security.authorize(assert(repo.resolve_token(fresh.result.token)))))
            subjects.put(actor, subjects.STATUS.ACTIVE, {})
            local omitted, omitted_err = mcp_security.authorize(assert(repo.resolve_token(fresh.result.token)))
            test.is_nil(omitted)
            test.not_nil(omitted_err)
        end)

        test.it("mints when the actor can see every whitelisted component", function()
            local out = mint_as_actor({ A })
            test.is_nil((out :: any).error)
            test.not_nil((out :: any).result)
            test.not_nil((out :: any).result.token)
            test.eq((out :: any).result.whitelist_component_ids[1], A)
        end)

        test.it("refuses a whitelist naming a component the actor cannot see", function()
            local out = mint_as_actor({ D })
            test.is_nil((out :: any).result)
            test.not_nil((out :: any).error)
            test.is_true(tostring((out :: any).error):find("not accessible", 1, true) ~= nil)
        end)

        test.it("refuses malformed mint restrictions without persisting a credential", function()
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local scope = security.new_scope({ security.policy("app:mcp_suite_policy") })
            for _, args in ipairs({
                { whitelist_component_ids = "scope" }, { whitelist_component_ids = { scope = A } },
                { whitelist_component_ids = { false } }, { whitelist_component_ids = { "" } },
                { policy = "limited" }, { policy = { allowed_tool_ids = "limited" } },
                { policy = { allowed_tool_ids = { true } } }, { policy = { allowed_trait_ids = { trait = "limited" } } },
                { policy = { allowed_trait_ids = { "" } } }, { policy = { default_active_trait_ids = { false } } },
                { policy = { agent_profile = "profile" } }, { expires_at = "123" },
            }) do
                local out = funcs.new():with_actor(live_actor):with_scope(scope):call("app:mint_func", args)
                test.is_nil(out.result)
                test.not_nil(out.error)
                local rows, list_err = repo.list(actor)
                test.is_nil(list_err)
                test.eq(#rows, 0)
            end
        end)
        test.it("common mint expands presets and seals finite trait activation", function()
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local scope = security.new_scope({ security.policy("app:mcp_suite_policy") })
            for _, policy in ipairs({ { preset = "kickside.mcp:preset.reader" },
                { preset = "app:preset_limited", allowed_tool_ids = { "app:probe_tool" },
                  default_active_trait_ids = { "app:trait_wildcard" } } }) do
                local out = funcs.new():with_actor(live_actor):with_scope(scope):call("app:mint_func", { policy = policy })
                test.is_nil(out.error)
                test.not_nil(out.result)
                local principal, resolve_err = repo.resolve_token(out.result.token)
                test.is_nil(resolve_err)
                test.is_true(principal.restrict_traits)
                local response, status = dispatcher.handle(json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call",
                    params = { name = "list_traits", arguments = table.create(0, 1) } }), "Bearer " .. out.result.token, "preset-guard")
                test.eq(status, 200)
                local listed = json.decode(response.result.content[1].text)
                test.eq(#listed.traits, 0)
                response, status = dispatcher.handle(json.encode({ jsonrpc = "2.0", id = 2, method = "tools/call",
                    params = { name = "set_traits", arguments = { ids = { "app:trait_dummy", "app:trait_wildcard" } } } }),
                    "Bearer " .. out.result.token, "preset-guard")
                test.eq(status, 200)
                test.is_false(response.result.isError)
                principal, resolve_err = repo.resolve_token(out.result.token)
                test.is_nil(resolve_err)
                test.eq(#principal.active_trait_ids, 0)
                if policy.preset == "app:preset_limited" then
                    test.is_true(principal.allowed_tool_ids["app:dummy_tool"])
                    test.is_true(principal.allowed_tool_ids["app:probe_tool"])
                else
                    test.is_nil(next(principal.allowed_tool_ids))
                end
            end
        end)
        test.it("supports finite trait ceilings and preserves absent ceiling behavior", function()
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local scope = security.new_scope({ security.policy("app:mcp_suite_policy") })
            for _, restricted in ipairs({ true, false }) do
                local out = funcs.new():with_actor(live_actor):with_scope(scope):call("app:mint_func", {
                    policy = { restrict_traits = restricted, allowed_trait_ids = restricted and { "app:trait_dummy" } or {} } })
                test.is_nil(out.error)
                local response, status = dispatcher.handle(json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call",
                    params = { name = "list_traits", arguments = table.create(0, 1) } }), "Bearer " .. out.result.token, "finite-guard")
                test.eq(status, 200)
                local listed = json.decode(response.result.content[1].text)
                if restricted then
                    test.eq(#listed.traits, 1)
                    test.eq(listed.traits[1].id, "app:trait_dummy")
                else
                    test.is_true(#listed.traits > 1)
                end
            end
        end)
        test.it("rejects unknown presets at the common mint boundary", function()
            local live_actor = security.new_actor(actor, { user_id = actor, security_groups = {} })
            local scope = security.new_scope({ security.policy("app:mcp_suite_policy") })
            local out = funcs.new():with_actor(live_actor):with_scope(scope):call("app:mint_func", {
                policy = { preset = "unknown:preset" } })
            test.is_nil(out.result)
            test.not_nil(out.error)
        end)
        test.it("an empty whitelist mints without a visibility check (whole actor tree)", function()
            local out = mint_as_actor({})
            test.is_nil((out :: any).error)
            test.not_nil((out :: any).result.token)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
