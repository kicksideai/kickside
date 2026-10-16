local test = require("test")
local document = require("sync_document")

type Map = { [string]: any }

local function build(item: Map): (Map?, error?)
    return document.build({ content = "body" }, item, "owner", "upsert")
end

local function define_tests()
    test.describe("sync document provenance", function()
        test.it("preserves native provenance validation errors", function()
            local result, err = build({ item_key = "", dedup_key = "" })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().code, "source_ref_origin_id_required")
            test.eq(err:retryable(), false)
        end)
        test.it("builds provenance for valid source identity", function()
            local result, err = build({ item_key = "item", dedup_key = "dedup" })
            test.is_nil(err)
            test.eq(result.metadata.source_ref.origin.id, "item")
            test.eq(result.metadata.source_ref.external_id, "dedup")
            test.eq(result.metadata.source_ref.sync_id, "owner")
            test.eq(result.content, "body")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
