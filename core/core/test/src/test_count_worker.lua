-- Test-only projection worker. Catch-up invokes it through worker.run with the
-- standard input envelope; it accumulates the count of events seen so far into
-- the projection body and returns the patched body plus the new last_seq. Real
-- workers (agent extractors, digesters) live outside core; this one exercises the
-- engine's invoke/advance/persist loop without pulling in any of them.

local sql = require("sql")

local function run(input: table): table
    local input_tbl: table = type(input) == "table" and input or {}
    local projection: table = type(input_tbl.projection) == "table" and input_tbl.projection or {}
    local body: table = type(projection.body) == "table" and projection.body or {}
    local range: table = type(input_tbl.range) == "table" and input_tbl.range or {}

    local processed = tonumber(range.processed_count) or 0
    local stats: table = type(body.stats) == "table" and body.stats or {}
    local prior = tonumber(stats.count) or 0
    stats.count = prior + processed
    body.stats = stats

    local output = {
        body = body,
        last_seq = tonumber(range.to_seq) or nil,
    }

    local cfg: table = type(body.worker_config) == "table" and body.worker_config or {}
    if cfg.read_db == true then
        local db, db_err = sql.get("app:db")
        if db_err or not db then error("projection worker DB unavailable: " .. tostring(db_err)) end
        local rows, read_err = db:query("SELECT event_count FROM kickside_thread WHERE id=$1", { input_tbl.thread_id })
        local _, release_err = db:release()
        if read_err or release_err or not rows or not rows[1] then
            error("projection worker thread read failed: " .. tostring(read_err or release_err))
        end
    end
    if cfg.fail == true then
        error(tostring(cfg.fail_message or "configured projection worker failure"))
    end

    local append_cfg = (type(cfg.append_test_event) == "table" and cfg.append_test_event or nil) :: table?
    if append_cfg and tonumber(append_cfg.when_to_seq) == tonumber(range.to_seq) then
        output.append_events = {
            {
                thread_id = append_cfg.thread_id or input_tbl.thread_id,
                events = {
                    {
                        type = tostring(append_cfg.event_type or "kickside.test:post_commit"),
                        role = "system",
                        body = {
                            batch_to_seq = tonumber(range.to_seq) or 0,
                        },
                        external = {
                            external_source = "projection.test",
                            external_id = tostring(append_cfg.external_id or "post-commit"),
                            external_version = "v1",
                        },
                    },
                },
            },
        }
    end
    if cfg.bad_append_json == true and output.append_events then
        output.append_events[1].events[1].body_json = false
    end
    if cfg.named_append_write == true and output.append_events then
        output.append_events.ignored = output.append_events[1]
    end
    if cfg.named_append_event == true and output.append_events then
        output.append_events[1].events.ignored = output.append_events[1].events[1]
    end
    if cfg.invalid_append_events == true then
        output.append_events = {
            {
                thread_id = input_tbl.thread_id,
                events = { "not-an-event-object" },
            },
        }
    end
    if cfg.invalid_body == true then
        local bad_body = {}
        bad_body.self = bad_body
        output.body = bad_body
    end

    return output
end

return { run = run }
