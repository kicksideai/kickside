local test = require("test")
local consistency = require("refine_consistency")
local errors = require("errors")

local function define_tests()
    test.describe("Skills refine write consistency", function()
        test.it("preflight failure performs neither durable write", function()
            local meta_writes = 0
            local appends = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return nil, "read failed" end,
                set_meta = function()
                    meta_writes = meta_writes + 1
                    return true, nil
                end,
                append = function()
                    appends = appends + 1
                    return nil
                end,
            })

            test.is_false(ok)
            test.contains(tostring(err), "preflight")
            test.contains(tostring(err), "read failed")
            test.eq(meta_writes, 0)
            test.eq(appends, 0)
        end)

        test.it("metadata failure does not append an event", function()
            local appends = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function() return false, "metadata unavailable" end,
                append = function()
                    appends = appends + 1
                    return nil
                end,
            })

            test.is_false(ok)
            test.contains(tostring(err), "metadata unavailable")
            test.eq(appends, 0)
        end)

        test.it("append failure restores old values and deletes newly-added keys", function()
            local writes: { any } = {}
            local ok, err = consistency.apply("skill-1", {
                comment = "After",
                icon = "tabler:new",
                status = "archived",
            }, {
                get_meta = function()
                    return { comment = "Before", status = "active" }, nil
                end,
                set_meta = function(_, fields, opts)
                    table.insert(writes, { fields = fields, opts = opts })
                    return true, nil
                end,
                append = function() return "thread write failed" end,
            })

            test.is_false(ok)
            test.contains(tostring(err), "thread write failed")
            test.contains(tostring(err), "rolled back")
            test.eq(#writes, 2)
            local rollback: any = writes[2] or {}
            test.eq((rollback.fields or {}).comment, "Before")
            test.eq((rollback.fields or {}).status, "active")
            test.eq(#((rollback.opts or {}).delete_keys or {}), 1)
            test.eq(((rollback.opts or {}).delete_keys or {})[1], "icon")
        end)

        test.it("preserves a typed projection failure after metadata rollback", function()
            local projection_err = errors.new({ message = "projection unavailable",
                kind = errors.UNAVAILABLE, retryable = true })
            local writes = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function()
                    writes = writes + 1
                    return true, nil
                end,
                append = function() return projection_err end,
            })
            test.is_false(ok)
            test.eq(writes, 2)
            test.eq(err, projection_err)
            test.eq((err :: any):kind(), errors.UNAVAILABLE)
            test.is_true((err :: any):retryable())
        end)

        test.it("keeps typed projection classification when metadata rollback fails", function()
            local projection_err = errors.new({ message = "projection unavailable",
                kind = errors.UNAVAILABLE, retryable = true })
            local writes = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function()
                    writes = writes + 1
                    if writes == 1 then return true, nil end
                    return false, "rollback denied"
                end,
                append = function() return projection_err end,
            })
            test.is_false(ok)
            test.contains(tostring(err), "rollback denied")
            test.eq((err :: any):kind(), errors.UNAVAILABLE)
            test.is_true((err :: any):retryable())
        end)

        test.it("reports append and rollback failures together", function()
            local writes = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function()
                    writes = writes + 1
                    if writes == 1 then return true, nil end
                    return false, "rollback denied"
                end,
                append = function() return "thread write failed" end,
            })

            test.is_false(ok)
            test.contains(tostring(err), "thread write failed")
            test.contains(tostring(err), "rollback denied")
        end)

        test.it("restores metadata when a concurrent version wins", function()
            local writes: { any } = {}
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function(_, fields, opts)
                    table.insert(writes, { fields = fields, opts = opts })
                    return true, nil
                end,
                append = function()
                    return "skill version conflict: version 2 already exists with different content"
                end,
            })

            test.is_false(ok)
            test.contains(tostring(err), "skill version conflict")
            test.contains(tostring(err), "rolled back")
            test.eq(#writes, 2)
            local rollback: any = writes[2] or {}
            test.eq((rollback.fields or {}).comment, "Before")
        end)

        test.it("keeps both writes on success without a rollback", function()
            local writes: { any } = {}
            local appends = 0
            local ok, err = consistency.apply("skill-1", { comment = "After" }, {
                get_meta = function() return { comment = "Before" }, nil end,
                set_meta = function(_, fields, opts)
                    table.insert(writes, { fields = fields, opts = opts })
                    return true, nil
                end,
                append = function()
                    appends = appends + 1
                    return nil
                end,
            })

            test.is_true(ok)
            test.is_nil(err)
            test.eq(#writes, 1)
            local first: any = writes[1] or {}
            test.eq((first.fields or {}).comment, "After")
            test.eq(appends, 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
