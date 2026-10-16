local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local harness = require("automation_test_engine")
local shared = require("recovery_shared")
local command = require("command")
local drive = require("drive")

local TYPE = "fixture:selected_type"
local PREPARE = "fixture:prepare"
local CREATE = "kickside.automation:declaration_writer_create_selected"
local APPLY = "kickside.automation:declaration_writer_apply"
local IDENTITY = "kickside.automation:identity_writer"
local operator = {kind = "user", id = "selected_operator"}
local principal = {kind = "user", id = "selected_executor"}

type State = {
    prepares: integer, creates: integer, identities: integer, slots: integer, bodies: integer, checks: integer,
    created: boolean, identity: boolean, credential_id: string?, target_field: string?,
    denied: boolean?, preflight_denied: boolean?, preflight_unavailable: boolean?, failure: string?, concurrent: (() -> ())?,
}

local function fixture()
    local id = uuid.v7()
    local state: State = {prepares = 0, creates = 0, identities = 0, slots = 0, bodies = 0, checks = 0,
        created = false, identity = false}
    local args = {component_id = id, request_id = "selected:" .. id, principal = principal}
    local entry = {kind = "contract.binding", meta = {type = "kickside.automation", inputs = {}}, data = {
        contracts = {{contract = "kickside.contract:installable", methods = {install = "fixture:legacy"}},
            {contract = "kickside.automation:prepared_installable", methods = {prepare_install = PREPARE}}}}}
    local function receipt()
        local stored = {version = 2, principal = principal, authorized_by = operator,
            component_id = id, captured_at = "2026-10-10T00:00:00Z", credential_id = state.credential_id}
        if state.target_field == "authorized_by" then stored.authorized_by = {kind = "user", id = "other-operator"} end
        if state.target_field == "component_id" then stored.component_id = "other-root" end
        if state.target_field == "credential_id" then stored.credential_id = nil end
        return {execution_identity = stored, component_id = id, principal = state.identity and principal or operator,
            identity_generation = state.identity and 1 or 0, identity_hash = state.identity and "selected-hash" or "operator-hash",
            declaration_hash = shared.command_state(id).pending.digest,
            declaration_command_id = args.request_id, declaration_command_generation = 1}
    end
    local overrides = {
        registry = {get = function() return entry, nil end},
        security = {actor = function() return {id = function() return operator.id end} end},
        execution_identity = {
            check_principal = function(value) return value, nil end,
            capture = function(input) return {version = 2, principal = input and input.principal or operator, authorized_by = operator,
                component_id = input and input.component_id or nil, captured_at = "2026-10-10T00:00:00Z", credential_id = state.credential_id}, nil end,
            authorize = function(identity)
                test.eq(identity.component_id, id)
                test.eq(identity.authorized_by.id, operator.id)
                test.eq(identity.principal.id, principal.id)
                if state.preflight_denied or state.preflight_unavailable then
                    return nil, errors.new({kind = state.preflight_denied and errors.PERMISSION_DENIED or errors.UNAVAILABLE,
                        retryable = state.preflight_unavailable == true, message = "selection preflight fails"})
                end
                return {principal = identity.principal}, nil
            end,
            actor_key = function(value) return value.id end,
        },
        declaration_authority = {check = function(identity)
            state.checks = state.checks + 1
            if state.denied and identity.principal.id == principal.id then
                return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "selection revoked"})
            end
            return true, nil
        end},
        component = {get_identity_receipt = function() return receipt(), nil end},
        funcs = {new = function() return {with_context = function(self) return self end,
            call = function(_, target)
                if target == PREPARE then
                    state.prepares = state.prepares + 1
                    if state.concurrent then
                        local concurrent = state.concurrent
                        state.concurrent = nil
                        concurrent()
                    end
                    return {state = {title = "Prepared task"}, metadata = {title = "Prepared task"},
                        source = {source_kind = "timer", schedule = {type = "interval", expression = "1h"}}}, nil
                end
                if target == "fixture:legacy" then state.bodies = state.bodies + 1; error("legacy body runs") end
                local pending = shared.command_state(id).pending
                test.not_nil(pending)
                local row = shared.read_drive(id, "main")
                test.eq(row.pending_command_id, args.request_id)
                test.eq(row.enabled, false)
                test.eq(state.slots, 0)
                if target == CREATE then
                    if not state.created then state.creates = state.creates + 1; state.created = true end
                elseif target == IDENTITY then
                    test.is_true(state.created)
                    if not state.identity then state.identities = state.identities + 1; state.identity = true end
                elseif target == APPLY then
                    if state.denied then return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                        message = "selection revoked"}) end
                else error("unexpected target " .. target) end
                if state.failure == target then
                    return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "after target commit"})
                end
                return {component_id = id, identity_generation = state.identity and 1 or 0, success = true}, nil
            end}, nil end},
        slot = {ensure_dispatcher = function() return true, nil end,
            wake_dispatcher = function() return true, nil end,
            provision = function()
                test.is_nil(shared.command_state(id).pending)
                test.is_true(state.identity)
                state.slots = state.slots + 1
                return "fixture-job", nil
            end},
    }
    return id, args, state, entry, function() return harness.new(overrides) end
end

local function installed(id, args, state)
    test.eq(state.prepares, 1)
    test.eq(state.creates, 1)
    test.eq(state.identities, 1)
    test.eq(state.bodies, 0)
    test.is_nil(shared.command_state(id).pending)
    test.eq(shared.op_of(id, args.request_id).state, "succeeded")
    test.not_nil(shared.op_of(id, args.request_id).target_receipts.identity)
    test.not_nil(shared.op_of(id, args.request_id).target_receipts.declaration)
    test.eq(shared.read_drive(id, "main").enabled, true)
