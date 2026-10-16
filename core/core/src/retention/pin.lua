-- Retention pins (design v4 §4.9). A pin protects one consumer's events on one
-- thread: the sweeper never deletes a sequence above the lowest pinned cursor.
--
-- Every operation locks in one order: the thread row, then the pin row, then the
-- tombstone row. The thread lock is the same lock the sweeper takes before it
-- reads pins, so a pin either protects its cursor before a prune reads it or
-- sees the boundary that prune advanced and is refused. Every refusal is decided
-- before the first write.
--
-- Fences:
--   * lower is fenced by the command generation. A lower below the pin's
--     recorded command generation, or at or below a tombstone's, is stale.
--     Repeating the recorded command id and generation returns the same receipt.
--   * raise is fenced by the pin generation, which only a lower changes. Raises
--     are monotonic: a raise below the current cursor leaves the pin unchanged.
--   * release deletes the pin for the expected pin generation and leaves a
--     tombstone that rejects a late lower or raise at or below its generations.
--   * a cursor below max_pruned_seq names events that no longer exist and is
--     refused.
--
-- The *_tx variants run on the caller's transaction and take the dialect from
-- it; pin_lower, pin_raise and pin_release own a transaction on the caller's
-- core executor. No variant acquires a connection of its own.

local sql = require("sql")
local time = require("time")
local retention_policy = require("retention_policy")
local retention_notifier = require("retention_notifier")

local pin = {}

pin.TABLE = "kickside_retention_pin"
pin.TOMBSTONE_TABLE = "kickside_retention_pin_tombstone"

pin.REASON = {
    STALE = "stale_generation",
    BELOW_PRUNE = "below_prune_boundary",
    TARGET_MISMATCH = "command_target_mismatch",
}

type Receipt = {
    thread_id: string,
    consumer_key: string,
    command_id: string,
    command_generation: integer,
    target_cursor: integer,
    pin_generation: integer,
}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function dependency_failure(message: string, err: error): error
    return errors.wrap(err, message)
end

local function refused(message: string, reason: string, details: { [string]: any }): error
    details.reason = reason
    return (errors.new({ message = message, kind = errors.CONFLICT, retryable = false, details = details }) :: error)
end

local function text(value: any, field: string): (string?, error?)
    if type(value) ~= "string" or value == "" then
        return nil, invalid(field .. " is required")
    end
    return value :: string, nil
end

local function integer(value: any, field: string, min: integer): (integer?, error?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < min then
        return nil, invalid(field .. " must be an integer >= " .. tostring(min))
    end
    return math.floor(value) :: integer, nil
end

local function int_of(value: any): integer?
    local n = tonumber(value)
    if n == nil then return nil end
    return math.floor(n) :: integer
end

local function lock_suffix(dbtype: string): string
    return dbtype == sql.type.SQLITE and "" or "FOR UPDATE"
end

local function dialect(tx: sql.Transaction): (string?, error?)
    local dbtype, err = tx:db_type()
    if err then return nil, dependency_failure("failed to resolve the transaction dialect", err) end
    return tostring(dbtype), nil
end

local function select_locked(tx: sql.Transaction, dbtype: string, query: any): (table?, error?)
    local lock = lock_suffix(dbtype)
    if lock ~= "" then query = query:suffix(lock) end
    local rows, err = query:run_with(tx):query()
    if err then return nil, err end
    return (rows :: table[])[1], nil
end

type Locked = {
    max_pruned_seq: integer,
    deleting: boolean,
    pin: table?,
    tombstone: table?,
}

-- Lock thread → pin → tombstone and read their fence state.
local function lock_state(tx: sql.Transaction, dbtype: string, thread_id: string, consumer_key: string): (Locked?, error?)
    local thread, thread_err = select_locked(tx, dbtype, sql.builder.select("max_pruned_seq", "deleting_at")
        :from("kickside_thread"):where(sql.builder.eq({ id = thread_id })))
    if thread_err then return nil, dependency_failure("failed to lock thread", thread_err) end
    if not thread then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND, retryable = false }) :: error)
    end
    local key = sql.builder.expr("thread_id = ? AND consumer_key = ?", thread_id, consumer_key)
    local row, pin_err = select_locked(tx, dbtype, sql.builder.select("cursor_seq", "generation", "command_id", "command_generation")
        :from(pin.TABLE):where(key))
    if pin_err then return nil, dependency_failure("failed to lock retention pin", pin_err) end
    local tombstone, tomb_err = select_locked(tx, dbtype, sql.builder.select("command_id", "command_generation", "pin_generation", "terminal_op_id")
        :from(pin.TOMBSTONE_TABLE):where(key))
    if tomb_err then return nil, dependency_failure("failed to lock retention pin tombstone", tomb_err) end
    return {
        max_pruned_seq = int_of(thread.max_pruned_seq) or 0,
        deleting = thread.deleting_at ~= nil,
        pin = row,
        tombstone = tombstone,
    }, nil
