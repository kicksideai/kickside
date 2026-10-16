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
    test.describe("MCP owner group shares end to end", function()
        local suffix = "grp-" .. tostring(time.now():unix())
        local owner = "owner-" .. suffix
        local cred = "cred-" .. suffix
        local token = consts.TOKEN.PREFIX .. "grptoken_" .. suffix
        local GROUP = "app.security:group-" .. suffix
        local PROBE_TOOL = "app:probe_tool"

        local SHARED = uuid.v7()  -- shared only to GROUP
        local OWN = uuid.v7()     -- granted to the owner directly

        local function db()
            local d, e = sql.get("app:db")
            if e then error(tostring(e)) end
            return d
        end

        local function seed_components()
            local d = db()
            local ts = time.now():format(time.RFC3339)
            for _, row in ipairs({
                { id = SHARED, subject = GROUP, subject_type = "group" },
                { id = OWN, subject = owner, subject_type = "user" },
            }) do
                sql.builder.insert("kickside_components"):set_map({
                    component_id = row.id, impl_id = "kickside.test:mcp_group", private_context = "{}",
                    created_at = ts, updated_at = ts, path = placement.build_path(d, row.id, nil),
                }):run_with(d):exec()
                sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), component_id = row.id, source_component_id = row.id,
                    subject_id = row.subject, subject_type = row.subject_type, access_mask = 1, created_at = ts,
                }):run_with(d):exec()
            end
            d:release()
        end

        local function seed_cred(whitelist_json: string)
            local d = db()
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1", { cred })
            local ts = time.now():unix()
            sql.builder.insert(consts.TABLES.CREDENTIALS):set_map({
                credential_id = cred, token_hash = repo.token_hash(token),
                token_prefix = token:sub(1, consts.TOKEN.PREFIX_DISPLAY_LEN), actor_id = owner,
                execution_identity_json = identity_json(owner, cred),
                whitelist_json = whitelist_json, label = "group-e2e", status = consts.STATUS.ACTIVE,
                policy_json = json.encode({ allowed_tool_ids = { PROBE_TOOL } }), context_json = "{}",
                expires_at = nil, created_at = ts, updated_at = ts,
            }):run_with(d):exec()
            d:release()
        end

        local function cleanup()
            local d = db()
            for _, id in ipairs({ SHARED, OWN }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", id):run_with(d):exec()
            end
            d:execute("DELETE FROM " .. consts.TABLES.CREDENTIALS .. " WHERE credential_id = $1", { cred })
            d:release()
            subjects.remove(owner)
        end

        -- tools/call probe_component as the credential; returns (found, is_error, text).
        local function probe(component_id: string): (boolean, boolean, string)
            local body = json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call",
                params = { name = "probe_component", arguments = { component_id = component_id } } })
            local resp = dispatcher.handle(body, "Bearer " .. token, nil)
            local r = (resp :: any).result
            local text = r and r.content and r.content[1] and r.content[1].text or ""
            local is_error = (resp :: any).error ~= nil or (r ~= nil and r.isError == true)
            local decoded = (not is_error) and json.decode(text :: string) or nil
            return type(decoded) == "table" and (decoded :: any).found == true, is_error, tostring(text)
        end

        test.before_each(function() cleanup(); seed_components() end)
        test.after_each(cleanup)

        test.it("a user credential carries the owner's live group-only grant", function()
            subjects.put(owner, subjects.STATUS.ACTIVE, { GROUP })
            seed_cred("[]")
            local found, is_error, text = probe(SHARED)
            test.is_false(is_error, text)
            test.is_true(found)
        end)

        test.it("the whitelist confines a group-shared component outside it", function()
            subjects.put(owner, subjects.STATUS.ACTIVE, { GROUP })
            seed_cred(json.encode({ OWN }))
            local own_found = probe(OWN)
            test.is_true(own_found)
            local shared_found, is_error, text = probe(SHARED)
            test.is_false(is_error, text)
            test.is_false(shared_found)
        end)

        test.it("a whitelisted credential reaches the group share inside its root", function()
            subjects.put(owner, subjects.STATUS.ACTIVE, { GROUP })
            seed_cred(json.encode({ SHARED }))
            local found, is_error, text = probe(SHARED)
            test.is_false(is_error, text)
            test.is_true(found)
            test.is_false((probe(OWN)))
        end)

        test.it("membership additions and removals apply on the next credential dispatch", function()
            subjects.put(owner, subjects.STATUS.ACTIVE, {})
            seed_cred("[]")
            test.is_false((probe(SHARED)))

            subjects.put(owner, subjects.STATUS.ACTIVE, { GROUP })
            local added, added_error, added_text = probe(SHARED)
            test.is_false(added_error, added_text)
            test.is_true(added)

            subjects.put(owner, subjects.STATUS.ACTIVE, {})
            local found, is_error, text = probe(SHARED)
            test.is_false(is_error, text)
            test.is_false(found)
            test.is_true((probe(OWN)))
        end)

        test.it("live owner groups do not add tools outside the credential allowlist", function()
            subjects.put(owner, subjects.STATUS.ACTIVE, { GROUP })
            seed_cred("[]")
            test.is_true((probe(SHARED)))
            local body, body_err = json.encode({ jsonrpc = "2.0", id = 1, method = "tools/call",
                params = { name = "dummy", arguments = table.create(0, 1) } })
            test.is_nil(body_err)
            local response, status = dispatcher.handle(body, "Bearer " .. token, nil)
            test.eq(status, 200)
            test.is_nil(response.error)
            test.eq(response.result.isError, true)
            test.contains(response.result.content[1].text, "not available to this credential: dummy")
        end)

        test.it("a credential whose owner no longer exists runs nothing", function()
            seed_cred("[]")
            local found, is_error = probe(OWN)
            test.is_true(is_error)
            test.is_false(found)
        end)

        test.it("a credential whose owner is inactive runs nothing", function()
            subjects.put(owner, subjects.STATUS.INACTIVE, { GROUP })
            seed_cred("[]")
            local found, is_error = probe(OWN)
            test.is_true(is_error)
            test.is_false(found)
            local shared_found, shared_error = probe(SHARED)
            test.is_true(shared_error)
            test.is_false(shared_found)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
