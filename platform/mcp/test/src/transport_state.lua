local M = { CONTENT = { JSON = "application/json" } }
local state: any = {}
function M.reset(session_id: any, body_err: any, origin: any?, method: any?, method_err: any?): ()
    state = { session_id = session_id, body_err = body_err, origin = origin, method = method or "POST", method_err = method_err, body_reads = 0, headers = {} }
end
function M.request(): any
    return { method = function(): any return state.method, state.method_err end,
        body = function(): any state.body_reads = state.body_reads + 1; return "{}", state.body_err end,
        header = function(_self: any, key: string): any
            if key == "Mcp-Session-Id" then return state.session_id end
            if key == "Origin" then return state.origin end
            return "Bearer fixture"
        end }
end
function M.response(): any
    return { set_content_type = function(): () end,
        set_header = function(_self: any, key: string, value: any): () state.headers[key] = value end,
        set_status = function(_self: any, value: any): () state.status = value end,
        write_json = function(_self: any, value: any): () state.payload = value end,
        write = function(): () end }
end
function M.result(): any return state end
return M
