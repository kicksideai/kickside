local test = require("test")
local security = require("security")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local function scope(with_kind: boolean): any
    local policies = {assert(security.policy("event.read.test:binding_runtime")),
        assert(security.policy("event.read.test:binding_calls")),
        assert(security.policy("event.read.test:binding_config"))}
    if with_kind then policies[#policies + 1] = assert(security.policy("event.read.test:binding_kind")) end
    return assert(security.new_scope(policies))
end
local function invoke(args: table, with_kind: boolean): (any?, error?)
    local restricted = scope(with_kind)
    local actor = security.new_actor("system:event-read-narrow", {security_groups = {}})
    test.eq(restricted:evaluate(actor, "registry.get", "event.read.test:public_kind") == "allow", with_kind)
    test.is_false(restricted:evaluate(actor, "registry.get", "kickside.core:thread") == "allow")
    return funcs.new():with_actor(actor)
        :with_scope(restricted):call("event.read.test:narrow_bind", args)
end
local function clean(id: string)
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT event_read FROM kickside_thread WHERE id=$1", {id}))
    test.eq(#rows, 1); test.eq(rows[1].event_read, "")
    test.is_nil(select(2, db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})))
    db:release()
    -- Cleanup uses the component owner's trusted teardown boundary.
    local component = require("component_client")
    local _, err = component.system_delete(id)
    test.is_nil(err)
end
return {run = test.run_cases(function()
    test.describe("Thread binding in a narrow system scope", function()
        for _, required in ipairs({false, true}) do
            test.it("generic declarations resolve in the caller scope/" .. tostring(required), function()
                local value, err = invoke({operation = "level", impl_id = "kickside.core:thread", required = required}, false)
                test.is_nil(err); test.eq(next(value), nil)
            end)
        end
        test.it("registration needs only the kind registry.get already required by base placement", function()
            local id = uuid.v4()
            local value, err = invoke({operation = "register", id = id, impl_id = "event.read.test:public_kind", thread = true}, true)
            test.is_nil(err); test.is_true(value.success); test.eq(value.thread_id, id)
            clean(id)
        end)
        for _, mode in ipairs({"checked", "trusted_audit", "maintenance"}) do
            test.it("attaches an undeclared kind/" .. mode, function()
                local id = uuid.v4()
                local value, err = invoke({operation = "register", id = id, impl_id = "event.read.test:public_kind"}, true)
                test.is_nil(err); test.is_true(value.success)
                value, err = invoke({id = id, mode = mode, impl_id = "event.read.test:public_kind"}, true)
                test.is_nil(err); test.eq(value.thread.id, id); test.is_nil(value.thread.event_read)
                clean(id)
            end)
        end
        test.it("trusted audit with an omitted kind retains its base scope", function()
            local id = uuid.v4()
            local value, err = invoke({operation = "register", id = id, impl_id = "event.read.test:public_kind"}, true)
            test.is_nil(err); test.is_true(value.success)
            value, err = invoke({id = id, mode = "trusted_audit"}, false)
            test.is_nil(err); test.eq(value.thread.id, id)
            clean(id)
        end)
    end)
end)}
