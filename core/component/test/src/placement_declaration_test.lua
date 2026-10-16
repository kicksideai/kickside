local test = require("test")
local rules = require("rules")

local function entry(placement: any): any
    return { id = "app:placement_child", kind = "contract.binding", meta = { placement = placement } }
end

local run_cases = test.run_cases(function()
    test.describe("placement declaration validation", function()
        test.it("accepts installed kind ids, root and an omitted fixed flag", function()
            local parsed, err = rules.validate_binding(entry({ parents = { "app:placement_parent", "root" } }))
            test.is_nil(err)
            test.eq(#parsed.parents, 2)
            test.eq(parsed.parents[1], "app:placement_parent")
            test.eq(parsed.parents[2], "root")
            test.eq(parsed.fixed, false)
        end)
        test.it("refuses empty parents and unknown or non-binding parent ids with a typed binding error", function()
            for _, parents in ipairs({ {}, { "missing:kind" }, { "app:db" } }) do
                local parsed, err = rules.validate_binding(entry({ parents = parents }))
                test.is_nil(parsed)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:details().binding, "app:placement_child")
                test.is_true(tostring(err):find("app:placement_child", 1, true) ~= nil)
            end
        end)
        test.it("refuses malformed placement declarations", function()
            for _, placement in ipairs({ true, {}, { parents = "root" }, { parents = { true } },
                { parents = { "root" }, fixed = "true" }, { parents = { [2] = "root" } },
                { parents = { "root", unexpected = "root" } } }) do
                local parsed, err = rules.validate_binding(entry(placement))
                test.is_nil(parsed)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:details().binding, "app:placement_child")
            end
        end)
        test.it("validates installed placement declarations during registry boot", function()
            local result, err = rules.run()
            test.is_nil(err)
            test.eq(result.status, "success")
        end)
        test.it("names the placement and the allowed parents in the typed placement error", function()
            local err = rules.check({ parents = { "root", "app:placement_parent" }, fixed = false },
                "app:placement_child", "app:placement_root", false)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().reason, "placement")
            test.eq(err:details().kind, "app:placement_child")
            test.eq(err:details().parent_kind, "app:placement_root")
            test.is_true(tostring(err):find("allowed parents: root, app:placement_parent", 1, true) ~= nil)
        end)
    end)
end)

return { run = function(options) return run_cases(options) end }
