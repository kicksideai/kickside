-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local query = require("query")
local parts = require("parts")
local content = require("content")
local rasterizer = require("rasterizer")
local original_read = require("original_read")
local canonical_json = require("canonical_json")
local binding_errors = require("binding_errors")
local types = require("types")
local M = {}

function M.snapshot(upload_id: string): (types.PageSnapshot?, error?)
    local row, lookup_err = query.get(upload_id)
    if lookup_err then return nil, lookup_err end
    local upload = row :: types.PageUpload
    local _, access_err = original_read.authorize(upload)
    if access_err then return nil, access_err end
    local state = "paged"
    local mime = upload.mime_type or ""
    local metadata = upload.metadata or {}
    if mime:sub(1, 6) == "image/" or (mime:sub(1, 5) == "text/" and mime ~= "text/rtf")
        or mime:sub(1, 6) == "audio/" or mime:sub(1, 6) == "video/" or types.NON_PAGED_MIME_TYPES[mime] then
        state = "not_paged"
    elseif metadata.parent_upload_id ~= nil then
        state = "page_mapping_unavailable"
    end
    if state ~= "paged" then return {upload = upload, artifacts = {}, state = state}, nil end
    local renderer, discovery_err = rasterizer.find_by_mime(mime)
    if discovery_err then return nil, discovery_err end
    if not renderer then state = "unsupported" end
    if state ~= "paged" then return {upload = upload, artifacts = {}, renderer = renderer, state = state}, nil end
    local rows, list_err = parts.list_artifacts(upload_id)
    if list_err then return nil, binding_errors.from(list_err, errors.UNAVAILABLE, "page_source_lookup_failed") end
    local artifacts = rows :: {types.PageArtifact}
    local primary, primary_err = parts.get_primary_content_artifact(upload_id)
    if primary_err and not errors.is(primary_err, errors.NOT_FOUND) then
        return nil, binding_errors.from(primary_err, errors.UNAVAILABLE, "page_source_lookup_failed")
    end
    local source: types.PageArtifact?
    for _, artifact in ipairs(artifacts) do
        if artifact.role == "source" and (not primary or artifact.artifact_id == primary.parent_artifact_id) then
            if source then return nil, binding_errors.new(errors.INVALID, "Page source is ambiguous", "source_unavailable") end
            source = artifact
        end
    end
    if not source or not source.checksum or source.checksum == "" then
        return nil, binding_errors.new(errors.NOT_FOUND, "Page source revision is unavailable", "source_unavailable")
    end
    if upload.content_sha256 and upload.content_sha256 ~= "" and upload.content_sha256 ~= source.checksum then
        return nil, binding_errors.new(errors.INVALID, "Text and page source revisions differ", "revision_mismatch")
    end
    local text: types.PageText?
    if primary then
        local locator = primary.locator or {}
        if locator.source_checksum and locator.source_checksum ~= source.checksum then
            return nil, binding_errors.new(errors.INVALID, "Text and page source revisions differ", "revision_mismatch")
        end
        if not primary.checksum or primary.checksum == "" then
            return nil, binding_errors.new(errors.INVALID, "Text revision is unavailable", "revision_mismatch")
        end
        text = {artifact_id = primary.artifact_id, checksum = primary.checksum}
    end
    local location, location_err = content.resolve_storage(source)
    if location_err then return nil, binding_errors.from(location_err, errors.NOT_FOUND, "source_unavailable") end
    local revision, revision_err = canonical_json.hash({upload_id = upload_id, source_id = source.artifact_id,
        source_checksum = source.checksum, text = text})
    if revision_err then return nil, revision_err end
    return {upload = upload, source = source, artifacts = artifacts, text = text,
        revision = revision, renderer = renderer, state = state, location = location :: types.PageLocation}, nil
end

function M.stored(snapshot: types.PageSnapshot, page: integer): types.PageArtifact?
    for _, artifact in ipairs(snapshot.artifacts) do
        local locator = artifact.locator or {}
        -- A source id alone cannot bind a rendition after an artifact is updated.
        if artifact.role == "rendered-page" and artifact.parent_artifact_id == snapshot.source.artifact_id
            and locator.type == "rasterize.page" and locator.page == page
            and locator.source_artifact_id == snapshot.source.artifact_id
            and locator.source_checksum == snapshot.source.checksum and artifact.checksum then
            return artifact
        end
    end
    return nil
end

return M
