-- Projection reader coverage: list a thread's projections and cursors, load one
-- projection, and resolve a cursor by id and by natural key. Projections are set
-- up through the writer so the rows match the real shape.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local reader = require("reader")
local writer = require("writer")
local types = require("types")

local WORKER_REF = "func://app:test_count_worker"
local function register_projection(db: sql.DB, thread_id: string, params: table)
    if params.execution_identity_row == nil and params.execution_identity == nil then
        params.system_identity = true
    end
    return writer.register_projection(db, thread_id, params)
end

local function with_db(fn: (sql.DB) -> ())
    local db, err = sql.get("app:db")
    if err or not db then
        error("projection reader test: db connect failed: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

local function make_thread(db): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "test", component_id = id, event_count = 3 })
        :run_with(db):exec()
    if err then
        error("make_thread failed: " .. tostring(err))
    end
    return id
end

local function define_tests()
    test.describe("Projection Reader", function()
        test.it("lists a thread's projections and cursors", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                register_projection(db, thread_id, { kind = "summary", worker_ref = WORKER_REF })
                register_projection(db, thread_id, { kind = "digest", worker_ref = WORKER_REF })

                local projections, perr = reader.list_projections(db, thread_id)
                test.is_nil(perr)
                test.eq(#(projections :: table), 2)

                local cursors, cerr = reader.list_cursors(db, thread_id)
                test.is_nil(cerr)
                test.eq(#(cursors :: table), 2)
                -- The join surfaces the projection addressing on each cursor row.
                test.not_nil((cursors :: table)[1].kind)
                test.not_nil((cursors :: table)[1].projection_key)
            end)
        end)

        test.it("loads one projection by id", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local result = register_projection(db, thread_id, { kind = "summary", worker_ref = WORKER_REF })
                local projection, err = reader.get_projection(db, thread_id, (result :: table).projection_id :: string)
                test.is_nil(err)
                test.eq((projection :: table).kind, "summary")
            end)
        end)

        test.it("returns NOT_FOUND for an unknown projection", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local _, err = reader.get_projection(db, thread_id, uuid.v7())
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.NOT_FOUND)
            end)
        end)

        test.it("finds a cursor by id", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local result = register_projection(db, thread_id, { kind = "summary", worker_ref = WORKER_REF })
                local cursor, err = reader.find_cursor(db, thread_id, { cursor_id = (result :: table).cursor_id :: string })
                test.is_nil(err)
                test.eq((cursor :: table).id, (result :: table).cursor_id)
            end)
        end)

        test.it("finds a cursor by natural key", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local result = register_projection(db, thread_id, { kind = "summary", worker_ref = WORKER_REF })
                local cursor, err = reader.find_cursor(db, thread_id, { kind = "summary" })
                test.is_nil(err)
                test.eq((cursor :: table).id, (result :: table).cursor_id)
            end)
        end)

        test.it("returns NOT_FOUND when the natural key matches nothing", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local _, err = reader.find_cursor(db, thread_id, { kind = "nope" })
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.NOT_FOUND)
            end)
        end)

        test.it("requires a cursor_id or kind", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local _, err = reader.find_cursor(db, thread_id, {})
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.INVALID)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
