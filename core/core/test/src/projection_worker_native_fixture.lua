local json = require("json")
local job_types = require("job_types")
local M = {stage = "", source = nil, calls = 0, exits = 0, decodes = 0}
function M.reset(stage: string, source: any)
    M.stage, M.source = stage, source
    M.calls, M.exits, M.decodes = 0, 0, 0
    M.actors, M.scopes, M.configures = 0, 0, 0
end
function M.call(_target: string, _input: table): (any, error?)
    M.calls = M.calls + 1
    if M.stage == "call" then return nil, M.source end
    return "{}", nil
end
function M.decode(value: string): (any, error?)
    M.decodes = M.decodes + 1
    if M.stage == "decode" then return nil, M.source end
    return json.decode(value)
end
function M.get(_target: string): (any, error?)
    return {kind = (M.stage == "exit" or M.stage == "transport" or M.stage == "direct_exit" or M.stage == "payload") and "process.lua" or "function.lua", meta = {type = "projection.worker"}}, nil
end
function M.run(_hooks: any, options: any): (any, error?)
    M.exits = M.exits + 1
    if M.stage == "transport" then
        return options.interpret_exit({value = {ok = false, error_native = job_types.error_to_data(M.source)}})
    end
    if M.stage == "payload" then return options.interpret_exit({value = M.source}) end
    if M.stage == "direct_exit" then return options.interpret_exit(M.source) end
    return options.interpret_exit({error = M.source})
end
function M.new(): any
    local builder: any = {}
    function builder:with_actor(_actor: any): (any, error?)
        M.actors = M.actors + 1
        if M.stage == "actor" or M.stage == "missing_actor" then return nil, M.source end
        return builder, nil
    end
    function builder:with_scope(_scope: any): (any, error?)
        M.scopes = M.scopes + 1
        if M.stage == "scope" or M.stage == "missing_scope" then return nil, M.source end
        return builder, nil
    end
    function builder:with_options(options: table): (any, error?)
        M.configures = M.configures + 1
        M.max_attempts = options.retry.max_attempts
        if M.stage == "options" or M.stage == "missing_options" then return nil, M.source end
        return builder, nil
    end
    function builder:call(target: string, input: table): (any, error?) return M.call(target, input) end
    return builder
end
function M.from_row(_id: any, _context: any): (any, error?) return {component_id = "root"}, nil end
function M.resolve(_identity: any, _options: any): (any, error?) return {actor = {}, scope = {}}, nil end
return M
