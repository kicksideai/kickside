-- Tests the runtime skill-activation surface: the Skill tool's activate/
-- deactivate actions (which return control directives the session persists into
-- active_skills) and the active_skills prompt func (which reads that set back and
-- injects the bodies). We drive both exactly as the runtime does: through a
-- framed funcs executor whose context carries the session's active_skills, so the
-- tool's ctx.get and the prompt func see the same state the session would supply.

local test = require("test")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local test_identity = require("test_identity")

local TOOL = "kickside.skills.traits:skill_tool"
local PROMPT_FUNC = "kickside.skills.traits:active_skills"

local function executor(user_id: string, context: any?): any
    local exec = test_identity.executor(user_id, context)
    return exec
end

local function call_with_malformed_projection(skill_id: string, call)
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err, tostring(db_err))
    test.not_nil(db)
    local rows, read_err = db:query(
        "SELECT body FROM kickside_projection WHERE thread_id=$1 AND kind=$2 AND projection_key=$3",
        {skill_id, "kickside.skills:history", "default"})
    test.is_nil(read_err, tostring(read_err))
    test.eq(#rows, 1)
    local _, corrupt_err = db:execute(
        "UPDATE kickside_projection SET body=$1 WHERE thread_id=$2 AND kind=$3 AND projection_key=$4",
        {"{}", skill_id, "kickside.skills:history", "default"})
    test.is_nil(corrupt_err, tostring(corrupt_err))
    db:release()

    local out, err = call()

    db, db_err = sql.get("app:db")
    test.is_nil(db_err, tostring(db_err))
    test.not_nil(db)
    local _, restore_err = db:execute(
        "UPDATE kickside_projection SET body=$1 WHERE thread_id=$2 AND kind=$3 AND projection_key=$4",
        {rows[1].body, skill_id, "kickside.skills:history", "default"})
    db:release()
    test.is_nil(restore_err, tostring(restore_err))
    return out, err
end

local function define_tests()
    test.describe("kickside.skills active skills (activate/deactivate + prompt func)", function()
        local user = "activeskills_test_user"
        local exec: any
        local skill_id: string = ""

        test.before_all(function()
            exec = executor(user)
            local out = exec:call(TOOL, {
                action = "save",
                name = "activeskills_" .. uuid_v4():sub(1, 8),
                description = "A skill to activate.",
                body = "1. Step one.\n2. Step two ACTIVEBODYMARK.",
            })
            skill_id = out.skill_id or ""
            test.is_true(skill_id ~= "", "save returns no skill_id")
        end)

        test.after_all(function()
            if skill_id ~= "" then
                pcall(function() exec:call(TOOL, { action = "delete", skill_id = skill_id }) end)
            end
        end)

        test.it("activate requires a skill_id", function()
            local out, err = exec:call(TOOL, { action = "activate" })
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "skill_id is required")
        end)

        -- A saved skill is readable as soon as save returns: an agent saves
        -- and activates in consecutive calls.
        test.it("activate adds the skill to the active set via a control directive", function()
            local out: any = exec:call(TOOL, { action = "activate", skill_id = skill_id })
            test.is_true(type(out) == "table", "activate should return a table, got: " .. tostring(out))
            test.is_true(string.find(tostring(out.message), "Activated", 1, true) ~= nil)
            local set = out._control and out._control.context and out._control.context.session
                and out._control.context.session.set
            test.not_nil(set, "activate must return a session context set directive")
            local active = set.active_skills
            test.is_true(type(active) == "table" and active[1] == skill_id,
                "active_skills must contain the activated id")
        end)

        test.it("activate is idempotent when the skill is already active", function()
            local exec2: any = executor(user, { active_skills = { skill_id } })
            local out: any = exec2:call(TOOL, { action = "activate", skill_id = skill_id })
            test.is_true(type(out) == "table")
            test.is_true(string.find(tostring(out.message), "already active", 1, true) ~= nil)
            test.is_true(out._control == nil, "no-op activate must not emit a control directive")
        end)

        test.it("activate rejects a skill the actor cannot read", function()
            local stranger: any = executor("activeskills_other_user")
            local out, err = stranger:call(TOOL, { action = "activate", skill_id = skill_id })
            test.is_nil(out)
            test.not_nil(err, "activating an inaccessible skill must error")
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)

        test.it("deactivate removes the skill from the active set", function()
            local exec2: any = executor(user, { active_skills = { skill_id } })
            local out: any = exec2:call(TOOL, { action = "deactivate", skill_id = skill_id })
            test.is_true(type(out) == "table")
            test.is_true(string.find(tostring(out.message), "Deactivated", 1, true) ~= nil)
            local active = out._control.context.session.set.active_skills
            test.is_true(type(active) == "table" and #active == 0,
                "active_skills must no longer contain the id")
        end)

        test.it("deactivate is a no-op when the skill is not active", function()
            local out: any = executor(user):call(TOOL, { action = "deactivate", skill_id = skill_id })
            test.is_true(type(out) == "table")
            test.is_true(string.find(tostring(out.message), "not active", 1, true) ~= nil)
            test.is_true(out._control == nil)
        end)

        test.it("prompt func injects the active skill's body into the prompt", function()
            local exec2: any = executor(user, { active_skills = { skill_id } })
            local out = tostring(exec2:call(PROMPT_FUNC))
            test.is_true(string.find(out, "## Active skills", 1, true) ~= nil, "missing header: " .. out)
            test.is_true(string.find(out, "ACTIVEBODYMARK", 1, true) ~= nil, "missing body: " .. out)
        end)

        test.it("propagates an unavailable active skill read", function()
            local out, err = call_with_malformed_projection(skill_id, function()
                return executor(user, {active_skills = {skill_id}}):call(PROMPT_FUNC)
            end)
            test.is_nil(out)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
        end)

        test.it("prompt func returns empty when nothing is active", function()
            local out = tostring(executor(user):call(PROMPT_FUNC))
            test.is_true(out == "", "expected empty prompt, got: " .. out)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
