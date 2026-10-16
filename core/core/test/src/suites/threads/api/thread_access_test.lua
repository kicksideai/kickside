-- IDOR gate regression. The /threads/{id}/... sub-endpoints (projections,
-- retention) bind to persist code that does no access control; thread_access is the
-- shared gate they each run first. This drives the gate under real actors through
-- funcs.new():with_actor():with_scope():call so the component contract resolves the
-- caller: the owner is allowed at READ and WRITE, a non-member is denied (403), and
-- a missing thread is not-found (404). Runs on SQLite and PostgreSQL.

local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")

local THREADS = "kickside.core:threads"
local GATE = "app:test_gate"

-- Mirror the masks; the gate re-exports them but the suite asserts the inputs.
local READ = 1
local WRITE = 2

local function define_tests()
    test.describe("Thread Access Gate", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "ag-owner-" .. suffix
        local stranger = "ag-stranger-" .. suffix

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id, target, args)
            local actor = security.new_actor(user_id, { security_groups = {} })
            return funcs.new()
                :with_actor(actor)
                :with_scope(test_scope())
                :call(target, args)
        end

        local function as_owner(target, args)
            return run_as(owner, target, args)
        end

        -- Open the threads contract framed as the given user.
        local function open_threads(user_id)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            return inst
        end

        local function new_thread()
            local created, err = open_threads(owner):create({ thread_class = "ag_" .. suffix })
            if err then error("create failed: " .. tostring(err)) end
            return created.thread_id
        end

        test.it("owner is allowed at WRITE", function()
            local thread_id = new_thread()
            local res, err = as_owner(GATE, { thread_id = thread_id, mask = WRITE })
            test.is_nil(err)
            test.is_true(res.allowed)
            test.eq(res.status, 200)
        end)

        test.it("owner is allowed at READ", function()
            local thread_id = new_thread()
            local res, err = as_owner(GATE, { thread_id = thread_id, mask = READ })
            test.is_nil(err)
            test.is_true(res.allowed)
            test.eq(res.status, 200)
        end)

        test.it("a non-member is denied WRITE with 403", function()
            local thread_id = new_thread()
            local res, err = run_as(stranger, GATE, { thread_id = thread_id, mask = WRITE })
            test.is_nil(err)
            test.is_false(res.allowed == true)
            test.eq(res.status, 403)
        end)

        test.it("a non-member is denied READ with 403", function()
            local thread_id = new_thread()
            local res, err = run_as(stranger, GATE, { thread_id = thread_id, mask = READ })
            test.is_nil(err)
            test.is_false(res.allowed == true)
            test.eq(res.status, 403)
        end)

        test.it("a missing thread is not-found with 404", function()
            local res, err = as_owner(GATE, { thread_id = "missing-" .. uuid.v4(), mask = WRITE })
            test.is_nil(err)
            test.is_false(res.allowed == true)
            test.eq(res.status, 404)
        end)

        test.it("an empty thread id is not-found with 404", function()
            local res, err = as_owner(GATE, { thread_id = "", mask = WRITE })
            test.is_nil(err)
            test.is_false(res.allowed == true)
            test.eq(res.status, 404)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
