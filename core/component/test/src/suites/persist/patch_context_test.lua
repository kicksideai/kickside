-- PATCH_CONTEXT merges keys into a component's private_context without clobbering
-- the rest of the blob. Runtime-owned keys use privileged commands. Every context write advances the
-- row's context_revision, and a patch that runs concurrently with another patch
-- merges into the other's committed result. Exercised against the harness db via
-- ops.dispatch in a transaction.

local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local ops = require("ops")
local component_types = require("component_types")

local function db(): any
    local d, e = sql.get("app:db")
    if e then error("db connect failed: " .. tostring(e)) end
    return d
end

local function read_ctx(d: any, id: string): any
    local rows = sql.builder.select("private_context"):from("kickside_components")
        :where("component_id = ?", id):limit(1):run_with(d):query()
    local raw = (rows and rows[1] and (rows[1] :: any).private_context) or "{}"
    return json.decode(tostring(raw))
end

local function read_revision(d: any, id: string): integer
    local rows = sql.builder.select("context_revision"):from("kickside_components")
        :where("component_id = ?", id):limit(1):run_with(d):query()
    return tonumber(rows and rows[1] and (rows[1] :: any).context_revision) :: integer
end

local function seed(d: any, context: string): string
    local id = uuid.v7()
    local ts = time.now():format(time.RFC3339)
    local _, err = sql.builder.insert("kickside_components"):set_map({
        component_id = id, impl_id = "kickside.test:patch", private_context = context,
        position = "n", created_at = ts, updated_at = ts,
    }):run_with(d):exec()
    if err then error("seed failed: " .. tostring(err)) end
    return id
end

-- Block until another backend is waiting on a row lock. PostgreSQL runs the two
-- writers on separate pooled connections, so the second writer is parked on the
-- first writer's row lock before the first commits. SQLite serializes writers on
-- its single connection, so the second writer cannot start until the first ends.
local function await_lock_waiter(dialect: string)
    if dialect ~= sql.type.POSTGRES then return end
    local d = db()
    for _ = 1, 500 do
        local rows, err = d:query(
            "SELECT count(*) AS n FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'")
        if err then d:release(); error("lock probe failed: " .. tostring(err)) end
        if (tonumber(rows and rows[1] and (rows[1] :: any).n) or 0) > 0 then d:release(); return end
        time.sleep("10ms")
    end
    d:release()
    error("second writer never waited on the row lock")
end

local function patch(d: any, id: string, p: any)
    local tx = d:begin()
    local _, err = ops.dispatch(tx :: sql.Transaction, d :: sql.DB, {
        type = component_types.COMMAND_TYPES.PATCH_CONTEXT,
        payload = { component_id = id, patch = p },
    })
    if err then tx:rollback(); error("patch failed: " .. tostring(err)) end
    tx:commit()
end

local function define_tests()
    test.describe("ops.PATCH_CONTEXT partial merge", function()
        local id = uuid.v7()
        local d0 = db()
        local ts = time.now():format(time.RFC3339)
        sql.builder.insert("kickside_components"):set_map({
            component_id = id, impl_id = "kickside.test:patch", private_context = "{}",
            position = "n", created_at = ts, updated_at = ts,
        }):run_with(d0):exec()
        d0:release()

        test.it("merges independent keys without clobbering", function()
            local d = db()
            patch(d, id, { a = 1 })
            patch(d, id, { b = 2 })
            local ctx = read_ctx(d, id)
            test.eq(ctx.a, 1)
            test.eq(ctx.b, 2)
            d:release()
        end)

        test.it("overwrites only the patched key, leaving the rest", function()
            local d = db()
            patch(d, id, { a = 9 })
            local ctx = read_ctx(d, id)
            test.eq(ctx.a, 9)
            test.eq(ctx.b, 2)
            d:release()
        end)

        test.it("rejects a generic frozen identity patch without touching siblings", function()
            local d = db()
            local before = read_revision(d, id)
            local tx = d:begin()
            local _, err = ops.dispatch(tx :: sql.Transaction, d :: sql.DB, {
                type = component_types.COMMAND_TYPES.PATCH_CONTEXT,
                payload = { component_id = id, patch = {
                    _execution_identity = { version = 2, principal = { kind = "user", id = "u1" }, authorized_by = { kind = "user", id = "u1" }, authorized_via = "interactive" },
                } },
            })
            tx:rollback()
            test.not_nil(err)
            test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
            local ctx = read_ctx(d, id)
            test.is_nil(ctx._execution_identity)
            test.eq(ctx.a, 9)
            test.eq(ctx.b, 2)
            test.eq(read_revision(d, id), before)
            d:release()
        end)

        test.it("advances context_revision by one per context write", function()
            local d = db()
            local before = read_revision(d, id)
            patch(d, id, { c = 3 })
            test.eq(read_revision(d, id), before + 1)
            local tx = d:begin()
            local _, err = ops.dispatch(tx :: sql.Transaction, d :: sql.DB, {
                type = component_types.COMMAND_TYPES.SET_CONTEXT,
                payload = { component_id = id, private_context = { a = 9, b = 2, c = 3 } },
            })
            if err then tx:rollback() else tx:commit() end
            test.is_nil(err)
            test.eq(read_revision(d, id), before + 2)
            d:release()
        end)

        test.it("requires a patch table", function()
            local d = db()
            local tx = d:begin()
            local _, err = ops.dispatch(tx :: sql.Transaction, d :: sql.DB, {
                type = component_types.COMMAND_TYPES.PATCH_CONTEXT,
                payload = { component_id = id },
            })
            tx:rollback()
            d:release()
            test.not_nil(err)
        end)
    end)
end

local function define_concurrency_tests()
    test.describe("ops.PATCH_CONTEXT concurrent writers", function()
        test.it("a patch parked behind an uncommitted patch keeps both keys", function()
            local d0 = db()
            local id = seed(d0, "{}")
            local dialect = d0:type()
            d0:release()

            local d1 = db()
            local tx1 = d1:begin()
            local _, err1 = ops.dispatch(tx1 :: sql.Transaction, d1 :: sql.DB, {
                type = component_types.COMMAND_TYPES.PATCH_CONTEXT,
                payload = { component_id = id, patch = { first = 1 } },
            })
            if err1 then tx1:rollback(); d1:release(); d0:release(); error("first patch failed: " .. tostring(err1)) end

            local done = channel.new(1)
            coroutine.spawn(function()
                local d2 = db()
                local tx2 = d2:begin()
                local _, err2 = ops.dispatch(tx2 :: sql.Transaction, d2 :: sql.DB, {
                    type = component_types.COMMAND_TYPES.PATCH_CONTEXT,
                    payload = { component_id = id, patch = { second = 2 } },
                })
                if err2 then tx2:rollback() else tx2:commit() end
                d2:release()
                done:send(err2 and tostring(err2) or "")
            end)

            await_lock_waiter(dialect)
            tx1:commit()
            d1:release()

            test.eq(done:receive(), "")
            local d3 = db()
            local ctx = read_ctx(d3, id)
            local revision = read_revision(d3, id)
            d3:release()
            test.eq(ctx.first, 1)
            test.eq(ctx.second, 2)
            test.eq(revision, 2)
        end)
    end)
end

local run_cases = test.run_cases(function()
    define_tests()
    define_concurrency_tests()
end)
return { run = function(options) return run_cases(options) end }
