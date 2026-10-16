local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local contract = require("contract")
local catalog = require("catalog")
local scopes = require("scopes")
local canonical_json = require("canonical_json")

local function define_tests()
    test.describe("native scope catalog failures", function()
        for _, raw in ipairs({"{", "false", "7", '"text"', "null"}) do
            for _, boundary in ipairs({"library", "funcs.call", "contract"}) do
                test.it("retains corrupt stored policies through " .. boundary .. ": " .. raw, function()
                    local db = assert(sql.get("app:db"))
                    local slug = "native_catalog_" .. uuid.v7():gsub("-", "")
                    test.is_nil(select(2, db:execute([[INSERT INTO kickside_security_scopes
                        (slug,label,description,policies,target,internal,enabled,created_at,updated_at)
                        VALUES ($1,'','',$2,'','0','1','before','before')]], {slug, raw})))
                    local ok, failure = pcall(function()
                        local _, direct_err = scopes.list()
                        test.is_true(errors.is(direct_err, errors.INTERNAL))
                        test.eq(direct_err:retryable(), false)
                        test.eq(direct_err:details().code, "persisted_data")
                        local result, err
                        if boundary == "library" then
                            result, err = catalog.scopes()
                        elseif boundary == "funcs.call" then
                            result, err = funcs.call("kickside.security.binding:list_scopes_func", {})
                        else
                            local binding = assert(contract.open("kickside.security.api:security_scopes_binding"))
                            result, err = binding:list({})
                        end
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.eq(err:retryable(), false)
                        test.eq(assert(canonical_json.encode(err:details())), assert(canonical_json.encode(direct_err:details())))
                        local rows = assert(db:query("SELECT policies,updated_at FROM kickside_security_scopes WHERE slug=$1", {slug}))
                        test.eq(rows[1].policies, raw)
                        test.eq(rows[1].updated_at, "before")
                    end)
                    test.is_nil(select(2, db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1", {slug})))
                    db:release()
                    if not ok then error(failure) end
                end)
            end
        end
    end)
end
return {run = test.run_cases(define_tests)}
