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








        test.it("server-resolves the selected node and canonical declaration", function()
            local target, target_err = assist.resolve_config_target("wf-1", "review-1", {
                workflow = { state = function(): (any, any?) return { nodes = {
                    { id = "review-1", kind = "review_step", title = "  Finance review  ", config = { prompt = "Old?", priority = "high", component_id = "hidden" } },
                } }, nil end },
                blocks = { catalog = function(): (any, any?) return { review_step = {
                    label = "Review",
                    config_schema = {
                        type = "object",
                        required = { "prompt" },
                        properties = {
                            prompt = { type = "string" },
                            priority = { type = "string" },
                            component_id = { type = "string", picker = "wc-component-picker" },
                        },
                    },
                } }, nil end },
            })
            test.is_nil(target_err)
            test.eq((target :: Map).block_id, "review_step")
            test.eq((target :: Map).block_title, "Finance review")
            test.eq(((target :: Map).current_config :: Map).priority, "high")
            test.is_nil(((target :: Map).current_config :: Map).component_id)
            test.is_nil((((target :: Map).config_schema :: Map).properties :: Map).component_id)
        end)

        test.it("resolves the compiler-owned Condition predicate through the existing config assist seam", function()
            local target, target_err = assist.resolve_config_target("wf-1", "condition-1", {
                workflow = { state = function(): (any, any?) return { nodes = {
                    { id = "condition-1", kind = "branch", title = "High score?", config = { predicate = "output.score >= 80" } },
                } }, nil end },
                blocks = { catalog = function(): (any, any?) return { branch = { label = "Condition" } }, nil end },
            })
            test.is_nil(target_err)
            test.eq((target :: Map).block_id, "branch")
            test.eq(((target :: Map).current_config :: Map).predicate, "output.score >= 80")
            test.not_nil((((target :: Map).config_schema :: Map).properties :: Map).predicate)
        end)



        test.it("refuses oversized authoritative step identity before prompt construction", function()
            local function readers(node: Map): Map
                return {
                    workflow = { state = function(): (any, any?) return { nodes = { node } }, nil end },
                    blocks = { catalog = function(): (any, any?) return { review = {
                        label = "Review", config_schema = { type = "object", properties = { prompt = { type = "string" } } },
                    } }, nil end },
                }
            end
            local long_title, title_err = assist.resolve_config_target("wf", "node", readers({
                id = "node", kind = "review", title = string.rep("t", 257), config = {},
            }))
            test.is_nil(long_title)
            test.eq((title_err :: Map).code, "config_not_supported")

            local long_kind, kind_err = assist.resolve_config_target("wf", "node", readers({
                id = "node", kind = string.rep("k", 129), title = "Review", config = {},
            }))
            test.is_nil(long_kind)
            test.eq((kind_err :: Map).code, "config_not_supported")
        end)

        test.it("rejects a missing step and a step without a configuration surface", function()
            local readers = {
                workflow = { state = function(): (any, any?) return { nodes = { { id = "plain", kind = "plain" } } }, nil end },
                blocks = { catalog = function(): (any, any?) return { plain = { label = "Plain" } }, nil end },
            }
            local missing, missing_err = assist.resolve_config_target("wf", "missing", readers)
            test.is_nil(missing)
            test.eq((missing_err :: Map).code, "node_not_found")
            local unsupported, unsupported_err = assist.resolve_config_target("wf", "plain", readers)
            test.is_nil(unsupported)
            test.eq((unsupported_err :: Map).code, "config_not_supported")
        end)





        test.it("bounds intent and declaration size before model invocation", function()
            local called = false
            local long_intent = string.rep("x", 4001)
            local result = assist.assist_config({
                intent = long_intent,
                block_id = "review_step",
                config_schema = review_schema,
            }, { generate = function(): (any, any?) called = true; return {}, nil end })
            test.is_false(result.success)
            test.eq(result.code, "invalid_request")
            test.is_false(called)

            local oversized, _, size_err = assist.config_assist_surface({
                type = "object",
                properties = { prompt = { type = "string", description = string.rep("x", 70000) } },
            }, {})
            test.is_nil(oversized)
            test.contains(tostring(size_err), "too large")

            local nested: Map = {}
            local cursor = nested
            for _ = 1, 14 do cursor.child = {}; cursor = cursor.child :: Map end
            local depth_result = assist.assist_config({
                intent = "Configure",
                block_id = "generic",
                config_schema = { type = "object", properties = { payload = { type = "object", additionalProperties = true } } },
                current_config = { payload = nested },
            }, { generate = function(): (any, any?) called = true; return {}, nil end })
            test.is_false(depth_result.success)
            test.eq(depth_result.code, "invalid_current_config")

            for _, identity in ipairs({
                { block_id = string.rep("k", 129), block_title = "Title" },
                { block_id = "generic", block_title = string.rep("t", 257) },
            }) do
                called = false
                local identity_result = assist.assist_config({
                    intent = "Configure", block_id = identity.block_id, block_title = identity.block_title,
                    config_schema = review_schema,
                }, { generate = function(): (any, any?) called = true; return {}, nil end })
                test.is_false(identity_result.success)
                test.eq(identity_result.code, "invalid_request")
                test.is_false(called)
            end

            local trimmed = assist.assist_config({
                intent = "Configure", block_id = "  generic  ", block_title = "  Review  ", config_schema = review_schema,
            }, { generate = function(ctx: any): (any, any?)
                test.eq((ctx :: Map).block_id, "generic")
                test.eq((ctx :: Map).block_title, "Review")
                return { config = { prompt = "Review?" } }, nil
            end })
            test.is_true(trimmed.success, tostring(trimmed.message))
        end)




        test.it("uses the shared bounded LLM seam and stable unavailable shape", function()
            local calls: { Map } = {}
            local result = assist.assist_config({
                intent = "Configure review",
                block_id = "review_step",
                config_schema = review_schema,
            }, {
                llm = scripted_llm({ { err = "timeout" }, { err = "timeout" } }, calls),
                sleep = function(): () end,
            })
            test.is_false(result.success)
            test.eq(result.code, "assist_unavailable")
            test.eq(result.error, "assist_unavailable")
            test.contains(tostring(result.message), "temporarily unavailable")
            test.eq(#calls, 2)
            test.eq((calls[1] :: Map).timeout, 50)
        end)

        test.it("is write-gated at the workflow seam", function()
            local created, create_err = call_as("config-assist-owner", { op = "create", title = "Config assist owned" })
            test.is_nil(create_err)
            local id = tostring((created :: Map).id or "")
            local denied, denied_err = call_as("config-assist-stranger", {
                op = "assist_config",
                id = id,
                body = {
                    intent = "Configure review",
                    block_id = "review_step",
                    config_schema = review_schema,
                },
                config = { prompt = "Approve?" },
            })
            test.is_nil(denied_err)
            test.is_false((denied :: Map).success)
            test.eq((denied :: Map).code, "access_denied")
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
