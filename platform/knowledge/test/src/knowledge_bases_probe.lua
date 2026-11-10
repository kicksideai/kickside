local knowledge_bases = require("knowledge_bases")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local time = require("time")

local function component_service(): any
    local definition, err = contract.get("kickside.component:component_service")
    if err then error(err) end
    local instance, open_err = (definition :: any):with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err then error(open_err) end
    return instance
end

local function delete_with_child(): (any, any)
    local created, create_err = knowledge_bases.create({
        name = "Parent of a child", kb_type = "bound", embedding_model = "fixture-embedding",
    })
    if create_err then return nil, create_err end
    local kb_id = (created :: any).component_id
    local svc = component_service()

    local child_id = uuid.v7()
    local registered, register_err = svc:register({
        component_id = child_id, impl_id = "kickside.knowledge.registry:child", meta = { title = "Child" }, parent_id = kb_id,
    })
    if register_err then return nil, register_err end
    if not registered.success then return nil, "the child was not registered: " .. tostring(registered.error) end

    local answer: { [string]: any } = { kb_id = kb_id, child_id = child_id }
    local _, delete_err = knowledge_bases.delete({ component_id = kb_id })
    if delete_err then
        answer.delete_error = tostring(delete_err)
        return answer, nil
    end

    for _ = 1, 50 do
        local kb = svc:get({ component_id = kb_id })
        if not kb.success then break end
        time.sleep("100ms")
    end
    answer.kb_gone = svc:get({ component_id = kb_id }).success ~= true
    local child = svc:get({ component_id = child_id })
    answer.child_found = child.success == true
    answer.child_parent = child.parent_id
    return answer, nil
end

return { delete_with_child = delete_with_child }
