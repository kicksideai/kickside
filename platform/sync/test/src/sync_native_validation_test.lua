local test = require("test")
local funcs = require("funcs")
local sync = require("sync_runtime")

local function declaration()
    return {trigger = {source = "app.fixture:records", schedule = {type = "interval", expression = "1h"}, backfill = "all"},
        sink_port = "app.fixture:round_record", transform = {kind = "none"}, enabled = true}
end

local function define_tests()
    test.describe("native sync declaration validation", function()
        for _, case in ipairs({
            {field = "trigger", update = function(i) i.trigger = false end},
            {field = "trigger.source", update = function(i) i.trigger.source = " " end},
            {field = "sink_port", update = function(i) i.sink_port = " " end},
            {field = "transform", update = function(i) i.transform = false end},
            {field = "transform.kind", update = function(i) i.transform.kind = " " end},
            {field = "enabled", update = function(i) i.enabled = "true" end},
            {field = "reconcile", update = function(i) i.reconcile = false end},
        }) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains native metadata for " .. case.field .. " through " .. boundary, function()
                    local input = declaration()
                    case.update(input)
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
        test.it("retains valid normalization, defaults and successful declaration shapes", function()
            local input = declaration()
            input.trigger.source = " app.fixture:records "
            input.sink_port = " app.fixture:round_record "
            local result, err = sync.install(input)
            test.is_nil(err)
            test.eq(result.state.source.port, "app.fixture:records")
            test.eq(result.state.sink.port, "app.fixture:round_record")
            test.eq(result.state.title, "Data Sync")
            test.is_true(result.state.enabled)
            test.is_false(result.state.reconcile)
            test.eq(result.source.source_kind, "collection")
            test.eq(result.source.schedule.expression, "1h")
            test.is_nil(result.source.config.backfill_since)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
