-- emit_singleton_event is the shared plumbing the per-module event wrappers (uploads,
-- inbox, ...) fold onto: resolve an actor-scoped singleton component's deterministic id,
-- open the kickside.core:threads contract under the ambient actor + scope, and append the
-- domain event. The harness threads binding records the append in thread_emit_log, so
-- these tests prove the fold (right component thread, event passthrough), the actor/scope
-- guard the wrappers relied on, and input validation.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local component = require("component")
local autoinit = require("autoinit")

local DB = "app:db"
local PROBE = "app:emit_singleton_probe"

local function scope(): any
    local pol, perr = security.policy("app:test_scope_policy")
    if not pol then error("test policy missing: " .. tostring(perr)) end
    return security.new_scope({ pol })
end

local function log_rows(component_id: string): { any }
    local db, err = sql.get(DB)
    if err or not db then error("db connect failed: " .. tostring(err)) end
    local seq_column = db:type() == sql.type.POSTGRES
        and "seq BIGSERIAL PRIMARY KEY"
        or "seq INTEGER PRIMARY KEY AUTOINCREMENT"
    db:execute("CREATE TABLE IF NOT EXISTS thread_emit_log (" .. seq_column .. ", component_id TEXT, type TEXT, external_id TEXT)")
    local rows = db:query("SELECT component_id, type, external_id FROM thread_emit_log WHERE component_id = $1", { component_id })
    db:release()
    return (rows or {}) :: { any }
end

local function define_tests()
    test.describe("component.singleton_component_id", function()
        test.it("returns the deterministic autoinit id for (owner, class)", function()
            local owner = "sc-owner-" .. uuid.v4():sub(1, 8)
            local class = "test_uploads"
            test.eq(component.singleton_component_id(owner, class), autoinit.component_id(owner, class))
        end)

        test.it("returns nil for an empty owner or class", function()
            test.is_nil(component.singleton_component_id("", "test_uploads"))
            test.is_nil(component.singleton_component_id("owner", ""))
        end)
    end)

    test.describe("component.emit_singleton_event", function()
        test.it("resolves the singleton id, opens threads, and appends under the ambient actor", function()
            local owner = "emit-owner-" .. uuid.v4():sub(1, 8)
            local class = "test_uploads"
            local expected_id = autoinit.component_id(owner, class)
            test.eq(#log_rows(expected_id), 0)

            local actor = security.new_actor(owner, { security_groups = {} })
            local exec = funcs.new():with_actor(actor):with_scope(scope())
            local res, call_err = exec:call(PROBE, {
                owner = owner,
                class = class,
                event = {
                    type = "kickside.test.upload.events:done",
                    body = { ok = true },
                    impl_id = "app:autoinit_test_decl",
                    thread_class = class,
                    external_source = "kickside.test.upload",
                    external_id = "ext-1",
                    external_version = "1",
                },
            })
            test.is_nil(call_err)
            test.is_true(res ~= nil and (res :: any).ok == true, "emit failed: " .. tostring(res and (res :: any).err))

            local rows = log_rows(expected_id)
            test.eq(#rows, 1)
            test.eq(tostring(rows[1].type), "kickside.test.upload.events:done")
            test.eq(tostring(rows[1].external_id), "ext-1")
        end)

        test.it("uses the authenticated test runner actor rather than a local owner variable", function()
            local owner = "noactor-" .. uuid.v4():sub(1, 8)
            local class = "test_uploads"
            local actor = security.actor()
            test.not_nil(actor)
            local ambient_id = tostring(actor:id())
            local external_id = "ext-guard-" .. uuid.v4()
            local res, err = component.emit_singleton_event(class, {
                type = "kickside.test.upload.events:done",
                external_id = external_id,
            })
            test.is_nil(err)
            test.not_nil(res)
            local rows = log_rows(autoinit.component_id(ambient_id, class))
            local seen = false
            for _, row in ipairs(rows) do
                if tostring(row.external_id) == external_id then seen = true end
            end
            test.eq(seen, true)
            test.eq(#log_rows(autoinit.component_id(owner, class)), 0)
        end)

        test.it("rejects an event without a type", function()
            local owner = "notype-" .. uuid.v4():sub(1, 8)
            local class = "test_uploads"
            local res, err = component.emit_singleton_event(class, { body = {} })
            test.is_nil(res)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(#log_rows(autoinit.component_id(owner, class)), 0)
        end)

        test.it("requires a class", function()
            local res, err = component.emit_singleton_event("", { type = "x" })
            test.is_nil(res)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
