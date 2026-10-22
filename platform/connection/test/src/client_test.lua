local test = require("test")
local transport = require("transport")
local driver = require("driver")
local schema = require("schema")
local json = require("json")
local types = require("types")

local request = {method = "POST", url = "https://provider.example/v1/items", headers = {}, body = "{}"}
local function passthrough()
    return {new = function() return {invoke = function(_, fn) return fn() end} end,
        retry_after = function() return 2000 end}
end
local function cases()
    test.describe("actor-bound provider transport", function()
        test.it("checks provider and WRITE access before reading a credential", function()
            local seen = {}
            local client = transport.new({component = {ACCESS = {READ = 1, WRITE = 2},
                query = function(filter)
                    test.eq(filter.component_ids[1], "selected")
                    test.eq(filter.meta.provider, "notion")
                    test.eq(filter.access_mask, 2)
                    seen[#seen + 1] = "query"
                    return {{component_id = "selected", meta = {provider = "notion"}}}
                end,
                get_context = function(id, mask)
                    test.eq(id, "selected"); test.eq(mask, 2)
                    seen[#seen + 1] = "context"
                    return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "read-only actor"})
                end,
                open = function() error("must not open OAuth after a denied context read") end,
            }})
            local conn, err = client.connect("notion", "selected", true)
            test.is_nil(conn); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(table.concat(seen, ","), "query,context")
        end)
        test.it("rejects mismatched, disabled, and ambiguous accounts without reading secrets", function()
            for _, rows in ipairs({
                {{component_id = "wrong", meta = {provider = "box"}}},
                {{component_id = "disabled", meta = {provider = "notion", connection_state = "disabled"}}},
                {{component_id = "a", meta = {provider = "notion"}}, {component_id = "b", meta = {provider = "notion"}}},
            }) do
                local client = transport.new({component = {ACCESS = {READ = 1, WRITE = 2}, query = function() return rows end,
                    get_context = function() error("must not read credentials") end}})
                local conn, err = client.connect("notion", nil, false)
                test.is_nil(conn); test.is_true(errors.is(err, errors.INVALID))
            end
        end)
        test.it("refreshes one rejected OAuth token and retries once", function()
            local tokens, requests = 0, 0
            local client = transport.new({capacity = passthrough(), http = {request = function(_, _, opts)
                requests = requests + 1
                test.eq(opts.headers.Authorization, requests == 1 and "Bearer old-token" or "Bearer new-token")
                return {status_code = requests == 1 and 401 or 200, body = "{\"id\":\"ok\"}"}
            end}})
            local conn = {component_id = "oauth", oauth = {get_access_token = function(_, args)
                tokens = tokens + 1
                if tokens == 2 then test.eq(args.rejected_access_token, "old-token") end
                return {success = true, access_token = tokens == 1 and "old-token" or "new-token"}
            end}}
            local result, err = client.request(conn, request)
            test.is_nil(err); test.eq(result.data.id, "ok"); test.eq(tokens, 2); test.eq(requests, 2)
        end)
        test.it("does not retry revoked OAuth grants indefinitely", function()
            local requests = 0
            local client = transport.new({capacity = passthrough(), http = {request = function()
                requests = requests + 1; return {status_code = 401, body = "{}"}
            end}})
            local result, err = client.request({component_id = "oauth", oauth = {get_access_token = function()
                return {success = true, access_token = "revoked"}
            end}}, request)
            test.is_nil(err); test.eq(result.success, false); test.eq(result.status_code, 401); test.eq(requests, 2)
        end)
        test.it("does not replay a write after a network failure or disclose its error body", function()
            local requests = 0
            local client = transport.new({capacity = passthrough(), http = {request = function()
                requests = requests + 1
                return nil, errors.new({kind = errors.UNAVAILABLE, message = "Authorization: Bearer secret"})
            end}})
            local result, err = client.request({component_id = "token", access_token = "secret"}, request)
            test.is_nil(result); test.is_true(errors.is(err, errors.UNAVAILABLE)); test.eq(err:retryable(), false)
            test.is_nil(err:message():find("secret", 1, true)); test.eq(requests, 1)
        end)
        test.it("preserves rate-limit classification while redacting an echoed credential", function()
            local client = transport.new({capacity = passthrough(), http = {request = function()
                return {status_code = 429, body = "Authorization: Bearer secret", headers = {["Retry-After"] = "2"}}
            end}})
            local result, err = client.request({component_id = "token", access_token = "secret"}, request)
            test.is_nil(err); test.eq(result.status_code, 429); test.eq(result.retry_after_ms, 2000)
            test.is_nil(result.error:find("secret", 1, true)); test.is_nil(result.data)
        end)
        test.it("rejects an expired deadline before contacting the provider", function()
            local client = transport.new({capacity = passthrough(), http = {request = function() error("must not send") end}})
            local result, err = client.request({component_id = "token", access_token = "secret", deadline = "2000-01-01T00:00:00Z"}, request)
            test.is_nil(result); test.is_true(errors.is(err, errors.TIMEOUT))
        end)
        test.it("permits HTTPS and loopback demos and rejects unsafe endpoints", function()
            for _, url in ipairs({"https://api.notion.com/v1", "http://localhost:19185", "http://127.0.0.1:19185"}) do test.is_true(transport.valid_endpoint(url)) end
            for _, url in ipairs({"http://external.example", "file:///etc/passwd", "https://user:pass@example.test", "https://example.test/#fragment", "https://example.test/\r\nAuthorization:evil"}) do test.is_false(transport.valid_endpoint(url)) end
        end)
    end)
    test.describe("provider DTO boundaries", function()
        test.it("prepares bounded binary content without provider-specific headers", function()
            local operation = {method = "POST", path = "/files/upload", write = true, mode = "upload",
                endpoint = "content", schema = {type = "object", properties = {
                    path = {type = "string"}, content_base64 = {type = "string"}}, additionalProperties = false}}
            local config = {provider = "example", title = "Example", endpoints = {content = "https://content.example.test/v1"},
                health_action = "health", discovery_action = "list", operations = {}}
            local prepared, err = driver.prepare(config, operation, {path = "/报告🚀.txt", content_base64 = "aGk="})
            test.is_nil(err)
            test.eq(prepared.body, "hi")
            test.eq(prepared.headers["Content-Type"], "application/octet-stream")
            local count = 0
            for _ in pairs(prepared.headers) do count = count + 1 end
            test.eq(count, 2)
        end)
        test.it("uses a provider-owned preparer without bypassing validation or credential admission", function()
            local operation = {method = "POST", path = "/items", write = true, body = {"name"},
                schema = {type = "object", required = {"name"}, properties = {name = {type = "string"}}, additionalProperties = false}}
            local config = {provider = "example", title = "Example", endpoints = {api = "https://api.example.test/v1"},
                health_action = "create", discovery_action = "create", operations = {create = operation}}
            local admissions = 0
            local client = {connect = function(provider, selected, write)
                test.eq(provider, "example"); test.eq(selected, "selected"); test.is_true(write)
                admissions = admissions + 1
                return {component_id = "selected"}
            end, request = function(connection, prepared)
                test.eq(connection.component_id, "selected")
                test.eq(prepared.headers["X-Provider-Format"], "custom")
                test.eq(json.decode(prepared.body).name, "name")
                return {success = true, data = {id = "created"}}
            end}
            local function prepare(definition, action, params)
                local prepared, err = driver.prepare(definition, action, params)
                if prepared then prepared.headers["X-Provider-Format"] = "custom" end
                return prepared, err
            end
            local run = driver.new(config, {client = client}, prepare).run
            local rejected, rejection = run("create", {unknown = true}, "selected", true)
            test.is_nil(rejected); test.is_true(errors.is(rejection, errors.INVALID)); test.eq(admissions, 0)
            local result, err = run("create", {name = "name"}, "selected", true)
            test.is_nil(err); test.eq(result.data.id, "created"); test.eq(admissions, 1)
        end)
        test.it("rejects an unhandled custom wire mode before resolving credentials", function()
            local operation = {method = "POST", path = "/items", write = true, mode = "provider_format",
                schema = {type = "object", additionalProperties = false}}
            local config = {provider = "example", title = "Example", endpoints = {api = "https://api.example.test/v1"},
                health_action = "create", discovery_action = "create", operations = {create = operation}}
            local run = driver.new(config, {client = {connect = function() error("must not resolve credentials") end}}).run
            local result, err = run("create", {}, nil, true)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("retains empty arrays and objects according to the operation schema", function()
            local definition = {type = "object", properties = {labels = {type = "array", items = {type = "string"}}, fields = {type = "object"}}}
            test.eq(schema.encode({labels = {}, fields = {}}, definition), '{"fields":{},"labels":[]}')
        end)
        test.it("rejects non-JSON values, cycles, nonfinite numbers, and sparse arrays", function()
            local cycle = {}; cycle.self = cycle
            test.is_false(schema.json(cycle)); test.is_false(schema.json({value = math.huge})); test.is_false(schema.json({fn = function() end}))
            test.not_nil(schema.validate({[2] = "gap"}, {type = "array", items = {type = "string"}}))
        end)
        test.it("redacts nested secret fields and response cookies", function()
            local result = driver.sanitize({id = "ok", nested = {access_token = "secret", authorization = "secret", name = "keep"}, headers = {["Set-Cookie"] = "secret"}})
            test.eq(result.id, "ok"); test.eq(result.nested.name, "keep")
            test.is_nil(result.nested.access_token); test.is_nil(result.nested.authorization); test.is_nil(result.headers["Set-Cookie"])
        end)
    end)
end
return {run = test.run_cases(cases)}
