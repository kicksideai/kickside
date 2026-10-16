local model_failure = require("model_failure")
local sql = require("sql")

local M = {}

local TABLE = "contract_model_failure_retry_counter"

local function increment(key: string): ()
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("retry counter database unavailable: " .. tostring(db_err)) end
    local _, write_err = sql.builder.insert(TABLE)
        :set_map({ counter_key = key, attempts = 1 })
        :suffix("ON CONFLICT (counter_key) DO UPDATE SET attempts = " .. TABLE .. ".attempts + 1")
        :run_with(db):exec()
    local _, release_err = db:release()
    if write_err or release_err then error("retry counter write failed: " .. tostring(write_err or release_err)) end
end

function M.run(args: any): (any?, any?)
    local key = args.key or "default"
    increment(key)
    if args.mode == "transient" then
        return nil, model_failure.wrap("model request", errors.new({
            kind = errors.UNAVAILABLE,
            message = "transient model dependency unavailable",
            retryable = true,
            details = { code = "transient_model_dependency" },
        }))
    end
    local source = errors.new({ kind = errors.NOT_FOUND, message = "model request rejected",
        retryable = args.retryable, details = { code = "model_request" } })
    return nil, model_failure.wrap("model request", source)
end

return M
