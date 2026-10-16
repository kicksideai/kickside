local test = require("test")
local publisher = require("publisher")
local fixture = require("fixture")
local args = {component_id = "owner", impl_id = "impl", identity_generation = 3, record_json = "{}"}
return {run = test.run_cases(function()
    test.describe("permanent committed identity audit publication proofs", function()
        for _, stage in ipairs({"get", "ensure", "append"}) do
            local responses = {{}, {value = false}, {value = ""}, {value = 3}, {value = {}}}
            if stage == "append" then
                for _, value in ipairs({{inserted = 0}, {inserted = 2}, {inserted = -1, duplicates = 2},
                    {inserted = 0.5, duplicates = 0.5}, {inserted = math.huge}, {inserted = "invalid", duplicates = 1},
                    {inserted = 1, duplicates = "invalid"}, {duplicates = -1, inserted = 2}, {duplicates = math.huge}}) do
                    responses[#responses + 1] = {value = value}
                end
            end
            for index, response in ipairs(responses) do
                test.it(stage .. "/" .. index, function()
                    fixture.reset("", nil)
                    fixture.responses[stage] = response
                    local ok, result, err = pcall(publisher.publish_audit, args)
                    test.is_true(ok)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "identity_audit_response")
                    test.eq(err:details().field, stage == "get" and "sql.get" or stage == "ensure" and "lifecycle.ensure" or "lifecycle.append")
                    test.eq(fixture.opens, 1)
                    test.eq(fixture.ensures, stage == "get" and 0 or 1)
                    test.eq(fixture.appends, stage == "append" and 1 or 0)
                    test.eq(fixture.releases, stage == "get" and 0 or 1)
                end)
            end
        end
        for _, proof in ipairs({{inserted = 1}, {duplicates = 1}, {inserted = "1", duplicates = "0"}, {inserted = 0, duplicates = 1}}) do
            test.it("retains successful publication/" .. tostring(proof.inserted) .. "/" .. tostring(proof.duplicates), function()
                fixture.reset("", nil)
                fixture.responses.append = {value = proof}
                local result, err = publisher.publish_audit(args)
                test.is_nil(err)
                test.eq(result, proof)
                test.eq(fixture.appends, 1)
                test.eq(fixture.releases, 1)
            end)
        end
        for _, generation in ipairs({math.huge, -math.huge, 0 / 0, -1, 0.5}) do
            test.it("refuses invalid generation/" .. tostring(generation), function()
                fixture.reset("", nil)
                local input = {component_id = args.component_id, impl_id = args.impl_id,
                    identity_generation = generation, record_json = args.record_json}
                local result, err = publisher.publish_audit(input)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(fixture.opens, 0)
                test.eq(fixture.ensures, 0)
                test.eq(fixture.appends, 0)
            end)
        end
    end)
end)}
