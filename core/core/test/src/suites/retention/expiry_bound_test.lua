-- Core retained evidence is bounded by age expiry alone: a thread that holds
-- more events, event bytes or retention pins than any former per-thread count
-- keeps accepting appends and pins, and the age sweep prunes the expired
-- prefix below the pin floor. Only one oversized row is refused.

local test = require("test")
local sql = require("sql")
local pin = require("pin")
local prune = require("prune")
local append = require("append")
local prune_scaffold = require("prune_scaffold")

local open_db = prune_scaffold.open_db
local query = prune_scaffold.query
local ts = prune_scaffold.ts
local make_thread = prune_scaffold.make_thread
local add_events = prune_scaffold.add_events
local add_bulk_events = prune_scaffold.add_bulk_events
local range = prune_scaffold.range
local seqs_of = prune_scaffold.seqs_of
local boundary_of = prune_scaffold.boundary_of

local FORMER_EVENT_ROWS = 100000
local FORMER_EVENT_BYTES = 67108864
local FORMER_PIN_CONSUMERS = 4096
local MAX_ROW_BYTES = 4194304

local function append_in_tx(thread_id: string, events: { table }): (any?, error?)
    local db = open_db()
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); error("append begin failed: " .. tostring(begin_err)) end
    local result, err = append.append_events_tx(tx, thread_id, events)
    if err then
        tx:rollback()
        db:release()
        return nil, err
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then error("append commit failed: " .. tostring(commit_err)) end
    return result, nil
end

local function prune_all(thread_id: string): integer
    local total = 0
    while true do
        local db = open_db()
        local result, err = prune.prune_thread(db, thread_id, { cutoff = ts(-1), max_total = prune.BATCH_SIZE })
        db:release()
        if err then error("prune failed: " .. tostring(err)) end
        if (result :: any).deleted == 0 then return total end
        total = total + (result :: any).deleted
    end
end

local function count_events(thread_id: string): integer
    local rows = query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1", { thread_id })
    return math.floor(tonumber(rows[1].n) :: number)
end

local function body_of(bytes: integer): string
    return '{"p":"' .. string.rep("x", bytes - 8) .. '"}'
end

local function define_tests()
    test.describe("Core retention bounded by age expiry", function()
        test.it("appends past the former per-thread event count and prunes the expired prefix", function()
            local thread_id = make_thread()
            add_bulk_events(thread_id, FORMER_EVENT_ROWS)
            local events: { table } = {}
            for index = 1, 20 do
                events[index] = { type = "test:fresh", body_json = '{"n":' .. tostring(index) .. '}' }
            end
            local result, err = append_in_tx(thread_id, events)
            test.is_nil(err)
            test.eq(result.inserted, 20)
            test.eq(result.max_seq, FORMER_EVENT_ROWS + 20)
            test.eq(count_events(thread_id), FORMER_EVENT_ROWS + 20)

            test.eq(prune_all(thread_id), FORMER_EVENT_ROWS)
            test.eq(boundary_of(thread_id), FORMER_EVENT_ROWS)
            local left = seqs_of(thread_id)
            test.eq(#left, 20)
            test.eq(left[1], FORMER_EVENT_ROWS + 1)
        end)

        test.it("appends past the former per-thread event bytes and prunes them once expired", function()
            local thread_id = make_thread()
            local events: { table } = {}
            local total = 0
            local body = body_of(4000000)
            local aged = ts(-10)
            while total <= FORMER_EVENT_BYTES do
                events[#events + 1] = { type = "test:large", body_json = body, created_at = aged }
                total = total + #body
            end
            local result, err = append_in_tx(thread_id, events)
            test.is_nil(err)
            test.eq(result.inserted, #events)
            test.eq(count_events(thread_id), #events)

            test.eq(prune_all(thread_id), #events)
            test.eq(count_events(thread_id), 0)
            test.eq(boundary_of(thread_id), #events)
        end)

        test.it("refuses one event row above the row byte limit and keeps the thread writable", function()
            local thread_id = make_thread()
            local refused, refuse_err = append_in_tx(thread_id,
                { { type = "test:oversized", body_json = body_of(MAX_ROW_BYTES + 1) } })
            test.is_nil(refused)
            test.not_nil(refuse_err)
            test.eq(refuse_err:kind(), errors.INVALID)
            local details = refuse_err:details()
            test.eq(details.reason, "row_too_large")
            test.eq(details.cap, MAX_ROW_BYTES)
            test.is_nil(details.status)
            test.eq(count_events(thread_id), 0)

            local accepted, accept_err = append_in_tx(thread_id, { { type = "test:small", body_json = "{}" } })
            test.is_nil(accept_err)
            test.eq(accepted.inserted, 1)
        end)

        test.it("installs pins past the former per-thread consumer count and prunes only below the pin floor", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 10), 10)
            local db = open_db()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            for index = 1, FORMER_PIN_CONSUMERS + 1 do
                local receipt, lower_err = pin.lower_tx(tx, { thread_id = thread_id,
                    consumer_key = "consumer:" .. tostring(index), command_id = "cmd-" .. tostring(index),
                    command_generation = 1, target_cursor = 4 })
                if lower_err then
                    tx:rollback()
                    db:release()
                    error("pin " .. tostring(index) .. " refused: " .. tostring(lower_err))
                end
                test.not_nil(receipt)
            end
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err)
            local pins = query("SELECT COUNT(*) AS n FROM kickside_retention_pin WHERE thread_id=$1", { thread_id })
            test.eq(math.floor(tonumber(pins[1].n) :: number), FORMER_PIN_CONSUMERS + 1)

            test.eq(prune_all(thread_id), 4)
            test.eq(boundary_of(thread_id), 4)
            test.eq(seqs_of(thread_id)[1], 5)
        end)

        test.it("keeps the thread row free of retained usage state", function()
            local db = open_db()
            local dbtype = tostring(db:type())
            local rows: any
            if dbtype == sql.type.POSTGRES then
                rows = db:query([[SELECT column_name AS name FROM information_schema.columns
                    WHERE table_name='kickside_thread' AND table_schema=current_schema()]])
            else
                rows = db:query("SELECT name FROM pragma_table_info('kickside_thread')")
            end
            db:release()
            for _, row in ipairs(rows or {}) do
                local name = tostring(row.name)
                test.is_nil((name:find("retained_", 1, true)), name)
                test.is_nil((name:find("blocked_since", 1, true)), name)
            end
        end)
    end)
end

return test.run_cases(define_tests)
