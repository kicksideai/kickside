-- Synchronous coverage of the IDOR gate's thread-lookup branches that resolve
-- before the actor access check, so they run without spawning an actor context:
-- an empty id and an unknown id are both not-found (404), and a thread with no
-- component_id is not-found (404). The owner-allowed / non-member-denied (403)
-- decision needs a real actor and is covered in thread_access_test. Runs on
-- SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local gate = require("thread_access")

local DB = "app:db"

local function with_db(fn: (sql.DB) -> ())
    local db, err = sql.get(DB)
    if err or not db then error("db connect failed: " .. tostring(err)) end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then error(run_err) end
end

local function now_string(db: sql.DB): string
    if tostring(db:type()) == sql.type.SQLITE then
        return time.now():format(time.DATE_TIME)
    end
    return time.now():format(time.RFC3339)
end

local function define_tests()
    test.describe("Thread Access Gate Lookup", function()
        test.it("an empty thread id is not-found with 404", function()
            with_db(function(db)
                local allowed, status = gate.gate_thread_access(db, "", gate.WRITE)
                test.is_false(allowed)
                test.eq(status, 404)
            end)
        end)

        test.it("an unknown thread id is not-found with 404", function()
            with_db(function(db)
                local allowed, status = gate.gate_thread_access(db, "missing-" .. uuid.v4(), gate.READ)
                test.is_false(allowed)
                test.eq(status, 404)
            end)
        end)

        test.it("a thread with no component is not-found with 404", function()
            with_db(function(db)
                local thread_id = uuid.v7()
                local _, err = sql.builder.insert("kickside_thread")
                    :set_map({
                        id = thread_id,
                        thread_class = "tag_lookup",
                        component_id = "",
                        event_count = 0,
                        last_event_ts = now_string(db),
                    })
                    :run_with(db):exec()
                if err then error("insert failed: " .. tostring(err)) end

                local allowed, status = gate.gate_thread_access(db, thread_id, gate.WRITE)
                test.is_false(allowed)
                test.eq(status, 404)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
