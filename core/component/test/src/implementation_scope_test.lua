local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local funcs = require("funcs")
local security = require("security")
local placement = require("placement")

local function define_tests()
    test.describe("Component implementation scope", function()
        test.it("requires module authority alongside record grants before pagination, counts, and point access", function()
            local user_id = "scope-test-" .. uuid.v4()
            local denied, allowed = uuid.v7(), uuid.v7()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            db = assert(db)
            local stamp = time.now():format_rfc3339()
            for _, row in ipairs({{denied, "scope.hidden:component"}, {allowed, "scope.visible:component"}}) do
                local _, err = db:execute("INSERT INTO kickside_components (component_id, impl_id, created_at, updated_at) VALUES ($1,$2,$3,$4)", {row[1], row[2], stamp, stamp})
                test.is_nil(err)
                local _, grant_err = db:execute("INSERT INTO kickside_component_access (access_id, component_id, source_component_id, subject_type, subject_id, access_mask, created_at) VALUES ($1,$2,$3,'user',$4,15,$5)", {uuid.v7(), row[1], row[1], user_id, stamp})
                test.is_nil(grant_err)
            end
            db:release()
            local scope, scope_err = security.named_scope("app:implementation_scope")
            test.is_nil(scope_err)
            local result, call_err = funcs.new():with_actor(security.new_actor(user_id, {})):with_scope(scope):call("app:implementation_scope_probe", {denied = denied, visible = allowed})
            local cleanup, cleanup_err = sql.get("app:db")
            test.is_nil(cleanup_err)
            cleanup = assert(cleanup)
            local _, delete_err = cleanup:execute("DELETE FROM kickside_components WHERE component_id IN ($1,$2)", {denied, allowed})
            cleanup:release()
            test.is_nil(delete_err)
            test.is_nil(call_err)
            test.eq(result.count, 1)
            test.eq(#result.rows, 1)
            test.eq(result.rows[1].component_id, allowed)
            test.is_nil(result.denied)
            test.is_false(result.allowed)
            test.is_true(result.visible_allowed)
        end)
    end)

    test.describe("Prepared identity operator implementation visibility", function()
        for _, visible in ipairs({false, true}) do
            test.it(visible and "allows a prepared identity write when the operator can see the module"
                or "refuses a prepared identity write when the operator has ADMIN but cannot see the module", function()
                local user_id, root = uuid.v4(), uuid.v7()
                local impl = visible and "scope.visible:component" or "scope.hidden:component"
                local db = assert(sql.get("app:db"))
                local stamp = time.now():format_rfc3339()
                local _, seed_err = db:execute("INSERT INTO kickside_components (component_id, impl_id, created_at, updated_at) VALUES ($1,$2,$3,$4)",
                    {root, impl, stamp, stamp})
                test.is_nil(seed_err)
                local _, grant_err = db:execute("INSERT INTO kickside_component_access (access_id, component_id, source_component_id, subject_type, subject_id, access_mask, created_at) VALUES ($1,$2,$3,'user',$4,8,$5)",
                    {uuid.v7(), root, root, user_id, stamp})
                test.is_nil(grant_err)
                db:release()
                local scope = assert(security.named_scope("app:implementation_scope"))
                local result, call_err = funcs.new():with_actor(security.new_actor(user_id, {})):with_scope(scope)
                    :call("app:implementation_scope_probe", {denied = root, visible = impl, identity_write = true})
                db = assert(sql.get("app:db"))
                local rows, read_err = db:query("SELECT identity_generation, context_revision FROM kickside_components WHERE component_id=$1", {root})
                local audits, audit_err = db:query("SELECT COUNT(*) AS n FROM kickside_execution_identity_audit WHERE component_id=$1", {root})
                local _, audit_cleanup_err = db:execute("DELETE FROM kickside_execution_identity_audit WHERE component_id=$1", {root})
                local _, cleanup_err = db:execute("DELETE FROM kickside_components WHERE component_id=$1", {root})
                db:release()
                test.is_nil(read_err)
                test.is_nil(audit_err)
                test.is_nil(audit_cleanup_err)
                test.is_nil(cleanup_err)
                test.is_nil(call_err)
                test.eq(result.implementation_visible, visible)
                if visible then
                    test.is_nil(result.error)
                    test.not_nil(result.result)
                else
                    test.is_nil(result.result)
                    test.is_true(result.refused, result.error)
                end
                test.eq(tonumber(rows[1].identity_generation), visible and 1 or 0)
                test.eq(tonumber(rows[1].context_revision), visible and 1 or 0)
                test.eq(tonumber(audits[1].n), visible and 1 or 0)
            end)
        end
    end)

    test.describe("Supplied principal authority without ambient implementation visibility", function()
        local root, suffix = uuid.v7(), uuid.v4()
        local direct, grouped, group, service, reader = "direct-" .. suffix, "grouped-" .. suffix,
            "group-" .. suffix, "service-" .. suffix, "reader-" .. suffix
        local path: string = ""

        test.before_all(function()
            local db = assert(sql.get("app:db"))
            path = assert(placement.build_path(db, root, nil))
            local stamp = time.now():format_rfc3339()
            local _, err = db:execute("INSERT INTO kickside_components (component_id, impl_id, path, created_at, updated_at) VALUES ($1,$2,$3,$4,$5)",
                {root, "scope.hidden:component", path, stamp, stamp})
            test.is_nil(err)
            for _, grant in ipairs({
                {"user", direct, 15}, {"group", group, 15}, {"service", service, 15}, {"user", reader, 1},
            }) do
                local _, grant_err = db:execute("INSERT INTO kickside_component_access (access_id, component_id, source_component_id, subject_type, subject_id, access_mask, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
                    {uuid.v7(), root, root, grant[1], grant[2], grant[3], stamp})
                test.is_nil(grant_err)
            end
            db:release()
        end)

        test.after_all(function()
            local db = assert(sql.get("app:db"))
            local _, err = db:execute("DELETE FROM kickside_components WHERE component_id = $1", {root})
            db:release()
            test.is_nil(err)
        end)

        local function check(kind: string, id: string, groups: {string}, filter: any?): any
            local scope = assert(security.named_scope("app:implementation_scope"))
            -- The ambient actor has its own full grant; it cannot substitute for
            -- a supplied principal that lacks ADMIN.
            local result, err = funcs.new():with_actor(security.new_actor(direct, {})):with_scope(scope)
                :call("app:implementation_scope_probe", {denied = root, principal = {kind = kind, id = id},
                    groups = groups, access_filter = filter})
            test.is_nil(err)
            test.not_nil(result)
            test.is_false(result.implementation_visible)
            return result
        end

        for _, route in ipairs({"admin", "principal"}) do
            test.it(route .. " allows direct user ADMIN without worker registry visibility", function()
                test.is_true(check("user", direct, {})[route])
            end)
            test.it(route .. " allows live group ADMIN without worker registry visibility", function()
                test.is_true(check("user", grouped, {group})[route])
            end)
            test.it(route .. " allows typed service ADMIN without worker registry visibility", function()
                test.is_true(check("service", service, {})[route])
            end)
            test.it(route .. " refuses a supplied principal without ADMIN despite worker grants", function()
                test.is_false(check("user", reader, {})[route])
                test.is_false(check("user", grouped, {})[route])
            end)
        end

        test.it("principal authority retains the supplied placement filter", function()
            test.is_true(check("user", direct, {}, {prefixes = {path}}).principal)
            test.is_false(check("user", direct, {}, {prefixes = {}}).principal)
            test.is_false(check("user", direct, {}, {prefixes = {path .. "outside/"}}).principal)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
