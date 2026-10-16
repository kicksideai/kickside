local test = require("test")
local health = require("health")
local sql = require("sql")

local function describe_tests()
    test.describe("application readiness", function()
        test.it("proves readiness through a real round trip to the declared application database", function()
            test.is_true(health.probe_database(sql))
        end)

        test.it("releases an acquired handle when acquisition also returns an error", function()
            local released = 0
            local queried = false
            local healthy = health.probe_database({
                get = function()
                    return { query = function() queried = true end,
                        release = function() released = released + 1 end }, "acquisition refused"
                end,
            })
            test.is_false(healthy)
            test.is_false(queried)
            test.eq(released, 1)
        end)

        test.it("reports a responsive database and releases its handle", function()
            local released = 0
            local db = {
                query = function(_, query)
                    test.eq(query, "SELECT 1")
                    return { { [1] = 1 } }, nil
                end,
                release = function()
                    released = released + 1
                end,
            }

            test.is_true(health.probe_database({
                get = function(resource)
                    test.eq(resource, "app:db")
                    return db, nil
                end,
            }))
            test.eq(released, 1)
        end)

        test.it("reports an acquisition failure as unhealthy", function()
            test.is_false(health.probe_database({
                get = function()
                    return nil, "database unavailable"
                end,
            }))
        end)

        test.it("reports a query failure as unhealthy and still releases its handle", function()
            local released = 0
            local db = {
                query = function()
                    return nil, "query failed"
                end,
                release = function()
                    released = released + 1
                end,
            }

            test.is_false(health.probe_database({
                get = function()
                    return db, nil
                end,
            }))
            test.eq(released, 1)
        end)
    end)
end

return { run = test.run_cases(describe_tests) }
