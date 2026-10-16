local M = {}
M.CONTENT = {JSON = "application/json"}
M.STATUS = {OK = 200, ACCEPTED = 202, BAD_REQUEST = 400, CREATED = 201}
function M.reset(stage: string, failure: any)
    M.stage, M.failure, M.status, M.body, M.calls, M.list_calls = stage, failure, 200, nil, 0, 0
end
function M.request()
    return {param = function() return M.stage == "missing_id" and "" or "thread" end,
        body = function()
            if M.stage == "missing_body" then return "" end
            if M.stage == "invalid_json" then return "{" end
            if M.stage == "empty_text" then return '{"text":""}' end
            if M.stage == "empty_events" then return '{"events":[]}' end
            if M.stage == "scalar_event" then return '{"events":[true]}' end
            return '{"text":"kept","type":"kickside.threads:message.created","attrs":{"marker":"kept"},"events":[{"type":"kickside.threads:message.created","body":{"text":"kept"}}]}'
        end}
end
function M.response()
    return {set_content_type = function() end, set_status = function(_, status) M.status = status end,
        write_json = function(_, body) M.body = body end}
end
local function mutate(...)
    M.calls = M.calls + 1
    if M.stage == "failure" then return nil, M.failure end
    if M.stage == "missing_result" then return nil, nil end
    return {thread = {id = "thread", marker = "kept"}, component_id = "thread", thread_id = "thread",
        inserted = M.stage == "duplicate" and 0 or 1, duplicates = M.stage == "duplicate" and 1 or 0, max_seq = 1}, nil
end
M.create, M.update, M.delete, M.append_event, M.append_events = mutate, mutate, mutate, mutate, mutate
function M.list_events(...)
    M.calls, M.list_calls = M.calls + 1, M.list_calls + 1
    if M.stage == "list_failure" then return nil, M.failure end
    if M.stage == "missing_list" then return nil, nil end
    if M.stage == "missing_events" then return {}, nil end
    if M.stage == "invalid_events" then return {events = true}, nil end
    return {events = {{id = "event", seq = 1, body = {text = "kept"}}}}, nil
end
return M
