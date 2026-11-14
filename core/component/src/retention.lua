local teardown = require("teardown")
local pending_delete = require("pending_delete")
local audit_retention = require("audit_retention")
local component_command = require("component_command")
local secrets_migration = require("secrets_migration")

local logger = require("logger")
local log = logger:named("component.retention")
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
    local secret_report = {converted = 0, invalid = 0, needs_continue = false}
    if not owner_id then
        local report, migration_err = secrets_migration.run(50)
        if migration_err or not report then
            for _, item in ipairs(reap_blocked or {}) do blocked[#blocked + 1] = item end
            return {success = false, error = migration_err or component_command.response_error("secrets_migration"),
                deleted = resumed + count, audits = audits,
                needs_continue = needs_continue or reap_continue or audits.needs_continue,
                deadline_ms = audits.deadline_ms, blocked = blocked}
        end
        secret_report = report
        if report.invalid > 0 then
            log:warn("component secret migration retains invalid rows", {invalid = report.invalid})
        end
    end
    for _, item in ipairs(reap_blocked or {}) do blocked[#blocked + 1] = item end
    return { success = true, deleted = resumed + count, audits = audits, secret_migration = secret_report,
        needs_continue = needs_continue or reap_continue or audits.needs_continue or secret_report.needs_continue,
        deadline_ms = audits.deadline_ms, blocked = blocked }
end

return M
