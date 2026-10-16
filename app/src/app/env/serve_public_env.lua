local http = require("http")
local env = require("env")
local json = require("json")

local PUBLIC_ENV_KEYS = {
    "PUBLIC_API_URL",
}
local SENSITIVE_KEY_PARTS = {
    "SECRET",
    "TOKEN",
    "PASSWORD",
    "PRIVATE",
    "CREDENTIAL",
    "KEY",
}

local function is_safe_public_key(var_name)
    if type(var_name) ~= "string" or string.match(var_name, "^PUBLIC_[%w_]+$") == nil then
        return false
    end

    local upper = string.upper(var_name)
    for _, marker in ipairs(SENSITIVE_KEY_PARTS) do
        if string.find(upper, marker, 1, true) then
            return false
        end
    end

    return true
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local public_vars = {}
    for _, var_name in ipairs(PUBLIC_ENV_KEYS) do
        if not is_safe_public_key(var_name) then
            res:set_content_type("text/javascript")
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write("const __WIPPY_ENV__ = {};")
            return nil, "Unsafe public environment key"
        end

        local var_value, err = env.get(var_name)
        if err then
            res:set_content_type("text/javascript")
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write("const __WIPPY_ENV__ = {};")
            return nil, "Failed to read public environment"
        end
        if type(var_value) == "string" then
            public_vars[var_name] = var_value
        end
    end

    -- Emit as JSON.parse("<json>") so the object is data first and executable
    -- JS second. Escape the JS-sensitive separators and closing script tags.
    local encoded, enc_err = json.encode(public_vars)
    if enc_err or type(encoded) ~= "string" then
        res:set_content_type("text/javascript")
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write("const __WIPPY_ENV__ = {};")
        return nil, "Failed to encode public environment"
    end
    local encoded_json_string, str_err = json.encode(encoded)
    if str_err or type(encoded_json_string) ~= "string" then
        res:set_content_type("text/javascript")
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write("const __WIPPY_ENV__ = {};")
        return nil, "Failed to encode public environment"
    end
    encoded_json_string = string.gsub(encoded_json_string, "\u{2028}", "\\u2028")
    encoded_json_string = string.gsub(encoded_json_string, "\u{2029}", "\\u2029")
    encoded_json_string = string.gsub(encoded_json_string, "</[sS][cC][rR][iI][pP][tT]", "<\\/script")

    local js_content = "const __WIPPY_ENV__ = JSON.parse(" .. encoded_json_string .. ");\n" ..
        "export default __WIPPY_ENV__;\n" ..
        "export { __WIPPY_ENV__ };"

    res:set_content_type("text/javascript")
    res:set_status(http.STATUS.OK)
    res:write(js_content)
end

return {
    handler = handler
}
