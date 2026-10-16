-- GET /components/access-model — the canonical capability vocabulary the share
-- UI renders. Sourced straight from the component access types so the UI never
-- invents access semantics (no fake roles): the access mask is exactly these
-- bits OR-ed together.
local http = require("http")
local component_types = require("component_types")
local http_context = require("http_context")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local component_types = deps.component_types or component_types

    local function handler()
        local res, _, context_err = http_context.require(http, false)
        if context_err then return nil, context_err end
        local A = component_types.ACCESS
        res:set_header("Cache-Control", "no-store")
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            capabilities = {
                { bit = A.READ,   key = "read",   label = "Read",   description = "View this item" },
                { bit = A.WRITE,  key = "write",  label = "Write",  description = "Edit this item" },
                { bit = A.DELETE, key = "delete", label = "Delete", description = "Delete this item" },
                { bit = A.ADMIN,  key = "admin",  label = "Admin",  description = "Manage access and sharing" },
            },
        })
    end

    return { handler = handler }
end

local default = new()
default.new = new
return default
