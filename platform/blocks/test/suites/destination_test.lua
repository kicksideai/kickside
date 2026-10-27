local test = require("test")
local subject = require("subject")
local fixture = require("fixture")
local consts = require("consts")

local function yield_record(content: any): any
    return {node_id = "wait-node", type = consts.DATA_TYPE.NODE_YIELD, content = content}
end

local function cases()
    test.describe("Blocks persisted destination validation", function()
        local invalid_ids = {{}, {id = ""}, {id = 7}, {id = false}, {id = {}}}
        for index, row in ipairs(invalid_ids) do
            for _, field in ipairs({"key", "discriminator", "yield_id"}) do
                test.it("rejects invalid " .. field .. " case " .. index, function()
                    local value = {yield_id = "yield-1", yield_context = {wait_for_signal = true, signal_id = "review"}}
                    fixture.records = {yield_record(value)}
                    if field == "yield_id" then
                        value.yield_id = row.id
                    else
                        local result = {type = consts.DATA_TYPE.NODE_YIELD_RESULT}
                        result[field] = row.id
                        fixture.records[2] = result
                    end
                    local ok, result, err = pcall(subject.pending, "flow", "review", {status = consts.STATUS.RUNNING})
                    test.is_true(ok, tostring(result))
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                    test.eq(err:details().code, "BLOCK_SIGNAL_STATE_INVALID")
                    test.eq(err:retryable(), false)
                end)
            end
        end

        for _, content in ipairs({'{}', '[]', '42', '"text"', 'null', 'true', '{"yield_id":"","yield_context":{"wait_for_signal":true,"signal_id":"review"}}'}) do
            test.it("rejects structurally invalid yield JSON " .. content, function()
                fixture.records = {yield_record(content)}
                local result, err = subject.pending("flow", "review", {status = consts.STATUS.RUNNING})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.eq(err:details().code, "BLOCK_SIGNAL_STATE_INVALID")
                test.eq(err:retryable(), false)
            end)
        end

        for _, field in ipairs({"key", "discriminator"}) do
            test.it("recognizes a valid result " .. field .. " as closed", function()
                local result = {type = consts.DATA_TYPE.NODE_YIELD_RESULT}
                result[field] = "yield-1"
                fixture.records = {yield_record('{"yield_id":"yield-1","yield_context":{"wait_for_signal":true,"signal_id":"review"}}'), result}
                local node, err = subject.pending("flow", "review", {status = consts.STATUS.RUNNING})
                test.is_nil(node)
                test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
                test.eq(err:details().code, "BLOCK_SIGNAL_NOT_FOUND")
            end)
        end
    end)
end

return {run = test.run_cases(cases)}
