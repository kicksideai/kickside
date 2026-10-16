local sql = require("sql")
local worker_pool = require("worker_pool")
local config = require("config")

-- The core Jobs pool with only its awaited slots. Projection catch-up runs on
-- awaited capacity; upload and maintenance jobs the suites drive themselves stay
-- unclaimed.
local function main(): (any?, error?)
    return worker_pool.new({
        sql_get = function(): (any?, error?) return sql.get("app:db") end,
        policy = function(): (any?, error?)
            local policy, err = config.policy()
            if err or not policy then return nil, err end
            policy.worker_count_sqlite = 0
            policy.worker_count_postgres = 0
            return policy, nil
        end,
    }).main()
end

return { main = main }
