-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")

local function exercise(non_kb: boolean, body: any): any
    local result, err = funcs.new()
        :with_actor(security.new_actor("knowledge-update-owner", {}))
        :with_scope(security.new_scope({ security.policy("app:user") }))
        :call("app.update_kb:probe", { non_kb = non_kb, body = body })
    test.is_nil(err, tostring(err))
    return result
end

local function unchanged(result: any): ()
    test.eq(result.after.title, result.before.title, "title must remain unchanged")
    test.eq(result.after.comment, result.before.comment, "comment must remain unchanged")
    test.eq(result.after.icon, result.before.icon, "icon must remain unchanged")
    test.is_false(result.updated, "update must be rejected")
    test.is_true(result.invalid, tostring(result.error))
end

return { run = test.run_cases(function()
    test.describe("Knowledge update boundary", function()
        test.it("rejects a writable non-KB metadata update without changing metadata", function()
            local result = exercise(true, { name = "After", description = "Changed", icon = "tabler:alert" })
            unchanged(result)
        end)

        test.it("rejects a writable non-KB config update without changing metadata", function()
            unchanged(exercise(true, { name = "After", description = "Changed", icon = "tabler:alert",
                config = { chunk_size = 500 } }))
        end)

        test.it("rejects an empty KB name without changing metadata", function()
            unchanged(exercise(false, { name = "", description = "Changed", icon = "tabler:alert" }))
        end)

        test.it("rejects a whitespace-only KB name without changing metadata", function()
            unchanged(exercise(false, { name = " \t\r\n ", description = "Changed", icon = "tabler:alert" }))
        end)

        test.it("rejects a non-string KB name without changing metadata", function()
            unchanged(exercise(false, { name = 123, description = "Changed", icon = "tabler:alert" }))
        end)

        test.it("renames a KB and trims the name", function()
            local result = exercise(false, { name = "  After \t" })
            test.is_true(result.updated, tostring(result.error))
            test.eq(result.after.title, "After")
            test.eq(result.after.comment, result.before.comment)
            test.eq(result.after.icon, result.before.icon)
        end)

        test.it("updates KB metadata when name is absent", function()
            local result = exercise(false, { description = "Changed", icon = "tabler:books" })
            test.is_true(result.updated, tostring(result.error))
            test.eq(result.after.title, result.before.title)
            test.eq(result.after.comment, "Changed")
            test.eq(result.after.icon, "tabler:books")
        end)
    end)
end) }
