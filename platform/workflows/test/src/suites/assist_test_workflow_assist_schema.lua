local test = require("test")
local security = require("security")
local funcs = require("funcs")
local assist = require("assist")
local repo = require("workflow_repo")
local component = require("component")
local json = require("json")

type Map = { [string]: any }

local SOURCE_SCHEMA: Map = {
    type = "object",
    properties = {
        full_name = { type = "string" },
        age = { type = "integer" },
    },
}

local TARGET_SCHEMA: Map = {
    type = "object",
    required = { "name", "age" },
    properties = {
        name = { type = "string" },
        age = { type = "integer" },
    },
}

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function call_as(actor_id: string, args: any): (any, any?)
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then return nil, actor_err end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call("app:assist_seam", args or {})
end

local function scripted_llm(outcomes: { Map }, calls: { Map }): Map
    local index = 0
    return {
        structured_output = function(_schema: any, _prompt: any, options: any): (any, any?)
            index = index + 1
            calls[index] = options :: Map
            local outcome = outcomes[index] or {}
            return outcome.response, outcome.err
        end,
    }
end

local function define_tests()

    test.describe("Workflow assist schema", function()
        test.it("drafts a JSON Schema from intent with the shared generate seam", function()
            local called = false
            local result = assist.assist_schema({
                intent = "Capture a lead with email and company",
                context = { surface = "start-boundary", sample = { email = "ada@example.com" } },
            }, {
                generate = function(ctx: any): (any, any?)
                    called = true
                    test.eq(tostring((ctx :: Map).intent), "Capture a lead with email and company")
                    test.eq(tostring(((ctx :: Map).context :: Map).surface), "start-boundary")
                    return {
                        schema = {
                            type = "object",
                            required = { "email" },
                            properties = {
                                email = { type = "string", format = "email" },
                                company = { type = "string" },
                            },
                        },
                        notes = "Lead input schema.",
                    }, nil
                end,
            })

            test.is_true(called)
            test.is_true(result.success, tostring(result.error))
            test.eq((((result.schema :: Map).properties :: Map).email :: Map).type, "string")
            test.eq(result.notes, "Lead input schema.")
        end)

        test.it("edits an existing schema from current_schema", function()
            local result = assist.assist_schema({
                intent = "Add confidence as a number",
                current_schema = {
                    type = "object",
                    required = { "status" },
                    properties = { status = { type = "string" } },
                },
            }, {
                generate = function(ctx: any): (any, any?)
                    local current = (ctx :: Map).current_schema :: Map
                    test.eq((((current.properties :: Map).status :: Map).type), "string")
                    return {
                        schema = {
                            type = "object",
                            required = { "status" },
                            properties = {
                                status = { type = "string" },
                                confidence = { type = "number" },
                            },
                        },
                    }, nil
                end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq((((result.schema :: Map).properties :: Map).confidence :: Map).type, "number")
            test.eq((((result.schema :: Map).required :: { any })[1]), "status")
        end)

        test.it("fails closed when the model returns a non-schema shape", function()
            local result = assist.assist_schema({
                intent = "Make an invalid schema",
            }, {
                generate = function(): (any, any?)
                    return { schema = { type = "object", properties = { email = "string" } } }, nil
                end,
            })

            test.is_false(result.success)
            test.contains(tostring(result.error), "not a valid JSON Schema")
            test.contains(tostring(result.error), "schema.properties.email")
        end)

        test.it("encodes empty object schema properties as JSON objects", function()
            local result = assist.assist_schema({
                intent = "Accept any empty object",
            }, {
                generate = function(): (any, any?)
                    return { schema = { type = "object", properties = {} } }, nil
                end,
            })

            test.is_true(result.success, tostring(result.error))
            local encoded = tostring(json.encode(result.schema) or "")
            test.contains(encoded, "\"properties\":{}")
            test.is_nil((encoded:find("\"properties\":%[%]", 1, false)))
        end)

        test.it("bounds schema-assist LLM calls with the explicit timeout", function()
            local calls: { Map } = {}
            local result = assist.assist_schema({
                intent = "Accept an email address",
            }, {
                llm = scripted_llm({ {
                    response = {
                        result = {
                            schema = {
                                type = "object",
                                properties = { email = { type = "string" } },
                            },
                        },
                    },
                } }, calls),
                sleep = function(): () end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq(#calls, 1)
            local first_call = (calls[1] or {}) :: Map
            test.eq(first_call.timeout, 50)
            test.eq(first_call.model, "class:fast")
        end)
    end)

end

local run_cases = test.run_cases(define_tests)

local function seam(args: any): any
    local a = type(args) == "table" and (args :: Map) or {}
    if a.op == "create" then
        local r, err = repo.create(a.title)
        return { id = r and (r :: Map).id or nil, error = err }
    elseif a.op == "assist_edge" then
        local access_err = repo.require_access(tostring(a.id or ""), repo.ACCESS.WRITE :: number)
        if access_err then return { success = false, error = "access denied" } end
        return assist.assist_edge(a.body, {
            generate = function(): (any, any?) return { transform = tostring(a.transform or "") }, nil end,
        })
    elseif a.op == "grant_read" then
        local service, service_err = component.get_service()
        if service_err or not service then return { success = false, error = tostring(service_err or "component service unavailable") } end
        local result, grant_err = (service :: any):grant_subtree({
            root_component_id = tostring(a.id or ""),
            subject = { subject_id = tostring(a.subject_id or ""), subject_type = "user" },
            access_mask = repo.ACCESS.READ,
        })
        return { success = grant_err == nil and type(result) == "table" and (result :: Map).success == true, error = grant_err or (type(result) == "table" and (result :: Map).error or nil) }
    elseif a.op == "assist_binding" then
        local access_err = repo.require_access(tostring(a.id or ""), repo.ACCESS.READ :: number)
        if access_err then return { success = false, error = "access denied" } end
        return assist.assist_binding(a.body, {
            generate = function(): (any, any?) return { transform = tostring(a.transform or "") }, nil end,
        })
    elseif a.op == "assist_config" then
        local access_err = repo.require_access(tostring(a.id or ""), repo.ACCESS.WRITE :: number)
        if access_err then return { success = false, code = "access_denied", message = "access denied" } end
        return assist.assist_config(a.body, {
            generate = function(): (any, any?) return { config = a.config }, nil end,
        })
    end
    return { success = false, error = "unknown op" }
end

local function run(options: any)
    return run_cases(options)
end

return { run = run, seam = seam }
