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


    test.describe("Workflow external-node config assist", function()
        local review_schema: Map = {
            type = "object",
            additionalProperties = false,
            required = { "prompt" },
            properties = {
                prompt = { type = "string" },
                context = { type = "string" },
                form = { type = "object", format = "json-schema" },
                assignee = { type = "string", picker = "wc-principal-picker" },
                approve_label = { type = "string" },
                reject_label = { type = "string" },
                priority = { type = "string", enum = { "low", "normal", "high", "urgent" } },
            },
        }











        test.it("gives config assist the validated previous-step schema as expression context", function()
            local result = assist.assist_config({
                intent = "Show the invoice total to the approver",
                block_id = "review_step",
                block_title = "Review invoice",
                config_schema = {
                    type = "object", required = { "prompt" },
                    properties = { prompt = { type = "string" }, context = { type = "string" } },
                    additionalProperties = false,
                },
                current_config = { prompt = "Approve?" },
                upstream_schema = {
                    type = "object", properties = { invoice = { type = "object", properties = { total = { type = "number" } } } },
                },
            }, {
                generate = function(ctx: any): (any, any?)
                    local upstream = (ctx :: Map).upstream_schema :: Map
                    test.not_nil(((upstream.properties :: Map).invoice :: Map))
                    return { config = { prompt = "Approve?", context = "{ total: output.invoice.total }" } }, nil
                end,
            })
            test.is_true(result.success, tostring(result.message))
            test.eq((result.config :: Map).context, "{ total: output.invoice.total }")
        end)



        test.it("fails closed on missing required, unknown, and enum violations", function()
            local cases = {
                { config = { priority = "urgent" }, text = "prompt is required" },
                { config = { prompt = "Review?", hidden_id = "component-1" }, text = "hidden_id is not declared" },
                { config = { prompt = "Review?", priority = "critical" }, text = "allowed values" },
            }
            for _, case in ipairs(cases) do
                local result = assist.assist_config({
                    intent = "Configure review",
                    block_id = "review_step",
                    config_schema = review_schema,
                }, { generate = function(): (any, any?) return { config = case.config }, nil end })
                test.is_false(result.success)
                test.eq(result.code, "invalid_draft")
                test.contains(tostring(result.message), case.text)
            end
        end)

        test.it("honors string constants, lengths, and additionalProperties schemas", function()
            local schema: Map = {
                type = "object",
                additionalProperties = { type = "string", minLength = 2 },
                required = { "mode", "label" },
                properties = {
                    mode = { type = "string", const = "review" },
                    label = { type = "string", minLength = 3, maxLength = 8 },
                },
            }
            test.contains(tostring(assist.validate_config({ mode = "run", label = "Good" }, schema)), "constant")
            test.contains(tostring(assist.validate_config({ mode = "review", label = "x" }, schema)), "at least 3")
            test.contains(tostring(assist.validate_config({ mode = "review", label = "Good", extra = "x" }, schema)), "at least 2")
            test.is_nil(assist.validate_config({ mode = "review", label = "Good", extra = "ok" }, schema))

            local dynamic_only: Map = {
                type = "object",
                additionalProperties = { type = "string", minLength = 2 },
            }
            test.contains(tostring(assist.validate_config({ extra = "x" }, dynamic_only)), "at least 2")
            test.is_nil(assist.validate_config({ extra = "ok" }, dynamic_only))

            local array_bounds: Map = {
                type = "object",
                properties = { values = { type = "array", minItems = 2 } },
            }
            test.contains(tostring(assist.validate_config({ values = { "one" } }, array_bounds)), "at least 2")
        end)

        test.it("infers and enforces keyword-only object and array schemas", function()
            local required_only: Map = { required = { "name" } }
            test.contains(tostring(assist.validate_config({}, required_only)), "name is required")
            test.contains(tostring(assist.validate_config({ value = "not-an-object" }, {
                properties = { value = { required = { "nested" } } },
            })), "must be object")

            local dynamic_only: Map = { additionalProperties = { type = "string", minLength = 2 } }
            test.contains(tostring(assist.validate_config({ short = "x" }, dynamic_only)), "at least 2")
            test.is_nil(assist.validate_config({ long = "ok" }, dynamic_only))

            local items_only: Map = { properties = { values = { items = { type = "integer" } } } }
            test.contains(tostring(assist.validate_config({ values = "not-an-array" }, items_only)), "must be array")
            test.contains(tostring(assist.validate_config({ values = { 1, "two" } }, items_only)), "must be integer")
            test.is_nil(assist.validate_config({ values = { 1, 2 } }, items_only))
        end)

        test.it("fails closed when the configuration root is sensitive or identity-owned", function()
            for _, marker in ipairs({
                { sensitive = true }, { writeOnly = true }, { format = "password" },
                { format = "secret" }, { picker = "wc-principal-picker" }, { class = "user" },
            }) do
                local schema: Map = { type = "object", properties = { prompt = { type = "string" } } }
                for key, value in pairs(marker) do schema[key] = value end
                local projected, current, projection_err = assist.config_assist_surface(schema, { prompt = "private" })
                test.is_nil(projected)
                test.is_nil(current)
                test.contains(tostring(projection_err), "sensitive")
            end
        end)


        test.it("does not accept the retired node identity fields", function()
            local called = false
            local result = assist.assist_config({
                intent = "Configure review",
                node_kind = "review_step",
                node_title = "Review",
                config_schema = review_schema,
            }, { generate = function(): (any, any?) called = true; return {}, nil end })
            test.is_false(result.success)
            test.eq(result.code, "invalid_request")
            test.is_false(called)
        end)

        test.it("rejects schema dialect features the config validator cannot enforce", function()
            for _, property_schema in ipairs({
                { oneOf = { { type = "string" }, { type = "number" } } },
                { type = "string", pattern = "^[A-Z]+$" },
                { anyOf = { { const = "a" }, { const = "b" } } },
                { allOf = { { type = "string" } } },
                { type = { "string", "null" } },
                { type = "array", items = { { type = "string" }, { type = "number" } } },
                { type = "number", multipleOf = 5 },
                { type = "number", exclusiveMinimum = 0 },
                { type = "number", exclusiveMaximum = 10 },
                { type = "array", uniqueItems = true },
                { type = "object", minProperties = 1 },
                { type = "object", maxProperties = 2 },
                { type = "null" },
                { type = "string", minLength = -1 },
                { type = "array", minItems = 2, maxItems = 1 },
            }) do
                local called = false
                local result = assist.assist_config({
                    intent = "Configure",
                    block_id = "generic",
                    config_schema = { type = "object", properties = { value = property_schema } },
                }, { generate = function(): (any, any?) called = true; return { config = {} }, nil end })
                test.is_false(result.success)
                test.eq(result.code, "unsupported_schema")
                test.is_false(called)
            end
        end)

        test.it("scans schema positions without treating enum/default/example data as schema", function()
            local schema: Map = {
                type = "object",
                properties = {
                    choice = {
                        type = "object",
                        enum = { { pattern = "data", oneOf = "also data" } },
                        default = { allOf = "data" },
                        examples = { { anyOf = "data" } },
                    },
                },
            }
            local projected, _, projection_err = assist.config_assist_surface(schema, {})
            test.is_nil(projection_err)
            test.not_nil(projected)
            test.is_nil(assist.validate_config({ choice = { pattern = "data", oneOf = "also data" } }, schema))
            test.contains(tostring(assist.validate_config({ choice = { pattern = "different" } }, schema)), "allowed values")
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
