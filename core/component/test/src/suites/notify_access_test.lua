local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local component = require("component")
local component_types = require("component_types")
local security = require("security")
local funcs = require("funcs")
local meta_service = require("meta_service")

local DB = "app:db"

local function define_tests()
    test.describe("component.notify_access", function()
        local suffix = uuid.v4():sub(1, 8)
        local component_id = uuid.v7()
        local owner = "owner-" .. suffix
        local reader = "reader-" .. suffix
        local write_only = "writer-" .. suffix
        local group = "app.security:notify-" .. suffix
        local gmember1 = "gmember1-" .. suffix
        local gmember2 = "gmember2-" .. suffix

        local function db()
            local d, err = sql.get(DB)
            if err then error("db connect failed: " .. tostring(err)) end
            return d
        end

        local function cleanup()
            local d = db()
            d:execute("DROP TABLE IF EXISTS kickside_component_notify_calls")
            d:execute("DROP TABLE IF EXISTS kickside_component_notify_access_realtime_events")
            d:execute("DROP TABLE IF EXISTS kickside_component_notify_group_members")
            sql.builder.delete(component_types.TABLES.ACCESS):where("component_id = ?", component_id):run_with(d):exec()
            sql.builder.delete(component_types.TABLES.META):where("component_id = ?", component_id):run_with(d):exec()
            sql.builder.delete(component_types.TABLES.COMPONENTS):where("component_id = ?", component_id):run_with(d):exec()
            d:release()
        end

        local function insert_grant(d: any, subject_id: string, subject_type: string, mask: integer)
            local _, err = sql.builder.insert(component_types.TABLES.ACCESS)
                :set_map({
                    access_id = uuid.v7(),
                    component_id = component_id,
                    source_component_id = component_id,
                    subject_id = subject_id,
                    subject_type = subject_type,
                    access_mask = mask,
                    created_at = 0,
                })
                :run_with(d):exec()
            if err then error("grant insert failed: " .. tostring(err)) end
        end

        local function seed()
            cleanup()
            local d = db()
            local _, table_err = d:execute([[
                CREATE TABLE kickside_component_notify_access_realtime_events (
                    user_id TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    event TEXT NOT NULL,
                    data TEXT NOT NULL,
                    authorized TEXT NOT NULL
                )
            ]])
            if table_err then error("event table create failed: " .. tostring(table_err)) end
            local _, members_table_err = d:execute([[
                CREATE TABLE kickside_component_notify_group_members (
                    group_id TEXT NOT NULL,
                    user_id TEXT NOT NULL
                )
            ]])
            if members_table_err then error("group members table create failed: " .. tostring(members_table_err)) end
            local _, err = sql.builder.insert(component_types.TABLES.COMPONENTS)
                :set_map({
                    component_id = component_id,
                    impl_id = "kickside.test:notify",
                    private_context = "{}",
                    created_at = 0,
                    updated_at = 0,
                })
                :run_with(d):exec()
            if err then error("component insert failed: " .. tostring(err)) end

            insert_grant(d, owner, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.FULL)
            insert_grant(d, reader, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            insert_grant(d, write_only, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.WRITE)
            insert_grant(d, group, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            for _, member in ipairs({ gmember1, gmember2 }) do
                local _, m_err = sql.builder.insert("kickside_component_notify_group_members")
                    :set_map({ group_id = group, user_id = member })
                    :run_with(d):exec()
                if m_err then error("group member insert failed: " .. tostring(m_err)) end
            end
            d:release()
        end

        local function sent_events(): { any }
            local d = db()
            local rows, err = d:query("SELECT user_id, topic, event, data FROM kickside_component_notify_access_realtime_events ORDER BY user_id")
            d:release()
            if err then error("event query failed: " .. tostring(err)) end
            return rows or {}
        end

        -- Parameterized helpers for isolated per-test components.
        local function insert_component_cid(d: any, cid: string)
            local _, err = sql.builder.insert(component_types.TABLES.COMPONENTS)
                :set_map({ component_id = cid, impl_id = "kickside.test:notify", private_context = "{}", created_at = 0, updated_at = 0 })
                :run_with(d):exec()
            if err then error("component insert failed: " .. tostring(err)) end
        end

        local function insert_grant_cid(d: any, cid: string, subject_id: string, subject_type: string, mask: integer)
            local _, err = sql.builder.insert(component_types.TABLES.ACCESS)
                :set_map({ access_id = uuid.v7(), component_id = cid, source_component_id = cid, subject_id = subject_id, subject_type = subject_type, access_mask = mask, created_at = 0 })
                :run_with(d):exec()
            if err then error("grant insert failed: " .. tostring(err)) end
        end

        local function insert_member(d: any, group_id: string, user_id: string)
            local _, err = sql.builder.insert("kickside_component_notify_group_members")
                :set_map({ group_id = group_id, user_id = user_id }):run_with(d):exec()
            if err then error("member insert failed: " .. tostring(err)) end
        end

        local function clear_events(d: any)
            d:execute("DELETE FROM kickside_component_notify_access_realtime_events")
        end

        local function sent_for(cid: string): { any }
            local d = db()
            local rows, err = d:query("SELECT user_id, topic FROM kickside_component_notify_access_realtime_events WHERE topic = $1 ORDER BY user_id", { "component." .. cid })
            d:release()
            if err then error("sent_for query failed: " .. tostring(err)) end
            return rows or {}
        end

        local function drop_component(cid: string, group_id: string?)
            local d = db()
            sql.builder.delete(component_types.TABLES.ACCESS):where("component_id = ?", cid):run_with(d):exec()
            sql.builder.delete(component_types.TABLES.COMPONENTS):where("component_id = ?", cid):run_with(d):exec()
            if group_id then d:execute("DELETE FROM kickside_component_notify_group_members WHERE group_id = $1", { group_id }) end
            d:release()
        end

        test.it("batches a large shared audience through bounded realtime calls", function()
            local cid, grp = uuid.v7(), "group-" .. uuid.v4()
            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            for i = 1, 513 do insert_member(d, grp, "large-member-" .. tostring(i)) end
            d:execute("DELETE FROM kickside_component_notify_calls")
            d:release()
            local result, err = component.notify_access(cid, nil, { event = "large" })
            test.is_nil(err, tostring(err))
            test.eq(result.notified, 513)
            d = db()
            local rows, count_err = d:query("SELECT COUNT(*) AS n FROM kickside_component_notify_calls")
            d:release()
            test.is_nil(count_err)
            test.eq(tonumber(rows[1].n), 5)
            test.eq(#sent_for(cid), 513)
            drop_component(cid, grp)
            seed()
        end)

        test.it("returns a native failure when live membership cannot be read", function()
            local d = db()
            d:execute("DROP TABLE kickside_component_notify_group_members")
            d:release()
            local result, err = component.notify_access(component_id, nil, { event = "failure" })
            seed()
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "test_members_unavailable")
            test.eq(err:retryable(), true)
        end)

        test.it("classifies notification lookup infrastructure failures as unavailable", function()
            for _, absent in ipairs({ "kickside.contract:group_members", "kickside.contract:realtime_batch" }) do
                local service = meta_service.new({ contract = { get = function(id)
                    if id == absent then return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                        message = "owner unavailable", details = { code = "test_owner_unavailable" } }) end
                    return { open = function() return { members = function() return { user_ids = {} } end } end }
                end }, ops = { reaching_grants = function() return {
                    { subject_type = "group", subject_id = "group", access_mask = 1 },
                    { subject_type = "user", subject_id = "reader", access_mask = 1 }
                } end } })
                local result, err = service.fanout("component")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:retryable(), true)
            end
        end)

        test.it("returns a native failure when realtime refuses delivery", function()
            local result, err = component.notify_access(component_id, nil, { fail_realtime = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:details().code, "test_realtime_unavailable")
            test.eq(err:retryable(), true)
        end)

        test.it("fails honestly when membership or realtime cannot be opened", function()
            for _, failing in ipairs({ "kickside.contract:group_members", "kickside.contract:realtime_batch" }) do
                for _, boundary in ipairs({ "get", "open" }) do
                    local injected = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                        message = "owner unavailable", details = { code = "test_owner_unavailable" } })
                    local service = meta_service.new({ contract = { get = function(id)
                        if id == failing then
                            if boundary == "get" then return nil, injected end
                            return { open = function() return nil, injected end }, nil
                        end
                        return { open = function() return { members = function() return { user_ids = {} }, nil end } end }, nil
                    end }, ops = { reaching_grants = function() return {
                        { subject_type = "group", subject_id = "group", access_mask = 1 },
                        { subject_type = "user", subject_id = "reader", access_mask = 1 }
                    }, nil end } })
                    local result, err = service.fanout("component")
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.UNAVAILABLE))
                    test.eq(err:details().code, "test_owner_unavailable")
                    test.eq(err:retryable(), true)
                end
            end
        end)

        test.it("reports not_supported for an unbound optional realtime capability", function()
            for _, boundary in ipairs({ "get", "open" }) do
                for _, absent in ipairs({ "missing", "not_found" }) do
                    local missing = absent == "not_found" and errors.new({kind = errors.NOT_FOUND,
                        retryable = false, message = "no owner", details = {code = "test_owner_absent"}}) or nil
                    local service = meta_service.new({contract = {get = function(id)
                        if id == "kickside.contract:realtime_batch" then
                            if boundary == "get" then return nil, missing end
                            return {open = function() return nil, missing end}, nil
                        end
                        return {open = function() return {members = function() return {user_ids = {}}, nil end} end}, nil
                    end}, ops = {reaching_grants = function() return {
                        {subject_type = "user", subject_id = "reader", access_mask = 1}
                    }, nil end}})
                    local result, err = service.fanout("component")
                    test.is_nil(err, tostring(err))
                    test.eq(result.status, "not_supported")
                    test.eq(result.notified, 0)
                    test.eq(result.topic, "component.component")
                end
            end
        end)

        test.it("retains the not_supported outcome from a bound dispatch capability", function()
            local service = meta_service.new({contract = {get = function()
                return {open = function() return {notify = function()
                    return {success = true, notified = 0, status = "not_supported"}, nil
                end} end}, nil
            end}, ops = {reaching_grants = function() return {
                {subject_type = "user", subject_id = "reader", access_mask = 1}
            }, nil end}})
            local result, err = service.fanout("component")
            test.is_nil(err)
            test.eq(result.status, "not_supported")
            test.eq(result.notified, 0)
        end)

        test.before_all(seed)
        test.after_all(function() cleanup() end)

        test.it("fans out to direct user grants and group members, excluding under-privileged and agent subjects", function()
            local result, err = component.notify_access(component_id, nil, {
                event = "component.meta.changed",
                meta = { enabled = true },
            }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.success, true)
            -- owner + reader (direct READ+ users) + the two members of the FULL group;
            -- the WRITE-only user lacks READ and is excluded.
            test.eq(result.notified, 4)
            test.eq(result.topic, "component." .. component_id)

            local sent = sent_events()
            test.eq(#sent, 4)
            local users: { [string]: boolean } = {}
            for _, row in ipairs(sent) do users[row.user_id] = true end
            test.is_true(users[owner])
            test.is_true(users[reader])
            test.is_true(users[gmember1])
            test.is_true(users[gmember2])
            test.is_nil(users[write_only])
            -- The group subject id itself is never a recipient -- only its members.
            test.is_nil(users[group])
            test.eq(sent[1].topic, "component." .. component_id)
            test.eq(sent[1].event, "component.meta.changed")
        end)

        test.it("resolves recipients live: a revoked grant and a membership change reach the next notification", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local u_a = "ua-" .. sfx
            local grp = "app.security:live-" .. sfx
            local m_a = "ma-" .. sfx
            local m_b = "mb-" .. sfx

            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, u_a, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            insert_grant_cid(d, cid, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            insert_member(d, grp, m_a)
            clear_events(d)
            d:release()

            local r1, e1 = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e1)
            test.eq(r1.notified, 2)

            -- Revoke the user and swap the member between two events.
            local dm = db()
            sql.builder.delete(component_types.TABLES.ACCESS)
                :where("component_id = ?", cid):where("subject_id = ?", u_a):run_with(dm):exec()
            dm:execute("DELETE FROM kickside_component_notify_group_members WHERE group_id = $1", { grp })
            insert_member(dm, grp, m_b)
            clear_events(dm)
            dm:release()

            local r2, e2 = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e2)
            test.eq(r2.notified, 1)
            local got: { [string]: boolean } = {}
            for _, row in ipairs(sent_for(cid)) do got[row.user_id] = true end
            test.is_nil(got[u_a])
            test.is_nil(got[m_a])
            test.is_true(got[m_b])

            drop_component(cid, grp)
        end)

        test.it("expands a group granted on several components from its current membership", function()
            local sfx = uuid.v4():sub(1, 8)
            local grp = "app.security:shared-" .. sfx
            local m1 = "m1-" .. sfx
            local m2 = "m2-" .. sfx
            local cidA = uuid.v7()
            local cidB = uuid.v7()

            local d = db()
            insert_component_cid(d, cidA)
            insert_component_cid(d, cidB)
            insert_grant_cid(d, cidA, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            insert_grant_cid(d, cidB, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            insert_member(d, grp, m1)
            clear_events(d)
            d:release()

            local rA, eA = component.notify_access(cidA, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(eA)
            test.eq(rA.notified, 1)

            local dm = db()
            dm:execute("DELETE FROM kickside_component_notify_group_members WHERE group_id = $1", { grp })
            insert_member(dm, grp, m2)
            clear_events(dm)
            dm:release()

            local rB, eB = component.notify_access(cidB, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(eB)
            test.eq(rB.notified, 1)
            local got: { [string]: boolean } = {}
            for _, row in ipairs(sent_for(cidB)) do got[row.user_id] = true end
            test.is_nil(got[m1])
            test.is_true(got[m2])

            drop_component(cidA, nil)
            drop_component(cidB, grp)
        end)

        test.it("excludes a group granted below the required access", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local grp = "app.security:wo-" .. sfx
            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.WRITE)
            insert_member(d, grp, "m-" .. sfx)
            clear_events(d)
            d:release()

            local r, e = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e)
            test.eq(r.notified, 0)
            test.eq(#sent_for(cid), 0)
            drop_component(cid, grp)
        end)

        test.it("a user's direct and group grants combine toward the required access", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local grp = "app.security:union-" .. sfx
            local u = "u-" .. sfx
            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, u, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            insert_grant_cid(d, cid, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.WRITE)
            insert_member(d, grp, u)
            clear_events(d)
            d:release()

            local rw, rw_err = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ_WRITE })
            test.is_nil(rw_err)
            test.eq(rw.notified, 1)
            local got: { [string]: boolean } = {}
            for _, row in ipairs(sent_for(cid)) do got[row.user_id] = true end
            test.is_true(got[u])

            local dc = db()
            clear_events(dc)
            dc:release()
            local del, del_err = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ_DELETE })
            test.is_nil(del_err)
            test.eq(del.notified, 0)
            test.eq(#sent_for(cid), 0)

            drop_component(cid, grp)
        end)

        test.it("never notifies service subjects", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local u = "u-" .. sfx
            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, u, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.FULL)
            insert_grant_cid(d, cid, "svc-" .. sfx, component_types.SUBJECT_TYPES.SERVICE, component_types.ACCESS.FULL)
            clear_events(d)
            d:release()

            local r, e = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e)
            test.eq(r.notified, 1)
            local got: { [string]: boolean } = {}
            for _, row in ipairs(sent_for(cid)) do got[row.user_id] = true end
            test.is_true(got[u])
            test.is_nil(got["svc-" .. sfx])
            drop_component(cid, nil)
        end)

        test.it("honors an explicit topic override", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, "u-" .. sfx, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            clear_events(d)
            d:release()

            local custom = "component." .. cid .. ".events"
            local r, e = component.notify_access(cid, custom, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e)
            test.eq(r.notified, 1)
            test.eq(r.topic, custom)
            drop_component(cid, nil)
        end)

        test.it("a new share reaches the very next notification", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local u1 = "u1-" .. sfx
            local u2 = "u2-" .. sfx

            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, u1, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            clear_events(d)
            d:release()

            local r1, e1 = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.is_nil(e1)
            test.eq(r1.notified, 1)

            local dg = db()
            insert_grant_cid(dg, cid, u2, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            clear_events(dg)
            dg:release()
            local r2 = component.notify_access(cid, nil, { event = "x" }, { access_mask = component_types.ACCESS.READ })
            test.eq(r2.notified, 2)
            local got: { [string]: boolean } = {}
            for _, row in ipairs(sent_for(cid)) do got[row.user_id] = true end
            test.is_true(got[u1])
            test.is_true(got[u2])

            drop_component(cid, nil)
        end)

        test.it("reaches the stored audience from a group principal without process or realtime authority", function()
            local sfx = uuid.v4():sub(1, 8)
            local cid = uuid.v7()
            local member = "gp-member-" .. sfx
            local reader_user = "gp-reader-" .. sfx
            local grp = "app.security:gp-" .. sfx

            local d = db()
            insert_component_cid(d, cid)
            insert_grant_cid(d, cid, reader_user, component_types.SUBJECT_TYPES.USER, component_types.ACCESS.READ)
            insert_grant_cid(d, cid, grp, component_types.SUBJECT_TYPES.GROUP, component_types.ACCESS.FULL)
            insert_member(d, grp, member)
            clear_events(d)
            d:release()

            local policy = assert(security.policy("app:notify_access_constrained"))
            local principal = security.new_actor("principal:group:" .. grp, {})
            local result, err = funcs.new():with_actor(principal):with_scope(security.new_scope({ policy }))
                :call("app:notify_access_probe", { component_id = cid, data = { event = "component.meta.changed" } })
            test.is_nil(err, tostring(err))
            test.eq(result and result.notified, 2)
            local dq = db()
            local rows = dq:query("SELECT user_id, authorized FROM kickside_component_notify_access_realtime_events WHERE topic = $1 ORDER BY user_id", { "component." .. cid })
            dq:release()
            test.eq(#rows, 2)
            for _, row in ipairs(rows) do
                test.eq(row.authorized, "yes", "delivery to " .. tostring(row.user_id) .. " was refused")
            end

            drop_component(cid, grp)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
