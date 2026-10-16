-- POST /api/v1/connections/{id}/discover_resources
--
-- Opens the per-instance kickside.connection:connection contract on the given
-- connection component and calls its discover_resources method. Used by the
-- source-bound KB wizard (wc-source-kb-quickstart) to populate resource
-- pickers with the LIVE list of upstream items (Confluence spaces, Jira
-- projects, GitHub repos, etc.) — not just the ones already configured.

local http = require("http")
local component = require("component")
local http_errors = require("http_errors")
local json = require("json")
local conn_types = require("conn_types")
local discovery_envelope = require("discovery_envelope")

-- Authn + endpoint authz are enforced by the router firewall. component.open
-- below performs domain READ access on the specific connection component.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local component_id = req:param("id")
    if type(component_id) ~= "string" or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "component_id is required" })
        return
    end

    -- Forward optional drill-down args from the request body so tree-shaped
    -- providers (Discord guild → channel, etc.) can return the right level.
    -- An empty/missing body is fine — providers fall back to the root list.
    local discover_args = {}
    local body = req:body()
    if type(body) == "string" and body ~= "" then
        local parsed, _ = json.decode(body)
        if type(parsed) == "table" then discover_args = parsed end
    end

    local instance, err = component.open(component_id, component.ACCESS.READ, conn_types.CONNECTION_CONTRACT)
    if err or not instance then
        local status = http_errors.classify(err)
        local msg = tostring(err or "cannot open connection")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local result, disc_err = instance:discover_resources(discover_args)
    if disc_err then
        res:set_status((http_errors.classify(disc_err)))
        res:write_json({ success = false, error = "discover failed: " .. tostring(disc_err) })
        return
    end

    -- The call reaching the provider is not the same as the provider reaching its
    -- product. A provider that could not authenticate reports it in the result, and
    -- passing that on as an empty success is how a rejected credential comes to look
    -- exactly like an account with nothing in it.
    if type(result) == "table" and (result :: any).success == false then
        local reason = tostring((result :: any).error or "the provider could not list its resources")
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = reason })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(discovery_envelope.build(component_id, result))
end

return { handler = handler }
