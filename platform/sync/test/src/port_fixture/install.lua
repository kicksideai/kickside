-- Harness-only install of a sync fixture as the calling user: the automation
-- engine's one install path creates it, then the owner grants `grantee` full
-- access so suites running as the test runner operate on the same component.

local automations_lib = require("automations_lib")
local component = require("component")

local function install(args: any): (any, any)
    if type(args.reference_components) == "table" then
        local reference_service, service_err = component.get_service()
        if service_err or not reference_service then return nil, service_err end
        for _, reference_id in ipairs(args.reference_components) do
            local registered, register_err = reference_service:register({
                component_id = reference_id,
                impl_id = "app.fixture:store_sink",
                meta = { title = "Fixture destination" },
                additional_access = { { subject_id = args.grantee, subject_type = "user",
                    access_mask = component.ACCESS.FULL } },
            })
            if register_err or type(registered) ~= "table" or registered.success == false then
                return nil, register_err or registered.error
            end
        end
    end
    local installed, install_err = automations_lib.install_type(args.type_id, args.input)
    if install_err ~= nil then return nil, install_err end
    if type(installed) ~= "table" then return nil, "install returned no automation" end
    local id = tostring(installed.id)
    local svc, svc_err = component.get_service()
    if svc_err or not svc then return nil, tostring(svc_err) end
    local granted, grant_err = svc:grant_subtree({
        root_component_id = id,
        subject = { subject_id = args.grantee, subject_type = "user" },
        access_mask = component.ACCESS.FULL,
    })
    if grant_err or type(granted) ~= "table" or granted.success == false then
        return nil, tostring(grant_err or granted.error)
    end
    return { id = id }, nil
end

return { install = install }
