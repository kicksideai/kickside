local test = require("test")
local errors = require("errors")
local knowledge_bases = require("knowledge_bases")

local function define_tests()
    test.describe("knowledge_bases enrichment_agent validation", function()
        test.it("passes when no enrichment_agent_id is provided", function()
            local svc = { get = function() error("get must not be called") end }
            local err = knowledge_bases._validate_enrichment_agent(svc, nil)
            test.is_nil(err)
        end)

        test.it("rejects a non-existent enrichment_agent_id", function()
            local svc = {
                get = function(_, args)
                    return { success = false, error = "not found: " .. tostring(args.component_id) }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "gone-agent")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("rejects a component that is not a user agent", function()
            local svc = {
                get = function(_, _args)
                    return { success = true, meta = { class = "knowledge_base" } }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "some-kb")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("passes for an existing user agent", function()
            local svc = {
                get = function(_, _args)
                    return { success = true, meta = { class = "agent" } }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "real-agent")
            test.is_nil(err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
