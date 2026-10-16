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

        test.it("drafts every assistible registry-declared review control without provider-owned identity", function()
            local projected_schema, projected_config, projection_err = assist.config_assist_surface(
                review_schema, { priority = "normal", assignee = "actor-alex" })
            test.is_nil(projection_err)
            test.is_nil((((projected_schema :: Map).properties :: Map).assignee))
            test.is_nil((projected_config :: Map).assignee)
            local result = assist.assist_config({
                intent = "Urgent finance review for Alex; show invoice data, collect a reason, Pay or Hold",
                block_id = "review_step",
                block_title = "Finance approval",
                config_schema = projected_schema,
                current_config = projected_config,
            }, {
                generate = function(ctx: any): (any, any?)
                    test.eq((ctx :: Map).block_id, "review_step")
                    test.eq(((ctx :: Map).current_config :: Map).priority, "normal")
                    return { config = {
                        prompt = "Approve invoice payment?",
                        context = "output.invoice",
                        form = { type = "object", properties = { reason = { type = "string" } } },
                        approve_label = "Pay",
                        reject_label = "Hold",
                        priority = "urgent",
                    }, notes = "Configured all review controls." }, nil
                end,
            })

            test.is_true(result.success, tostring(result.message))
            local config = result.config :: Map
            test.eq(config.prompt, "Approve invoice payment?")
            test.eq(config.context, "output.invoice")
            test.is_nil(config.assignee)
            test.eq(config.approve_label, "Pay")
            test.eq(config.reject_label, "Hold")
            test.eq(config.priority, "urgent")
            test.is_nil(config.timeout)
            test.not_nil(config.form)
        end)

        test.it("is generic across another Block configuration schema", function()
            local result = assist.assist_config({
                intent = "Use the strict profile and allow ten attempts",
                block_id = "research",
                block_title = "Research",
                config_schema = {
                    type = "object",
                    required = { "profile", "max_attempts" },
                    properties = {
                        profile = { type = "string", enum = { "fast", "strict" } },
                        max_attempts = { type = "integer", minimum = 1, maximum = 20 },
                    },
                },
            }, {
                generate = function(): (any, any?)
                    return { config = { profile = "strict", max_attempts = 10 } }, nil
                end,
            })
            test.is_true(result.success, tostring(result.message))
            test.eq((result.config :: Map).profile, "strict")
            test.eq((result.config :: Map).max_attempts, 10)
        end)

        test.it("projects the canonical declaration, excluding picker ids and preserving current optional values", function()
            local schema, current, projection_err = assist.config_assist_surface({
                type = "object",
                required = { "prompt", "component_id" },
                properties = {
                    prompt = { type = "string" },
                    context = { type = "string" },
                    component_id = { type = "string", picker = "wc-component-picker", class = "crm" },
                },
            }, { prompt = "Old?", context = "output", component_id = "secret-component" })
            test.is_nil(projection_err)
            test.is_nil(((schema :: Map).properties :: Map).component_id)
            test.eq(#((schema :: Map).required :: { any }), 1)
            test.is_nil((current :: Map).component_id)

            local result = assist.assist_config({
                intent = "Change the question only",
                block_id = "review",
                config_schema = schema,
                current_config = current,
            }, { generate = function(): (any, any?) return { config = { prompt = "New?" } }, nil end })
            test.is_true(result.success, tostring(result.message))
            test.eq((result.config :: Map).prompt, "New?")
            test.eq((result.config :: Map).context, "output")
            test.is_nil((result.config :: Map).component_id)
        end)

        test.it("keeps sensitive declared fields and values out of the model projection", function()
            local schema, current, projection_err = assist.config_assist_surface({
                type = "object",
                properties = {
                    prompt = { type = "string" },
                    password = { type = "string", format = "password" },
                    api_token = { type = "string", writeOnly = true },
                    credentials = { type = "object", properties = { client_secret = { type = "string" } } },
                    dynamic_secrets = { type = "object", additionalProperties = { type = "string", writeOnly = true } },
                    metadata = { type = "object", additionalProperties = true },
                },
            }, {
                prompt = "Review?", password = "p", api_token = "t",
                credentials = { client_secret = "s" }, dynamic_secrets = { arbitrary = "s" }, metadata = { access_token = "nested" },
            })
            test.is_nil(projection_err)
            local properties = (schema :: Map).properties :: Map
            test.not_nil(properties.prompt)
            test.is_nil(properties.password)
            test.is_nil(properties.api_token)
            test.is_nil(properties.credentials)
            test.is_nil(properties.dynamic_secrets)
            -- An otherwise-open object carrying a sensitive runtime key is excluded too.
            test.is_nil(properties.metadata)
            test.eq((current :: Map).prompt, "Review?")
            test.is_nil((current :: Map).password)
        end)

        test.it("excludes a containing field when a nested control owns identity selection", function()
            local schema, current, projection_err = assist.config_assist_surface({
                type = "object",
                properties = {
                    prompt = { type = "string" },
                    routing = {
                        type = "object",
                        properties = {
                            assignee = { type = "string", picker = "wc-principal-picker", kinds = "user" },
                            note = { type = "string" },
                        },
                    },
                },
            }, { prompt = "Review?", routing = { assignee = "actor-alex", note = "private route" } })
            test.is_nil(projection_err)
            local properties = (schema :: Map).properties :: Map
            test.not_nil(properties.prompt)
            test.is_nil(properties.routing)
            test.eq((current :: Map).prompt, "Review?")
            test.is_nil((current :: Map).routing)
        end)

        test.it("validates only the projected schema after removing picker-owned fields", function()
            local schema, _, projection_err = assist.config_assist_surface({
                type = "object",
                properties = {
                    prompt = { type = "string" },
                    assignee = {
                        oneOf = { { type = "string" }, { type = "object" } },
                        picker = "wc-principal-picker",
                    },
                },
            }, {})
            test.is_nil(projection_err)
            test.not_nil(((schema :: Map).properties :: Map).prompt)
            test.is_nil(((schema :: Map).properties :: Map).assignee)
        end)

        test.it("preserves omitted optional children in drafted nested objects", function()
            local result = assist.assist_config({
                intent = "Change the review title",
                block_id = "review",
                config_schema = {
                    type = "object",
                    properties = {
                        presentation = {
                            type = "object",
                            properties = {
                                title = { type = "string" },
                                hint = { type = "string" },
                            },
                        },
                    },
                },
                current_config = { presentation = { title = "Old", hint = "Keep this" } },
            }, {
                generate = function(): (any, any?)
                    return { config = { presentation = { title = "New" } } }, nil
                end,
            })
            test.is_true(result.success, tostring(result.message))
            local presentation = ((result.config :: Map).presentation :: Map)
            test.eq(presentation.title, "New")
            test.eq(presentation.hint, "Keep this")
        end)



        test.it("resolves nested controls from a Block configuration schema", function()
            local target, target_err = assist.resolve_config_target("wf-1", "review-1", {
                workflow = { state = function(): (any, any?) return { nodes = {
                    {
                        id = "review-1", kind = "review_step", title = "Review invoice",
                        config = {
                            prompt = "Approve?", context = "output.invoice",
                            approve_label = "Pay", reject_label = "Hold",
                            assignee = "user-owned", priority = "urgent",
                            timeout = { value = 2, unit = "hours" },
                            form = { fields = { { key = "reason", label = "Reason", type = "text", required = true } } },
                        },
                    },
                } }, nil end },
                blocks = { catalog = function(): (any, any?) return { review_step = {
                    label = "Review",
                    config_schema = {
                        type = "object",
                        additionalProperties = false,
                        properties = {
                            prompt = { type = "string" },
                            context = { type = "string" },
                            approve_label = { type = "string" },
                            reject_label = { type = "string" },
                            priority = { type = "string" },
                            timeout = { type = "object", properties = {
                                value = { type = "integer" }, unit = { type = "string" },
                            } },
                            form = { type = "object", additionalProperties = true },
                            assignee = { type = "string", picker = "wc-principal-picker" },
                        },
                    },
                } }, nil end },
            })
            test.is_nil(target_err)
            test.eq((target :: Map).block_id, "review_step")
            test.eq(((target :: Map).current_config :: Map).context, "output.invoice")
            test.eq((((target :: Map).current_config :: Map).timeout :: Map).unit, "hours")
            test.eq(((target :: Map).current_config :: Map).priority, "urgent")
            test.is_nil(((target :: Map).current_config :: Map).assignee)
            local properties = (((target :: Map).config_schema :: Map).properties :: Map)
            test.not_nil(properties.context)
            test.not_nil(properties.timeout)
            test.not_nil(properties.form)
            test.not_nil(properties.priority)
            test.is_nil(properties.assignee)
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
