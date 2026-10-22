local test = require("test")
local writer = require("writer")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local id = "11111111-1111-4111-8111-111111111111"
local function invoke(stage: string)
    if stage == "placement" or stage == "descendant" then
        return writer.set_placement(fixture, fixture, {type = "SET_PLACEMENT", payload = {component_id = id, has_parent_arg = true, parent_id = "parent", position = "new-position"}})
    end
    return writer.create_component(fixture, fixture, {type = "CREATE_COMPONENT", payload = {component_id = id, impl_id = "implementation",
        actor_id = stage == "permission" and "system:worker" or id, private_context = {}, initial_meta = {title = "label"}}})
end
return {run = test.run_cases(function()
    test.describe("native Component placement writer failures", function()
        for _, stage in ipairs({"actor", "permission", "encode", "component", "access", "audit", "owner", "metadata", "placement", "descendant"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "writer dependency refuses",
                            details = {code = "placement_writer_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local value, err = invoke(stage); test.is_nil(value); test.not_nil(err)
                        if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "placement writer guard requires failure"})) end
                        test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "placement_writer_dependency"); test.eq(err:details().nested.marker, "kept")
                        if stage == "actor" or stage == "permission" or stage == "encode" then test.eq(fixture.inserts, 0) end
                        if stage == "placement" then test.eq(fixture.updates, 1) end
                        if stage == "descendant" then test.eq(fixture.updates, 2) end
                    end)
                end
            end
        end
        for _, reply in ipairs({{}, {count = 0}, {count = 2}}) do
            test.it("invalid audit proof/" .. tostring(reply.count), function()
                fixture.reset("audit-proof", nil); fixture.audit_reply = reply.count
                local value, err = invoke("audit"); test.is_nil(value); test.not_nil(err)
                if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "placement writer guard requires audit proof refusal"})) end
                test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.eq(err:details().code, "component_initial_audit_response")
                test.eq(fixture.inserts, 3)
            end)
        end
        test.it("successful creation retains its result and all initial writes", function()
            fixture.reset("", nil); local result, err = invoke("component"); test.is_nil(err)
            test.eq(result.component_id, id); test.is_true(result.changes_made); test.eq(fixture.inserts, 5)
        end)
        test.it("successful move retains placement fields and descendant rewrite", function()
            fixture.reset("", nil); local result, err = invoke("placement"); test.is_nil(err)
            test.eq(result.component_id, id); test.is_true(result.changes_made); test.eq(result.parent_id, "parent")
            test.eq(result.position, "new-position"); test.eq(result.previous_position, "old-position"); test.eq(fixture.updates, 2)
        end)
        test.it("denied maintenance ownership retains the subject refusal", function()
            fixture.reset("", nil); fixture.denied = true; local value, err = invoke("permission")
            test.is_nil(value); test.not_nil(err)
            if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "placement writer guard requires permission refusal"})) end
            test.eq(err:kind(), errors.PERMISSION_DENIED); test.is_false(err:retryable()); test.eq(err:details().error_kind, "subject")
            test.eq(fixture.inserts, 0)
        end)
    end)
end)}
