local test = require("test")
local fixture = require("fixture")
local api = require("api")
local function answer(): table return {thread_id = "thread", inserted = 1, duplicates = 0, max_seq = 1, events = {}} end
return {run = test.run_cases(function()
    test.describe("native append contract response proof", function()
        local responses = {{name = "missing"}, {name = "scalar", value = true}, {name = "empty", value = {}},
            {name = "scalar_row", value = {true}}, {name = "sparse", value = {[2] = answer()}},
            {name = "keyed", value = {named = answer()}}, {name = "extra", value = {answer(), answer()}}}
        for _, field in ipairs({"thread_id", "inserted", "duplicates", "max_seq", "events"}) do
            local row = answer(); row[field] = nil
            responses[#responses + 1] = {name = "missing_" .. field, value = {row}}
        end
        for _, value in ipairs({false, "", 1}) do
            local row = answer(); row.thread_id = value
            responses[#responses + 1] = {name = "thread_id/" .. tostring(value), value = {row}}
        end
        for _, field in ipairs({"inserted", "duplicates", "max_seq"}) do
            for _, value in ipairs({false, -1, 0.5, math.huge, 0 / 0, "opaque"}) do
                local row = answer(); row[field] = value
                responses[#responses + 1] = {name = field .. "/" .. tostring(value), value = {row}}
            end
        end
        for _, value in ipairs({true, {[2] = {}}, {named = {}}}) do
            local row = answer(); row.events = value
            responses[#responses + 1] = {name = "event_rows/" .. tostring(value), value = {row}}
        end
        for _, response in ipairs(responses) do
            test.it(response.name, function()
                fixture.reset("", nil, nil); fixture.reply = response
                local value, err = api.append_events(fixture.args())
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().code, "thread_append_response"); test.not_nil(err:details().field)
                test.eq(fixture.appends, 1); test.eq(fixture.releases, 1); test.eq(fixture.emits, 0)
            end)
        end
        for _, multi in ipairs({false, true}) do
            test.it("duplicate-only zero sequence remains valid/" .. tostring(multi), function()
                fixture.reset("", nil, nil)
                local row = answer(); row.inserted = 0; row.duplicates = 1; row.max_seq = 0; fixture.reply = {value = {row}}
                local args = fixture.args(); local value, err = api.append_events(multi and {writes = {args}} or args)
                test.is_nil(err); local result = multi and value.writes[1] or value
                test.eq(result.inserted, 0); test.eq(result.duplicates, 1); test.eq(result.max_seq, 0); test.eq(result.thread_id, "thread")
                test.eq(fixture.releases, 1); test.eq(fixture.emits, 0)
            end)
        end
        test.it("dense multi reply preserves writer order and result fields", function()
            fixture.reset("", nil, nil); local second = answer(); second.thread_id = "second"; fixture.reply = {value = {answer(), second}}
            local args = fixture.args(); local other = fixture.args(); other.thread_id = "second"
            local value, err = api.append_events({writes = {args, other}})
            test.is_nil(err); test.eq(#value.writes, 2); test.eq(value.writes[1].thread_id, "thread"); test.eq(value.writes[2].thread_id, "second")
            test.eq(fixture.releases, 1); test.eq(fixture.emits, 2)
        end)
    end)
end)}
