local test = require("test")
local flow_artifact = require("flow_contract")
local json = require("json")

type Map = { [any]: any }

-- contains is true for a typed INVALID refusal whose message names the needle.
local function contains(value: any, needle: string): boolean
    if not errors.is(value, errors.INVALID) then return false end
    return tostring((value :: error):message()):find(needle, 1, true) ~= nil
end

local function document(): Map
    return {
        params = { title = "Package Flow" },
        nodes = {
            { id = "component-step", kind = "block", ref = "test:block", config = {
                component_id = "source-component",
            } },
            { id = "flow-step", kind = "flow", config = {
                flow_ref = { kind = "flow", id = "source-flow", version = 1 },
            } },
            { id = "value-step", kind = "block", ref = "test:block.value", config = {
                options = { threshold = 1 },
            } },
        },
        edges = {
            { id = "component-flow", source_id = "component-step", target_id = "flow-step",
                transform = { v = 1, mode = "expr", expr = "input.record" } },
        },
        notes = {},
        layout = { positions = {} },
    }
end

local function refs(): { Map }
    return {
        { key = "crm", kind = "component", node_id = "component-step", config_path = { "component_id" } },
        { key = "child", kind = "flow", node_id = "flow-step", config_path = { "flow_ref" } },
        { key = "threshold", kind = "value", node_id = "value-step", config_path = { "options", "threshold" } },
    }
end

local function build(doc: any?, manifest: any?): Map
    local artifact, err = flow_artifact.build({
        key = "kickside.test/package-flow", title = "Package Flow", version = 3,
        refs = manifest or refs(), document = doc or document(),
    })
    if err or not artifact then error("artifact build failed: " .. tostring(err)) end
    return artifact :: Map
end

local function bindings(): Map
    return {
        crm = { kind = "component", id = "destination-crm" },
        child = { kind = "flow", id = "destination-flow", version = 7 },
        threshold = { kind = "value", value = 9 },
    }
end

local function node(doc: Map, id: string): Map
    for _, item in ipairs(doc.nodes :: { Map }) do if item.id == id then return item end end
    error("missing node " .. id)
end

