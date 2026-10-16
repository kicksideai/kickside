-- Tests for kickside.connection:reply_providers binding.
--
-- Drives the binding via funcs:call with a test actor + scope so the
-- component-service writes succeed.

local test = require("test")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")

local NS = "kickside.connection.registry"

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function call(exec: any, fn: string, args: any): (any, any)
    return exec:call(NS .. ":" .. fn, args)
end

-- meta_key/meta_value referenced columns that don't exist (table uses
-- `key`/`value`); bug let reply-provider components accumulate. Catch
-- by impl_id and wipe associated meta/access rows too.
local function cleanup(db: any, _prefix: string): ()
    local rows = db:query(
        "SELECT component_id FROM kickside_components WHERE impl_id LIKE 'kickside.plugins.%:%_connection' OR impl_id LIKE 'kickside.plugins.%:%_reply'"
    ) or {}
    for _, r in ipairs(rows) do
        db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_component_group_access WHERE component_id = $1", { (r :: any).component_id })
        db:execute("DELETE FROM kickside_components WHERE component_id = $1", { (r :: any).component_id })
    end
end

local function define_tests()
    test.describe("kickside.connection:reply_providers binding", function()
        local db: any
        local exec: any
        local prefix = "rptest_" .. uuid_v4():sub(1, 8) .. "_"

        test.before_all(function()
            exec = new_executor("reply_providers_test_user")
            db = sql.get("app:db")
            test.not_nil(db)
            cleanup(db, prefix)
        end)

        test.after_all(function()
            cleanup(db, prefix)
            if db then db:release() end
        end)

        test.it("rp_create returns a typed invalid request", function()
            local result, err = call(exec, "rp_create", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("rp_find returns a typed invalid request", function()
            local result, err = call(exec, "rp_find", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("rp_upsert returns a typed invalid request", function()
            local result, err = call(exec, "rp_upsert", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("rp_update returns a typed invalid request", function()
            local result, err = call(exec, "rp_update", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("rp_delete returns a typed invalid request", function()
            local result, err = call(exec, "rp_delete", {})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.describe("argument validation", function()
            test.it("create requires provider", function()
                local _, err = call(exec, "rp_create", { name = "x", auth = {} })
                test.not_nil(err)
                test.eq(tostring(err):find("provider") ~= nil, true)
            end)

            test.it("create rejects non-reply_provider providers", function()
                local _, err = call(exec, "rp_create", {
                    provider = "jira",
                    name = prefix .. "x",
                    auth = {},
                })
                test.not_nil(err)
                test.eq(tostring(err):find("no reply_provider binding") ~= nil, true)
            end)

            test.it("find requires provider", function()
                local _, err = call(exec, "rp_find", {})
                test.not_nil(err)
            end)

            test.it("update requires component_id", function()
                local _, err = call(exec, "rp_update", {})
                test.not_nil(err)
            end)

            test.it("delete requires component_id", function()
                local _, err = call(exec, "rp_delete", {})
                test.not_nil(err)
            end)
        end)

        test.describe("create + find + delete cycle (discord)", function()
            local component_id: string?
            local conn_name = prefix .. "discord1"

            test.it("creates a discord reply provider", function()
                local result, err = call(exec, "rp_create", {
                    provider = "discord",
                    name = conn_name,
                    auth = { bot_token = "test-token-not-used" },
                })
                test.is_nil(err, "create: " .. tostring(err))
                test.not_nil(result)
                test.not_nil(result.component_id)
                test.eq(result.provider, "discord")
                test.eq(result.name, conn_name)
                component_id = result.component_id
            end)

            test.it("finds by provider+name", function()
                local found, err = call(exec, "rp_find", { provider = "discord", name = conn_name })
                test.is_nil(err)
                test.not_nil(found)
                test.eq(found.component_id, component_id)
            end)

            test.it("list includes the new reply provider", function()
                local list, err = call(exec, "rp_list", { provider = "discord" })
                test.is_nil(err)
                test.not_nil(list)
                local found = false
                for _, c in ipairs(list.reply_providers :: any) do
                    if (c :: any).component_id == component_id then
                        found = true
                        break
                    end
                end
                test.eq(found, true)
            end)

            test.it("update patches name", function()
                local result, err = call(exec, "rp_update", {
                    component_id = component_id,
                    name = conn_name .. "_renamed",
                })
                test.is_nil(err, "update: " .. tostring(err))
                test.not_nil(result)
            end)

            test.it("delete removes it", function()
                local result, err = call(exec, "rp_delete", { component_id = component_id })
                test.is_nil(err, "delete: " .. tostring(err))
                test.not_nil(result)
            end)
        end)

        test.describe("paged list", function()
            test.it("pages every reply provider through the component service", function()
                local owner = new_executor("reply_providers_list_all_" .. uuid_v4():sub(1, 8))
                for index = 1, 55 do
                    local _, err = call(owner, "rp_create", {
                        provider = "discord",
                        name = prefix .. "all_" .. tostring(index),
                        auth = { bot_token = "test-token-not-used" },
                    })
                    test.is_nil(err, "create: " .. tostring(err))
                end
                local first, err = call(owner, "rp_list", { provider = "discord", pagination = { limit = 50, offset = 0 } })
                test.is_nil(err)
                test.eq(#(first.reply_providers :: any), 50)
                test.eq(first.total_count, 55)
                test.is_true(first.has_more)
                local rest, rest_err = call(owner, "rp_list", { provider = "discord", pagination = { limit = 50, offset = 50 } })
                test.is_nil(rest_err)
                test.eq(#(rest.reply_providers :: any), 5)
                test.is_false(rest.has_more)
            end)

            test.it("refuses an invalid page with a typed error", function()
                local _, err = call(exec, "rp_list", { provider = "discord", pagination = { limit = 0 } })
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
