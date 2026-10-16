local http = require("http")
local callback_params = require("callback_params")
local callback_waiter = require("callback_waiter")

-- Constants
local STATUS = http.STATUS
local CONTENT = http.CONTENT

type CallbackMessage = {
    code: string?,
    state: string?,
    error: string?,
    error_description: string?,
}

-- Error messages
local ERRORS = {
    MISSING_STATE = "Missing state parameter",
    INVALID_STATE = "Invalid state parameter",
    OAUTH_PROVIDER_ERROR = "OAuth provider error",
    MISSING_CODE = "Missing authorization code",
    SESSION_NOT_FOUND = "OAuth session not found or expired",
    COMMUNICATION_FAILED = "Failed to communicate with OAuth session",
    SESSION_TIMEOUT = "OAuth session timeout",
    AUTH_FAILED = "OAuth authentication failed"
}

local function is_valid_state(state)
    return type(state) == "string"
        and #state > 0
        and #state <= 128
        and state:match("^[A-Za-z0-9%-%._~%+/=]+$") ~= nil
end

local function optional_string(value: any): string?
    if type(value) == "string" then
        return value
    end
    return nil
end

local function handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(CONTENT.JSON)

    -- Extract callback parameters
    local callback_data = callback_params.extract(req)

    -- Validate state
    if not callback_data.state or callback_data.state == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = ERRORS.MISSING_STATE
        })
        return
    end
    if not is_valid_state(callback_data.state) then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = ERRORS.INVALID_STATE
        })
        return
    end

    -- Handle OAuth errors
    if callback_data.error then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = ERRORS.OAUTH_PROVIDER_ERROR .. ": " .. callback_data.error,
            error_description = callback_data.error_description
        })
        return
    end

    -- Validate code
    if not callback_data.code or callback_data.code == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = ERRORS.MISSING_CODE
        })
        return
    end

    local callback_message: CallbackMessage = {
        code = optional_string(callback_data.code),
        state = optional_string(callback_data.state),
        error = optional_string(callback_data.error),
        error_description = optional_string(callback_data.error_description),
    }
    local response_data, wait_err = callback_waiter.deliver(tostring(callback_data.state), callback_message)
    if wait_err == "session_not_found" then
        res:set_status(STATUS.NOT_FOUND)
        res:write_json({
            success = false,
            error = ERRORS.SESSION_NOT_FOUND
        })
        return
    end
    if wait_err == "communication_failed" then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = ERRORS.COMMUNICATION_FAILED
        })
        return
    end
    if wait_err == "timeout" then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = ERRORS.SESSION_TIMEOUT
        })
        return
    end

    if type(response_data) ~= "table" then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = ERRORS.AUTH_FAILED
        })
        return
    end

    if not response_data.success then
        local status_code = response_data.oauth_error and STATUS.BAD_REQUEST or STATUS.INTERNAL_ERROR
        res:set_status(status_code)
        res:write_json({
            success = false,
            error = response_data.error or ERRORS.AUTH_FAILED
        })
        return
    end

    -- Return ONLY success confirmation - NO OAuth data
    res:set_status(STATUS.OK)
    res:write_json({
        success = true,
        message = "OAuth authentication successful"
    })
end

return {
    handler = handler,
}
