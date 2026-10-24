local test = require("test")
local json = require("json")
local recommendations = require("recommendations")
local registry = require("registry")
local agent_invoke = require("agent_invoke")

local function candidate(component: string): any
    return {
        component = component,
        title = ("T"):rep(120),
        description = ("D"):rep(280),
        keywords = { "one", "two", "three", "four", "five", "six", "seven", "eight", "nine" },
    }
end

local function request_body(): any
    return {
        need = "Rank data tools",
        candidates = {
            candidate("acme/alpha"),
            candidate("acme/beta"),
        },
        workspace_context = {
            configured_components = {
                { component = "kickside/core", relationship = "root", version = "0.1.0" },
            },
        },
    }
end

local function fake_http(body: any, captured: any): any
    local response = {
        set_content_type = function(_self: any, value: any) captured.content_type = value end,
        set_header = function(_self: any, name: string, value: string) captured.headers[name] = value end,
        set_status = function(_self: any, value: integer) captured.status = value end,
        write_json = function(_self: any, value: any) captured.body = value end,
    }
    return {
        CONTENT = { JSON = "application/json" },
        STATUS = {
            OK = 200,
            BAD_REQUEST = 400,
            UNAUTHORIZED = 401,
            FORBIDDEN = 403,
            INTERNAL_ERROR = 500,
            SERVICE_UNAVAILABLE = 503,
        },
        request = function()
            return {
                body_json = function() return body, nil end,
            }
        end,
        response = function() return response end,
    }
end

local function call_handler(body: any, security_mod: any, invoke_mod: any): any
    local captured = { headers = {} }
    local previous_http = recommendations._http
    local previous_security = recommendations._security
    local previous_invoke = recommendations._agent_invoke
    recommendations._http = fake_http(body, captured)
    recommendations._security = security_mod
    recommendations._agent_invoke = invoke_mod
    local ok, err = pcall(recommendations.handler)
    recommendations._http = previous_http
    recommendations._security = previous_security
    recommendations._agent_invoke = previous_invoke
    if not ok then error(err) end
    return captured
end

