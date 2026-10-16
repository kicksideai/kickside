local http = require("http")
local models = require("models")

-- GET /models/list[?capability=generate|embed|<cap>] — model discovery for UI
-- pickers. Default (absent or "generate") returns generate-capable chat/tool-use
-- models (embedding-only excluded), carrying class[]/capabilities[]; "embed"
-- returns embedding models with their dimensions; any other value filters by that
-- capability tag. Every row also carries provider and dimensions (when known), so
-- one response shape serves every picker (agents, knowledge KB embedding, …).
local function has_capability(model, cap)
    if not model.capabilities then return false end
    for _, c in ipairs(model.capabilities) do
        if c == cap then return true end
    end
    return false
end

-- Short provider label from the provider id / handler ref
-- (e.g. "wippy.llm.openai:provider" -> "openai").
local function provider_of(model)
    if model.providers and #model.providers > 0 then
        local m = model.providers[1].id:match("wippy%.llm%.([^:]+):")
        if m then return m end
    end
    local handlers = model.handlers
    if handlers then
        local ref = handlers.generate or handlers.embeddings
        if ref then
            local m = ref:match("wippy%.llm%.([^:]+):")
            if m then return m end
        end
    end
    return "unknown"
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    local capability = req:query("capability")
    if capability == "" then capability = nil end

    local all_models, err = models.get_all()
    if err then return nil, err end

    local formatted = {}
    for _, model in ipairs(all_models) do
        local is_embedding = (model.type == "llm.embedding") or has_capability(model, "embed")

        local include
        if capability == nil or capability == "generate" then
            -- Generate-capable chat/tool-use models; embedding-only excluded.
            local can_generate = has_capability(model, "generate") or has_capability(model, "tool_use")
            if model.handlers and model.handlers.generate then can_generate = true end
            include = can_generate and not is_embedding
        elseif capability == "embed" then
            include = has_capability(model, "embed")
        else
            include = has_capability(model, capability)
        end

        if include then
            -- The class array (e.g. {"fast","nano"}) lets the UI offer model
            -- classes as selectable targets; capabilities gate features like
            -- extended thinking; dimensions are present on embedding models.
            table.insert(formatted, {
                name = model.name,
                title = model.title or model.name,
                description = model.description or "",
                provider = provider_of(model),
                class = model.class or {},
                capabilities = model.capabilities or {},
                dimensions = model.dimensions,
                output_tokens = model.output_tokens,
            })
        end
    end

    -- Discovery reflects the live registry; never let a client cache it (a cached
    -- response can mask a model the registry just gained or lost).
    res:set_header("Cache-Control", "no-store")
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        capability = capability or "generate",
        count = #formatted,
        models = formatted,
    })
end

return {
    handler = handler,
}
