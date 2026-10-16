local test = require("test")
local fixture = require("fixture")
local catalog = require("catalog")
local agent_tool = require("agent_tool")

return test.run_cases(function()
    test.describe("published workflow discovery errors", function()
        test.it("requests a bounded prompt catalog and targets run lookup by id", function()
            local original = agent_tool._catalog
            local calls = {}
            agent_tool._catalog = function(args)
                calls[#calls + 1] = args
                return {}, nil
            end
            local result, err = agent_tool.build(nil, nil)
            local run_result, run_err = agent_tool.flow_run_handler({
                flow_ref = {kind = "flow", id = "beyond-the-prompt", version = 1}, input = {},
            })
            agent_tool._catalog = original
            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(calls[1])
            test.eq(calls[1].limit, 10)
            test.not_nil(calls[2])
            test.eq(calls[2].id, "beyond-the-prompt")
            test.eq(calls[2].limit, 1)
            test.is_nil(run_result)
            test.not_nil(run_err)
        end)
        for _, stage in ipairs({ "list", "access", "version" }) do
                test.it("returns the native " .. stage .. " failure", function()
                local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                    message = "catalog dependency unavailable", details = { marker = stage } })
                fixture.reset(stage, source)
                local result, err = catalog.catalog()
                test.is_nil(result)
                test.eq(err, source)
            end)
        end
        test.it("returns published entries and omits drafts", function()
            fixture.reset(nil, nil)
            local result, err = catalog.catalog()
            test.is_nil(err)
            test.eq(#result, 1)
            test.eq(result[1].flow_ref.id, "published")
        end)
        test.it("returns a catalog failure from agent construction", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "catalog unavailable", details = { marker = "build" } })
            local original = agent_tool._catalog
            agent_tool._catalog = function() return nil, source end
            local result, err = agent_tool.build(nil, nil)
            agent_tool._catalog = original
            test.is_nil(result)
            test.eq(err, source)
        end)
    end)
end)
