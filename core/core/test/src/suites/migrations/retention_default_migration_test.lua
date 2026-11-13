local test = require("test")
local uuid = require("uuid")
local scratch = require("migration_scratch")
local PREFIX = "kickside.core.migrations:"

local function insert_policy(days: integer?): string
    local id = uuid.v7()
    scratch.exec("INSERT INTO kickside_thread(id,component_id,thread_class) VALUES($1,$2,'retention')", {id,id})
    if days then
        scratch.exec("INSERT INTO kickside_retention_policy(id,thread_id,event_hot_retention_days) VALUES($1,$1,$2)", {id,days})
    else
        scratch.exec("INSERT INTO kickside_retention_policy(id,thread_id) VALUES($1,$1)", {id})
    end
    return id
end

local function window(id: string): integer
    return tonumber(scratch.query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE id=$1", {id})[1].event_hot_retention_days) :: integer
end

local function define_tests()
    test.describe("Core retention default migration", function()
        test.it("updates the insert default and preserves every stored window through repeated updates", function()
            scratch.reset()
            for _, name in ipairs({"00_encoding", "01_thread", "05_retention"}) do scratch.migrate(PREFIX .. name) end
            local inherited, explicit, custom = insert_policy(), insert_policy(90), insert_policy(7)
            test.eq(window(inherited), 90)
            local disabled = scratch.postgres() and "false" or "0"
            scratch.exec("UPDATE kickside_retention_policy SET enabled=" .. disabled .. ",archive_mode='hard_delete' WHERE id=$1", {custom})
            scratch.migrate(PREFIX .. "13_retention_default")
            scratch.migrate(PREFIX .. "13_retention_default")
            test.eq(window(inherited), 90)
            test.eq(window(explicit), 90)
            test.eq(window(custom), 7)
            test.eq(window(insert_policy()), 30)
            local rows = scratch.query("SELECT archive_mode,enabled FROM kickside_retention_policy WHERE id=$1", {custom})
            test.eq(rows[1].archive_mode, "hard_delete")
            test.is_true(rows[1].enabled == false or rows[1].enabled == 0)
            -- The unique index and cascade remain part of the stored policy contract.
            scratch.exec("DELETE FROM kickside_thread WHERE id=$1", {custom})
            test.eq(#scratch.query("SELECT id FROM kickside_retention_policy WHERE id=$1", {custom}), 0)
            scratch.drop()
        end)
    end)
end
return test.run_cases(define_tests)
