-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local hash = require("hash")
local types = require("types")
local binding_errors = require("binding_errors")
local M = {}

function M.limits(req: types.PageLimitRequest?): (types.PageLimits?, error?)
    local limits: types.PageLimits = {max_pages = 1, max_bytes = 4194304, max_width = 4096, max_height = 4096,
        formats = {"image/png", "image/jpeg"}}
    for _, key in ipairs({"max_bytes", "max_width", "max_height"}) do
        local value = req and req[key]
        if value ~= nil then
            if type(value) ~= "number" or value < 1 or value % 1 ~= 0 or value > limits[key] then
                return nil, binding_errors.new(errors.INVALID, "Image limits must tighten the contract ceilings", "invalid_page_request")
            end
            limits[key] = value
        end
    end
    return limits, nil
end

local function uint(bytes: string, offset: integer, length: integer): integer
    local value = 0
    for i = offset, offset + length - 1 do value = value * 256 + (bytes:byte(i) or 0) end
    return value
end

local function dimensions(bytes: string): (integer?, integer?, string?)
    if bytes:sub(1, 8) == "\137PNG\13\10\26\10" and #bytes >= 45
        and uint(bytes, 9, 4) == 13 and bytes:sub(13, 16) == "IHDR"
        and bytes:sub(-12) == "\0\0\0\0IEND\174\66\96\130" then
        return uint(bytes, 17, 4), uint(bytes, 21, 4), "image/png"
    end
    if bytes:sub(1, 2) ~= "\255\216" or bytes:sub(-2) ~= "\255\217" then return nil, nil, nil end
    local pos = 3
    while pos + 3 <= #bytes do
        if bytes:byte(pos) ~= 255 then return nil, nil, nil end
        while bytes:byte(pos) == 255 do pos = pos + 1 end
        local marker = bytes:byte(pos)
        if not marker or marker == 218 or marker == 217 then return nil, nil, nil end
        pos = pos + 1
        local length = uint(bytes, pos, 2)
        if length < 2 or pos + length - 1 > #bytes then return nil, nil, nil end
        if marker >= 192 and marker <= 207 and marker ~= 196 and marker ~= 200 and marker ~= 204 then
            if length < 8 then return nil, nil, nil end
            return uint(bytes, pos + 5, 2), uint(bytes, pos + 3, 2), "image/jpeg"
        end
        pos = pos + length
    end
    return nil, nil, nil
end

function M.validate(bytes: string, mime: string, limits: types.PageLimits, page: integer, revision: string,
    expected_checksum: string?): (types.PageImage?, error?)
    if #bytes > limits.max_bytes then
        return nil, binding_errors.new(errors.INVALID, "Page image exceeds byte limit", "page_image_limit_exceeded")
    end
    local width, height, detected = dimensions(bytes)
    if not width or not height or not detected or detected ~= mime then
        return nil, binding_errors.new(errors.INVALID, "Page image has an unsupported or invalid header", "page_image_format_unsupported")
    end
    if width < 1 or height < 1 or width > limits.max_width or height > limits.max_height then
        return nil, binding_errors.new(errors.INVALID, "Page image exceeds dimension limit", "page_image_limit_exceeded")
    end
    local checksum, checksum_err = hash.sha256(bytes)
    if checksum_err then return nil, checksum_err end
    if expected_checksum and checksum ~= expected_checksum then
        return nil, binding_errors.new(errors.INVALID, "Page image checksum changes", "revision_mismatch")
    end
    return {bytes = bytes, page = page, revision = revision, size = #bytes, mime_type = detected,
        width = width, height = height, image_checksum = checksum}, nil
end

return M
