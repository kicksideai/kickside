local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local channel = require("channel")
local append = require("append")
local writer = require("writer")
local teardown = require("teardown")
local scaffold = require("scaffold")
local query, open_db = scaffold.query, scaffold.open_db

local function write(id: string, events: { table }, expect: any): (any?, error?)
    local db = open_db()
    local tx, begin_err = db:begin()
    if begin_err then db:release(); return nil, begin_err end
    local result, err = append.append_events_tx(tx, id, events, { expect = expect })
    if err then
        local _, rollback_err = tx:rollback()
        if rollback_err then error(tostring(rollback_err)) end
    else
        local _, commit_err = tx:commit()
        if commit_err then db:release(); return nil, commit_err end
    end
    db:release()
    return result, err
end
local function version(id: string, subject: string): number
    local rows = query("SELECT version FROM kickside_thread_subject WHERE thread_id=$1 AND subject=$2", { id, subject })
    return #rows == 0 and 0 or tonumber(rows[1].version) :: number
end
local function conflict(err: any, reason: string)
    test.not_nil(err)
    test.eq(err:kind(), errors.CONFLICT)
    test.eq(err:details().reason, reason)
end
local function define_tests()
    test.describe("Thread subject concurrency", function()
        test.it("checks head and reports current and expected values", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, { {} }, { head = 0 })))
            local result, err = write(id, { {} }, { head = 0 })
            test.is_nil(result)
            conflict(err, "head_mismatch")
            test.eq(err:details().head, 1)
            test.eq(err:details().expected_head, 0)
            test.eq(#scaffold.seqs_of(id), 1)
        end)
        test.it("creates at zero and increments repeated subjects in order", function()
            local id = scaffold.make_thread()
            local result, err = write(id, { { subject = "settings" }, { subject = "settings" } },
                { subject = "settings", version = 0, head = 0 })
            test.is_nil(err)
            test.eq(result.events[1].subject, "settings")
            test.eq(result.events[1].subject_version, 1)
            test.eq(result.events[2].subject_version, 2)
            test.eq(version(id, "settings"), 2)
            local _, stale = write(id, { { subject = "settings" } }, { subject = "settings", version = 0 })
            conflict(stale, "version_mismatch")
            test.eq(stale:details().subject, "settings")
            test.eq(stale:details().version, 2)
            test.eq(stale:details().expected, 0)
            test.is_nil(select(2, write(id, { { subject = "settings" } }, { subject = "settings", version = 2 })))
            test.is_nil(select(2, write(id, { { subject = "sync" } }, { subject = "sync", version = 0 })))
            test.eq(version(id, "settings"), 3)
            test.eq(version(id, "sync"), 1)
        end)
        test.it("rolls back all writes and versions on a later conflict", function()
            local a, b = scaffold.make_thread(), scaffold.make_thread()
            if b < a then a, b = b, a end
            test.is_nil(select(2, write(b, { { subject = "schema" } }, nil)))
            local db = open_db()
            local result, err = writer.ingest_multi(db, {
                { thread_id = a, events = { { subject = "settings" } }, expect = { subject = "settings", version = 0 } },
                { thread_id = b, events = { { subject = "settings" } },
                    expect = { subject = "settings", version = 0, also = { subject = "schema", version = 0 } } },
            }, nil, true)
            db:release()
            test.is_nil(result)
            conflict(err, "version_mismatch")
            test.eq(err:details().subject, "schema")
            test.eq(err:details().version, 1)
            test.eq(err:details().expected, 0)
            test.eq(#scaffold.seqs_of(a), 0)
            test.eq(version(a, "settings"), 0)
            test.eq(#scaffold.seqs_of(b), 1)
            test.eq(version(b, "settings"), 0)
        end)
        test.it("returns id and external retries after both versions move and rejects mixed retries", function()
            local id = scaffold.make_thread()
            local expect = { subject = "settings", version = 0, also = { subject = "schema", version = 0 }, head = 0 }
            local events = { { id = uuid.v7(), subject = "settings" },
                { subject = "settings", external = { external_source = "settings", external_id = "save-1" } } }
            local first, err = write(id, events, expect)
            test.is_nil(err)
            test.is_nil(select(2, write(id, { { subject = "settings" }, { subject = "schema" } },
                { subject = "settings", version = 2 })))
            local retry, retry_err = write(id, events, expect)
            test.is_nil(retry_err)
            test.eq(retry.inserted, 0)
            test.eq(retry.duplicates, 2)
            for i = 1, 2 do
                test.eq(retry.events[i].duplicate, true)
                test.eq(retry.events[i].event_id, first.events[i].event_id)
                test.eq(retry.events[i].seq, first.events[i].seq)
                test.eq(retry.events[i].subject, first.events[i].subject)
                test.eq(retry.events[i].subject_version, first.events[i].subject_version)
            end
            test.eq(version(id, "settings"), 3)
            test.eq(version(id, "schema"), 1)
            test.eq(#scaffold.seqs_of(id), 4)
            expect.head = nil
            local _, mixed = write(id, { events[1], { subject = "settings" } }, expect)
            conflict(mixed, "version_mismatch")
            test.eq(mixed:details().subject, "settings")
        end)
        test.it("refuses identity retries that name a different subject", function()
            for _, external in ipairs({ false, true }) do
                local id = scaffold.make_thread()
                local event: any = { id = uuid.v7(), subject = "original" }
                if external then event.id = nil; event.external = { external_source = "settings", external_id = uuid.v7() } end
                test.is_nil(select(2, write(id, { event }, { subject = "original", version = 0 })))
                event.subject = "different"
                local result, err = write(id, { event }, { subject = "different", version = 0 })
                test.is_nil(result)
                conflict(err, "event_subject_mismatch")
                test.eq(version(id, "original"), 1)
                test.eq(version(id, "different"), 0)
            end
        end)
        test.it("rejects mismatched subjects after a fresh event in a guarded batch", function()
            for _, stored in ipairs({ false, true }) do
                local id = scaffold.make_thread()
                local original = { id = uuid.v7(), subject = "original" }
                local head = 0
                if stored then
                    test.is_nil(select(2, write(id, { original }, { head = 0 })))
                    head = 1
                end
                local result, err = write(id, {
                    stored and { subject = "fresh" } or original,
                    { id = original.id, subject = "different" },
                }, { head = head })
                test.is_nil(result)
                conflict(err, "event_subject_mismatch")
                test.eq(#scaffold.seqs_of(id), head)
                test.eq(version(id, "original"), head)
                test.eq(version(id, "fresh"), 0)
                test.eq(version(id, "different"), 0)
            end
        end)
        test.it("refuses seq-only collisions with a matching expectation", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, { { subject = "settings" } }, nil)))
            local result, err = write(id, { { seq = 1, subject = "settings" } }, { subject = "settings", version = 1 })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(version(id, "settings"), 1)
        end)
        test.it("rejects malformed subjects and expectations without writing", function()
            local id = scaffold.make_thread()
            for _, subject in ipairs({ "", "a\n", string.rep("s", 257), 42, false }) do
                local _, err = write(id, { { subject = subject } }, nil)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
            for _, expect in ipairs({ false, 1, {}, { head = -1 }, { head = 1.5 }, { head = "0" },
                { subject = "settings" }, { version = 0 }, { subject = "", version = 0 },
                { subject = "settings", version = -1 }, { head = 0, unknown = true } }) do
                local _, err = write(id, { {} }, expect)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
            test.eq(#scaffold.seqs_of(id), 0)
        end)
        test.it("rejects malformed and cross-thread secondary expectations", function()
            local id, other = scaffold.make_thread(), scaffold.make_thread()
            test.is_nil(select(2, write(other, { { subject = "schema" } }, nil)))
            local events = { { subject = "settings" } }
            local _, no_primary = write(id, events, { head = 0, also = { subject = "schema", version = 0 } })
            test.is_true(errors.is(no_primary, errors.INVALID))
            for _, also in ipairs({ false, "schema", {}, { subject = "schema" }, { version = 0 },
                { subject = "", version = 0 }, { subject = "schema\n", version = 0 },
                { subject = "settings", version = 0 }, { subject = "schema", version = -1 },
                { subject = "schema", version = 0.5 }, { subject = "schema", version = math.huge },
                { subject = "schema", version = "0" }, { subject = "schema", version = 1, thread_id = other },
                { { subject = "schema", version = 0 } },
            }) do
                local _, err = write(id, events, { subject = "settings", version = 0, also = also })
                test.is_true(errors.is(err, errors.INVALID))
            end
            local _, wrong_thread_version = write(id, events,
                { subject = "settings", version = 0, also = { subject = "schema", version = 1 } })
            conflict(wrong_thread_version, "version_mismatch")
            test.eq(wrong_thread_version:details().version, 0)
            test.eq(#scaffold.seqs_of(id), 0)
            test.is_nil(select(2, write(id, events,
                { subject = "settings", version = 0, also = { subject = "schema", version = 0 } })))
        end)
        test.it("keeps versions through pruning and removes them through teardown", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, { { subject = "settings", created_at = scaffold.ts(-10) } }, nil)))
            local pruned, prune_err = scaffold.run_prune(id)
            test.is_nil(prune_err)
            test.eq(pruned.deleted, 1)
            test.eq(version(id, "settings"), 1)
            local next, err = write(id, { { subject = "settings" } }, { subject = "settings", version = 1 })
            test.is_nil(err)
            test.eq(next.events[1].subject_version, 2)
            local db = open_db()
            local purged, purge_err = teardown.purge_thread(db, id)
            db:release()
            test.is_nil(purge_err)
            test.eq(purged.purged, true)
            test.eq(version(id, "settings"), 0)
        end)
        test.it("lets exactly one of two transactions create the same subject", function()
            local id = scaffold.make_thread()
            local dbtype = scaffold.dialect()
            local db = open_db()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local first, err = append.append_events_tx(tx, id, { { subject = "settings" } },
                { expect = { subject = "settings", version = 0 } })
            test.is_nil(err)
            local done = channel.new(1)
            coroutine.spawn(function()
                local result, other_err = write(id, { { subject = "settings" } }, { subject = "settings", version = 0 })
                done:send({ result = result, err = other_err })
            end)
            scaffold.await_lock_waiter(dbtype)
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err)
            local other = done:receive()
            test.eq(first.inserted, 1)
            test.is_nil(other.result)
            conflict(other.err, "version_mismatch")
            test.eq(version(id, "settings"), 1)
            test.eq(#scaffold.seqs_of(id), 1)
        end)
        for _, race in ipairs({
            { subject = "other-item", label = "accepts a guarded append after an unrelated append" },
            { subject = "schema", label = "rejects a guarded append after its secondary subject advances" },
            { subject = "item", label = "still rejects stale primary versions with a secondary guard" },
        }) do
            test.it(race.label, function()
                local id = scaffold.make_thread()
                test.is_nil(select(2, write(id, { { subject = "item" }, { subject = "schema" } }, nil)))
                local dbtype = scaffold.dialect()
                local db = open_db()
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                local _, err = append.append_events_tx(tx, id, { { subject = race.subject } })
                test.is_nil(err)
                local expect = { subject = "item", version = 1, also = { subject = "schema", version = 1 } }
                local events = { { subject = "item" } }
                local done = channel.new(1)
                coroutine.spawn(function()
                    local result, stale = write(id, events, expect)
                    done:send({ result = result, err = stale })
                end)
                scaffold.await_lock_waiter(dbtype)
                local _, commit_err = tx:commit()
                db:release()
                test.is_nil(commit_err)
                local guarded = done:receive()
                if race.subject == "other-item" then
                    test.is_nil(guarded.err)
                    test.eq(guarded.result.events[1].seq, 4)
                    test.eq(guarded.result.events[1].subject_version, 2)
                else
                    test.is_nil(guarded.result)
                    conflict(guarded.err, "version_mismatch")
                    test.eq(guarded.err:details().subject, race.subject)
                    test.eq(guarded.err:details().version, 2)
                    test.eq(guarded.err:details().expected, 1)
                    test.eq(#scaffold.seqs_of(id), 3)
                    test.eq(version(id, "item"), race.subject == "item" and 2 or 1)
                    test.eq(version(id, "schema"), race.subject == "schema" and 2 or 1)
                    if race.subject == "schema" then
                        expect.also.version = 2
                        test.is_nil(select(2, write(id, events, expect)))
                    end
                end
            end)
        end
        local function check_index(statement: string, args: {string})
            local dbtype = scaffold.dialect()
            local db = open_db()
            local plan, err
            if dbtype == sql.type.POSTGRES then
                local _, setting_err = db:execute("SET enable_seqscan = off")
                test.is_nil(setting_err)
                plan, err = db:query("EXPLAIN " .. statement, args)
                local _, reset_err = db:execute("RESET enable_seqscan")
                test.is_nil(reset_err)
            else
                plan, err = db:query("EXPLAIN QUERY PLAN " .. statement, args)
            end
            db:release()
            test.is_nil(err)
            local text = ""
            for _, row in ipairs(plan) do
                for _, value in pairs(row) do text = text .. tostring(value) .. "\n" end
            end
            local index_at = text:find(dbtype == sql.type.POSTGRES and "kickside_thread_subject_pkey" or "INDEX", 1, true)
            test.not_nil(index_at)
        end
        test.it("uses the subject primary key for single and dual version reads", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, { { subject = "settings" }, { subject = "schema" } }, nil)))
            check_index("SELECT version FROM kickside_thread_subject WHERE thread_id=$1 AND subject=$2", { id, "settings" })
            check_index("SELECT subject, version FROM kickside_thread_subject WHERE thread_id=$1 AND subject IN ($2, $3)",
                { id, "settings", "schema" })
        end)
    end)
end
return test.run_cases(define_tests)
