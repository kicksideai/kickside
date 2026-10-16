local test = require("test")
local dm_module = require("dm_runtime")
local dm = dm_module.new({ trusted_ingress = function(_resource: string): boolean return true end })
local test_state = require("test_state")

local function inbound(text: string?): any
    return {
        provider = "discord",
        reply_component_id = "bot-component",
        reply_resource_id = "bot-resource",
        channel_id = "channel-1",
        external_message_id = "message-1",
        external_user_id = "ext-linked",
        external_username = "example-user",
        external_display_name = "Example User",
        text = text or "hello",
    }
end

local function define_tests()
    test.describe("KickSide DM", function()
        test.it("rejects an inbound message without an external user id", function()
            test_state.reset()
            local request = inbound("hello")
            request.external_user_id = ""
            local result = dm.receive(request)
            test.eq(result.accepted, false)
            test.eq(result.status, "error")
        end)

        test.it("refuses a user supplied envelope at the provider DM receive seam", function()
            test_state.reset()
            local untrusted = dm_module.new({ trusted_ingress = function(_resource: string): boolean return false end })
            local result = untrusted.receive(inbound("hello"))
            test.is_false(result.accepted)
            test.eq(result.status, "error")
            test.is_nil(test_state.last_route())
            test.is_nil(test_state.last_accepted())
        end)

        test.it("prompts unlinked senders to generate a link code", function()
            test_state.reset()
            local request = inbound("hello")
            request.external_user_id = "ext-unlinked"
            local result = dm.receive(request)
            test.eq(result.accepted, true)
            test.eq(result.status, "unlinked")
            test.contains(test_state.last_reply(), "link <code>")
        end)

        for _, provider in ipairs({ "slack", "telegram" }) do
            test.it("admits a " .. provider .. " DM notice with reply proof", function()
                test_state.reset()
                local request = inbound("hello")
                request.provider = provider
                request.external_user_id = "ext-unlinked"
                request.external_message_id = "in-1"
                local result = dm.receive(request)
                test.eq(result.status, "unlinked")
                local accepted = test_state.last_accepted()
                test.not_nil(accepted)
                test.eq(accepted.route.session_provider, provider)
                test.eq(accepted.principal.id, provider .. ".gateway")
                test.eq(accepted.route.inbound.external_message_id, "in-1")
            end)

            test.it("seals " .. provider .. " link success and failure notices", function()
                for _, code in ipairs({ "valid-code", "bad-code" }) do
                    test_state.reset()
                    local request = inbound("link " .. code)
                    request.provider = provider
                    local result = dm.receive(request)
                    test.is_true(result.status == "linked" or result.status == "link_failed")
                    local accepted = test_state.last_accepted()
                    test.not_nil(accepted)
                    test.eq(accepted.route.session_provider, provider)
                    test.eq(accepted.principal.id, provider .. ".gateway")
                end
            end)
        end

        test.it("links a sender with a valid code", function()
            test_state.reset()
            local result = dm.receive(inbound("link valid-code"))
            test.eq(result.accepted, true)
            test.eq(result.status, "linked")
            test.eq(result.user_id, "user-1")
            test.eq(test_state.last_link().display_name, "Example User")
        end)

        test.it("routes linked messages as the linked user", function()
            test_state.reset()
            local result = dm.receive(inbound("hello"))
            test.eq(result.accepted, true)
            test.eq(result.status, "routed")
            test.eq(result.user_id, "user-1")
            local route = test_state.last_route()
            test.not_nil(route)
            test.eq(route.admission.principal.kind, "user")
            test.eq(route.admission.principal.id, "user-1")
            test.eq(route.start.agent_id, "kickside.dm.agents:greeter")
        end)

        test.it("clears the linked session and its live bridge", function()
            test_state.reset()
            local result = dm.receive(inbound("/clear"))
            test.eq(result.accepted, true)
            test.eq(result.status, "cleared")
            test.eq(result.session_id, "rotated-session")
            test.eq(test_state.last_hub_message().kind, "clear")
            test.eq(test_state.last_clear().db_id, "app:db")
            local admission = test_state.last_clear().admission
            test.eq(admission.owner_id, "channel.session")
            test.eq(admission.identity.principal.id, "user-1")
            test.eq(admission.link_id, admission.identity.link_id)
        end)

        test.it("surfaces a typed owner-delete refusal before clear effects", function()
            test_state.reset()
            local refusal = errors.new({ message = "channel conversation is being deleted",
                kind = errors.CONFLICT, retryable = false,
                details = { reason = "owner_deleting", scope = "discord:ext-linked",
                    operation = "owner_delete" } })
            test_state.set_clear_error(refusal)
            local result = dm.receive(inbound("/clear"))
            test.is_false(result.accepted)
            test.eq(result.status, "blocked_source_deleted")
            test.eq(result.error, refusal)
            test.eq(result.scope, "discord:ext-linked")
            test.eq(result.operation, "owner_delete")
            test.is_nil(test_state.last_hub_message())
            test.is_nil(test_state.last_reply())
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {
    run = function(options)
        require("test_state").reset()
        return run_cases(options)
    end,
}
