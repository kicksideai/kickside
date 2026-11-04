local M = {}
function M.reset(stage, err, dialect)
    M.stage, M.err, M.dialect = stage, err, dialect
    M.missing, M.proof, M.queries, M.writes = false, nil, 0, 0
    M.owner_writes, M.owner_reads = 0, 0
end
function M.result(stage, value): (any, error?)
    if stage == M.stage then
        if M.missing then return M.proof, nil end
        if M.err then return nil, M.err end
    end
    return value, nil
end
function M.transaction(): any
    return {
        db_type = function() return M.result("dialect", M.dialect) end,
        query = function(self, statement, args)
            M.queries = M.queries + 1
            if statement:find("ORDER BY component_id ASC", 1, true) then
                return M.result("children", {{component_id = "child", path = "/parent/child/"}})
            elseif statement:find("ORDER BY c.component_id", 1, true) then
                return M.result("paths", {{component_id = "child", path = "/parent/child/"}})
            elseif statement:find("parent_id=$1", 1, true) then
                return M.result("more_children", {})
            end
            M.owner_reads = M.owner_reads + 1
            return M.result("owner_read_" .. M.owner_reads, {})
        end,
        execute = function(self, statement, args)
            M.writes = M.writes + 1
            if statement:find("context_revision=context_revision", 1, true) then
                return M.result("lock", {rows_affected = 1})
            elseif statement:find("WITH doomed", 1, true) then
                M.owner_writes = M.owner_writes + 1
                return M.result("owner_delete_" .. M.owner_writes, {rows_affected = 0})
            elseif statement:find("SET path=", 1, true) then
                return M.result("path_write", {rows_affected = 1})
            elseif statement:find("SET parent_id=NULL", 1, true) then
                return M.result("detach", {rows_affected = 1})
            end
            return M.result("delete", {rows_affected = 1})
        end,
    }
end
return M
