-- append_inbound witness dedup: every witnessed inbound must carry a durable
-- external dedup identity so a provider redelivery (a retried paused / deleted-agent
-- message) is witnessed exactly once. A provider message id supplies it directly;
-- when the provider omits one, append_inbound derives a deterministic key from the
-- message's stable facts (provider, connection, channel, sender, content) so retries
-- of the same message collapse on the same threads dedup index.
local test = require("test")
local bridge = require("thread_bridge")
local threads = require("threads_capture_stub")

local THREAD = "thread-witness-1"
local ACTOR = { id = function(_self) return "installer-1" end }
local SCOPE = { id = "installer-1" }

local function inbound(overrides)
    local args = {
        provider = "discord",
        reply_component_id = "conn-1",
        reply_resource_id = "chan-1",
        channel_id = "chan-1",
        external_user_id = "ext-1",
        external_username = "external-user",
        external_display_name = "External User",
        text = "hello",
    }
    if type(overrides) == "table" then
        for k, v in pairs(overrides) do args[k] = v end
    end
    return args
end

local function append(over)
    return bridge.append_inbound(THREAD, inbound(over), { event_type = "kickside.channel.events:message.inbound" }, ACTOR, SCOPE)
end

local function define_tests()
    test.describe("thread_bridge append_inbound witness dedup", function()
        test.before_each(threads.reset)

        test.it("creates the conversation under the declared component kind", function()
            local _, _, err = bridge.ensure_thread(inbound(), { impl_id = "kickside.channel:channel_kind" }, ACTOR, SCOPE)
            test.is_nil(err)
            test.eq(threads.upserted[1].impl_id, "kickside.channel:channel_kind")
        end)

        test.it("sends output appends through its admitted publisher and surfaces refusal", function()
            local calls = {}
            local bound = bridge.with_publisher(function(method, args)
                calls[#calls + 1] = { method = method, args = args }
                return nil, errors.new({ message = "publication principal is revoked", kind = errors.PERMISSION_DENIED })
            end)
            local result, err = bound.append_inbound(THREAD, inbound(), {}, ACTOR, SCOPE)
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("publication principal is revoked", 1, true) ~= nil)
            test.eq(calls[1].method, "append_event")
            test.eq(#threads.appended, 0)
        end)

        test.it("stores a group audience as a typed principal without inventing a user", function()
            local id, _, err = bridge.ensure_thread(inbound(), {
                role = "channel", user_ids = {},
                owner_principal = { kind = "group", id = "group-1" },
                audience_principals = { { kind = "group", id = "group-1" } },
            }, ACTOR, SCOPE)
            test.is_nil(err)
            test.eq(id, "thread-typed-1")
            local attrs = threads.upserted[1].attrs
            test.eq(#attrs.user_ids, 0)
            test.eq(attrs.owner_principal.kind, "group")
            test.eq(attrs.audience_principals[1].id, "group-1")
        end)

        test.it("carries the provider message id as the external dedup identity", function()
            local res, err = append({ external_message_id = "msg-1" })
            test.is_nil(err)
            test.is_false((res or {}).duplicate == true)
            local rec = threads.appended[1]
            test.eq(rec.event.external.external_id, "msg-1")
            test.ok(rec.event.external.external_version ~= nil and rec.event.external.external_version ~= "",
                "external_version is a non-null sentinel")
        end)

        test.it("derives a deterministic external identity when the provider omits a message id", function()
            local _, err = append({ external_message_id = "" })
            test.is_nil(err)
            local ext = threads.appended[1].event.external
            test.not_nil(ext)
            test.ok(type(ext.external_id) == "string" and ext.external_id ~= "", "derived external_id is present")
            test.ok(ext.external_version ~= nil and ext.external_version ~= "", "external_version is a non-null sentinel")
        end)

        test.it("witnesses a keyless retried message exactly once (no double witness)", function()
            local first, e1 = append({ external_message_id = "" })
            test.is_nil(e1)
            test.is_false((first or {}).duplicate == true)

            -- The provider redelivers the identical message with no id: the second
            -- witness must collapse on the same derived key, not double-write.
            local second, e2 = append({ external_message_id = "" })
            test.is_nil(e2)
            test.is_true((second or {}).duplicate == true)

            test.eq(threads.appended[1].external_key, threads.appended[2].external_key)
        end)

        test.it("keeps distinct keyless messages distinct by their content", function()
            append({ external_message_id = "", text = "one" })
            append({ external_message_id = "", text = "two" })
            test.ok(threads.appended[1].external_key ~= threads.appended[2].external_key,
                "different content yields different derived keys")
            test.is_false(threads.appended[2].duplicate == true)
        end)

        test.it("separates keyless messages from different senders in the same channel", function()
            append({ external_message_id = "", external_user_id = "ext-1" })
            append({ external_message_id = "", external_user_id = "ext-2" })
            test.ok(threads.appended[1].external_key ~= threads.appended[2].external_key,
                "different sender yields different derived keys")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
