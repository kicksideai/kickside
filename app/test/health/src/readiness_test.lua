-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local readiness = require("readiness")

local function fake_fs(files, get_err)
    return { get = function(id)
        test.eq(id, "app:app_fs")
        if get_err then return nil, get_err end
        return { exists = function(_, path) return files[path] == true end }
    end }
end

local function describe_tests()
    test.describe("public readiness", function()
        test.it("is ready when setup is done and the main UI bundle is present", function()
            test.is_nil(readiness.reason({ ready = true }, true))
        end)

        test.it("waits while first-boot modules install", function()
            test.eq(readiness.reason({ ready = false, reason = "installing_modules" }, true), "installing_modules")
            test.eq(readiness.reason(nil, true), "installing_modules")
        end)

        test.it("reports a failed first-boot setup before a missing UI", function()
            test.eq(readiness.reason({ ready = false, reason = "setup_failed" }, false), "setup_failed")
        end)

        test.it("reports a missing main UI bundle", function()
            test.eq(readiness.reason({ ready = true }, false), "ui_missing")
        end)

        test.it("checks the main UI entry in the application static store", function()
            test.is_true(readiness.ui_present(fake_fs({ ["app/main/app.html"] = true })))
            test.is_false(readiness.ui_present(fake_fs({})))
            test.is_false(readiness.ui_present(fake_fs({}, "unavailable")))
        end)
    end)
end

return { run = test.run_cases(describe_tests) }
