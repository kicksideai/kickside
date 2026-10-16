local test = require("test")
local create_policy = require("create_policy")

local function define_tests()
    test.describe("connection create policy", function()
        test.it("normalizes a valid create body", function()
            local fields, err = create_policy.fields({
                impl_id = "provider:test",
                name = "Primary",
                description = "Main account",
                private_context = { token = "x" },
            })
            test.is_nil(err)
            test.not_nil(fields)
            test.eq(fields.impl_id, "provider:test")
            test.eq(fields.name, "Primary")
            test.eq(fields.description, "Main account")
            test.eq(fields.private_context.token, "x")
            test.eq(fields.validate, true, "a connection is tested before it is stored")
        end)

        test.it("stores without testing only when the caller opts out", function()
            local fields, err = create_policy.fields({
                impl_id = "provider:test", name = "Primary", validate = false,
            })
            test.is_nil(err)
            test.eq(fields.validate, false)
        end)

        test.it("validates by default for every input other than explicit false", function()
            for _, value in ipairs({ true, 0, "false" }) do
                local fields, err = create_policy.fields({ impl_id = "provider:test", name = "Primary", validate = value })
                test.is_nil(err)
                test.eq(fields.validate, true)
            end
            local fields, err = create_policy.fields({ impl_id = "provider:test", name = "Primary" })
            test.is_nil(err)
            test.eq(fields.validate, true)
        end)

        test.it("defaults optional description and private_context", function()
            local fields, err = create_policy.fields({ impl_id = "provider:test", name = "Primary" })
            test.is_nil(err)
            test.not_nil(fields)
            test.eq(fields.description, "")
            test.eq(type(fields.private_context), "table")
        end)

        test.it("validates schema-declared private context", function()
            local entry = {
                meta = {
                    credential_schema = {
                        fields = {
                            { key = "api_key", type = "password", required = true },
                            { key = "region", type = "select", options = { "us", { label = "EU", value = "eu" } } },
                            { key = "pat", type = "password", required_if = { key = "region", equals = "eu" } },
                        },
                    },
                },
            }
            test.is_nil(create_policy.validate_private_context(entry, { api_key = "k", region = "us" }))
            test.is_nil(create_policy.validate_private_context(entry, { api_key = "k", region = "eu", pat = "p" }))
            test.eq(create_policy.validate_private_context(entry, { api_key = "k", region = "eu" }), "pat is required")
            test.eq(create_policy.validate_private_context(entry, { region = "eu" }), "api_key is required")
            test.eq(create_policy.validate_private_context(entry, { api_key = "k", extra = "x" }), "private_context contains undeclared field: extra")
            test.eq(create_policy.validate_private_context(entry, { api_key = "k", region = "ap" }), "region must be one of the declared options")
        end)

        test.it("rejects malformed fields", function()
            local fields, err = create_policy.fields({ impl_id = "", name = "x" })
            test.is_nil(fields)
            test.eq(err, "impl_id is required")

            fields, err = create_policy.fields({ impl_id = "x", name = "n", private_context = "secret" })
            test.is_nil(fields)
            test.eq(err, "private_context must be a table")
        end)

        test.it("recognizes only connection contract bindings", function()
            local entry = {
                kind = "contract.binding",
                data = {
                    contracts = {
                        { contract = "kickside.connection:connection" },
                    },
                },
            }
            test.eq(create_policy.is_connection_binding(entry, "kickside.connection:connection"), true)
            test.eq(create_policy.is_connection_binding(entry, "other:contract"), false)
            test.eq(create_policy.is_connection_binding({ kind = "registry.entry" }, "kickside.connection:connection"), false)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
