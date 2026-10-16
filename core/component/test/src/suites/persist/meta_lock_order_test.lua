-- Two writers of one component's public meta lock its rows in one order: the
-- component row, then the meta rows. A writer that already holds a meta row and
-- the component row, and then writes a meta row a second writer holds, must not
-- deadlock with that second writer.
local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local ops = require("ops")

local function db(): any
    local d, e = sql.get("app:db")
    if e then error("db connect failed: " .. tostring(e)) end
    return d
end

local function seed(d: any, context: string): string
    local id = uuid.v7()
    local ts = time.now():format(time.RFC3339)
    local _, err = sql.builder.insert("kickside_components"):set_map({
        component_id = id, impl_id = "kickside.test:meta", private_context = context,
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

local function set_meta(tx: any, id: string, fields: any): string
    local _, _, err = ops.set_public_meta(tx :: sql.Transaction, id, fields, nil)
    return err and tostring(err) or ""
end

local function read_meta(id: string): any
    local d = db()
    local rows = sql.builder.select("key", "value"):from("kickside_component_meta")
        :where("component_id = ?", id):run_with(d):query()
    d:release()
    local out = {}
    for _, r in ipairs(rows or {}) do out[(r :: any).key] = (r :: any).value end
    return out
end

local function define_tests()
    test.describe("public meta writers", function()
        test.it("writes fields across batch boundaries and retains every existing row identity", function()
            local d = db()
            local id = seed(d, "{}")
            local fields = {}
            for index = 1, 201 do fields["field-" .. tostring(index)] = tostring(index) end
            local tx, begin_err = d:begin()
            test.is_nil(begin_err)
            local results, changed, write_err = ops.set_public_meta(tx, id, fields, nil)
            if write_err then tx:rollback() else tx:commit() end
            test.is_nil(write_err)
            test.is_true(changed)
            test.eq(#results, 201)
            local returned = {}
            for _, result in ipairs(results) do
                test.eq(result.component_id, id)
                test.is_true(result.changes_made)
                test.eq(result.value, fields[result.key])
                test.is_nil(returned[result.key])
                returned[result.key] = true
            end
            local _, age_err = sql.builder.update("kickside_component_meta")
                :set("created_at", "2000-01-01T00:00:00Z")
                :where("component_id = ?", id):run_with(d):exec()
            test.is_nil(age_err)
            local before, before_err = sql.builder.select("meta_id", "key", "value", "created_at")
                :from("kickside_component_meta"):where("component_id = ?", id):run_with(d):query()
            test.is_nil(before_err)
            test.eq(#before, 201)
            local identities = {}
            for _, row in ipairs(before) do
                identities[row.key] = row
                test.eq(row.value, fields[row.key])
                test.eq(row.created_at, "2000-01-01T00:00:00Z")
                test.is_true(returned[row.key])
            end
            for index = 1, 301 do fields["field-" .. tostring(index)] = "updated-" .. tostring(index) end
            local tx2, begin2_err = d:begin()
            test.is_nil(begin2_err)
            local updated, changed2, second_err = ops.set_public_meta(tx2, id, fields, nil)
            if second_err then tx2:rollback() else tx2:commit() end
            test.is_nil(second_err)
            test.is_true(changed2)
            test.eq(#updated, 301)
            local after, after_err = sql.builder.select("meta_id", "key", "value", "created_at")
                :from("kickside_component_meta"):where("component_id = ?", id):run_with(d):query()
            d:release()
            test.is_nil(after_err)
            test.eq(#after, 301)
            for _, row in ipairs(after) do
                test.eq(row.value, fields[row.key])
                local original = identities[row.key]
                if original then
                    test.eq(row.meta_id, original.meta_id)
                    test.eq(row.created_at, original.created_at)
                end
            end
        end)

        test.it("rejects duplicate keys without changing the existing metadata row", function()
            local d = db()
            local id = seed(d, "{}")
            local tx, begin_err = d:begin()
            test.is_nil(begin_err)
            test.eq(set_meta(tx, id, { shared = "original" }), "")
            local _, commit_err = tx:commit()
            test.is_nil(commit_err)
            local _, duplicate_err = sql.builder.insert("kickside_component_meta"):set_map({
                meta_id = uuid.v7(), component_id = id, key = "shared", value = "duplicate",
            }):run_with(d):exec()
            local rows, read_err = sql.builder.select("value"):from("kickside_component_meta")
                :where("component_id = ?", id):where("key = ?", "shared"):run_with(d):query()
            d:release()
            test.not_nil(duplicate_err)
            test.is_nil(read_err)
            test.eq(#rows, 1)
            test.eq(rows[1].value, "original")
        end)

        test.it("concurrent writers of a new key leave exactly one row and retain its identity", function()
            local d1 = db()
            local id = seed(d1, "{}")
            local dialect = tostring(d1:type())
            local tx1, begin_err = d1:begin()
            test.is_nil(begin_err)
            test.eq(set_meta(tx1, id, { shared = "first" }), "")
            local first, read_err = sql.builder.select("meta_id", "created_at")
                :from("kickside_component_meta"):where("component_id = ?", id)
                :where("key = ?", "shared"):run_with(tx1):query()
            test.is_nil(read_err)
            test.eq(#first, 1)
            local done = channel.new(1)
            coroutine.spawn(function()
                local d2 = db()
                local tx2, begin2_err = d2:begin()
                if begin2_err then d2:release(); done:send(tostring(begin2_err)); return end
                local err2 = set_meta(tx2, id, { shared = "second" })
                if err2 ~= "" then tx2:rollback() else
                    local _, commit_err = tx2:commit()
                    if commit_err then err2 = tostring(commit_err) end
                end
                d2:release()
                done:send(err2)
            end)
            await_lock_waiter(dialect)
            local _, commit_err = tx1:commit()
            d1:release()
            test.is_nil(commit_err)
            test.eq(done:receive(), "")
            local d = db()
            local rows, rows_err = sql.builder.select("meta_id", "created_at", "value")
                :from("kickside_component_meta"):where("component_id = ?", id)
                :where("key = ?", "shared"):run_with(d):query()
            d:release()
            test.is_nil(rows_err)
            test.eq(#rows, 1)
            test.eq(rows[1].value, "second")
            test.eq(rows[1].meta_id, first[1].meta_id)
            test.eq(rows[1].created_at, first[1].created_at)
        end)

        test.it("take the component row before its meta rows, so crossing writers never deadlock", function()
            local d0 = db()
            local id = seed(d0, "{}")
            local dialect = tostring(d0:type())
            local tx0 = d0:begin()
            test.eq(set_meta(tx0, id, { a = "0", b = "0" }), "")
            tx0:commit()
            d0:release()

            local d1 = db()
            local tx1 = d1:begin()
            local first = set_meta(tx1, id, { a = "1" })
            if first ~= "" then tx1:rollback(); d1:release(); error("first write failed: " .. first) end

            local done = channel.new(1)
            coroutine.spawn(function()
                local d2 = db()
                local tx2 = d2:begin()
                local err2 = set_meta(tx2, id, { b = "2" })
                if err2 ~= "" then tx2:rollback() else tx2:commit() end
                d2:release()
                done:send(err2)
            end)

            await_lock_waiter(dialect)
            local second = set_meta(tx1, id, { b = "1" })
            if second ~= "" then tx1:rollback() else tx1:commit() end
            d1:release()

            test.eq(second, "")
            test.eq(done:receive(), "")
            local meta = read_meta(id)
            test.eq(meta.a, "1")
            test.eq(meta.b, "2")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
