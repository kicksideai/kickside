local test = require("test")
local source_ref = require("source_ref")

local function define_tests()
    test.describe("Provenance Source Ref", function()
        test.it("builds the canonical origin envelope with optional correlation ids", function()
            local ref, err = source_ref.build({
                origin_type = "sync",
                origin_id = "item-1",
                sync_id = "sync-1",
                workflow_run_id = "run-1",
                approval_item_id = "approval-1",
            })
            test.is_nil(err)
            test.eq(ref.origin.type, "sync")
            test.eq(ref.origin.id, "item-1")
            test.eq(ref.sync_id, "sync-1")
            test.eq(ref.workflow_run_id, "run-1")
            test.eq(ref.approval_item_id, "approval-1")
        end)

        test.it("preserves local payload fields without preserving flat origin", function()
            local ref, err = source_ref.build({
                base = {
                    origin = "legacy-sync",
                    external_id = "dedup-1",
                    kind = "url",
                },
                fields = {
                    source_url = "https://example.test/a",
                },
                origin_type = "api.ingest_content",
                origin_id = "doc-1",
            })
            test.is_nil(err)
            test.eq(ref.origin.type, "api.ingest_content")
            test.eq(ref.origin.id, "doc-1")
            test.eq(ref.external_id, "dedup-1")
            test.eq(ref.kind, "url")
            test.eq(ref.source_url, "https://example.test/a")
        end)

        test.it("rejects missing origin primitives", function()
            local missing_type, terr = source_ref.build({ origin_id = "item-1" })
            test.is_nil(missing_type)
            test.is_true(errors.is(terr, errors.INVALID))
            test.eq(terr:retryable(), false)
            test.eq(terr:details().code, "source_ref_origin_type_required")

            local missing_id, ierr = source_ref.build({ origin_type = "sync" })
            test.is_nil(missing_id)
            test.is_true(errors.is(ierr, errors.INVALID))
            test.eq(ierr:retryable(), false)
            test.eq(ierr:details().code, "source_ref_origin_id_required")
        end)

        test.it("rejects a non-object argument with a stable native error code", function()
            local ref, err = source_ref.build("not an object")
            test.is_nil(ref)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "source_ref_args_invalid")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
