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
    test.describe("Workflow publish", function()
        test.it("folds, compiles, and allocates version 1 then 2", function()
            local id = wid()
            seed_valid(id)

            local r1 = select(1, version_publish.publish(id, "tester"))
            test.is_true((r1 :: Map).ok, tostring((r1 :: Map).errors and (r1 :: Map).errors[1] and ((r1 :: Map).errors[1] :: Map).message))
            test.eq((r1 :: Map).version, 1)
            test.is_true((r1 :: Map).def_seq > 0)

            local r2 = select(1, version_publish.publish(id, "tester"))
            test.is_true((r2 :: Map).ok)
            test.eq((r2 :: Map).version, 2)
        end)

        test.it("hashes equal-length different documents by content", function()
            local id = wid()
            seed_valid(id)
            local _, first_edit_err = workflow.apply(id, {
                cmd(C.NODE_UPDATE, { id = "f", title = "Alpha" }),
            }, "tester")
            test.is_nil(first_edit_err)
            local first = select(1, version_publish.publish(id, "tester")) :: Map
            test.is_true(first.ok)

            local _, second_edit_err = workflow.apply(id, {
                cmd(C.NODE_UPDATE, { id = "f", title = "Bravo" }),
            }, "tester")
            test.is_nil(second_edit_err)
            local second = select(1, version_publish.publish(id, "tester")) :: Map
            test.is_true(second.ok)

            local first_version = select(1, version_read.get(id, first.version)) :: Map
            local second_version = select(1, version_read.get(id, second.version)) :: Map
            local first_json = select(1, json.encode(first_version.document)) :: string
            local second_json = select(1, json.encode(second_version.document)) :: string
            test.eq(#first_json, #second_json)
            test.is_true(first_json ~= second_json)
            test.eq(#tostring(first.hash), 64)
            test.eq(#tostring(second.hash), 64)
            test.is_true(first.hash ~= second.hash)
        end)

        test.it("refuses an unbound Block config field until it is set", function()
            with_sink_catalog(function(sink_versions: any)
                local id = wid()
                local _, apply_err = workflow.apply(id, {
                    cmd(C.NODE_ADD, { id = "entry", kind = "block", ref = "app:block.engine_linear" }),
                    cmd(C.NODE_ADD, { id = "knowledge_sink", kind = "block", ref = "test.blocks:sink", config = {} }),
                    cmd(C.EDGE_ADD, { id = "to_sink", source_id = "entry", target_id = "knowledge_sink" }),
                }, "tester")
                test.is_nil(apply_err)

                local refused = select(1, sink_versions.publish(id, "tester")) :: Map
                test.is_false(refused.ok)
                local first = ((refused.errors :: { Map })[1] :: Map)
                test.eq(first.code, "node_config_missing")
                test.contains(tostring(first.message), "knowledge_sink")
                test.contains(tostring(first.message), "kb_id")
                test.contains(tostring(first.message), "set it before publishing")

                local _, bind_err = workflow.apply(id, {
                    cmd(C.NODE_UPDATE, { id = "knowledge_sink", config = {
                        kb_id = "knowledge-base-1",
                    } }),
                }, "tester")
                test.is_nil(bind_err)
                local published = select(1, sink_versions.publish(id, "tester")) :: Map
                test.is_true(published.ok)
                local frozen = select(1, version_read.get(id, published.version)) :: Map
                test.eq((((frozen.document :: Map).nodes :: { Map })[2]).kind, "block")
            end)
        end)

        test.it("appends a version.published marker referencing the folded head as def_seq", function()
            local id = wid()
            seed_valid(id)
            local r = select(1, version_publish.publish(id, "tester"))
            local markers = marker_events(id)
            test.eq(#markers, 1)
            test.eq((markers[1] :: Map).body.version, 1)
            -- def_seq is the folded head; the marker sits one seq later.
            test.eq((markers[1] :: Map).body.def_seq, (r :: Map).def_seq)
            local state = select(1, workflow.state(id))
            test.eq((state :: Map).head_seq, (r :: Map).def_seq + 1)
        end)

        test.it("hashes the frozen publication document with canonical JSON", function()
            local id = wid()
            seed_valid(id)
            local published = select(1, version_publish.publish(id, "tester")) :: Map
            test.is_true(published.ok)
            local expected, hash_err = canonical_json.hash(stored_document(id, published.version))
            test.is_nil(hash_err)
            test.eq(published.hash, expected)
            local markers = marker_events(id)
            test.eq((markers[1] :: Map).body.hash, expected)
        end)


        test.it("the published document reflects state at def_seq and later edits do not change it", function()
            local id = wid()
            seed_valid(id)
            local r = select(1, version_publish.publish(id, "tester"))
            local before = select(1, version_read.get(id, 1))
            local published_nodes = #((before :: Map).document.nodes)

            -- an apply AFTER publish must not mutate the frozen v1 document.
            workflow.apply(id, { cmd(C.NODE_ADD, { id = "f2", kind = "block", ref = "m:do2" }) }, "tester")
            local after = select(1, version_read.get(id, 1))
            test.eq(#((after :: Map).document.nodes), published_nodes)
            -- def_seq equals the head the document was folded at (not a later seq).
            test.eq((after :: Map).def_seq, (r :: Map).def_seq)
        end)

        test.it("derives the boundary interface from virtual boundary nodes", function()
            local id = wid()
            seed_with_boundary_interface(id)
            local state = select(1, workflow.state(id))
            test.eq((((state :: Map).interface.input_schema :: Map).required :: { any })[1], "lead_id")
            local start = find_node((state :: Map).nodes, "start")
            test.is_true((start :: Map).pinned)
            test.eq(((start :: Map).boundary :: Map).schema_key, "input_schema")
            local r = select(1, version_publish.publish(id, "tester"))
            test.is_true((r :: Map).ok)

            local v = select(1, version_read.get(id, 1))
            test.eq((((v :: Map).interface.output_schema :: Map).properties :: Map).score.type, "number")
            test.eq((((v :: Map).interface.error_schema :: Map).properties :: Map).message.type, "string")

            local db = select(1, store.open_db())
            local summary = select(1, store.latest_published_interface(db, id))
            ; (db :: any):release()
            test.eq((summary :: Map).version, 1)
            test.eq(((summary :: Map).interface :: Map).input_count, 2)
            test.eq(((summary :: Map).interface :: Map).output_count, 1)
            test.eq(((summary :: Map).interface :: Map).error_count, 1)
            test.eq((((summary :: Map).interface :: Map).input_keys :: { any })[1], "lead_id")
        end)

        test.it("keeps document and latest-published interface derivation on the shared store projection", function()
            local id = wid()
            seed_with_boundary_interface(id)

            local state = select(1, workflow.state(id))
            local from_document = store.interface_from_nodes((state :: Map).nodes)
            test.not_nil(from_document)
            test.eq((((from_document :: Map).input_schema :: Map).properties :: Map).lead_id.type, "string")

            local published = select(1, version_publish.publish(id, "tester"))
            test.is_true((published :: Map).ok)
            local db = select(1, store.open_db())
            local latest = select(1, store.latest_published_interface(db, id))
            ; (db :: any):release()
            local from_version = (latest :: Map).interface :: Map
            test.eq(((from_version.output_schema :: Map).properties :: Map).score.type, "number")
            test.eq(((from_version.error_schema :: Map).properties :: Map).message.type, "string")
            test.eq(from_version.input_count, (from_document :: Map).input_count)
        end)

        test.it("classifies only the specified interface changes as breaking", function()
            local prior = {
                input_schema = { type = "object", required = { "lead_id" }, properties = {
                    lead_id = { type = "string" }, source = { type = "string" },
                } },
                output_schema = { type = "object", properties = { score = { type = "number" } } },
                error_schema = { type = "object", properties = { message = { type = "string" } } },
            }
            local breaking = {
                input_schema = { type = "object", required = { "lead_id", "region" }, properties = {
                    lead_id = { type = "number" }, region = { type = "string" },
                } },
                output_schema = { type = "object", properties = {} },
                error_schema = { type = "object", properties = {} },
            }
            local changes = version_read.compatibility_changes(prior, breaking)
            test.eq(#changes, 5)
            test.eq((changes :: { Map })[1].kind, "start_required_added")

            local nonbreaking = {
                input_schema = { type = "object", required = { "lead_id" }, properties = {
                    lead_id = { type = "string" }, source = { type = "string" }, optional = { type = "string" },
                } },
                output_schema = { type = "object", properties = { score = { type = "number" }, detail = { type = "string" } } },
                error_schema = { type = "object", properties = { message = { type = "string" }, code = { type = "string" } } },
            }
            test.eq(#version_read.compatibility_changes(prior, nonbreaking), 0)
        end)

        test.it("publishes a new interface without changing the exact prior revision", function()
            local id = wid()
            seed_with_boundary_interface(id)
            test.is_true((select(1, version_publish.publish(id, "tester")) :: Map).ok)

            local _, uerr = workflow.apply(id, { cmd(C.NODE_UPDATE, { id = "start", config = {
                input_schema = {
                    type = "object", required = { "lead_id", "region" },
                    properties = { lead_id = { type = "string" }, source = { type = "string" }, region = { type = "string" } },
                },
            } }) }, "tester")
            test.is_nil(uerr)
            local published = select(1, version_publish.publish(id, "tester"))
            test.is_true((published :: Map).ok)
            test.eq((published :: Map).version, 2)

            local v1 = select(1, version_read.get(id, 1)) :: Map
            local v2 = select(1, version_read.get(id, 2)) :: Map
            local v1_input = ((v1.interface :: Map).input_schema :: Map)
            local v2_input = ((v2.interface :: Map).input_schema :: Map)
            test.is_nil(((v1_input.properties :: Map).region))
            test.eq(((v2_input.properties :: Map).region :: Map).type, "string")
            test.eq(#(v1_input.required :: { any }), 1)
            test.eq(#(v2_input.required :: { any }), 2)
        end)

        test.it("exposes Finished and Failed Flow ports with or without a child interface", function()
            local child = wid()
            seed_with_boundary_interface(child)
            local published = select(1, version_publish.publish(child, "tester"))
            test.is_true((published :: Map).ok)

            local parent = wid()
            workflow.apply(parent, {
                cmd(C.NODE_ADD, { id = "t", kind = "block", ref = "app:block.engine_linear" }),
                cmd(C.NODE_ADD, { id = "call", kind = "flow", config = { flow_ref = {
                    kind = "flow", id = child, version = (published :: Map).version,
                } } }),
                cmd(C.NODE_ADD, { id = "unresolved", kind = "flow", config = { flow_ref = {
                    kind = "flow", id = "missing-child", version = 1,
                } } }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "t", target_id = "call" }),
            }, "tester")
            local state = select(1, workflow.state(parent))
            local call = find_node((state :: Map).nodes, "call")
            test.not_nil(call)
            test.eq((((call :: Map).child_interface :: Map).output_schema :: Map).properties.score.type, "number")
            -- Decoration materializes the resolved child contract onto the node
            -- itself, so every consumer of node.input_schema/output_schema sees a
            -- bound Flow step the same way it sees a block step.
            test.eq((((call :: Map).input_schema :: Map).required :: { any })[1], "lead_id")
            test.eq((((call :: Map).input_schema :: Map).properties :: Map).lead_id.type, "string")
            test.eq((((call :: Map).output_schema :: Map).properties :: Map).score.type, "number")
            local ports = (call :: Map).ports :: { Map }
            test.eq(tostring(ports[1].id), "result")
            test.eq(tostring((ports[1].schema :: Map).properties.score.type), "number")
            test.eq(tostring(ports[2].id), "failed")
            test.eq(tostring((ports[2].schema :: Map).properties.message.type), "string")

            local unresolved = find_node((state :: Map).nodes, "unresolved") :: Map
            local unresolved_ports = unresolved.ports :: { Map }
            test.eq(#unresolved_ports, 1)
            test.eq(tostring(unresolved_ports[1].id), "result")
            test.eq(tostring(unresolved_ports[1].label), "Finished")
            test.is_true(((unresolved_ports[1].schema :: Map).additionalProperties) == true)
        end)

        test.it("refuses an invalid graph with structured errors and allocates nothing", function()
            local id = wid()
            -- Structural shape is accepted by definition CQRS but its required
            -- authored predicate is enforced by the compiler at publish time.
            local _, apply_err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "condition", kind = "branch", config = {} }),
            }, "tester")
            test.is_nil(apply_err)
            local r = select(1, version_publish.publish(id, "tester"))
            test.is_false((r :: Map).ok)
            local codes: { [string]: boolean } = {}
            for _, e in ipairs((r :: Map).errors) do codes[tostring((e :: Map).code)] = true end
            test.is_true(codes.branch_predicate_missing)
            test.eq(select(1, version_read.head(id)), 0)
        end)

        test.it("the shared size cap is enforced at apply, so an oversize doc never reaches a version", function()
            local id = wid()
            seed_valid(id)
            -- a param whose value blows past the 256KB default cap is rejected at apply
            -- (the earlier gate); the same cap guards publish as defense in depth.
            local _, aerr = workflow.apply(id, { cmd(C.PARAM_SET, { key = "big", value = string.rep("x", 300 * 1024) }) }, "tester")
            test.contains(tostring(aerr), "too_large")
            -- the workflow still publishes cleanly at its capped size.
            local r = select(1, version_publish.publish(id, "tester"))
            test.is_true((r :: Map).ok)
        end)
    end)

end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
