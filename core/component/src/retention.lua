local teardown = require("teardown")
local pending_delete = require("pending_delete")
local audit_retention = require("audit_retention")
local component_command = require("component_command")

local M = {}

function M.run(input: any?): any
    local change = type(input) == "table" and input.change or nil
    local owner = type(change) == "table" and change.owner_locator or nil
    local owner_id = type(owner) == "table" and type(owner.id) == "string" and owner.id or nil
    local resumed, resume_err, needs_continue, blocked = pending_delete.run(owner_id and 1 or 50, owner_id)
    if resume_err or resumed == nil then return { success = false,
        error = resume_err or component_command.response_error("pending_delete") } end
    local count, err, reap_continue, reap_blocked = teardown.reap_pending(50)
    if err or count == nil then return { success = false,
        error = err or component_command.response_error("thread_reap") } end
    local audits, audit_err = audit_retention.run(50)
    if audit_err or not audits then return { success = false,
        error = audit_err or component_command.response_error("audit_retention") } end
    for _, item in ipairs(reap_blocked or {}) do blocked[#blocked + 1] = item end
    return { success = true, deleted = resumed + count, audits = audits,
        needs_continue = needs_continue or reap_continue, blocked = blocked }
end

return M
