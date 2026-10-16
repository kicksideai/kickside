local M = { CONTENT = { JSON = "application/json" },
    STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, NOT_FOUND = 404, INTERNAL_ERROR = 500 } }
local state: any = {}
function M.reset(params: any, body: any?, body_err: any?)
    state = { params = params, body = body, body_err = body_err, headers = {} }
end
function M.request(options: any?): any
    state.max_body = options and options.max_body
    return {
        param = function(_self: any, key: string): any return state.params[key] end,
        query = function(_self: any, key: string): any return state.params[key] end,
        body = function(): any return state.body, state.body_err end,
    }
end
function M.response(): any
    return {
        set_status = function(_self: any, value: any) state.status = value end,
        set_content_type = function(_self: any, value: any) state.content_type = value end,
        set_header = function(_self: any, key: string, value: any) state.headers[key] = value end,
        write = function(_self: any, value: any) state.html = value end,
        write_json = function(_self: any, value: any) state.payload = value end,
    }
end
function M.result(): any return state end
return M
