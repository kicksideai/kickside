-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local process = require("process")
local channel = require("channel")
local time = require("time")
local models_repo = require("models_repo")

local PROFILE = "ordered-cache-profile"
local CARD = "ordered-cache-card"

local function define_tests()
    test.describe("models cache publication", function()
        local function cleanup()
            local _, err = models_repo.delete_profile(PROFILE)
            test.is_nil(err)
            local _, card_err = models_repo.delete_card(CARD)
            test.is_nil(card_err)
        end
        test.before_all(cleanup)
        test.after_each(cleanup)

        local function race_publications(action)
            local messages = process.listen("models.cache.probe")
            local function receive()
                local timeout = time.after("5s")
                local selected = channel.select({ messages:case_receive(), timeout:case_receive() })
                if selected.channel ~= messages then error("cache publication probe timed out") end
                return selected.value.event, selected.value.resume_pid
            end
            local older, older_err = process.spawn("app:cache_publication_probe", "app:processes", {
                parent = tostring(process.pid()), action = "older",
            })
            test.is_nil(older_err)
            local paused, resume_pid = receive()
            test.eq(paused, "paused")
            test.not_nil(resume_pid)
            local _, newer_err = process.spawn("app:cache_publication_probe", "app:processes", {
                parent = tostring(process.pid()), action = action, profile = PROFILE, card = CARD,
            })
            test.is_nil(newer_err)
            test.eq(receive(), "started")
            local deadline = time.after("30ms")
            local selected = channel.select({ messages:case_receive(), deadline:case_receive() })
            local published_early = selected.channel == messages
            -- Always release the paused reader, including on an unfixed runtime.
            process.send(resume_pid, "models.cache.resume", true)
            local completed = published_early and 1 or 0
            while completed < 2 do
                local event = receive()
                test.is_true(event == "older_done" or event == action .. "_done")
                completed = completed + 1
            end
            process.unlisten(messages)
            test.is_false(published_early, "newer publication passed a paused older reload")
        end

        test.it("orders profile status publication after a paused older reload", function()
            local _, err = models_repo.create_profile({
                id = PROFILE, name = "Ordered cache profile",
                provider_id = "wippy.llm.openai:provider", enabled = false,
            })
            test.is_nil(err)
            race_publications("status")
            local db = assert(sql.get("app:db"))
            local rows, query_err = db:query(
                "SELECT status FROM kickside_model_provider_profiles WHERE id = $1", { PROFILE })
            db:release()
            test.is_nil(query_err)
            test.eq(rows[1].status, "unhealthy")
            test.eq(models_repo.get_profile_public(PROFILE).status, "unhealthy")
            test.eq(models_repo.get_profile_public(PROFILE).message, "newer status")
        end)

        test.it("orders card deletion publication after a paused older reload", function()
            local _, err = models_repo.upsert_card({
                name = CARD, title = "Ordered cache card",
                provider_id = "wippy.llm.openai:provider", provider_model = "ordered-cache",
                capabilities = { "generate" }, max_tokens = 1000, output_tokens = 100,
            })
            test.is_nil(err)
            race_publications("delete")
            local cards, read_err = models_repo.list_card_overlays()
            test.is_nil(read_err)
            for _, card in ipairs(cards) do test.is_true(card.name ~= CARD) end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
