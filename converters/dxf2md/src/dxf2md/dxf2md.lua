type Error = {
    message: string,
    kind: string,
    retryable: boolean,
}

type SourceRequest = {
    bytes: string?,
    url: string?,
}

type Runtime = {
    funcs: any?,
    http_client: any?,
}

local PREFIX = "kickside.convert.dxf2md: "
local TO_MARKDOWN = "kickside.convert.dxf2md:to_markdown"
local METADATA = "kickside.convert.dxf2md:metadata"
local TO_IMAGE = "kickside.convert.dxf2md:to_image"

local DEFAULT_DPI = 96
local MAX_DPI = 600
local MAX_DIM = 4000
local MAX_INPUT_BYTES = 128 * 1024 * 1024
local DOWNLOAD_TIMEOUT = "30s"
local ALLOWED_SCHEME = "^https?://"

local RETRYABLE_KIND = {
    download_failed = true,
    internal = true,
}

local ERROR_MT = {
    __tostring = function(self: Error): string
        return self.message
    end,
    __concat = function(left: any, right: any): string
        return tostring(left) .. tostring(right)
    end,
}

local function make_error(kind: string, message: string): Error
    return setmetatable({
        message = message,
        kind = kind,
        retryable = RETRYABLE_KIND[kind] == true,
    }, ERROR_MT)
end

local function fail(kind: string, message: string): Error
    return make_error(kind, PREFIX .. message)
end

local function validate_dpi(value: any): (number?, string?)
    if value == nil then
        return DEFAULT_DPI, nil
    end

    if type(value) ~= "number" or value <= 0 or value > MAX_DPI then
        return nil, "dpi must be a positive number no greater than " .. tostring(MAX_DPI)
    end

    return value, nil
end

-- A pixel dimension is optional; when set it must be a positive integer within the
-- render canvas bounds. Returns 0 (meaning "unset") when the value is nil.
local function validate_dim(name: string, value: any): (number?, string?)
    if value == nil then
        return 0, nil
    end

    if type(value) ~= "number" or value <= 0 or value > MAX_DIM or value % 1 ~= 0 then
        return nil, name .. " must be a positive integer no greater than " .. tostring(MAX_DIM)
    end

    return value, nil
end

-- Normalize the to_image argument into the WIT render-options record. A table may
-- set { dpi, width, height }; any other non-nil value is taken as dpi. width/height
-- in pixels override dpi; a single one keeps the drawing's aspect ratio.
local function validate_render_options(opts: any): (any, string?)
    local dpi_in: any = nil
    local width_in: any = nil
    local height_in: any = nil

    if type(opts) == "table" then
        dpi_in = opts.dpi
        width_in = opts.width
        height_in = opts.height
    else
        dpi_in = opts
    end

    local dpi, dpi_err = validate_dpi(dpi_in)
    if dpi_err ~= nil then
        return nil, dpi_err
    end

    local width, w_err = validate_dim("width", width_in)
    if w_err ~= nil then
        return nil, w_err
    end

    local height, h_err = validate_dim("height", height_in)
    if h_err ~= nil then
        return nil, h_err
    end

    return { dpi = dpi, width = width, height = height }, nil
end

