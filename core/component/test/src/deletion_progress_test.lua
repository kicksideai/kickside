local test = require("test")
local progress = require("progress")
local jobs = require("jobs")
local M = {}
M.run = test.run_cases(function()
    test.describe("component list deletion progress", function()
        test.it("batches distinct handles and projects only public job progress", function()
            jobs.calls, jobs.err = 0, nil
            jobs.rows = {first = {status = "dead", attempts = "3", last_error = "cleanup refused", payload = {secret = true}},
                second = {status = "running", attempts = 1}}
            local rows = {{deletion_job_id = "first"}, {deletion_job_id = "second"},
                {deletion_job_id = "first"}, {deletion_job_id = "missing", deletion_job = {status = "pending", attempts = 0}}, {}}
            local ok, err = progress.enrich(rows)
            test.is_nil(err)
            test.is_true(ok)
            test.eq(jobs.calls, 1)
            test.eq(#jobs.ids, 3)
            test.eq(rows[1].deletion_job.status, "dead")
            test.eq(rows[1].deletion_job.attempts, 3)
            test.eq(rows[1].deletion_job.last_error, "cleanup refused")
            test.is_nil(rows[1].deletion_job.payload)
            test.eq(rows[2].deletion_job.status, "running")
            test.eq(rows[3].deletion_job.attempts, 3)
            test.is_nil(rows[4].deletion_job)
            test.is_nil(rows[5].deletion_job)
        end)
        test.it("does not read jobs when authorized rows carry no handles", function()
            jobs.calls, jobs.err = 0, nil
            local ok, err = progress.enrich({{}, {deleting_at = "marked"}})
            test.is_true(ok)
            test.is_nil(err)
            test.eq(jobs.calls, 0)
        end)
        test.it("returns job read failures without converting them into missing progress", function()
            jobs.calls = 0
            jobs.err = errors.new({kind = errors.UNAVAILABLE, message = "jobs unavailable", retryable = true})
            local ok, err = progress.enrich({{deletion_job_id = "first"}})
            test.is_nil(ok)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(jobs.calls, 1)
            jobs.err = nil
        end)
    end)
end)
return M
