local M: any = {}
function M.reset(stage: string, source: any, dialect: string)
    M.stage, M.source, M.dialect = stage, source, dialect
    M.missing, M.proof, M.calls, M.writes, M.more = false, nil, 0, 0, false
    M.pins = {{consumer_key = "drive:subscriber:source"}}
end
function M.result(stage: string, value: any): (any, error?)
    if stage == M.stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    return value, nil
end
function M.executor(): any
    return {
        type = function() return M.result("dialect", M.dialect) end,
        query = function(self, statement, args)
            if statement:find("SELECT deleting_at", 1, true) then
                return M.result("mark_proof", {{deleting_at = "stamp"}})
            elseif statement:find("SELECT component_id", 1, true) then
                return M.result("state", {{component_id = "source", teardown_fence_cursor = "", teardown_fence_done = 0}})
            elseif statement:find("SELECT consumer_key", 1, true) then
                return M.result("pins", M.pins)
            end
            return M.result("stamp_proof", {{teardown_fence_cursor = #M.pins > 0 and M.pins[math.min(#M.pins, 100)].consumer_key or "",
                teardown_fence_done = #M.pins > 100 and 0 or 1}})
        end,
        execute = function(self, statement, args)
            M.writes = M.writes + 1
            return M.result(statement:find("SET deleting_at", 1, true) and "mark" or "stamp", {rows_affected = 1})
        end,
    }
end
function M.get(id: string): (any, error?)
    return M.result("contract", {open = function(self)
        return M.result("binding", {fence = function(self, payload)
            M.calls = M.calls + 1
            return M.result("fence", {fenced = true})
        end})
    end})
end
return M
