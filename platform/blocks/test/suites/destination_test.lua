local test = require("test")
local json = require("json")
local subject = require("subject")
local fixture = require("fixture")
local consts = require("consts")

local function yield_record(content: any): any
    return {node_id = "wait-node", type = consts.DATA_TYPE.NODE_YIELD, content = content}
end

local function cases()
    test.describe("Blocks persisted destination validation", function()
        local invalid_waits = {
            {field = "yield_context", values = {{}, {value = "broken"}, {value = 7}, {value = false}, {value = true}}},
            {field = "signal_id", values = {{}, {value = ""}, {value = 7}, {value = false}, {value = true}, {value = {}}}},
            {field = "wait_for_signal", values = {{}, {value = false}, {value = ""}, {value = "true"}, {value = 1}, {value = {}}}},
        }
        for _, field in ipairs(invalid_waits) do
            for index, row in ipairs(field.values) do
                for _, encoding in ipairs({"table", "JSON"}) do
                    test.it("rejects invalid " .. field.field .. " case " .. index .. " as " .. encoding, function()
                        local value = {yield_id = "yield-1", yield_context = {wait_for_signal = true, signal_id = "review"}}
                        if field.field == "yield_context" then
                            value.yield_context = row.value
                        else
                            value.yield_context[field.field] = row.value
                        end
                        fixture.records = {yield_record(encoding == "JSON" and json.encode(value) or value)}
                        local ok, result, err = pcall(subject.pending, "flow", "review", {status = consts.STATUS.RUNNING})
                        test.is_true(ok, tostring(result))
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                        test.eq(err:details().code, "BLOCK_SIGNAL_STATE_INVALID")
                        test.eq(err:retryable(), false)
                    end)
                end
            end
        end

        for _, encoding in ipairs({"table", "JSON"}) do
            test.it("accepts a valid wait and distinguishes another signal as " .. encoding, function()
                local value = {yield_id = "yield-1", yield_context = {wait_for_signal = true, signal_id = "review"}}
                fixture.records = {yield_record(encoding == "JSON" and json.encode(value) or value)}
                local node, err = subject.pending("flow", "review", {status = consts.STATUS.RUNNING})
                test.is_nil(err)
                test.eq(node.node_id, "wait-node")
                local absent, absent_err = subject.pending("flow", "other", {status = consts.STATUS.RUNNING})
                test.is_nil(absent)
                test.is_true(errors.is(absent_err, errors.NOT_FOUND), tostring(absent_err))
                test.eq(absent_err:details().code, "BLOCK_SIGNAL_NOT_FOUND")
            end)
        end

        for index, row in ipairs({{}, {value = 7}, {value = false}, {value = true}}) do
            test.it("rejects non-string non-table yield content case " .. index, function()
                fixture.records = {yield_record(row.value)}
                local ok, result, err = pcall(subject.pending, "flow", "review", {status = consts.STATUS.RUNNING})
                test.is_true(ok, tostring(result))
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.eq(err:details().code, "BLOCK_SIGNAL_STATE_INVALID")
                test.eq(err:retryable(), false)
            end)
        end

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
