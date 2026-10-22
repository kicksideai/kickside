local M = {}

local TRANSCRIPTION_ERROR_KEYS = { ocr_error = true, asr_error = true, conversion_error = true }

function M.process(params)
    local meta = type(params) == "table" and type(params.metadata) == "table" and params.metadata or {}
    if meta.fail_stage_test == true then
        return nil, "test unavailable resource: app:failing_stage"
    end
    local key = meta.transcription_error_test
    if type(key) == "string" and TRANSCRIPTION_ERROR_KEYS[key] then
        local code = meta.transcription_error_code
        if type(code) ~= "string" or code == "" then code = "transcription_failed" end
        return { success = true, metadata = { [key] = code } }
    end
    if meta.transcription_success_test == true then
        return { success = true, metadata = { ocr_error = false, ocr_pages = 1 } }
    end
    return { success = true, metadata = meta.stage_metadata }
end

return M
