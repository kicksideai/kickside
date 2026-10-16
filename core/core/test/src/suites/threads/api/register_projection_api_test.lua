-- POST /threads/{id}/projections identity (IDENTITY-1 §2, §4 T row): the
-- execution identity of an HTTP-registered projection is captured server-side
-- from the authenticated caller and rooted in the thread's component, so the
-- deferred resolver checks the caller's live root ADMIN on every run. A body
-- naming an identity is refused, and a caller without ADMIN on the thread
-- installs nothing. Runs on SQLite and PostgreSQL.

local test = require("test")
local uuid = require("uuid")
local json = require("json")
local sql = require("sql")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")

local THREADS = "kickside.core:threads"
local REGISTER = "app:test_register_projection"
local WORKER_REF = "func://app:test_count_worker"

local function define_tests()
    test.describe("HTTP projection registration identity", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "rp-owner-" .. suffix
        local victim = "rp-victim-" .. suffix
        local stranger = "rp-stranger-" .. suffix

        local function scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id: string, args: any): any
            local actor = security.new_actor(user_id, { security_groups = {} })
            local res, err = funcs.new():with_actor(actor):with_scope(scope()):call(REGISTER, args)
            if err then error("register call failed: " .. tostring(err)) end
            return res
        end

        local function new_thread(): string
            local actor = security.new_actor(owner, { security_groups = {} })
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            local created, err = inst:create({ thread_class = "rp_" .. suffix })
            if err then error("create failed: " .. tostring(err)) end
            return created.thread_id
        end

        local function cursor_identity(thread_id: string, kind: string): any
            local db, err = sql.get("app:db")
            if err or not db then error(tostring(err)) end
            local rows = db:query("SELECT c.actor_id, c.execution_identity_json FROM kickside_projection_cursor c"
                .. " JOIN kickside_projection p ON p.id = c.projection_id WHERE p.thread_id = $1 AND p.kind = $2",
                { thread_id, kind })
            db:release()
            return rows and rows[1] or nil
        end

        test.it("captures the caller as principal and authorizer, rooted in the thread's component", function()
            local thread_id = new_thread()
            local res = run_as(owner, { thread_id = thread_id, body = { kind = "captured", worker_ref = WORKER_REF } })
            test.eq(res.status, 201, json.encode(res.body))
            local row = cursor_identity(thread_id, "captured")
            test.not_nil(row)
            test.eq(row.actor_id, owner)
            local identity = json.decode(row.execution_identity_json)
            test.eq(identity.principal.kind, "user")
            test.eq(identity.principal.id, owner)
            test.eq(identity.authorized_by.id, owner)
            test.not_nil(identity.component_id)
        end)

        test.it("refuses a client-supplied execution identity", function()
            local thread_id = new_thread()
            local forged = { version = 2, principal = { kind = "user", id = victim },
                authorized_by = { kind = "user", id = victim }, captured_at = "2026-09-27T00:00:00Z" }
            local res = run_as(owner, { thread_id = thread_id,
                body = { kind = "forged", worker_ref = WORKER_REF, execution_identity = forged } })
            test.eq(res.status, 400, json.encode(res.body))
            test.is_false(res.body.success)
            test.is_nil(cursor_identity(thread_id, "forged"))
        end)

        test.it("refuses private and configured-security projection targets", function()
            local thread_id = new_thread()
            local targets: string[] = { "app:test_private_projection_worker", "app:test_actor_projection_worker",
                "app:test_scoped_projection_worker", "app:test_private_proc_projection_worker",
                "kickside.core.lifecycle:reaper" }
            for _, target in ipairs(targets) do
                local kind = target:match(":(.+)$")
                local scheme = target == "app:test_private_proc_projection_worker" and "proc://" or "func://"
                local res = run_as(owner, { thread_id = thread_id,
                    body = { kind = kind, worker_ref = scheme .. target } })
                test.eq(res.status, 403, json.encode(res.body))
                test.is_nil(cursor_identity(thread_id, kind))
            end
        end)

        test.it("installs nothing for a caller without ADMIN on the thread", function()
            local thread_id = new_thread()
            local res = run_as(stranger, { thread_id = thread_id, body = { kind = "stranger", worker_ref = WORKER_REF } })
            test.eq(res.status, 403, json.encode(res.body))
            test.is_nil(cursor_identity(thread_id, "stranger"))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
