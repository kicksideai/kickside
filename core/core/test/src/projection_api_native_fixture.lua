local sql = require("sql")
local M = {stage = "", source = nil, release_source = nil, opens = 0, releases = 0, closes = 0, effects = 0}
function M.reset(stage: string, source: error?, release_source: error?): ()
    M.stage, M.source, M.release_source = stage, source, release_source
    M.opens, M.releases, M.closes, M.effects = 0, 0, 0, 0
    M.progress_release_source = nil
    M.effect_id = nil
end
local function failure(stage: string): error?
    if M.stage == stage then return M.source end
    return nil
end
function M.is_str(value: any): boolean return type(value) == "string" and value ~= "" end
function M.trim(value: string): string return value end
function M.normalize_int_arg(value: any, ...: any): (any, error?) return value, nil end
function M.is_maintenance_actor(): boolean return false end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    local id = M.opens
    local err = failure(id == 1 and "open" or "progress_open")
    if err then return nil, err end
    return {
        release = function(_self: any): (any, error?)
            M.releases = M.releases + 1
            if id == 2 and M.progress_release_source then return nil, M.progress_release_source end
            if (M.stage == "progress_release" and id == 2) or (M.stage ~= "progress_release" and id == 1) then
                return nil, M.release_source
            end
            return true, nil
        end,
        query = function(_self: any, query: string, args: table): (any, error?)
            local err = failure("progress_read")
            if err then return nil, err end
            return {{last_seq = 1, status = "active"}}, nil
        end,
    }, nil
end
function M.gate_read(...: any): (any, error?)
    local err = failure("gate")
    if err then return nil, err end
    return {event_count = 1}, nil
end
function M.declared_identity(...: any): (any, error?)
    local err = failure("identity")
    if err then return nil, err end
    return {system = M.stage == "system", row = {}}, nil
end
function M.parse(...: any): (any, error?) return {}, failure("parse") end
function M.validate(...: any): (any, error?) return {worker_ref = "func://app:worker"}, failure("validate") end
local function mutation(stage: string): (any, error?)
    M.effects = M.effects + 1
    if M.effect_id then
        local db, open_err = sql.get("app:db")
        if open_err then return nil, open_err end
        if not db then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "projection effect database absent"}) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id = component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if release_err then return nil, release_err end
        if write_err then return nil, write_err end
    end
    local err = failure(stage)
    if err then return nil, err end
    return {projection_id = "projection", cursor_id = "cursor", status = "active", removed_cursors = 1}, nil
end
function M.register_projection(...: any): (any, error?) return mutation("register") end
function M.pause(...: any): (any, error?) return mutation("pause") end
function M.resume(...: any): (any, error?) return mutation("resume") end
function M.remove_projection(...: any): (any, error?) return mutation("remove") end
function M.decode(...: any): (any, error?) return nil, nil end
function M.response(thread: string, projections: table, cursors: table, ...: any): (any, error?)
    return {thread_id = thread, projections = projections, cursors = cursors, count = #projections}, nil
end
function M.list_projections(...: any): (any, error?, any)
    return {{id = "projection"}}, failure("projections"), {}
end
function M.list_cursors(...: any): (any, error?, any)
    return {{id = "cursor"}}, failure("cursors"), {}
end
function M.find_projection_cursor(...: any): (any, error?)
    return {id = "cursor", projection_id = "projection"}, failure("find")
end
function M.select_projection_cursor(...: any): (any, error?)
    return {id = "cursor", projection_id = "projection", job_id = "job", status = "active", last_seq = 0}, failure("select")
end
function M.begin_wait(...: any): (any, error?) return {}, failure("begin_wait") end
function M.close_wait(...: any): () M.closes = M.closes + 1 end
function M.wait_until_reached(...: any): (any, boolean, error?) return true, false, failure("wait") end
function M.wake_job(...: any): (any, error?) return true, failure("wake") end
return M