local function define_tests()
    test.describe("App onboarding module recommendations", function()
        test.it("bounds grounded prompt data and drops malformed or duplicate rows", function()
            local body = request_body()
            body.need = ("N"):rep(1300)
            body.candidates[3] = candidate("acme/alpha")
            body.candidates[4] = { component = "not-a-component" }
            for i = 5, 70 do body.candidates[i] = candidate("acme/module-" .. tostring(i)) end
            for i = 2, 90 do
                body.workspace_context.configured_components[i] = {
                    component = "kickside/module-" .. tostring(i),
                    relationship = i % 2 == 0 and "root" or "transitive",
                    title = ("W"):rep(120),
                }
            end

            local normalized, err = recommendations.normalize_request(body)
            test.is_nil(err)
            test.not_nil(normalized)
            test.eq(#normalized.need, 1200)
            test.eq(#normalized.candidates, 60)
            test.eq(#normalized.candidates[1].title, 100)
            test.eq(#normalized.candidates[1].description, 240)
            test.eq(#normalized.candidates[1].keywords, 8)
            test.eq(#normalized.workspace_context.configured_components, 80)
        end)

        test.it("keeps only exact candidate ids, in model order, with a five-item ceiling", function()
            local candidates = {
                { component = "acme/One" },
                { component = "acme/two" },
                { component = "acme/three" },
                { component = "acme/four" },
                { component = "acme/five" },
                { component = "acme/six" },
            }
            local ids = recommendations.intersect_ids({
                "acme/one", "acme/One", "invented/module", "acme/two", "acme/One",
                "acme/three", "acme/four", "acme/five", "acme/six",
            }, candidates)
            test.eq(#ids, 5)
            test.eq(ids[1], "acme/One")
            test.eq(ids[2], "acme/two")
            test.eq(ids[5], "acme/five")
        end)

        test.it("the declared recommender passes real agent invocation authorization", function()
            local flow = { create = function()
                local builder = {}
                function builder:with_title() return self end
                function builder:with_metadata() return self end
                function builder:with_input() return self end
                function builder:agent(id: string, cfg: any)
                    test.eq(id, "kickside.hub.instruments:recommender")
                    test.eq(cfg.arena.tool_calling, "any")
                    test.is_nil(cfg.arena.tools)
                    test.eq(cfg.arena.exit_schema.type, "object")
                    test.eq(cfg.arena.exit_schema.additionalProperties, false)
                    test.eq(cfg.arena.exit_schema.required[1], "component_ids")
                    test.eq(cfg.arena.exit_schema.properties.component_ids.maxItems, 5)
                    test.eq(cfg.arena.exit_schema.properties.component_ids.items.enum[1], "acme/alpha")
                    test.eq(cfg.arena.exit_schema.properties.component_ids.items.enum[2], "acme/beta")
                    return self
                end
                function builder:run() return { component_ids = { "acme/alpha" } }, nil end
                return builder
            end }
            local result, err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(req: any)
                    return agent_invoke.invoke(req, { get_entry = registry.get, flow = flow })
                end },
            })
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(result.component_ids[1], "acme/alpha")
            local entry = assert(registry.get("kickside.hub.instruments:recommender"))
            test.is_true(entry.meta.palette_hidden)
            test.is_nil((entry :: any).tools)
        end)

        test.it("hard-codes the recommender and returns only its grounded ids", function()
            local invoked: any = nil
            local result, err = recommendations.recommend(request_body(), {
                agent_invoke = {
                    invoke = function(req: any): (any, any?)
                        invoked = req
                        return { content = '["acme/beta","invented/module","acme/alpha","acme/beta"]' }, nil
                    end,
                },
            })
            test.is_nil(err)
            test.eq(invoked.config.agent_id, "kickside.hub.instruments:recommender")
            test.eq(invoked.config.max_iterations, 1)
            test.eq(invoked.config.exit_schema.type, "object")
            test.eq(invoked.config.exit_schema.properties.component_ids.items.enum[1], "acme/alpha")
            test.eq(invoked.config.exit_schema.properties.component_ids.items.enum[2], "acme/beta")
            test.eq(invoked.config.exit_schema.properties.component_ids.maxItems, 5)
            test.eq(invoked.metadata.surface, "system_onboarding")
            local prompt_body = select(1, json.decode(invoked.input.content))
            test.eq(prompt_body.candidates[1].component, "acme/alpha")
            test.eq(#result.component_ids, 2)
            test.eq(result.component_ids[1], "acme/beta")
            test.eq(result.component_ids[2], "acme/alpha")
        end)

        test.it("accepts only the typed finish result requested by the recommender schema", function()
            local result, err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?)
                    return {
                        content = '{"component_ids":["acme/beta"]}',
                        structured = { component_ids = { "acme/beta" } },
                    }, nil
                end },
            })
            test.is_nil(err)
            test.eq(#result.component_ids, 1)
            test.eq(result.component_ids[1], "acme/beta")
        end)

        test.it("distinguishes unavailable invocation from invalid model output", function()
            local unavailable, unavailable_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any?, string?) return nil, "model unavailable" end },
            })
            test.is_nil(unavailable)
            test.eq(unavailable_err.kind, "unavailable")
            test.eq(unavailable_err.code, "RECOMMENDER_UNAVAILABLE")

            local invalid, invalid_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?) return { content = "not json" }, nil end },
            })
            test.is_nil(invalid)
            test.eq(invalid_err.kind, "error")
            test.eq(invalid_err.code, "INVALID_RECOMMENDER_RESPONSE")

            local fenced, fenced_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?)
                    return { content = "```json\n[\"acme/alpha\"]\n```" }, nil
                end },
            })
            test.is_nil(fenced)
            test.eq(fenced_err.code, "INVALID_RECOMMENDER_RESPONSE")

            local malformed, malformed_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?)
                    return { content = '{"component_ids":["acme/alpha"]}',
                        structured = { component_ids = { [2] = "acme/alpha" } } }, nil
                end },
            })
            test.is_nil(malformed)
            test.eq(malformed_err.code, "INVALID_RECOMMENDER_RESPONSE")

            local mixed, mixed_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?)
                    return { content = '["acme/alpha"]',
                        structured = { component_ids = { "acme/alpha", "invented/module" } } }, nil
                end },
            })
            test.is_nil(mixed)
            test.eq(mixed_err.code, "INVALID_RECOMMENDER_RESPONSE")

            local unknown, unknown_err = recommendations.recommend(request_body(), {
                agent_invoke = { invoke = function(): (any, any?)
                    return { structured = { component_ids = { "invented/module" } } }, nil
                end },
            })
            test.is_nil(unknown)
            test.eq(unknown_err.code, "INVALID_RECOMMENDER_RESPONSE")
        end)

        test.it("enforces the admin gate and exposes explicit HTTP semantics", function()
            local invoked = 0
            local invoke_mod = {
                invoke = function(): (any, any?)
                    invoked = invoked + 1
                    return { content = '["acme/alpha"]' }, nil
                end,
            }
            local unauthorized = call_handler(request_body(), {
                actor = function() return nil end,
                can = function() return false end,
            }, invoke_mod)
            test.eq(unauthorized.status, 401)
            test.eq(unauthorized.body.code, "UNAUTHORIZED")

            local forbidden = call_handler(request_body(), {
                actor = function() return { id = function() return "user" end } end,
                can = function() return false end,
            }, invoke_mod)
            test.eq(forbidden.status, 403)
            test.eq(forbidden.body.code, "FORBIDDEN")

            local success = call_handler(request_body(), {
                actor = function() return { id = function() return "admin" end } end,
                can = function(_action: string, resource: string): boolean
                    return resource == "kickside.ui:system_onboarding"
                end,
            }, invoke_mod)
            test.eq(success.status, 200)
            test.eq(success.body.success, true)
            test.eq(success.body.available, true)
            test.eq(success.body.component_ids[1], "acme/alpha")
            test.eq(success.headers["Cache-Control"], "no-store")
            test.eq(invoked, 1)
        end)

        test.it("maps an unavailable recommender to a retryable service response", function()
            local unavailable = call_handler(request_body(), {
                actor = function() return { id = function() return "admin" end } end,
                can = function() return true end,
            }, {
                invoke = function(): (any?, string?) return nil, "provider unavailable" end,
            })
            test.eq(unavailable.status, 503)
            test.eq(unavailable.body.success, false)
            test.eq(unavailable.body.available, false)
            test.eq(unavailable.body.code, "RECOMMENDER_UNAVAILABLE")
            test.eq(#unavailable.body.component_ids, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
