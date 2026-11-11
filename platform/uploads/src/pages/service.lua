-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local source = require("source")
local image = require("image")
local content = require("content")
local page_bytes = require("page_bytes")
local binding_errors = require("binding_errors")
local types = require("types")
local M = {}

local function invalid(message: string): error
    return binding_errors.new(errors.INVALID, message, "invalid_page_request")
end

local function render(snapshot: types.PageSnapshot, bytes: string, page: integer?): (types.PageRenderResult?, error?)
    local request: types.PageRenderRequest = {ref = {storage_id = snapshot.location.storage_id :: string,
        storage_path = snapshot.location.storage_path :: string, bytes = bytes}, count_only = page == nil}
    if page then request.pages = {page}; request.dpi = 150; request.format = "jpeg"; request.quality = 90 end
    local response, err = funcs.call(snapshot.renderer.processor_func :: string, request)
    if err then return nil, binding_errors.from(err, errors.UNAVAILABLE, "page_render_failed") end
    if type(response) ~= "table" then
        return nil, binding_errors.new(errors.INVALID, "Page renderer returns an invalid envelope", "page_renderer_response_invalid")
    end
    if response.err ~= nil then
        if type(response.err) == "userdata" then
            return nil, binding_errors.from(response.err, errors.UNAVAILABLE, "page_render_failed")
        end
        if type(response.err) ~= "table" or type(response.err.message) ~= "string" then
            return nil, binding_errors.new(errors.INVALID, "Page renderer returns an invalid error", "page_renderer_response_invalid")
        end
        return nil, binding_errors.new(errors.UNAVAILABLE, response.err.message, "page_render_failed", true)
    end
    if type(response.ok) ~= "table" then
        return nil, binding_errors.new(errors.INVALID, "Page renderer returns an invalid envelope", "page_renderer_response_invalid")
    end
    local total = response.ok.total
    if type(total) ~= "number" or total < 1 or total >= math.huge or total % 1 ~= 0 then
        return nil, binding_errors.new(errors.INVALID, "Page renderer returns an invalid count", "page_renderer_response_invalid")
    end
    return response, nil
end

local function still_current(snapshot: types.PageSnapshot): error?
    local current, err = source.snapshot(snapshot.upload.uuid)
    if err then return err end
    if current.revision ~= snapshot.revision then
        return binding_errors.new(errors.INVALID, "Page source revision changes", "revision_mismatch")
    end
    return nil
end

function M.get_info(req: types.PageInfoRequest): (types.PageInfo?, error?)
    if type(req) ~= "table" or type(req.upload_id) ~= "string" or req.upload_id == "" then return nil, invalid("Upload ID is required") end
    local cursor = req.cursor
    if cursor == nil then cursor = 1 end
    if type(cursor) ~= "number" or cursor < 1 or cursor >= math.huge or cursor % 1 ~= 0 then return nil, invalid("Cursor must be a positive page") end
    if req.cursor and (type(req.revision) ~= "string" or req.revision == "") then return nil, invalid("Cursor requires a revision") end
    local snapshot, err = source.snapshot(req.upload_id)
    if err then return nil, err end
    local limits = assert(image.limits())
    if snapshot.state ~= "paged" then return {state = snapshot.state, limits = limits}, nil end
    if req.revision and req.revision ~= snapshot.revision then
        return nil, binding_errors.new(errors.INVALID, "Page source revision changes", "revision_mismatch")
    end
    local bytes, source_err = page_bytes.read(snapshot.location :: types.PageLocation, 134217728,
        "page_source_limit_exceeded", snapshot.source.checksum)
    if source_err then return nil, source_err end
    local counted, count_err = render(snapshot, bytes :: string)
    if count_err then return nil, count_err end
    local total = counted.ok.total
    if cursor > total then return nil, invalid("Cursor is outside the document") end
    local pages: {types.PageEntry} = {}
    local last = math.min(total, cursor + 127)
    for page = cursor, last do
        pages[#pages + 1] = {page = page, state = source.stored(snapshot, page) and "available" or "renderable"}
    end
    local current_err = still_current(snapshot)
    if current_err then return nil, current_err end
    return {state = "paged", page_count = total, revision = snapshot.revision, text = snapshot.text,
        pages = pages, next_cursor = last < total and last + 1 or nil, limits = limits}, nil
end

function M.read_image(req: types.PageReadRequest): (types.PageImage?, error?)
    if type(req) ~= "table" or type(req.upload_id) ~= "string" or req.upload_id == ""
        or type(req.page) ~= "number" or req.page < 1 or req.page >= math.huge or req.page % 1 ~= 0
        or type(req.revision) ~= "string" or req.revision == "" then return nil, invalid("Upload, page and revision are required") end
    local limits, limit_err = image.limits(req)
    if limit_err then return nil, limit_err end
    local snapshot, err = source.snapshot(req.upload_id)
    if err then return nil, err end
    if snapshot.state ~= "paged" then
        return nil, binding_errors.new(errors.INVALID, "Upload has no readable page mapping", snapshot.state)
    end
    if req.revision ~= snapshot.revision then
        return nil, binding_errors.new(errors.INVALID, "Page source revision changes", "revision_mismatch")
    end
    local source_bytes, source_err = page_bytes.read(snapshot.location :: types.PageLocation, 134217728,
        "page_source_limit_exceeded", snapshot.source.checksum)
    if source_err then return nil, source_err end
    local counted, count_err = render(snapshot, source_bytes :: string)
    if count_err then return nil, count_err end
    if req.page > counted.ok.total then return nil, invalid("Page is outside the document") end
    local before_render_err = still_current(snapshot)
    if before_render_err then return nil, before_render_err end
    local artifact = source.stored(snapshot, req.page)
    local bytes: string?
    local mime: string?
    if artifact then
        local location, location_err = content.resolve_storage(artifact)
        if location_err then return nil, binding_errors.from(location_err, errors.UNAVAILABLE, "page_image_storage_failed") end
        local read_err
        bytes, read_err = page_bytes.read(location :: types.PageLocation, limits.max_bytes,
            "page_image_limit_exceeded")
        if read_err then return nil, read_err end
        mime = artifact.mime_type
    else
        local rendered, render_err = render(snapshot, source_bytes :: string, req.page)
        if render_err then return nil, render_err end
        local pages = rendered.ok.pages
        if rendered.ok.total ~= counted.ok.total or type(pages) ~= "table" or #pages ~= 1
            or type(pages[1]) ~= "table" or pages[1].page ~= req.page or type(pages[1].bytes) ~= "string" then
            return nil, binding_errors.new(errors.INVALID, "Page renderer returns an invalid page", "page_renderer_response_invalid")
        end
        bytes = pages[1].bytes
        mime = pages[1].format == "png" and "image/png" or pages[1].format == "jpeg" and "image/jpeg" or ""
    end
    local result, image_err = image.validate(bytes :: string, mime or "", limits, req.page, req.revision, artifact and artifact.checksum)
    if image_err then return nil, image_err end
    local current_err = still_current(snapshot)
    if current_err then return nil, current_err end
    return result, nil
end

return M
