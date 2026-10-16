-- Shared proc-supervisor decision coverage. The live spawn/monitor/terminate
-- wiring (wait_once over process events + timers) is process-bound and covered by
-- the job and projection suites end to end; here the abstract supervise_loop is
-- driven through scripted hooks so terminate-on-timeout/cancel/lease-loss and
-- exit-result interpretation are deterministic.

local test = require("test")
local proc_supervisor = require("proc_supervisor")

type Opts = {
    interpret_exit: fun(result: any): (table?, error?),
    crash_message: string,
    timeout_message: string,
    cancel_message: string,
    lease_lost_message: string,
}

local OPTS: Opts = {
    interpret_exit = function(result: any): (table?, error?)
        if type(result) == "table" and (result :: any).ok == false then
            return nil, (errors.new({ message = tostring((result :: any).error or "worker failed"), kind = errors.INTERNAL }) :: error)
        end
        if type(result) == "table" and type((result :: any).output) == "table" then
            return ((result :: any).output :: table), nil
        end
        return (type(result) == "table" and result or {}) :: table, nil
    end,
    crash_message = "proc worker crashed: ",
    timeout_message = "worker exceeded max_execution_ms",
    cancel_message = "worker shutting down",
    lease_lost_message = "lease lost: worker no longer running",
}

local function err_text(e: any): string
    if e == nil then return "" end
    return tostring((e :: any):message())
end

-- Replay a scripted list of lifecycle signals and record every terminate(pid).
local function scripted_hooks(signals: { any }): table
    local i = 0
    local terminated: { string } = {}
    local hooks: any = {
        _terminated = terminated,
        spawn = function(): (string?, error?) return "child-1", nil end,
        terminate = function(pid: string): () terminated[#terminated + 1] = pid end,
        wait = function(): any
            i = i + 1
            return signals[i] or { kind = "grace_expired" }
        end,
    }
    hooks._wait_count = function(): integer return i end
    return hooks
end

local function define_tests()
    test.describe("proc_supervisor.supervise_loop", function()
        test.it("bounds termination-fence recovery to four attempts and named retry deadlines", function()
            local writes, waits = 0, {}
            local h = scripted_hooks({})
            h.prepare_termination = function(): error?
                writes = writes + 1
                return errors.new({ kind = errors.UNAVAILABLE, message = "fence store unavailable", retryable = true })
            end
            h.wait_retry = function(delay_ms: integer): string
                waits[#waits + 1] = delay_ms
                return "retry"
            end
            local err = proc_supervisor.ensure_termination_fence(h, "child-1", {})
            test.not_nil(err)
            test.eq(writes, 4)
            test.eq(#waits, 3)
            test.eq(waits[1], 50)
            test.eq(waits[2], 150)
            test.eq(waits[3], 350)
        end)

        test.it("returns interpreted output on a clean exit, terminating nothing", function()
            local h = scripted_hooks({ { kind = "exit", result = { ok = true, output = { n = 2 } } } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(err)
            test.is_nil(control)
            test.eq((out :: any).n, 2)
            test.eq(#h._terminated, 0)
        end)

        test.it("surfaces a failed exit result as an error without terminating", function()
            local h = scripted_hooks({ { kind = "exit", result = { ok = false, error = "stage blew up" } } })
            local out, err = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_true(err_text(err):find("stage blew up", 1, true) ~= nil)
            test.eq(#h._terminated, 0)
        end)

        test.it("terminates the child and fails on a max_execution timeout", function()
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "exit", from = "child-1" } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(h._terminated[1], "child-1")
            test.is_true(err_text(err):find(OPTS.timeout_message, 1, true) ~= nil)
        end)

        test.it("terminates the child and asks to shut down on a cancel", function()
            local h = scripted_hooks({ { kind = "cancel" }, { kind = "exit", from = "child-1" } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "shutdown")
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("revokes a running child and waits for its matching EXIT", function()
            local prepared, waited = 0, 0
            local h = scripted_hooks({
                { kind = "revoked" },
                { kind = "other" },
                { kind = "exit", from = "child-1" },
            })
            h.prepare_termination = function(pid: string): error?
                test.eq(pid, "child-1")
                prepared = prepared + 1
                return nil
            end
            h.wait_termination = function(deadline: any): table
                test.not_nil(deadline)
                waited = waited + 1
                return h.wait()
            end
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.is_nil(err)
            test.eq(control, "revoked")
            test.eq(h._terminated[1], "child-1")
            test.eq(prepared, 1)
            test.eq(waited, 2)
        end)

        test.it("checks ownership once when the exact lease expiry fires", function()
            local checks = 0
            local h = scripted_hooks({ { kind = "lease_expired" }, { kind = "exit", from = "child-1" } })
            h.check_lease = function(): (boolean, string?, error?)
                checks = checks + 1
                return false, nil, nil
            end
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(checks, 1)
            test.eq(h._terminated[1], "child-1")
        end)

        test.it("spawns then supervises to a clean exit via run", function()
            local h = scripted_hooks({ { kind = "exit", result = { ok = true, output = { ran = 1 } } } })
            local out, err = proc_supervisor.run(h, OPTS)
            test.is_nil(err)
            test.eq((out :: any).ran, 1)
        end)

        test.it("observes the child exit after a timeout before failing", function()
            local exit_signal = { kind = "exit", from = "child-1", result = { ok = true, output = { n = 9 } } }
            local h = scripted_hooks({ { kind = "timeout" }, exit_signal })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.eq(h._terminated[1], "child-1")
            test.eq(#h._terminated, 1)
            test.is_true(err_text(err):find(OPTS.timeout_message, 1, true) ~= nil)
            test.eq(h._wait_count(), 2)
        end)

        test.it("keeps the timeout cause when the child crashes during the grace", function()
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "crash", from = "child-1" } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.is_true(err_text(err):find(OPTS.timeout_message, 1, true) ~= nil)
            test.eq(h._wait_count(), 2)
        end)

        test.it("propagates a cancel observed while waiting for termination", function()
            local h = scripted_hooks({ { kind = "timeout" }, { kind = "cancel" } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "shutdown")
            test.is_true(err_text(err):find(OPTS.cancel_message, 1, true) ~= nil)
        end)

        test.it("withholds retry when the child never exits", function()
            local h = scripted_hooks({ { kind = "timeout" } })
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(control, "termination_unconfirmed")
            test.eq(#h._terminated, 1)
            test.is_true(err_text(err):find("termination unconfirmed", 1, true) ~= nil)
            test.eq(h._wait_count(), 2)
        end)

        test.it("verifies termination at the lease deadline before reporting", function()
            local checks = 0
            local h = scripted_hooks({
                { kind = "lease_expired" },
                { kind = "exit", from = "child-1", result = { ok = true } },
            })
            h.check_lease = function(): (boolean, string?, error?)
                checks = checks + 1
                return false, nil, nil
            end
            local out, err, control = proc_supervisor.supervise_loop(h, "child-1", OPTS)
            test.is_nil(out)
            test.not_nil(err)
            test.is_nil(control)
            test.is_true(err_text(err):find(OPTS.lease_lost_message, 1, true) ~= nil)
            test.eq(checks, 1)
            test.eq(h._wait_count(), 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
