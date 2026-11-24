-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Implementation of the kickside.models.cards:cards contract.
local card_service = require("card_service")
local policy = require("policy")
local keyset = require("keyset")

local M = {}

type Map = { [string]: any }

local function train_error(metadata: any): string?
    if type(metadata) ~= "table" then return nil end
    local train = (metadata :: any).train
    if train == nil then return nil end
    if type(train) ~= "table" then return "metadata.train must be an object" end
    for _, key in ipairs({ "weights_digest", "manifest_sha256" }) do
        local value = (train :: any)[key]
        if type(value) ~= "string" or value == "" then
            return "metadata.train." .. key .. " is required"
        end
    end
    return nil
end

local function redact_urls(value: any): any
    if type(value) == "string" and policy.url_has_credentials(value) then return "[redacted]" end
    if type(value) == "table" then
        for key, child in pairs(value) do value[key] = redact_urls(child) end
    end
    return value
end

local function public_reply(card: any): any
    local public = policy.split_config(card)
    return redact_urls(public)
end

local function respond(card: any?, err: any?): any
    if not card then return { success = false, error = tostring(err) } end
    return { success = true, model = public_reply(card) }
end

local function matches(card: Map, query: string): boolean
    if query == "" then return true end
    for _, value in ipairs({ card.name, card.title, card.provider_model }) do
        if type(value) == "string" and string.lower(value):find(query, 1, true) then return true end
    end
    return false
end

-- upsert_card(card) -> { success, model?, error? }. Idempotent by card name.
function M.upsert_card(args: any): any
    if type(args) ~= "table" then return { success = false, error = "model body must be an object" } end
    local terr = train_error(args.metadata)
    if terr then return { success = false, error = terr } end
    local input = policy.split_config(args)
    if policy.config_credential_error(input) then
        return { success = false, error = "Model card URLs must be credential-free. Configure credentials on the provider profile." }
    end
    return respond(card_service.save(input))
end

-- disable_card({ name }) -> { success, model?, error? }. Idempotent by card name.
function M.disable_card(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    return respond(card_service.disable(args.name))
end

-- list_cards({}) -> { success, models?, error? }. Every catalog card, disabled included.
function M.list_cards(_args: any): any
    local cards, err = card_service.list()
    if not cards then return { success = false, error = tostring(err) } end
    local models: { any } = {}
    for _, card in ipairs(cards :: { any }) do
        models[#models + 1] = public_reply(card)
    end
    return { success = true, models = models }
end

-- Page compact summaries within the catalog owner, applying the filter to public fields.
function M.list_card_summaries(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return { success = false, error = page_err:message() } end
    if args.q ~= nil and type(args.q) ~= "string" then
        return { success = false, error = "q must be a string" }
    end
    local summaries, err = card_service.list_summaries()
    if not summaries then return { success = false, error = tostring(err) } end
    local query = string.lower(args.q or "")
    local rows: { any } = {}
    for _, summary in ipairs(summaries :: { any }) do
        local public = public_reply(summary)
        if matches(public, query) then rows[#rows + 1] = public end
    end
    local page, next_cursor = keyset.page(rows, keyset.field("name"), limit :: integer, cursor)
    return { success = true, cards = page, next_cursor = next_cursor }
end

-- get_card({ name }) -> { success, model?, error? }. Disabled cards included.
function M.get_card(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    return respond(card_service.get(args.name))
end

-- delete_card({ name }) -> { success, error? }. Deletes a disabled stored card.
function M.delete_card(args: any): any
    if type(args) ~= "table" then return { success = false, error = "request must be an object" } end
    local ok, err = card_service.delete(args.name)
    if not ok then
        local details = type(err) == "userdata" and (err :: any):details() or nil
        local code = type(details) == "table" and details.code or nil
        return { success = false, error = type(err) == "userdata" and (err :: any):message() or tostring(err), code = code }
    end
    return { success = true }
end

return M
