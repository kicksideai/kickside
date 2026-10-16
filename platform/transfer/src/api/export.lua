-- POST /api/v1/transfer/export  { "component_ids": [...] }
--
-- Packs the actor's selected components (shell + backing data) into one KXB1 bundle
-- and returns it as an octet-stream download. ADMIN on each component is enforced
-- downstream by component_service.export_component; secrets never enter the bundle.

local http = require("http")
local json = require("json")
local fs = require("fs")
local security = require("security")
local orchestrator = require("orchestrator")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end

    local actor = security.actor()
    if not actor then
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, berr = json.decode(raw)
    if berr or type(body) ~= "table" then
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid JSON body" })
        return
    end

    local ids = body.component_ids
    if type(ids) ~= "table" or #ids == 0 then
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "component_ids is required and must be a non-empty array" })
        return
    end

    -- The orchestrator stage-assembles the bundle to a scratch FILE (bounded memory at
    -- any KB size); we then stream that file to the client chunked and discard it.
    local info, err = orchestrator.export(ids)
    if not info then
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local storage, ferr = fs.get((info :: any).storage_id :: string)
    if ferr or not storage then
        local _, cleanup_err = orchestrator.discard(info)
        if cleanup_err then return nil, cleanup_err end
        return nil, ferr or errors.new({ kind = errors.UNAVAILABLE, message = "bundle storage unavailable" })
    end
    local f, oerr = storage:open((info :: any).path, "r")
    if oerr or not f then
        local _, cleanup_err = orchestrator.discard(info)
        if cleanup_err then return nil, cleanup_err end
        return nil, oerr or errors.new({ kind = errors.INTERNAL, message = "bundle open returns no file" })
    end

    -- Headers (incl. chunked transfer) must be set before the first body write.
    local filename = "kickside-export-" .. tostring(#ids) .. ".kxb"
    res:set_content_type("application/octet-stream")
    res:set_header("Content-Disposition", 'attachment; filename="' .. filename .. '"')
    res:set_header("X-Content-Type-Options", "nosniff")
    res:set_transfer("chunked")
    res:set_status(http.STATUS.OK)
    local stream_err = nil
    while true do
        local chunk, read_err = f:read(262144)
        if read_err then
            if not errors.is(read_err, errors.NOT_FOUND) then stream_err = read_err end
            break
        end
        if not chunk or chunk == "" then break end
        res:write(chunk :: string)
        res:flush()
    end
    local _, close_err = f:close()
    local _, cleanup_err = orchestrator.discard(info)
    if cleanup_err then return nil, cleanup_err end
    if close_err then return nil, close_err end
    if stream_err then return nil, stream_err end
    return true, nil
end

return { handler = handler }
