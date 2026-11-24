local env = require("env")
local time = require("time")
local logger = require("logger")
local installer = require("installer")
local state = require("state")
local hub_service = require("hub_service")
local planner = require("planner")
local required_setup = require("required_setup")

local log = logger:named("kickside.hub.first_boot")

local function main(): any
    local actor = "kickside.hub.first_boot:installer"
    local result, err = installer.run({
        env_modules = function() return env.get("kickside.hub.first_boot:install_modules") end,
        read_state = function()
            local value, read_err = state.read()
            if read_err then log:warn("first boot state read failed", { error = tostring(read_err) }) end
            return value
        end,
        write_state = function(value)
            value.updated_at = time.now():utc():format_rfc3339()
            local _, write_err = state.write(value)
            if write_err then log:warn("first boot state write failed", { error = tostring(write_err) }) end
        end,
        installed = function()
            local inventory, list_err = hub_service.list_dependencies({ include_entries = false, include_migrations = false })
            if not inventory then return nil, list_err end
            local set = {}
            for _, dependency in ipairs(inventory.dependencies or {}) do
                if dependency.component then set[dependency.component] = true end
            end
            for _, module in ipairs(inventory.modules or {}) do
                if module.name then set[module.name] = true end
            end
            return set
        end,
        plan = function(args) return planner.plan_install(args) end,
        install = function(args) return hub_service.install(args, { actor_id = actor }) end,
        setup = function(descriptor, action) return required_setup.invoke(descriptor, action) end,
    })
    if err then
        log:warn("first boot module install did not finish", { error = err })
    elseif result and result.status ~= "none" then
        log:info("first boot module install finished", { status = result.status })
    end
    return 0
end

return { main = main }