end

local function below_prune(cursor: integer, max_pruned_seq: integer): error
    return refused("cursor " .. tostring(cursor) .. " is below the prune boundary " .. tostring(max_pruned_seq),
        pin.REASON.BELOW_PRUNE, { cursor = cursor, max_pruned_seq = max_pruned_seq })
end

local function write_tombstone(tx: sql.Transaction, thread_id: string, consumer_key: string, row: { [string]: any }, exists: boolean): error?
    local _result, err
    if exists then
        _result, err = sql.builder.update(pin.TOMBSTONE_TABLE):set_map(row)
            :where(sql.builder.eq({ thread_id = thread_id, consumer_key = consumer_key }))
            :run_with(tx):exec()
    else
        row.thread_id = thread_id
        row.consumer_key = consumer_key
        _result, err = sql.builder.insert(pin.TOMBSTONE_TABLE):set_map(row):run_with(tx):exec()
    end
    if err then return dependency_failure("failed to write retention pin tombstone", err) end
    return nil
end

local function delete_pin(tx: sql.Transaction, thread_id: string, consumer_key: string): error?
    local _, err = sql.builder.delete(pin.TABLE)
        :where(sql.builder.eq({ thread_id = thread_id, consumer_key = consumer_key }))
        :run_with(tx):exec()
    if err then return dependency_failure("failed to delete retention pin", err) end
    return nil
end

local function utc_now(): string
    return time.now():utc():format(time.RFC3339) :: string
end

-- check_row applies the Core row size limit to one pin or tombstone row.
local function check_row(thread_id: string, consumer_key: string, command_id: string,
    terminal_op_id: string?, operation: string): error?
    local bytes = #thread_id + #consumer_key + #command_id + #(terminal_op_id or "") + 64
    return retention_policy.check_row(thread_id, bytes, operation)
end

