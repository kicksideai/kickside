local sql = require("sql")
local worker_pool = require("worker_pool")
local config = require("config")

-- One execution slot on either dialect: a slot claims its next job only after
-- the previous one completed durably, so a later probe reply orders after the
-- earlier job's completion.
local function main(): (any?, error?)
    return worker_pool.new({
        sql_get = function(): (any?, error?) return sql.get("app:db") end,
        policy = function(): (any?, error?)
            local policy, err = config.policy()
            if err or not policy then return nil, err end
            policy.worker_count_sqlite = 1
            policy.worker_count_postgres = 1
            return policy, nil
        end,
    }).main()
end

return { main = main }
