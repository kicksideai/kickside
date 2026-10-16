-- Tests for kickside.connection:connections binding.
--
-- Drives the binding via funcs:call with a test actor + scope so the
-- component-service writes (which require an authenticated actor) succeed.
-- Calls go through the same registered functions the live binding dispatches.

local test = require("test")
local errors = require("errors")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")

local NS = "kickside.connection.registry"

local SCOPE_ID = "wippy.security:process"

-- The component-service writes require an authenticated actor with a named scope;
-- the connection itself stores only its credentials and owns no execution identity.
local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(SCOPE_ID)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function call(exec: any, fn: string, args: any): (any, any)
    return exec:call(NS .. ":" .. fn, args)
end

-- Cleanup components owned by tests in this file. The original used a
-- meta_key/meta_value match but those columns don't exist (the table
-- uses `key` and `value`); the bug meant connection components piled up
-- across runs. Catch by impl_id pattern so we wipe whatever the prior
-- runs left behind too — this is a test-only DB.
local function cleanup_test_connections(db: any, _name_prefix: string): ()
    local rows = db:query(
        "SELECT component_id FROM kickside_components WHERE impl_id LIKE 'kickside.plugins.%:%_connection'"
    ) or {}
    for _, r in ipairs(rows) do
        db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_component_group_access WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_components WHERE component_id = $1", { (r :: any).component_id })
    end
end

