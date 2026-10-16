local native = require("sql")
local db: native.DB? = nil
local M: any = {}
function M.executor(): native.DB
    if db then return db end
    local value, err = native.get("app:db")
    if err then error(err) end
    if not value then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "metadata test database is absent"}))
    end
    db = value
    return value
end
function M.reset(stage, source)
    if db then db:release(); db = nil end
    M.stage, M.source = stage, source
    M.rows, M.owners, M.lock_count, M.trace = {{key = "public", value = "saved"}}, {}, 1, {}
end
function M.result(stage, value)
    M.trace[#M.trace + 1] = stage
    if stage == M.stage and M.source then return nil, M.source end
    return value, nil
end
function M.builder(operation, name)
    local query = {}
    function query:from(value) self.table_name = value; return self end
    function query:where(...) return self end
    function query:order_by(...) return self end
    function query:set(key, value) self.update_value = value; return self end
    function query:set_map(...) return self end
    function query:columns(...) return self end
    function query:values(...) return self end
    function query:suffix(...) return self end
    function query:run_with(...) return self end
    function query:exec()
        local stage = operation
        if operation == "update" then stage = type(self.update_value) == "table" and "lock" or "touch" end
        return M.result(stage, {rows_affected = stage == "lock" and M.lock_count or 1})
    end
    function query:query() return M.result("read", M.rows) end
    return query
end
return M
