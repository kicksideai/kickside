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
    test.describe("Workflow assist edge transform", function()
        test.it("returns a validated transform for compatible schemas", function()
            local called = false
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
            }, {
                generate = function(ctx: any): (any, any?)
                    called = true
                    test.not_nil((ctx :: Map).upstream_schema)
                    return { transform = "{ name: output.full_name, age: output.age }" }, nil
                end,
            })

            test.is_true(called)
            test.is_true(result.success)
            test.eq(result.transform, "{ name: output.full_name, age: output.age }")
            test.is_nil(assist.validate_transform(result.transform, SOURCE_SCHEMA, TARGET_SCHEMA))
        end)

        test.it("validates one-based array subscripts in authored transforms", function()
            local source_schema: Map = {
                type = "object",
                properties = {
                    passed_items = {
                        type = "array",
                        items = { type = "object", properties = { contact_id = { type = "string" } } },
                    },
                },
            }
            local target_schema: Map = {
                type = "object",
                required = { "contact_id" },
                properties = { contact_id = { type = "string" } },
            }
            local result = assist.assist_edge({
                edge = { source_id = "lane_guard", target_id = "compose_brief" },
                upstream_schema = source_schema,
                upstream_sample = { passed_items = { { contact_id = "contact-1" } } },
                downstream_schema = target_schema,
            }, {
                generate = function(): (any, any?)
                    return { transform = "{ contact_id: output.passed_items[1].contact_id }" }, nil
                end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq(result.transform, "{ contact_id: output.passed_items[1].contact_id }")
        end)

        test.it("generates from an upstream sample and downstream schema", function()
            local called = false
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_sample = { full_name = "Ada Example", age = 36 },
                downstream_schema = TARGET_SCHEMA,
            }, {
                generate = function(ctx: any): (any, any?)
                    called = true
                    test.eq(tostring(((ctx :: Map).upstream_sample :: Map).full_name), "Ada Example")
                    test.not_nil((ctx :: Map).downstream_schema)
                    return { transform = "{ name: output.full_name, age: output.age }" }, nil
                end,
            })

            test.is_true(called)
            test.is_true(result.success)
            test.is_true(tostring(result.transform) ~= "")
        end)

        test.it("generates from upstream and downstream samples only", function()
            local called = false
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_sample = { answer = "approve", confidence = 0.91 },
                downstream_sample = { decision = "approve" },
            }, {
                generate = function(ctx: any): (any, any?)
                    called = true
                    test.eq(tostring(((ctx :: Map).downstream_sample :: Map).decision), "approve")
                    return { transform = "{ decision: output.answer }" }, nil
                end,
            })

            test.is_true(called)
            test.is_true(result.success)
            test.eq(result.transform, "{ decision: output.answer }")
        end)

        test.it("returns guidance when there is no source data or downstream description", function()
            local called = false
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
            }, {
                generate = function(): (any, any?)
                    called = true
                    return { transform = "output" }, nil
                end,
            })

            test.is_false(called)
            test.is_false(result.success)
            test.contains(tostring(result.error), "Run the workflow once")
            test.contains(tostring(result.error), "add an input schema")
        end)

        test.it("rejects generated transforms that fail validation", function()
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
            }, {
                generate = function(): (any, any?)
                    return { transform = "{ name: output.full_name }" }, nil
                end,
            })

            test.is_false(result.success)
            test.contains(tostring(result.error), "downstream schema")
        end)

        test.it("rejects generated transforms that do not parse as expr-lang", function()
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
            }, {
                generate = function(): (any, any?)
                    return { transform = "{ name: output.full_name, " }, nil
                end,
            })

            test.is_false(result.success)
            test.contains(tostring(result.error), "expr-lang")
        end)

        test.it("retries a transient edge-assist failure once then returns the transform", function()
            local calls: { Map } = {}
            local backoffs: { number } = {}
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
            }, {
                llm = scripted_llm({
                    { err = { status_code = 504, message = "upstream gateway timeout" } },
                    { response = { result = { transform = "{ name: output.full_name, age: output.age }" } } },
                }, calls),
                sleep = function(ms: number) backoffs[#backoffs + 1] = ms end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq(result.transform, "{ name: output.full_name, age: output.age }")
            test.eq(#calls, 2)
            test.eq(#backoffs, 1)
            test.eq(backoffs[1], 250)
        end)

        test.it("returns an actionable stable error after a transient retry also fails", function()
            local calls: { Map } = {}
            local result = assist.assist_edge({
                edge = { source_id = "a", target_id = "b" },
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
            }, {
                llm = scripted_llm({
                    { err = "OpenAI API error: 504" },
                    { err = "OpenAI API error: 504" },
                }, calls),
                sleep = function(): () end,
            })

            test.is_false(result.success)
            test.eq(result.error, "assist_unavailable")
            test.contains(tostring(result.message), "Please try again")
            test.is_nil((tostring(result.message):find("OpenAI", 1, true)))
            test.is_nil((tostring(result.message):find("504", 1, true)))
            test.eq(#calls, 2)
        end)

        test.it("classifies mapping intent then reuses the validated transform assist", function()
            local result = assist.assist_edge_intent({
                edge = { source_id = "a", target_id = "b" },
                intent = "Send the full name and age to the next step",
                upstream_schema = SOURCE_SCHEMA,
                downstream_schema = TARGET_SCHEMA,
                available_steps = { { kind = "branch", title = "Condition" } },
                source_failure_available = true,
            }, {
                classify = function(): (any, any?)
                    return { kind = "mapping", predicate = "", block_id = "", summary = "Map the requested fields." }, nil
                end,
                generate = function(): (any, any?)
                    return { transform = "{ name: output.full_name, age: output.age }" }, nil
                end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq(result.kind, "mapping")
            test.eq(result.transform, "{ name: output.full_name, age: output.age }")
        end)

        test.it("returns a validated Condition-node preview instead of an edge predicate", function()
            local result = assist.assist_edge_intent({
                edge = { source_id = "a", target_id = "b" },
                intent = "Only continue when the score is above 50",
                upstream_schema = { type = "object", properties = { score = { type = "number" } } },
                downstream_schema = TARGET_SCHEMA,
                available_steps = { { kind = "branch", title = "Condition" } },
                source_failure_available = true,
            }, {
                classify = function(): (any, any?)
                    return { kind = "condition", predicate = "output.score > 50", block_id = "", summary = "Continue when score is above 50." }, nil
                end,
            })

            test.is_true(result.success, tostring(result.error))
            test.eq(result.kind, "condition")
            test.eq(result.predicate, "output.score > 50")
            test.is_nil(result.transform)
        end)

        test.it("rejects an invalid generated Condition predicate", function()
            local result = assist.assist_edge_intent({
                intent = "Only continue when approved",
                upstream_schema = { type = "object", properties = { approved = { type = "boolean" } } },
                available_steps = { { kind = "branch", title = "Condition" } },
            }, {
                classify = function(): (any, any?)
                    return { kind = "condition", predicate = "output.approved ==", block_id = "", summary = "Check approval." }, nil
                end,
            })

            test.is_false(result.success)
            test.contains(tostring(result.error), "condition")
        end)

        test.it("previews the existing Failed route only when the source exposes it", function()
            local available = assist.assist_edge_intent({
                intent = "If this fails send it to review",
                upstream_schema = SOURCE_SCHEMA,
                available_steps = {},
                source_failure_available = true,
            }, {
                classify = function(): (any, any?)
                    return { kind = "failure_route", predicate = "", block_id = "", summary = "Route failures to review." }, nil
                end,
            })
            test.is_true(available.success)
            test.eq(available.kind, "failure_route")
            test.is_true(available.available)
            test.eq(available.source_port, "failed")

            local unavailable = assist.assist_edge_intent({
                intent = "If this fails send it to review",
                upstream_schema = SOURCE_SCHEMA,
                available_steps = {},
                source_failure_available = false,
            }, {
                classify = function(): (any, any?)
                    return { kind = "failure_route", predicate = "", block_id = "", summary = "Route failures to review." }, nil
                end,
            })
            test.is_true(unavailable.success)
            test.is_false(unavailable.available)
        end)

        test.it("only suggests insertions from the caller's available Flow steps", function()
            local args = {
                intent = "Ask a person to review this first",
                upstream_schema = SOURCE_SCHEMA,
                available_steps = {
                    { kind = "branch", title = "Condition" },
                    { kind = "human", title = "Human decision" },
                },
            }
            local accepted = assist.assist_edge_intent(args, {
                classify = function(): (any, any?)
                    return { kind = "insert_node", predicate = "", block_id = "human", summary = "Add a human decision." }, nil
                end,
            })
            test.is_true(accepted.success, tostring(accepted.error))
            test.eq(accepted.block_id, "human")
            test.eq(accepted.block_title, "Human decision")

            local invented = assist.assist_edge_intent(args, {
                classify = function(): (any, any?)
                    return { kind = "insert_node", predicate = "", block_id = "magic_router", summary = "Add magic." }, nil
                end,
            })
            test.is_false(invented.success)
            test.contains(tostring(invented.error), "not available in this Flow")

            local retired = assist.assist_edge_intent(args, {
                classify = function(): (any, any?)
                    return { kind = "insert_node", predicate = "", node_kind = "human", summary = "Add a human decision." }, nil
                end,
            })
            test.is_false(retired.success)
            test.contains(tostring(retired.error), "not available in this Flow")
        end)

        test.it("denies assist to callers without write access", function()
            local created, cerr = call_as("assist-owner", { op = "create", title = "Assist owned" })
            test.is_nil(cerr)
            local id = tostring((created :: Map).id or "")
            test.is_true(id ~= "")

            local denied, derr = call_as("assist-stranger", {
                op = "assist_edge",
                id = id,
                body = {
                    edge = { source_id = "a", target_id = "b" },
                    upstream_schema = SOURCE_SCHEMA,
                    downstream_schema = TARGET_SCHEMA,
                },
                transform = "{ name: output.full_name, age: output.age }",
            })
            test.is_nil(derr)
            test.is_false((denied :: Map).success)
            test.contains(tostring((denied :: Map).error), "access denied")
        end)

        test.it("allows binding assist to a reader without workflow write access", function()
            local created, cerr = call_as("assist-binding-owner", { op = "create", title = "Binding target" })
            test.is_nil(cerr)
            local id = tostring((created :: Map).id or "")
            test.is_true(id ~= "")

            local granted, gerr = call_as("assist-binding-owner", {
                op = "grant_read", id = id, subject_id = "assist-binding-reader",
            })
            test.is_nil(gerr)
            test.is_true((granted :: Map).success, tostring((granted :: Map).error))

            local result, rerr = call_as("assist-binding-reader", {
                op = "assist_binding",
                id = id,
                body = {
                    source_context_schema = SOURCE_SCHEMA,
                    target_start_schema = TARGET_SCHEMA,
                    intent = "Map the trigger payload into the workflow Start input",
                },
                transform = "{ name: output.full_name, age: output.age }",
            })
            test.is_nil(rerr)
            test.is_true((result :: Map).success, tostring((result :: Map).error))
            test.eq((result :: Map).transform, "{ name: output.full_name, age: output.age }")
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
