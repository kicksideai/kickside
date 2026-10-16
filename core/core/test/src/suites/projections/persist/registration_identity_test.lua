local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local writer = require("writer")
local M = {}

local function define_tests()
    test.describe("projection registration identity errors", function()
        test.it("retains native validation metadata without creating durable projection state", function()
            for _, identity_params in ipairs({
                {execution_identity = {version = 1}},
                {execution_identity = {version = 2}},
                {execution_identity_row = {actor_id = "", actor_context = "{}"}},
                {execution_identity_row = {actor_id = "projection-owner", actor_context = "false"}},
                {execution_identity_row = {actor_id = "projection-owner", actor_context = "{invalid"}},
            }) do
                local db, open_err = sql.get("app:db")
                if open_err or not db then error(open_err) end
                local thread_id = uuid.v7()
                local _, seed_err = db:execute(
                    "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                    {thread_id, thread_id})
                test.is_nil(seed_err)
                local params: any = {kind = "native-identity-validation", worker_ref = "func://app:test_count_worker"}
                for key, value in pairs(identity_params) do params[key] = value end
                local result, err = writer.register_projection(db, thread_id, params)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "declaration")
                test.eq(err:details().error_kind, "declaration")
                local rows, read_err = db:query("SELECT id FROM kickside_projection WHERE thread_id=$1", {thread_id})
                local cursors, cursor_err = db:query("SELECT id FROM kickside_projection_cursor WHERE thread_id=$1", {thread_id})
                local _, release_err = db:release()
                test.is_nil(read_err)
                test.is_nil(cursor_err)
                test.is_nil(release_err)
                test.eq(#rows, 0)
                test.eq(#cursors, 0)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
function M.run(options: any): any return run_cases(options) end

return M
