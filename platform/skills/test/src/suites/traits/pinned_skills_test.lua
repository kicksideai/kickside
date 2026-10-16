-- Tests for pinning skills into an agent: the init_skills build func (mode "one
-- or two baked-in skills") and the skills trait wiring into a compiled agent.
--
-- init_skills is driven via funcs:call with a test actor + scope — the same
-- actor-inheriting executor path the agent compiler uses to invoke build funcs,
-- so this faithfully covers both the chat and dataflow run models.

local test = require("test")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local time = require("time")
local sql = require("sql")
local compiler = require("compiler")
local test_identity = require("test_identity")

local NS = "kickside.skills"             -- store funcs (skill_create/get/list/delete)
local TRAITS = "kickside.skills.traits"  -- agent surface (init_skills build func)

local function new_executor(user_id: string): any
    local exec = test_identity.executor(user_id)
    return exec
end

local function wait_for_skill(exec: any, skill_id: string)
    local skill: any
    local err: any
    for attempt = 1, 100 do
        skill, err = exec:call(NS .. ":skill_get", { skill_id = skill_id })
        if skill then return end
        if attempt < 100 then time.sleep("10ms") end
    end
    test.not_nil(skill, "skill projection did not become visible: " .. tostring(err))
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
    test.describe("kickside.skills pinning", function()
        local exec: any
        local exec2: any
        local prefix = "pin_" .. uuid_v4():sub(1, 8) .. "_"
        local id_a: string?
        local id_b: string?

        test.before_all(function()
            exec = new_executor("pin_test_user")
            exec2 = new_executor("pin_test_user2")
            id_a = exec:call(NS .. ":skill_create", {
                name = prefix .. "alpha",
                description = "Alpha procedure.",
                body = "ALPHA-BODY: step one, step two.",
            })
            id_b = exec:call(NS .. ":skill_create", {
                name = prefix .. "beta",
                description = "Beta procedure.",
                body = "BETA-BODY: do the beta thing.",
            })
            if not id_a or not id_b then error("skill fixtures did not return both IDs") end
            wait_for_skill(exec, id_a)
            wait_for_skill(exec, id_b)
        end)

        test.after_all(function()
            if id_a then pcall(function() exec:call(NS .. ":skill_delete", { skill_id = id_a }) end) end
            if id_b then pcall(function() exec:call(NS .. ":skill_delete", { skill_id = id_b }) end) end
        end)

        test.describe("init_skills build func", function()
            test.it("returns no contribution when nothing is pinned", function()
                local out, err = exec:call(TRAITS .. ":init_skills", "", {})
                test.is_nil(err, tostring(err))
                test.is_nil(out.prompt, "no skill_ids must yield an empty contribution")
            end)

            test.it("folds a single pinned skill's body into the prompt", function()
                local out, err = exec:call(TRAITS .. ":init_skills", "", { skill_ids = { id_a } })
                test.is_nil(err, tostring(err))
                test.not_nil(out.prompt)
                test.is_true(string.find(out.prompt, "ALPHA-BODY", 1, true) ~= nil, "body must be injected")
                test.is_true(string.find(out.prompt, "Pinned skills", 1, true) ~= nil, "header present")
                test.is_true(string.find(out.prompt, prefix .. "alpha", 1, true) ~= nil, "skill name present")
            end)

            test.it("folds two pinned skills", function()
                local out, err = exec:call(TRAITS .. ":init_skills", "", { skill_ids = { id_a, id_b } })
                test.is_nil(err, tostring(err))
                test.is_true(string.find(out.prompt, "ALPHA-BODY", 1, true) ~= nil)
                test.is_true(string.find(out.prompt, "BETA-BODY", 1, true) ~= nil)
            end)

            test.it("accepts a comma-separated id string", function()
                local out, err = exec:call(TRAITS .. ":init_skills", "", { skill_ids = id_a .. "," .. id_b })
                test.is_nil(err, tostring(err))
                test.is_true(string.find(out.prompt, "ALPHA-BODY", 1, true) ~= nil)
                test.is_true(string.find(out.prompt, "BETA-BODY", 1, true) ~= nil)
            end)

            test.it("skips a pinned skill the actor cannot read (access respected)", function()
                -- user2 does not own id_a; the build func must skip it, not fail.
                local out, err = exec2:call(TRAITS .. ":init_skills", "", { skill_ids = { id_a } })
                test.is_nil(err, tostring(err))
                test.is_nil(out.prompt, "unreadable skill yields no pinned section")
            end)

            test.it("propagates an unavailable pinned skill read", function()
                local out, err = call_with_malformed_projection(id_a :: string, function()
                    return exec:call(TRAITS .. ":init_skills", "", {skill_ids = {id_a}})
                end)
                test.is_nil(out)
                test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            end)
        end)

        test.describe("skills trait compiles into an agent", function()
            test.it("contributes the Skill tool + prompt to a compiled agent", function()
                local raw_spec = {
                    id = "skilltest:agent",
                    prompt = "BASE-AGENT-PROMPT",
                    traits = { "kickside.skills.traits:skills" },
                }
                local compiled, err = compiler.compile(raw_spec)
                test.is_nil(err, tostring(err))
                test.not_nil(compiled)
                test.is_true(string.find(compiled.prompt, "BASE-AGENT-PROMPT", 1, true) ~= nil)
                test.is_true(string.find(compiled.prompt, "discover, load, activate, author", 1, true) ~= nil, "trait prompt merged in")

                local tool_count = 0
                for _ in pairs(compiled.tools or {}) do tool_count = tool_count + 1 end
                test.is_true(tool_count >= 1, "the Skill tool must be present on the compiled agent")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
