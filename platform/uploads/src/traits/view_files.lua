type ArtifactError = string | error
local security = require("security")
local contract = require("contract")
local base64 = require("base64")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")

local DEFAULT_ARTIFACT_LIST_LIMIT = 20
local MAX_ARTIFACT_LIST_LIMIT = 50
local MAX_SELECTED_ARTIFACTS = 6
local DEFAULT_ARTIFACT_REF_LIMIT = 4

local function is_image_type(content_type)
    return type(content_type) == "string" and string.match(content_type, "^image/") ~= nil
end

local function clamp_int(value: any, default: integer, min: integer, max: integer): integer
    local n = tonumber(value) or default
    if n < min then n = min end
    if n > max then n = max end
    return math.floor(n)
end

local function image_artifact_summary(artifact: any): any
    local metadata = type(artifact.metadata) == "table" and artifact.metadata or {}
    return {
        upload_id = artifact.upload_id,
        artifact_id = artifact.artifact_id,
        kind = artifact.kind,
        role = artifact.role,
        filename = artifact.label,
        content_type = artifact.mime_type,
        size = artifact.size or metadata.size or metadata.original_size,
        width = metadata.width,
        height = metadata.height,
        ordinal = artifact.ordinal,
        occurrence_count = artifact.occurrence_count,
        duplicate_count = artifact.duplicate_count,
    }
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function list_image_artifacts(upload_id: string, args: any): (any?, integer?, ArtifactError?)
    local limit = clamp_int(args.artifact_limit, DEFAULT_ARTIFACT_LIST_LIMIT, 1, MAX_ARTIFACT_LIST_LIMIT)
    local offset = clamp_int(args.artifact_offset, 0, 0, 1000000000)
    local total, count_err = artifact_parts_repo.count_artifact_parts(upload_id, { images_only = true })
    if count_err then return nil, nil, count_err end
    local artifacts, list_err = artifact_parts_repo.list_artifact_parts(upload_id, limit, offset, { images_only = true })
    if list_err then return nil, nil, list_err end

    local images = {}
    for _, artifact in ipairs(artifacts or {}) do
        local mime_type = tostring(artifact.mime_type or "")
        if artifact.kind == "image" or is_image_type(mime_type) then
            images[#images + 1] = image_artifact_summary(artifact)
        end
    end
    local total_count: integer = math.floor(tonumber(total) or 0)
    return images, total_count, nil
end

local function artifact_ref_limit(ref: any): integer
    if type(ref) ~= "table" then return 1 end
    return clamp_int(ref.limit or ref.max_items, DEFAULT_ARTIFACT_REF_LIMIT, 1, MAX_SELECTED_ARTIFACTS)
end

-- Raw bytes must never reach the agent: JSON-escaped binary (e.g. \0) explodes
-- the token count and is unreadable, which kills the turn. Treat content as binary
-- when it carries NUL bytes or a high ratio of non-text control bytes in a sample.
local function looks_binary(content: string): boolean
    if type(content) ~= "string" or content == "" then return false end
    local sample = content:sub(1, 2048)
    if sample:find("\0", 1, true) then return true end
    local nonprint = 0
    for i = 1, #sample do
        local b = sample:byte(i)
        if b ~= 9 and b ~= 10 and b ~= 13 and (b < 32 or b == 127) then
            nonprint = nonprint + 1
        end
    end
    return (nonprint / #sample) > 0.10
end

-- Present file content: text returns whole; binary returns an actionable note
-- that points the agent at its extracted text and images via artifact_refs.
local function apply_content(result: any, content: string, content_type: string)
    result.total_size = #content
    if looks_binary(content) then
        result.content_omitted = true
        result.binary = true
        result.omitted_reason = "binary file (" .. (content_type ~= "" and content_type or "unknown type") .. ", " ..
            #content .. " bytes) -- not shown as text. If this is a document (PDF/DOCX/etc.), read its extracted " ..
            "text/images via artifact_refs, not the raw upload; raw bytes are not readable."
        return
    end
    result.content = content
end

local function apply_image_content(result: any, content: string)
    result.total_size = #content
    result.content = base64.encode(content)
end

local function parse_page(value: any): integer?
    local n = tonumber(value)
    if n and n >= 0 then return math.floor(n) end
    if type(value) == "string" then
        local found = value:match("[Pp]age%s*(%d+)")
        if found then return math.floor(tonumber(found) or 0) end
    end
    return nil
end

local function resolve_artifact_ref(upload_id: string, ref: any): (any?, string?)
    if type(ref) ~= "table" then return nil, "artifact reference must be an object" end

    local candidates: { any } = {}
    local artifact_id = trim(ref.artifact_id)
    if artifact_id ~= "" then
        local artifact = artifact_content_repo.get_artifact(upload_id, artifact_id)
        if artifact then
            return { artifact }, nil
        end
        candidates[#candidates + 1] = artifact_id
    end

    for _, key in ipairs({ "filename", "label", "name" }) do
        local value = trim(ref[key])
        if value ~= "" then candidates[#candidates + 1] = value end
    end

    local seen: { [string]: boolean } = {}
    for _, label in ipairs(candidates) do
        if not seen[label] then
            seen[label] = true
            local found, find_err = artifact_parts_repo.find_artifact_parts(upload_id, {
                label = label,
                limit = artifact_ref_limit(ref),
                images_only = true,
            })
            if find_err then return nil, find_err end
            if found and #found > 0 then return found, nil end
        end
    end

    local page = parse_page(ref.page or ref.selector or ref.query)
    if page then
        local found, find_err = artifact_parts_repo.find_artifact_parts(upload_id, {
            page = page,
            limit = artifact_ref_limit(ref),
            images_only = true,
        })
        if find_err then return nil, find_err end
        if found and #found > 0 then return found, nil end
    end

    return nil, "artifact not found"
end

local function handle(args)
    args = args or {}

    local actor = security.actor()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, errors.new({ message = "Authentication required to view files", kind = errors.PERMISSION_DENIED })
    end

    local upload_ids = type(args.upload_ids) == "table" and args.upload_ids or {}
    local artifact_refs = type(args.artifact_refs) == "table" and args.artifact_refs or {}

    if #upload_ids == 0 and #artifact_refs == 0 then
        return nil, errors.new({ message = "At least one upload ID or artifact reference is required", kind = errors.INVALID })
    end

    if #upload_ids > 10 or #artifact_refs > 10 then
        return nil, errors.new({ message = "Maximum 10 files or artifacts can be viewed at once", kind = errors.INVALID })
    end

    local content_contract, err = contract.get("kickside.contract:content_provider")
    if err then
        return nil, errors.new({ message = tostring("Failed to get content provider contract: " .. err), kind = errors.INTERNAL })
    end

    local results = {}

    local function open_content(upload_id: string): (any?, string?)
        return content_contract
            :with_context({ upload_id = upload_id })
            :open("kickside.uploads:content_provider")
    end

    local selected_artifacts = 0
    for _, ref in ipairs(artifact_refs) do
        local upload_id = type(ref) == "table" and tostring(ref.upload_id or "") or ""
        if upload_id == "" then
            table.insert(results, { error = "artifact_refs entries require upload_id" })
        else
            local instance, err = open_content(upload_id)
            if err then
                table.insert(results, { upload_id = upload_id, error = "Failed to access file: " .. err })
            else
                local info, info_err = instance:get_info()
                if info_err then
                    table.insert(results, { upload_id = upload_id, error = "Failed to get file info: " .. info_err })
                else
                    local artifacts, artifact_err = resolve_artifact_ref(upload_id, ref)
                    if artifact_err or not artifacts or #artifacts == 0 then
                        table.insert(results, { upload_id = upload_id, error = "Failed to get artifact: " .. tostring(artifact_err) })
                    else
                        for _, artifact in ipairs(artifacts) do
                            if selected_artifacts >= MAX_SELECTED_ARTIFACTS then
                                table.insert(results, { upload_id = upload_id, error = "Selected artifact limit reached; request fewer artifacts" })
                                break
                            end
                            selected_artifacts = selected_artifacts + 1
                            local artifact_id = tostring(artifact.artifact_id or "")
                            local content, content_err = artifact_content_repo.read_artifact_content(upload_id, artifact_id)
                            if content_err or type(content) ~= "string" then
                                table.insert(results, { upload_id = upload_id, artifact_id = artifact_id, error = "Failed to read artifact: " .. tostring(content_err) })
                            else
                                local content_type = artifact.mime_type or "application/octet-stream"
                                local is_image = is_image_type(content_type)
                                local result = {
                                    upload_id = upload_id,
                                    artifact_id = artifact_id,
                                    filename = artifact.label or (info and info.filename) or "artifact",
                                    content_type = content_type,
                                    is_image = is_image,
                                }
                                if is_image then
                                    apply_image_content(result, content)
                                else
                                    apply_content(result, content, content_type)
                                end
                                table.insert(results, result)
                            end
                        end
                    end
                end
            end
        end
    end

    for _, raw_upload_id in ipairs(upload_ids) do
        local upload_id: string = tostring(raw_upload_id or "")
        if upload_id == "" then
            table.insert(results, {
                upload_id = upload_id,
                error = "upload_ids entries must be non-empty strings"
            })
        else
            local instance, err = open_content(upload_id)

            if err then
                table.insert(results, {
                    upload_id = upload_id,
                    error = "Failed to access file: " .. err
                })
            else
                local info: any, err = instance:get_info()
                if err then
                    table.insert(results, {
                        upload_id = upload_id,
                        error = "Failed to get file info: " .. err
                    })
                else
                    local is_image = is_image_type(info.content_type)

                    local content_result, content_err = instance:get_content()
                    if content_err or not content_result or type(content_result.content) ~= "string" then
                        table.insert(results, {
                            upload_id = upload_id,
                            filename = info.filename,
                            content_type = info.content_type,
                            total_size = info.size,
                            error = "Failed to get content: " .. tostring(content_err or "content provider returned no content")
                        })
                    elseif is_image then
                        local result = {
                            upload_id = upload_id,
                            filename = info.filename or "unknown",
                            content_type = content_result.content_type or info.content_type,
                            is_image = true
                        }
                        apply_image_content(result, content_result.content)
                        table.insert(results, result)
                    else
                        local image_artifacts, artifact_total, artifact_err = list_image_artifacts(tostring(upload_id), args)
                        local result = {
                            upload_id = upload_id,
                            filename = info.filename or "unknown",
                            content_type = content_result.content_type or info.content_type,
                            is_image = false,
                            image_artifacts = image_artifacts,
                            artifact_parts_total = artifact_total,
                            artifact_offset = clamp_int(args.artifact_offset, 0, 0, 1000000000),
                            artifact_limit = clamp_int(args.artifact_limit, DEFAULT_ARTIFACT_LIST_LIMIT, 1, MAX_ARTIFACT_LIST_LIMIT),
                            artifact_error = artifact_err,
                        }
                        apply_content(result, content_result.content, tostring(content_result.content_type or info.content_type or ""))
                        table.insert(results, result)
                    end
                end
            end
        end
    end

    -- Inline image bytes ride in the structured _images field, which the LLM
    -- prompt builder lifts into an image message; the file record keeps its
    -- metadata and marks the attachment instead of repeating the bytes.
    local inline_images: { any } = {}
    for _, result in ipairs(results) do
        if result.is_image and result.content then
            inline_images[#inline_images + 1] = {
                type = "image",
                source = { type = "base64", mime_type = result.content_type or "application/octet-stream", data = result.content },
            }
            result.content = nil
            result.image_attached = true
        end
    end

    local failures: { string } = {}
    local readable = 0
    for _, result in ipairs(results) do
        if result.error then failures[#failures + 1] = tostring(result.error)
        else readable = readable + 1 end
    end
    if readable == 0 and #failures > 0 then
        return nil, errors.new({ message = table.concat(failures, "; "), kind = errors.INTERNAL })
    end

    local response: { [string]: any } = { success = true, files = results }
    if #inline_images > 0 then response._images = inline_images end
    return response
end

return { handle = handle }
