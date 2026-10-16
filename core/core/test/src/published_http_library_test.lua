local test = require("test")
local registry = require("registry")
local published = require("published")
return { run = test.run_cases(function()
    test.describe("published HTTP error library", function()
        test.it("keeps the importable registry identity", function()
            local entry, err = registry.get("kickside.core:http_status")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(entry.kind, "library.lua")
        end)
        test.it("retains the published method and typed status contract", function()
            for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 }, { errors.CONFLICT, 409 }, { errors.INTERNAL, 500 } }) do
                local err = errors.new({ kind = row[1], message = "opaque" })
                local status = published.for_error(err)
                test.eq(status, row[2])
            end
        end)

    end)
end) }
