local artifact_schema = {}

artifact_schema.SCHEMA_VERSION = "kickside.uploads.artifact.v1"

local TOKEN_PATTERN = "^[a-z][a-z0-9_.-]*$"

local function is_object(value: any): boolean
    return type(value) == "table"
end

local function is_token(value: any): boolean
    return type(value) == "string" and value ~= "" and value:match(TOKEN_PATTERN) ~= nil
end

local function is_string(value: any): boolean
    return type(value) == "string" and value ~= ""
end

local function is_checksum(value: any): boolean
    return type(value) == "string" and #value == 64 and value:match("^[0-9a-fA-F]+$") ~= nil
end

local function validate_optional_string(args: any, key: string): string?
    local value = args[key]
    if value ~= nil and type(value) ~= "string" then
        return key .. " must be a string"
    end
    return nil
end

local function validate_optional_object(args: any, key: string): string?
    local value = args[key]
    if value ~= nil and not is_object(value) then
        return key .. " must be an object"
    end
    return nil
end

local function validate_ordinal(value: any): string?
    if value == nil then return nil end
    local number = tonumber(value)
    if number == nil or number < 0 or number % 1 ~= 0 then
        return "ordinal must be a non-negative integer"
    end
    return nil
end

function artifact_schema.validate_locator(locator: any): (boolean, string?)
    if locator == nil then return true, nil end
    if not is_object(locator) then return false, "locator must be an object" end
    if not is_token(locator.type) then
        return false, "locator.type must be a lowercase token"
    end
    return true, nil
end

function artifact_schema.validate_artifact_args(args: any): (boolean, string?)
    if not is_object(args) then return false, "artifact args must be an object" end
    if not is_string(args.upload_id) then return false, "upload_id is required" end
    if not is_token(args.kind) then return false, "kind must be a lowercase token" end
    if args.role ~= nil and not is_token(args.role) then
        return false, "role must be a lowercase token"
    end
    if args.checksum ~= nil and not is_checksum(args.checksum) then
        return false, "checksum must be a sha256 hex digest"
    end
    if args.content ~= nil and type(args.content) ~= "string" then
        return false, "content must be a binary string"
    end
    if args.content ~= nil and args.blob_id ~= nil then
        return false, "content and blob_id are mutually exclusive"
    end

    local err = validate_optional_string(args, "artifact_id")
        or validate_optional_string(args, "parent_artifact_id")
        or validate_optional_string(args, "blob_id")
        or validate_optional_string(args, "mime_type")
        or validate_optional_string(args, "label")
        or validate_optional_string(args, "storage_id")
        or validate_optional_string(args, "storage_path")
        or validate_optional_object(args, "metadata")
        or validate_optional_object(args, "blob_metadata")
        or validate_ordinal(args.ordinal)
    if err then return false, err end

    local locator_ok, locator_err = artifact_schema.validate_locator(args.locator)
    if not locator_ok then return false, locator_err end

    return true, nil
end

function artifact_schema.validate_chunk_args(args: any): (boolean, string?)
    if not is_object(args) then return false, "chunk args must be an object" end
    if not is_string(args.upload_id) then return false, "upload_id is required" end
    if not is_token(args.kind) then return false, "kind must be a lowercase token" end
    if type(args.content) ~= "string" or args.content == "" then
        return false, "content is required"
    end

    local err = validate_optional_string(args, "chunk_id")
        or validate_optional_string(args, "artifact_id")
        or validate_optional_object(args, "metadata")
        or validate_ordinal(args.ordinal)
    if err then return false, err end

    if args.token_count ~= nil then
        local token_count = tonumber(args.token_count)
        if token_count == nil or token_count < 0 or token_count % 1 ~= 0 then
            return false, "token_count must be a non-negative integer"
        end
    end

    local locator_ok, locator_err = artifact_schema.validate_locator(args.locator)
    if not locator_ok then return false, locator_err end

    return true, nil
end

artifact_schema.LOCATOR_JSON_SCHEMA = {
    ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
    ["$id"] = artifact_schema.SCHEMA_VERSION .. ".locator",
    type = "object",
    required = { "type" },
    properties = {
        type = {
            type = "string",
            pattern = TOKEN_PATTERN,
            description = "Lowercase locator token such as upload.original, document.markdown, or image.region.",
        },
    },
    additionalProperties = true,
}

artifact_schema.ARTIFACT_JSON_SCHEMA = {
    ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
    ["$id"] = artifact_schema.SCHEMA_VERSION .. ".artifact",
    type = "object",
    required = { "upload_id", "kind" },
    additionalProperties = false,
    properties = {
        artifact_id = { type = "string" },
        upload_id = { type = "string" },
        parent_artifact_id = { type = "string" },
        blob_id = { type = "string" },
        checksum = { type = "string", pattern = "^[0-9a-fA-F]{64}$" },
        kind = { type = "string", pattern = TOKEN_PATTERN },
        role = { type = "string", pattern = TOKEN_PATTERN },
        mime_type = { type = "string" },
        label = { type = "string" },
        ordinal = { type = "integer", minimum = 0 },
        locator = artifact_schema.LOCATOR_JSON_SCHEMA,
        metadata = { type = "object", additionalProperties = true },
    },
}

artifact_schema.CHUNK_JSON_SCHEMA = {
    ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
    ["$id"] = artifact_schema.SCHEMA_VERSION .. ".chunk",
    type = "object",
    required = { "upload_id", "kind", "content" },
    additionalProperties = false,
    properties = {
        chunk_id = { type = "string" },
        upload_id = { type = "string" },
        artifact_id = { type = "string" },
        kind = { type = "string", pattern = TOKEN_PATTERN },
        content = { type = "string" },
        ordinal = { type = "integer", minimum = 0 },
        token_count = { type = "integer", minimum = 0 },
        locator = artifact_schema.LOCATOR_JSON_SCHEMA,
        metadata = { type = "object", additionalProperties = true },
    },
}

return artifact_schema
