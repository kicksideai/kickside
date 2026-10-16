local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.workflows.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.workflows.api:apply.endpoint",
                "kickside.workflows.api:assist_binding.endpoint",
                "kickside.workflows.api:assist_config.endpoint",
                "kickside.workflows.api:assist_edge.endpoint",
                "kickside.workflows.api:assist_schema.endpoint",
                "kickside.workflows.api:blocks_api.endpoint",
                "kickside.workflows.api:create_workflow.endpoint",
                "kickside.workflows.api:delete_workflow.endpoint",
                "kickside.workflows.api:diff_versions.endpoint",
                "kickside.workflows.api:export_definition.endpoint",
                "kickside.workflows.api:get_events.endpoint",
                "kickside.workflows.api:get_run.endpoint",
                "kickside.workflows.api:get_state.endpoint",
                "kickside.workflows.api:get_version.endpoint",
                "kickside.workflows.api:import_definition.endpoint",
                "kickside.workflows.api:list_published.endpoint",
                "kickside.workflows.api:list_runs.endpoint",
                "kickside.workflows.api:list_versions.endpoint",
                "kickside.workflows.api:list_workflows.endpoint",
                "kickside.workflows.api:publish.endpoint",
                "kickside.workflows.api:redo.endpoint",
                "kickside.workflows.api:restore_version.endpoint",
                "kickside.workflows.api:run.endpoint",
                "kickside.workflows.api:run_events.endpoint",
                "kickside.workflows.api:run_export.endpoint",
                "kickside.workflows.api:run_node_data.endpoint",
                "kickside.workflows.api:set_workflow_labels.endpoint",
                "kickside.workflows.api:simulate.endpoint",
                "kickside.workflows.api:undo.endpoint",
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
                test.eq(baseline:evaluate(actor, "access", id, nil), "undefined", id)
                local unmarked = id .. ".unlisted"
                local legacy = registry.get(unmarked)
                test.is_nil(legacy, unmarked)
                test.eq(policy:evaluate(actor, "access", unmarked, nil), "undefined", unmarked)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