-- lower_tx installs or lowers a consumer's pin for one command.
function pin.lower_tx(tx: sql.Transaction, request: any): (Receipt?, error?)
    local req = type(request) == "table" and request or {}
    local thread_id, e1 = text(req.thread_id, "thread_id")
    if e1 then return nil, e1 end
    local consumer_key, e2 = text(req.consumer_key, "consumer_key")
    if e2 then return nil, e2 end
    local command_id, e3 = text(req.command_id, "command_id")
    if e3 then return nil, e3 end
    local command_generation, e4 = integer(req.command_generation, "command_generation", 1)
    if e4 then return nil, e4 end
    local target, e5 = integer(req.target_cursor, "target_cursor", 0)
    if e5 then return nil, e5 end
    local tid, key, cid = thread_id :: string, consumer_key :: string, command_id :: string
    local cgen, cursor = command_generation :: integer, target :: integer
    local row_err = check_row(tid, key, cid, nil, "pin_lower")
    if row_err then return nil, row_err end

    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local state, lock_err = lock_state(tx, dbtype :: string, tid, key)
    if lock_err then return nil, lock_err end
    local s = state :: Locked

    if s.deleting then
        return nil, refused("source thread deletion is in progress", pin.REASON.STALE,
            { source_deleted = true })
    end

    local tomb = s.tombstone
    if tomb and cgen <= (int_of(tomb.command_generation) or 0) then
        return nil, refused("command generation " .. tostring(cgen) .. " is at or below the pin tombstone",
            pin.REASON.STALE, { command_generation = cgen, tombstone_command_generation = int_of(tomb.command_generation) })
    end

    local current = s.pin
    if current then
        local held_gen = int_of(current.command_generation) or 0
        if cgen < held_gen then
            return nil, refused("command generation " .. tostring(cgen) .. " is older than the pin's " .. tostring(held_gen),
                pin.REASON.STALE, { command_generation = cgen, pin_command_generation = held_gen })
        end
        if cgen == held_gen then
            if tostring(current.command_id) ~= cid then
                return nil, refused("command generation " .. tostring(cgen) .. " belongs to another command",
                    pin.REASON.STALE, { command_generation = cgen })
            end
            -- The pin's cursor starts at the command's target and only rises, so a
            -- repeat naming a higher target is a different request.
            local held_cursor = int_of(current.cursor_seq) or 0
            if cursor > held_cursor then
                return nil, refused("command " .. cid .. " already pinned a lower target",
                    pin.REASON.TARGET_MISMATCH, { target_cursor = cursor, cursor_seq = held_cursor })
            end
            return {
                thread_id = tid, consumer_key = key, command_id = cid, command_generation = cgen,
                target_cursor = cursor, pin_generation = int_of(current.generation) :: integer,
            }, nil
        end
    end

    if cursor < s.max_pruned_seq then
        return nil, below_prune(cursor, s.max_pruned_seq)
    end

    local pin_generation: integer
    local _result, write_err
    if current then
        pin_generation = (int_of(current.generation) :: integer) + 1
        _result, write_err = sql.builder.update(pin.TABLE)
            :set_map({ cursor_seq = cursor, generation = pin_generation, command_id = cid, command_generation = cgen })
            :where(sql.builder.eq({ thread_id = tid, consumer_key = key }))
            :run_with(tx):exec()
    else
        pin_generation = (tomb and int_of(tomb.pin_generation) or 0) + 1
        _result, write_err = sql.builder.insert(pin.TABLE)
            :set_map({ thread_id = tid, consumer_key = key, cursor_seq = cursor, generation = pin_generation,
                command_id = cid, command_generation = cgen })
            :run_with(tx):exec()
    end
    if write_err then return nil, dependency_failure("failed to write retention pin", write_err) end

    return {
        thread_id = tid, consumer_key = key, command_id = cid, command_generation = cgen,
        target_cursor = cursor, pin_generation = pin_generation,
    }, nil
end

-- Advance command and pin fences while retaining the live cursor. An absent
-- pin gets only a tombstone, so delayed lower cannot create retained work.
function pin.fence_tx(tx: sql.Transaction, request: any): (any?, error?)
    local req = type(request) == "table" and request or {}
    local thread_id, e1 = text(req.thread_id, "thread_id")
    if e1 then return nil, e1 end
    local consumer_key, e2 = text(req.consumer_key, "consumer_key")
    if e2 then return nil, e2 end
    local command_id, e3 = text(req.command_id, "command_id")
    if e3 then return nil, e3 end
    local generation, e4 = integer(req.command_generation, "command_generation", 1)
    if e4 then return nil, e4 end
    local tid, key, cid, cgen = thread_id :: string, consumer_key :: string, command_id :: string, generation :: integer
    local row_err = check_row(tid, key, cid, cid, "pin_fence")
    if row_err then return nil, row_err end
    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local state, lock_err = lock_state(tx, dbtype :: string, tid, key)
    if lock_err or not state then return nil, lock_err end
    local current, tomb = state.pin, state.tombstone
    local held = current or tomb
    if held then
        local held_gen = int_of(held.command_generation) or 0
        if cgen < held_gen or (cgen == held_gen and tostring(held.command_id) ~= cid) then
            return nil, refused("command generation is older than the retention fence", pin.REASON.STALE,
                { command_generation = cgen, pin_command_generation = held_gen })
        end
        if cgen == held_gen then
            return { thread_id = tid, consumer_key = key, command_id = cid, command_generation = cgen,
                present = current ~= nil, cursor_seq = current and int_of(current.cursor_seq) or nil,
                pin_generation = current and int_of(current.generation) or int_of(held.pin_generation) }, nil
        end
    end
    local pgen = math.max(current and int_of(current.generation) or 0, tomb and int_of(tomb.pin_generation) or 0) + 1
    if current then
        local _, write_err = sql.builder.update(pin.TABLE)
            :set_map({ generation = pgen, command_id = cid, command_generation = cgen })
            :where(sql.builder.eq({ thread_id = tid, consumer_key = key })):run_with(tx):exec()
        if write_err then return nil, dependency_failure("failed to fence retention pin", write_err) end
    else
        local tomb_err = write_tombstone(tx, tid, key, { command_id = cid, command_generation = cgen,
            pin_generation = pgen, terminal_op_id = cid, installed_at = utc_now() }, tomb ~= nil)
        if tomb_err then return nil, tomb_err end
    end
    return { thread_id = tid, consumer_key = key, command_id = cid, command_generation = cgen,
        present = current ~= nil, cursor_seq = current and int_of(current.cursor_seq) or nil, pin_generation = pgen }, nil
