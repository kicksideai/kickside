-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component = require("component")
local knowledge_bases = require("knowledge_bases")
local contract = require("contract")
local security = require("security")
local kb_search = require("kb_search")
local stores = require("stores")
local ingest_upload = require("ingest_upload")

local function run(args: any): any
    local service = assert(component.get_service())
    if args.action == "update_write_only" then
        local result, err = knowledge_bases.update({ component_id = args.id, name = "After" })
        return { updated = result ~= nil, error = tostring(err) }
    end
    if args.action == "create" then
        local created
        if args.provisioned then
            created = assert(service:register({ impl_id = "test.kb:embeddable",
                meta = { class = args.non_kb and "thread" or "knowledge_base", title = "Before", kb_type = "wiki" } }))
            assert(created.success, tostring(created.error))
            local threads = assert(assert(contract.get("kickside.core:threads"))
                :with_actor(security.actor()):with_scope(security.scope()):open())
            local _, thread_err = threads:ensure_thread({ component_id = created.component_id,
                impl_id = "knowledge.fixture:test_engine_wiki", thread_class = "kickside.knowledge.injection" })
            assert(not thread_err, tostring(thread_err))
        else
            created = assert(service:register({ impl_id = "test.kb:non_kb",
                meta = { class = "thread", title = "Before", comment = "Original", kb_type = "bound" } }))
            assert(created.success, tostring(created.error))
        end
        return { id = created.component_id }
    end
    local row = assert(service:get({ component_id = args.id }))
    assert(row.success, tostring(row.error))
    local _, access_err = component.validate_access(args.id, component.ACCESS.WRITE)
    assert(not access_err, tostring(access_err))
    if args.action == "query" or args.action == "config" then
        local calls = 0
        local original = stores.resolve_component_store
        stores.resolve_component_store = function()
            calls = calls + 1
            return nil, nil, nil, errors.new({ kind = errors.INTERNAL, message = "store read reached" })
        end
        local result, err
        if args.action == "query" then result, err = kb_search.query(args.id, { query = "fixture" })
        else
            local engine
            result, engine, err = kb_search.config(args.id)
        end
        stores.resolve_component_store = original
        return { result = result, error = tostring(err), calls = calls }
    end
    if args.action == "upload_core" then
        local result, err = ingest_upload.ingest(args.id, args.upload_id, {})
        return { result = result, invalid = err ~= nil and errors.is(err, errors.INVALID), error = tostring(err) }
    end
    if args.action == "update" then
        local result, err = knowledge_bases.update({ component_id = args.id, name = "After", description = "Changed" })
        local after = assert(service:get({ component_id = args.id }))
        return { updated = result ~= nil, invalid = err ~= nil and errors.is(err, errors.INVALID),
            error = err and tostring(err), before = row.meta, after = after.meta }
    end
    return row.meta
end

return { run = run }
