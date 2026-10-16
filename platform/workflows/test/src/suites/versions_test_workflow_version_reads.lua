-- Version-plane fixtures against the migrated schema. Publish folds the definition
-- read model, compiles it, allocates the next version atomically, and appends the
-- non-projected version.published marker; an invalid graph is refused with structured
-- errors and the oversize document is capped.

local test = require("test")
local uuid_v4 = require("uuid").v4
local json = require("json")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local store = require("store")
local types = require("types")
local canonical_json = require("canonical_json")
local blocks = require("block_catalog")

type Map = { [string]: any }

local C = types.COMMAND

local function cmd(ctype: string, body: any): any
    if ctype == C.NODE_ADD and type(body) == "table" then
        local node = body :: any
        if node.kind == "block" and type(node.ref) ~= "string" then node.ref = "app:block.engine_linear" end
    end
    return { type = ctype, body = body }
end

local function wid(): string
    return uuid_v4()
end

-- A minimal publishable Start-less Flow with two real executable functions.
local function block_body(id: string): Map
    return { id = id, kind = "block", ref = "app:block.engine_linear", title = "Prepare" }
end

local function seed_valid(id: string)
    workflow.apply(id, {
        cmd(C.NODE_ADD, block_body("t")),
        cmd(C.NODE_ADD, { id = "f", kind = "block", ref = "app:block.engine_linear", title = "Do" }),
        cmd(C.EDGE_ADD, { id = "e", source_id = "t", target_id = "f" }),
    }, "tester")
end

local function seed_with_boundary_interface(id: string)
    workflow.apply(id, {
        cmd(C.NODE_ADD, { id = "start", kind = "start", title = "Start", config = {
            input_schema = {
                type = "object",
                required = { "lead_id" },
                properties = { lead_id = { type = "string" }, source = { type = "string" } },
            },
        } }),
        cmd(C.NODE_ADD, { id = "worker", kind = "block", ref = "app:block.engine_item_or_fail", title = "Score" }),
        cmd(C.NODE_ADD, { id = "finish", kind = "finish", title = "Finish", config = {
            output_schema = {
                type = "object",
                required = { "score" },
                properties = { score = { type = "number" } },
            },
        } }),
        cmd(C.NODE_ADD, { id = "error", kind = "error", title = "Error", config = {
            error_schema = {
                type = "object",
                required = { "message" },
                properties = { message = { type = "string" } },
            },
        } }),
        cmd(C.EDGE_ADD, { id = "e1", source_id = "start", source_port = "out", target_id = "worker" }),
        cmd(C.EDGE_ADD, { id = "e2", source_id = "worker", target_id = "finish", target_port = "in" }),
        cmd(C.EDGE_ADD, { id = "e3", source_id = "worker", source_port = "failed", target_id = "error", target_port = "in" }),
    }, "tester")
end

local SINK_KIND = {
    ["test.blocks:sink"] = {
        id = "test.blocks:sink",
        kind = "block",
        config_schema = {
            type = "object",
            required = { "kb_id" },
            properties = { kb_id = { type = "string" } },
        },
        ports = { { id = "result", direction = "out" } },
        execution = { kind = "function", function_id = "m:sink" },
        declaration = {
            id = "test.blocks:sink", kind = "registry.entry", meta = { type = "kickside.block" },
            data = { block = {
                api_version = "kickside.block/v1",
                input = { type = "object", additionalProperties = true },
                config = { type = "object", required = { "kb_id" }, properties = { kb_id = { type = "string" } } },
                output = { type = "object", additionalProperties = true },
                ports = { { id = "result", direction = "out" } },
                execution = { kind = "function", function_id = "m:sink" },
            } },
        },
    },
}

local function with_sink_catalog(fn: any)
    local sink_versions = version_publish.new({ block_catalog = function()
        local catalog, catalog_err = blocks.catalog()
        if catalog_err or type(catalog) ~= "table" then return catalog, catalog_err end
        local copied: Map = {}
        for id, declaration in pairs(catalog :: Map) do copied[id] = declaration end
        for id, declaration in pairs(SINK_KIND) do copied[id] = declaration end
        return copied, nil
    end })
    fn(sink_versions)
end

