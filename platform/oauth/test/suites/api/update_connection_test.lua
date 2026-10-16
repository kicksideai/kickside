local test = require("test")
local update_consistency = require("update_consistency")

local function define_tests()
    test.describe("oauth connection update atomicity", function()
        local current = {
            connection_name = "Before",
            connection_description = "Old description",
        }
        local desired = {
            connection_name = "After",
            connection_description = "New description",
        }

        test.it("does not write metadata when the repository update fails", function()
            local meta_calls = 0
            local result, err = update_consistency.apply("component-1", current, desired, {
                get_meta = function() return { title = "Before" }, nil end,
                update_repo = function() return nil, "db failed" end,
                set_meta = function()
                    meta_calls = meta_calls + 1
                    return true, nil
                end,
            })
            test.is_nil(result)
            test.contains(err, "db failed")
            test.eq(meta_calls, 0)
        end)

        test.it("restores repository fields when metadata update fails", function()
            local repo_calls: { any } = {}
            local result, err = update_consistency.apply("component-1", current, desired, {
                get_meta = function() return { title = "Before" }, nil end,
                update_repo = function(_, fields)
                    table.insert(repo_calls, fields)
                    return { success = true }, nil
                end,
                set_meta = function() return false, "meta failed" end,
            })
            test.is_nil(result)
            test.contains(err, "meta failed")
            test.eq(#repo_calls, 2)
            local first: any = repo_calls[1] or {}
            local second: any = repo_calls[2] or {}
            test.eq(first.connection_name, "After")
            test.eq(second.connection_name, "Before")
            test.eq(second.connection_description, "Old description")
        end)

        test.it("reports rollback failure instead of hiding a divergent state", function()
            local calls = 0
            local result, err = update_consistency.apply("component-1", current, desired, {
                get_meta = function() return { title = "Before" }, nil end,
                update_repo = function()
                    calls = calls + 1
                    if calls == 1 then return { success = true }, nil end
                    return nil, "rollback db failed"
                end,
                set_meta = function() return false, "meta failed" end,
            })
            test.is_nil(result)
            test.contains(err, "meta failed")
            test.contains(err, "rollback db failed")
        end)

        test.it("commits both representations on success", function()
            local repo_calls = 0
            local meta_calls = 0
            local result, err = update_consistency.apply("component-1", current, desired, {
                get_meta = function() return { title = "Before" }, nil end,
                update_repo = function()
                    repo_calls = repo_calls + 1
                    return { success = true, updated_at = "now" }, nil
                end,
                set_meta = function(_, fields)
                    meta_calls = meta_calls + 1
                    test.eq(fields.title, "After")
                    test.eq(fields.comment, "New description")
                    test.is_nil(fields.description)
                    return true, nil
                end,
            })
            test.is_nil(err)
            test.eq(result.updated_at, "now")
            test.eq(repo_calls, 1)
            test.eq(meta_calls, 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