end

-- raise_tx advances a pin's cursor under the expected pin generation.
function pin.raise_tx(tx: sql.Transaction, request: any): ({ cursor_seq: integer, pin_generation: integer }?, error?)
    local req = type(request) == "table" and request or {}
    local thread_id, e1 = text(req.thread_id, "thread_id")
    if e1 then return nil, e1 end
    local consumer_key, e2 = text(req.consumer_key, "consumer_key")
    if e2 then return nil, e2 end
    local expected, e3 = integer(req.expected_pin_generation, "expected_pin_generation", 1)
    if e3 then return nil, e3 end
    local new_cursor, e4 = integer(req.new_cursor, "new_cursor", 0)
    if e4 then return nil, e4 end
    local tid, key = thread_id :: string, consumer_key :: string
    local gen, cursor = expected :: integer, new_cursor :: integer

    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local state, lock_err = lock_state(tx, dbtype :: string, tid, key)
    if lock_err then return nil, lock_err end
    local s = state :: Locked

    local tomb = s.tombstone
    if tomb and gen <= (int_of(tomb.pin_generation) or 0) then
        return nil, refused("pin generation " .. tostring(gen) .. " is at or below the pin tombstone",
            pin.REASON.STALE, { expected_pin_generation = gen, tombstone_pin_generation = int_of(tomb.pin_generation) })
    end
    local current = s.pin
    if not current then
        return nil, refused("no retention pin holds generation " .. tostring(gen), pin.REASON.STALE, { expected_pin_generation = gen })
    end
    local held = int_of(current.generation) :: integer
    if held ~= gen then
        return nil, refused("pin generation " .. tostring(gen) .. " is stale; the pin holds " .. tostring(held),
            pin.REASON.STALE, { expected_pin_generation = gen, pin_generation = held })
    end
    if cursor < s.max_pruned_seq then
        return nil, below_prune(cursor, s.max_pruned_seq)
    end

    local held_cursor = int_of(current.cursor_seq) or 0
    if cursor <= held_cursor then
        return { cursor_seq = held_cursor, pin_generation = held }, nil
    end
    local _, write_err = sql.builder.update(pin.TABLE)
        :set("cursor_seq", cursor)
        :where(sql.builder.eq({ thread_id = tid, consumer_key = key, generation = held }))
        :run_with(tx):exec()
    if write_err then return nil, dependency_failure("failed to raise retention pin", write_err) end
    return { cursor_seq = cursor, pin_generation = held }, nil
end

