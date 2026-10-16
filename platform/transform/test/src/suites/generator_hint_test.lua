local test = require("test")
local stubs = require("stubs")
local nodes = require("nodes").new({ prompt = stubs, llm = stubs, snippet = stubs })
return { run = test.run_cases(function()
    test.describe("requested transform mapping", function()
        test.it("includes the mapping hint when drafting an expression", function()
            local out = nodes.iterate({
                input_shape = "record", strategy = "expression", hint = "multiply crates by two", max_attempts = 1,
                source_schema = { type = "object", properties = { crates = { type = "integer" } } },
                sink_schema = { type = "object", required = { "reserved" }, properties = { reserved = { type = "integer" } } },
                samples = { { payload = { crates = 48 } } },
            })
            test.is_true(out.result.validated)
            test.contains(out.result.artifact, "* 2")
        end)
        test.it("generates a requested mapping instead of reusing a shape-only snippet", function()
            local state = nodes.snippet_search({ hint = "multiply crates by two" })
            test.is_false(state.done)
            test.is_nil(state.artifact)
        end)
    end)
end) }
