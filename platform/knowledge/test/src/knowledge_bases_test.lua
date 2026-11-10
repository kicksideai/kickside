local test = require("test")
local errors = require("errors")
local funcs = require("funcs")
local security = require("security")
local knowledge_bases = require("knowledge_bases")

local function define_tests()
    test.describe("knowledge_bases enrichment_agent validation", function()
        test.it("passes when no enrichment_agent_id is provided", function()
            local svc = { get = function() error("get must not be called") end }
            local err = knowledge_bases._validate_enrichment_agent(svc, nil)
            test.is_nil(err)
        end)

        test.it("rejects a non-existent enrichment_agent_id", function()
            local svc = {
                get = function(_, args)
                    return { success = false, error = "not found: " .. tostring(args.component_id) }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "gone-agent")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("rejects a component that is not a user agent", function()
            local svc = {
                get = function(_, _args)
                    return { success = true, meta = { class = "knowledge_base" } }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "some-kb")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("passes for an existing user agent", function()
            local svc = {
                get = function(_, _args)
                    return { success = true, meta = { class = "agent" } }, nil
                end,
            }
            local err = knowledge_bases._validate_enrichment_agent(svc, "real-agent")
            test.is_nil(err)
        end)
    end)

    test.describe("knowledge_bases delete", function()
        for _, mode in ipairs({"child", "nested", "denied", "failed", "partial", "empty"}) do
            test.it("deletes dependents children-first or reports the blocking child: " .. mode, function()
                local policies = {security.policy("app:user")}
                if mode == "denied" then policies[#policies + 1] = security.policy("kickside.knowledge.registry:deny_child") end
                local result, err = funcs.new()
                    :with_actor(security.new_actor("kb-parent-owner", {}))
                    :with_scope(security.new_scope(policies))
                    :call("kickside.knowledge.registry:knowledge_bases_probe", {mode = mode})
                test.is_nil(err, tostring(err))
                if mode == "denied" or mode == "failed" or mode == "partial" then
                    test.is_true(result.conflict, tostring(result.delete_error))
                    if mode == "denied" then
                        test.is_false(result.names_child, tostring(result.delete_error))
                        test.is_false(result.details_name_child)
                    else test.is_true(result.names_child, tostring(result.delete_error)) end
                    test.is_true(result.kb_present)
                    test.is_true(result.children_attached)
                    test.eq(result.cleaned, mode == "partial" and 1 or 0)
                    test.eq(result.deleted_count, mode == "partial" and 1 or 0)
                    if mode == "denied" then test.eq(result.marked, 0)
                    else test.is_true(result.delete_error:find("dependent teardown refuses deletion", 1, true) ~= nil) end
                else
                    test.is_nil(result.delete_error, tostring(result.delete_error))
                    test.is_false(result.kb_present)
                    test.eq(result.children_remaining, 0)
                    test.eq(result.cleaned, mode == "nested" and 2 or (mode == "child" and 1 or 0))
                    test.is_true(result.children_first)
                end
            end)
        end
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
