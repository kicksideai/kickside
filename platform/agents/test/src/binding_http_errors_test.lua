local test = require("test")
local http = require("http")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
local function context(body: string): (any, any, any)
    local captured = {}
    local request = {
        param = function(_, key) return key == "n" and "1" or "addressed-id" end,
        query = function() return "1" end,
        body = function() return body end,
        body_json = function() return { upload_id = "upload", filename = "file", size = 1 } end,
        is_content_type = function() return true end,
        parse_multipart = function() return { values = {}, files = { file = { {
            name = function() return "file" end, header = function() return "text/plain" end,
            size = function() return 1 end, stream = function() return {} end,
        } } } } end,
    }
    local response = {
        set_content_type = function() end,
        set_status = function(_, value) captured.status = value end,
        write_json = function(_, value) captured.body = value end,
    }
    return { request = function() return request end, response = function() return response end,
        STATUS = http.STATUS, CONTENT = http.CONTENT },
        { actor = function() return { id = function() return "actor" end } end }, captured
end
local binding = require("binding")
local create_api = require("create_api")
local update_api = require("update_api")
local get_api = require("get_api")
local delete_api = require("delete_api")
local function exercise(operation, failure, status, stage)
    local writes = 0
    local service = {
        list = function() return { success = true, components = stage == "duplicate" and { {} } or {} } end,
        get_access_context = function()
            if stage == "context" then return nil, failure end
            return { success = true, context = {} }
        end,
        register = function() writes = writes + 1; return nil, failure end,
        update = function() writes = writes + 1; return nil, failure end,
    }
    local instance = binding.new(function()
        if stage == "service" then return nil, failure end
        return service
    end)
    local runtime, security, captured = context(stage == "validation" and '{}' or '{"title":"agent","traits":[],"tools":[]}')
    local selected = operation == "create" and create_api or update_api
    selected.new({ http = runtime, security = security, user_agents = instance }).handler()
    test.eq(captured.status, status)
    local message = tostring(failure)
    if stage == "service" then message = "component service unavailable"
    elseif operation == "update" and stage == "context" then
        message = errors.is(failure, errors.PERMISSION_DENIED) and "agent not found or access denied"
            or "failed to read current agent context: " .. tostring(failure)
    elseif operation == "update" and stage == "write" then message = "agent update failed: " .. tostring(failure) end
    test.eq(encode(captured.body), encode({ success = false, error = message }))
    test.eq(writes, (stage == "write") and 1 or 0)
end
local function exercise_service(adapter, operation, failure, status, envelope)
    local runtime, security, captured = context('{}')
    local function refused()
        if envelope then return { success = false, error = tostring(failure), kind = failure:kind() }, nil end
        return nil, failure
    end
    local instance = adapter.new({ http = runtime, security = security, component = {
        ACCESS = { READ = 1, WRITE = 2, DELETE = 4 },
        validate_access = function() return true end,
        get_service = function() return {
            get = function() if operation == "get" then return refused() end; return { success = true } end,
            get_access_context = refused,
            delete = refused,
        } end,
    } })
    instance.handler()
    test.eq(captured.status, status)
    local prefix = operation == "get" and "failed to read agent: "
        or operation == "context" and "failed to read agent context: " or "delete failed: "
    test.eq(encode(captured.body), encode({ success = false, error = prefix .. tostring(failure) }))
end
return test.run_cases(function()
    test.describe("Agents binding failures reach HTTP without side effects", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
{ errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
{ errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
{ errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves binding kind " .. row[1], function()
                local failure = errors.new({ kind = row[1], message = "opaque", retryable = false, details = { marker = true } })
                exercise("create", failure, row[2], "write")
                exercise("update", failure, row[2], "context")
                exercise("update", failure, row[2], "write")
                exercise("create", failure, row[2], "service")
                exercise_service(get_api, "get", failure, row[2])
                exercise_service(get_api, "context", failure, row[2])
                exercise_service(delete_api, "delete", failure, row[2])
                exercise_service(get_api, "get", failure, row[2], true)
                exercise_service(get_api, "context", failure, row[2], true)
                exercise_service(delete_api, "delete", failure, row[2], true)
            end)
        end
        test.it("types former local bad_request and conflict statuses", function()
            exercise("create", "title is required", 400, "validation")
            exercise("create", "An agent named 'agent' already exists. Pick a different name.", 409, "duplicate")
        end)
        test.it("keeps plain failures internal", function()
            exercise("create", "forbidden", 500, "write")
            exercise("update", "not_found", 500, "write")
        end)
    end)
end)
