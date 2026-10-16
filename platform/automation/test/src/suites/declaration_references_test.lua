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
