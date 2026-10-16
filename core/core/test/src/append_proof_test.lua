local test = require("test")
local fixture = require("fixture")
local api = require("api")
local function call(defer: boolean?): (any, error?)
    return api.append_events_tx(fixture.transaction(), "thread", {{id = "guard-event", seq = 1, subject = "guard", external = {external_source = "guard", external_id = "guard-external"}}}, {defer_wake = defer == true})
end
return {run = test.run_cases(function()
    test.describe("native append mandatory SQL and wake proof", function()
        local stages = {"missing_dialect", "invalid_dialect", "empty_dialect", "multiple_thread", "missing_policy", "invalid_policy", "missing_wake", "invalid_wake", "missing_generation", "invalid_generation"}
        for _, query in ipairs({"thread", "ids", "external", "sequences"}) do
            for _, form in ipairs({"missing_", "invalid_", "invalid_row_", "sparse_"}) do stages[#stages + 1] = form .. query end
        end
        for _, write in ipairs({"insert", "subject_write", "head"}) do
            for _, form in ipairs({"missing_", "invalid_", "missing_count_", "negative_count_", "large_count_", "fractional_count_"}) do stages[#stages + 1] = form .. write end
        end
        for _, write in ipairs({"insert", "subject_write"}) do stages[#stages + 1] = "zero_count_" .. write end
        for _, stage in ipairs(stages) do
            test.it(stage .. "/required proof", function()
                fixture.reset(stage, nil); local value, err = call(false)
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        test.it("healthy event insertion and wake generation retain their shape", function()
            fixture.reset("", nil); local value, err = call(false)
            test.is_nil(err); test.eq(value.inserted, 1); test.eq(value.max_seq, 1); test.eq(value.wake_generation, 1); test.eq(value.events[1].subject_version, 1)
        end)
        test.it("caller-owned deferred wake keeps its optional generation absent", function()
            fixture.reset("", nil); local value, err = call(true)
            test.is_nil(err); test.eq(value.inserted, 1); test.is_nil(value.wake_generation)
        end)
        test.it("unchanged thread head can affect zero rows", function()
            fixture.reset("zero_count_head", nil); local value, err = call(false)
            test.is_nil(err); test.eq(value.inserted, 1); test.eq(value.wake_generation, 1)
        end)
        test.it("genuine absent thread remains permanent NotFound", function()
            fixture.reset("empty_thread", nil); local value, err = call(false)
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.NOT_FOUND); test.is_false(err:retryable())
            test.eq(fixture.inserts, 0); test.eq(fixture.executes, 0)
        end)
    end)
end)}
