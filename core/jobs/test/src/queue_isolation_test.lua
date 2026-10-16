local test = require("test")
local fixture = require("job_fixture")
local lifecycle = require("lifecycle")
local claim = require("claim")

local function define_tests()
    test.describe("Jobs private queue isolation", function()
        test.it("rebuilds another suite's queue without erasing a held queue", function()
            local first, dbtype, first_err = fixture.private_queue("app:queue_isolation_a")
            if first_err or not first then error(tostring(first_err)) end
            local second
            local ok, failure = pcall(function()
                local id, enqueue_err = lifecycle.enqueue_job(first, dbtype, {
                    owner_locator = { kind = "test", id = "queue-isolation" },
                    job_type = "test.queue-isolation",
                    job_identity = { namespace = "test", scope = "queue-isolation", key = "first" },
                    scheduled_at = "2000-01-01T00:00:00Z",
                })
                test.is_nil(enqueue_err, tostring(enqueue_err))
                test.not_nil(id)
                local second_err
                second, _, second_err = fixture.private_queue("app:queue_isolation_b")
                if second_err or not second then error(tostring(second_err)) end
                local rows, read_err = first:query("SELECT id FROM kickside_job WHERE id=$1", { id })
                test.is_nil(read_err, tostring(read_err))
                test.eq(#rows, 1, "opening another queue preserves the first suite's rows")
                local empty, empty_err = claim.claim_batch(second, dbtype, 1)
                test.is_nil(empty_err, tostring(empty_err))
                test.eq(#empty, 0)
                local own, claim_err = claim.claim_batch(first, dbtype, 1)
                test.is_nil(claim_err, tostring(claim_err))
                test.eq(#own, 1)
                test.eq(own[1].id, id)
            end)
            if second then second:release() end
            first:release()
            if not ok then error(failure) end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
