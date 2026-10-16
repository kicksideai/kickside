local test = require("test")
local component = require("component")
local sql = require("sql")
local time = require("time")
local M = {}
function M.run(invoke, fixture): any
    local service, service_err = component.get_service()
    test.is_nil(service_err)
    if not service then error(service_err) end
    local ids = {}
    local function create()
        local result, err = service:register({impl_id = "app:capacity_connection", meta = {class = "connection"}, private_context = {}})
        test.is_nil(err)
        test.is_true(result.success)
        ids[#ids + 1] = result.component_id
        return result.component_id
    end
    local function conn(id)
        return {component_id = id, mode = "credential", header = "Bearer test", token = "test", bot_token = "test", api_key = "test",
            base_url = "https://fixture.test", authorization = "Bearer test", deployment = "cloud",
            get_access_token = function() return {success = true, access_token = "test"}, nil end,
            get_info = function() return {component_id = id}, nil end}
    end
    fixture.calls = 0
    local shared, independent = create(), create()
    local began = time.now():unix_nano() // 1000000
    local first = invoke(conn(shared))
    test.is_false(first.success)
    test.eq(first.kind, errors.RATE_LIMITED)
    test.eq(first.details.scope, "capacity")
    test.ok(first.details.retry_at_ms >= began + 2000)
    test.eq(fixture.calls, 1, "connection capacity performs one outbound request without a local retry")
    local held = invoke(conn(shared))
    test.eq(held.kind, errors.RATE_LIMITED)
    test.eq(held.details.code, "connection_capacity_wait")
    test.eq(held.details.retry_at_ms, first.details.retry_at_ms)
    test.eq(fixture.calls, 1, "shared floor prevents another outbound request")
    local free = invoke(conn(independent))
    test.eq(free.kind, errors.RATE_LIMITED)
    test.eq(fixture.calls, 2, "independent connection reaches its outbound boundary")
    local db = assert(sql.get("app:db"))
    for _, id in ipairs(ids) do
        for _, name in ipairs({"kickside_component_access", "kickside_component_meta", "kickside_components"}) do
            test.is_nil(select(2, db:execute("DELETE FROM " .. name .. " WHERE component_id=$1", {id})))
        end
    end
    db:release()
    return true
end
return M
