-- PATCH /api/v1/automations/{id} — rename an automation in place by updating
-- its public meta title/comment through the canonical component set_meta.
--
-- Body { title?, description? }. Only the provided keys are written; at least
-- one must be present. WRITE access on the component is required before any
-- mutation; this is domain access on the specific automation, not a role check.

local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local api_errors = require("api_errors")

-- Build the meta field set from the request body. title must be a non-empty
-- trimmed string; description may be any string (empty clears the rendered
-- subtitle). Returns (fields, err); err is set when a provided value is the
-- wrong type or no recognized key is present.
local function build_fields(body: any): ({ [string]: any }?, string?)
    if type(body) ~= "table" then
        return nil, "invalid json"
    end

    local fields: { [string]: any } = {}

    if (body :: any).title ~= nil then
        local title = (body :: any).title
        if type(title) ~= "string" then
            return nil, "title must be a string"
        end
        title = title:match("^%s*(.-)%s*$")
        if title == "" then
            return nil, "title must be a non-empty string"
        end
        fields.title = title
    end

    if (body :: any).description ~= nil then
        local description = (body :: any).description
        if type(description) ~= "string" then
            return nil, "description must be a string"
        end
        fields.comment = description
    end

    if next(fields) == nil then
        return nil, "title or description is required"
    end

    return fields, nil
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = api_errors.error("authentication_required", "authentication required") })
        return
    end

    local component_id = req:param("id")
    if type(component_id) ~= "string" or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("missing_parameter", "component id is required") })
        return
    end

    -- Require WRITE access before mutating public meta. Same component access
    -- gate the other automation {id} endpoints use, scaled to the operation.
    local _, access_err = component.validate_access(component_id :: string, component.ACCESS.WRITE)
    if access_err then
        local status, payload = api_errors.status(access_err, "access_denied", "write access required")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("invalid_request_body", "invalid request body") })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("invalid_json", "invalid JSON") })
        return
    end

    local fields, fields_err = build_fields(body)
    if fields_err or not fields then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("invalid_input", fields_err) })
        return
    end

    local ok, set_err = component.set_meta(component_id :: string, fields)
    if not ok then
        local status, payload = api_errors.status(set_err, "metadata_update_failed", "rename failed")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = component_id,
        title = fields.title,
    })
end

return { handler = handler }
