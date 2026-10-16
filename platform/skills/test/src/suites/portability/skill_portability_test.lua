-- Raw SHA-addressed parts preserve binary bytes during skill import and export.

local test = require("test")
local component = require("component")
local fs = require("fs")
local json = require("json")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local hash = require("hash")
local bundle_store = require("bundle_store")
local pio = require("portable_io")
local test_identity = require("test_identity")

local PORT = "kickside.skills.portability"
local SKILL_IMPL = "kickside.skills:skill"
local SCRATCH = "app:scratch"
local OWNER = "skill_port_owner"

local function register_skill(args)
    local svc, svc_err = component.get_service()
    if svc_err or not svc then return nil, svc_err end
    return svc:register({component_id = args.component_id, impl_id = SKILL_IMPL,
        meta = {title = "Imported Skill", comment = "Imported procedure.", class = "kickside.skills", status = "active"}})
end

local function stage_bundle(storage: any, path: string, b1: string, b2: string)
    local base = path .. "/data/"
    local s1, s2 = hash.sha256(b1), hash.sha256(b2)
    local ok, err = pio.ensure_dir(storage, path .. "/data/files")
    test.is_nil(err, tostring(err)); test.is_true(ok)
    for _, part in ipairs({{s1, b1}, {s2, b2}}) do
        local written, write_err = storage:writefile(base .. "files/" .. part[1], part[2])
        test.is_nil(write_err, tostring(write_err)); test.is_true(written)
    end
    local written, write_err = pio.write_jsonl(storage, base .. "versions.jsonl", {
        {version = 1, body = "V1 BODY", name = "s", description = "d",
            files = {{sha256 = s1, path = "v1.md", mime_type = "text/markdown", kind = "asset", size_bytes = #b1}}, file_count = 1, bundle_size = #b1},
        {version = 2, body = "V2 BODY", name = "s", description = "d",
            files = {{sha256 = s2, path = "v2.md", mime_type = "text/markdown", kind = "asset", size_bytes = #b2}}, file_count = 1, bundle_size = #b2},
    })
    test.is_nil(write_err, tostring(write_err)); test.is_true(written)
    return s1, s2
end

local function define_tests()
    test.describe("skill portability import", function()
        test.it("reconstructs bundles from raw part files, bytes verbatim", function()
            local db = sql.get("app:db")
            test.not_nil(db)
            if not db then error("app:db is unavailable") end
            local dst = uuid_v4()
            local owner_exec, owner_id = test_identity.executor(OWNER)
            db:release()
            local registered, register_err = owner_exec:call("app:skill_portability_register", {component_id = dst})
            test.is_nil(register_err, tostring(register_err)); test.is_true(registered.success)
            -- binary-ish payloads (NUL + high bytes) prove the part files are raw, not
            -- base64-lossy; the fs + KXB1 container are byte-transparent.
            local b1 = "V1\0\255\254 " .. string.rep("a", 700)
            local b2 = "V2 " .. string.rep("b", 1300) .. "\0tail"
            local path = "skillport/" .. dst
            local storage = fs.get(SCRATCH)
            test.not_nil(storage)
            local s1, s2 = stage_bundle(storage, path, b1, b2)

            local dres = owner_exec
                :with_context({ component_id = dst })
                :call(PORT .. ":import_into_func", {
                    storage_id = SCRATCH, path = path,
                    id_map = { components = {}, rows = {} },
                })
            test.not_nil(dres)
            test.is_true(dres.success, "import_into failed: " .. tostring(dres and dres.error))

            local got1, read1_err = bundle_store.read(dst, s1)
            local got2, read2_err = bundle_store.read(dst, s2)
            test.is_nil(read1_err, tostring(read1_err)); test.is_nil(read2_err, tostring(read2_err))
            test.eq(got1, b1)
            test.eq(got2, b2)
            db = sql.get("app:db")
            test.not_nil(db)
            local rows, rows_err = db:query("SELECT COUNT(*) AS n FROM kickside_uploads WHERE uuid=$1", {dst})
            test.is_nil(rows_err, tostring(rows_err)); test.eq(tonumber(rows[1].n), 0)
            db:release()
            local exported, export_err = owner_exec:with_context({component_id = dst}):call(PORT .. ":export_func", {storage_id = SCRATCH, path = path .. "-export"})
            test.is_nil(export_err, tostring(export_err)); test.is_true(exported.success, tostring(exported.error))
            test.eq(exported.manifest.counts.files, 2)
            for _, part in ipairs({{s1, b1}, {s2, b2}}) do
                local bytes, part_err = storage:readfile(path .. "-export/data/files/" .. part[1])
                test.is_nil(part_err, tostring(part_err)); test.eq(bytes, part[2])
            end
            local deleted, delete_err = owner_exec:call("kickside.skills:skill_delete", {skill_id = dst})
            test.is_nil(delete_err, tostring(delete_err)); test.eq(deleted.skill_id, dst)
            for _, suffix in ipairs({"", "-export"}) do
                for _, rel in ipairs({"versions.jsonl", "files/" .. s1, "files/" .. s2}) do
                    local removed, remove_err = storage:remove(path .. suffix .. "/data/" .. rel)
                    test.is_nil(remove_err, tostring(remove_err)); test.is_true(removed)
                end
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end, register_skill = register_skill }
