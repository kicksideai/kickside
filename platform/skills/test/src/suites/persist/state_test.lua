local test = require("test")
local uuid_v4 = require("uuid").v4
local test_identity = require("test_identity")
local state = require("skill_state")
local sql = require("sql")

local NS = "kickside.skills"
local STATE_READ_PROBE = "app:state_read_probe"

local function read(args: any): (any?, string?)
    return state.body_for(tostring((args or {}).skill_id or ""))
end

local function define_tests()
    test.describe("Skills State Read Model", function()
        test.it("bounds an omitted list limit and preserves the explicit maximum", function()
            local exec = test_identity.executor("skill-list-page-" .. uuid_v4())
            local ids = {}
            for index = 1, 30 do
                local id, err = exec:call(NS .. ":skill_create", {
                    name = "Skill " .. tostring(index), description = "List bounds", body = "procedure",
                })
                test.is_nil(err)
                ids[#ids + 1] = id
            end
            local defaults, default_err = exec:call(NS .. ":skill_list", {})
            test.is_nil(default_err)
            test.eq(#defaults, 25)
            local maximum, max_err = exec:call(NS .. ":skill_list", {limit = 1000})
            test.is_nil(max_err)
            test.eq(#maximum, 30)
            local searched, search_err = exec:call(NS .. ":skill_list", {q = "Skill"})
            test.is_nil(search_err)
            test.eq(#searched, 20)
            for _, id in ipairs(ids) do
                local _, err = exec:call(NS .. ":skill_delete", {skill_id = id})
                test.is_nil(err)
            end
        end)

        test.it("reads the committed body as soon as create returns, without opening history or cursor state", function()
            local exec = test_identity.executor("state_checkpoint_user")
            local skill_id = exec:call(NS .. ":skill_create", {
                name = "state_checkpoint_" .. uuid_v4():sub(1, 8),
                description = "Checkpoint propagation test.",
                body = "CHECKPOINT_BODY",
            })
            test.not_nil(skill_id)

            local body, read_err = exec:call(STATE_READ_PROBE, { skill_id = skill_id })
            test.is_nil(read_err)
            test.eq(body.current_version, 1)

            exec:call(NS .. ":skill_delete", { skill_id = skill_id })
        end)

        test.it("reports a missing required projection as an error", function()
            local exec = test_identity.executor("state_missing_projection_" .. uuid_v4():sub(1, 8))
            local skill_id = exec:call(NS .. ":skill_create", {
                name = "state_missing_projection_" .. uuid_v4():sub(1, 8),
                description = "Projection integrity test.", body = "CHECKPOINT_BODY",
            })
            test.not_nil(skill_id)

            local db, db_err = sql.get("app:db")
            test.is_nil(db_err, tostring(db_err))
            test.not_nil(db)
            local _, delete_err = db:execute("DELETE FROM kickside_projection WHERE thread_id=$1", { skill_id })
            db:release()
            test.is_nil(delete_err, tostring(delete_err))

            local body, read_err = exec:call(STATE_READ_PROBE, { skill_id = skill_id })
            test.is_nil(body)
            test.not_nil(read_err)

            local _, cleanup_err = exec:call(NS .. ":skill_delete", { skill_id = skill_id })
            test.is_nil(cleanup_err, tostring(cleanup_err))
        end)

        test.it("returns nil when the skill id precondition fails", function()
            local body, read_err = state.read_body("")
            test.is_nil(body)
            test.not_nil(read_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run, read = read }
