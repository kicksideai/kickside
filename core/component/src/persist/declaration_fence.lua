-- The component declaration fence (CONTRACTS §9): one row per (component,
-- automation) recording the highest applied automation command generation,
-- its command id and declaration hash. Its owner is the automation whose
-- command stream alone writes the component's declaration and identity (A16).
-- Every function runs on the caller's executor.
local sql = require("sql")
local time = require("time")
local error_envelope = require("error_envelope")

local M = {}

M.TABLE = "kickside_component_declaration_fence"

local function failure(message: string, err: error): error
    return error_envelope.wrap(err, message, {error_kind = "infrastructure"})
end

-- owner(executor, component_id) -> the automation whose declaration fence
-- holds this component, or nil for a component outside any declaration
-- owner's command stream.
function M.owner(executor: any, component_id: string): (string?, error?)
    local rows, err = sql.builder.select("automation_id"):from(M.TABLE)
        :where("component_id = ?", component_id):limit(1):run_with(executor):query()
    if err then return nil, failure("failed to read declaration fence", err) end
    local row = rows and rows[1]
    return row and tostring((row :: any).automation_id) or nil, nil
end

-- read(executor, component_id, automation_id) -> the component's fence for
-- that automation { applied_command_generation, command_id, declaration_hash },
-- or nil when none was written.
function M.read(executor: any, component_id: string, automation_id: string): (any?, error?)
    local rows, err = sql.builder.select("applied_command_generation", "command_id", "declaration_hash"):from(M.TABLE)
        :where("component_id = ?", component_id):where("automation_id = ?", automation_id):limit(1)
        :run_with(executor):query()
    if err then return nil, failure("failed to read declaration fence", err) end
    local row = rows and rows[1]
    if not row then return nil, nil end
    return {
        applied_command_generation = math.floor(tonumber((row :: any).applied_command_generation) or 0),
        command_id = (row :: any).command_id,
        declaration_hash = (row :: any).declaration_hash,
    }, nil
end

-- save_tx(tx, exists, input) advances the fence to the command input {
-- component_id, automation_id, generation, command_id, declaration_hash },
-- updating the existing row or inserting the first one.
function M.save_tx(tx: any, exists: boolean, input: any): error?
    local now = time.now():utc():format_rfc3339()
    local _, err
    if exists then
        _, err = sql.builder.update(M.TABLE)
            :set("applied_command_generation", input.generation)
            :set("command_id", input.command_id)
            :set("declaration_hash", input.declaration_hash)
            :set("updated_at", now)
            :where("component_id = ?", input.component_id)
            :where("automation_id = ?", input.automation_id):run_with(tx):exec()
    else
        _, err = sql.builder.insert(M.TABLE):set_map({
            component_id = input.component_id, automation_id = input.automation_id,
            applied_command_generation = input.generation, command_id = input.command_id,
            declaration_hash = input.declaration_hash, updated_at = now,
        }):run_with(tx):exec()
    end
    if err then return failure("failed to write declaration fence", err) end
    return nil
end

return M
