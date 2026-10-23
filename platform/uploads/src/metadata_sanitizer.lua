local metadata_sanitizer = {}
local execution_identity = require("execution_identity")

local PRIVATE_LOCATOR_KEYS = {
    storage_id = true,
    storage_path = true,
    original_storage_id = true,
    original_storage_path = true,
    checksum = true,
}

local MANAGED_METADATA_KEYS = {
    [assert(execution_identity.CONTEXT_KEY, "execution_identity.CONTEXT_KEY is required")] = true,
}

function metadata_sanitizer.validate_client(value)
    if type(value) ~= "table" then
        return errors.new({ message = "metadata must be an object", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } })
    end
    local seen: { [table]: boolean } = {}
    local function validate(node: table): error?
        if seen[node] then return nil end
        seen[node] = true
        for key, item in pairs(node) do
            if type(key) == "string" and (key:sub(1, 1) == "_" or
                PRIVATE_LOCATOR_KEYS[key] or MANAGED_METADATA_KEYS[key]) then
                return errors.new({ message = "private upload metadata key is forbidden: " .. key,
                    kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } })
            end
            if type(item) == "table" then
                local err = validate(item)
                if err then return err end
            end
        end
        return nil
    end
    return validate(value)
end

-- Transcription stages report a stable code under these keys. Any other text is
-- provider detail and must not leave the server.
metadata_sanitizer.TRANSCRIPTION_ERROR_KEYS = { "ocr_error", "asr_error", "conversion_error" }
local TRANSCRIPTION_KEY_SET = { ocr_error = true, asr_error = true, conversion_error = true }
local TRANSCRIPTION_CODES = {
    no_text_detected = true,
    too_large = true,
    transcript_too_large = true,
    transcription_failed = true,
    persist_failed = true,
    storage_unavailable = true,
    storage_stat_failed = true,
    storage_read_failed = true,
    storage_pointer_missing = true,
}

function metadata_sanitizer.transcription_code(value)
    if value == nil or value == false or value == "" then return value end
    if type(value) == "string" and TRANSCRIPTION_CODES[value] then return value end
    return "transcription_failed"
end

function metadata_sanitizer.public(value)
    if type(value) ~= "table" then return {} end
    local out = {}
    for key, item in pairs(value) do
        if type(key) ~= "string" or (key:sub(1, 1) ~= "_" and not PRIVATE_LOCATOR_KEYS[key] and not MANAGED_METADATA_KEYS[key]) then
            if TRANSCRIPTION_KEY_SET[key] then item = metadata_sanitizer.transcription_code(item) end
            out[key] = item
        end
    end
    return out
end

function metadata_sanitizer.public_locator(value)
    if type(value) ~= "table" then return {} end
    local out = {}
    for key, item in pairs(value) do
        if type(key) ~= "string" or (key:sub(1, 1) ~= "_" and not PRIVATE_LOCATOR_KEYS[key] and not MANAGED_METADATA_KEYS[key]) then
            out[key] = item
        end
    end
    return out
end

return metadata_sanitizer
