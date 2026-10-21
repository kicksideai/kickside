local test = require("test")
local uuid = require("uuid")
local controls = require("controls")
local command = require("command")
local drive = require("drive")
local cf = require("control_fixture")
local canonical = require("canonical_json")
local execution_identity = require("execution_identity")

type Map = { [string]: any }

local function define_tests()
    test.describe("event resync operator authority", function()
        test.it("retains a delegated group's existing resync authority", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main", {source_kind = "event", source_thread_id = uuid.v7(), event_seq = 17})
            local principal = {kind = "group", id = "operators"}
            local operator = execution_identity.actor_key(principal)
            local identity = {version = 2, principal = principal, authorized_by = {kind = "user", id = "member"},
                captured_at = "2026-10-01T00:00:00Z"}
            local _, err = cf.in_tx(function(tx)
                return command.reserve_tx(tx, {automation_id = id, request_id = "group-resync", digest = "digest",
                    kind = "resync_event", drive_keys = {"main"}, input = {drive_key = "main", target = 0,
                        operator_id = operator, operator_identity = identity}})
            end)
            test.is_nil(err, tostring(err))
            local pending = assert(cf.pending(id))
            local component = cf.component_stub({sets = {}, access = {}}, {[id] = 15})
            local checks = 0
            component.validate_access = function(component_id, mask)
                checks = checks + 1
                test.eq(component_id, id)
                test.eq(mask, component.ACCESS.WRITE)
                return mask, nil
            end
            local frame = cf.actor_frame(operator)
            local live = {actor_key = execution_identity.actor_key, validate = execution_identity.validate,
                same_principal = execution_identity.same_principal, capture = function() return identity, nil end,
                authorize = function() error("the admitted caller uses the normal component access check") end}
            local shared: Map = {command_steps = {}, in_automation_tx = cf.in_tx,
                wake_dispatcher = function() return nil end,
                defer_command = function(_, failure) return {state = "pending", error = failure}, nil end,
                lower_pins = function()
                    local _, err = cf.in_tx(function(tx)
                        return true, command.record_receipt_tx(tx, id, pending.request_id, pending.generation,
                            pending.digest, "pin:main", {pin_generation = 9})
                    end)
                    return {main = {pin_generation = 9}}, err
                end}
            controls.attach({}, {component = component, command = command, drive = drive, security = frame,
                registry = {get = function() return {meta = {inputs = {}}}, nil end},
                execution_identity = live,
                failure_classification = {classify = function(err) return {kind = "permission_denied", message = tostring(err)} end}}, shared)
            local result, result_err = shared.command_steps.resync_event(pending)
            test.is_nil(result_err, tostring(result_err))
            test.eq(result.state, "succeeded", result.error and result.error.message)
            test.eq(checks, 2)
        end)
        test.it("keeps the saved credential boundary when the same operator returns with a different frame", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main", {source_kind = "event", source_thread_id = uuid.v7(), event_seq = 17})
            local saved = {version = 2, principal = {kind = "user", id = "operator"},
                authorized_by = {kind = "user", id = "operator"}, credential_id = "restricted",
                captured_at = "2026-10-01T00:00:00Z"}
            local _, reserve_err = cf.in_tx(function(tx)
                return command.reserve_tx(tx, {automation_id = id, request_id = "credential", digest = "digest",
                    kind = "resync_event", drive_keys = {"main"}, input = {drive_key = "main", target = 0,
                        operator_id = "operator", operator_identity = saved}})
            end)
            test.is_nil(reserve_err, tostring(reserve_err))
            local pins = 0
            local shared: Map = {command_steps = {}, in_automation_tx = cf.in_tx,
                wake_dispatcher = function() return nil end,
                defer_command = function() return {state = "pending"}, nil end,
                lower_pins = function()
                    pins = pins + 1
                    return nil, errors.new({kind = errors.UNAVAILABLE, message = "pin unavailable"})
                end}
            controls.attach({}, {command = command, drive = drive,
                component = cf.component_stub({sets = {}, access = {}}, {[id] = 15}),
                security = cf.actor_frame("operator"), failure_classification = {classify = function() return {} end},
                execution_identity = {validate = execution_identity.validate, actor_key = execution_identity.actor_key,
                    same_principal = execution_identity.same_principal,
                    capture = function() return {version = 2, principal = saved.principal,
                        authorized_by = saved.authorized_by, captured_at = saved.captured_at}, nil end}}, shared)
            local result, err = shared.command_steps.resync_event(assert(cf.pending(id)))
            test.is_nil(err, tostring(err))
            test.eq(result.state, "pending")
            test.eq(pins, 0)
            test.not_nil(cf.pending(id))
        end)
        for _, mode in ipairs({"missing", "revoked", "after_pin", "allowed"}) do
            test.it("retains command and cursor authority through " .. mode, function()
                local id = uuid.v7()
                cf.seed_drive(id, "main", {source_kind = "event", source_thread_id = uuid.v7(), event_seq = 17})
                local identity = {version = 2, principal = {kind = "user", id = "operator"},
                    authorized_by = {kind = "user", id = "operator"}, captured_at = "2026-10-01T00:00:00Z"}
                local _, reserve_err = cf.in_tx(function(tx)
                    return command.reserve_tx(tx, {automation_id = id, request_id = "resync", digest = "digest",
                        kind = "resync_event", drive_keys = {"main"}, input = {drive_key = "main", target = 0,
                            operator_id = "operator", operator_identity = mode ~= "missing" and identity or nil}})
                end)
                test.is_nil(reserve_err, tostring(reserve_err))
                local pending = assert(cf.pending(id))
                local checks, pins = 0, 0
                local shared: Map = {command_steps = {}, in_automation_tx = cf.in_tx,
                    wake_dispatcher = function() return nil end,
                    defer_command = function() return {state = "pending"}, nil end,
                    lower_pins = function()
                        pins = pins + 1
                        local _, err = cf.in_tx(function(tx)
                            return true, command.record_receipt_tx(tx, id, "resync", pending.generation,
                                pending.digest, "pin:main", {pin_generation = 9})
                        end)
                        return {main = {pin_generation = 9}}, err
                    end}
                local component = cf.component_stub({sets = {}, access = {}}, {[id] = 15})
                component.validate_principal_access = function(component_id, mask, principal, groups, filter)
                    checks = checks + 1
                    test.eq(component_id, id)
                    test.eq(mask, component.ACCESS.WRITE)
                    test.eq(principal.id, "operator")
                    test.eq(groups[1], "editors")
                    test.eq(filter.prefixes[1], "/shared")
                    return mode ~= "revoked" and (mode ~= "after_pin" or checks == 1), nil
                end
                controls.attach({}, {command = command, drive = drive, component = component, security = cf.actor_frame(nil),
                    failure_classification = {classify = function() return {kind = "permission_denied"} end},
                    execution_identity = {actor_key = execution_identity.actor_key, validate = execution_identity.validate,
                        authorize = function(saved, opts)
                            test.eq(saved.principal.id, "operator")
                            test.eq(opts.deferred_owner, "kickside.automation:command_dispatcher")
                            return {principal = saved.principal, meta = {security_groups = {"editors"},
                                access_filter = {prefixes = {"/shared"}}}}, nil
                        end}}, shared)
                local result, err = shared.command_steps.resync_event(pending)
                test.is_nil(err, tostring(err))
                local db = cf.open_db()
                local current = drive.get(db, id, "main")
                db:release()
                if mode == "allowed" then
                    test.eq(result.state, "succeeded")
                    test.eq(checks, 2)
                    test.eq(current.event_seq, 0)
                    test.is_nil(cf.pending(id))
                else
                    test.eq(result.state, "pending")
                    test.eq(current.event_seq, 17)
                    test.eq(current.delivery_revision, 1)
                    test.not_nil(cf.pending(id))
                    test.eq(pins, mode == "after_pin" and 1 or 0)
                end
            end)
        end
        test.it("stores the captured operator with immutable resync input", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main", {source_kind = "event", source_thread_id = uuid.v7()})
            local captured = {version = 2, principal = {kind = "user", id = "operator"},
                authorized_by = {kind = "user", id = "operator"}, captured_at = "2026-10-01T00:00:00Z",
                credential_id = "restricted"}
            local shared = {in_automation_tx = cf.in_tx, command_steps = {},
                execute_pending = function() return {state = "pending"}, nil end}
            local engine: Map = {}
            controls.attach(engine, {component = cf.component_stub({sets = {}, access = {}}, {[id] = 15}),
                security = cf.actor_frame("operator"), command = command, drive = drive,
                canonical_json = canonical, execution_identity = {capture = function() return captured, nil end}}, shared)
            local result, err = engine.control(id, {control = "resync", request_id = "capture",
                operator_identity = {principal = {id = "forged"}}})
            test.is_nil(err, tostring(err))
            test.eq(result.state, "pending")
            local pending = assert(cf.pending(id))
            test.eq(pending.input.operator_id, "operator")
            test.eq(pending.input.operator_identity.credential_id, "restricted")
        end)
    end)
end

return {run = test.run_cases(define_tests)}
