-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local reader = require("inbox_reader")
local files = require("inbox_files")
local http_errors = require("http_errors")

local function handler()
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "no http context" end
    local function fail(err: any): any
        if files.locked(err) then
            err = errors.new({ kind = errors.PERMISSION_DENIED, message = "file access denied" })
        end
        res:set_content_type(http.CONTENT.JSON)
        res:set_status(http_errors.for_error(err))
        res:write_json(http_errors.response(err))
    end
    local raw_index = req:param("index")
    local index = tonumber(raw_index or "")
    if not index or index < 1 or index % 1 ~= 0 then
        return fail(errors.new({ kind = errors.INVALID, message = "invalid file index" }))
    end
    local item, read_err = reader.get((req:param("id")) or "")
    if read_err then return fail(read_err) end
    local ref = item and item.files and item.files[index]
    if not ref then
        return fail(errors.new({ kind = errors.NOT_FOUND, message = "file not found" }))
    end
    local provider, open_err = files.open(ref)
    if open_err then return fail(open_err) end
    -- The content provider checks the current viewer on every byte request.
    local content, err = provider:get_content({ format = "raw" })
    if err then return fail(err) end
    if type(content) ~= "table" or content.success == false or type(content.content) ~= "string" or type(content.content_type) ~= "string" then
        return fail(content and content.error or errors.new({ kind = errors.INTERNAL, message = "file content unavailable" }))
    end
    res:set_header("Cache-Control", "no-store")
    res:set_header("X-Content-Type-Options", "nosniff")
    res:set_header("Content-Disposition", "attachment")
    res:set_content_type(content.content_type)
    local _, write_err = res:write(content.content)
    if write_err then return nil, write_err end
end

return { handler = handler }
