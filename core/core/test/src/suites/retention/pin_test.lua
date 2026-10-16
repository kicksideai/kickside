-- Retention pin fences (design v4 §4.9, CONTRACTS threads/retention): command
-- generation fences on lower, pin generation fences on raise and release,
-- tombstones that outlive the pin, and the prune boundary. Thread rows are
-- inserted directly; every refusal is checked to leave the stored pin intact.
-- Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local channel = require("channel")
local pin = require("pin")
local teardown = require("threads_teardown")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("pin test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function exec(statement: string, params: { any }): ()
    local db = open_db()
    local _, err = db:execute(statement, params)
    db:release()
    if err then error(tostring(err)) end
end

local function query(statement: string, params: { any }): { table }
    local db = open_db()
    local rows, err = db:query(statement, params)
    db:release()
    if err then error(tostring(err)) end
    return rows :: { table }
end

local function make_thread(): string
    local id = uuid.v7()
    exec("INSERT INTO kickside_thread (id, thread_class, component_id, event_count) VALUES ($1, $2, $3, 0)",
        { id, "pin_test", id })
    return id
end

local function set_boundary(thread_id: string, max_pruned_seq: integer): ()
    exec("UPDATE kickside_thread SET max_pruned_seq = $1 WHERE id = $2", { max_pruned_seq, thread_id })
end

local function pin_row(thread_id: string, consumer_key: string): table?
    local rows = query("SELECT cursor_seq, generation, command_id, command_generation FROM kickside_retention_pin"
        .. " WHERE thread_id = $1 AND consumer_key = $2", { thread_id, consumer_key })
    local row = rows[1]
    if not row then return nil end
    return {
        cursor_seq = math.floor(tonumber(row.cursor_seq) :: number),
        generation = math.floor(tonumber(row.generation) :: number),
        command_id = row.command_id,
        command_generation = math.floor(tonumber(row.command_generation) :: number),
    }
end

local function tombstone_row(thread_id: string, consumer_key: string): table?
    local rows = query("SELECT command_id, command_generation, pin_generation, terminal_op_id, installed_at"
        .. " FROM kickside_retention_pin_tombstone WHERE thread_id = $1 AND consumer_key = $2", { thread_id, consumer_key })
    local row = rows[1]
    if not row then return nil end
    return {
        command_id = row.command_id,
        command_generation = math.floor(tonumber(row.command_generation) :: number),
        pin_generation = math.floor(tonumber(row.pin_generation) :: number),
        terminal_op_id = row.terminal_op_id,
        installed_at = row.installed_at,
    }
end

local function call(fn: (sql.DB, any) -> (any?, error?), request: table): (any?, error?)
    local db = open_db()
    local result, err = fn(db, request)
    db:release()
    return result, err
end

local function lower(thread_id: string, command_id: string, command_generation: integer, target: integer): (any?, error?)
    return call(pin.pin_lower, { thread_id = thread_id, consumer_key = "drive:a", command_id = command_id,
        command_generation = command_generation, target_cursor = target })
end

local function raise(thread_id: string, generation: integer, cursor: integer): (any?, error?)
    return call(pin.pin_raise, { thread_id = thread_id, consumer_key = "drive:a",
        expected_pin_generation = generation, new_cursor = cursor })
end

local function release(thread_id: string, generation: integer, op: string): (any?, error?)
    return call(pin.pin_release, { thread_id = thread_id, consumer_key = "drive:a",
        expected_pin_generation = generation, terminal_op_id = op })
end

local function expect_refusal(err: any, reason: string): ()
    test.not_nil(err)
    test.eq(err:kind(), errors.CONFLICT)
    test.eq(err:details().reason, reason)
end

local function define_tests()
    test.describe("Retention pins", function()
        test.it("fences delayed lower and raise without moving or deleting the retained cursor", function()
            local thread_id=make_thread()
            local first=lower(thread_id,"blocked-command",1,10)
            test.is_nil(select(2,raise(thread_id,first.pin_generation,30)))
            local fenced,fence_err=call(pin.pin_fence,{thread_id=thread_id,consumer_key="drive:a",
                command_id="authority-recovery",command_generation=2})
            test.is_nil(fence_err,tostring(fence_err))
            test.is_true(fenced.present)
            test.eq(fenced.cursor_seq,30)
            test.is_true(fenced.pin_generation>first.pin_generation)
            local again,again_err=call(pin.pin_fence,{thread_id=thread_id,consumer_key="drive:a",
                command_id="authority-recovery",command_generation=2})
            test.is_nil(again_err,tostring(again_err))
            test.eq(again.pin_generation,fenced.pin_generation)
            local _,late_lower=lower(thread_id,"blocked-command",1,0)
            expect_refusal(late_lower,pin.REASON.STALE)
            local _,late_raise=raise(thread_id,first.pin_generation,90)
            expect_refusal(late_raise,pin.REASON.STALE)
            local row=pin_row(thread_id,"drive:a")
            test.eq(row.cursor_seq,30)
            test.eq(row.generation,fenced.pin_generation)
            test.eq(row.command_generation,2)
        end)

        test.it("fences an absent pin without creating retained work and permits a later command", function()
            local thread_id=make_thread()
            local fenced,err=call(pin.pin_fence,{thread_id=thread_id,consumer_key="drive:a",
                command_id="authority-recovery",command_generation=2})
            test.is_nil(err,tostring(err))
            test.is_false(fenced.present)
            test.is_nil(pin_row(thread_id,"drive:a"))
            test.eq(tombstone_row(thread_id,"drive:a").command_generation,2)
            local _,late=lower(thread_id,"blocked-command",1,0)
            expect_refusal(late,pin.REASON.STALE)
            local next_pin,next_err=lower(thread_id,"next-command",3,0)
            test.is_nil(next_err,tostring(next_err))
            test.not_nil(next_pin)
        end)

        test.it("starts every thread at prune boundary 0", function()
            local thread_id = make_thread()
            local rows = query("SELECT max_pruned_seq FROM kickside_thread WHERE id = $1", { thread_id })
            test.eq(math.floor(tonumber(rows[1].max_pruned_seq) :: number), 0)
        end)

        test.it("installs a pin and replays the same command's receipt without change", function()
            local thread_id = make_thread()
            local receipt, err = lower(thread_id, "cmd-1", 1, 0)
            test.is_nil(err)
            test.eq(receipt.pin_generation, 1)
            test.eq(receipt.target_cursor, 0)
            test.eq(receipt.command_id, "cmd-1")

            local again, again_err = lower(thread_id, "cmd-1", 1, 0)
            test.is_nil(again_err)
            test.eq(again.pin_generation, 1)
            local row = pin_row(thread_id, "drive:a") :: table
            test.eq(row.generation, 1)
            test.eq(row.cursor_seq, 0)
        end)

        test.it("replays a finalized command's receipt after its pin was raised", function()
            local thread_id = make_thread()
            local receipt = lower(thread_id, "cmd-1", 1, 5)
            test.is_nil(select(2, raise(thread_id, receipt.pin_generation, 40)))
            local again, err = lower(thread_id, "cmd-1", 1, 5)
            test.is_nil(err)
            test.eq(again.pin_generation, receipt.pin_generation)
            test.eq((pin_row(thread_id, "drive:a") :: table).cursor_seq, 40)
        end)

        test.it("refuses the same command generation with another target or command id", function()
            local thread_id = make_thread()
            lower(thread_id, "cmd-1", 1, 10)
            local _, target_err = lower(thread_id, "cmd-1", 1, 20)
            expect_refusal(target_err, pin.REASON.TARGET_MISMATCH)
            local _, id_err = lower(thread_id, "cmd-other", 1, 10)
            expect_refusal(id_err, pin.REASON.STALE)
            local row = pin_row(thread_id, "drive:a") :: table
            test.eq(row.cursor_seq, 10)
            test.eq(row.command_id, "cmd-1")
        end)

        test.it("makes the delayed older rewind impossible after a newer command lowers", function()
            local thread_id = make_thread()
            local a = lower(thread_id, "cmd-a", 1, 0)
            test.eq(a.pin_generation, 1)
            local b, b_err = lower(thread_id, "cmd-b", 2, 200)
            test.is_nil(b_err)
            test.eq(b.pin_generation, 2)
            local _, raise_b_err = raise(thread_id, b.pin_generation, 250)
            test.is_nil(raise_b_err)

            local _, late_lower_err = lower(thread_id, "cmd-a", 1, 0)
            expect_refusal(late_lower_err, pin.REASON.STALE)
            local _, late_raise_err = raise(thread_id, a.pin_generation, 0)
            expect_refusal(late_raise_err, pin.REASON.STALE)

            local row = pin_row(thread_id, "drive:a") :: table
            test.eq(row.cursor_seq, 250)
            test.eq(row.generation, 2)
            test.eq(row.command_generation, 2)
        end)

        test.it("refuses a lower or raise below the prune boundary before any write", function()
            local thread_id = make_thread()
            local receipt = lower(thread_id, "cmd-1", 1, 50)
            set_boundary(thread_id, 60)

            local _, lower_err = lower(thread_id, "cmd-2", 2, 59)
            expect_refusal(lower_err, pin.REASON.BELOW_PRUNE)
            test.eq(lower_err:details().max_pruned_seq, 60)
            local _, raise_err = raise(thread_id, receipt.pin_generation, 55)
            expect_refusal(raise_err, pin.REASON.BELOW_PRUNE)

            local row = pin_row(thread_id, "drive:a") :: table
            test.eq(row.cursor_seq, 50)
            test.eq(row.generation, 1)
            test.eq(row.command_generation, 1)

            local at_boundary, at_err = lower(thread_id, "cmd-2", 2, 60)
            test.is_nil(at_err)
            test.eq(at_boundary.pin_generation, 2)
        end)

        test.it("raises monotonically under the pin generation", function()
            local thread_id = make_thread()
            local receipt = lower(thread_id, "cmd-1", 1, 10)
            local up, up_err = raise(thread_id, receipt.pin_generation, 30)
            test.is_nil(up_err)
            test.eq(up.cursor_seq, 30)
            test.eq(up.pin_generation, receipt.pin_generation)
            local down, down_err = raise(thread_id, receipt.pin_generation, 20)
            test.is_nil(down_err)
            test.eq(down.cursor_seq, 30)
            test.eq((pin_row(thread_id, "drive:a") :: table).cursor_seq, 30)

            local _, stale_err = raise(thread_id, receipt.pin_generation + 1, 40)
            expect_refusal(stale_err, pin.REASON.STALE)
            test.eq((pin_row(thread_id, "drive:a") :: table).cursor_seq, 30)
        end)

        test.it("releases into a tombstone that fences late lowers and raises", function()
            local thread_id = make_thread()
            local receipt = lower(thread_id, "cmd-1", 3, 10)

            local _, stale_err = release(thread_id, receipt.pin_generation + 1, "op-del")
            expect_refusal(stale_err, pin.REASON.STALE)
            test.not_nil(pin_row(thread_id, "drive:a"))

            local released, err = release(thread_id, receipt.pin_generation, "op-del")
            test.is_nil(err)
            test.is_true(released.released)
            test.eq(released.tombstone_generation, receipt.pin_generation)
            test.is_nil(pin_row(thread_id, "drive:a"))
            local tomb = tombstone_row(thread_id, "drive:a") :: table
            test.eq(tomb.command_id, "cmd-1")
            test.eq(tomb.command_generation, 3)
            test.eq(tomb.pin_generation, receipt.pin_generation)
            test.eq(tomb.terminal_op_id, "op-del")
            test.is_true(string.match(tostring(tomb.installed_at), "^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%dZ$") ~= nil)

            local repeat_release, repeat_err = release(thread_id, receipt.pin_generation, "op-del")
            test.is_nil(repeat_err)
            test.is_true(repeat_release.released)

            local _, late_lower_err = lower(thread_id, "cmd-1", 3, 10)
            expect_refusal(late_lower_err, pin.REASON.STALE)
            local _, late_raise_err = raise(thread_id, receipt.pin_generation, 20)
            expect_refusal(late_raise_err, pin.REASON.STALE)
            test.is_nil(pin_row(thread_id, "drive:a"))

            local fresh, fresh_err = lower(thread_id, "cmd-2", 4, 10)
            test.is_nil(fresh_err)
            test.is_true(fresh.pin_generation > receipt.pin_generation)
        end)

        test.it("fences an orphaned command with a cleanup tombstone", function()
            local thread_id = make_thread()
            local orphan = lower(thread_id, "cmd-orphan", 5, 0)

            local db = open_db()
            local tx = db:begin()
            local _, stale_err = pin.pin_cleanup_tombstone(tx, { thread_id = thread_id, consumer_key = "drive:a",
                command_id = "cmd-cleanup", command_generation = 6, expected_pin_generation = orphan.pin_generation + 1,
                terminal_op_id = "op-cleanup" })
            tx:rollback()
            expect_refusal(stale_err, pin.REASON.STALE)

            tx = db:begin()
            local _, not_newer_err = pin.pin_cleanup_tombstone(tx, { thread_id = thread_id, consumer_key = "drive:a",
                command_id = "cmd-cleanup", command_generation = 5, expected_pin_generation = orphan.pin_generation,
                terminal_op_id = "op-cleanup" })
            tx:rollback()
            expect_refusal(not_newer_err, pin.REASON.STALE)

            tx = db:begin()
            local cleaned, err = pin.pin_cleanup_tombstone(tx, { thread_id = thread_id, consumer_key = "drive:a",
                command_id = "cmd-cleanup", command_generation = 6, expected_pin_generation = orphan.pin_generation,
                terminal_op_id = "op-cleanup" })
            test.is_nil(err)
            tx:commit()
            db:release()
            test.eq(cleaned.tombstone_generation, orphan.pin_generation)
            test.is_nil(pin_row(thread_id, "drive:a"))
            local tomb = tombstone_row(thread_id, "drive:a") :: table
            test.eq(tomb.command_id, "cmd-cleanup")
            test.eq(tomb.command_generation, 6)

            local _, delayed_err = lower(thread_id, "cmd-orphan", 5, 0)
            expect_refusal(delayed_err, pin.REASON.STALE)
            local _, cleanup_gen_err = lower(thread_id, "cmd-cleanup", 6, 0)
            expect_refusal(cleanup_gen_err, pin.REASON.STALE)
            local _, delayed_raise_err = raise(thread_id, orphan.pin_generation, 9)
            expect_refusal(delayed_raise_err, pin.REASON.STALE)
        end)

        test.it("reports a missing thread and malformed requests", function()
            local _, missing_err = lower(uuid.v7(), "cmd-1", 1, 0)
            test.not_nil(missing_err)
            test.eq(missing_err:kind(), errors.NOT_FOUND)

            local thread_id = make_thread()
            local _, gen_err = lower(thread_id, "cmd-1", 0, 0)
            test.eq(gen_err:kind(), errors.INVALID)
            local _, cursor_err = lower(thread_id, "cmd-1", 1, -1)
            test.eq(cursor_err:kind(), errors.INVALID)
            local _, key_err = call(pin.pin_raise, { thread_id = thread_id, consumer_key = "",
                expected_pin_generation = 1, new_cursor = 1 })
            test.eq(key_err:kind(), errors.INVALID)
            test.is_nil(pin_row(thread_id, "drive:a"))
        end)

        test.it("purges pins and tombstones with their thread", function()
            local thread_id = make_thread()
            local db = open_db()
            local tx = db:begin()
            local _, err = pin.lower_tx(tx, { thread_id = thread_id, consumer_key = "self:" .. thread_id, command_id = "cmd-1",
                command_generation = 1, target_cursor = 0 })
            test.is_nil(err)
            tx:commit()
            db:release()
            exec([[INSERT INTO kickside_retention_pin_tombstone
                (thread_id,consumer_key,command_id,command_generation,pin_generation,terminal_op_id,installed_at)
                VALUES ($1,'retired','cmd-2',2,1,'op-del','2026-01-01T00:00:00Z')]], { thread_id })

            local purge_db = open_db()
            local purged, purge_err = teardown.purge_thread(purge_db, thread_id, nil)
            purge_db:release()
            test.is_nil(purge_err)
            test.is_true(purged.purged)
            test.eq(#query("SELECT 1 AS one FROM kickside_thread WHERE id = $1", { thread_id }), 0)
            test.eq(#query("SELECT 1 AS one FROM kickside_retention_pin WHERE thread_id = $1", { thread_id }), 0)
            test.eq(#query("SELECT 1 AS one FROM kickside_retention_pin_tombstone WHERE thread_id = $1", { thread_id }), 0)
        end)

        test.it("lowers new consumers beside live and tombstoned ones across generations", function()
            local thread_id = make_thread()
            local function lowered(key: string, command: string, generation: integer): (any?, error?)
                return call(pin.pin_lower, { thread_id = thread_id, consumer_key = key,
                    command_id = command, command_generation = generation, target_cursor = 0 })
            end
            local first, first_err = lowered("consumer:a", "cmd-a", 1)
            test.is_nil(first_err)
            test.eq(first.pin_generation, 1)
            local changed, change_err = lowered("consumer:a", "cmd-b", 2)
            test.is_nil(change_err)
            test.eq(changed.pin_generation, 2)
            local _, release_err = call(pin.pin_release, { thread_id = thread_id,
                consumer_key = "consumer:a", expected_pin_generation = 2, terminal_op_id = "terminal" })
            test.is_nil(release_err)
            local second, second_err = lowered("consumer:b", "cmd-c", 1)
            test.is_nil(second_err)
            test.not_nil(second)
            local third, third_err = lowered("consumer:c", "cmd-d", 1)
            test.is_nil(third_err)
            test.not_nil(third)
            local replay, replay_err = lowered("consumer:a", "cmd-e", 3)
            test.is_nil(replay_err)
            test.not_nil(replay)
            test.eq(#query("SELECT 1 FROM kickside_retention_pin_tombstone WHERE thread_id=$1", { thread_id }), 1)
            test.eq(#query("SELECT 1 FROM kickside_retention_pin WHERE thread_id=$1", { thread_id }), 3)
        end)

        test.it("accepts concurrent distinct lowers on one thread", function()
            local thread_id = make_thread()
            local first, first_err = call(pin.pin_lower, { thread_id = thread_id,
                consumer_key = "first", command_id = "first", command_generation = 1,
                target_cursor = 0 })
            test.is_nil(first_err)
            test.not_nil(first)
            local done = channel.new(2)
            for _, key in ipairs({ "second", "third" }) do
                coroutine.spawn(function()
                    local receipt, err = call(pin.pin_lower, { thread_id = thread_id,
                        consumer_key = key, command_id = key, command_generation = 1,
                        target_cursor = 0 })
                    done:send({ receipt = receipt, err = err })
                end)
            end
            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err)
                test.not_nil(outcome.receipt)
            end
            test.eq(#query("SELECT 1 FROM kickside_retention_pin WHERE thread_id=$1", { thread_id }), 3)
        end)
    end)
end

return test.run_cases(define_tests)
