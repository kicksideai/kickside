local test = require("test")
local security = require("security")
local contract = require("contract")
local uuid = require("uuid")
local sql = require("sql")
local function define_tests()
    test.describe("Component runtime metadata authority", function()
        local function open(actor_id, policies)
            local actor = security.new_actor(actor_id, { security_groups = {} })
            test.not_nil(actor, "runtime actor does not exist")
            local compiled = {}
            for _, id in ipairs(policies) do
                local policy, err = security.policy(id)
                test.is_nil(err, tostring(err))
                compiled[#compiled + 1] = policy
            end
            local def, err = contract.get("kickside.component:component_service")
            test.is_nil(err, tostring(err))
            local svc, open_err = def:with_actor(actor):with_scope(security.new_scope(compiled)):open()
            test.is_nil(open_err, tostring(open_err))
            return svc
        end
        local function stored(id, key)
            local db, err = sql.get("app:db")
            test.is_nil(err, tostring(err))
            db = assert(db)
            local rows, read_err = db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key=$2", { id, key or "health_state" })
            test.is_nil(read_err, tostring(read_err))
            db:release()
            return rows[1] and rows[1].value or nil
        end
        test.it("allows a service without a user ID to write only a target covered by its stored metadata grant", function()
            local owner = open("runtime-meta-owner-" .. uuid.v4(), { "app:test_scope_policy" })
            local target, create_err = owner:register({ impl_id = "kickside.test:runtime_meta", meta = { class = "runtime_target" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(target.success)
            local other, other_err = owner:register({ impl_id = "kickside.test:other_runtime_meta", meta = { class = "runtime_other" } })
            test.is_nil(other_err, tostring(other_err))
            test.is_true(other.success)
            local service = open("", { "app:runtime_meta_support", "app:runtime_meta_grant" })
            local updated, update_err = service:set_meta({ component_id = target.component_id,
                trusted_runtime = true, fields = { health_state = "ready" } })
            test.is_nil(update_err, tostring(update_err))
            test.is_true(updated.success, tostring(updated.error))
            test.not_nil(stored(target.component_id))
            local denied, denial_err = service:set_meta({ component_id = other.component_id,
                trusted_runtime = true, fields = { class = "runtime_target", health_state = "ready" } })
            test.is_nil(denial_err, tostring(denial_err))
            test.is_false(denied.success)
            test.eq(denied.kind, errors.PERMISSION_DENIED)
            test.is_nil(stored(other.component_id))
            local ordinary = service:set_meta({ component_id = target.component_id, fields = { health_state = "error" } })
            test.is_false(ordinary.success)
            test.eq(ordinary.kind, errors.PERMISSION_DENIED)
        end)
        test.it("reserves the owner key on registration and metadata updates", function()
            local actor_id = "runtime-meta-owner-" .. uuid.v4()
            local owner = open(actor_id, {"app:test_scope_policy"})
            local function refused(response, err)
                test.is_nil(err, tostring(err))
                test.is_false(response.success)
                test.eq(response.kind, errors.INVALID)
                test.eq(response.details.code, "component_meta_owner_required")
            end

            local new_id = uuid.v4()
            refused(owner:register({component_id = new_id, impl_id = "kickside.test:runtime_meta",
                meta = {owner = "replacement"}}))
            test.is_nil(stored(new_id, "owner"))

            local target = assert(owner:register({impl_id = "kickside.test:runtime_meta",
                meta = {class = "runtime_target", health_state = "ready"}}))
            test.is_true(target.success, tostring(target.error))
            local id = target.component_id
            refused(owner:set_meta({component_id = id, fields = {owner = "replacement", health_state = "error"}}))
            refused(owner:update({component_id = id, commands = {{type = "SET_META",
                payload = {fields = {}, delete_keys = {"owner"}}}}}))
            local service = open("", {"app:runtime_meta_support", "app:runtime_meta_grant"})
            refused(service:set_meta({component_id = id, trusted_runtime = true, fields = {OWNER = "replacement"}}))
            test.eq(stored(id, "owner"), actor_id)
            test.is_nil(stored(id, "OWNER"))
            test.eq(stored(id), "ready")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
