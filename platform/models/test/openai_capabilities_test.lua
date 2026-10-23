-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local adapter = require("provider_openai_like")
local mapper = require("model_mapper")
local repo = require("models_repo")
local common = require("discovery_common")

local openai = { provider_id = common.PROVIDERS.OPENAI }
local function caps(id, item, profile)
    return adapter.capabilities(id, item or { id = id }, profile or openai)
end

local function define_tests()
    test.describe("first-party model capabilities", function()
        test.it("infers reasoning for GPT generations from five upward", function()
            for _, id in ipairs({ "o3-mini", "gpt-5", "gpt-6", "gpt-6.1-mini", "gpt-10", "gpt-12.3-mini" }) do
                local inferred = caps(id)
                test.is_true(common.table_has(inferred, "reasoning"), id)
                test.eq(mapper.infer_options(id, {}, inferred).reasoning_model_request, true)
            end
            for _, id in ipairs({ "gpt-4.1", "gpt-6-chat-latest", "gpt-10-chat-latest", "unknown" }) do
                test.is_false(common.table_has(caps(id), "reasoning"), id)
            end
            for _, provider in ipairs({ common.PROVIDERS.OPENAI_COMPAT, common.PROVIDERS.OPENAI_COMPAT_PLAIN }) do
                test.is_false(common.table_has(caps("gpt-6", nil, { provider_id = provider }), "reasoning"))
            end
        end)

        test.it("excludes operations outside the first-party generation endpoint", function()
            for _, id in ipairs({
                "gpt-image-2", "chatgpt-image-latest", "dall-e-3", "tts-1-hd", "whisper-1",
                "gpt-4o-mini-tts", "gpt-4o-transcribe-diarize", "gpt-transcribe", "gpt-live-transcribe",
                "gpt-realtime-whisper", "gpt-4o-audio-preview", "sora-2-pro", "omni-moderation-latest",
                "text-moderation-latest", "ada", "curie", "code-cushman-002", "babbage-002", "davinci-002", "text-davinci-003",
                "gpt-3.5-turbo-instruct-0914", "text-embedding-3-small",
            }) do
                test.is_false(common.table_has(caps(id), "generate"), id)
                if not id:find("embedding", 1, true) then
                    test.is_true(common.table_has(caps(id, nil, { provider_id = common.PROVIDERS.OPENAI_COMPAT }), "generate"), id)
                end
            end
            for _, id in ipairs({ "gpt-4o", "gpt-4.1-mini", "gpt-6", "o4-mini", "chatgpt-4o-latest" }) do
                test.is_true(common.table_has(caps(id), "generate"), id)
            end
        end)

        test.it("respects declared capabilities and output modalities", function()
            test.is_true(common.table_has(caps("gpt-image-2", { capabilities = { "generate" } }), "generate"))
            test.is_false(common.table_has(caps("opaque", { outputModalities = { "IMAGE" } }), "generate"))
            test.is_false(common.table_has(caps("opaque", { capabilities = { "embed" } }), "generate"))
            test.is_true(common.table_has(caps("opaque", { supported_parameters = { "reasoning" } }), "reasoning"))
        end)

        test.it("persists an explicitly empty capability list without restoring generate", function()
            local name = "empty-discovered-capabilities"
            local ok, err = pcall(function()
                local card, save_err = repo.upsert_card({ name = name, provider_model = "gpt-image-2",
                    provider_id = openai.provider_id, capabilities = {}, enabled = false, source = "discovered" })
                test.is_nil(save_err)
                test.eq(#card.capabilities, 0)
                local edited, edit_err = repo.upsert_card({ name = name, title = "Edited" })
                test.is_nil(edit_err)
                test.eq(#edited.capabilities, 0)
            end)
            local _, delete_err = repo.delete_card(name)
            test.is_nil(delete_err)
            if not ok then error(err) end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
