local driver = require("driver")
local M = {}
function M.health(_args)
    return {success = true, status = "connected", resources = {}}
end
function M.receive()
    local http, json = require("http"), require("json")
    local req, res = http.request(), http.response()
    if req:header("Authorization") ~= "Bearer native-http-fixture" then
        res:set_status(401)
        return res:write_json({error = "unauthorized"})
    end
    local raw, err = req:body()
    if err then return nil, err end
    local body = json.decode(raw)
    local envelope = req:header("X-Request-Format") == "provider-owned"
    return res:write_json({id = "native-receipt", title = envelope and body.envelope.title or body.title,
        format = envelope and "envelope" or "json"})
end
function M.probe(args)
    local registry = require("registry")
    local entry = registry.get("app.client_test:probe")
    local config = {provider = "provider_http_fixture", title = "Fixture", endpoints = {api = entry.meta.endpoint},
        health_action = "read", discovery_action = "read", operations = {}}
    for _, action in ipairs({"read", "write"}) do
        config.operations[action] = {method = "POST", path = "/items", write = action == "write",
            body = {"title"}, schema = {type = "object", properties = {title = {type = "string"}},
                required = {"title"}, additionalProperties = false}}
    end
    local prepare
    if args.custom then
        prepare = function(definition, operation, params)
            local request, err = driver.prepare(definition, operation, params)
            if request then
                request.headers["X-Request-Format"] = "provider-owned"
                request.body = require("json").encode({envelope = {title = params.title}})
            end
            return request, err
        end
    end
    return driver.new(config, nil, prepare).run(args.write and "write" or "read", {title = args.title}, args.component_id, args.write == true)
end
return M
