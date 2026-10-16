local http = require("http")
local json = require("json")
local registry = require("registry")
local component = require("component")
local conn_types = require("conn_types")
local create_policy = require("create_policy")

-- Authn + endpoint authz are enforced by the router firewall; the new component
-- is owned by the request's actor via the component service.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local fields, fields_err = create_policy.fields(body)
    if fields_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = fields_err })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    local impl_id = fields.impl_id :: string
    local meta = {
        title = fields.name :: string,
        comment = fields.description :: string,
        class = conn_types.CONNECTION_CLASS,
    }

    local binding_entry, binding_err = registry.get(impl_id)
    if binding_err or not create_policy.is_connection_binding(binding_entry, conn_types.CONNECTION_CONTRACT) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "impl_id must reference a connection binding" })
        return
    end
    if binding_entry.meta and binding_entry.meta.provider then
        meta.provider = binding_entry.meta.provider
    end

    local schema_err = create_policy.validate_private_context(binding_entry, fields.private_context)
    if schema_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = schema_err })
        return
    end

    -- A connection stores only its credentials -- it is shared transport and owns
    -- no execution identity. Background transports (the discord gateway, the DM
    -- reply) read the bot token at the system level; a DM runs as the linked user.
    local private_context = fields.private_context :: { [string]: any }

    local result, err = service:register({
        impl_id = impl_id,
        private_context = private_context,
        meta = meta,
    })

    if not result or not result.success then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = err or (result and result.error) or "creation failed" })
        return
    end

    local component_id = result.component_id :: string

    if fields.validate then
        local instance, open_err = component.open(component_id, component.ACCESS.WRITE, conn_types.CONNECTION_CONTRACT)
        if open_err or not instance then
            service:delete({ component_id = component_id })
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "created connection could not be opened: " .. tostring(open_err) })
            return
        end

        local test_result, test_err = instance:test_connection({})
        local failed = test_err ~= nil or (type(test_result) == "table" and test_result.success == false)
        if failed then
            service:delete({ component_id = component_id })
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "connection test failed: " .. tostring(test_err or (test_result and test_result.error) or "unknown") })
            return
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
    })
end

return { handler = handler }
