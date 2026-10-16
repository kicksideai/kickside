local test = require("test")
local dedup = require("dedup")

local function define_tests()
    test.describe("channel dedup", function()
        test.it("seen reports first sight then repeat", function()
            local d = dedup.new(100)
            test.is_false(d.seen("m1"))
            test.is_true(d.seen("m1"))
        end)

        test.it("contains does not mark", function()
            local d = dedup.new(100)
            test.is_false(d.contains("m2"))
            test.is_false(d.contains("m2"))
            d.mark("m2")
            test.is_true(d.contains("m2"))
        end)

        test.it("empty and non-string ids are never seen", function()
            local d = dedup.new(100)
            test.is_false(d.seen(""))
            test.is_false(d.seen(nil))
            test.is_false(d.contains(""))
        end)

        test.it("evicts oldest past the bound", function()
            local d = dedup.new(2)
            d.mark("a")
            d.mark("b")
            d.mark("c") -- evicts "a"
            test.is_false(d.contains("a"))
            test.is_true(d.contains("b"))
            test.is_true(d.contains("c"))
        end)

        -- The hub marks a first turn seen at spawn. If the bridge aborts startup
        -- before witnessing it, the hub forgets that id so the provider's redelivery
        -- is handled as a fresh turn instead of being silently suppressed as a
        -- duplicate of a turn that was never recorded.
        test.it("forget releases a marked id so a redelivery is retried, not suppressed", function()
            local d = dedup.new(100)
            d.mark("discord:conn-1:chan-1:msg-1")
            test.is_true(d.contains("discord:conn-1:chan-1:msg-1"))
            d.forget("discord:conn-1:chan-1:msg-1")
            test.is_false(d.contains("discord:conn-1:chan-1:msg-1"))
            -- A redelivery is now witnessed (first sight), not dropped.
            test.is_false(d.seen("discord:conn-1:chan-1:msg-1"))
        end)

        test.it("forget ignores empty and unknown ids", function()
            local d = dedup.new(100)
            d.mark("a")
            d.forget("")
            d.forget("unknown")
            test.is_true(d.contains("a"))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
