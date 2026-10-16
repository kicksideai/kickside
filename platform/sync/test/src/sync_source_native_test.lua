local test = require("test")
local funcs = require("funcs")
local sync = require("sync_runtime")

local function declaration()
    return {trigger = {source = "app.fixture:records", schedule = {type = "interval", expression = "1h"}, backfill = "all"},
        sink_port = "app.fixture:round_record", transform = {kind = "none"}, enabled = true}
end

local function define_tests()
    test.describe("native sync source declarations", function()
        local cases = {
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = nil end},
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = false end},
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = "invalid" end},
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = {} end},
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = {last_days = 0} end},
            {field = "trigger.backfill", update = function(i) i.trigger.backfill = {last_days = 1.5} end},
            {field = "trigger.schedule", update = function(i) i.trigger.schedule = nil end},
            {field = "trigger.schedule", update = function(i) i.trigger.schedule = false end},
            {field = "trigger.schedule", update = function(i) i.trigger.source = "app.fixture:personal_record_arrived" end},
            {field = "trigger.backfill", update = function(i)
                i.trigger.source = "app.fixture:personal_record_arrived"; i.trigger.schedule = nil; i.trigger.backfill = nil
            end},
            {field = "trigger.backfill", update = function(i)
                i.trigger.source = "app.fixture:personal_record_arrived"; i.trigger.schedule = nil; i.trigger.backfill = {last_days = 2}
            end},
            {field = "trigger.config.thread_id", update = function(i)
                i.trigger.source = "app.fixture:selected_schema_record"; i.trigger.schedule = nil
            end},
        }
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains source validation " .. index .. " through " .. boundary, function()
                    local input = declaration(); case.update(input)
                    local result, err
                    if boundary == "library" then result, err = sync.install(input)
                    else result, err = funcs.call("kickside.sync:sync_install", input) end
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().error_kind, "declaration")
                    test.eq(err:details().code, "sync_declaration_invalid")
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        for _, backfill in ipairs({"all", "none", {since = "2026-01-02T03:04:05Z"}, {last_days = 2}}) do
            test.it("retains accepted collection backfill " .. tostring(backfill), function()
                local input = declaration(); input.trigger.backfill = backfill
                local result, err = sync.install(input)
                test.is_nil(err)
                test.eq(result.source.source_kind, "collection")
                if backfill == "all" then test.is_nil(result.source.config.backfill_since)
                elseif type(backfill) == "table" and backfill.since then test.eq(result.source.config.backfill_since, backfill.since)
                else test.eq(type(result.source.config.backfill_since), "string") end
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
