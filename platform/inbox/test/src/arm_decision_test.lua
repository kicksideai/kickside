local test = require("test")
local decision_content = require("decision_content")
local funcs = require("funcs")
local json = require("json")
local security = require("security")
local arm = require("arm_decision")
local test_identity = require("test_identity")
local contract = require("contract")
local component = require("component")

type Map = { [string]: any }

local ARM_ID = "kickside.inbox:arm_decision"
local READ_PROBE_ID = "app:inbox_read_probe"
local SINK_ID = "kickside.inbox.sink:inbox_write"

local function args(assignee: string?, signal_id: string?): Map
    return {
        dataflow_id = "df-1", signal_id = signal_id or "review-1", workflow_id = "wf-1", run_id = "run-1",
        context = { amount = 42 },
        config = {
            execution_identity = { actor_id = "owner", actor_context = { version = 1 } },
            prompt = "Approve payment?", assignee = assignee, priority = "urgent",
            form = { type = "object", required = { "reason" }, properties = { reason = { type = "string" } } },
        },
    }
end

local function actor_executor(actor_id: string): any
    test_identity.ensure_user(actor_id)
    local actor, actor_err = security.new_actor(actor_id, { security_groups = { "app:user" } })
    if actor_err or not actor then error("inbox test actor: " .. tostring(actor_err)) end
    return funcs.new():with_actor(actor)
end

