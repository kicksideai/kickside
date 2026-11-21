-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local declared_custody_backfill = require("declared_custody_backfill")
local types = require("types")

local function verify_producer(tx, declaration, postgres)
    local id = declaration.component_id
    if declaration.automation_id ~= id or declaration.command_id ~= "install:" .. id then return false end

    -- Command writers lock the command row before updating an operation.
    local lock = postgres and " FOR SHARE" or ""
    local commands, command_err = tx:query([[
        SELECT automation_id FROM kickside_automation_command
         WHERE automation_id=$1 AND generation=1 AND pending_request_id IS NULL
        ]] .. lock, {id})
    if command_err then error(command_err) end
    if not commands[1] then return false end

    local receipts, receipt_err = tx:query([[
        SELECT outcome_json FROM kickside_automation_op
         WHERE automation_id=$1 AND request_id=$2 AND digest=$3
           AND generation=1 AND state='succeeded' AND completed_at IS NOT NULL
           AND outcome_json IS NOT NULL
        ]] .. lock, {id, declaration.command_id, declaration.declaration_hash})
    if receipt_err then error(receipt_err) end
    if not receipts[1] then return false end

    -- The ordinary install outcome has exactly these fields. Its shape also
    -- distinguishes selected installs with caller-chosen request ids.
    local outcome = json.decode(receipts[1].outcome_json)
    if type(outcome) ~= "table" or outcome.component_id ~= id or outcome.generation ~= 1 then
        return false
    end
    for key in pairs(outcome) do
        if key ~= "component_id" and key ~= "generation" then return false end
    end
    return true
end

return require("migration").define(function()
    migration("22 enroll retained ordinary recurring tasks", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, cursor)
                    return declared_custody_backfill(tx, {
                        cursor = cursor,
                        postgres = dialect == "postgres",
                        db_id = types.db_id(),
                        impl_id = "kickside.automation.recurring:task",
                        verify_producer = verify_producer,
                    })
                end, "batch")
            end)
        end
    end)
end)
