-- Builds the {id, context} trait specs the curator emits as config.traits on
-- activate/deactivate. config.traits IS the canonical session override (set_active_traits,
-- persisted to the session config, cleared on agent switch). The recompile REPLACES the
-- resolver's output, so a plain id list would drop every trait's instance context (the
-- agent's trait_contexts config, the curator's own seed, the roster's self id). Emitting
-- specs that carry that context keeps activation correct across repeated toggles, and the
-- curator carries its OWN bookkeeping in its own context: base_traits (so a second
-- activation unions onto the full base), master_active (the dynamic set), and
-- master_contexts (dynamic per-trait contexts). Persistence
-- and per-agent scoping both come for free from active_traits -- no separate session-ctx
-- key. Pure (no ctx), so it is unit testable.

local id_set = require("id_set")

local M = {}

local CURATOR_ID = "kickside.agents.traits:trait_curator"
local MASTER_ID = "kickside.agents.traits:trait_master"
local ROSTER_ID = "kickside.agents.traits:agent_roster"

local RUNTIME_CONTEXT_KEYS = {
    base_traits = true,
    trait_contexts = true,
    self_id = true,
    master_active = true,
    master_contexts = true,
}

local function copy_context(ctx: any, strip_runtime: boolean?): { [string]: any }
    local out: { [string]: any } = {}
    if type(ctx) ~= "table" then return out end
    for k, v in pairs(ctx :: any) do
        if not (strip_runtime and RUNTIME_CONTEXT_KEYS[k]) then
            out[k] = v
        end
    end
    return out
end

function M.copy_trait_context(trait_id: string, ctx: any): { [string]: any }
    return copy_context(ctx, trait_id == CURATOR_ID or trait_id == MASTER_ID or trait_id == ROSTER_ID)
end

function M.copy_trait_contexts(trait_contexts: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(trait_contexts) ~= "table" then return out end
    for id, ctx in pairs(trait_contexts :: any) do
        if type(id) == "string" and type(ctx) == "table" then
            out[id] = M.copy_trait_context(id, ctx)
        end
    end
    return out
end

-- base: the agent's configured trait ids; active: the curator's dynamic additions;
-- trait_contexts: the agent's per-trait config map; self_id: the agent's own id;
-- active_contexts: optional per-trait contexts supplied at activation time.
function M.build(base: { string }, active: { string }, trait_contexts: any, self_id: string, active_contexts: any?): { any }
    local tc: any = M.copy_trait_contexts(trait_contexts)
    local ac: any = M.copy_trait_contexts(active_contexts)
    local sid = tostring(self_id or "")
    local active_map: { [string]: boolean } = {}
    for _, id in ipairs(active) do active_map[id] = true end
    local specs: { any } = {}
    for _, id in ipairs(id_set.union(base, active)) do
        local source_ctx = tc[id]
        if active_map[id] and ac[id] then source_ctx = ac[id] end
        local c: { [string]: any } = M.copy_trait_context(id, source_ctx)
        if id == CURATOR_ID or id == MASTER_ID then
            c.base_traits = base
            c.trait_contexts = tc
            c.self_id = sid
            c.master_active = active -- the dynamic set rides the curator's own context
            c.master_contexts = ac -- dynamic contexts ride with the same override
        elseif id == ROSTER_ID then
            c.self_id = sid
        end
        specs[#specs + 1] = { id = id, context = c }
    end
    return specs
end

function M.seed(traits: {any}, self_id: string): {any}
    local ids, contexts = {}, {}
    for _, trait in ipairs(traits) do
        local id = type(trait) == "table" and trait.id or trait
        ids[#ids + 1] = id
        if type(trait) == "table" then contexts[id] = trait.context end
    end
    local built = M.build(ids, {}, contexts, self_id)
    local out = {}
    for i, trait in ipairs(traits) do
        local context = built[i].context
        if type(trait) == "table" then
            local copied = {}
            for key, value in pairs(trait) do copied[key] = value end
            copied.context = context
            out[#out + 1] = copied
        elseif next(context) then
            out[#out + 1] = built[i]
        else
            out[#out + 1] = trait
        end
    end
    return out
end

return M
