local http = require("http")

local CONTENT = http.CONTENT

local M = {}

function M.blank_to_nil(value: any): any?
    if value == nil or value == "" then
        return nil
    end
    return value
end

function M.normalize(values: any): any
    values = values or {}
    return {
        code = M.blank_to_nil(values.code),
        state = M.blank_to_nil(values.state),
        iss = M.blank_to_nil(values.iss),
        error = M.blank_to_nil(values.error),
        error_description = M.blank_to_nil(values.error_description),
    }
end

function M.extract(req: any): any
    local callback_data = M.normalize({
        code = req:query("code"),
        state = req:query("state"),
        iss = req:query("iss"),
        error = req:query("error"),
        error_description = req:query("error_description"),
    })

    if req:method() == "POST" and req:is_content_type(CONTENT.JSON) then
        local body, err = req:body_json()
        if not err and body then
            local body_data = M.normalize(body)
            callback_data.code = callback_data.code or body_data.code
            callback_data.state = callback_data.state or body_data.state
            callback_data.iss = callback_data.iss or body_data.iss
            callback_data.error = callback_data.error or body_data.error
            callback_data.error_description = callback_data.error_description or body_data.error_description
        end
    end

    return callback_data
end

return M
