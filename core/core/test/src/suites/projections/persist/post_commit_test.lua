-- Drive the real jobs slot, apply transaction and declared post-commit worker.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local writer = require("writer")
local invoke = require("invoke")
local claim = require("claim")

local function run_case(mode: string)
    local db = assert(sql.get("app:db"))
    assert(db:execute([[CREATE TABLE IF NOT EXISTS projection_commit_probe
        (projection_id TEXT PRIMARY KEY, calls INTEGER NOT NULL)]]))
    local id = uuid.v7()
    local head = 1
    assert(db:execute([[INSERT INTO kickside_thread
        (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,$3)]], { id, id, head }))
    if head > 0 then
        assert(db:execute([[INSERT INTO kickside_event
            (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user','{}',1)]], { uuid.v7(), id }))
    end
    local registered, register_err = writer.register_projection(db, id, {
        kind = "post-commit-test", worker_ref = "func://app:commit_probe_worker",
        worker_input_mode = "prefetch_events", system_identity = true,
        worker_config = { mode = mode },
    })
    test.is_nil(register_err)
    if mode == "idle" then
        assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=1 WHERE id=$1", { registered.cursor_id }))
        assert(db:execute("UPDATE kickside_projection SET last_event_seq=1 WHERE id=$1", { registered.projection_id }))
    end
    local dbtype = db:type()
    db:release()
    local claim_db = assert(sql.get("app:db"))
    local claimed, claim_err = claim.claim_batch(claim_db, tostring(dbtype), 16, nil, nil)
    claim_db:release()
    test.is_nil(claim_err)
    local job: any = nil
    for _, row in ipairs(claimed or {}) do
        if row.id == registered.job_id then job = row end
    end
    test.not_nil(job)
    if mode == "lease" then job.lease_token = "wrong-token" end
    local result, advance_err = invoke.run({ job = job, payload = { cursor_id = registered.cursor_id } })
    if mode == "lease" or mode == "fail" then test.not_nil(advance_err)
    else test.is_nil(advance_err) end
    if mode == "stale" then test.eq(result.stale, true) end
    local check = assert(sql.get("app:db"))
    local probes = assert(check:query("SELECT calls FROM projection_commit_probe WHERE projection_id=$1", { registered.projection_id }))
    local models = assert(check:query("SELECT last_event_seq FROM kickside_projection WHERE id=$1", { registered.projection_id }))
    check:release()
    if mode == "success" then
        test.eq(#probes, 1)
        test.eq(tonumber(probes[1].calls), 1)
        test.eq(tonumber(models[1].last_event_seq), 1)
        -- A repeated completed lease may not publish the callback again.
        local _, replay_err = invoke.run({ job = job, payload = { cursor_id = registered.cursor_id } })
        test.not_nil(replay_err)
        local replay_db = assert(sql.get("app:db"))
        local replay = assert(replay_db:query("SELECT calls FROM projection_commit_probe WHERE projection_id=$1", { registered.projection_id }))
        replay_db:release()
        test.eq(tonumber(replay[1].calls), 1)
    else
        test.eq(#probes, 0)
        test.eq(tonumber(models[1].last_event_seq), mode == "idle" and 1 or 0)
    end
end

local function define_tests()
    test.describe("projection post-commit notification", function()
        for _, mode in ipairs({ "success", "lease", "stale", "fail", "idle" }) do
            test.it("observes committed state only: " .. mode, function() run_case(mode) end)
        end
    end)
end
return { run = test.run_cases(define_tests) }
