-- Keep the live harness to one real supervised claim loop on both engines.
local sql = require("sql")
local worker_pool = require("worker_pool")
local config = require("config")

local function main(): (any?, error?)
    return worker_pool.new({
        sql_get = function(): (any?, error?) return sql.get("app:db") end,
        policy = function(): (any?, error?)
            local policy, err = config.policy()
            if err or not policy then return nil, err end
            policy.worker_count_postgres = 1
            return policy, nil
        end,
    }).main()
end

return { main = main }