local function scoped_executor(actor_id: string, policy_id: string?): any
    local policy, policy_err = security.policy(policy_id or "app:user")
    if policy_err or not policy then error("inbox test policy: " .. tostring(policy_err)) end
    local policies = { policy }
    if policy_id then
        local user_policy, user_err = security.policy("app:user")
        if user_err or not user_policy then error("inbox test user policy: " .. tostring(user_err)) end
        policies[#policies + 1] = user_policy
    end
    local scope, scope_err = security.new_scope(policies)
    if scope_err or not scope then error("inbox test scope: " .. tostring(scope_err)) end
    return actor_executor(actor_id):with_scope(scope)
end

local function call_as(actor_id: string, input: Map): (any?, any?)
    return scoped_executor(actor_id):call(ARM_ID, input)
end

local function read_as(actor_id: string, id: string): (any?, any?)
    return scoped_executor(actor_id):call(READ_PROBE_ID, { id = id })
end

local function provision_inbox(actor_id: string): ()
    local result, err = scoped_executor(actor_id):call(SINK_ID, {
        origin = "inbox-review-harness-automation",
        config = { item_type = "notice", priority = "normal" },
        input = { title = "Inbox review harness", content = "Provision inbox" },
        idempotency_key = "inbox-review-harness:" .. actor_id,
    })
    if err or type(result) ~= "table" or not result.success then
        error("could not provision inbox: " .. json.encode(err or (result and result.error)))
    end
end

local function define_tests()
    test.describe("Review content keys", function()
        test.it("carries generic file references into review items", function()
            local input = args("reviewer")
            input.config.files = { { component_id = "example:content", context = { document_id = "document" } } }
            local params, err = arm.preview_decision(input)
            test.is_nil(err)
            test.eq(params.files[1].context.document_id, "document")
        end)

        test.it("renders mixed string and number keys without losing their values", function()
            local rendered, err = decision_content.render({ [2] = "numeric", named = "string" }, {})
            test.is_nil(err)
            test.contains(rendered, "- 2: numeric")
            test.contains(rendered, "- named: string")
            local rows, row_err = decision_content.render({ { [2] = "numeric", named = "string" } }, {})
            test.is_nil(row_err)
            test.contains(rows, "| 2 | named |")
            test.contains(rows, "| numeric | string |")
        end)
    end)

    test.describe("Inbox review Block arm", function()
        test.it("builds a stable correlated item owned by Inbox", function()
            local params, err = arm.preview_decision(args("reviewer"))
            test.is_nil(err)
            test.eq((params :: Map).id, "workflow-decision:df-1:review-1")
            test.eq((params :: Map).source_id, "workflow-decision:df-1:review-1")
            test.is_nil(((params :: Map).metadata :: Map).kind)
            test.is_nil(((params :: Map).metadata :: Map).on_resolve)
            test.eq(((params :: Map).metadata :: Map).assignee, "reviewer")
            test.eq(((params :: Map).metadata :: Map).workflow_id, "wf-1")
            test.eq(((params :: Map).metadata :: Map).run_id, "run-1")
            test.eq(((params :: Map).trace_context :: Map).correlation_key, "review-1")
            test.eq((((params :: Map).metadata :: Map).form :: Map).type, "object")
        end)

        test.it("derives a distinct title and editable defaults from each reviewed input", function()
            local reviewed = args("reviewer")
            reviewed.input = { deal = { name = "Example renewal" }, draft = "Hello\nDraft", seats = 0, notify = false }
            reviewed.config.title_expr = "'Review: ' + input.deal.name"
            reviewed.config.form = { type = "object", properties = {
                body = { type = "string", format = "textarea", default_expr = "input.draft" },
                seats = { type = "integer", default_expr = "input.seats" },
                notify = { type = "boolean", default_expr = "input.notify" },
                reason = { type = "string", default = "Declared default" },
            } }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            test.eq(params.title, "Review: Example renewal")
            test.eq(params.metadata.form.properties.body.default, "Hello\nDraft")
            test.eq(params.metadata.form.properties.seats.default, 0)
            test.eq(params.metadata.form.properties.notify.default, false)
            test.eq(params.metadata.form.properties.reason.default, "Declared default")
            test.is_nil(reviewed.config.form.properties.body.default)
            reviewed.input.deal.name = "Another renewal"
            reviewed.input.draft = "Another draft"
            local other, other_err = arm.preview_decision(reviewed)
            test.is_nil(other_err)
            test.eq(other.title, "Review: Another renewal")
            test.eq(other.metadata.form.properties.body.default, "Another draft")
            test.eq(params.metadata.form.properties.body.default, "Hello\nDraft")
        end)

        test.it("rejects invalid title and default expressions without creating misleading values", function()
            for _, expression in ipairs({ "input.", "input.missing", "42", "''" }) do
                local reviewed = args("reviewer")
                reviewed.input = {}
                reviewed.config.title_expr = expression
                local params, err = arm.preview_decision(reviewed)
                test.is_nil(params)
                test.contains(tostring(err), "title_expr")
            end
            for _, expression in ipairs({ "input.", "input.missing", "42" }) do
                local reviewed = args("reviewer")
                reviewed.input = {}
                reviewed.config.form = { type = "object", properties = {
                    body = { type = "string", default = "Static", default_expr = expression },
                } }
                local params, err = arm.preview_decision(reviewed)
                test.is_nil(params)
                test.contains(tostring(err), "form.properties.body.default_expr")
            end
        end)

        test.it("keeps the prompt and static form unchanged when expressions are absent", function()
            local reviewed = args("reviewer")
            reviewed.config.form.properties.reason.default = "Static reason"
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            test.eq(params.title, reviewed.config.prompt)
            test.eq(params.metadata.form, reviewed.config.form)
            reviewed.config.prompt = nil
            local untitled, untitled_err = arm.preview_decision(reviewed)
            test.is_nil(untitled_err)
            test.eq(untitled.title, "Workflow decision")
        end)

        test.it("shows the reviewer the data the Block received", function()
            -- kickside.blocks:await hands the node input to the arm as `input`;
            -- the reviewer decides about that data, so the card must carry it.
            local reviewed = args("reviewer")
            reviewed.context = nil
            reviewed.input = { name = "Ada Example", company = "Example Engines", budget = 42 }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            local content = tostring((params :: Map).content)
            test.eq((params :: Map).title, "Approve payment?")
            test.contains(content, "- name: Ada Example")
            test.contains(content, "- company: Example Engines")
            test.contains(content, "- budget: 42")
            local stored = ((params :: Map).metadata :: Map).input :: Map
            test.eq(stored.name, "Ada Example")
        end)

        test.it("leads the item content with the reviewed data, not the prompt the title already carries", function()
            -- The list shows the title and one line of content; two runs of the same
            -- step differ only in their data, so that line starts with the data.
            local reviewed = args("reviewer")
            reviewed.context = nil
            reviewed.input = { company = "Brightline Energy" }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            local content = tostring((params :: Map).content)
            test.eq(content:find("Approve payment?", 1, true), nil)
            test.eq(content:sub(1, #"- company: Brightline Energy"), "- company: Brightline Energy")
        end)

        test.it("renders multi-line text, record lists, and nested data as valid markdown blocks", function()
            local reviewed = args("reviewer")
            reviewed.context = nil
            reviewed.input = {
                account = "Kestrel Labs",
                digest = "### Executive Summary\n\n| Metric | Value |\n| --- | --- |\n| ARR | $150,000 |",
                lines = {
                    { name = "UX/UI Redesign", amount = 52800 },
                    { name = "Mobile | App", amount = 61000 },
                },
                tags = { "red", "at-risk" },
                owner = { name = "Maya Chen", team = "Delivery" },
            }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            local content = tostring((params :: Map).content)
            -- A single-line scalar stays a fact in the leading list.
            test.contains(content, "- account: Kestrel Labs")
            -- A multi-line value is its own block, never glued to a list item, so its
            -- headings and tables render.
            test.contains(content, "**digest**\n\n### Executive Summary\n\n| Metric | Value |")
            test.eq(content:find("- digest:", 1, true), nil)
            -- A list of records renders as a table rather than a JSON array.
            test.contains(content, "**lines**\n\n| amount | name |\n| --- | --- |\n| 52800 | UX/UI Redesign |\n| 61000 | Mobile \\| App |")
            test.eq(content:find("[{", 1, true), nil)
            -- A list of scalars renders as a list.
            test.contains(content, "**tags**\n\n- red\n- at-risk")
            -- Any other structure is shown as formatted JSON in a code block.
            test.contains(content, "**owner**\n\n```json\n")
        end)

        test.it("renders context when the caller has no input", function()
            local params, err = arm.preview_decision(args("reviewer"))
            test.is_nil(err)
            test.eq(params.content, "- amount: 42")
        end)

        test.it("preserves top-level lists and Markdown table column names", function()
            local reviewed = args("reviewer")
            reviewed.context = nil
            reviewed.input = { { ["sales|region"] = "East\nCoast", seats = 0 }, { ["sales|region"] = "West", active = false } }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(err)
            test.contains(params.content, "| active | sales\\|region | seats |")
            test.contains(params.content, "|  | East Coast | 0 |")
            test.contains(params.content, "| false | West |  |")
        end)

        test.it("returns an encoding error rather than a blank reviewed structure", function()
            local reviewed = args("reviewer")
            reviewed.context = nil
            local cyclic: Map = {}
            cyclic.self = cyclic
            reviewed.input = { owner = cyclic }
            local params, err = arm.preview_decision(reviewed)
            test.is_nil(params)
            test.contains(tostring(err), "review content")
        end)

        test.it("renders the arm's own context alongside the reviewed input", function()
            local both = args("reviewer")
            both.input = { name = "Ada Example" }
            local params, err = arm.preview_decision(both)
            test.is_nil(err)
            local content = tostring((params :: Map).content)
            test.contains(content, "- name: Ada Example")
            test.contains(content, "- amount: 42")
        end)

        test.it("uses opaque run context as correlation fallback without overriding explicit configuration", function()
            local fallback = args("reviewer")
            fallback.workflow_id, fallback.run_id = nil, nil
            fallback.run_context = { workflow_id = "wf-context", run_id = "run-context" }
            local params, err = arm.preview_decision(fallback)
            test.is_nil(err)
            test.eq(((params :: Map).metadata :: Map).workflow_id, "wf-context")
            test.eq(((params :: Map).metadata :: Map).run_id, "run-context")
            test.eq(((params :: Map).trace_context :: Map).trace_id, "workflow:run-context")

            fallback.config.workflow_id, fallback.config.run_id = "wf-config", "run-config"
            fallback.workflow_id, fallback.run_id = "wf-explicit", "run-explicit"
            params, err = arm.preview_decision(fallback)
            test.is_nil(err)
            test.eq(((params :: Map).metadata :: Map).workflow_id, "wf-explicit")
            test.eq(((params :: Map).metadata :: Map).run_id, "run-explicit")
        end)

        test.it("takes the workflow identity from the run context's flow reference", function()
            -- The Workflow compiler writes the workflow identity into
            -- run_context.flow_ref; a card that misses it cannot be correlated
            -- back to the workflow that raised it.
            local flow = args("reviewer")
            flow.workflow_id, flow.run_id = nil, nil
            flow.run_context = {
                run_id = "run-flow",
                dataflow_id = "df-flow",
                flow_ref = { kind = "flow", id = "wf-from-flow-ref", version = 3 },
            }
            local params, err = arm.preview_decision(flow)
            test.is_nil(err)
            test.eq(((params :: Map).metadata :: Map).workflow_id, "wf-from-flow-ref")
            test.eq(((params :: Map).metadata :: Map).run_id, "run-flow")
        end)

        test.it("builds a valid headless decision without run context", function()
            local headless: Map = {
                dataflow_id = "df-headless",
                signal_id = "signal-headless",
                config = { assignee = "reviewer", prompt = "Review headless work" },
            }
            local params, err = arm.preview_decision(headless)
            test.is_nil(err)
            test.eq(((params :: Map).metadata :: Map).workflow_id, "")
            test.eq(((params :: Map).metadata :: Map).run_id, "")
            test.eq(((params :: Map).trace_context :: Map).trace_id, "workflow:df-headless")
            test.eq(((params :: Map).trace_context :: Map).run_id, "df-headless")
        end)

        test.it("rejects a phantom assignee through the declared principal directory", function()
            local missing = "missing-inbox-review-principal"
            local id = "workflow-decision:df-1:phantom-assignee"
            provision_inbox("owner")
            local before, before_err = read_as("owner", id)
            test.is_nil(before_err)
            test.is_nil(before)

            local result, err = call_as("owner", args(missing, "phantom-assignee"))
            test.is_nil(result)
            test.contains(tostring(err), "does not exist")

            local after, after_err = read_as("owner", id)
            test.is_nil(after_err)
            test.is_nil(after)
        end)

        test.it("creates an ambient decision with stable event identity", function()
            local owner = "owner"
            local expected_id = "workflow-decision:df-1:ambient-idempotency"
            provision_inbox(owner)

            local first, first_err = call_as(owner, args(owner, "ambient-idempotency"))
            local second, second_err = call_as(owner, args(owner, "ambient-idempotency"))

            test.is_nil(first_err)
            test.is_nil(second_err)
            test.eq((first :: Map).id, expected_id)
            test.eq((second :: Map).id, expected_id)
        end)

        test.it("denies cross-user review without Inbox assignment authority", function()
            provision_inbox("reviewer")
            local review = args("reviewer", "cross-user-live-delegation")
            review.config.execution_identity = nil
            local result, err = scoped_executor("owner", "app:self_only"):call(ARM_ID, review)
            test.is_nil(result)
            test.contains(tostring(err), "Inbox assignment access denied")
            local assigned, read_err = read_as("reviewer", "workflow-decision:df-1:cross-user-live-delegation")
            test.is_nil(read_err)
            test.is_nil(assigned)
        end)

        test.it("does not reveal cross-user assignee existence before assignment authorization", function()
            provision_inbox("reviewer")
            local executor = scoped_executor("owner", "app:self_only")
            local existing, existing_err = executor:call(ARM_ID, args("reviewer", "cross-user-existing-assignee"))
            local phantom, phantom_err = executor:call(ARM_ID, args("missing-inbox-review-principal", "cross-user-phantom-assignee"))

            test.is_nil(existing)
            test.is_nil(phantom)
            test.eq(tostring(existing_err), "Inbox assignment access denied")
            test.eq(tostring(phantom_err), "Inbox assignment access denied")
        end)

        test.it("published producer assignment delivers a review without recipient component WRITE", function()
            provision_inbox("reviewer")
            local review = args("reviewer", "assigned-without-write")
            review.config.execution_identity = nil
            local result, err = call_as("owner", review)
            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.id, "workflow-decision:df-1:assigned-without-write")
            local _, catchup_err = scoped_executor("reviewer"):call("app:inbox_catchup_probe", {})
            test.is_nil(catchup_err)
            local assigned, read_err = read_as("reviewer", result.id)
            test.is_nil(read_err)
            test.not_nil(assigned)
            test.eq(assigned.actor_id, "reviewer")
            test.eq(assigned.metadata.assigned_by, "owner")
            test.eq(assigned.status, "pending")
            local sender_item, sender_err = read_as("owner", result.id)
            test.is_nil(sender_err)
            test.is_nil(sender_item)
        end)

        test.it("a WRITE-only sender delivers a cross-user review with stable event identity", function()
            provision_inbox("reviewer")
            local definition, definition_err = contract.get("kickside.component:component_service")
            test.is_nil(definition_err)
            local actor = security.new_actor("reviewer", { security_groups = { "app:user" } })
            local scope = security.new_scope({ security.policy("app:user") })
            local service, open_err = definition:with_actor(actor):with_scope(scope):open()
            test.is_nil(open_err)
            local granted, grant_err = service:grant_subtree({
                root_component_id = component.singleton_component_id("reviewer", "kickside.inbox"),
                subject = { subject_type = "user", subject_id = "owner" }, access_mask = 2,
            })
            test.is_nil(grant_err)
            test.is_true(granted.success, tostring(granted.error))
            local review = args("reviewer", "assigned-without-impersonation")
            review.config.execution_identity = nil
            local first, first_err = call_as("owner", review)
            test.is_nil(first_err)
            test.eq(first.id, "workflow-decision:df-1:assigned-without-impersonation")
            local second, second_err = call_as("owner", review)
            test.is_nil(second_err)
            test.eq(second.id, first.id)
            local _, catchup_err = scoped_executor("reviewer"):call("app:inbox_catchup_probe", {})
            test.is_nil(catchup_err)
            local assigned, read_err = read_as("reviewer", first.id)
            test.is_nil(read_err)
            test.eq(assigned.actor_id, "reviewer")
            test.eq(assigned.metadata.assigned_by, "owner")
            test.eq(assigned.status, "pending")
            local sender_item, sender_err = read_as("owner", first.id)
            test.is_nil(sender_err)
            test.is_nil(sender_item)
        end)

        test.it("validates the private create contract before persistence", function()
            local result, err = arm.create_decision({})
            test.is_nil(result)
            test.eq(err, "params is required")

            result, err = arm.create_decision({ params = {} })
            test.is_nil(result)
            test.eq(err, "params.id is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any)
    return run_cases(options)
end

return { run = run }
