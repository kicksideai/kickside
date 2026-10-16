local json = require("json")
local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.missing, M.proof, M.calls, M.sdk = stage, source, false, nil, 0, false
    M.raw_body = "{}"
    M.body = {drop_notify = {thread_id = "subscriber", type = "source.dropped", body = {value = 1}}}
end
function M.outcome(stage: string, value: any): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        return nil, M.source
    end
    return value, nil
end
function M.decode(raw: string): (any, error?)
    if M.sdk then return json.decode(raw) end
    return M.outcome("decode", M.body)
end
function M.encode(body: table): (any, error?)
    if M.sdk then return json.encode(body) end
    return M.outcome("encode", "{}")
end
function M.append_events_tx(...: any): (any, error?)
    M.calls = M.calls + 1
    return M.outcome("append", {inserted = 1})
end
function M.executor(): any
    return {query = function(_self: any, statement: string, _args: any): (any, error?)
        if statement:find("kickside_projection", 1, true) then
            return M.outcome("hooks", {{id = "projection", body = M.raw_body}})
        end
        return M.outcome("subscriber", {{}})
    end}
end
return M
