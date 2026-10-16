local ctx = require("ctx")
local kb_search = require("kb_search")

local function build_search_query(input)
    local parts = {}

    if input.working_on and input.working_on ~= "" then
        table.insert(parts, input.working_on)
    end

    local recent_actions = input.recent_actions or {}
    local action_count = math.min(#recent_actions, 3)
    for i = 1, action_count do
        local action = recent_actions[i]
        if type(action) == "string" and action ~= "" then
            table.insert(parts, action)
        elseif type(action) == "table" and action.content and action.content ~= "" then
            table.insert(parts, action.content)
        end
    end

    if #parts == 0 then
        return nil
    end

    return table.concat(parts, " ")
end

local function handle(input)
    local component_id = ctx.get("component_id")
    if not component_id or component_id == "" then
        return { memories = {} }
    end

    local search_query = build_search_query(input)
    if not search_query then
        return { memories = {} }
    end

    local constraints = input.constraints or {}
    local max_items = constraints.max_items or 3

    local results, query_err = kb_search.query(component_id, {
        query = search_query,
        limit = max_items + 5,
    })

    if query_err or not results or not results.items then
        return { memories = {} }
    end

    local previous_ids = {}
    if input.previous_memories then
        for _, id in ipairs(input.previous_memories) do
            previous_ids[id] = true
        end
    end

    local memories = {}
    for _, item in ipairs(results.items) do
        if #memories >= max_items then break end

        if not previous_ids[item.id] then
            local item_type = "chunk"
            if item.meta then
                item_type = item.meta.node_type or "chunk"
            end

            table.insert(memories, {
                id = item.id,
                content = item.content or "",
                metadata = {
                    type = item_type,
                    source = "knowledge_base",
                    similarity = item.meta and item.meta.similarity,
                    created_at = item.meta and item.meta.created_at,
                },
            })
        end
    end

    return { memories = memories }
end

return { handle = handle, build_search_query = build_search_query }
