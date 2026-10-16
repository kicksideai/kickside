local test = require("test")
local identity = require("identity")
local fixture = require("fixture")
local json = require("json")
local id = "11111111-1111-4111-8111-111111111111"
return {run = test.run_cases(function()
    test.describe("identity receipt persisted context", function()
        for _, raw in ipairs({"{", "", "false", "null", "12", false, 12}) do
            test.it("corrupt/" .. type(raw) .. "/" .. tostring(raw), function()
                fixture.reset("receipt", nil, nil); fixture.context = raw
                local result, err = identity.get_identity_receipt(id)
                test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.eq(err:details().code, "persisted_data"); test.eq(err:details().field, "component.private_context"); test.eq(fixture.releases, 1)
                if raw == "{" then
                    local _, source = json.decode(raw)
                    if not source then error("missing malformed JSON decoder error") end
                    local cause = err:details().cause
                    test.eq(cause.kind, source:kind()); test.eq(cause.retryable, source:retryable()); test.eq(cause.details, source:details())
                end
            end)
        end
        test.it("absent", function()
            fixture.reset("receipt", nil, nil); fixture.context = nil
            local result, err = identity.get_identity_receipt(id); test.is_nil(result); test.eq(err:kind(), errors.INTERNAL)
            test.is_false(err:retryable()); test.eq(err:details().code, "persisted_data"); test.eq(fixture.releases, 1)
        end)
        for _, raw in ipairs({"{}", "[]", '{"_execution_identity":false}', '{"_execution_identity":12}'}) do
            test.it("missing identity/" .. raw, function()
                fixture.reset("receipt", nil, nil); fixture.context = raw
                local result, err = identity.get_identity_receipt(id); test.is_nil(result)
                test.eq(err:kind(), errors.INVALID); test.eq(err:details().error_kind, "declaration"); test.eq(fixture.releases, 1)
            end)
        end
        for _, raw in ipairs({'{"_execution_identity":{"principal":{"kind":"user","id":"user-1"}}}',
            {_execution_identity = {principal = {kind = "user", id = "user-1"}}}}) do
            test.it("healthy/" .. type(raw), function()
                fixture.reset("receipt", nil, nil); fixture.context = raw
                local result, err = identity.get_identity_receipt(id); test.is_nil(err)
                if type(result) ~= "table" then error("missing identity receipt") end
                test.eq(result.principal.id, "user-1"); test.eq(result.identity_generation, 2)
                test.eq(result.declaration_hash, "declaration-hash"); test.eq(result.declaration_command_generation, 3); test.eq(fixture.releases, 1)
            end)
        end
    end)
end)}
