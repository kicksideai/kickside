-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component = require("component")
local knowledge_bases = require("knowledge_bases")
local update_kb = require("update_kb")

local function run(args: any): any
    local service = assert(component.get_service())
    local created
    if args.non_kb then
        created = assert(service:register({ impl_id = "test.kb:non_kb",
            meta = { class = "thread", title = "Before", comment = "Original description", icon = "tabler:book",
                kb_type = "bound" } }))
        assert(created.success, tostring(created.error))
    else
        created = assert(knowledge_bases.create({ name = "Before", description = "Original description",
            icon = "tabler:book", kb_type = "bound", embedding_model = "fixture-embedding" }))
    end
    local id = created.component_id
    local before = assert(service:get({ component_id = id }))
    assert(before.success, tostring(before.error))
    local _, access_err = component.validate_access(id, component.ACCESS.WRITE)
    assert(not access_err, tostring(access_err))

    local updated, update_err = update_kb.update(id, args.body)
    local after = assert(service:get({ component_id = id }))
    assert(after.success, tostring(after.error))
    local deleted, delete_err
    if args.non_kb then
        deleted, delete_err = service:delete({ component_id = id })
    else
        deleted, delete_err = knowledge_bases.delete({ component_id = id })
    end
    assert(deleted and not delete_err, tostring(delete_err))
    return { before = before.meta, after = after.meta, updated = updated ~= nil,
        invalid = update_err ~= nil and errors.is(update_err, errors.INVALID),
        error = update_err and tostring(update_err) }
end

return { run = run }
