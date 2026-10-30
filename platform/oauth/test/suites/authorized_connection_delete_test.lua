local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local connection_manager = require("connection_manager")
local teardown = require("teardown")
local interleave = require("interleave")
local delete_binding = require("delete_binding")

local function seed(): string
    local component_id, create_err = connection_manager.register_authorized_connection({
        provider_name = "authorized-delete-test",
        connection_name = "Authorized connection",
        oauth_connection = {
            access_token = "authorized-connection-access", scopes_granted = "",
            connection_state = "connected", token_type = "Bearer",
        },
        user_context = {},
    })
    if create_err or not component_id then error(tostring(create_err)) end
    local meta_err = connection_manager.set_public_meta(component_id, { icon = "tabler:question-mark" })
    if meta_err then error(tostring(meta_err)) end
    return component_id
end

local function rows(statement: string, component_id: string): { any }
    local db, open_err = sql.get("app:db")
    if open_err or not db then error(tostring(open_err)) end
    local result, read_err = db:query(statement, { component_id })
    db:release()
    if read_err then error(tostring(read_err)) end
    return result
end

local function define_tests()
    test.describe("Authorized OAuth connection deletion", function()
        test.it("deletes registered connections without token expiry through their component deletable", function()
            local actor = assert(security.new_actor("authorized-delete-" .. uuid.v7(), {}))
            local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
            local caller = funcs.new():with_actor(actor):with_scope(scope)
            local definition = assert(contract.get("kickside.component:component_service"))
            local service = assert(definition:with_actor(actor):with_scope(scope):open())
            local connections: { string } = {}
            for _ = 1, 12 do
                local component_id, create_err = caller:call("app:authorized_connection_seed", {})
                test.is_nil(create_err, tostring(create_err))
                connections[#connections + 1] = component_id
            end
            for _, component_id in ipairs(connections) do
                local stored = rows("SELECT component_id,schedule_id,expires_at FROM kickside_oauth_connections WHERE component_id=$1", component_id)
                test.eq(#stored, 1, "registration persists the OAuth row under its component ID")
                test.is_nil(stored[1].expires_at)
                test.not_nil(stored[1].schedule_id)
                local deleted, delete_err = service:delete({ component_id = component_id })
                local remaining = rows("SELECT component_id FROM kickside_oauth_connections WHERE component_id=$1", component_id)
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true(deleted.success, tostring(deleted.error))
                test.is_true(deleted.deleted)
                test.eq(#remaining, 0)
                test.eq(#rows("SELECT component_id FROM kickside_components WHERE component_id=$1", component_id), 0)
            end
        end)
        test.it("keeps retention from deleting a connection while its original deletable runs", function()
            local actor = assert(security.new_actor("authorized-delete-" .. uuid.v7(), {}))
            local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
            local component_id, create_err = funcs.new():with_actor(actor):with_scope(scope):call("app:authorized_connection_seed", {})
            test.is_nil(create_err, tostring(create_err))
            local started, step, start_err = teardown.begin_delete(component_id, actor:id(), nil)
            test.is_true(started, tostring(step) .. ": " .. tostring(start_err))
            interleave.configure(component_id)
            local deleted = delete_binding.handle({})
            test.is_true(deleted.success, tostring(deleted.error) .. "; retention deletes=" .. tostring(interleave.removed))
            test.eq(interleave.removed, 0, "an active component delete is not a pending retention continuation")
        end)
    end)
end

return { seed = seed, run = test.run_cases(define_tests) }
