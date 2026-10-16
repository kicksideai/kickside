local test = require("test")
local generator = require("generator")

local KB_SINK_SCHEMA = {
    type = "object",
    properties = { content = { type = "string" }, content_type = { type = "string" }, metadata = { type = "object" } },
    required = { "content" },
}

local function define_tests()
    test.describe("fireflies transform before/after", function()
        test.it("a pass-through transcript is no KB content; the generated expr is clean content", function()
            -- realistic fireflies transcript item (payload per the source item_schema)
            local item = { payload = {
                id = "01KTS-abc", title = "Q3 Planning Sync",
                date = "2026-06-30", host_email = "lead@acme.com",
                summary = { overview = "The team aligned on Q3 priorities: ship the transform layer, cut onboarding time, and expand the pilot to three new accounts. Owners and dates were assigned for each.", keywords = {"Q3","roadmap"} },
                attendees = {"lead@acme.com","pm@acme.com"}, transcript_url = "https://fireflies/t/abc"
            }}
            local shape = { input_shape = "content" }
            -- BEFORE: transform=none hands the raw transcript record through.
            local before_ok, before_errors = generator.validate_transform({ kind = "none" }, KB_SINK_SCHEMA, { item }, shape)
            -- AFTER: the generated fireflies->KB expr artifact
            local expr = '{ content: payload.summary?.overview ?? payload.title, content_type: "text/plain", metadata: { title: payload.title, date: payload.date, host_email: payload.host_email, source: "fireflies" } }'
            local after_ok, after_errors, after = generator.validate_transform({ kind = "expr", expr = expr }, KB_SINK_SCHEMA, { item }, shape)
            test.is_false(before_ok)
            test.contains(before_errors[1], "content sink needs a string or a table carrying content")
            test.is_true(after_ok, tostring(after_errors[1]))
            test.eq(after[1].content_type, "text/plain")
            test.eq(after[1].content, item.payload.summary.overview)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
