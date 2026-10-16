local json = require("json")
local undo = require("undo")

return function(M: any, I: any)
local T = I.T

function M.lock_history(h: any, workflow_id: string): error?
    local err = I.exec(h, "INSERT INTO " .. T.HISTORY ..
        " (workflow_id, tracker) VALUES ($1, $2) ON CONFLICT(workflow_id) DO NOTHING",
        { workflow_id, '{"undo":[],"redo":[]}' })
    if err then return err end
    return I.exec(h, "UPDATE " .. T.HISTORY .. " SET tracker=tracker WHERE workflow_id=$1", { workflow_id })
end

function M.read_history(h: any, workflow_id: string): (any?, error?)
    local rows, err = I.query(h, "SELECT tracker FROM " .. T.HISTORY .. " WHERE workflow_id=$1", { workflow_id })
    if err then return nil, err end
    if not rows[1] then return undo.new(), nil end
    local tracker, decode_err = json.decode(rows[1].tracker)
    if decode_err then return nil, errors.wrap(decode_err, "decode workflow undo history") end
    if type(tracker) ~= "table" or type(tracker.undo) ~= "table" or type(tracker.redo) ~= "table" then
        return nil, errors.new({message = "persisted workflow undo history must contain undo and redo stacks",
            kind = errors.INTERNAL, retryable = false, details = {code = "workflow_history_invalid"}})
    end
    return tracker, nil
end

function M.write_history(h: any, workflow_id: string, tracker: any): error?
    local encoded, err = json.encode(tracker)
    if err then return errors.wrap(err, "encode workflow undo history") end
    if type(encoded) ~= "string" then return errors.new({message = "workflow undo history encoder returned no string",
        kind = errors.INTERNAL, retryable = false}) end
    return I.exec(h, "UPDATE " .. T.HISTORY .. " SET tracker=$1 WHERE workflow_id=$2", { encoded, workflow_id })
end
end
