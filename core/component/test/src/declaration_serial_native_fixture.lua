local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.encodes, M.decodes = stage, source, 0, 0
end
function M.input()
    return {component_id = "component", automation_id = "automation", command_id = "command", declaration_hash = "hash", generation = 1,
        impl_id = "implementation", context = {setting = true}, meta = {title = "kept"}, rollback = {step = true}}
end
function M.verify(input)
    return {valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
        component_id = input.component_id, automation_id = input.automation_id, command_id = input.command_id,
        declaration_hash = input.declaration_hash, generation = input.generation, operator_id = "user-1", execution_subject_id = "user-1",
        declaration = {setting = true}, affected_drive_keys = {"drive"}}, nil
end
function M.actor() return {id = function() return "system:automation" end} end
function M.can(...) return true end
return M
