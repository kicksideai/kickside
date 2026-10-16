local test = require("test")
local pending = require("pending")
local fixture = require("fixture")
local function dependencies()
    for _, stage in ipairs({"database", "scan", "delete"}) do
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "cleanup dependency refusal", retryable = options.retryable,
                        details = {code = "cleanup_dependency", nested = {stage = stage}}})
                    fixture.reset(stage, source)
                    local count, err = pending.run(1, "owner")
                    test.is_nil(count)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "cleanup_dependency")
                    test.eq(err:details().nested.stage, stage)
                    test.eq(source:details().nested.stage, stage)
                    test.eq(#fixture.deletes, stage == "delete" and 1 or 0)
                    test.eq(fixture.releases, stage == "database" and 0 or 1)
                end)
            end
        end
    end
end
local function proofs()
    for _, route in ipairs({{stage = "database", field = "database"}, {stage = "scan", field = "rows"},
        {stage = "delete", field = "delete"}}) do
        for _, proof in ipairs({{label = "missing"}, {label = "false", value = false},
            {label = "number", value = 7}, {label = "text", value = "proof"}}) do
            test.it("required proof/" .. route.stage .. "/" .. proof.label, function()
                fixture.reset(route.stage, nil)
                fixture.missing, fixture.proof = true, proof.value
                local count, err = pending.run(1)
                test.is_nil(count)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "component_cleanup_response")
                test.eq(err:details().field, route.field)
            end)
        end
    end
    for _, proof in ipairs({{}, {component_id = false}, {component_id = ""}}) do
        test.it("component identifier proof/" .. tostring(proof.component_id), function()
            fixture.reset("", nil)
            fixture.rows = {proof}
            local count, err = pending.run(1)
            test.is_nil(count)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.is_false(err:retryable())
            test.eq(err:details().code, "component_cleanup_response")
            test.eq(err:details().field, "rows.component_id")
            test.eq(#fixture.deletes, 0)
        end)
    end
    for _, count in ipairs({0, 1, 2}) do
        for _, owner in ipairs({{}, {id = "owner"}}) do
            test.it("valid page/" .. count .. "/" .. tostring(owner.id), function()
                fixture.reset("", nil)
                fixture.rows = {}
                for i = 1, count do fixture.rows[i] = {component_id = "owner" .. i} end
                local removed, err, again, blocked = pending.run(2, owner.id)
                test.is_nil(err)
                test.eq(removed, count)
                test.eq(again, owner.id == nil and count == 2)
                test.eq(#blocked, 0)
                test.eq(fixture.args[owner.id and 2 or 1], 2)
                test.eq(#fixture.deletes, count)
                test.eq(fixture.releases, 1)
                for i, call in ipairs(fixture.deletes) do
                    test.eq(call.id, "owner" .. i)
                    test.eq(call.policy, "reparent_root")
                end
            end)
        end
    end
    for _, ok in ipairs({false, true}) do
        for _, continuation in ipairs({false, true}) do
            test.it("durable pending/" .. tostring(ok) .. "/" .. tostring(continuation), function()
                fixture.reset("", nil)
                local source = errors.new({kind = errors.CONFLICT, retryable = true, message = "cleanup remains",
                    details = {cleanup_pending = true, needs_continue = continuation, code = "cleanup_pending"}})
                fixture.results.owner = {ok = ok, err = source}
                local count, err, again, blocked = pending.run(1, "owner")
                test.is_nil(err)
                test.eq(count, ok and 1 or 0)
                test.eq(again, continuation)
                test.eq(#blocked, continuation and 0 or 1)
                if not continuation then
                    test.eq(blocked[1].component_id, "owner")
                    test.eq(blocked[1].error:kind(), errors.CONFLICT)
                    test.is_true(blocked[1].error:retryable())
                    test.eq(blocked[1].error:details().code, "cleanup_pending")
                end
            end)
        end
    end
end
return {
    dependencies = test.run_cases(function() test.describe("component cleanup native dependencies", dependencies) end),
    proofs = test.run_cases(function() test.describe("component cleanup success and continuation proofs", proofs) end),
}