local function marker_events(id: string): { any }
    local events = select(1, workflow.events(id, 0))
    local out: { any } = {}
    for _, ev in ipairs(type(events) == "table" and events or {}) do
        if tostring((ev :: any).type) == types.EVENT.VERSION_PUBLISHED then out[#out + 1] = ev end
    end
    return out
end

local function stored_document(id: string, version: number): any
    local db = select(1, store.open_db())
    test.not_nil(db)
    local rows, err = (db :: any):query(
        "SELECT document FROM workflow_versions WHERE workflow_id = $1 AND version = $2", { id, version })
    ;(db :: any):release()
    test.is_nil(err)
    test.not_nil(rows[1])
    local document, decode_err = json.decode(tostring(rows[1].document))
    test.is_nil(decode_err)
    return document
end

local function find_node(nodes: any, id: string): Map?
    for _, node in ipairs(type(nodes) == "table" and (nodes :: { any }) or {}) do
        if tostring((node :: Map).id) == id then return node :: Map end
    end
    return nil
end

local function define_tests()

    test.describe("Workflow version reads", function()
        test.it("get returns the frozen document, commands, and allowlist", function()
            local id = wid()
            seed_valid(id)
            version_publish.publish(id, "tester")
            local v = select(1, version_read.get(id, 1))
            test.not_nil(v)
            test.eq((v :: Map).version, 1)
            test.is_true(#((v :: Map).compiled_commands) > 0)
            -- every compiled CREATE_NODE carries the frozen version.
            for _, c in ipairs((v :: Map).compiled_commands) do
                if tostring((c :: Map).type) == "CREATE_NODE" then
                    test.eq(tonumber(((c :: Map).payload.metadata).version), 1)
                end
            end
            test.is_true(#((v :: Map).allowlist.tools) >= 1)
        end)

        test.it("diffs immutable versions by graph identity and reuses interface compatibility changes", function()
            local id = wid()
            seed_with_boundary_interface(id)
            local first = select(1, version_publish.publish(id, "tester")) :: Map
            test.is_true(first.ok)
            local _, edit_err = workflow.apply(id, {
                cmd(C.NODE_UPDATE, { id = "worker", title = "Score v2" }),
            }, "tester")
            test.is_nil(edit_err)
            local second = select(1, version_publish.publish(id, "tester")) :: Map
            test.is_true(second.ok)
            local diff, diff_err = version_read.diff(id, first.version, second.version)
            test.is_nil(diff_err)
            test.eq((diff :: Map).from_version, first.version)
            test.eq(((diff :: Map).graph :: Map).nodes.changed[1].id, "worker")
            test.eq(#(((diff :: Map).interface :: Map).changes), 0)
        end)

        test.it("list returns versions newest first", function()
            local id = wid()
            seed_valid(id)
            version_publish.publish(id, "tester")
            version_publish.publish(id, "tester")
            local list = select(1, version_read.list(id))
            test.eq(#(list :: { any }), 2)
            test.eq((list :: { any })[1].version, 2)
            test.eq((list :: { any })[2].version, 1)
        end)

        test.it("returns the Block catalog's typed failure and publishes nothing", function()
            local id = wid()
            seed_valid(id)
            local unavailable = version_publish.new({ block_catalog = function()
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "block catalog unavailable" })
            end })
            local result, err = unavailable.publish(id, "tester")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(#(select(1, version_read.list(id)) :: { any }), 0)
            test.eq(#marker_events(id), 0)
        end)

        test.it("keeps version allocation protected by a workflow/version unique key", function()
            local id = wid()
            seed_valid(id)
            local first = select(1, version_publish.publish(id, "tester"))
            test.is_true((first :: Map).ok)

            local db = select(1, store.open_db())
            test.not_nil(db)
            local _, ierr = (db :: any):execute(
                "INSERT INTO " .. types.TABLES.VERSIONS ..
                " (workflow_id, version, def_seq, document, compiled_commands, allowlist, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                { id, 1, 0, "{}", "[]", "{}", "tester", "2026-01-01T00:00:00Z" })
            ; (db :: any):release()
            test.not_nil(ierr)
            test.contains(tostring(ierr):lower(), "unique")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
