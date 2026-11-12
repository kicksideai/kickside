-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local command = require("command")
local envelope = require("envelope")

return {run = function(args)
    local result, err = command.create_declared(args.input, function(request)
        return {valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
            operator_id = args.operator, execution_subject_id = args.operator,
            component_id = request.component_id, automation_id = request.automation_id,
            command_id = request.command_id, generation = request.generation,
            declaration_hash = request.declaration_hash, declaration = {}, public_meta = args.public_meta,
            affected_drive_keys = {"main"}}
    end)
    if err then return envelope.from_error(err) end
    return result
end}
