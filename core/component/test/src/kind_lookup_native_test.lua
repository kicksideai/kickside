-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local authority = require("authority")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("operation kind admission", function()
        test.it("checks current authority separately for every mutation", function()
            fixture.lookups, fixture.permissions, fixture.allowed = 0, 0, true
            test.is_nil(authority.check("closed", "update"))
            test.is_nil(authority.check("open", "update"))
            test.eq(fixture.lookups, 2)
            test.eq(fixture.permissions, 1)
            fixture.allowed = false
            local err = authority.check("closed", "update")
            test.not_nil(err)
            test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(fixture.lookups, 3)
            test.eq(fixture.permissions, 2)
            test.not_nil(authority.check("closed", "create"))
        end)
    end)
end)}
