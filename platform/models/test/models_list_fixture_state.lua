local M = { CONTENT = { JSON = "application/json" }, STATUS = { OK = 200 } }
local payload: any = nil
function M.request(): any return { query = function(): any return nil end } end
function M.response(): any
    return { set_header = function(): () end, set_content_type = function(): () end,
        set_status = function(): () end, write_json = function(_self: any, value: any): () payload = value end }
end
function M.result(): any return payload end
return M
