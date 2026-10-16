local sql = require("sql")
local jobs = require("jobs")
local claim = require("claim")
local uuid = require("uuid")

local function run(args: table): table
    if args.mode == "enqueue" then
        local enqueued, err = jobs.enqueue({
            owner_locator = { kind = "test", id = "concurrency_probe" },
            job_type = "app:generic_job_target",
            namespace = "drive", scope = args.scope, key = "slot",
            immutable_payload = { scope = args.scope },
            parked = true,
        })
        return { id = enqueued and enqueued.id, error = err and tostring(err) or nil }
    end
    if args.mode == "owner_enqueue" then
        local enqueued, err = jobs.enqueue({
            owner_locator = { kind = "test", id = args.scope },
            job_type = "app:generic_job_target", namespace = "owner-race",
            scope = args.scope, key = uuid.v7(), immutable_payload = {}, parked = true,
        })
        return { id = enqueued and enqueued.id, error = err and tostring(err) or nil }
    end
    if args.mode == "claim" then
        if type(args.db_id) ~= "string" then return { error = "claim probe requires db_id" } end
        local db, db_err = sql.get(args.db_id)
        if db_err or not db then return { error = tostring(db_err) } end
        local dbtype, type_err = db:type()
        if type_err then db:release(); return { error = tostring(type_err) } end
        local rows, claim_err = claim.claim_batch(db, tostring(dbtype), 4)
        db:release()
        local keys = {}
        for _, row in ipairs(rows or {}) do keys[#keys + 1] = row.concurrency_key end
        return { keys = keys, error = claim_err and tostring(claim_err) or nil }
    end
    return { error = "unknown probe mode" }
end

return { run = run }
