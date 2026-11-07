local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")

local function define_tests()
    test.describe("channel sink real component WRITE boundary", function()
        local db: any
        local component_id = uuid.v4()
        local origin = uuid.v4()
        local owner = "channel-owner-" .. uuid.v4()
        local reader = "channel-reader-" .. uuid.v4()

        local function call_as(actor_id: string): any
            local actor = security.new_actor(actor_id, {})
            local scope = security.named_scope("wippy.security:process")
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:channel_sink_access_probe", {
                origin = origin,
                automation_ref = { kind = "automation", id = origin, revision = 1 },
                config = { connection_id = component_id, channel_id = "room-1" },
                input = { content = "hello" },
            })
            test.is_nil(err)
            return result.result, result.send_count
        end

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
            db = assert(db)
            local _, err = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, 'kickside.plugins.discord:discord_connection', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { component_id })
            test.is_nil(err)
            for _, grant in ipairs({ { owner, 2 }, { reader, 1 } }) do
                _, err = db:execute(
                    [[INSERT INTO kickside_component_access
                      (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                      VALUES ($1, 'user', $2, $3, $4, $5, CURRENT_TIMESTAMP)]],
                    { uuid.v4(), grant[1], component_id, component_id, grant[2] })
                test.is_nil(err)
            end
        end)

        test.after_all(function()
            if db then
                db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
                db:release()
            end
        end)

        test.it("rejects READ-only actor and sends under WRITE grant", function()
            local denied, denied_sends = call_as(reader)
            test.is_false(denied.success)
            test.eq(denied.error.code, "permission_denied")
            test.eq(denied_sends, 0)

            local sent, owner_sends = call_as(owner)
            test.is_true(sent.success)
            test.eq(sent.result, "created")
            test.eq(owner_sends, 1)

            local _, err = db:execute("DELETE FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                { component_id, owner })
            test.is_nil(err)
            local revoked, revoked_sends = call_as(owner)
            test.is_false(revoked.success)
            test.eq(revoked.error.code, "permission_denied")
            test.eq(revoked_sends, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
