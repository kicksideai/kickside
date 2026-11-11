-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local link_service = require("link_service")
local channel_persist = require("channel_persist")

local DB = "app:db"

local function execute(statement: string, args: {any}?)
    local db = assert(sql.get(DB))
    local _, err = db:execute(statement, args or {})
    db:release()
    test.is_nil(err, tostring(err))
end

local function counts(external_id: string): {any}
    local db = assert(sql.get(DB))
    local rows, err = db:query([[SELECT reply_uncertain,unappended FROM kickside_channel_cleanup_counts
        WHERE provider='discord' AND external_id=$1]], { external_id })
    db:release()
    test.is_nil(err, tostring(err))
    return rows or {}
end

return { run = test.run_cases(function()
    test.describe("identity unlink conversation counts", function()
        local blocked_links = {}

        test.before_all(function()
            -- The blocker column carries the link_id column type of kickside_external_links.
            local db = assert(sql.get(DB))
            local link_type = db:type() == sql.type.POSTGRES and "UUID" or "TEXT"
            db:release()
            execute("CREATE TABLE IF NOT EXISTS unlink_delete_blocker (link_id " .. link_type
                .. " NOT NULL REFERENCES kickside_external_links(link_id) ON DELETE RESTRICT)")
        end)

        test.after_all(function()
            for _, link_id in ipairs(blocked_links) do
                execute("DELETE FROM unlink_delete_blocker WHERE link_id=$1", { link_id })
                execute("DELETE FROM kickside_external_links WHERE link_id=$1", { link_id })
            end
        end)

        test.it("keeps discarded counts through a failed link DELETE and reports them on retry", function()
            local external_id, link_id, session_id = "unlink-" .. uuid.v4(), uuid.v7(), uuid.v7()
            local owner = "unlink-owner-" .. uuid.v4()
            blocked_links[#blocked_links + 1] = link_id
            execute([[INSERT INTO kickside_external_links (link_id,provider,external_id,user_id)
                VALUES ($1,'discord',$2,$3)]], { link_id, external_id, owner })
            execute("INSERT INTO unlink_delete_blocker (link_id) VALUES ($1)", { link_id })
            execute([[INSERT INTO kickside_channel_turns (turn_id,route_json,accepted_at,reply_state)
                VALUES ($1,$2,'2000-01-01T00:00:00Z','reserved')]],
                { uuid.v7(), '{"session_id":"' .. session_id .. '"}' })
            test.is_nil(channel_persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))

            local first, first_err = link_service.unlink(owner, "discord", external_id)
            test.is_false(first)
            test.is_true(errors.is(first_err, errors.UNAVAILABLE), tostring(first_err))
            test.eq((first_err :: any):details().discarded.reply_uncertain, 1)
            test.eq((first_err :: any):details().discarded.unappended, 1)
            test.eq(#counts(external_id), 1, "failed link delete must retain the count pointer")

            local repeated, repeat_err = funcs.call("kickside.channel:cleanup_conversation",
                { provider = "discord", external_id = external_id })
            test.is_nil(repeat_err, tostring(repeat_err))
            test.is_true(repeated.success, tostring(repeated.error))
            test.eq(#counts(external_id), 1, "later cleanup may not erase a linked owner's counts")
            execute("DELETE FROM unlink_delete_blocker WHERE link_id=$1", { link_id })

            local second, second_err, discarded = link_service.unlink(owner, "discord", external_id)
            test.is_true(second, tostring(second_err))
            test.is_nil(second_err)
            test.eq(discarded.reply_uncertain, 1)
            test.eq(discarded.unappended, 1)
            test.eq(#counts(external_id), 0)
        end)
    end)
end) }
