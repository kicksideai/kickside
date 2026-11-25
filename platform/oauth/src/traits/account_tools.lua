local component = require("component")
local security = require("security")
local authorization = require("authorization")

local function new(dependencies)
    local deps = dependencies or {}
    local component = deps.component or component
    local security = deps.security or security
    local authorization = deps.authorization or authorization

    local function failure(kind, message)
        return nil, errors.new({kind = kind, message = message})
    end

    local function validate(input, connecting)
        if type(input) ~= "table" or type(input.provider) ~= "string" or
            not input.provider:match("^[%w][%w._-]*$") then
            return failure(errors.INVALID, "provider must be an OAuth provider name, such as google")
        end
        if connecting and input.purpose ~= nil and (type(input.purpose) ~= "string" or #input.purpose > 1000) then
            return failure(errors.INVALID, "purpose must be a string of at most 1000 characters")
        end
        if input.scopes ~= nil then
            if type(input.scopes) ~= "table" then return failure(errors.INVALID, "scopes must be an array of strings") end
            for key, value in pairs(input.scopes) do
                if type(key) ~= "number" or key < 1 or key > #input.scopes or key % 1 ~= 0 or
                    type(value) ~= "string" or value == "" or value:find("%s") then
                    return failure(errors.INVALID, "scopes must be an array of non-empty scope names")
                end
            end
        end
        if not security.actor() or not security.scope() then
            return failure(errors.PERMISSION_DENIED, "An authenticated actor and security scope are required")
        end
        return input.provider:lower()
    end

    local function inspect(provider, requested)
        -- Query under the current actor so a successful empty list means absence.
        -- open_by_meta deliberately uses PERMISSION_DENIED for zero matches.
        local rows, err = component.query({meta = {class = "connection", provider = provider},
            access_mask = component.ACCESS.READ, limit = 2})
        if err then
            return failure(errors.is(err, errors.PERMISSION_DENIED) and errors.PERMISSION_DENIED or
                errors.UNAVAILABLE, "Could not check the account connection")
        end
        if not rows then return failure(errors.INTERNAL, "Connection lookup returned no result") end
        if #rows == 0 then
            return {status = "authorization_required", provider = provider, reason = "not_connected"}
        end
        if #rows > 1 then return failure(errors.INVALID, "Multiple accessible account connections match the provider") end
        local id = rows[1].component_id
        local conn, open_err = component.open(id, component.ACCESS.READ, "kickside.oauth:oauth_connection_contract")
        if open_err then
            return failure(errors.is(open_err, errors.PERMISSION_DENIED) and errors.PERMISSION_DENIED or
                errors.UNAVAILABLE, "Could not open the account connection")
        end
        if not conn then return failure(errors.INTERNAL, "Connection lookup returned no connection") end
        local info, info_err = conn:get_info({})
        if info_err or type(info) ~= "table" or info.error or info.provider ~= provider then
            return failure(errors.INTERNAL, "Could not read the account connection")
        end
        local granted, set = {}, {}
        for value in tostring(info.scopes_granted or ""):gmatch("%S+") do
            if not set[value] then granted[#granted + 1] = value; set[value] = true end
        end
        local reason = nil
        if info.connection_state ~= "connected" and info.connection_state ~= "expired" then
            reason = "reconnect_required"
        end
        for _, value in ipairs(requested or {}) do
            if not set[value] then reason = "missing_scopes" end
        end
        if not reason then
            -- Token retrieval owns recovery of an expired token. Only the
            -- usability verdict crosses the tool boundary.
            local token, token_err = conn:get_access_token({})
            if token_err then return failure(errors.UNAVAILABLE, "Could not verify the account connection") end
            if type(token) ~= "table" or token.success ~= true or token.is_expired or
                type(token.access_token) ~= "string" or token.access_token == "" then
                reason = "reconnect_required"
            end
        end
        if reason then return {status = "authorization_required", provider = provider, reason = reason}, nil, id, info end
        return {status = "connected", provider = provider, scopes = granted}, nil, id, info
    end

    local function connect(input)
        local provider, err = validate(input, true)
        if err then return nil, err end
        local current, check_err, id, info = inspect(provider, input.scopes)
        if check_err then return nil, check_err end
        if current.status == "connected" then return current end
        if info and (type(id) ~= "string" or id == "") then
            return failure(errors.INTERNAL, "The account connection cannot be reauthorized")
        end
        local scopes = {}
        for value in tostring(info and info.scopes_granted or ""):gmatch("%S+") do scopes[#scopes + 1] = value end
        for _, value in ipairs(input.scopes or {}) do scopes[#scopes + 1] = value end
        local result, status = authorization.start(provider, {
            name = (info and info.connection_name) or (provider .. " account"),
            description = input.purpose or "", scopes = scopes, component_id = id,
        })
        if not result or result.success ~= true then
            local kind = status == 404 and errors.NOT_FOUND or
                ((status == 401 or status == 403) and errors.PERMISSION_DENIED or errors.UNAVAILABLE)
            return failure(kind, "Could not start account authorization. Check the provider configuration and connection permissions.")
        end
        return {status = "authorization_required", provider = provider,
            authorization_url = result.authorization_url, expires_in = result.expires_in}
    end

    local function check(input)
        local provider, err = validate(input, false)
        if err then return nil, err end
        local result, check_err = inspect(provider, input.scopes)
        return result, check_err
    end
    return {connect = connect, check = check}
end

local default = new()
default.new = new
return default
