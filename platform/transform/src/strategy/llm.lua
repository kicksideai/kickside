local json = require("json")
local prompt = require("prompt")
local llm = require("llm")
local strategy_reference = require("strategy_reference")

local M = {}

M.default_model = "class:fast"
M.default_prompt = "Summarize the item as concise plain text."

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

type Map = { [string]: any }

local SETTINGS = {
    {field = "model", section = "model", key = "selector", kind = "string", agree = true, default = M.default_model},
    {field = "prompt", section = "prompts", key = "runtime", kind = "string", default = M.default_prompt},
    {field = "temperature", section = "sampling", key = "temperature", kind = "number", agree = true, default = 0},
    {field = "max_tokens", section = "budgets", key = "runtime", kind = "integer", agree = true},
}

-- The same resolution validates install references and runtime effects. Policy
-- runtime values and their declaration fields describe one effective request.
function M.generation_options(config: any): (Map?, string?, string?)
    local c = type(config) == "table" and (config :: Map) or {}
    local policy = c.generation_policy
    if policy == nil then policy = {} end
    if type(policy) ~= "table" then return nil, nil, "generation_policy must be an object" end
    local p = policy :: Map
    if p.type ~= nil and p.type ~= "kickside.transform.generation_policy" then
        return nil, nil, "generation_policy.type must be kickside.transform.generation_policy"
    end
    if p.version ~= nil and p.version ~= 1 then return nil, nil, "generation_policy.version must be 1" end
    local resolved: Map = {}
    for _, setting in ipairs(SETTINGS) do
        local section = p[setting.section]
        if section ~= nil and type(section) ~= "table" then
            return nil, nil, "generation_policy." .. setting.section .. " must be an object"
        end
        local policy_value: any = nil
        if section ~= nil then policy_value = section[setting.key] end
        local value = c[setting.field]
        if setting.agree and value ~= nil and policy_value ~= nil and value ~= policy_value then
            return nil, nil, setting.field .. " conflicts with generation_policy." .. setting.section .. "." .. setting.key
        end
        if value == nil then value = policy_value end
        if value ~= nil then
            if setting.kind == "string" then
                if type(value) ~= "string" then return nil, nil, setting.field .. " must be a string" end
                value = trim(value)
                if value == "" then value = nil end
            else
                if type(value) ~= "number" or value ~= value or value == math.huge or value == -math.huge then
                    return nil, nil, setting.field .. " must be a finite number"
                end
                if setting.kind == "integer" and (value < 1 or value % 1 ~= 0) then
                    return nil, nil, setting.field .. " must be a positive integer"
                end
            end
        end
        if value == nil then value = setting.default end
        resolved[setting.field] = value
    end
    local system = resolved.prompt
    resolved.prompt = nil
    return resolved, system, nil
end

function M.build_prompt(config: any, env: any): (string?, string?, string?)
    local options, system, err = M.generation_options(config)
    if err or not options then return nil, nil, err end
    return system, options.model, nil
end

function M.user_text(env: any): string
    local e = type(env) == "table" and env or {}
    local payload = (e :: { [string]: any }).payload
    if payload == nil then payload = (e :: { [string]: any }).input end
    if payload == nil then payload = {} end
    return json.encode(payload)
end

-- llm.generate returns its text on the declared `result` field. Empty text
-- maps to absent; a failed call is retriable infrastructure work. The declared
-- resources (covering any tool ids) are authorized before the call; the model
-- is a catalog choice that needs no grant (A31). llm.generate binds the
-- ambient execution identity itself, so the call runs under the execution
-- actor/scope with no explicit propagation on the wrapper contract.
function M.apply(config: any, env: any, authorization: any): (any, string?, string?)
    local c = type(config) == "table" and config or {}
    local options, system, config_err = M.generation_options(c)
    if config_err or not options then return nil, config_err, "invalid_configuration" end
    local ok, amsg, acode = strategy_reference.authorize(M.describe, c, authorization)
    if not ok then return nil, amsg, acode end

    local p = prompt.new()
    p:add_system(system :: string)
    p:add_user(M.user_text(env))
    local resp, lerr = llm.generate(p, options)
    if lerr ~= nil or resp == nil then
        return nil, "llm transform failed: " .. tostring(lerr), "strategy_failed"
    end
    local text = ""
    if type(resp) == "table" then text = tostring((resp :: { [string]: any }).result or "") end
    if text == "" then return nil, nil, nil end
    return text, nil, nil
end

-- describe declares the ACL resources the configuration uses
-- (config.resources, which cover its tool_ids); the model is a catalog
-- choice, not a resource, and needs no grant (A31). A tool outside the
-- declared resources cannot be enforced.
function M.describe(config: any): ({ any }?, string?)
    local _, _, config_err = M.generation_options(config)
    if config_err then return nil, config_err end
    local out: { any } = {}
    local extra_err = strategy_reference.declared(config, "llm", out)
    if extra_err then return nil, extra_err end
    local tools_err = strategy_reference.tools_covered(config, out, "llm")
    if tools_err then return nil, tools_err end
    return out, nil
end

M.bind_apply, M.bind_describe = strategy_reference.binding(M)

return M
