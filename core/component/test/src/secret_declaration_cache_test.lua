-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fields = require("secret_fields")
local fixture = require("fixture")

return {run = test.run_cases(function()
    test.describe("component declaration revision cache", function()
        test.it("invalidates secret paths when the central registry revision changes", function()
            fixture.version = fixture.version + 1
            fixture.reads = 0
            fixture.fields = {{path = {"api_key"}, type = "string"}}
            test.eq(assert(fields.for_impl("kind"))[1].path[1], "api_key")
            test.eq(assert(fields.for_impl("kind"))[1].path[1], "api_key")
            test.eq(fixture.reads, 1)
            fixture.fields = {{path = {"password"}, type = "string"}}
            fixture.version = fixture.version + 1
            test.eq(assert(fields.for_impl("kind"))[1].path[1], "password")
            test.eq(fixture.reads, 2)
        end)
        test.it("does not cache failed authoritative declaration reads", function()
            fixture.version = fixture.version + 1
            fixture.reads = 0
            fixture.source = errors.new({kind = errors.PERMISSION_DENIED, message = "declaration unavailable"})
            local result, err = fields.for_impl("kind")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            fixture.source = nil
            test.not_nil(assert(fields.for_impl("kind")))
            test.eq(fixture.reads, 2)
        end)
    end)
end)}
