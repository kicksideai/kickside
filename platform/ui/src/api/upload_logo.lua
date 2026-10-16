local http = require("http")
local security = require("security")
local branding = require("branding")
local ui_types = require("ui_types")

local MAX_BYTES = 2 * 1024 * 1024
local ALLOWED_EXT: { [string]: boolean } = ui_types.BRANDING_IMAGE_EXT

local function fail(res: any, status: number, message: string)
    res:set_status(status)
    res:write_json({ success = false, error = message })
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then return fail(res, http.STATUS.UNAUTHORIZED, "unauthorized") end

    if not req:is_content_type(http.CONTENT.MULTIPART) then
        return fail(res, http.STATUS.BAD_REQUEST, "request must be multipart/form-data")
    end

    local form, perr = req:parse_multipart(MAX_BYTES)
    if perr or not form then
        return fail(res, http.STATUS.BAD_REQUEST, "invalid upload: " .. tostring(perr))
    end
    local f: any = form
    if not f.files or not f.files.logo or #f.files.logo == 0 then
        return fail(res, http.STATUS.BAD_REQUEST, "missing 'logo' file field")
    end

    local part: any = f.files.logo[1]
    local filename = tostring(part:name() or "logo")
    local size = tonumber(part:size()) or 0
    local mime = tostring(part:header("Content-Type") or "")

    if size <= 0 then return fail(res, http.STATUS.BAD_REQUEST, "empty file") end
    if size > MAX_BYTES then return fail(res, http.STATUS.BAD_REQUEST, "file too large (max 2MB)") end
    if not mime:match("^image/") then
        return fail(res, http.STATUS.BAD_REQUEST, "logo must be an image")
    end
    local ext = (filename:match("%.([%a%d]+)$") or ""):lower()
    if not ALLOWED_EXT[ext] then
        return fail(res, http.STATUS.BAD_REQUEST, "unsupported image type (png, jpg, webp, gif)")
    end

    local fstream, serr = part:stream()
    if serr or not fstream then
        return fail(res, http.STATUS.INTERNAL_ERROR, "stream failed: " .. tostring(serr))
    end

    local bytes, rerr = fstream:read(MAX_BYTES + 1)
    local closed, close_err = fstream:close()
    if rerr or not bytes then return fail(res, http.STATUS.INTERNAL_ERROR, "read failed: " .. tostring(rerr)) end
    if not closed then return fail(res, http.STATUS.INTERNAL_ERROR, "close failed: " .. tostring(close_err)) end
    if #bytes == 0 or #bytes > MAX_BYTES then return fail(res, http.STATUS.BAD_REQUEST, "invalid file size") end
    branding.save(bytes, mime)
    local name = "logo." .. ext

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        url = branding.url(),
        filename = name,
        size = size,
    })
end

return { handler = handler }
