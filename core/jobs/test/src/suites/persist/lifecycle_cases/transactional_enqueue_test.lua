-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local store = require("store")
local jobs = require("jobs")

return {run = test.run_cases(function()
    test.describe("transactional enqueue", function()
        test.it("enqueues and commits with a cold Settings cache", function()
            local db = assert(sql.get("app:db"))
            local tx = assert(db:begin())
            local cache = assert(store.get("kickside.settings:cache"))
            cache:delete("snapshot-v2")
            cache:release()

            local queued = assert(jobs.enqueue_tx(tx, tostring(db:type()), {
                namespace = "test", scope = uuid.v7(), key = "transactional-enqueue",
                owner_locator = {kind = "test", id = "transactional-enqueue"},
                job_type = "app:generic_job_target", immutable_payload = {}, parked = true,
            }))
            assert(tx:commit())
            db:release()

            local row = assert(jobs.get_job(queued.id))
            test.eq(row.status, "pending")
        end)
    end)
end)}
