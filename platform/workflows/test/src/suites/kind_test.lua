local test = require("test")
local registry = require("registry")
local types = require("types")

type Map = { [string]: any }

local RUN_STARTED = "kickside.workflows.runs.events:started"
local RUN_FINISHED = "kickside.workflows.runs.events:finished"
local RUN_FAILED = "kickside.workflows.runs.events:failed"

local function meta(entry: any): Map
    if type(entry) ~= "table" then return {} end
    if type((entry :: Map).meta) == "table" then return (entry :: Map).meta end
    local data = type((entry :: Map).data) == "table" and (entry :: Map).data or {}
    return type((data :: Map).meta) == "table" and (data :: Map).meta or {}
end

local function contracts(entry: any): Map
    local out: Map = {}
    local data = type(entry) == "table" and type((entry :: Map).data) == "table" and (entry :: Map).data or {}
    for _, declaration in ipairs(type((data :: Map).contracts) == "table" and (data :: Map).contracts or {}) do
        local contract_id = type(declaration) == "table" and tostring((declaration :: Map).contract or "") or ""
        if contract_id ~= "" then out[contract_id] = declaration end
    end
    return out
end

local function define_tests()
    test.describe("kickside.workflows Workflow component", function()
        test.it("publishes the Workflow builder, direct create surface, and navigation", function()
            local builder = select(1, registry.get("kickside.workflows:workflow_builder_view"))
            test.not_nil(builder)
            test.eq(meta(builder).type, "view.component")
            test.eq(meta(builder).tag_name, "kickside-workflow-builder")

            local setup = select(1, registry.get("kickside.workflows:workflow_setup_view"))
            test.not_nil(setup)
            test.eq(meta(setup).type, "view.component")
            test.eq(meta(setup).tag_name, "kickside-workflow-setup")
            test.is_nil(((setup :: Map).data.props.properties :: Map)["type-id"])

            local nav = select(1, registry.get("kickside.workflows:nav_item"))
            test.not_nil(nav)
            test.eq(meta(nav).path, "/workflows")
            test.eq(meta(nav).component_tag, "kickside-workflow-builder")
        end)

        test.it("is only an authoring component with status and deletion contracts", function()
            local entry = select(1, registry.get("kickside.workflows:workflow_kind"))
            test.not_nil(entry)
            local declaration = meta(entry)
            test.eq(declaration.name, "flow")
            test.eq(declaration.class, "flow")
            test.eq(declaration.component.create.view, "kickside.workflows:workflow_setup_view")
            test.eq(declaration.component.manage.view, "kickside.workflows:workflow_builder_view")
            test.is_nil(declaration.trigger_handler)
            test.is_nil(declaration.actions)
            test.is_nil(declaration.inputs)
            test.is_nil(declaration.public_state_schema)

            local declared = contracts(entry)
            test.not_nil(declared["kickside.contract:component"])
            test.not_nil(declared["kickside.contract:deletable"])
            test.is_nil(declared["kickside.contract:installable"])
            test.is_nil(declared["kickside.workflows:workflow_control"])
            test.is_nil(declared["kickside.data:writable"])
        end)

        test.it("does not publish the retired component runtime or pseudo destination", function()
            for _, id in ipairs({
                "kickside.workflows:kind",
                "kickside.workflows:kind_install",
                "kickside.workflows:kind_trigger_apply",
                "kickside.workflows:kind_write",
                "kickside.workflows:kind_status",
                "kickside.workflows:kind_pause",
                "kickside.workflows:kind_resume",
                "kickside.workflows:workflow_control",
                "kickside.workflows:run_flow_port",
                "kickside.workflows:run_workflow_automation",
                "kickside.workflows:automation_config_view",
            }) do
                test.is_nil(select(1, registry.get(id)), id .. " must not exist")
            end
        end)

        test.it("declares Flow run events and source pickers against the Flow class", function()
            local entry = select(1, registry.get("kickside.workflows:workflow_kind"))
            local output: Map = {}
            for _, declaration in ipairs((meta(entry).events :: Map).output or {}) do
                output[tostring((declaration :: Map).type or "")] = true
            end
            for _, event_id in ipairs({ RUN_STARTED, RUN_FINISHED, RUN_FAILED }) do
                test.eq(output[event_id], true)
                local event = select(1, registry.get(event_id))
                test.not_nil(event)
                test.eq(meta(event).type, "kickside.core.threads.event")
                local schema = ((event :: Map).data.schema :: Map)
                local properties = schema.properties :: Map
                test.eq(schema.additionalProperties, false)
                test.eq(#(schema.oneOf :: { any }), 2)
                test.eq((((properties.flow_ref :: Map).properties :: Map).version.minimum), 1)
                test.eq((properties.flow_ref :: Map).additionalProperties, false)
                test.eq((properties.draft_ref :: Map).additionalProperties, false)
                test.eq((properties.automation_ref :: Map).additionalProperties, false)
                test.is_nil(properties.runnable_kind)
                test.is_nil(properties.runnable_id)
            end

            for _, port_id in ipairs({
                "kickside.workflows:flow_run_started",
                "kickside.workflows:flow_run_finished",
                "kickside.workflows:flow_run_failed",
            }) do
                local port = select(1, registry.get(port_id))
                test.not_nil(port)
                test.eq(meta(port).type, "kickside.automation.port")
                test.eq(((port :: Map).data.config_schema.thread_id :: Map).class, "flow")
            end
        end)

        test.it("keeps database placement host-configurable", function()
            local target_db = select(1, registry.get("kickside.workflows:target_db"))
            test.not_nil(target_db)
            local target_seen: Map = {}
            for _, target in ipairs((((target_db :: Map).data or target_db).targets or {}) :: { any }) do
                target_seen[tostring((target :: Map).entry) .. " " .. tostring((target :: Map).path)] = true
            end
            test.eq(target_seen["kickside.workflows:db_config .meta.db_id"], true)

            local db_config = select(1, registry.get(types.DB_CONFIG)) :: Map
            test.not_nil(db_config)
            test.eq(types.db_id(), tostring((db_config.meta :: Map).db_id))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