local function define_tests()
    test.describe("kickside.flow artifact", function()
        test.it("preserves empty retry policy objects in portable documents", function()
            local doc = document()
            node(doc, "component-step").retry_policy = {}
            local artifact = build(doc)
            test.eq(json.encode(node(artifact.document, "component-step").retry_policy), "{}")
        end)
        test.it("computes deterministic sha256 without the checksum field", function()
            local minimal, build_err = flow_artifact.build({
                key = "test/minimal", title = "Minimal", version = 1,
                refs = {}, document = { nodes = {}, edges = {} },
            })
            test.is_nil(build_err)
            test.eq((minimal :: Map).checksum, "4ce1aedd9e7c20928fd6eaabf6c05b684bb21f702e7ba36710f723e88873942d")

            local reordered: Map = {
                version = 1, title = "Minimal", refs = {}, kind = "flow",
                key = "test/minimal", document = { edges = {}, nodes = {} },
                api_version = "kickside.flow/v1", checksum = string.rep("f", 64),
            }
            local digest, digest_err = flow_artifact.checksum(reordered)
            test.is_nil(digest_err)
            test.eq(digest, (minimal :: Map).checksum)
            test.not_nil(select(1, flow_artifact.validate(minimal)))
        end)

        test.it("accepts legacy empty arrays without changing their checksum or JSON shape", function()
            local legacy: Map = {
                api_version = "kickside.flow/v1", key = "test/legacy", kind = "flow", title = "Legacy", version = 1,
                refs = {}, document = {
                    nodes = { { id = "step", kind = "block", config = {} } },
                    edges = { { id = "edge", source_id = "step", target_id = "step", transform = {} } },
                    layout = {}, params = {},
                }, checksum = string.rep("0", 64),
            }
            legacy.checksum = select(1, flow_artifact.checksum(legacy))
            local expected_checksum = legacy.checksum
            local checked, validation_err = flow_artifact.validate(legacy)
            test.is_nil(validation_err)
            test.eq((checked :: Map).checksum, expected_checksum)
            local document = (checked :: Map).document :: Map
            test.eq(json.encode(document.params), "[]")
            test.eq(json.encode(document.layout), "[]")
            test.eq(json.encode(((document.nodes :: { Map })[1]).config), "[]")
            test.eq(json.encode(((document.edges :: { Map })[1]).transform), "[]")
        end)

        test.it("accepts historical empty objects with the checksum computed as empty arrays", function()
            local artifact: Map = {
                api_version = "kickside.flow/v1", key = "test/historical-objects", kind = "flow", title = "Historical objects", version = 1,
                refs = {}, document = {
                    nodes = { { id = "step", kind = "block", config = {} } },
                    edges = { { id = "edge", source_id = "step", target_id = "step", transform = {} } },
                    layout = {}, params = {},
                }, checksum = string.rep("0", 64),
            }
            artifact.checksum = select(1, flow_artifact.checksum(artifact))
            local expected_checksum = artifact.checksum
            local document = artifact.document :: Map
            local node = (document.nodes :: { Map })[1]
            local edge = (document.edges :: { Map })[1]
            document.params = json.decode("{}")
            document.layout = table.create(0, 1)
            node.config = json.decode("{}")
            edge.transform = table.create(0, 1)
            test.eq(json.encode(document.params), "{}")
            test.eq(json.encode(document.layout), "{}")
            test.eq(json.encode(((document.nodes :: { Map })[1]).config), "{}")
            test.eq(json.encode(((document.edges :: { Map })[1]).transform), "{}")
            local checked, validation_err = flow_artifact.validate(artifact)
            test.is_nil(validation_err)
            test.eq((checked :: Map).checksum, expected_checksum)
        end)

        test.it("preserves declared empty object fields through artifact construction and validation", function()
            local artifact = build({
                params = {}, nodes = { { id = "empty-config", config = {} } }, notes = {},
                edges = { { id = "empty-transform", transform = {} } },
                layout = {},
            }, {})
            local document = artifact.document :: Map
            test.eq(json.encode(document.params), "{}")
            test.eq(json.encode((document.nodes :: { Map })[1].config), "{}")
            test.eq(json.encode((document.edges :: { Map })[1].transform), "{}")
            test.eq(json.encode(document.layout), "{}")
            local encoded = json.encode(artifact)
            local decoded = json.decode(encoded)
            local checked, validation_err = flow_artifact.validate(decoded)
            test.is_nil(validation_err)
            test.not_nil(checked)
        end)

        test.it("validates the one registry declaration shape and materializes a clean Flow", function()
            local artifact = build()
            local declaration = {
                id = "package:flow",
                kind = "registry.entry",
                meta = { type = "kickside.flow", title = "Package Flow" },
                data = { flow = artifact },
            }
            local validated, validation_err = flow_artifact.validate_declaration(declaration)
            test.is_nil(validation_err)
            test.eq((validated :: Map).key, artifact.key)

            local result, materialize_err = flow_artifact.materialize_declaration(declaration, bindings())
            test.is_nil(materialize_err)
            local materialized = result :: Map
            test.eq(materialized.key, artifact.key)
            test.eq(materialized.title, artifact.title)
            test.eq(materialized.version, artifact.version)
            test.eq(materialized.checksum, artifact.checksum)
            test.is_nil(materialized.refs)
            test.is_nil(materialized.bindings)
            local doc = materialized.document :: Map
            test.eq((doc.params :: Map).key, artifact.key)
            test.eq((node(doc, "component-step").config :: Map).component_id, "destination-crm")
            local nested = (node(doc, "flow-step").config :: Map).flow_ref :: Map
            test.eq(nested.kind, "flow")
            test.eq(nested.id, "destination-flow")
            test.eq(nested.version, 7)
            test.eq((((node(doc, "value-step").config :: Map).options :: Map).threshold), 9)
            test.eq(((((doc.edges :: { Map })[1]).transform :: Map).expr), "input.record")
            test.is_nil((doc.params :: Map).refs)
        end)

        test.it("rejects wrong declaration, checksum tampering, and binding sets", function()
            local artifact = build()
            local _, type_err = flow_artifact.validate_declaration({ meta = { type = "other" }, data = { flow = artifact } })
            test.is_true(contains(type_err, "kind must be registry.entry"))
            local _, meta_err = flow_artifact.validate_declaration({ kind = "registry.entry", meta = { type = "other" }, data = { flow = artifact } })
            test.is_true(contains(meta_err, "meta.type must be kickside.flow"))
            local _, location_err = flow_artifact.validate_declaration({ kind = "registry.entry", meta = { type = "kickside.flow" }, data = {} })
            test.is_true(contains(location_err, "data.flow is required"))

            local nodes = (artifact.document :: Map).nodes :: { Map }
            local config = nodes[1].config :: Map
            config.component_id = "tampered"
            local _, checksum_err = flow_artifact.validate(artifact)
            test.is_true(contains(checksum_err, "checksum does not match"))

            artifact = build()
            local missing = bindings(); missing.crm = nil
            local _, missing_err = flow_artifact.materialize(artifact, missing)
            test.is_true(contains(missing_err, "missing binding: crm"))
            local extra = bindings(); extra.unused = { kind = "value", value = true }
            local _, extra_err = flow_artifact.materialize(artifact, extra)
            test.is_true(contains(extra_err, "unexpected binding: unused"))
            local wrong = bindings(); wrong.child = { kind = "flow", id = "destination-flow" }
            local _, wrong_err = flow_artifact.materialize(artifact, wrong)
            test.is_true(contains(wrong_err, "exact {kind='flow', id, version}"))

            local conflicting_key = build()
            local conflicting_document = conflicting_key.document :: Map
            local conflicting_params = conflicting_document.params :: Map
            conflicting_params.key = "other/key"
            conflicting_key.checksum = select(1, flow_artifact.checksum(conflicting_key))
            local _, key_err = flow_artifact.materialize(conflicting_key, bindings())
            test.is_true(contains(key_err, "document.params.key conflicts"))
        end)

        test.it("rejects unresolved, overlapping, array-index, and conflicting refs", function()
            local missing_path = refs(); missing_path[1].config_path = { "not_there" }
            local source = build(document(), missing_path)
            local _, unresolved_err = flow_artifact.materialize(source, bindings())
            test.is_true(contains(unresolved_err, "is unresolved"))

            local overlapping = refs()
            overlapping[#overlapping + 1] = { key = "options", kind = "value", node_id = "value-step", config_path = { "options" } }
            local _, overlap_err = flow_artifact.build({
                key = "test/overlap", kind = "flow", title = "Overlap", version = 1,
                refs = overlapping, document = document(),
            })
            test.is_true(contains(overlap_err, "ref targets overlap"))

            local indexed = refs(); indexed[3].config_path = { "options", "0" }
            local _, index_err = flow_artifact.build({
                key = "test/index", title = "Index", version = 1, refs = indexed, document = document(),
            })
            test.is_true(contains(index_err, "must not address array indexes"))
            test.eq(index_err:details().path, "refs[3].config_path")

            local conflicting = refs()
            conflicting[#conflicting + 1] = { key = "crm", kind = "value", node_id = "value-step", config_path = { "options", "threshold" } }
            local _, conflict_err = flow_artifact.build({
                key = "test/conflict", title = "Conflict", version = 1, refs = conflicting, document = document(),
            })
            test.is_true(contains(conflict_err, "declares conflicting kinds"))
        end)

        test.it("refuses slot dialects and cyclic artifacts or bindings", function()
            local placeholder = document()
            local placeholder_config = ((placeholder.nodes :: { Map })[1]).config :: Map
            placeholder_config.component_id = "${crm}"
            local _, placeholder_err = flow_artifact.build({
                key = "test/placeholder", title = "Placeholder", version = 1, refs = refs(), document = placeholder,
            })
            test.is_true(contains(placeholder_err, "forbidden ${slot}"))

            local slot = document()
            local slot_config = ((slot.nodes :: { Map })[1]).config :: Map
            slot_config.component_id = { kind = "slot", key = "crm" }
            local _, slot_err = flow_artifact.build({
                key = "test/slot", title = "Slot", version = 1, refs = refs(), document = slot,
            })
            test.is_true(contains(slot_err, "forbidden {kind=slot}"))

            local cyclic = document()
            local cyclic_params = cyclic.params :: Map
            cyclic_params.self = cyclic
            local _, cycle_err = flow_artifact.build({
                key = "test/cycle", title = "Cycle", version = 1, refs = refs(), document = cyclic,
            })
            test.is_true(contains(cycle_err, "cyclic table"))

            local cyclic_value: Map = {}; cyclic_value.self = cyclic_value
            local cyclic_bindings = bindings(); cyclic_bindings.threshold = { kind = "value", value = cyclic_value }
            local _, binding_cycle_err = flow_artifact.materialize(build(), cyclic_bindings)
            test.is_true(contains(binding_cycle_err, "cyclic table"))
        end)

        test.it("closes the artifact schema around key, lowercase flow, and one refs manifest", function()
            local artifact = build()
            artifact.portable_key = artifact.key
            artifact.checksum = select(1, flow_artifact.checksum(artifact))
            local _, old_key_err = flow_artifact.validate(artifact)
            test.is_true(contains(old_key_err, "flow.portable_key is not declared"))
            test.eq(old_key_err:details().path, "flow.portable_key")

            artifact = build(); artifact.kind = "Flow"; artifact.checksum = select(1, flow_artifact.checksum(artifact))
            local _, kind_err = flow_artifact.validate(artifact)
            test.is_true(contains(kind_err, "kind must be flow"))

            artifact = build(); artifact.slots = {}; artifact.checksum = select(1, flow_artifact.checksum(artifact))
            local _, slots_err = flow_artifact.validate(artifact)
            test.is_true(contains(slots_err, "flow.slots is not declared"))
        end)
    end)
end

return { run = function(options) return test.run_cases(define_tests)(options) end }
