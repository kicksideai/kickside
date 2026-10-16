-- Automation execution-identity change and the status/health read model over drive and
-- command state (design v4 §4.7, §6.2; IDENTITY-1 §2, §5; CONTRACTS §19).
-- Drives, commands and ops are real rows in the automation DB on both engines;
-- the component service and the caller frame are the stubbed seams.

local test = require("test")
local uuid = require("uuid")
local drive = require("drive")
local command = require("command")
local cf = require("control_fixture")

type Map = { [string]: any }

local ACCESS = cf.ACCESS
local open_db, in_tx, seed_drive, set_drive, pending, op = cf.open_db, cf.in_tx, cf.seed_drive, cf.set_drive, cf.pending, cf.op
local component_stub, engine_with = cf.component_stub, cf.engine_with
type ComponentSpy = { sets: { Map }, access: { Map } }

local GROUP = { kind = "group", id = "eng" }

local function define_tests()
    test.describe("BOT-AUTOMATION-IDENTITY-EDITOR protected identity reader", function()
        test.it("returns only principal, authorizer and generation after ADMIN", function()
            local id = uuid.v7()
            local spy: ComponentSpy = {sets = {}, access = {}}
            local comp = component_stub(spy, {[id] = 15})
            comp.get_identity_receipt = function()
                return {component_id = id, identity_generation = 4, identity_hash = "private-hash",
                    execution_identity = {version = 2, principal = {kind = "user", id = "executor"},
                        authorized_by = {kind = "user", id = "operator"}, component_id = id,
                        captured_at = "2026-10-10T00:00:00Z", credential_id = "private-credential"}}, nil
            end
            local result, err = engine_with("operator", comp).get_execution_identity(id)
            test.is_nil(err, tostring(err))
            test.eq(result.identity_generation, 4)
            test.eq(result.principal.id, "executor")
            test.eq(result.authorized_by.id, "operator")
            local count = 0
            for _ in pairs(result) do count = count + 1 end
            test.eq(count, 3)
            test.eq(spy.access[1].mask, ACCESS.ADMIN)
        end)
        test.it("refuses READ or WRITE without opening protected context", function()
            for _, level in ipairs({0, 1, 3, 7}) do
                local id = uuid.v7()
                local comp = component_stub({sets = {}, access = {}}, {[id] = level})
                comp.get_identity_receipt = function() error("unauthorized protected context read") end
                local result, err = engine_with("reader", comp).get_execution_identity(id)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end
        end)
        test.it("refuses anonymous and invalid input before protected reads", function()
            local comp = component_stub({sets = {}, access = {}}, {})
            comp.get_identity_receipt = function() error("invalid protected context read") end
            local result, err = engine_with(nil, comp).get_execution_identity(uuid.v7())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            result, err = engine_with("operator", comp).get_execution_identity(23)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("propagates storage outages and rejects a mismatched receipt", function()
            local id = uuid.v7()
            local comp = component_stub({sets = {}, access = {}}, {[id] = 15})
            local outage = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "receipt store unavailable"})
            comp.get_identity_receipt = function() return nil, outage end
            local result, err = engine_with("operator", comp).get_execution_identity(id)
            test.is_nil(result)
            test.eq(err, outage)
            comp.get_identity_receipt = function() return {component_id = uuid.v7(), identity_generation = 0}, nil end
            result, err = engine_with("operator", comp).get_execution_identity(id)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
    end)
    test.describe("set_execution_identity", function()
        test.it("supersedes an explicitly named authority-blocked command over every drive without changing configuration", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            seed_drive(id, "reconcile")
            local _, setup_err = in_tx(function(tx)
                local reserved, reserve_err = command.reserve_tx(tx, {automation_id=id,request_id="blocked-config",
                    digest="old-desired",kind="reconfigure",input={declaration={title="pending desired"}},drive_keys={"main"}})
                if reserve_err then return nil,reserve_err end
                local generation = assert(reserved.generation, "reservation has no generation")
                local receipt_err = command.record_receipt_tx(tx,id,"blocked-config",generation,"old-desired","pin:main",
                    {thread_id="retained-thread",pin_generation=7})
                if receipt_err then return nil,receipt_err end
                return true,command.defer_tx(tx,id,"blocked-config",generation,"old-desired",
                    {kind=errors.PERMISSION_DENIED,message="original operator loses authority"},"2099-01-01T00:00:00Z")
            end)
            test.is_nil(setup_err,tostring(setup_err))
            local before = pending(id)
            local spy: ComponentSpy = {sets={},access={}}
            local component = component_stub(spy,{[id]=15})
            local calls = cf.funcs_stub(component)
            local engine = engine_with("replacement-admin",component,{funcs={new=function()
                local builder = calls.new()
                return {call=function(_,target,args)
                    local held=pending(id)
                    test.eq(held.request_id,"recover-authority")
                    test.is_true(held.generation>before.generation)
                    local db=open_db()
                    for _,key in ipairs({"main","reconcile"}) do
                        local row=select(1,drive.get(db,id,key))
                        test.eq(row.pending_command_id,"recover-authority")
                        test.eq(row.command_generation,held.generation)
                    end
                    db:release()
                    return builder:call(target,args)
                end},nil
            end}})
            local args={principal=GROUP,request_id="recover-authority",expected_identity_generation=0,
                supersede_request_id="blocked-config"}
            local result,err=engine.set_execution_identity(id,args)
            test.is_nil(err,tostring(err))
            test.eq(result.state,"succeeded")
            test.is_nil(pending(id))
            local old=op(id,"blocked-config")
            test.eq(old.state,"superseded")
            test.eq(old.target_receipts["pin:main"].pin_generation,7)
            test.eq(old.outcome.superseded_input.declaration.title,"pending desired")
            local db=open_db()
            for _,key in ipairs({"main","reconcile"}) do
                local row=select(1,drive.get(db,id,key))
                test.eq(row.applied_hash,"seed")
                test.is_nil(row.pending_command_id)
            end
            db:release()
            local _,late_err=in_tx(function(tx)
                return command.finalize_tx(tx,{automation_id=id,request_id=before.request_id,
                    generation=before.generation,digest=before.digest,state="succeeded",outcome={}})
            end)
            test.not_nil(late_err)
            test.eq(late_err:details().reason,command.REASON.STALE)
            local again,again_err=engine.set_execution_identity(id,args)
            test.is_nil(again_err,tostring(again_err))
            test.eq(again.generation,result.generation)
            test.eq(#spy.sets,1)
        end)

        test.it("refuses explicit replacement of a pending command without an authority failure", function()
            local id=uuid.v7()
            seed_drive(id,"main")
            in_tx(function(tx)
                return command.reserve_tx(tx,{automation_id=id,request_id="healthy-pending",digest="d",kind="reconfigure",
                    input={},drive_keys={"main"}})
            end)
            local spy: ComponentSpy={sets={},access={}}
            local engine=engine_with("replacement-admin",component_stub(spy,{[id]=15}))
            local _,err=engine.set_execution_identity(id,{principal=GROUP,request_id="replacement",
                expected_identity_generation=0,supersede_request_id="healthy-pending"})
            test.not_nil(err)
            test.eq(pending(id).request_id,"healthy-pending")
            test.eq(#spy.sets,0)
        end)

        test.it("sets execution identity through the canonical durable control", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            test.eq(type(engine.set_execution_identity), "function")
            local result, err = engine.set_execution_identity(id, { principal = GROUP,
                request_id = "set-identity", expected_identity_generation = 0 })
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.eq((op(id, "set-identity") :: Map).target_receipts.identity.command_id, "set-identity")
            test.eq(#spy.sets, 1)
        end)

        test.it("has no persisted dependency wake field", function()
            local db = open_db()
            local dialect = db:type()
            local rows, err
            if dialect == "sqlite" then
                rows, err = db:query("PRAGMA table_info(kickside_trigger_item_ledger)")
            else
                rows, err = db:query("SELECT column_name AS name FROM information_schema.columns"
                    .. " WHERE table_name='kickside_trigger_item_ledger'")
            end
            db:release()
            test.is_nil(err, tostring(err))
            for _, row in ipairs(rows :: { Map }) do test.is_true(row.name ~= "dependency_key") end
        end)

        test.it("selects a group principal through one command over every drive, recording the identity generation", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            seed_drive(id, "reconcile")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local result, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-1",
                expected_identity_generation = 0 })
            test.is_nil(err, tostring(err))
            test.eq(result.request_id, "set_execution_identity-1")
            test.eq(result.state, "succeeded")
            test.eq(result.identity_generation, 1)
            test.eq(result.generation, 1)

            test.eq(#spy.sets, 1)
            test.eq(spy.sets[1].component_id, id)
            test.eq(spy.sets[1].principal.kind, "group")
            test.eq(spy.sets[1].principal.id, "eng")
            test.eq(spy.sets[1].request_id, "set_execution_identity-1")
            test.eq(spy.sets[1].expected, 0)
            test.eq(spy.access[1].mask, ACCESS.ADMIN)

            local recorded = op(id, "set_execution_identity-1") :: Map
            test.eq(recorded.state, "succeeded")
            test.eq(recorded.outcome.identity_generation, 1)
            test.eq(recorded.outcome.principal.kind, "group")
            test.eq(recorded.target_receipts.identity.identity_hash, "identity:set_execution_identity-1")
            test.is_nil(pending(id))
            local db = open_db()
            for _, key in ipairs({ "main", "reconcile" }) do
                local row = select(1, drive.get(db, id, key)) :: Map
                test.eq(row.command_generation, 1)
                test.is_nil(row.pending_command_id)
            end
            db:release()
        end)

        test.it("runs the drives an unproven identity blocked once an identity is selected, keeping a pause", function()
            local id = uuid.v7()
            seed_drive(id, "main", { phase = drive.PHASE.BLOCKED_IDENTITY })
            seed_drive(id, "reconcile", { phase = drive.PHASE.BLOCKED_IDENTITY, enabled = false })
            seed_drive(id, "sweep", { phase = drive.PHASE.BLOCKED_DECLARATION })
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local result, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-unblock",
                expected_identity_generation = 0 })
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            local db = open_db()
            test.eq((select(1, drive.get(db, id, "main")) :: Map).phase, drive.PHASE.ACTIVE)
            test.eq((select(1, drive.get(db, id, "reconcile")) :: Map).phase, drive.PHASE.PAUSED)
            test.eq((select(1, drive.get(db, id, "sweep")) :: Map).phase, drive.PHASE.BLOCKED_DECLARATION)
            db:release()
        end)

        test.it("keeps identity change pending when the durable target disagrees with the setter response", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }, { durable_mismatch = true }))
            local result, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-target-mismatch",
                expected_identity_generation = 0 })
            test.is_nil(result)
            test.not_nil(err)
            test.eq((pending(id) :: Map).request_id, "set_execution_identity-target-mismatch")
            test.eq((op(id, "set_execution_identity-target-mismatch") :: Map).state, "pending")
        end)

        test.it("reads back a repeated request over a declaration with many fields", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local declaration: Map = {}
            for i = 1, 40 do declaration["field_" .. tostring(i)] = { value = i, nested = { tag = "t" .. tostring(i) } } end
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }, { declaration = declaration }))
            local args = { principal = GROUP, request_id = "set_execution_identity-wide", expected_identity_generation = 0 }
            local first, first_err = engine.set_execution_identity(id, args)
            test.is_nil(first_err, tostring(first_err))
            for _ = 1, 5 do
                local again, again_err = engine.set_execution_identity(id, args)
                test.is_nil(again_err, tostring(again_err))
                test.eq(again.generation, first.generation)
            end
            test.eq(#spy.sets, 1)
        end)

        test.it("reads back a repeated request without a second identity write, and conflicts on changed input", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local args = { principal = GROUP, request_id = "set_execution_identity-once", expected_identity_generation = 0 }
            local first, first_err = engine.set_execution_identity(id, args)
            test.is_nil(first_err, tostring(first_err))
            local again, again_err = engine.set_execution_identity(id, args)
            test.is_nil(again_err, tostring(again_err))
            test.eq(again.state, "succeeded")
            test.eq(again.identity_generation, first.identity_generation)
            test.eq(again.generation, first.generation)
            test.eq(#spy.sets, 1)

            local _, changed_err = engine.set_execution_identity(id, { principal = { kind = "user", id = "owner-1" },
                request_id = "set_execution_identity-once", expected_identity_generation = 0 })
            test.not_nil(changed_err)
            test.is_true(errors.is(changed_err, errors.CONFLICT), tostring(changed_err))
            test.eq(#spy.sets, 1)
        end)

        test.it("finishes a request left pending by a crash after reservation", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local failing = engine_with("owner-1", component_stub(spy, { [id] = 15 },
                { set_error = errors.new({ message = "component store unavailable", kind = errors.UNAVAILABLE, retryable = true }) }))
            local _, down_err = failing.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-retry",
                expected_identity_generation = 0 })
            test.not_nil(down_err)
            test.is_true(errors.is(down_err, errors.UNAVAILABLE), tostring(down_err))
            local still = pending(id) :: Map
            test.eq(still.request_id, "set_execution_identity-retry")
            test.eq(still.kind, "set_execution_identity")
            test.eq(still.last_error.kind, errors.UNAVAILABLE)
            test.eq(still.last_error.attempts, 1)

            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local result, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-retry",
                expected_identity_generation = 0 })
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.eq(result.generation, still.generation)
            test.is_nil(pending(id))
        end)

        test.it("completes a pending identity change through command recovery without its caller", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local failing = engine_with("owner-1", component_stub(spy, { [id] = 15 },
                { set_error = errors.new({ message = "component store unavailable", kind = errors.UNAVAILABLE, retryable = true }) }))
            failing.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-recover", expected_identity_generation = 0 })
            test.eq((pending(id) :: Map).request_id, "set_execution_identity-recover")

            local worker = engine_with(nil, component_stub(spy, { [id] = 15 }))
            local recovered, err = worker.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(recovered.state, "succeeded")
            test.is_nil(pending(id))
            local recorded = op(id, "set_execution_identity-recover") :: Map
            test.eq(recorded.state, "succeeded")
            test.eq(recorded.outcome.identity_generation, 1)
            test.eq(spy.sets[#spy.sets].request_id, "set_execution_identity-recover")
        end)

        test.it("finalizes a denied selection as a failed op and returns the component's typed denial", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 },
                { set_error = errors.new({ message = "may_act_as denied for group:eng", kind = errors.PERMISSION_DENIED }) }))
            local _, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-denied",
                expected_identity_generation = 0 })
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.contains(tostring(err), "may_act_as denied")
            local recorded = op(id, "set_execution_identity-denied") :: Map
            test.eq(recorded.state, "failed")
            test.eq(recorded.outcome.kind, errors.PERMISSION_DENIED)
            test.is_nil(pending(id))
        end)

        test.it("requires ADMIN before any command is reserved", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("sharee-1", component_stub(spy, { [id] = ACCESS.READ + ACCESS.WRITE }))
            local _, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-write",
                expected_identity_generation = 0 })
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.is_nil(op(id, "set_execution_identity-write"))
            test.eq(#spy.sets, 0)
        end)

        test.it("refuses an unauthenticated caller, an unknown principal kind and a missing request id", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local anonymous = engine_with(nil, component_stub(spy, { [id] = 15 }))
            local _, anon_err = anonymous.set_execution_identity(id, { principal = GROUP, request_id = "r", expected_identity_generation = 0 })
            test.is_true(errors.is(anon_err, errors.PERMISSION_DENIED), tostring(anon_err))

            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local _, kind_err = engine.set_execution_identity(id, { principal = { kind = "robot", id = "r2" }, request_id = "r",
                expected_identity_generation = 0 })
            test.is_true(errors.is(kind_err, errors.INVALID), tostring(kind_err))
            local _, request_err = engine.set_execution_identity(id, { principal = GROUP, expected_identity_generation = 0 })
            test.is_true(errors.is(request_err, errors.INVALID), tostring(request_err))
            local _, gen_err = engine.set_execution_identity(id, { principal = GROUP, request_id = "r", expected_identity_generation = -1 })
            test.is_true(errors.is(gen_err, errors.INVALID), tostring(gen_err))
            test.eq(#spy.sets, 0)
            test.is_nil(op(id, "r"))
        end)

        test.it("reports command_pending while another request holds the command", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local _, reserve_err = in_tx(function(tx)
                return command.reserve_tx(tx, { automation_id = id, request_id = "other", digest = "d", kind = "reconfigure",
                    input = {}, drive_keys = { "main" } })
            end)
            test.is_nil(reserve_err)
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local _, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-blocked",
                expected_identity_generation = 0 })
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.eq(((err :: any):details() or {}).reason, command.REASON.PENDING)
            test.eq(#spy.sets, 0)
        end)

        test.it("refuses an automation that holds no drives", function()
            local id = uuid.v7()
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local _, err = engine.set_execution_identity(id, { principal = GROUP, request_id = "set_execution_identity-none",
                expected_identity_generation = 0 })
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.eq(#spy.sets, 0)
        end)
    end)

    test.describe("get_runtime", function()
        test.it("answers a component read failure as its typed infrastructure error and a missing automation as NOT_FOUND", function()
            local spy: ComponentSpy = { sets = {}, access = {} }
            local down = engine_with("owner-1", component_stub(spy, {},
                { list_error = errors.new({ message = "component store unavailable", kind = errors.UNAVAILABLE, retryable = true }) }))
            local _, down_err = down.get_runtime({ id = uuid.v7() })
            test.not_nil(down_err)
            test.is_true(errors.is(down_err, errors.UNAVAILABLE), tostring(down_err))

            local empty = component_stub(spy, {})
            empty.list_system = function(_filter: Map): (any?, any) return {}, nil end
            local _, missing_err = engine_with("owner-1", empty).get_runtime({ id = uuid.v7() })
            test.not_nil(missing_err)
            test.is_true(errors.is(missing_err, errors.NOT_FOUND), tostring(missing_err))
        end)
    end)

    test.describe("status", function()
        test.it("reports retained dead deliveries and their reason in status, listing and readable health", function()
            local visible, other = uuid.v7(), uuid.v7()
            seed_drive(visible, "main")
            seed_drive(other, "main")
            for _, id in ipairs({ visible, other }) do
                local db = open_db()
                local _, err = db:execute("INSERT INTO kickside_trigger_item_ledger"
                    .. " (owner_id,source_port,item_key,identity_key,state,first_failed_at,last_failed_at,created_at,updated_at,error_code,error_message)"
                    .. " VALUES ($1,'fixture:source','receipt','delivery','dead',$2,$2,$2,$2,'invalid_expression','payload.filename is missing')",
                    { id, "2026-10-02T00:00:00Z" })
                db:release()
                test.is_nil(err, tostring(err))
            end
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("viewer-1", component_stub(spy, { [visible] = ACCESS.READ }, {
                query = function(args: Map): (any?, any)
                    if (args.offset or 0) > 0 then return {}, nil end
                    return { { component_id = visible, impl_id = "kickside.automation.round.fixture:kind",
                        meta = { class = "automation" }, access_level = ACCESS.READ } }, nil
                end,
            }))
            local status, err = engine.status(visible, {})
            test.is_nil(err, tostring(err))
            test.not_nil(status.delivery_failures)
            test.eq(status.delivery_failures.count, 1)
            test.eq(status.delivery_failures.last_error.code, "invalid_expression")
            test.eq(status.delivery_failures.last_error.message, "payload.filename is missing")
            local listed, list_err = engine.list_installed({ actor_id = "viewer-1" })
            test.is_nil(list_err, tostring(list_err))
            test.eq(listed[1].drive_status.delivery_failures.count, 1)
            local health, health_err = engine.health()
            test.is_nil(health_err, tostring(health_err))
            test.eq(health.dead_items, 1, "unreadable automation failures must be excluded")
            test.eq(#health.delivery_failures, 1)
            test.eq(health.delivery_failures[1].automation_id, visible)
            test.eq(health.delivery_failures[1].last_error.code, "invalid_expression")
        end)


        test.it("pages drives in drive_key order with the command state and drive counters", function()
            local id = uuid.v7()
            for _, key in ipairs({ "c", "a", "b" }) do seed_drive(id, key) end
            set_drive(id, "a", { phase = "degraded", uncertain_count = 2, unresolved_count = 5,
                last_error_json = '{"message":"provider timeout","kind":"Unavailable"}' })
            set_drive(id, "b", { uncertain_count = 1, unresolved_count = 1 })
            local _, reserve_err = in_tx(function(tx)
                return command.reserve_tx(tx, { automation_id = id, request_id = "resync-1", digest = "d", kind = "resync",
                    input = {}, drive_keys = { "b" } })
            end)
            test.is_nil(reserve_err)

            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("viewer-1", component_stub(spy, { [id] = ACCESS.READ }))
            local first, err = engine.status(id, { page_size = 2 })
            test.is_nil(err, tostring(err))
            test.eq(spy.access[1].mask, ACCESS.READ)
            test.eq(#first.drives, 2)
            test.eq(first.drives[1].drive_key, "a")
            test.eq(first.drives[1].phase, "degraded")
            test.eq(first.drives[1].last_error.message, "provider timeout")
            test.is_nil(first.drives[1].round_token)
            test.is_nil(first.drives[1].applied)
            test.eq(first.drives[2].drive_key, "b")
            test.eq(first.drives[2].pending_command_id, "resync-1")
            test.eq(first.next_page_token, "b")
            test.eq(first.commands.generation, 1)
            test.eq(first.commands.pending.request_id, "resync-1")
            test.eq(first.commands.pending.kind, "resync")
            test.eq(first.commands.pending.drive_keys[1], "b")
            test.eq(first.ledger_counts.unresolved, 6)
            test.eq(first.ledger_counts.uncertain, 3)

            local second, second_err = engine.status(id, { page_size = 2, page_token = first.next_page_token })
            test.is_nil(second_err, tostring(second_err))
            test.eq(#second.drives, 1)
            test.eq(second.drives[1].drive_key, "c")
            test.is_nil(second.next_page_token)
        end)

        -- The manager's rows carry the same drive projection the status action
        -- answers, read for every listed automation at once.
        test.it("runtime readers observe generic pause and resume on the next read", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("owner-1", component_stub(spy, { [id] = 15 }))
            local function runtime(): any
                local item, err = engine.get_runtime({ id = id, include_state = true, include_drive_status = true })
                test.is_nil(err, tostring(err))
                test.not_nil(item.drive_status)
                return item.drive_status.drives[1]
            end
            test.is_true(runtime().enabled)
            local paused, pause_err = engine.generic_action(id, "pause", {})
            test.is_nil(pause_err, tostring(pause_err))
            test.eq(paused.state, "succeeded")
            test.is_false(runtime().enabled)
            test.eq(runtime().phase, "paused")
            local resumed, resume_err = engine.generic_action(id, "resume", {})
            test.is_nil(resume_err, tostring(resume_err))
            test.eq(resumed.state, "succeeded")
            test.is_true(runtime().enabled)
            test.eq(runtime().phase, "active")
            local omitted, omitted_err = engine.get_runtime({ id = id })
            test.is_nil(omitted_err)
            test.is_nil(omitted.drive_status)
        end)

        test.it("lists each automation with the drive status its status action reads", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            set_drive(id, "main", { phase = "paused", enabled = false, unresolved_count = 3 })
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("viewer-1", component_stub(spy, { [id] = ACCESS.READ }, {
                query = function(_args: Map): (any?, any)
                    return { { component_id = id, impl_id = "kickside.automation.round.fixture:kind",
                        meta = { class = "automation", title = "Listed" }, access_level = ACCESS.READ } }, nil
                end,
            }))
            local list, err = engine.list_installed({ actor_id = "viewer-1", class = "automation" })
            test.is_nil(err, tostring(err))
            test.eq(#list, 1)
            local drives = list[1].drive_status.drives
            test.eq(#drives, 1)
            test.eq(drives[1].drive_key, "main")
            test.eq(drives[1].phase, "paused")
            test.eq(drives[1].enabled, false)
            test.eq(drives[1].unresolved_count, 3)
            test.is_nil(drives[1].applied)
            local status = engine.status(id, {})
            test.eq(status.drives[1].phase, drives[1].phase)
        end)

        test.it("requires READ and a bounded page size", function()
            local id = uuid.v7()
            seed_drive(id, "main")
            local spy: ComponentSpy = { sets = {}, access = {} }
            local denied = engine_with("stranger", component_stub(spy, {}))
            local _, access_err = denied.status(id, {})
            test.is_true(errors.is(access_err, errors.PERMISSION_DENIED), tostring(access_err))

            local engine = engine_with("viewer-1", component_stub(spy, { [id] = ACCESS.READ }))
            local _, size_err = engine.status(id, { page_size = 0 })
            test.is_true(errors.is(size_err, errors.INVALID), tostring(size_err))
            local _, big_err = engine.status(id, { page_size = 1001 })
            test.is_true(errors.is(big_err, errors.INVALID), tostring(big_err))
        end)
    end)

    test.describe("health", function()
        test.it("aggregates the caller's readable automations only", function()
            local visible, other = uuid.v7(), uuid.v7()
            seed_drive(visible, "main")
            seed_drive(visible, "late")
            seed_drive(other, "main")
            set_drive(visible, "main", { phase = "degraded", uncertain_count = 4 })
            set_drive(visible, "late", { next_run_at = "2000-01-01T00:00:00Z" })
            set_drive(other, "main", { phase = "degraded", uncertain_count = 9, next_run_at = "2000-01-01T00:00:00Z" })
            local _, reserve_err = in_tx(function(tx)
                return command.reserve_tx(tx, { automation_id = visible, request_id = "reconf", digest = "d",
                    kind = "reconfigure", input = {}, drive_keys = { "main" } })
            end)
            test.is_nil(reserve_err)

            local queries: { Map } = {}
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with("viewer-1", component_stub(spy, {}, {
                query = function(args: Map): (any?, any)
                    queries[#queries + 1] = args
                    if (args.offset or 0) > 0 then return {}, nil end
                    return { { component_id = visible } }, nil
                end,
            }), { registry = {
                find = function(_q: any): (any?, any)
                    return { { id = "fixture:automation", kind = "contract.binding", meta = { type = "kickside.automation" } } }, nil
                end,
            } })
            local health, err = engine.health()
            test.is_nil(err, tostring(err))
            test.eq(queries[1].actor_id, "viewer-1")
            test.eq(queries[1].access_mask, ACCESS.READ)
            test.eq(health.degraded_drives, 1)
            test.eq(health.uncertain_items, 4)
            test.eq(health.overdue_count, 1)
            test.is_true(health.oldest_pending_command_ms >= 0)
            -- An overdue round is an error with its age, never a green counter.
            test.is_false(health.healthy)
            test.is_true(health.oldest_overdue_ms > 0)
            local codes: { [string]: Map } = {}
            for _, issue in ipairs(health.issues) do codes[issue.code] = issue end
            test.not_nil(codes.rounds_overdue)
            test.eq(codes.rounds_overdue.count, 1)
            test.eq(codes.rounds_overdue.oldest_overdue_ms, health.oldest_overdue_ms)
            test.not_nil(codes.drives_degraded)
        end)

        test.it("requires an authenticated caller", function()
            local spy: ComponentSpy = { sets = {}, access = {} }
            local engine = engine_with(nil, component_stub(spy, {}))
            local _, err = engine.health()
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
