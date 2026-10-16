local sql = require("sql")
local M = {}
function M.reset(stage: string, primary: error?, secondary: error?)
    M.stage, M.primary, M.secondary, M.effect_id, M.reply = stage, primary, secondary, nil, nil
    M.opens, M.validations, M.appends, M.releases, M.emits = 0, 0, 0, 0, 0
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return false, M.primary end
        if M.stage == "missing_release" then return nil, nil end
        if M.stage == "false_release" then return false, nil end
        if M.secondary then return false, M.secondary end
        return true, nil
    end}, nil
end
function M.validate(...): (boolean?, error?)
    M.validations = M.validations + 1
    if M.stage == "validate" then return nil, M.primary end
    return false, nil
end
function M.ingest(db: any, writes: table[], ...): (any, error?)
    M.appends = M.appends + 1
    if M.stage == "append" then return nil, M.primary end
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then error(err) end
        if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "append guard requires a database"})) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if write_err then error(write_err) end
        if release_err then error(release_err) end
    end
    if M.reply then return M.reply.value, nil end
    local results = {}
    for _, write in ipairs(writes) do results[#results + 1] = {thread_id = write.thread_id, inserted = 1, duplicates = 0, max_seq = 1, events = {}} end
    return results, nil
end
function M.emit(...): error?
    M.emits = M.emits + 1
    if M.stage == "emit" then return M.primary end
    return nil
end
function M.args(): table return {thread_id = "thread", events = {{type = "kickside.threads:message.created", role = "user", body_json = "{}"}}} end
return M
