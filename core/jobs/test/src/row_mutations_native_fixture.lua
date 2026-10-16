local native = require("native")
local M: any = {NULL = native.NULL}
function M.reset(stage, source)
    M.stage, M.source, M.missing = stage, source, false
    M.rows, M.filters, M.checked = {{id = "one"}, {id = "two"}}, {}, {}
    M.queries = 0
end
function M.builder(): any
    local q: any = {}
    function q:from(name) M.table_name = name; return self end
    function q:where(filter) M.filters[#M.filters + 1] = filter; return self end
    function q:run_with(exec) M.executor = exec; return self end
    function q:query()
        M.queries = M.queries + 1
        if M.stage == "query" then
            if M.missing then return nil, nil end
            return nil, M.source
        end
        return M.rows, nil
    end
    return q
end
function M.check_update(exec, name, id, changes, cap, operation): error?
    M.checked[#M.checked + 1] = {exec = exec, name = name, id = id, changes = changes, cap = cap, operation = operation}
    if M.stage == "check" then return M.source end
    return nil
end
return M
