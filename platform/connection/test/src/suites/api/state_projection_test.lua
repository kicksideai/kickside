local test = require("test")
local conn_types = require("conn_types")

local function define_tests()
    test.describe("connection state projection", function()
        test.it("derives expired when a connected token is past expiry", function()
            test.eq(conn_types.project_state("connected", 100, 101), "expired")
        end)

        test.it("keeps a connected token with a future expiry connected", function()
            test.eq(conn_types.project_state("connected", 200, 100), "connected")
        end)

        test.it("defaults an absent state to connected", function()
            test.eq(conn_types.project_state(nil, nil, 100), "connected")
            test.eq(conn_types.project_state("", nil, 100), "connected")
        end)

        test.it("preserves actionable non-connected states", function()
            test.eq(conn_types.project_state("needs_reauth", nil, 100), "needs_reauth")
            test.eq(conn_types.project_state("disabled", 100, 101), "disabled")
        end)

        test.it("ignores malformed expiration metadata", function()
            test.is_nil(conn_types.timestamp("1e2"))
            test.eq(conn_types.project_state("connected", "1e2", 101), "connected")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
