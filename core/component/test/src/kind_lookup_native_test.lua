-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local authority = require("authority")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("operation kind admission", function()
        test.it("resolves each distinct kind once and keeps authority local to the operation", function()
            fixture.lookups, fixture.permissions, fixture.allowed = 0, 0, true
            local check = authority.checker("update")
            for index = 1, 10000 do
                test.is_nil(check(index % 2 == 0 and "closed" or "open"))
            end
            test.eq(fixture.lookups, 2)
            test.eq(fixture.permissions, 1)
            fixture.allowed = false
            local next_check = authority.checker("update")
            local err = next_check("closed")
            test.not_nil(err)
            test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(fixture.lookups, 3)
            test.eq(fixture.permissions, 2)
            test.not_nil(authority.checker("create")("closed"))
        end)
    end)
end)}
