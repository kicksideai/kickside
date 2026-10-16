local sql = require("sql")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local test = require("test")
local ops = require("ops")
local placement_ops = require("placement_ops")

local function db()
    local d, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return d
end

local function create(d, actor_id, component_id)
    local tx, begin_err = d:begin()
    if begin_err then error(tostring(begin_err)) end
    local result, err = placement_ops.create_component(tx, d, {
        type = ops.COMMAND_TYPES.CREATE_COMPONENT,
        payload = { component_id = component_id or uuid.v7(), impl_id = "kickside.test:security", actor_id = actor_id },
    })
    local _, close_err
    if err then _, close_err = tx:rollback() else _, close_err = tx:commit() end
    if close_err then error(tostring(close_err)) end
    return result, err
end

local function component_count(d, id)
    local rows, err = d:query("SELECT COUNT(*) AS total FROM kickside_components WHERE component_id=$1", { id })
    if err then error(tostring(err)) end
    return tonumber(rows[1].total)
end

local function owner_of(d, id)
    local rows, err = d:query("SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'owner'",
        { id })
    if err then error(tostring(err)) end
    return rows[1] and rows[1].value or nil
end

local function identity_hash_of(d, id)
    local rows, err = d:query("SELECT identity_hash FROM kickside_components WHERE component_id = $1", { id })
    if err then error(tostring(err)) end
    return rows[1] and rows[1].identity_hash or nil
end

local run_cases = test.run_cases(function()
    test.describe("component owner id format", function()
        test.it("refuses a colon creator id with typed INVALID", function()
            local d = db()
            local id = uuid.v7()
            test.eq(component_count(d, id), 0)
            -- A separate valid request commits between the count and this refusal.
            local unrelated, unrelated_err = create(d, "interleaving-" .. uuid.v7())
            test.is_nil(unrelated_err, tostring(unrelated_err))
            test.not_nil(unrelated)
            local result, err = create(d, "user:abc", id)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.is(err, errors.INVALID), true)
            test.eq(component_count(d, id), 0)
            d:release()
        end)

        test.it("refuses a whitespace creator id with typed INVALID", function()
            local d = db()
            local id = uuid.v7()
            test.eq(component_count(d, id), 0)
            -- A separate valid request commits between the count and this refusal.
            local unrelated, unrelated_err = create(d, "interleaving-" .. uuid.v7())
            test.is_nil(unrelated_err, tostring(unrelated_err))
            test.not_nil(unrelated)
            local result, err = create(d, "bob smith", id)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.is(err, errors.INVALID), true)
            test.eq(component_count(d, id), 0)
            d:release()
        end)

        test.it("accepts a canonical creator with v2 identity", function()
            local d = db()
            local creator = "creator-" .. uuid.v7()
            local result, err = create(d, creator)
            test.is_nil(err)
            test.not_nil(result)
            test.eq(owner_of(d, result.component_id), creator)
            test.not_nil(identity_hash_of(d, result.component_id))
            d:release()
        end)

        test.it("accepts a framework maintenance creator without identity init", function()
            local d = db()
            local result, err = create(d, "system:automation")
            test.is_nil(err)
            test.not_nil(result)
            test.eq(owner_of(d, result.component_id), "system:automation")
            test.is_nil(identity_hash_of(d, result.component_id))
            d:release()
        end)

        test.it("refuses a framework maintenance creator whose frame denies maintenance ownership", function()
            local d = db()
            local id = uuid.v7()
            local policy, policy_err = security.policy("app.component_suites.persist:maintenance_owner_denied")
            test.is_nil(policy_err)
            local bounded = (security.scope() :: any):with(policy)
            local executor, executor_err = funcs.new():with_scope(bounded)
            test.is_nil(executor_err)
            local answer, call_err = executor:call("app.component_suites.persist:maintenance_create_probe", id)
            test.is_nil(call_err)
            test.eq(answer.created, false)
            test.eq(answer.kind, errors.PERMISSION_DENIED, tostring(answer.message))
            test.eq(component_count(d, id), 0)
            d:release()
        end)
    end)
end)

return { run = function(options) return run_cases(options) end }