local function new(runtime: Runtime?): any
    local deps = runtime or {}
    local funcs = deps.funcs or require("funcs")
    local http_client = deps.http_client or require("http_client")

    local function download(url: string): (string?, string?)
        local resp, err = http_client.get(url, {
            timeout = DOWNLOAD_TIMEOUT,
            max_response_body = MAX_INPUT_BYTES,
        })
        if err ~= nil then
            return nil, "download failed: " .. tostring(err)
        end

        if resp == nil then
            return nil, "download failed: empty response"
        end

        local status = resp.status_code or 0
        if status < 200 or status >= 300 then
            return nil, "download failed: HTTP " .. tostring(status)
        end

        local final_url = resp.url
        if type(final_url) == "string" and not final_url:match(ALLOWED_SCHEME) then
            return nil, "download failed: redirected to a disallowed scheme"
        end

        local body = resp.body
        if type(body) ~= "string" or #body == 0 then
            return nil, "download failed: empty body"
        end

        if #body > MAX_INPUT_BYTES then
            return nil, "download failed: response exceeds " .. tostring(MAX_INPUT_BYTES) .. " bytes"
        end

        return body, nil
    end

    local function resolve_source(request: SourceRequest): (string?, Error?)
        if type(request) ~= "table" then
            return nil, fail("invalid_input", "request must be a table")
        end

        local has_bytes = request.bytes ~= nil
        local has_url = request.url ~= nil
        if has_bytes == has_url then
            return nil, fail("invalid_input", "request must set exactly one source: bytes or url")
        end

        local blob: string
        if has_url then
            if type(request.url) ~= "string" or #request.url == 0 then
                return nil, fail("invalid_input", "url must be a non-empty string")
            end
            if not request.url:match(ALLOWED_SCHEME) then
                return nil, fail("invalid_input", "url must be an http(s) URL")
            end

            local body, derr = download(request.url)
            if derr ~= nil then
                return nil, fail("download_failed", derr)
            end
            blob = body :: string
        else
            if type(request.bytes) ~= "string" or #request.bytes == 0 then
                return nil, fail("invalid_input", "bytes must be a non-empty binary string")
            end
            blob = request.bytes :: string
        end

        if #blob > MAX_INPUT_BYTES then
            return nil, fail("invalid_input", "input exceeds " .. tostring(MAX_INPUT_BYTES) .. " bytes")
        end

        return blob, nil
    end

    local function open(request: SourceRequest): (any, Error?)
        local blob, src_err = resolve_source(request)
        if src_err ~= nil then
            return nil, src_err
        end

        local function to_markdown(): (string?, Error?)
            local res, call_err = funcs.call(TO_MARKDOWN, blob)
            if call_err ~= nil then
                return nil, make_error("internal", tostring(call_err))
            end

            if type(res) ~= "table" then
                return nil, fail("internal", "converter returned no result")
            end

            if res.err ~= nil then
                local message = (type(res.err) == "table" and res.err.message) or tostring(res.err)
                return nil, make_error("decode_failed", message)
            end

            local markdown = res.ok
            if type(markdown) ~= "string" then
                return nil, fail("internal", "unexpected markdown result")
            end

            return markdown, nil
        end

        local function metadata(): (any, Error?)
            local res, call_err = funcs.call(METADATA, blob)
            if call_err ~= nil then
                return nil, make_error("internal", tostring(call_err))
            end

            if type(res) ~= "table" then
                return nil, fail("internal", "converter returned no result")
            end

            if res.err ~= nil then
                local message = (type(res.err) == "table" and res.err.message) or tostring(res.err)
                return nil, make_error("decode_failed", message)
            end

            local meta = res.ok
            if type(meta) ~= "table" then
                return nil, fail("internal", "unexpected metadata result")
            end

            return meta, nil
        end

        -- opts is optional: a number is taken as dpi, or a table { dpi, width, height }.
        local function to_image(opts: any): (string?, Error?)
            local options, opt_err = validate_render_options(opts)
            if opt_err ~= nil then
                return nil, fail("invalid_input", opt_err)
            end

            local res, call_err = funcs.call(TO_IMAGE, blob, options)
            if call_err ~= nil then
                return nil, make_error("internal", tostring(call_err))
            end

            if type(res) ~= "table" then
                return nil, fail("internal", "converter returned no result")
            end

            if res.err ~= nil then
                local message = (type(res.err) == "table" and res.err.message) or tostring(res.err)
                return nil, make_error("render_failed", message)
            end

            local png = res.ok
            if type(png) ~= "string" then
                return nil, fail("internal", "unexpected render result")
            end

            return png, nil
        end

        return { to_markdown = to_markdown, metadata = metadata, to_image = to_image }, nil
    end

    return { open = open }
end

local default = new()

return {
    open = default.open,
    new = new,
    limits = { max_input_bytes = MAX_INPUT_BYTES },
}
