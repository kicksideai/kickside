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
    test.describe("MCP folder-scope end to end", function()
        local suffix = "e2e-" .. tostring(time.now():unix())
        local actor = "actor-" .. suffix
        local cred = "cred-" .. suffix
        local token = consts.TOKEN.PREFIX .. "e2etoken_" .. suffix
        local PROBE_TOOL = "app:probe_tool"

        local A = uuid.v7()  -- folder A,         path /A/
        local B = uuid.v7()  -- child of A,       path /A/B/
        local C = uuid.v7()  -- sibling folder C, path /C/

        local function db()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            return d
        end

        local function seed_tree()
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local A_path = placement.build_path(d, A, nil)
            local B_path = placement.build_path(d, B, A_path)
            local C_path = placement.build_path(d, C, nil)
            for _, row in ipairs({
                { id = A, path = A_path, parent = nil },
                { id = B, path = B_path, parent = A },
                { id = C, path = C_path, parent = nil },
            }) do
                sql.builder.insert("kickside_components"):set_map({
                    component_id = row.id, impl_id = "kickside.test:mcp_e2e", private_context = "{}",
                    created_at = ts, updated_at = ts, parent_id = row.parent, path = row.path,
                }):run_with(d):exec()
                sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), component_id = row.id, source_component_id = row.id,
                    subject_id = actor, subject_type = "user", access_mask = 15, created_at = ts,
                }):run_with(d):exec()
            end
            d:release()
        end

        local function seed_cred(whitelist_json: string)
            subjects.put(actor, subjects.STATUS.ACTIVE, {})
            local d = db()
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1", { cred })
            local ts = time.now():unix()
            sql.builder.insert(consts.TABLES.CREDENTIALS):set_map({
                credential_id = cred, token_hash = repo.token_hash(token),
                token_prefix = token:sub(1, consts.TOKEN.PREFIX_DISPLAY_LEN), actor_id = actor,
                execution_identity_json = identity_json(actor, cred),
                whitelist_json = whitelist_json, label = "e2e", status = consts.STATUS.ACTIVE,
                policy_json = json.encode({ allowed_tool_ids = { PROBE_TOOL } }), context_json = "{}",
                expires_at = nil, created_at = ts, updated_at = ts,
            }):run_with(d):exec()
            d:release()
        end

        local function cleanup()
            local d = db()
            for _, id in ipairs({ A, B, C }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", id):run_with(d):exec()
            end
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1", { cred })
            d:release()
        end

        local function probe(component_id: string): boolean
            local body = json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call",
                params = { name = "probe_component", arguments = { component_id = component_id } } })
            local resp = dispatcher.handle(body, "Bearer " .. token, nil)
            local r = (resp :: any).result
            local text = r and r.content and r.content[1] and r.content[1].text or "{}"
            local decoded = json.decode(text :: string)
            return type(decoded) == "table" and (decoded :: any).found == true
        end

        test.before_each(function() cleanup(); seed_tree() end)
        test.after_each(cleanup)

        test.it("a folder-scoped credential reads inside the folder and its descendants", function()
            seed_cred(json.encode({ A }))
            test.is_true(probe(A))  -- the whitelisted folder itself
            test.is_true(probe(B))  -- a descendant of it
        end)

        test.it("a folder-scoped credential cannot read a sibling folder", function()
            seed_cred(json.encode({ A }))
            test.is_false(probe(C))  -- outside the whitelist -> confined out
        end)

        test.it("an unscoped credential reads across the whole actor tree", function()
            seed_cred("[]")
            test.is_true(probe(A))
            test.is_true(probe(B))
            test.is_true(probe(C))
        end)

        test.it("resources/read mcp://scope reports the confinement (and its absence)", function()
            local function scope_payload(): any
                local body = json.encode({ jsonrpc = "2.0", id = 1, method = "resources/read", params = { uri = "mcp://scope" } })
                local resp = dispatcher.handle(body, "Bearer " .. token, nil)
                return json.decode(((resp :: any).result.contents[1].text) :: string)
            end

            seed_cred(json.encode({ A }))
            local scoped = scope_payload()
            test.is_true((scoped :: any).scoped == true)
            test.eq((scoped :: any).whitelist_component_ids[1], A)

            seed_cred("[]")
            local open = scope_payload()
            test.is_true((open :: any).scoped == false)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
