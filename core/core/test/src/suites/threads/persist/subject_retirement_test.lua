-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local channel = require("channel")
local append = require("append")
local scaffold = require("scaffold")

local function retire(id: string, subjects: any, scope: any?): (any?, error?)
    local service, err = contract.get("kickside.core:threads")
    if err then return nil, err end
    local instance, open_err = service:with_scope(scope or security.named_scope("wippy.security:process")):open()
    if open_err then return nil, open_err end
    return instance:retire_subjects({thread_id = id, subjects = subjects})
end

local function write(id: string, events: {table}, expect: any?): (any?, error?)
    local db = scaffold.open_db()
    local tx, begin_err = db:begin()
    if begin_err then db:release(); return nil, begin_err end
    local result, err = append.append_events_tx(tx, id, events, {expect = expect})
    if err then tx:rollback() else tx:commit() end
    db:release()
    return result, err
end

local function count(id: string): number
    return tonumber(scaffold.query("SELECT COUNT(*) AS n FROM kickside_thread_subject WHERE thread_id=$1", {id})[1].n) :: number
end

local function define()
    test.describe("Owner subject retirement", function()
        test.it("drains exact bounded owner pages without touching other subjects or history", function()
            local id, other = scaffold.make_thread(), scaffold.make_thread()
            local events, names = {}, {}
            for i = 1, 205 do
                local name = "purged:" .. tostring(i)
                names[i], events[i] = name, {subject = name}
            end
            test.is_nil(select(2, write(id, events)))
            test.is_nil(select(2, write(id, {{subject = "live"}})))
            test.is_nil(select(2, write(other, {{subject = names[1]}})))
            for first = 1, #names, 100 do
                local page = {}
                for i = first, math.min(first + 99, #names) do page[#page + 1] = names[i] end
                local result, err = retire(id, page)
                test.is_nil(err)
                test.eq(result.thread_id, id)
                test.eq(result.retired, #page)
                test.eq(count(id), 206 - math.min(first + 99, #names))
                local replay, replay_err = retire(id, page)
                test.is_nil(replay_err)
                test.eq(replay.retired, 0)
            end
            test.eq(count(other), 1)
            test.eq(#scaffold.seqs_of(id), 206)
            test.eq(scaffold.boundary_of(id), 0)
            -- The owner has fenced purged identities forever. A stale positive
            -- expectation also fails in Core; zero is reserved for fresh identities.
            local value, err = write(id, {{subject = names[1]}}, {subject = names[1], version = 1})
            test.is_nil(value)
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(err:details().reason, "version_mismatch")
            test.eq(count(id), 1)
            local live, live_err = write(id, {{subject = "live"}}, {subject = "live", version = 1})
            test.is_nil(live_err)
            test.eq(live.events[1].subject_version, 2)
            test.is_nil(select(2, write(id, {{subject = "fresh"}}, {subject = "fresh", version = 0})))
        end)
        test.it("preserves retained duplicate replies after retirement without recreating versions", function()
            local id, event_id = scaffold.make_thread(), uuid.v7()
            local event = {id = event_id, subject = "purged"}
            local first, first_err = write(id, {event}, {subject = "purged", version = 0})
            test.is_nil(first_err)
            test.is_nil(select(2, retire(id, {"purged"})))
            local replay, err = write(id, {event}, {subject = "purged", version = 0})
            test.is_nil(err)
            test.eq(replay.inserted, 0)
            test.eq(replay.events[1].event_id, first.events[1].event_id)
            test.eq(replay.events[1].subject_version, 1)
            test.eq(count(id), 0)
        end)
        test.it("serializes a retirement page with the append thread lock", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, {{subject = "purged"}})))
            local db = scaffold.open_db()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local _, append_err = append.append_events_tx(tx, id, {{subject = "live"}})
            test.is_nil(append_err)
            local done = channel.new(1)
            coroutine.spawn(function()
                local result, err = retire(id, {"purged"})
                done:send({result = result, err = err})
            end)
            scaffold.await_lock_waiter(db:type())
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err)
            local retired = done:receive()
            test.is_nil(retired.err)
            test.eq(retired.result.retired, 1)
            test.eq(count(id), 1)
            test.eq(#scaffold.seqs_of(id), 2)
        end)
        test.it("uses the subject primary key for retirement selection", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, {{subject = "purged"}})))
            local db = scaffold.open_db()
            local dialect = scaffold.dialect()
            local statement = "DELETE FROM kickside_thread_subject WHERE thread_id=$1 AND subject IN ($2,$3)"
            local prefix = "EXPLAIN QUERY PLAN "
            if dialect == sql.type.POSTGRES then
                test.is_nil(select(2, db:execute("SET enable_seqscan=off")))
                prefix = "EXPLAIN "
            end
            local plan, err = db:query(prefix .. statement, {id, "purged", "missing"})
            if dialect == sql.type.POSTGRES then test.is_nil(select(2, db:execute("RESET enable_seqscan"))) end
            db:release()
            test.is_nil(err)
            local text = ""
            for _, row in ipairs(plan) do
                for _, value in pairs(row) do text = text .. tostring(value) .. "\n" end
            end
            local index_at = text:find(dialect == sql.type.POSTGRES and "kickside_thread_subject_pkey" or "INDEX", 1, true)
            test.not_nil(index_at)
        end)
        test.it("validates the whole page before deleting and rejects oversized or malformed pages", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, {{subject = "purged"}})))
            local too_many = {}
            for i = 1, 101 do too_many[i] = "purged:" .. tostring(i) end
            for _, page in ipairs({false, {}, {"purged", ""}, {"purged", false}, {"purged", "bad\n"},
                {string.rep("s", 257)}, {"purged", "purged"}, {named = "purged"}, too_many}) do
                local result, err = retire(id, page)
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.eq(count(id), 1)
            end
        end)
        test.it("requires the retirement capability even when ordinary runtime calls are allowed", function()
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, {{subject = "purged"}})))
            local scope = security.new_scope({assert(security.policy("app:test_constrained_writer_policy"))})
            local result, err = retire(id, {"purged"}, scope)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(count(id), 1)
            local class_scope = security.new_scope({assert(security.policy("app:test_constrained_writer_policy")),
                assert(security.policy("kickside.core.threads.persist:subject_retirement_class_policy"))})
            local accepted, accepted_err = retire(id, {"purged"}, class_scope)
            test.is_nil(accepted_err)
            test.eq(accepted.retired, 1)
            local foreign = scaffold.make_thread()
            scaffold.exec("UPDATE kickside_thread SET thread_class=$1 WHERE id=$2", {"foreign_class", foreign})
            test.is_nil(select(2, write(foreign, {{subject = "purged"}})))
            local denied, denied_err = retire(foreign, {"purged"}, class_scope)
            test.is_nil(denied)
            test.eq(denied_err:kind(), errors.PERMISSION_DENIED)
            test.eq(count(foreign), 1)
        end)
        test.it("refuses missing and deleting threads", function()
            local result, err = retire(uuid.v7(), {"purged"})
            test.is_nil(result)
            test.eq(err:kind(), errors.NOT_FOUND)
            local id = scaffold.make_thread()
            test.is_nil(select(2, write(id, {{subject = "purged"}})))
            scaffold.exec("UPDATE kickside_thread SET deleting_at=$1 WHERE id=$2", {scaffold.ts(0), id})
            result, err = retire(id, {"purged"})
            test.is_nil(result)
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(count(id), 1)
        end)
    end)
end
return test.run_cases(define)
