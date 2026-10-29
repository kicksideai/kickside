-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local canonical_json = require("canonical_json")
local repo = require("repo")
local workflow = require("workflow")
local automation = require("automation")
local publish = require("publish")
local version_read = require("version_read")
local run_writable = require("run_writable")
local users = require("users")
local groups = require("groups")
local scaffold = require("scaffold").new({
    test = test, uuid = uuid, time = require("time"), types = require("types"),
    consts = require("consts"), runs = require("runs"),
})

local function exercise(args: any): any
    local created, err
    if args.agent then
        local answer
        answer, err = funcs.new():call("kickside.workflows.agent:flows_manage", {
            action = "create", title = "Source workflow", source_context = args.source_context,
        })
        created = answer and answer.workflow
    else
        created, err = repo.create("Source workflow", nil, nil, args.source_context)
    end
    if err then return nil, err end
    local state, state_err = workflow.state(created.id)
    if state_err then return nil, state_err end
    local expected, schema_err = automation.source_schema(args.source_context.source, args.source_context.config)
    if schema_err then return nil, schema_err end
    if args.agent then
        local source, read_err = funcs.new():call("kickside.automation.agent:automations_read", {
            action = "catalog_entry", direction = "source", id = args.source_context.source, config = args.source_context.config,
        })
        if read_err then return nil, read_err end
        test.eq(canonical_json.encode(source.entry.output_schema), canonical_json.encode(expected))
    end
    local delivery = nil
    local published_schema = nil
    if args.item then
        local owner = security.actor():id()
        local _, user_err = users.create_passwordless({user_id = owner, email = owner .. "@test.local", full_name = "Workflow author", status = "active"})
        if user_err then return nil, user_err end
        local _, group_err = groups.assign_user_to_group(owner, "app:automation_test")
        if group_err then return nil, group_err end
        local _, apply_err = workflow.apply(created.id, {
            {type = "node.add", body = {id = "work", kind = "block", ref = "app:block.engine_linear"}},
            {type = "edge.add", body = {id = "entry", source_id = "start", target_id = "work"}},
            {type = "edge.add", body = {id = "exit", source_id = "work", target_id = "finish"}},
        }, owner)
        if apply_err then return nil, apply_err end
        local published, publish_err = publish.publish(created.id, owner)
        if publish_err then return nil, publish_err end
        test.is_true(published.ok)
        local frozen, read_err = version_read.get(created.id, published.version)
        if read_err then return nil, read_err end
        published_schema = frozen.input_schema
        local installed, install_err = automation.install_type("kickside.automation.manual:task", {
            target = {kind = "workflow", flow_ref = {kind = "flow", id = created.id, version = published.version}, input = args.item},
        })
        if install_err then return nil, install_err end
        delivery = run_writable.write({
            config = {flow_ref = {kind = "flow", id = created.id, version = published.version}},
            sink_op = "upsert", input = args.delivered or args.item,
            automation_ref = {kind = "automation", id = installed.id, revision = 1}, origin = installed.id,
            identity_key = uuid.v4(), idempotency_key = uuid.v4(),
        })
        if delivery.success then
            local terminal = scaffold.wait_run_terminal(created.id, delivery.dest_ref.run_id)
            test.eq(terminal.status, "completed")
            local _, settle_err = require("maintenance").tick(10, delivery.dest_ref.run_id)
            if settle_err then return nil, settle_err end
        end
    end
    local _, delete_err = repo.delete(created.id)
    if delete_err then return nil, delete_err end
    return { state = state, expected = expected, published_schema = published_schema, delivery = delivery }
end

local function define_tests()
    test.describe("source-seeded workflow creation", function()
        test.it("lowers binding assist into the destination expression environment", function()
            local result = require("assist").assist_binding({
                source_context_schema = {type = "object", properties = {customer_id = {type = "string"}}},
                target_start_schema = {type = "object", properties = {name = {type = "string"}}},
                source_root = "payload",
            }, {generate = function() return {transform = '{ name: output.customer_id, label: "output" }'} end})
            test.is_true(result.success, tostring(result.error))
            test.eq(result.transform, '{ name: payload.customer_id, label: "output" }')
        end)
        test.it("rejects a client-supplied schema in source context", function()
            local _, err = exercise({source_context = {source = "app:source.customer_changed", output_schema = {type = "object"}}})
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        for _, mismatch in ipairs({false, true}) do
            test.it(mismatch and "rejects a delivered item outside the published Start schema" or "publishes the source contract and accepts a delivered item", function()
                local actor = security.new_actor("source-run-" .. uuid.v4(), {security_groups = {"app:automation_test"}})
                local scope = security.new_scope({security.policy("app:workflows_suite_policy")})
                local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:source_creation_exercise", {
                    source_context = {source = "app:source.customer_changed", config = {}},
                    item = {customer_id = "customer", region = "west"},
                    delivered = mismatch and {customer_id = 42, region = "west"} or nil,
                })
                test.is_nil(err, tostring(err))
                test.not_nil(result)
                test.eq(canonical_json.encode(result.published_schema), canonical_json.encode(result.expected))
                test.eq(result.delivery.success, not mismatch, canonical_json.encode(result.delivery))
                if mismatch then test.eq(result.delivery.error.code, "invalid_request")
                else test.not_nil(result.delivery.dest_ref.run_id) end
            end)
        end
        for _, source in ipairs({"app:source.customer_changed", "app:source.order_received", "app:source.catalog_items", "app:source.selected_record"}) do
            for _, agent in ipairs({false, true}) do
                test.it("seeds the declared item schema for " .. source .. (agent and " through the agent tool" or " through the repository"), function()
                    local actor = security.new_actor("source-author-" .. uuid.v4(), {})
                    local policy = security.policy("app:workflows_suite_policy")
                    local scope = security.new_scope({policy})
                    local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:source_creation_exercise", {
                        agent = agent,
                        source_context = {source = source, config = {thread_id = "selected-source"}, filter = {expr = 'payload.region == "west"'}},
                    })
                    test.is_nil(err, tostring(err))
                    test.not_nil(result)
                    local start = nil
                    for _, node in ipairs(result.state.nodes) do
                        if node.kind == "start" then start = node end
                    end
                    test.not_nil(start, "creation writes the Start contract")
                    test.eq(canonical_json.encode(start.config.input_schema), canonical_json.encode(result.expected))
                end)
            end
        end
    end)
end

return {run = test.run_cases(define_tests), exercise = exercise}
