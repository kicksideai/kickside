-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- First-boot install of the hub modules named by the deployment. The same
-- Keeper plan + install path as the onboarding queue, run once on the server.
local M = {}

M.MAX_MODULES = 20
local SETUP_PREFIX = "registry:v1:"

local function valid_segment(value: string): boolean
    return #value >= 1 and #value <= 63 and value:match("^[a-z0-9][a-z0-9%-]*$") ~= nil
end

-- Returns the ordered unique module list, or nil and a message.
function M.parse(raw: any): ({string}?, string?)
    if type(raw) ~= "string" then return {}, nil end
    local out, seen = {}, {}
    for item in raw:gmatch("[^,]+") do
        local component = item:match("^%s*(.-)%s*$")
        if component ~= "" then
            local org, name = component:match("^([^/]+)/([^/]+)$")
            if not org or not valid_segment(org) or not valid_segment(name) then
                return nil, "invalid module id: " .. component
            end
            if not seen[component] then
                seen[component] = true
                out[#out + 1] = component
            end
        end
    end
    if #out > M.MAX_MODULES then return nil, "too many modules" end
    return out, nil
end

local function message(err: any): string
    if type(err) == "table" then return tostring(err.message or err.error or err.code or "failed") end
    return tostring(err or "failed")
end

local function blockers(plan: any): {string}
    local names, seen = {}, {}
    local function add(name: any)
        name = tostring(name or "unknown requirement")
        if not seen[name] then seen[name] = true; names[#names + 1] = name end
    end
    for _, id in ipairs(plan.missing_requirements or {}) do add(id) end
    for _, requirement in ipairs(plan.requirements or {}) do
        if requirement.missing or requirement.invalid then
            add(requirement.full_id or requirement.parameter_name or requirement.name)
        end
    end
    return names
end

local function setup_descriptors(plan: any): {string}
    local out = {}
    for _, requirement in ipairs(plan.requirements or {}) do
        if requirement.name == "required_setup" or requirement.short_name == "required_setup" then
            local value = tostring(requirement.value or "")
            if value == "" then value = tostring(requirement.default or "") end
            if value:sub(1, #SETUP_PREFIX) == SETUP_PREFIX then out[#out + 1] = value:sub(#SETUP_PREFIX + 1) end
        end
    end
    return out
end

local function ready(result: any): boolean
    return type(result) == "table" and result.success == true and result.ready == true and result.status == "ready"
end

local function finish_setup(deps: any, descriptors: {string}): (boolean, string?)
    for _, descriptor in ipairs(descriptors) do
        local status, status_err = deps.setup(descriptor, "status")
        if not status then return false, "Required setup status unavailable: " .. message(status_err) end
        if not ready(status) then
            if status.status == "building" then return false, "Required setup is still building" end
            local applied, apply_err = deps.setup(descriptor, "apply")
            if not ready(applied) then return false, "Required setup failed: " .. message(apply_err or applied) end
            local verified, verify_err = deps.setup(descriptor, "status")
            if not ready(verified) then return false, "Required setup did not become ready: " .. message(verify_err or verified) end
        end
    end
    return true, nil
end

local function install_one(deps: any, state: any, item: any, installed: boolean): (boolean, string?)
    if installed and (item.status == "installed" or item.status == "pending") then return true, nil end
    if not installed or item.descriptors == nil then
        local plan, plan_err = deps.plan({ component = item.component, run_migrations = true })
        if not plan then return false, message(plan_err) end
        local blocked = blockers(plan)
        if #blocked > 0 then return false, "Missing or invalid package settings: " .. table.concat(blocked, ", ") end
        item.descriptors = setup_descriptors(plan)
    end
    item.status = "installing"
    deps.write_state(state)
    if not installed then
        local result, install_err = deps.install({ component = item.component, migration_policy = "up" })
        if not result then return false, message(install_err) end
        if type(result) == "table" and result.success == false then return false, message(result) end
    end
    return finish_setup(deps, item.descriptors)
end

-- Readiness from the configured module list and the stored run state: nil when
-- the first-boot install is finished or not configured, else a reason.
function M.readiness(raw: any, state: any): string?
    local modules = M.parse(raw)
    if not modules then return "setup_failed" end
    if #modules == 0 then return nil end
    local stored = type(state) == "table" and state or {}
    if stored.source ~= table.concat(modules, ",") then return "installing_modules" end
    if stored.status == "completed" then return nil end
    if stored.status == "failed" then return "setup_failed" end
    return "installing_modules"
end

-- deps: env_modules(), read_state(), write_state(state), installed() -> set,
-- plan(args), install(args), setup(descriptor, action).
-- A run that finished for the same module list is not repeated. Failed modules
-- are tried again on the next start; installed modules are skipped.
function M.run(deps: any): (any?, string?)
    local raw = deps.env_modules() or ""
    local modules, parse_err = M.parse(raw)
    if not modules then
        deps.write_state({ source = raw, status = "failed", message = parse_err, modules = {} })
        return nil, parse_err
    end
    if #modules == 0 then return { status = "none" }, nil end

    local source = table.concat(modules, ",")
    local previous = deps.read_state() or {}
    if previous.source == source and previous.status == "completed" then return previous, nil end

    local state = { source = source, status = "running", modules = {} }
    local prior = {}
    for _, item in ipairs(previous.modules or {}) do prior[item.component] = item end
    for index, component in ipairs(modules) do
        state.modules[index] = prior[component] or { component = component, status = "pending" }
    end
    deps.write_state(state)

    local installed, installed_err = deps.installed()
    if not installed then
        state.status, state.message = "failed", message(installed_err)
        deps.write_state(state)
        return nil, state.message
    end

    local failed = 0
    for _, item in ipairs(state.modules) do
        local ok, err = install_one(deps, state, item, installed[item.component] == true)
        item.status = ok and "installed" or "failed"
        item.message = err
        if ok then item.descriptors = nil else failed = failed + 1 end
        deps.write_state(state)
    end

    state.status = failed == 0 and "completed" or "failed"
    deps.write_state(state)
    return state, nil
end

return M
