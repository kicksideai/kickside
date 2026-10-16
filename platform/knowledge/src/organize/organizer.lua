local contract = require("contract")
local security = require("security")
local upload_query_repo = require("upload_query_repo")
local ingest_upload = require("ingest_upload")
local planner = require("planner")

-- Organize orchestrator (the hex core): given a set of uploaded file references, it
--   1. collects the caller's owned uploads (refs + filenames; no content read),
--   2. asks the fast planner to name the KB and assign a title/category per file,
--   3. creates the KB through the knowledge_bases contract (KB owns embedding),
--   4. ingests every file by reference through the canonical upload ingest core
--      (the same path the upload-complete hook and ingest-upload endpoint use).
-- It touches no file content itself — the KB pulls content via its provider.
local KB_REGISTRY = "kickside.knowledge:knowledge_bases"

local M = {}

function M.organize(upload_ids: { any }, opts: any): (any, string?)
    opts = opts or {}
    if type(upload_ids) ~= "table" or #upload_ids == 0 then return nil, "upload_ids is required" end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil, "authentication required" end
    local uid = tostring(actor:id())

    -- Collect owned uploads as references (filename for planning; record for ingest).
    local files: { any } = {}
    local recs: { [string]: any } = {}
    for _, id in ipairs(upload_ids) do
        local sid = tostring(id)
        local rec = upload_query_repo.get(sid)
        if rec and tostring(rec.actor_id) == uid then
            recs[sid] = rec
            local meta = type(rec.metadata) == "table" and (rec.metadata :: { [string]: any }) or {}
            files[#files + 1] = { upload_id = sid, filename = meta.filename or meta.name or sid }
        end
    end
    if #files == 0 then return nil, "no accessible uploads" end

    local plan, perr = planner.plan(files)
    if not plan then return nil, perr end

    -- Create the KB. embedding_model defaults to the configured class:embed; the KB
    -- engine owns chunking + embedding of whatever content the files carry.
    local svc, derr = contract.get(KB_REGISTRY)
    if derr or not svc then return nil, "knowledge registry unavailable: " .. tostring(derr) end
    local inst, oerr = (svc :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not inst then return nil, "knowledge registry open failed: " .. tostring(oerr) end

    local created, cerr = inst:create({
        name = plan.kb_name,
        description = plan.kb_description,
        kb_type = (type(opts.kb_type) == "string" and (opts.kb_type :: string) ~= "") and opts.kb_type or "document",
        embedding_model = (type(opts.embedding_model) == "string" and (opts.embedding_model :: string) ~= "") and opts.embedding_model or "class:embed",
    })
    local kb_id = created and (created.component_id or created.id)
    if cerr or not kb_id then return nil, "kb create failed: " .. tostring(cerr) end

    -- Ingest every file by reference; the assigned title/category ride as metadata.
    local results: { any } = {}
    local queued = 0
    for _, f in ipairs(files) do
        local rec = recs[f.upload_id]
        local a = plan.assignments[f.upload_id]
        local metadata: { [string]: any } = {}
        if type(rec.metadata) == "table" then
            for k, v in pairs(rec.metadata :: { [string]: any }) do metadata[k] = v end
        end
        metadata.title = a.title
        metadata.category = a.category

        local r, ierr = ingest_upload.ingest(kb_id, f.upload_id, {
            mime_type = rec.mime_type,
            size = rec.size,
            metadata = metadata,
        })
        local ok = r ~= nil and not ierr
        if ok then queued = queued + 1 end
        results[#results + 1] = {
            upload_id = f.upload_id, success = ok,
            title = a.title, category = a.category, error = ierr,
        }
    end

    return {
        success = true,
        kb_id = kb_id,
        kb_name = plan.kb_name,
        description = plan.kb_description,
        queued = queued,
        total = #files,
        files = results,
    }
end

return M
