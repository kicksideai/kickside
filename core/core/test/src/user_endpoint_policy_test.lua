local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("allows member workspace provisioning without granting other process entrypoints", function()
            local policy, err = security.policy("kickside.core.threads:user_workspace_spawn")
            test.is_nil(err, tostring(err))
            test.not_nil(policy)
            local actor = security.new_actor("workspace-member", {})
            for _, action in ipairs({ "process.spawn", "process.spawn.monitored", "process.spawn.linked" }) do
                test.eq(policy:evaluate(actor, action, "kickside.core.threads:workspace_plugin", nil), "allow")
                test.eq(policy:evaluate(actor, action, "kickside.core.lifecycle:provisioner", nil), "undefined")
            end
            test.eq(policy:evaluate(actor, "funcs.call", "kickside.core.threads:workspace_plugin", nil), "undefined")
        end)
        test.it("binds Jobs read endpoints to the caller's user security scope", function()
            local requirement, err = registry.get("kickside.core.threads:user_security_scope")
            test.is_nil(err)
            local scoped = {}
            for _, target in ipairs(requirement.data.targets) do
                if target.path == ".meta.scope" then scoped[target.entry] = true end
            end
            test.eq(scoped["kickside.core.threads.api:list_jobs.endpoint"], true)
            test.eq(scoped["kickside.core.threads.api:list_job_runs.endpoint"], true)
        end)

        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.core.security:core_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.core.retention.api:get_thread_retention.endpoint",
                "kickside.core.retention.api:upsert_thread_retention.endpoint",
                "kickside.core.threads.api:create_thread.endpoint",
                "kickside.core.threads.api:delete_thread.endpoint",
                "kickside.core.threads.api:get_graph.endpoint",
                "kickside.core.threads.api:get_thread.endpoint",
                "kickside.core.threads.api:ingest_events_batch.endpoint",
                "kickside.core.threads.api:list_children.endpoint",
                "kickside.core.threads.api:list_classes.endpoint",
                "kickside.core.threads.api:list_events.endpoint",
                "kickside.core.threads.api:list_job_runs.endpoint",
                "kickside.core.threads.api:list_jobs.endpoint",
                "kickside.core.threads.api:list_threads.endpoint",
                "kickside.core.threads.api:post_event.endpoint",
                "kickside.core.threads.api:post_message.endpoint",
                "kickside.core.threads.api:update_thread.endpoint",
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
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
