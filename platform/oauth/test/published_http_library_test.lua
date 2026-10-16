local test = require("test")
local registry = require("registry")
local published = require("published")
return { run = test.run_cases(function()
    test.describe("published HTTP error library", function()
        test.it("keeps the importable registry identity", function()
            local entry, err = registry.get("kickside.oauth.api:errors")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(entry.kind, "library.lua")
        end)
        test.it("retains the published method and typed status contract", function()
            for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 }, { errors.CONFLICT, 409 }, { errors.INTERNAL, 500 } }) do
                local err = errors.new({ kind = row[1], message = "opaque" })
                local status = published.status(err, "fallback")
                test.eq(status, row[2])
            end
        end)
        test.it("retains exact plain machine codes without classifying prose", function()
            for _, row in ipairs({ { "bad_request", 400 }, { "NOT_FOUND", 404 }, { "forbidden", 403 }, { "conflict", 409 }, { "server_error", 500 }, { "a thing is not_found", 500 } }) do
                local status, message = published.status(row[1], "fallback")
                test.eq(status, row[2])
                test.eq(message, row[1])
            end
        end)
    end)
end) }