local function define_tests()
    test.describe("kickside.connection:connections binding", function()
        local db: any
        local exec: any
        local prefix = "regtest_" .. uuid_v4():sub(1, 8) .. "_"

        test.before_all(function()
            exec = new_executor("connections_test_user")
            db = sql.get("app:db")
            test.not_nil(db, "app:db must be available")
            cleanup_test_connections(db, prefix)
        end)

        test.after_all(function()
            cleanup_test_connections(db, prefix)
            if db then db:release() end
        end)

        test.it("register returns a typed invalid request", function()
            local result, err = call(exec, "register", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("find returns a typed invalid request", function()
            local result, err = call(exec, "find", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("upsert returns a typed invalid request", function()
            local result, err = call(exec, "upsert", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("update returns a typed invalid request", function()
            local result, err = call(exec, "update", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("validate returns a typed invalid request", function()
            local result, err = call(exec, "validate", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.describe("provider resolution failures", function()
            test.it("rejects missing provider on register", function()
                local _, err = call(exec, "register", { name = prefix .. "x", auth = {} })
                test.not_nil(err)
                test.eq(tostring(err):find("provider") ~= nil, true)
            end)

            test.it("rejects unknown provider", function()
                local _, err = call(exec, "register", {
                    provider = "nonexistent_provider_xyz_" .. uuid_v4():sub(1, 4),
                    name = prefix .. "x",
                    auth = {},
                })
                test.not_nil(err)
                test.eq(tostring(err):find("no connection binding") ~= nil, true)
            end)

            test.it("requires name", function()
                local _, err = call(exec, "register", { provider = "jira", auth = {} })
                test.not_nil(err)
                test.eq(tostring(err):find("name") ~= nil, true)
            end)

            test.it("requires auth table", function()
                local _, err = call(exec, "register", { provider = "jira", name = prefix .. "x" })
                test.not_nil(err)
                test.eq(tostring(err):find("auth") ~= nil, true)
            end)
        end)

        test.describe("register/find/list/update/delete cycle", function()
            local connection_id: string?
            local connection_name = prefix .. "jira1"

            test.it("registers a jira connection (no validate)", function()
                local result, err = call(exec, "register", {
                    provider = "jira",
                    name = connection_name,
                    auth = {
                        site_url = "https://example.invalid",
                        auth_type = "pat",
                        personal_access_token = "test-token-not-used",
                    },
                })
                test.is_nil(err, "register: " .. tostring(err))
                test.not_nil(result)
                test.not_nil(result.component_id)
                test.eq(result.provider, "jira")
                test.eq(result.name, connection_name)
                test.not_nil(result.rollback)
                test.eq(result.rollback.method, "delete")
                connection_id = result.component_id
            end)

            test.it("finds by provider+name", function()
                local found, err = call(exec, "find", {
                    provider = "jira",
                    name = connection_name,
                })
                test.is_nil(err)
                test.not_nil(found)
                test.eq(found.component_id, connection_id)
            end)

            test.it("upsert returns existing without creating", function()
                local result, err = call(exec, "upsert", {
                    provider = "jira",
                    name = connection_name,
                    auth = {
                        site_url = "https://example.invalid",
                        auth_type = "pat",
                        personal_access_token = "ignored",
                    },
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.created, false)
                test.eq(result.connection.component_id, connection_id)
            end)

            test.it("lists includes the new connection", function()
                local list, err = call(exec, "list", { provider = "jira" })
                test.is_nil(err)
                test.not_nil(list)
                local found = false
                for _, c in ipairs(list.connections :: any) do
                    if (c :: any).component_id == connection_id then
                        found = true
                        break
                    end
                end
                test.eq(found, true, "registered connection must appear in list")
            end)

            test.it("update patches name", function()
                local result, err = call(exec, "update", {
                    component_id = connection_id,
                    name = connection_name .. "_renamed",
                })
                test.is_nil(err, "update: " .. tostring(err))
                test.not_nil(result)
                test.eq(result.component_id, connection_id)
            end)

            test.it("preserves the typed denial for another owner's delete", function()
                local other = new_executor("other-" .. uuid_v4())
                local result, err = call(other, "delete", { component_id = connection_id })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                local owner_result, owner_err = call(exec, "find", { provider = "jira", name = connection_name .. "_renamed" })
                test.is_nil(owner_err)
                test.eq(owner_result.component_id, connection_id)
            end)
            test.it("delete removes the connection", function()
                local result, err = call(exec, "delete", { component_id = connection_id })
                test.is_nil(err, "delete: " .. tostring(err))
                test.not_nil(result)
                test.eq(result.component_id, connection_id)
            end)

            test.it("find after delete returns nothing", function()
                local found, err = call(exec, "find", {
                    provider = "jira",
                    name = connection_name .. "_renamed",
                })
                test.is_nil(err)
                test.is_nil(found)
            end)
        end)

        test.describe("upsert creates when missing", function()
            local upsert_name = prefix .. "upsert"
            local cid: string?

            test.it("creates a new one on first call", function()
                local result, err = call(exec, "upsert", {
                    provider = "confluence",
                    name = upsert_name,
                    auth = {
                        site_url = "https://example.invalid",
                        auth_type = "pat",
                        personal_access_token = "test",
                    },
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.created, true)
                test.not_nil(result.connection.component_id)
                test.not_nil(result.rollback)
                cid = result.connection.component_id
            end)

            test.it("idempotent on second call", function()
                local result, err = call(exec, "upsert", {
                    provider = "confluence",
                    name = upsert_name,
                    auth = {
                        site_url = "https://example.invalid",
                        auth_type = "pat",
                        personal_access_token = "test",
                    },
                })
                test.is_nil(err)
                test.eq(result.created, false)
                test.eq(result.connection.component_id, cid)
            end)

            test.it("cleanup", function()
                if cid then
                    local _, err = call(exec, "delete", { component_id = cid })
                    test.is_nil(err)
                end
            end)
        end)

        test.describe("validate access", function()
            local validate_connection_id: string?
            local viewer_exec: any
            local viewer_id = "connections_test_viewer"

            test.it("requires WRITE access because validation uses stored credentials", function()
                local result, err = call(exec, "register", {
                    provider = "jira",
                    name = prefix .. "validate_write_gate",
                    auth = {
                        site_url = "https://example.invalid",
                        auth_type = "pat",
                        personal_access_token = "test-token-not-used",
                    },
                })
                test.is_nil(err, "register: " .. tostring(err))
                test.not_nil(result)
                validate_connection_id = result.component_id

                db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                      VALUES ($1, 'user', $2, $3, $4, $5, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), viewer_id, validate_connection_id, validate_connection_id, 1 }
                )

                viewer_exec = new_executor(viewer_id)
                local validate_result, validate_err = call(viewer_exec, "validate", { component_id = validate_connection_id })
                test.is_nil(validate_result)
                test.not_nil(validate_err)
            end)

            test.it("cleanup", function()
                if validate_connection_id then
                    local _, err = call(exec, "delete", { component_id = validate_connection_id })
                    test.is_nil(err)
                end
            end)
        end)

        test.describe("argument validation", function()
            test.it("update requires component_id", function()
                local _, err = call(exec, "update", { name = "x" })
                test.not_nil(err)
            end)

            test.it("update with no fields fails", function()
                local _, err = call(exec, "update", { component_id = uuid_v4() })
                test.not_nil(err)
                test.eq(tostring(err):find("nothing to update") ~= nil, true)
            end)

            test.it("delete requires component_id", function()
                local _, err = call(exec, "delete", {})
                test.not_nil(err)
            end)

            test.it("validate requires component_id", function()
                local _, err = call(exec, "validate", {})
                test.not_nil(err)
            end)

            test.it("find requires provider", function()
                local _, err = call(exec, "find", {})
                test.not_nil(err)
            end)
        end)

        test.describe("paged list", function()
            test.it("pages every connection through the component service", function()
                local owner = new_executor("connections_list_all_" .. uuid_v4():sub(1, 8))
                for index = 1, 55 do
                    local _, err = call(owner, "register", {
                        provider = "jira",
                        name = prefix .. "all_" .. tostring(index),
                        auth = { site_url = "https://example.invalid", auth_type = "pat", personal_access_token = "unused" },
                    })
                    test.is_nil(err, "register: " .. tostring(err))
                end
                local first, err = call(owner, "list", { provider = "jira", pagination = { limit = 50, offset = 0 } })
                test.is_nil(err)
                test.eq(#(first.connections :: any), 50)
                test.eq(first.total_count, 55)
                test.is_true(first.has_more)
                local rest, rest_err = call(owner, "list", { provider = "jira", pagination = { limit = 50, offset = 50 } })
                test.is_nil(rest_err)
                test.eq(#(rest.connections :: any), 5)
                test.is_false(rest.has_more)
                local named, named_err = call(owner, "list", { provider = "jira", text = string.upper(prefix) .. "ALL_17" })
                test.is_nil(named_err)
                test.eq(#(named.connections :: any), 1)
            end)

            test.it("refuses an invalid page with a typed error", function()
                local _, err = call(exec, "list", { provider = "jira", pagination = { limit = 0 } })
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
