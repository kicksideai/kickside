local test = require("test")
local references = require("declaration_references")
local THREAD_ID = "11111111-1111-4111-8111-111111111111"

local function schema(): any
    return {
        type = "object",
        properties = {
            source = { type = "object", properties = {
                thread_id = { type = "string", ["x-reference"] = { kind = "thread", access = "READ" } },
                note = { type = "string" },
            } },
            targets = { type = "array", items = { type = "string",
                ["x-reference"] = { kind = "component", access = "WRITE" } } },
        },
    }
end

local function define_tests(): ()
    test.describe("declared automation references", function()
        test.it("protects implicit objects, false values and removed parents", function()
            local input = { properties = { nested = { properties = {
                enabled = { type = "boolean", ["x-authority"] = "subject" },
            } } } }
            for _, after in ipairs({ { nested = { enabled = false } }, {} }) do
                local err = references.validate_edit(input, { nested = { enabled = true } }, after, "operator", "subject")
                test.not_nil(err)
                test.eq(err:kind(), errors.PERMISSION_DENIED)
                test.is_nil(references.validate_edit(input, { nested = { enabled = true } }, after, "subject", "subject"))
            end
        end)
        test.it("collects grants from implicit object schemas", function()
            local refs, err = references.collect({ properties = { id = {
                type = "string", ["x-reference"] = { kind = "component", access = "READ" },
            } } }, { id = "component-1" })
            test.is_nil(err, tostring(err))
            test.eq(#refs, 1)
            test.eq(refs[1].id, "component-1")
        end)
        test.it("refuses protected composition and cyclic schemas without interpreting them", function()
            local marked = { type = "string", ["x-authority"] = "subject" }
            for _, input in ipairs({ { allOf = { { properties = { code = marked } } } },
                { ["$defs"] = { code = marked } }, { type = "array", items = { marked } } }) do
                local _, err = references.collect(input, {})
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.contains(tostring(err), "unsupported schema position")
            end
            local cyclic = { type = "object", properties = {} }
            cyclic.properties.self = cyclic
            local _, err = references.collect(cyclic, {})
            test.not_nil(err)
            test.contains(tostring(err), "cyclic")
        end)

        test.it("collects only annotated nested fields and array items", function()
            local refs, err = references.collect(schema(), {
                source = { thread_id = THREAD_ID, note = "component-secret" },
                targets = { "target-1", "target-2" },
                undeclared = "ignored",
            })
            test.is_nil(err, tostring(err))
            test.eq(#refs, 3)
            test.eq(refs[1].path, "source.thread_id")
            test.eq(refs[1].id, THREAD_ID)
            test.eq(refs[1].kind, "thread")
            test.eq(refs[1].access, "READ")
            test.eq(refs[2].path, "targets[1]")
            test.eq(refs[2].id, "target-1")
            test.eq(refs[3].path, "targets[2]")
        end)

        test.it("refuses malformed annotations and empty referenced ids", function()
            local bad = schema()
            bad.properties.source.properties.thread_id["x-reference"].access = nil
            local _, err = references.collect(bad, { source = { thread_id = "thread-1" } })
            test.not_nil(err)
            local _, empty_err = references.collect(schema(), { source = { thread_id = "" } })
            test.not_nil(empty_err)
        end)

        test.it("does not treat an unannotated id as a grant", function()
            local refs, err = references.collect({ type = "object", properties = {
                connection_id = { type = "string" },
            } }, { connection_id = "connection-1" })
            test.is_nil(err, tostring(err))
            test.eq(#refs, 0)
        end)
    end)
end

return test.run_cases(define_tests)
