-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local knowledge_bases = require("knowledge_bases")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local ctx = require("ctx")
local time = require("time")

local function query(statement: string, args: any?): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args or {})
    local _, release_err = db:release()
    assert(not err, tostring(err)); assert(not release_err, tostring(release_err))
    return rows
end

local function delete_with_child(args: any): any
    local mode = args.mode
    local db = assert(sql.get("app:db"))
    assert(db:execute("CREATE TABLE IF NOT EXISTS knowledge_child_cleanup (component_id TEXT PRIMARY KEY, parent_id TEXT, cleaned INTEGER NOT NULL DEFAULT 0)"))
    assert(db:release())
    local created = assert(knowledge_bases.create({
        name = "Dependent cleanup", kb_type = "bound", embedding_model = "fixture-embedding",
    }))
    local kb_id = created.component_id
    local svc = assert(assert(contract.get("kickside.component:component_service"))
        :with_actor(security.actor()):with_scope(security.new_scope({security.policy("app:user")})):open())
    local ids: {string} = {}
    local parent_id = kb_id
    for index = 1, (mode == "empty" and 0 or ((mode == "nested" or mode == "denied" or mode == "partial") and 2 or 1)) do
        local row = assert(svc:register({impl_id = "kickside.knowledge.registry:" .. (mode == "denied" and index == 1 and "allowed_child" or "child"),
            parent_id = parent_id, private_context = {fail = mode == "failed" or (mode == "partial" and index == 1)}}))
        assert(row.success, tostring(row.error))
        ids[#ids + 1] = row.component_id
        db = assert(sql.get("app:db"))
        assert(db:execute("INSERT INTO knowledge_child_cleanup(component_id,parent_id) VALUES ($1,$2)", {row.component_id, parent_id}))
        assert(db:release())
        if mode ~= "denied" then parent_id = row.component_id end
    end
    local _, delete_err = knowledge_bases.delete({component_id = kb_id})
    if not delete_err then
        local deadline = time.now():add("5s")
        while time.now():before(deadline) do
            if #query("SELECT component_id FROM kickside_components WHERE component_id=$1", {kb_id}) == 0 then break end
            time.sleep("10ms")
        end
    end
    local remaining, cleaned, marked, attached = 0, 0, 0, true
    parent_id = kb_id
    for _, id in ipairs(ids) do
        local rows = query("SELECT parent_id,deleting_at FROM kickside_components WHERE component_id=$1", {id})
        remaining = remaining + #rows
        if rows[1] then
            attached = attached and rows[1].parent_id == parent_id
            if rows[1].deleting_at ~= nil then marked = marked + 1 end
        end
        cleaned = cleaned + assert(tonumber(query("SELECT cleaned FROM knowledge_child_cleanup WHERE component_id=$1", {id})[1].cleaned))
        if mode ~= "denied" then parent_id = id end
    end
    local blocking_child = mode == "denied" and ids[2] or ids[1]
    return {delete_error = delete_err and tostring(delete_err), conflict = delete_err ~= nil and errors.is(delete_err, errors.CONFLICT),
        names_child = delete_err ~= nil and tostring(delete_err):find(blocking_child, 1, true) ~= nil,
        deleted_count = delete_err and delete_err:details().deleted_count,
        details_name_child = delete_err ~= nil and delete_err:details().component_id ~= nil,
        kb_present = #query("SELECT component_id FROM kickside_components WHERE component_id=$1", {kb_id}) > 0,
        children_remaining = remaining, cleaned = cleaned, marked = marked, children_attached = attached,
        children_first = #query("SELECT component_id FROM knowledge_child_cleanup WHERE parent_id=$1 AND cleaned<0", {kb_id}) == 0}
end

local function cleanup(): (any?, error?)
    local component_id = ctx.get("component_id")
    if ctx.get("fail") then return nil, errors.new({message = "dependent teardown refuses deletion", kind = errors.CONFLICT, retryable = false}) end
    local db = assert(sql.get("app:db"))
    local children = assert(db:query("SELECT component_id FROM kickside_components WHERE parent_id=$1", {component_id}))
    local _, err = db:execute("UPDATE knowledge_child_cleanup SET cleaned=$1 WHERE component_id=$2", {#children == 0 and 1 or -1, component_id})
    local _, release_err = db:release()
    if err then return nil, err end
    if release_err then return nil, release_err end
    return {success = true, deleted = true}, nil
end

return {delete_with_child = delete_with_child, cleanup = cleanup}
