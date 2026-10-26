-- An OAuth component may outlive its owned credentials after a prior cleanup
-- completes the child delete but cannot finish unregistering the component. The
-- normal, access-gated component delete must release that orphan without
-- treating every cleanup error as successful.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local errors = require("errors")
local security = require("security")
local contract = require("contract")
local jobs = require("jobs")
local oauth_repo = require("oauth_repo")
local refresh_schedule = require("refresh_schedule")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local OAUTH_IMPL = "kickside.oauth:oauth_connection"

local function execute(statement: string, params: { any })
    local db, open_err = sql.get(DB)
    if open_err or not db then error("database open failed: " .. tostring(open_err)) end
    local _, write_err = db:execute(statement, params)
    db:release()
    if write_err then error("database write failed: " .. tostring(write_err)) end
end

local function component_exists(component_id: string): boolean
    local db, open_err = sql.get(DB)
    if open_err or not db then error("database open failed: " .. tostring(open_err)) end
    local rows, read_err = db:query("SELECT component_id FROM kickside_components WHERE component_id=$1", { component_id })
    db:release()
    if read_err then error("component read failed: " .. tostring(read_err)) end
    return #rows == 1
end

local function oauth_exists(component_id: string): boolean
    local db, open_err = sql.get(DB)
    if open_err or not db then error("database open failed: " .. tostring(open_err)) end
    local rows, read_err = db:query("SELECT component_id FROM kickside_oauth_connections WHERE component_id=$1", { component_id })
    db:release()
    if read_err then error("OAuth read failed: " .. tostring(read_err)) end
    return #rows == 1
end

local function service(user_id: string): any
    local policy, policy_err = security.policy("app:user")
    if policy_err or not policy then error("policy unavailable: " .. tostring(policy_err)) end
    local actor, actor_err = security.new_actor(user_id, {})
    if actor_err or not actor then error("actor unavailable: " .. tostring(actor_err)) end
    local definition, definition_err = contract.get(COMPONENT_SERVICE)
    if definition_err or not definition then error("component service unavailable: " .. tostring(definition_err)) end
    local instance, open_err = definition:with_actor(actor):with_scope(security.new_scope({ policy })):open()
    if open_err or not instance then error("component service open failed: " .. tostring(open_err)) end
    return instance
end

local function create_connection(owner_id: string): string
    local component_id = uuid.v7()
    local _, create_err = oauth_repo.create_connection(component_id, {
        provider = "orphan-cleanup-test",
        connection_name = "orphan cleanup test",
        connection_state = "connected",
        tokens = { access_token = "orphan-cleanup-test-token" },
    })
    if create_err then error("OAuth fixture create failed: " .. tostring(create_err)) end

    execute("INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
        { component_id, OAUTH_IMPL, json.encode({ component_id = component_id }) })
    execute("INSERT INTO kickside_component_access (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES ($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)",
        { uuid.v7(), owner_id, component_id, component_id })
    return component_id
end

local function cleanup(component_id: string)
    execute("DELETE FROM kickside_component_access WHERE component_id=$1", { component_id })
    execute("DELETE FROM kickside_component_meta WHERE component_id=$1", { component_id })
    execute("DELETE FROM kickside_components WHERE component_id=$1", { component_id })
    execute("DELETE FROM kickside_oauth_connections WHERE component_id=$1", { component_id })
end

local function define_tests()
    test.describe("OAuth orphaned child cleanup", function()
        local owner_id = "oauth-orphan-owner-" .. uuid.v7()
        local owned: { string } = {}

        test.after_each(function()
            for _, component_id in ipairs(owned) do cleanup(component_id) end
            owned = {}
        end)

        test.it("unregisters a real OAuth component when its owned OAuth row is already gone", function()
            local component_id = create_connection(owner_id)
            owned[#owned + 1] = component_id

            local removed, remove_err = oauth_repo.delete_connection(component_id)
            test.is_nil(remove_err, tostring(remove_err))
            test.is_true(removed.success)

            local refused, refused_err = service("oauth-orphan-outsider-" .. uuid.v7()):delete({ component_id = component_id })
            test.is_nil(refused_err, tostring(refused_err))
            test.is_false(refused.success, "an unrelated actor must not turn an orphaned child into a deletion grant")
            test.is_true(component_exists(component_id))

            local deleted, delete_err = service(owner_id):delete({ component_id = component_id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.success, tostring(deleted.error))
            test.is_true(deleted.deleted)
            test.is_false(component_exists(component_id))
        end)

        test.it("does not normalize a non-not-found cleanup failure", function()
            local component_id = create_connection(owner_id)
            owned[#owned + 1] = component_id

            execute("ALTER TABLE kickside_oauth_connections RENAME TO oauth_orphan_cleanup_hidden", {})
            local ok, failed, delete_err = pcall(function()
                return service(owner_id):delete({ component_id = component_id })
            end)
            execute("ALTER TABLE oauth_orphan_cleanup_hidden RENAME TO kickside_oauth_connections", {})

            test.is_true(ok, tostring(failed))
            test.is_nil(delete_err, tostring(delete_err))
            test.is_false(failed.success)
            test.contains(tostring(failed.error), "Component deletable cleanup failed")
            test.is_true(component_exists(component_id))
        end)

        test.it("does not classify a scheduler not-found as a missing OAuth row", function()
            local component_id = create_connection(owner_id)
            owned[#owned + 1] = component_id
            local enqueue = jobs.enqueue
            jobs.enqueue = function()
                return nil, errors.new({ kind = errors.NOT_FOUND, message = "injected scheduler miss" })
            end
            local ok, failed = pcall(function()
                return refresh_schedule.cancel_for_component(component_id)
            end)
            jobs.enqueue = enqueue

            test.is_true(ok, tostring(failed))
            test.is_false(failed.success)
            test.is_false(failed.missing)
            test.is_true(component_exists(component_id))
            test.is_true(oauth_exists(component_id))
        end)

        test.it("does not suppress a scheduler not-found after the OAuth row is absent", function()
            local component_id = create_connection(owner_id)
            owned[#owned + 1] = component_id
            local removed, remove_err = oauth_repo.delete_connection(component_id)
            test.is_nil(remove_err, tostring(remove_err))
            test.is_true(removed.success)

            local enqueue = jobs.enqueue
            jobs.enqueue = function()
                return nil, errors.new({ kind = errors.NOT_FOUND, message = "injected scheduler miss" })
            end
            local ok, failed = pcall(function()
                return refresh_schedule.cancel_for_component(component_id)
            end)
            jobs.enqueue = enqueue

            test.is_true(ok, tostring(failed))
            test.is_false(failed.success)
            test.is_false(failed.missing)
            test.is_true(component_exists(component_id))
            test.is_false(oauth_exists(component_id))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
