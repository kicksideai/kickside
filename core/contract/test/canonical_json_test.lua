local test = require("test")
local canonical_json = require("canonical_json")

local function define_tests()
    test.describe("canonical JSON", function()
        test.it("encodes object keys in sorted order at every depth, independent of insertion order", function()
            local a: { [string]: any } = {}
            a.zeta = 1
            a.alpha = { y = true, x = { 3, 2, 1 } }
            local b: { [string]: any } = {}
            b.alpha = { x = { 3, 2, 1 }, y = true }
            b.zeta = 1
            local encoded, err = canonical_json.encode(a)
            test.is_nil(err, tostring(err))
            test.eq(encoded, '{"alpha":{"x":[3,2,1],"y":true},"zeta":1}')
            test.eq(canonical_json.encode(b), encoded)
            test.eq(canonical_json.encode({}), "[]")
            test.eq(canonical_json.encode("s"), '"s"')
        end)

        test.it("preserves explicitly marked empty objects without changing unmarked arrays", function()
            local object = canonical_json.object({})
            test.eq(canonical_json.encode({ map = object, list = {} }), '{"list":[],"map":{}}')
            test.eq(canonical_json.encode(object), "{}")
        end)

        test.it("normalizes schema objects while preserving arrays and annotation values", function()
            local schema = canonical_json.normalize_schema({
                properties = { anything = {}, list = { type = "array", items = {} } },
                ["$defs"] = {}, additionalProperties = {}, required = {},
                prefixItems = { {}, false }, allOf = { {} },
                enum = { {}, { 1, 2 } }, default = {}, examples = {},
            })
            test.eq(canonical_json.encode(schema),
                '{"$defs":{},"additionalProperties":{},"allOf":[{}],"default":[],"enum":[[],[1,2]],"examples":[],"prefixItems":[{},false],"properties":{"anything":{},"list":{"items":{},"type":"array"}},"required":[]}')
        end)

        test.it("hashes equal values alike and different values apart", function()
            local first, err = canonical_json.hash({ a = 1, b = { "x" } })
            test.is_nil(err, tostring(err))
            test.eq(#first, 64)
            test.eq(canonical_json.hash({ b = { "x" }, a = 1 }), first)
            test.neq(canonical_json.hash({ a = 2, b = { "x" } }), first)
        end)

        test.it("refuses a cyclic table and a non-string object key", function()
            local cyclic: { [string]: any } = {}
            cyclic.self = cyclic
            local _, cycle_err = canonical_json.encode(cyclic)
            test.not_nil(cycle_err)
            local _, key_err = canonical_json.encode({ [true] = 1, a = 2 })
            test.not_nil(key_err)
        end)
    end)
end

return test.run_cases(define_tests)