-- release_tx deletes the pin at the expected generation and leaves a tombstone.
-- A repeat by the same terminal operation reports the tombstone it left.
function pin.release_tx(tx: sql.Transaction, request: any): ({ released: boolean, tombstone_generation: integer }?, error?)
    local req = type(request) == "table" and request or {}
    local thread_id, e1 = text(req.thread_id, "thread_id")
    if e1 then return nil, e1 end
    local consumer_key, e2 = text(req.consumer_key, "consumer_key")
    if e2 then return nil, e2 end
    local expected, e3 = integer(req.expected_pin_generation, "expected_pin_generation", 1)
    if e3 then return nil, e3 end
    local terminal_op_id, e4 = text(req.terminal_op_id, "terminal_op_id")
    if e4 then return nil, e4 end
    local tid, key, gen, op = thread_id :: string, consumer_key :: string, expected :: integer, terminal_op_id :: string

    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local state, lock_err = lock_state(tx, dbtype :: string, tid, key)
    if lock_err then return nil, lock_err end
    local s = state :: Locked

    local current = s.pin
    local tomb = s.tombstone
    if not current then
        if tomb and tostring(tomb.terminal_op_id) == op and int_of(tomb.pin_generation) == gen then
            return { released = true, tombstone_generation = gen }, nil
        end
        return nil, refused("no retention pin holds generation " .. tostring(gen), pin.REASON.STALE, { expected_pin_generation = gen })
    end
    local held = int_of(current.generation) :: integer
    if held ~= gen then
        return nil, refused("pin generation " .. tostring(gen) .. " is stale; the pin holds " .. tostring(held),
            pin.REASON.STALE, { expected_pin_generation = gen, pin_generation = held })
    end

    local row_err = check_row(tid, key, tostring(current.command_id), op, "pin_release")
    if row_err then return nil, row_err end
    local del_err = delete_pin(tx, tid, key)
    if del_err then return nil, del_err end
    local tomb_err = write_tombstone(tx, tid, key, {
        command_id = tostring(current.command_id),
        command_generation = int_of(current.command_generation),
        pin_generation = held,
        terminal_op_id = op,
        installed_at = utc_now(),
    }, tomb ~= nil)
    if tomb_err then return nil, tomb_err end
    return { released = true, tombstone_generation = held }, nil
end

-- cleanup_tombstone_tx fences an orphaned command: it installs a tombstone at
-- the cleanup command's generation, which rejects every delayed lower or raise
-- of the orphan, and deletes the pin if it still holds the expected generation.
-- The caller runs it only after the orphan's operation is durably terminal.
function pin.cleanup_tombstone_tx(tx: sql.Transaction, request: any): ({ tombstone_generation: integer }?, error?)
    local req = type(request) == "table" and request or {}
    local thread_id, e1 = text(req.thread_id, "thread_id")
    if e1 then return nil, e1 end
    local consumer_key, e2 = text(req.consumer_key, "consumer_key")
    if e2 then return nil, e2 end
    local command_id, e3 = text(req.command_id, "command_id")
    if e3 then return nil, e3 end
    local command_generation, e4 = integer(req.command_generation, "command_generation", 1)
    if e4 then return nil, e4 end
    local expected, e5 = integer(req.expected_pin_generation, "expected_pin_generation", 1)
    if e5 then return nil, e5 end
    local terminal_op_id, e6 = text(req.terminal_op_id, "terminal_op_id")
    if e6 then return nil, e6 end
    local tid, key = thread_id :: string, consumer_key :: string
    local cgen, gen = command_generation :: integer, expected :: integer
    local row_err = check_row(tid, key, command_id :: string, terminal_op_id :: string, "pin_cleanup_tombstone")
    if row_err then return nil, row_err end

    local dbtype, dt_err = dialect(tx)
    if dt_err then return nil, dt_err end
    local state, lock_err = lock_state(tx, dbtype :: string, tid, key)
    if lock_err then return nil, lock_err end
    local s = state :: Locked

    local tomb = s.tombstone
    if tomb and cgen < (int_of(tomb.command_generation) or 0) then
        return nil, refused("cleanup generation " .. tostring(cgen) .. " is below the installed tombstone",
            pin.REASON.STALE, { command_generation = cgen, tombstone_command_generation = int_of(tomb.command_generation) })
    end
    local current = s.pin
    if current then
        local held = int_of(current.generation) :: integer
        if held ~= gen then
            return nil, refused("pin generation " .. tostring(gen) .. " is stale; the pin holds " .. tostring(held),
                pin.REASON.STALE, { expected_pin_generation = gen, pin_generation = held })
        end
        if cgen <= (int_of(current.command_generation) or 0) then
            return nil, refused("cleanup generation " .. tostring(cgen) .. " does not fence the pin's command",
                pin.REASON.STALE, { command_generation = cgen, pin_command_generation = int_of(current.command_generation) })
        end
        local del_err = delete_pin(tx, tid, key)
        if del_err then return nil, del_err end
    end

    local tomb_gen = math.max(gen, tomb and int_of(tomb.pin_generation) or 0) :: integer
    local tomb_err = write_tombstone(tx, tid, key, {
        command_id = command_id :: string,
        command_generation = cgen,
        pin_generation = tomb_gen,
        terminal_op_id = terminal_op_id :: string,
        installed_at = utc_now(),
    }, tomb ~= nil)
    if tomb_err then return nil, tomb_err end
    return { tombstone_generation = tomb_gen }, nil
