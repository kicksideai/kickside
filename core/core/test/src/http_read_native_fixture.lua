local M = {}
function M.reset(stage: string, failure: any)
    M.stage, M.failure, M.status, M.body, M.calls, M.args = stage, failure, 200, nil, 0, nil
end
M.CONTENT = {JSON = "application/json"}
M.STATUS = {BAD_REQUEST = 400, NOT_FOUND = 404}
function M.request()
    return {param = function() return M.stage == "missing_id" and "" or "thread" end,
        query = function(_, key) if M.stage == "invalid_limit" and key == "limit" then return "invalid" end end}
end
function M.response()
    return {set_content_type = function() end, set_status = function(_, status) M.status = status end,
        write_json = function(_, body) M.body = body end}
end
local function read(...)
    M.calls = M.calls + 1; M.args = {...}
    if M.stage == "failure" then return nil, M.failure end
    if M.stage == "missing_result" then return nil, nil end
    return {id = "thread", component_id = "thread", threads = {{component_id = "thread", component_title = "Title", component_icon = "icon"}},
        children = {}, events = {}, max_pruned_seq = 2, next_seq = 3, source_gap = true,
        rows = {}, count = 0, has_more = false, cursor = "cursor", edges = {}}, nil
end
M.find, M.list, M.list_children, M.list_events, M.list_edges = read, read, read, read, read
return M
