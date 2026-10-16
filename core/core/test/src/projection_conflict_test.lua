local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local writer = require("writer")
local collision_writer = require("collision_writer")
local fixture = require("fixture")
local M = {}

local function thread(db: sql.DB): string
    local id = uuid.v7()
    local _, err = db:execute(
        "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)", {id, id})
    if err then error(err) end
    return id
end

local function read(db: sql.DB, id: string): any
    local rows, err = db:query("SELECT body,created_at,updated_at,actor_id,state,last_event_seq FROM kickside_projection WHERE id=$1", {id})
    if err then error(err) end
    if not rows or not rows[1] then error("winning projection is missing") end
    return rows[1]
end

local function define_tests()
    test.describe("projection unique conflict native metadata", function()
        test.it("classifies a real projection identity collision without changing the winner", function()
            local db, open_err = sql.get("app:db")
            if open_err or not db then error(open_err) end
            local first_thread = thread(db)
            local options = {kind = "winner", worker_ref = "func://app:test_count_worker", system_identity = true}
            local winner, seed_err = writer.register_projection(db, first_thread, options)
            test.is_nil(seed_err)
            if not winner then error("winning projection registration is missing") end
            local before = read(db, winner.projection_id)
            fixture.set_id(winner.projection_id)
            local losing_thread = thread(db)
            local result, err = collision_writer.register_projection(db, losing_thread,
                {kind = "contender", worker_ref = "func://app:test_count_worker", system_identity = true})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "projection_already_exists")
            local after = read(db, winner.projection_id)
            for key, value in pairs(before) do test.eq(after[key], value) end
            local loser, read_err = db:query("SELECT id FROM kickside_projection WHERE thread_id=$1", {losing_thread})
            local cursors, cursor_err = db:query("SELECT id,job_id,generation FROM kickside_projection_cursor WHERE projection_id=$1", {winner.projection_id})
            local _, release_err = db:release()
            test.is_nil(read_err)
            test.is_nil(cursor_err)
            test.is_nil(release_err)
            test.eq(#loser, 0)
            test.eq(#cursors, 1)
            test.eq(cursors[1].id, winner.cursor_id)
            test.eq(cursors[1].job_id, winner.job_id)
            test.eq(tonumber(cursors[1].generation), winner.generation)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
function M.run(options: any): any return run_cases(options) end

return M