end

pin.pin_cleanup_tombstone = pin.cleanup_tombstone_tx

-- read(db, thread_id, consumer_key) -> the live pin { cursor_seq, generation,
-- command_id, command_generation }, or nil when the consumer holds none.
function pin.read(db: sql.DB | sql.Transaction, thread_id: string, consumer_key: string): (table?, error?)
    local tid, tid_err = text(thread_id, "thread_id")
    if tid_err then return nil, tid_err end
    local key, key_err = text(consumer_key, "consumer_key")
    if key_err then return nil, key_err end
    local rows, err = sql.builder.select("cursor_seq", "generation", "command_id", "command_generation")
        :from(pin.TABLE):where(sql.builder.eq({ thread_id = tid, consumer_key = key })):run_with(db):query()
    if err then return nil, dependency_failure("failed to read retention pin", err) end
    local row = (rows :: table[])[1]
    if not row then return nil, nil end
    return { cursor_seq = int_of(row.cursor_seq), generation = int_of(row.generation), command_id = row.command_id,
        command_generation = int_of(row.command_generation) }, nil
end

-- Run fn(tx) in a transaction of its own on the caller's core executor.
local function in_tx(db: sql.DB, fn: (sql.Transaction) -> (any?, error?)): (any?, error?)
    local tx, begin_err = db:begin()
    if begin_err then return nil, dependency_failure("failed to begin retention pin transaction", begin_err) end
    local result, err = fn(tx :: sql.Transaction)
    if err then
        tx:rollback()
        return nil, err
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, dependency_failure("failed to commit retention pin transaction", commit_err) end
    return result, nil
end

function pin.pin_lower(db: sql.DB, request: any): (Receipt?, error?)
    return in_tx(db, function(tx) return pin.lower_tx(tx, request) end)
end

function pin.pin_fence(db: sql.DB, request: any): (any?, error?)
    return in_tx(db, function(tx) return pin.fence_tx(tx, request) end)
end

function pin.pin_raise(db: sql.DB, request: any): ({ cursor_seq: integer, pin_generation: integer }?, error?)
    local result, err = in_tx(db, function(tx) return pin.raise_tx(tx, request) end)
    if not err and type(request) == "table" then
        local _, notify_err = retention_notifier.notify({ kind = "pin_advanced", thread_id = request.thread_id })
        if notify_err then return nil, notify_err end
    end
    return result, err
end

function pin.pin_release(db: sql.DB, request: any): ({ released: boolean, tombstone_generation: integer }?, error?)
    local result, err = in_tx(db, function(tx) return pin.release_tx(tx, request) end)
    if not err and type(request) == "table" then
        local _, notify_err = retention_notifier.notify({ kind = "pin_released", thread_id = request.thread_id })
        if notify_err then return nil, notify_err end
    end
    return result, err
end

return pin
