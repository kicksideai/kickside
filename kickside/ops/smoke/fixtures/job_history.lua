local jobs = require("jobs")
local lifecycle = require("lifecycle")
local fixture = require("job_fixture")
local sql = require("sql")
local time = require("time")
local clock = require("clock")

local function handler(args: table): (table?, error?)
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local dbtype = tostring(db:type())
    local owned: table[] = {}
    local instant = time.now()
    local tied = clock.format(instant, dbtype)
    local newer = clock.format(instant:add(time.MILLISECOND), dbtype)
    for _, owner in ipairs(args.thread_ids) do
        for index = 1, 3 do
            local enqueued, enqueue_err = jobs.enqueue({
                namespace = "smoke-history", scope = owner, key = tostring(index),
                owner_locator = { kind = "thread", id = owner },
                job_type = "app.smoke.job_history:parked", immutable_payload = {}, parked = true,
            })
            if enqueue_err or not enqueued then db:release(); return nil, enqueue_err end
            local id = enqueued.id
            local job, lease_err = fixture.lease_own(db, dbtype, id)
            if lease_err or not job then db:release(); return nil, lease_err end
            local run, run_err = lifecycle.start_job_run(db, dbtype, job, "smoke-history", 1)
            if run_err or not run then db:release(); return nil, run_err end
            local finish_err = lifecycle.finalize_job_run(db, dbtype, run, "success", {}, {}, nil)
            if finish_err then db:release(); return nil, finish_err end
            local complete_err = lifecycle.complete_job(db, job, dbtype, { terminal = true })
            if complete_err then db:release(); return nil, complete_err end
            local rank = owner == args.thread_ids[1] and index == 1 and 1 or 0
            for _, spec in ipairs({ { "kickside_job", "created_at", id }, { "kickside_job_run", "started_at", run.id } }) do
                local _, update_err = sql.builder.update(spec[1]):set(spec[2], rank == 1 and newer or tied)
                    :where(sql.builder.eq({ id = spec[3] })):run_with(db):exec()
                if update_err then db:release(); return nil, update_err end
            end
            owned[#owned + 1] = { id = id, run_id = run.id, thread_id = owner, rank = rank }
        end
    end
    local _, release_err = db:release()
    if release_err then return nil, release_err end
    return { rows = owned }, nil
end
return { handler = handler }
