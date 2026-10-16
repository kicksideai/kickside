local test = require("test")
local base = require("base")
return { run = test.run_cases(function()
    test.describe("Knowledge thread outcome boundary", function()
        test.it("preserves typed bounded cleanup and ordinary errors", function()
            for _, kind in ipairs({ errors.CONFLICT, errors.UNAVAILABLE, errors.PERMISSION_DENIED }) do
                local failure = errors.new({ kind = kind, message = "cleanup boundary", retryable = true,
                    details = { cleanup_pending = true, needs_continue = true, discarded = { projections = 100 } } })
                local result, err = base.call_threads({ purge = function() return nil, failure end }, "purge", {})
                test.is_nil(result)
                test.is_true(errors.is(err, kind))
                test.is_true(err:retryable())
                test.is_true(err:details().needs_continue)
                test.eq(err:details().discarded.projections, 100)
            end
        end)
    end)
end) }
