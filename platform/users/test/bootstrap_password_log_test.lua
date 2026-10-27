-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local admin_migration = require("admin_migration")

local function define_tests()
    test.describe("bootstrap credential output", function()
        test.it("omits the configured password from the credential summary", function()
            local lines = admin_migration.credential_summary("admin@example.test", "admin@example.test",
                "configured-password-fixture", "app.security:admin", true)
            local output = table.concat(lines, "\n")
            test.is_nil((output:find("configured-password-fixture", 1, true)))
            test.is_nil((output:find("Password:", 1, true)))
            test.eq(output, table.concat({
                "    DEFAULT ADMIN USER CREATED - SAVE THESE CREDENTIALS!",
                "    Username: admin@example.test",
                "    Email:    admin@example.test",
                "    Group:    app.security:admin",
                "",
                "    Login URL: /api/public/user/token",
            }, "\n"))
        end)

        test.it("includes the generated password in the credential summary", function()
            test.eq(table.concat(admin_migration.credential_summary("admin-generated", "admin-generated@localhost",
                "generated-password-fixture", "app.security:admin", false), "\n"), table.concat({
                "    GENERATED ADMIN USER CREATED - SAVE THESE CREDENTIALS!",
                "    Username: admin-generated",
                "    Email:    admin-generated@localhost",
                "    Password: generated-password-fixture",
                "    Group:    app.security:admin",
                "",
                "    Login URL: /api/public/user/token",
            }, "\n"))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
