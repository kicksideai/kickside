-- Audience-resolution, topic-fanout, and hub-delivery logic for thread updates.
-- The pure pieces (resolve_user_ids, build_topics) assert in isolation. Delivery
-- uses a constructed notifier transport so hub hits, misses, and delivery
-- counts are observable without live processes.

local test = require("test")
local notify = require("notify")
local consts = require("consts")

-- Stored thread attrs keyed by thread id, standing in for kickside_thread rows.
local function stored(attrs_by_thread: { [string]: any }): (string) -> (any?, error?)
    return function(thread_id: string): (any?, error?)
        return attrs_by_thread[thread_id], nil
    end
end

-- Construct a notifier with an isolated hub transport and stored attrs for each
-- delivery case.
local function hub_stub(present_hubs: { [string]: boolean }, attrs_by_thread: { [string]: any }): (any, { { pid: string, topic: string } })
    local sent: { { pid: string, topic: string } } = {}
    local instance = notify.new({
        load_attrs = stored(attrs_by_thread),
        lookup = function(name: string): (any?, error?)
            if present_hubs[name] then return "pid:" .. name, nil end
            return nil, nil
        end,
        send = function(pid: any, topic: string, _payload: any): (any?, error?)
            sent[#sent + 1] = { pid = pid, topic = topic }
            return true, nil
        end,
    })
    return instance, sent
end

local function define_tests()
    test.describe("thread notify audience resolution", function()
        test.it("resolves from stored owner alone", function()
            local resolved = notify.resolve_user_ids({ owner_principal = { kind = "user", id = "alice" } })
            test.eq(#resolved, 1)
            test.eq(resolved[1], "alice")
        end)

        test.it("does not invent a user recipient for a selected group principal", function()
            local ids = notify.resolve_user_ids({
                owner_principal = { kind = "group", id = "group-1" },
                audience_principals = { { kind = "group", id = "group-1" } },
                user_ids = {},
            })
            test.eq(#ids, 0)
        end)

        test.it("does not route to the acting principal", function()
            local resolved = notify.resolve_user_ids(nil)
            test.eq(#resolved, 0)
        end)

        test.it("routes a stored typed user audience independently of the publisher", function()
            local ids = notify.resolve_user_ids({
                owner_principal = { kind = "service", id = "framework" },
                audience_principals = { { kind = "user", id = "alice" },
                    { kind = "group", id = "operators" } },
            })
            test.eq(#ids, 1)
            test.eq(ids[1], "alice")
        end)

        test.it("resolves from stored attrs participants alone", function()
            local resolved = notify.resolve_user_ids({
                user_ids = { "u1" },
                members = { "u2" },
                access = { user_ids = { "u3" }, members = { "u4" } },
                audience = { members = { "u5" } },
            })
            test.eq(#resolved, 5)
            test.eq(resolved[1], "u1")
            test.eq(resolved[2], "u2")
            test.eq(resolved[3], "u3")
            test.eq(resolved[4], "u4")
            test.eq(resolved[5], "u5")
        end)

        test.it("merges stored owner and audience in first-seen order", function()
            local resolved = notify.resolve_user_ids({
                owner_principal = { kind = "user", id = "alice" },
                user_ids = { "bob", "dave" },
                access = { user_ids = { "eve" } },
                audience = { members = { "frank", "carol" } },
            })
            test.eq(#resolved, 6)
            test.eq(resolved[1], "alice")
            test.eq(resolved[2], "bob")
            test.eq(resolved[3], "dave")
            test.eq(resolved[4], "eve")
            test.eq(resolved[5], "frank")
            test.eq(resolved[6], "carol")
        end)

        test.it("dedupes the same owner and audience id", function()
            local resolved = notify.resolve_user_ids({ owner_principal = { kind = "user", id = "shared" }, user_ids = { "shared" } })
            test.eq(#resolved, 1)
            test.eq(resolved[1], "shared")
        end)

        test.it("decodes stored JSON-string attrs", function()
            local resolved = notify.resolve_user_ids('{"members":["m1"],"access":{"members":["m2"]}}')
            test.eq(#resolved, 2)
            test.eq(resolved[1], "m1")
            test.eq(resolved[2], "m2")
        end)

        test.it("filters blank and non-string ids", function()
            local mixed: { any } = { "  ", "x", 7, "x", true }
            local resolved = notify.resolve_user_ids({ user_ids = mixed })
            test.eq(#resolved, 1)
            test.eq(resolved[1], "x")
        end)
    end)

    test.describe("thread notify topic fanout", function()
        test.it("always includes default and overview topics", function()
            local topics = notify.build_topics("t1", nil, consts.PAYLOAD_TYPE.EVENT, nil)
            local has_default = false
            local has_overview = false
            for _, t in ipairs(topics) do
                if t == consts.DEFAULT_TOPIC then has_default = true end
                if t == consts.OVERVIEW_TOPIC then has_overview = true end
            end
            test.is_true(has_default)
            test.is_true(has_overview)
        end)

        test.it("builds the per-thread topic as PREFIX .. id", function()
            local topics = notify.build_topics("thread-123", consts.DEFAULT_TOPIC, consts.PAYLOAD_TYPE.EVENT, nil)
            local expected = consts.THREAD_TOPIC_PREFIX .. "thread-123"
            test.eq(#topics, 3)
            test.eq(topics[1], consts.DEFAULT_TOPIC)
            test.eq(topics[2], consts.OVERVIEW_TOPIC)
            test.eq(topics[3], expected)
        end)

        test.it("deduplicates when caller passes the per-thread topic explicitly", function()
            local per_thread = consts.THREAD_TOPIC_PREFIX .. "thread-123"
            local topics = notify.build_topics("thread-123", per_thread, consts.PAYLOAD_TYPE.EVENT, nil)
            test.eq(#topics, 3)
            test.eq(topics[1], per_thread)
            test.eq(topics[2], consts.DEFAULT_TOPIC)
            test.eq(topics[3], consts.OVERVIEW_TOPIC)
        end)

        test.it("fans a projection update onto its read-model topic and the overview", function()
            local topics = notify.build_topics("thread-9", nil, consts.PAYLOAD_TYPE.PROJECTION, "summary")
            local expected = notify.projection_topic("thread-9", "summary")
            test.eq(expected, consts.THREAD_TOPIC_PREFIX .. "thread-9" .. consts.PROJECTION_TOPIC_INFIX .. "summary")
            test.eq(#topics, 2)
            test.eq(topics[1], expected)
            test.eq(topics[2], consts.OVERVIEW_TOPIC)
        end)
    end)

    test.describe("thread notify emit validation", function()
        test.it("rejects a table payload with no thread_id", function()
            local result, err = notify.emit_thread_update({})
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects a blank thread_id", function()
            local result, err = notify.emit_thread_update({ thread_id = "   " })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects an unparseable JSON string payload", function()
            local result, err = notify.emit_thread_update("not json")
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("rejects a nil payload", function()
            local result, err = notify.emit_thread_update(nil)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)
    end)

    test.describe("thread notify hub delivery", function()
        test.it("counts every hub miss as a failed delivery attempt", function()
            local instance, sent = hub_stub({}, { ["thread-xyz"] = { user_ids = { "ghost" } } })
                local result, err = instance.emit_thread_update({ thread_id = "thread-xyz" })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.thread_id, "thread-xyz")
                test.eq(result.recipients, 1)
                test.eq(result.topic, consts.DEFAULT_TOPIC)
                test.eq(result.topic_count, 3)
                test.eq(result.delivered, 0)
                test.eq(result.failed, 3)
                test.eq(#sent, 0)
        end)

        test.it("delivers to a present hub across every topic", function()
            local instance, sent = hub_stub({ [consts.USER_HUB_PREFIX .. "alice"] = true }, { t1 = { user_ids = { "alice" } } })
                local result, err = instance.emit_thread_update({ thread_id = "t1" })
                test.is_nil(err)
                test.eq(result.recipients, 1)
                test.eq(result.delivered, 3)
                test.eq(result.failed, 0)
                test.eq(#sent, 3)
                test.eq(sent[1].pid, "pid:" .. consts.USER_HUB_PREFIX .. "alice")
        end)

        test.it("splits delivered/failed when only some hubs are present", function()
            local instance, sent = hub_stub({ [consts.USER_HUB_PREFIX .. "alice"] = true }, { t1 = { user_ids = { "alice", "ghost" } } })
                local result, err = instance.emit_thread_update({ thread_id = "t1" })
                test.is_nil(err)
                test.eq(result.recipients, 2)
                -- 3 topics x 1 present hub delivered, x 1 missing hub failed.
                test.eq(result.delivered, 3)
                test.eq(result.failed, 3)
                test.eq(#sent, 3)
        end)

        test.it("counts a hub whose name does not resolve as an absent recipient", function()
            local instance = notify.new({
                load_attrs = stored({ t1 = { user_ids = { "ghost" } } }),
                lookup = function(_name: string): (any?, error?)
                    return nil, (errors.new({ message = "no such name", kind = errors.NOT_FOUND }) :: error)
                end,
                send = function(_pid: any, _topic: string, _payload: any): (any?, error?)
                    error("send reached for an absent hub")
                end,
            })
            local result, err = instance.emit_thread_update({ thread_id = "t1" })
            test.is_nil(err)
            test.eq(result.delivered, 0)
            test.eq(result.failed, 3)
        end)

        test.it("returns a refused hub delivery instead of dropping it", function()
            local instance = notify.new({
                load_attrs = stored({ t1 = { user_ids = { "alice" } } }),
                lookup = function(name: string): (any?, error?) return "pid:" .. name, nil end,
                send = function(_pid: any, _topic: string, _payload: any): (any?, error?)
                    return nil, (errors.new({ message = "not allowed to send", kind = errors.PERMISSION_DENIED }) :: error)
                end,
            })
            local result, err = instance.emit_thread_update({ thread_id = "t1" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.PERMISSION_DENIED)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
