-- Request-scoped test dependencies for the production list handler.
local M: { [string]: any } = {}
M.CONTENT = { JSON = "application/json" }
M.STATUS = { OK = 200, UNAUTHORIZED = 401, BAD_REQUEST = 400, INTERNAL_ERROR = 500 }
M.rows = {}
M.output = nil
M.query_params = nil
function M.request(): any
    return { query = function(_self: any, key: string): string?
        if type(M.query_params) == "table" then return M.query_params[key] end
        return key == "status" and "resolved" or nil
    end }
end
function M.response(): any
    return {
        set_content_type = function(_self: any, _value: any) end,
        set_status = function(_self: any, value: any) M.status = value end,
        write_json = function(_self: any, value: any) M.output = value end,
    }
end
function M.body(): { [string]: any }
    if type(M.output) ~= "table" then error("list handler returned no response body") end
    return M.output
end
function M.actor(): any return { id = function(): string return "reviewer" end } end
function M.component_id_for_owner(_owner: string): string return "inbox-reviewer" end
function M.query(): any
    local q: any = {}
    function q:by_id(value: string): any self.id = value; return self end
    function q:resolved(): any return self end
    function q:page(_page: any, _limit: any): any return self end
    function q:all(): any
        if not self.id then return M.rows, nil end
        local rows = {}
        for _, row in ipairs(M.rows) do if row.id == self.id then rows[#rows + 1] = row end end
        return rows, nil
    end
    function q:count(): any local rows = self:all(); return #rows, nil end
    function q:counts(): any return { item_count = #M.rows, pending_count = 0, resolved_count = #M.rows }, nil end
    return q
end
return M
