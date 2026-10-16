local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.knowledge.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.knowledge.api:ask.endpoint",
                "kickside.knowledge.api:create_kb.endpoint",
                "kickside.knowledge.api:delete_content.endpoint",
                "kickside.knowledge.api:delete_kb.endpoint",
                "kickside.knowledge.api:get_kb.endpoint",
                "kickside.knowledge.api:ingest_content.endpoint",
                "kickside.knowledge.api:ingest_existing_upload.endpoint",
                "kickside.knowledge.api:list_embedding_models.endpoint",
                "kickside.knowledge.api:list_engines.endpoint",
                "kickside.knowledge.api:list_kb.endpoint",
                "kickside.knowledge.api:organize.endpoint",
                "kickside.knowledge.api:search.endpoint",
                "kickside.knowledge.api:update_kb.endpoint",
                "kickside.knowledge.api:upload_token.endpoint",
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