end

return {run = test.run_cases(function()
    test.describe("recoverable selected installation", function()
        test.it("RA-H56 finalizes selected identity and declaration before provisioning a slot", function()
            local id, args, state, _, engine = fixture()
            test.not_nil(engine().install_type_selected, "selected installation capability is absent")
            local result, err = engine().install_type_selected(TYPE, {}, args)
            test.is_nil(err, tostring(err))
            test.eq(result.id, id)
            installed(id, args, state)
            test.eq(state.slots, 1)
        end)
        for _, failure in ipairs({"denied", "unavailable"}) do
            test.it("selection preflight " .. failure .. " leaves no preparation or command and permits a later retry", function()
                local id, args, state, _, engine = fixture()
                if failure == "denied" then state.preflight_denied = true else state.preflight_unavailable = true end
                local result, err = engine().install_type_selected(TYPE, {}, args)
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(errors.is(err, failure == "denied" and errors.PERMISSION_DENIED or errors.UNAVAILABLE))
                test.eq(state.prepares, 0)
                test.eq(state.creates, 0)
                test.eq(state.slots, 0)
                test.is_nil(shared.command_state(id).pending)
                test.is_nil(shared.op_of(id, args.request_id))
                state.preflight_denied, state.preflight_unavailable = false, false
                local admitted, admission_err = engine().install_type_selected(TYPE, {}, args)
                test.is_nil(admission_err, tostring(admission_err))
                test.eq(admitted.id, id)
                installed(id, args, state)
            end)
        end
        for _, target in ipairs({CREATE, IDENTITY, APPLY}) do
            test.it("RA-H56 recovers " .. target .. " after its target commit without replaying preparation", function()
                local id, args, state, _, engine = fixture()
                test.not_nil(engine().install_type_selected, "selected installation capability is absent")
                state.failure = target
                local _, err = engine().install_type_selected(TYPE, {}, args)
                test.not_nil(err)
                test.eq(state.slots, 0)
                test.not_nil(shared.command_state(id).pending)
                test.eq(shared.read_drive(id, "main").enabled, false)
                state.failure = nil
                local result, recovery_err = engine().recover_command(id)
                test.is_nil(recovery_err, tostring(recovery_err))
                test.eq(result.state, "succeeded")
                installed(id, args, state)
            end)
        end
        test.it("RA-H36 rechecks selected live authority after identity commit and keeps the drive fenced", function()
            local id, args, state, _, engine = fixture()
            test.not_nil(engine().install_type_selected, "selected installation capability is absent")
            state.failure = IDENTITY
            local _, err = engine().install_type_selected(TYPE, {}, args)
            test.not_nil(err)
            state.failure = nil
            state.denied = true
            local result, recovery_err = engine().recover_command(id)
            test.is_nil(recovery_err, tostring(recovery_err))
            test.eq(result.state, "pending")
            test.eq(state.slots, 0)
            test.eq(shared.read_drive(id, "main").enabled, false)
            state.denied = false
            test.eq(engine().recover_command(id).state, "succeeded")
            installed(id, args, state)
        end)
        test.it("RA-H19 replays identical requests without preparation or a second identity audit", function()
            local id, args, state, _, engine = fixture()
            test.not_nil(engine().install_type_selected, "selected installation capability is absent")
            test.not_nil((engine().install_type_selected(TYPE, {title = "original"}, args)))
            local result, err = engine().install_type_selected(TYPE, {title = "original"}, args)
            test.is_nil(err, tostring(err))
            test.eq(result.id, id)
            installed(id, args, state)
            test.eq(state.slots, 1)
            local changed, changed_err = engine().install_type_selected(TYPE, {title = "changed"}, args)
            test.is_nil(changed)
            test.is_true(errors.is(changed_err, errors.CONFLICT))
            test.eq(state.prepares, 1)
        end)
        test.it("RA-H19 concurrent preparation reserves one drive plan and one identity", function()
            local id, args, state, _, engine = fixture()
            state.concurrent = function()
                local result, err = engine().install_type_selected(TYPE, {}, args)
                test.is_nil(err, tostring(err))
                test.eq(result.id, id)
            end
            local result, err = engine().install_type_selected(TYPE, {}, args)
            test.is_nil(err, tostring(err))
            test.eq(result.id, id)
            test.eq(state.prepares, 2)
            test.eq(state.creates, 1)
            test.eq(state.identities, 1)
            test.eq(state.slots, 1)
            test.eq(state.bodies, 0)
            test.is_nil(shared.command_state(id).pending)
        end)
        for _, field in ipairs({"authorized_by", "component_id", "credential_id"}) do
            test.it("RA-H21 mismatched target " .. field .. " keeps the selected drive fenced", function()
                local id, args, state, _, engine = fixture()
                state.credential_id = "captured-credential"
                state.target_field = field
                local result, err = engine().install_type_selected(TYPE, {}, args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
                test.eq(state.slots, 0)
                test.eq(shared.read_drive(id, "main").enabled, false)
                test.not_nil(shared.command_state(id).pending)
                test.is_nil(shared.op_of(id, args.request_id).target_receipts.identity)
                state.target_field = nil
                test.eq(engine().recover_command(id).state, "succeeded")
                installed(id, args, state)
            end)
        end
        test.it("RA-H56 refuses types without preparation and never calls their legacy body", function()
            local _, args, state, entry, engine = fixture()
            test.not_nil(engine().install_type_selected, "selected installation capability is absent")
            entry.data.contracts[2] = nil
            local result, err = engine().install_type_selected(TYPE, {}, args)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(state.prepares, 0)
            test.eq(state.bodies, 0)
            test.eq(state.slots, 0)
        end)
    end)
end)}
