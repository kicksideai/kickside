local http_client = require("http_client")
local common = require("discovery_common")

-- Reference-catalog adapter backed by OpenRouter's public model lists
-- (no auth required). It is a read-only
-- metadata source: given a provider + model id it returns the context window and
-- per-token pricing OpenRouter publishes, used to fill gaps for providers whose
-- own /models API omits those fields (OpenAI, Anthropic, Bedrock). It is one
-- implementation of the reference port; the registry composes it with any others.
local M = {}

M.source_id = "openrouter"

-- OpenRouter publishes chat/completion models and embedding models as two
-- catalogs; both feed one index so either kind of model finds its limits.
local CATALOG_URLS = {
    "https://openrouter.ai/api/v1/models",
    "https://openrouter.ai/api/v1/embeddings/models",
}
local TTL_SECONDS = 3600

-- Process-local cache: the catalog is large and stable, so fetch at most once an
-- hour per worker. Never throws -- a failed refresh just yields no enrichment.
local cache: { at: number, by_full: any } = { at = 0, by_full = nil }

-- Canonical key for matching: lowercase, drop the "models/" prefix (Gemini),
-- trailing date stamps (claude-...-20251001), and provider routing suffixes
-- (":free", "@preset") so vendor-native ids line up with OpenRouter ids.
local function normalize(id: any): string
    local s = tostring(id or ""):lower()
    s = s:gsub("^models/", "")
    s = s:gsub("@.*$", "")
    s = s:gsub(":[%w_%-]+$", "")
    s = s:gsub("%-20%d%d%d%d%d%d$", "")
    s = s:gsub("%-20%d%d%-%d%d%-%d%d$", "")
    -- Unify version separators: OpenRouter writes "claude-haiku-4.5" while the
    -- vendor APIs return "claude-haiku-4-5"; collapse both to dashes so they match.
    s = s:gsub("%.", "-")
    return s
end

local function build_index(rows: { any }): any
    local by_full: { [string]: any } = {}
    for _, m in ipairs(rows) do
        if type(m) == "table" and type(m.id) == "string" and m.id ~= "" then
            local top = type(m.top_provider) == "table" and m.top_provider or {}
            local entry = {
                context_length = tonumber(m.context_length) or tonumber(top.context_length),
                output_tokens = tonumber(top.max_completion_tokens),
                pricing = type(m.pricing) == "table" and m.pricing or nil,
            }
            by_full[normalize(m.id)] = entry

        end
    end
    return by_full
end

local function ensure_loaded(): (boolean, any?)
    local now = os.time() :: number
    if cache.by_full ~= nil and (now - cache.at) < TTL_SECONDS then return true end

    local rows: { any } = {}
    for _, url in ipairs(CATALOG_URLS) do
        local response, err = http_client.get(url, {
            timeout = "20s",
            headers = { ["Content-Type"] = "application/json" },
        })
        if err then return false, err end
        local parsed, parse_err = common.decode_response(response, "openrouter catalog")
        if parse_err then return false, parse_err end
        for _, row in ipairs(common.model_rows(parsed)) do rows[#rows + 1] = row end
    end

    cache.by_full = build_index(rows)
    cache.at = now
    return true
end

-- Vendor prefix OpenRouter uses for a KickSide provider id.
-- Built imperatively into a declared map: a table literal with constant keys can
-- be inferred as a record shape, which then fails to match the {[string]: string}
-- map annotation; per-key assignment keeps the type stable.
local VENDOR: { [string]: string } = {}
VENDOR[common.PROVIDERS.OPENAI] = "openai"
VENDOR[common.PROVIDERS.ANTHROPIC] = "anthropic"
VENDOR[common.PROVIDERS.GOOGLE_GENAI] = "google"

-- Full-id candidates to try, most specific first.
local function candidates(provider_id: string, provider_model: string): { string }
    local out: { string } = {}
    local vendor = VENDOR[provider_id]
    if vendor then out[#out + 1] = normalize(vendor .. "/" .. provider_model) end
    -- Bedrock ids embed the vendor as "anthropic.claude-..."; map the first
    -- dotted segment to OpenRouter's "anthropic/claude-..." form.
    if provider_id == common.PROVIDERS.BEDROCK then
        out[#out + 1] = normalize((tostring(provider_model):gsub("^([%w]+)%.", "%1/")))
    end
    -- The id may already be vendor-qualified (openai_compat passthrough).
    if tostring(provider_model):find("/", 1, true) then
        out[#out + 1] = normalize(provider_model)
    end
    return out
end

-- lookup returns { context_length?, output_tokens?, pricing? } for a model, or
-- nil when it has no match. Catalog load failures return an error.
function M.lookup(provider_id: string, provider_model: string): (any?, any?)
    if type(provider_model) ~= "string" or provider_model == "" then return nil end
    local loaded, load_err = ensure_loaded()
    if not loaded then return nil, load_err end
    for _, key in ipairs(candidates(provider_id, provider_model)) do
        local hit = cache.by_full[key]
        if hit then return hit end
    end
    return nil
end

return M
