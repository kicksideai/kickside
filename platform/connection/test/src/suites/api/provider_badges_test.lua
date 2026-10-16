local test = require("test")
local provider_badges = require("provider_badges")

local function binding(provider, title, icon)
    return {
        kind = "contract.binding",
        meta = { provider = provider, title = title, icon = icon },
    }
end

local function request(entries, lookup_error)
    local written, status
    local response = {
        set_content_type = function() end,
        set_status = function(_, value) status = value end,
        write_json = function(_, value) written = value end,
    }
    local instance = provider_badges.new(
        function(query)
            test.eq(query[".kind"], "contract.binding")
            return entries, lookup_error
        end,
        function() return response end,
        { error = function() end }
    )
    local result, err = instance.handler()
    test.is_nil(result)
    test.is_nil(err)
    return written, status
end

local function define_tests()
    test.describe("provider badges catalogue", function()
        test.it("drops malformed, oversized, and prototype-like provider ids without leaking metadata", function()
            local result = request({
                binding("discord", "Discord", "tabler:brand-discord"),
                binding("constructor", "Prototype", "tabler:alert"),
                binding("../../secret", "Should not render", "tabler:key"),
                binding(string.rep("x", 65), "Too long", "tabler:key"),
                binding("valid\nprovider", "Control", "tabler:key"),
            })
            test.is_true(result.success)
            local out = result.providers
            test.eq(#out, 2)
            test.eq(out[1].provider, "constructor")
            test.eq(out[2].provider, "discord")
        end)

        test.it("bounds unsafe presentation metadata and uses a fixed icon fallback", function()
            local result = request({ binding("discord", string.rep("t", 121), "javascript:alert(1)") })
            local out = result.providers
            test.eq(#out, 1)
            test.eq(out[1].title, "discord")
            test.eq(out[1].icon, "tabler:plug-connected")
        end)

        test.it("prefers a declared safe icon when duplicate provider bindings disagree", function()
            local result = request({
                binding("discord", "First", "not an icon"),
                binding("DISCORD", "Second", "tabler:brand-discord"),
            })
            local out = result.providers
            test.eq(#out, 1)
            test.eq(out[1].provider, "discord")
            test.eq(out[1].title, "Second")
            test.eq(out[1].icon, "tabler:brand-discord")
        end)

        test.it("uses a stable public error instead of a raw registry failure", function()
            local result, status = request(nil, "private registry failure")
            test.eq(status, 500)
            test.is_false(result.success)
            test.eq(result.error, "provider catalogue unavailable")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
