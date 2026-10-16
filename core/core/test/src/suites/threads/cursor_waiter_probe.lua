local contract = require("contract")
local cursor_waiters = require("cursor_waiters")

-- Registers a cursor waiter, pauses the projection through the threads
-- contract, and waits for the committed change, all in the caller's frame.
local function run(args: table): (table?, error?)
    local waiter, begin_err = cursor_waiters.begin_wait(args.cursor_id, args.target_seq, 5000)
    if begin_err or not waiter then return nil, begin_err end
    local def, def_err = contract.get("kickside.core:threads")
    if def_err or not def then
        cursor_waiters.close_wait(waiter :: table)
        return nil, def_err
    end
    local threads, open_err = def:open()
    if open_err or not threads then
        cursor_waiters.close_wait(waiter :: table)
        return nil, open_err
    end
    local paused, pause_err = threads:pause_projection(args.pause)
    if pause_err then
        cursor_waiters.close_wait(waiter :: table)
        return nil, pause_err
    end
    local notice, timed_out, wait_err = cursor_waiters.wait_until_reached(waiter :: table)
    cursor_waiters.close_wait(waiter :: table)
    if wait_err then return nil, wait_err end
    return { paused = paused, notice = notice, timed_out = timed_out }, nil
end

return { run = run }
