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

local function install_one(deps: any, component: string): (boolean, string?)
    local plan, plan_err = deps.plan({ component = component, run_migrations = true })
    if not plan then return false, message(plan_err) end
    local blocked = blockers(plan)
    if #blocked > 0 then return false, "Missing or invalid package settings: " .. table.concat(blocked, ", ") end
    local result, install_err = deps.install({ component = component, migration_policy = "up" })
    if not result then return false, message(install_err) end
    if type(result) == "table" and result.success == false then return false, message(result) end
    for _, descriptor in ipairs(setup_descriptors(plan)) do
        local status = deps.setup(descriptor, "status")
        if not (status and status.ready and status.status == "ready") then
            local applied, apply_err = deps.setup(descriptor, "apply")
            if not applied then return false, "Required setup failed: " .. message(apply_err) end
        end
    end
    return true, nil
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
    for index, component in ipairs(modules) do
        state.modules[index] = { component = component, status = "pending" }
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
        if installed[item.component] then
            item.status = "installed"
        else
            item.status = "installing"
            deps.write_state(state)
            local ok, err = install_one(deps, item.component)
            item.status = ok and "installed" or "failed"
            item.message = err
            if not ok then failed = failed + 1 end
        end
        deps.write_state(state)
    end

    state.status = failed == 0 and "completed" or "failed"
    deps.write_state(state)
    return state, nil
end

-- The first-boot service is supervised. A recorded failed run must therefore
-- have the same non-zero process outcome as an infrastructure error, so the
-- supervisor can make its configured recovery attempts. A completed run and
-- an unconfigured deployment both exit cleanly.
function M.exit_code(result: any, err: any): number
    if err or (type(result) == "table" and result.status == "failed") then return 1 end
    return 0
end

return M
