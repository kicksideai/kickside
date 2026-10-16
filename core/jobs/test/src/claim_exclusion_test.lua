local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local claim = require("claim")
local native = require("native")
local fixture = require("fixture")
local job_fixture = require("job_fixture")
local lifecycle = require("lifecycle")
local envelope = require("error_envelope")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim exclusion guard requires an error"})) end
    return err
end
local function with_queue(fn)
    local db, dbtype, err = job_fixture.private_queue("app:private_queue_claim_exclusion_test")
    if err then error(err) end
    if not db or type(dbtype) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim exclusion queue is missing"})) end
    local ok, run_err = pcall(fn, db, dbtype)
    local _, release_err = db:release()
    if not ok then
        if release_err then error(envelope.wrap_secondary(release_err, run_err, "claim exclusion queue release fails")) end
        error(run_err)
    end
    if release_err then error(release_err) end
end
return {run = test.run_cases(function()
    test.describe("atomic claim concurrency exclusion", function()
        for _, key in ipairs({"", "key"}) do
            test.it("a held key leaves an addressed row pending/" .. key, function()
                with_queue(function(db: sql.DB, dbtype: string)
                    local ids: {string} = {}
                    for _ = 1, 2 do
                        local id, err = lifecycle.enqueue_job(db, dbtype, {owner_locator = {kind = "test", id = "claim_exclusion"},
                            job_identity = {namespace = "claim_exclusion", scope = "test", key = uuid.v7()},
                            job_type = "app:worker", concurrency_key = key})
                        test.is_nil(err)
                        if type(id) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim exclusion job is missing"})) end
                        ids[#ids + 1] = id
                    end
                    local _, key_err = db:execute("UPDATE kickside_job SET concurrency_key=$1 WHERE id IN ($2,$3)", {key, ids[1], ids[2]}); test.is_nil(key_err)
                    local _, mark_err = db:execute("UPDATE kickside_job SET status='running' WHERE id=$1", {ids[1]}); test.is_nil(mark_err)
                    local tx, begin_err = db:begin(); test.is_nil(begin_err)
                    if not tx then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim exclusion transaction is missing"})) end
                    local leased, lease_err = claim.lease_row(tx, dbtype, ids[2], "token", "2026-10-11 00:00:00", "2026-10-10 00:00:00")
                    local _, rollback_err = tx:rollback(); test.is_nil(rollback_err)
                    test.is_nil(lease_err); test.is_nil(leased)
                    local rows, read_err = db:query("SELECT status,attempts,execution_seq,lease_token FROM kickside_job WHERE id=$1", {ids[2]})
                    test.is_nil(read_err); test.eq(rows[1].status, "pending"); test.eq(tonumber(rows[1].attempts), 0)
                    test.eq(tonumber(rows[1].execution_seq), 0); test.is_nil(rows[1].lease_token)
                    local _, free_err = db:execute("UPDATE kickside_job SET status='done' WHERE id=$1", {ids[1]}); test.is_nil(free_err)
                    local free_tx, free_begin_err = db:begin(); test.is_nil(free_begin_err)
                    if not free_tx then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim exclusion transaction is missing"})) end
                    local freed, freed_err = claim.lease_row(free_tx, dbtype, ids[2], "token", "2026-10-11 00:00:00", "2026-10-10 00:00:00")
                    local _, free_rollback_err = free_tx:rollback(); test.is_nil(free_rollback_err)
                    test.is_nil(freed_err); test.not_nil(freed); test.eq(freed.attempts, 1); test.eq(freed.execution_seq, 1)
                end)
            end)
        end
    end)
    test.describe("claim classification uses native cause", function()
        for _, route in ipairs({"single", "batch"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
                errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, retryable in ipairs({false, true}) do
                    for _, message in ipairs({"unique provider authorization policy", "provider authorization policy"}) do
                        test.it(route .. "/" .. kind .. "/" .. tostring(retryable) .. "/" .. message, function()
                            local source = errors.new({kind = kind, retryable = retryable, message = message, details = {code = "claim_exclusion_dependency", nested = {marker = "kept"}}})
                            fixture.reset(route, "lease", source)
                            local result, err
                            if route == "batch" then result, err = native.claim_batch(fixture.database(), "sqlite", 1, nil, nil, "worker")
                            else result, err = native.claim_job(fixture.database(), "sqlite") end
                            test.is_nil(result); local actual = required(err); test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
                            test.eq(actual:details().code, "claim_exclusion_dependency"); test.eq(actual:details().nested.marker, "kept")
                            test.eq(fixture.commits, 0); test.eq(fixture.rollbacks, 1); test.eq(fixture.updates, 1)
                        end)
                    end
                end
            end
        end
    end)
end)}
