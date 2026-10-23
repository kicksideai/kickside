local test = require("test")
local execution_identity = require("execution_identity")
local uuid = require("uuid")
local errors = require("errors")
local canonical = require("canonical_json")
local command = require("command")
local controls = require("controls")
local drive = require("drive")
local cf = require("control_fixture")

type Map = { [string]: any }

local function fingerprint(value: any): string
    local digest, err = canonical.hash(value)
    if err then error(tostring(err)) end
    return assert(digest)
end

local function engine(actor_id: string?, id: string, access: integer?, extra: Map?): any
    return cf.engine_with(actor_id, cf.component_stub({sets = {}, access = {}}, {[id] = access or 15}), extra)
end

local function define_tests()
    test.describe("AUTOMATION-CONTROL-INITIATION authenticated command evidence", function()
        for _, control in ipairs({"pause", "resume", "run_now", "replay", "discard", "resync"}) do
            test.it("retains the authenticated initiator of " .. control .. " without changing its response or digest", function()
                local id = uuid.v7()
                cf.seed_drive(id, "main")
                local args = {control = control, request_id = "initiate", keys = {"unused"},
                    actor_id = "forged", initiation = {actor_id = "forged"},
                    execution_identity = {principal = {kind = "user", id = "forged"}}}
                local result, err = engine("actual-operator", id).control(id, args)
                test.is_nil(err, tostring(err))
                test.eq(result.state, "succeeded")
                test.is_nil(result.initiation)
                test.is_nil(result.target_receipts)
                local op = cf.op(id, "initiate")
                test.not_nil(op.target_receipts.initiation)
                test.eq(op.target_receipts.initiation.actor_id, "actual-operator")
                local fields = 0
                for _ in pairs(op.target_receipts.initiation) do fields = fields + 1 end
                test.eq(fields, 1)
                local digest, digest_err = canonical.hash({control = control, drive_keys = {"main"}, keys = {"unused"}})
                test.is_nil(digest_err, tostring(digest_err))
                test.eq(op.digest, digest)
                local status, status_err = engine("reader", id, cf.ACCESS.READ).status(id, {})
                test.is_nil(status_err, tostring(status_err))
                test.is_nil(status.commands.initiation)
                test.is_nil(status.commands.target_receipts)
            end)
        end

        test.it("preserves the first initiator across another actor's replay and rejects changed input", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main")
            local args = {control = "run_now", request_id = "once"}
            local first, first_err = engine("first-operator", id).control(id, args)
            test.is_nil(first_err, tostring(first_err))
            local before = assert(cf.op(id, "once"))
            local again, again_err = engine("second-operator", id).control(id, args)
            test.is_nil(again_err, tostring(again_err))
            test.eq(again.generation, first.generation)
            test.eq(fingerprint(cf.op(id, "once")), fingerprint(before))
            local changed, changed_err = engine("second-operator", id).control(id, {control = "pause", request_id = "once"})
            test.is_nil(changed)
            test.is_true(errors.is(changed_err, errors.CONFLICT), tostring(changed_err))
            test.eq(cf.op(id, "once").target_receipts.initiation.actor_id, "first-operator")
        end)

        test.it("keeps an older recorded command without initiating evidence unchanged on replay", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main")
            local digest = fingerprint({control = "run_now", drive_keys = {"main"}, keys = {}})
            local _, setup_err = cf.in_tx(function(tx)
                return command.run_tx(tx, {automation_id = id, request_id = "older", digest = digest,
                    kind = "run_now", input = {control = "run_now"}, drive_keys = {"main"}},
                    function() return {round = "queued"}, nil end)
            end)
            test.is_nil(setup_err, tostring(setup_err))
            local before = assert(cf.op(id, "older"))
            local result, err = engine("new-reader", id).control(id, {control = "run_now", request_id = "older"})
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.is_nil(cf.op(id, "older").target_receipts.initiation)
            test.eq(fingerprint(cf.op(id, "older")), fingerprint(before))
        end)

        test.it("retains absent evidence for an existing internal control without an ambient actor", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main")
            local result, err = engine(nil, id).control(id, {control = "pause", request_id = "internal"})
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.is_nil(cf.op(id, "internal").target_receipts.initiation)
        end)

        test.it("refuses access and rolls back a failed control without adding historical evidence", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main")
            local result, err = engine("reader", id, cf.ACCESS.READ).control(id, {control = "pause", request_id = "denied"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.is_nil(cf.op(id, "denied"))
            result, err = engine("operator", id).control(id, {control = "discard", request_id = "invalid"})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.is_nil(cf.op(id, "invalid"))
            test.is_nil(cf.pending(id))
        end)

        test.it("propagates actor lookup and receipt storage failures without partial command writes", function()
            for _, seam in ipairs({"actor", "receipt"}) do
                local id = uuid.v7()
                cf.seed_drive(id, "main")
                local outage = errors.new({kind = errors.UNAVAILABLE, message = seam .. " unavailable", retryable = true})
                local extra: Map = {}
                if seam == "actor" then
                    extra.security = {actor = function() return nil, outage end}
                else
                    local methods: Map = {}
                    for k, v in pairs(command) do methods[k] = v end
                    methods.record_receipt_tx = function() return outage end
                    extra.command = methods
                end
                local result, err = engine("operator", id, nil, extra).control(id, {control = "pause", request_id = seam})
                test.is_nil(result)
                test.eq(err, outage)
                test.is_nil(cf.op(id, seam))
                test.is_nil(cf.pending(id))
                local db = cf.open_db()
                local row, read_err = drive.get(db, id, "main")
                db:release()
                test.is_nil(read_err, tostring(read_err))
                test.eq(row.command_generation, 0)
                test.is_true(row.enabled)
            end
        end)

        test.it("captures deferred event resync once and retains its receipt after caller-free recovery", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main", {source_kind = "event", source_thread_id = uuid.v7(), event_seq = 17})
            local outage = errors.new({kind = errors.UNAVAILABLE, message = "pin store unavailable", retryable = true})
            local shared: Map = {in_automation_tx = cf.in_tx, command_steps = {},
                wake_dispatcher = function() return nil end,
                execute_pending = function() return nil, outage end}
            local product: Map = {}
            local deps = {drive = drive, command = command, canonical_json = canonical,
                component = cf.component_stub({sets = {}, access = {}}, {[id] = 15}), security = cf.actor_frame("first-operator"),
                execution_identity = {validate = execution_identity.validate, actor_key = execution_identity.actor_key,
                    same_principal = execution_identity.same_principal,
                    authorize = function(saved, opts)
                        test.eq(saved.principal.id, "first-operator")
                        test.eq(opts.deferred_owner, "kickside.automation:command_dispatcher")
                        return {principal = saved.principal, meta = {security_groups = {}}}, nil
                    end, capture = function()
                    return {version = 2, principal = {kind = "user", id = "first-operator"},
                        authorized_by = {kind = "user", id = "first-operator"}, captured_at = "2026-10-01T00:00:00Z"}, nil
                end}}
            deps.component.validate_principal_access = function(component_id, mask, principal)
                test.eq(component_id, id)
                test.eq(mask, deps.component.ACCESS.WRITE)
                test.eq(principal.id, "first-operator")
                return true, nil
            end
            controls.attach(product, deps, shared)
            local args = {control = "resync", request_id = "deferred", from = 0}
            local result, err = product.control(id, args)
            test.is_nil(result)
            test.eq(err, outage)
            local before = assert(cf.op(id, "deferred"))
            test.not_nil(before.target_receipts.initiation)
            test.eq(before.target_receipts.initiation.actor_id, "first-operator")
            local pending = assert(cf.pending(id))
            test.eq(pending.input.operator_id, "first-operator")
            test.eq(pending.input.operator_identity.principal.id, "first-operator")
            deps.security = cf.actor_frame("second-operator")
            product.control(id, args)
            test.eq(fingerprint(cf.op(id, "deferred")), fingerprint(before))
            shared.lower_pins = function() return {main = {pin_generation = 9}}, nil end
            local _, receipt_err = cf.in_tx(function(tx)
                return true, command.record_receipt_tx(tx, id, "deferred", pending.generation, pending.digest,
                    "pin:main", {pin_generation = 9})
            end)
            test.is_nil(receipt_err, tostring(receipt_err))
            local recovered, recovery_err = shared.command_steps.resync_event(pending)
            test.is_nil(recovery_err, tostring(recovery_err))
            test.eq(recovered.state, "succeeded")
            test.eq(cf.op(id, "deferred").target_receipts.initiation.actor_id, "first-operator")
            test.eq(cf.op(id, "deferred").target_receipts["pin:main"].pin_generation, 9)
            test.is_nil(cf.pending(id))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {run = function(options: any): any return run_cases(options) end}
