-- Verifies the canonical contract path for component registration: opening the
-- component_service framed with_actor/with_scope runs register_component AS that
-- owner. The bound register impl reads the owner from the ambient security actor,
-- so this exercises open-time actor/scope propagation through the contract
-- dispatcher down to the function execution context.

local test = require("test")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")
local json = require("json")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"

local function define_tests()
    test.describe("Component canonical registration via contract", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "owner-" .. suffix
        local impl = "kickside.test:canonical"

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        -- Open the component service framed as the owner: with_actor/with_scope
        -- are the canonical seam the background memory provisioning relies on.
        local function open_as_owner()
            local actor = security.new_actor(owner, { security_groups = {} })
            local svc, err = contract.get(COMPONENT_SERVICE)
            if err or not svc then error("component_service unavailable: " .. tostring(err)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open failed: " .. tostring(oerr)) end
            return inst
        end

        local function owner_access_count(component_id)
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows = sql.builder.select("subject_id"):from("kickside_component_access")
                :where("component_id = ?", component_id)
                :where("subject_id = ?", owner):run_with(d):query()
            d:release()
            return #(rows or {})
        end

        local function component_created_at(component_id)
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows = sql.builder.select("created_at"):from("kickside_components")
                :where("component_id = ?", component_id):run_with(d):query()
            d:release()
            return rows and rows[1] and rows[1].created_at or nil
        end

        local function meta_value(component_id, key)
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows = sql.builder.select("value"):from("kickside_component_meta")
                :where("component_id = ?", component_id)
                :where("key = ?", key):run_with(d):query()
            d:release()
            return rows and rows[1] and rows[1].value or nil
        end

        local function private_context(component_id)
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows = sql.builder.select("private_context"):from("kickside_components")
                :where("component_id = ?", component_id):limit(1):run_with(d):query()
            d:release()
            local decoded, derr = json.decode(tostring(rows and rows[1] and rows[1].private_context or "{}"))
            if derr then error("private context decode failed: " .. tostring(derr)) end
            return decoded
        end

        local function reset_realtime_events()
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            d:execute("DROP TABLE IF EXISTS kickside_component_notify_access_realtime_events")
            local _, table_err = d:execute([[
                CREATE TABLE kickside_component_notify_access_realtime_events (
                    user_id TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    event TEXT NOT NULL,
                    data TEXT NOT NULL,
                    authorized TEXT NOT NULL
                )
            ]])
            d:release()
            if table_err then error("event table create failed: " .. tostring(table_err)) end
        end

        local function latest_realtime_data()
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end
            local rows, qerr = d:query("SELECT data FROM kickside_component_notify_access_realtime_events LIMIT 1")
            d:release()
            if qerr then error("event query failed: " .. tostring(qerr)) end
            local raw = rows and rows[1] and rows[1].data or nil
            local decoded, derr = json.decode(raw or "{}")
            if derr then error("event decode failed: " .. tostring(derr)) end
            return decoded
        end

        test.it("registers a component as the framed owner", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { label = "canonical-target" },
            })
            test.not_nil(reg)
            test.is_true(reg.success, "register via framed contract must succeed (actor propagated)")
            local cid = reg.component_id
            test.not_nil(cid)
            test.is_true(owner_access_count(cid) > 0, "the framed owner must hold an access grant from register")
        end)

        test.it("reports duplicate registration as a nonretryable native conflict without changing the winner", function()
            local id = uuid.v7()
            local inst = open_as_owner()
            local first, first_err = inst:register({component_id = id, impl_id = impl,
                meta = {label = "winner"}, private_context = {marker = "kept"}})
            test.is_nil(first_err)
            test.is_true(first.success)
            local created_at = component_created_at(id)
            local owner_grants = owner_access_count(id)
            local duplicate, duplicate_err = inst:register({component_id = id, impl_id = impl,
                meta = {label = "loser"}, private_context = {marker = "replaced"}})
            test.is_nil(duplicate_err)
            test.eq(duplicate.success, false)
            test.eq(duplicate.kind, errors.CONFLICT)
            test.eq(duplicate.retryable, false)
            test.eq(duplicate.details.code, "component_already_exists")
            test.eq(component_created_at(id), created_at)
            test.eq(owner_access_count(id), owner_grants)
            test.eq(meta_value(id, "label"), "winner")
            test.eq(private_context(id).marker, "kept")
        end)

        test.it("registers components on repeated opens under the same owner", function()
            local first = open_as_owner():register({ impl_id = impl, meta = { label = "first" } })
            local second = open_as_owner():register({ impl_id = impl, meta = { label = "second" } })
            test.is_true(first.success and second.success, "both framed registrations must succeed")
            test.is_true(first.component_id ~= second.component_id, "each register yields a distinct component")
        end)

        test.it("rejects additional_access without an explicit subject type", function()
            local reg = open_as_owner():register({
                impl_id = impl,
                additional_access = { { subject_id = "typeless-grantee", access_mask = 1 } },
            })
            test.not_nil(reg)
            test.eq(reg.success, false)
            test.contains(tostring(reg.error), "subject_type")
        end)

        test.it("rejects private config keys in component public meta", function()
            local reg = open_as_owner():register({
                impl_id = impl,
                meta = { config = { secret = "nope" } },
            })
            test.not_nil(reg)
            test.eq(reg.success, false)
            test.contains(reg.error, "component public metadata cannot store private/config key: config")
        end)

        test.it("rejects execution identity keys in component public meta updates", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { label = "public-meta-policy" },
            })
            test.is_true(reg.success, "register must succeed before update policy test")

            local result = inst:set_meta({
                component_id = reg.component_id,
                fields = { actor_context = "{}" },
            })
            test.not_nil(result)
            test.eq(result.success, false)
            test.contains(result.error, "component public metadata cannot store private/config key: actor_context")
        end)

        test.it("set_meta can delete public meta keys without touching private state", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { status = "idle", remove_me = "old" },
                private_context = { secret = "kept" },
            })
            test.is_true(reg.success, "register must succeed before set_meta delete test")

            local result = inst:set_meta({
                component_id = reg.component_id,
                fields = { status = "running" },
                delete_keys = { "remove_me" },
            })
            test.not_nil(result)
            test.eq(result.success, true)
            test.eq(meta_value(reg.component_id, "status"), "running")
            test.is_nil(meta_value(reg.component_id, "remove_me"))
        end)

        test.it("set_meta accepts a delete-only request (empty fields + delete_keys)", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { status = "idle", remove_me = "old" },
            })
            test.is_true(reg.success, "register must succeed before delete-only set_meta test")

            local result = inst:set_meta({
                component_id = reg.component_id,
                fields = {},
                delete_keys = { "remove_me" },
            })
            test.not_nil(result)
            test.eq(result.success, true)
            test.eq(meta_value(reg.component_id, "status"), "idle")
            test.is_nil(meta_value(reg.component_id, "remove_me"))
        end)

        test.it("set_meta no-ops cleanly when the delete-only key is absent", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { status = "idle" },
            })
            test.is_true(reg.success, "register must succeed before absent-key delete test")

            local result = inst:set_meta({
                component_id = reg.component_id,
                fields = {},
                delete_keys = { "never_existed" },
            })
            test.not_nil(result)
            test.eq(result.success, true)
            test.eq(result.changes_made, false)
            test.eq(meta_value(reg.component_id, "status"), "idle")
        end)

        test.it("set_meta publishes the full public meta snapshot", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { title = "snapshot", status = "idle", remove_me = "old" },
            })
            test.is_true(reg.success, "register must succeed before set_meta realtime test")
            reset_realtime_events()

            local result = inst:set_meta({
                component_id = reg.component_id,
                fields = { status = "running" },
                delete_keys = { "remove_me" },
            })
            test.not_nil(result)
            test.eq(result.success, true)

            local data = latest_realtime_data()
            test.eq(data.event, "component.meta.changed")
            test.eq(data.component_id, reg.component_id)
            test.eq(data.meta.title, "snapshot")
            test.eq(data.meta.status, "running")
            test.is_nil(data.meta.remove_me)
        end)

        test.it("atomically commits metadata and private context in one update", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { title = "before" },
                private_context = { prompt = "before" },
            })
            test.is_true(reg.success, "register must succeed before atomic update test")

            local result = inst:update({
                component_id = reg.component_id,
                commands = {
                    { type = "SET_META", payload = { fields = { title = "after" } } },
                    { type = "PATCH_CONTEXT", payload = { patch = { prompt = "after" } } },
                },
            })
            test.not_nil(result)
            test.is_true(result.success, tostring(result.error))
            test.eq(meta_value(reg.component_id, "title"), "after")
            test.eq(private_context(reg.component_id).prompt, "after")
        end)

        test.it("rolls metadata back when a later context command fails", function()
            local inst = open_as_owner()
            local reg = inst:register({
                impl_id = impl,
                meta = { title = "kept" },
                private_context = { prompt = "kept" },
            })
            test.is_true(reg.success, "register must succeed before rollback test")

            local result = inst:update({
                component_id = reg.component_id,
                commands = {
                    { type = "SET_META", payload = { fields = { title = "must-roll-back" } } },
                    { type = "PATCH_CONTEXT", payload = {} },
                },
            })
            test.not_nil(result)
            test.is_false(result.success)
            test.eq(meta_value(reg.component_id, "title"), "kept")
            test.eq(private_context(reg.component_id).prompt, "kept")
        end)

        -- One canonical timestamp representation: created_at is an RFC3339 UTC
        -- string at second precision in TEXT on both SQLite and PostgreSQL. No unix
        -- integers, no sub-second variant, no per-DB shape.
        test.it("stores created_at as a parseable second-precision RFC3339 string", function()
            local reg = open_as_owner():register({ impl_id = impl, meta = { title = "ts" } })
            test.is_true(reg.success, "register must succeed before timestamp read")

            local ts = component_created_at(reg.component_id)
            test.eq(type(ts), "string")
            local s = tostring(ts)

            local parsed, perr = time.parse(time.RFC3339, s)
            test.is_nil(perr)
            test.not_nil(parsed)

            -- Uniform second precision: no fractional seconds. A mixed RFC3339NANO
            -- write would break the lexical sort the ORDER BY relies on.
            test.not_nil(string.match(s, "^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%dZ$"),
                "created_at must be second-precision RFC3339, got: " .. s)
        end)

        -- The bug this fixes: when the column mixed unix integers (column DEFAULT
        -- rows) with RFC3339 strings, SQLite sorted every integer ahead of every
        -- string, so ORDER BY created_at did not reflect real time. With canonical
        -- TEXT, chronological order equals lexical order.
        test.it("orders rows chronologically by created_at on the live DB", function()
            local d, e = sql.get(DB)
            if e then error("db connect failed: " .. tostring(e)) end

            local marker = "kickside.test:ts-order-" .. uuid.v4():sub(1, 8)
            local early_id = uuid.v7()
            local late_id = uuid.v7()
            local early_ts = "2020-01-01T00:00:00Z"
            local late_ts = "2030-01-01T00:00:00Z"

            -- Insert the later row first so insertion order cannot mask a sort bug.
            local _, ie = sql.builder.insert("kickside_components")
                :set_map({ component_id = late_id, impl_id = marker, created_at = late_ts, updated_at = late_ts })
                :run_with(d):exec()
            if ie then d:release() error("insert late failed: " .. tostring(ie)) end
            local _, ee = sql.builder.insert("kickside_components")
                :set_map({ component_id = early_id, impl_id = marker, created_at = early_ts, updated_at = early_ts })
                :run_with(d):exec()
            if ee then d:release() error("insert early failed: " .. tostring(ee)) end

            local rows, qe = sql.builder.select("component_id", "created_at")
                :from("kickside_components")
                :where("impl_id = ?", marker)
                :order_by("created_at ASC")
                :run_with(d):query()

            sql.builder.delete("kickside_components"):where("impl_id = ?", marker):run_with(d):exec()
            d:release()
            if qe then error("ordered query failed: " .. tostring(qe)) end

            test.eq(#(rows or {}), 2)
            test.eq(rows[1].component_id, early_id, "earlier created_at must sort first")
            test.eq(rows[2].component_id, late_id, "later created_at must sort last")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
