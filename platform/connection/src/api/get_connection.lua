-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local component = require("component")
local envelope = require("envelope")
local fields = require("secret_fields")
local component_types = require("component_types")
local http_errors = require("http_errors")

local function handler()
    local request, response = http.request(), http.response()
    if not request or not response then return nil, errors.new({kind = errors.INTERNAL, message = "HTTP context unavailable"}) end
    response:set_content_type(http.CONTENT.JSON)
    local id = request:param("id")
    local service, service_err = component.get_service()
    local result, read_err
    if service then
        result, read_err = service:get_access_context({component_id = id, include_context = true,
            access_mask = component.ACCESS.READ})
    else read_err = service_err end
    if not read_err then read_err = envelope.error_of(result, "get_access_context") end
    local declarations = result and result.secret_fields
    local presence, presence_err
    if not read_err then presence, presence_err = fields.presence(declarations :: component_types.SecretField[], result.context or {}) end
    read_err = read_err or presence_err
    if read_err then
        response:set_status((http_errors.classify(read_err)))
        response:write_json({success = false, error = tostring(read_err)})
        return
    end
    response:set_status(http.STATUS.OK)
    response:write_json({success = true, component_id = result.id, context_revision = result.context_revision,
        secret_fields = declarations, secrets = presence})
end

return {handler = handler}
