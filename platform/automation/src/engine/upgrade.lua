-- Stored declaration upgrade: brings an automation kind's stored declarations
-- to the current Trigger Spec v2 through the automation's own reconfigure
-- command, so the component declaration, its fence and every drive's applied
-- declaration advance together at the next command generation.
--
-- The upgraded declaration is derived from the stored one by the engine's
-- trigger rule alone. The command runs as the automation's execution subject,
-- the principal its drives already run as, as both operator and subject; the
-- declaration writer rechecks that principal's live grants. The command keeps
-- the main drive's source, so each drive's policy resolves from its own action
-- as before.

local support = require("engine_support")
local declaration_mod = require("engine_declaration")
local schema = require("engine_schema")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

local PAGE = 100

function part.attach(M: any, dependencies: any, P: any): ()
    local EXECUTION_IDENTITY_KEY = support.EXECUTION_IDENTITY_KEY
    local PORTABLE_INPUT_KEY = support.PORTABLE_INPUT_KEY
    local automation_error = support.automation_error

    -- upgrade_one(component_id, type_id, inputs) -> { removed, generation? }:
    -- removed is empty for a declaration already current.
    local function upgrade_one(component_id: string, type_id: string, inputs: any): (Map?, any)
        local ctx, ctx_err = P.owned_context(component_id)
        if ctx_err or not ctx then return nil, ctx_err end
        local stored = (ctx :: Map)[PORTABLE_INPUT_KEY]
        if type(stored) ~= "table" then return { removed = {} }, nil end
        local trigger, removed = declaration_mod.upgrade_trigger((stored :: Map).trigger)
        if #removed == 0 then return { removed = removed }, nil end
        local upgraded = support.portable_copy(stored) :: Map
        upgraded.trigger = trigger
        local input_err = schema.validate_install_input(inputs, upgraded)
        if input_err then return nil, input_err end
        local identity = (ctx :: Map)[EXECUTION_IDENTITY_KEY]
        if type(identity) ~= "table" or type((identity :: Map).principal) ~= "table" then
            return nil, automation_error("automation " .. component_id .. " has no execution identity", errors.INVALID)
        end
        local subject_id = (dependencies.execution_identity :: any).actor_key((identity :: Map).principal)
        local digest, digest_err = (dependencies.canonical_json :: any).hash(upgraded)
        if digest_err or not digest then return nil, digest_err end
        local applied, apply_err = P.run_declaration_command({
            kind = "reconfigure",
            request_id = "declaration-upgrade:" .. component_id .. ":" .. tostring(digest),
            automation_id = component_id,
            operator_id = subject_id,
            subject_id = subject_id,
            operator_identity = identity,
            subject_identity = identity,
            type_id = type_id,
            schema = inputs,
            declaration = upgraded,
            writer = "kickside.automation:declaration_writer_apply",
            writer_args = {},
        })
        if apply_err or not applied then return nil, apply_err end
        return { removed = removed, generation = (applied :: Map).generation }, nil
    end

    -- upgrade_declarations(type_id) -> { upgraded, current, failed }: every
    -- installed automation of the kind brought to the current declaration
    -- shape. upgraded lists { id, removed, generation }, failed { id, error }
    -- for an automation whose command is refused; current counts the
    -- automations already current. Each change and refusal is logged.
    function M.upgrade_declarations(type_id: string): (Map?, any)
        if type(type_id) ~= "string" or type_id == "" then
            return nil, automation_error("type_id is required", errors.INVALID)
        end
        local entry, entry_err = (dependencies.registry :: any).get(type_id)
        if entry_err then return nil, entry_err end
        if type(entry) ~= "table" or type(entry.meta) ~= "table" then
            return nil, automation_error("automation kind " .. type_id .. " is not registered", errors.NOT_FOUND)
        end
        local inputs = entry.meta.inputs
        local log = (dependencies.logger :: any):named("automation.upgrade")
        local report: Map = { upgraded = {}, current = 0, failed = {} }
        local offset = 0
        while true do
            local rows, rows_err = (dependencies.component :: any).list_system({ impl_ids = { type_id },
                limit = PAGE, offset = offset, order_by = { field = "created_at", direction = "ASC" } })
            if rows_err then return nil, rows_err end
            if type(rows) ~= "table" or #rows == 0 then break end
            for _, row in ipairs(rows) do
                local id = tostring(row.component_id)
                local result, err = upgrade_one(id, type_id, inputs)
                if err or not result then
                    report.failed[#report.failed + 1] = { id = id, error = tostring(err) }
                    log:error("stored declaration upgrade refused", { automation_id = id, type_id = type_id,
                        error = tostring(err) })
                elseif #result.removed == 0 then
                    report.current = report.current + 1
                else
                    report.upgraded[#report.upgraded + 1] = { id = id, removed = result.removed,
                        generation = result.generation }
                    log:info("stored declaration upgraded to the current trigger spec", { automation_id = id,
                        type_id = type_id, removed = table.concat(result.removed, ","), generation = result.generation })
                end
            end
            if #rows < PAGE then break end
            offset = offset + #rows
        end
        return report, nil
    end
end

return part
