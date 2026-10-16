local json = require("json")
local M: any = {}
function M.reset(stage, source, dialect)
    M.stage, M.source, M.dialect, M.missing, M.encodes, M.reads = stage, source, dialect, false, 0, 0
    M.value = nil
end
function M.encode(value)
    M.encodes = M.encodes + 1
    if M.stage == "encode" then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return json.encode(value)
end
function M.executor(): any
    local db: any = {}
    function db:db_type()
        if M.stage == "dialect" then
            if M.missing then return M.value, nil end
            return nil, M.source
        end
        return M.dialect, nil
    end
    function db:query(...)
        M.reads = M.reads + 1
        if M.stage == "query" then
            if M.missing then return M.value, nil end
            return nil, M.source
        end
        return {{id = "job", owner_kind = "thread", owner_id = "thread", payload_json = "{}"}}, nil
    end
    return db
end
return M
