-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local block_catalog = require("block_catalog")
local version_read = require("version_read")
local workflow = require("workflow")
local version_publish = require("version_publish")
local compiler = require("compiler")
local flow_contract = require("flow_contract")
local blocks = require("blocks")

type Map = { [string]: any }

local function call(actor: any, scope: any, tool: string, args: Map): Map
    local result, err = funcs.new():with_actor(actor):with_scope(scope):call(tool, args)
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    return result :: Map
end

local function run()
    test.describe("Block schema publication", function()
        test.it("encodes shared empty schema objects in every catalog field", function()
            local descriptor, err = block_catalog.resolve("app:block.engine_public_step")
            test.is_nil(err)
            local row = descriptor :: Map
            test.is_true(row.config == row.config_schema)
            local encoded, encode_err = json.encode(row)
            test.is_nil(encode_err)
            local decoded = json.decode(encoded) :: Map
            test.eq(json.encode((decoded.config :: Map).properties), "{}")
            test.eq(json.encode((decoded.config_schema :: Map).properties), "{}")
            test.eq(json.encode((((decoded.declaration :: Map).data :: Map).block :: Map).config), json.encode(row.config))
        end)

        test.it("publishes an empty-properties Block through the management tool", function()
            local actor = security.new_actor("schema-author-" .. uuid.v4(), {})
            local policy, policy_err = security.policy("app:workflows_suite_policy")
            test.is_nil(policy_err)
            local scope, scope_err = security.new_scope({ policy })
            test.is_nil(scope_err)
            local read = call(actor, scope, "kickside.workflows.agent:flows_read", {
                action = "catalog", catalog_id = "blocks:app:block.engine_public_step",
            })
            local item = read.item :: Map
            local item_json, item_json_err = json.encode(item)
            test.is_nil(item_json_err)
            local encoded = json.decode(item_json) :: Map
            local created = call(actor, scope, "kickside.workflows.agent:flows_manage", { action = "create", title = "Empty settings" })
            local id = tostring((created.workflow :: Map).id)
            call(actor, scope, "kickside.workflows.agent:flows_manage", { action = "apply", id = id, commands = {
                { type = "node.add", body = { id = "step", kind = "block", ref = item.ref, config = json.decode("{}") } },
            } })
            local published = call(actor, scope, "kickside.workflows.agent:flows_manage", { action = "publish", id = id })
            test.is_true(published.success)
            test.eq(published.version, 1)
            test.eq(json.encode((encoded.config :: Map).properties), "{}")
            test.eq(json.encode((encoded.config_schema :: Map).properties), "{}")
            local version, version_err = version_read.get(id, published.version)
            test.is_nil(version_err)
            test.not_nil(version)
            test.not_nil((version :: Map).compiled_commands)
        end)

        test.it("publishes virtual tools with empty object schemas", function()
            local descriptor, descriptor_err = block_catalog.resolve("app:empty_schema_tool")
            test.is_nil(descriptor_err)
            local id = uuid.v4()
            local _, apply_err = workflow.apply(id, {
                { type = "node.add", body = { id = "step", kind = "block", ref = "app:empty_schema_tool" } },
            }, "tester")
            test.is_nil(apply_err)
            local published, publish_err = version_publish.publish(id, "tester")
            test.is_nil(publish_err)
            test.is_true((published :: Map).ok, json.encode((published :: Map).errors))
            local descriptor_json, descriptor_json_err = json.encode(descriptor)
            test.is_nil(descriptor_json_err)
            local row = json.decode(descriptor_json) :: Map
            for _, key in ipairs({ "input_schema", "config_schema", "config", "output_schema" }) do
                test.eq(json.encode((row[key] :: Map).properties), "{}")
                test.eq(json.encode((row[key] :: Map).default), "{}")
                test.eq(json.encode((row[key] :: Map).examples), "[]")
            end
            test.eq(json.encode((((row.ports :: { Map })[1] :: Map).schema :: Map).properties), "{}")
        end)

        test.it("retains configured schema data through versions compilation and artifacts", function()
            local schema = json.decode('{"type":"object","properties":{},"default":{},"examples":[]}')
            local id = uuid.v4()
            local _, apply_err = workflow.apply(id, {
                { type = "node.add", body = { id = "step", kind = "block", ref = "app:block.engine_linear", config = { schema = schema } } },
            }, "tester")
            test.is_nil(apply_err)
            local published, publish_err = version_publish.publish(id, "tester")
            test.is_nil(publish_err)
            test.is_true((published :: Map).ok, json.encode((published :: Map).errors))
            local version, version_err = version_read.get(id, (published :: Map).version)
            test.is_nil(version_err)
            local stored = version :: Map
            local node = ((stored.document :: Map).nodes :: { Map })[1] :: Map
            test.eq(json.encode((node.config :: Map).schema), json.encode(schema))
            local artifact, artifact_err = flow_contract.build({ key = "schema-flow", title = "Schema flow", version = 1,
                document = stored.document, refs = {} })
            test.is_nil(artifact_err)
            local materialized, materialize_err = flow_contract.materialize(artifact, {})
            test.is_nil(materialize_err)
            local imported = ((materialized :: Map).document :: Map).nodes :: { Map }
            test.eq(json.encode((imported[1].config :: Map).schema), json.encode(schema))
            local commands, _, remint_err = compiler.remint(stored.compiled_commands, uuid.v4, {})
            test.is_nil(remint_err)
            local found = false
            for _, command in ipairs(commands :: { Map }) do
                local payload = command.payload :: Map
                if command.type == "CREATE_NODE" and ((payload.metadata or {}) :: Map).def_node_id == "step" then
                    found = true
                    test.eq(json.encode((((payload.config :: Map).args :: Map).config :: Map).schema), json.encode(schema))
                end
            end
            test.is_true(found)
        end)

        test.it("retains schema objects while lowering Block configuration", function()
            local schema = json.decode('{"type":"object","properties":{},"default":{},"examples":[]}')
            local descriptor, descriptor_err = blocks.resolve("app:block.engine_linear")
            test.is_nil(descriptor_err)
            local plan, plan_err = blocks.plan_descriptor(descriptor, { def_node_id = "step", config = { schema = schema } })
            test.is_nil(plan_err)
            test.eq(json.encode(((((plan :: Map).config :: Map).args :: Map).config :: Map).schema), json.encode(schema))
        end)

        test.it("retains schema objects while reminting compiled commands", function()
            local schema = json.decode('{"type":"object","properties":{},"default":{},"examples":[]}')
            local commands, _, remint_err = compiler.remint({ { type = "CREATE_NODE", payload = {
                node_id = "step", node_type = "function", config = { schema = schema }, metadata = { def_node_id = "step" },
            } } }, uuid.v4, {})
            test.is_nil(remint_err)
            test.eq(json.encode(((((commands :: { Map })[1] :: Map).payload :: Map).config :: Map).schema), json.encode(schema))
        end)

        test.it("preserves historical v1 checksums while retaining object data", function()
            local schema = json.decode('{"type":"object","properties":{},"default":{},"examples":[]}')
            local function source(value)
                return { key = "checksum-compat", title = "Checksum compatibility", version = 1, refs = {},
                    document = { nodes = { { id = "step", kind = "block", ref = "app:block.engine_linear",
                        config = { schema = value } } }, edges = {} } }
            end
            local artifact, err = flow_contract.build(source(schema))
            test.is_nil(err, tostring(err))
            -- Before this repair the copier turned all empty containers into [].
            local legacy_schema = json.decode('{"type":"object","properties":[],"default":[],"examples":[]}')
            local legacy, legacy_err = flow_contract.build(source(legacy_schema))
            test.is_nil(legacy_err, tostring(legacy_err))
            test.eq(artifact.checksum, legacy.checksum)
            local materialized, materialize_err = flow_contract.materialize(artifact, {})
            test.is_nil(materialize_err, tostring(materialize_err))
            test.eq(json.encode(materialized.document.nodes[1].config.schema.default), "{}")
            test.eq(json.encode(materialized.document.nodes[1].config.schema.examples), "[]")
        end)

        test.it("retains schema objects while constructing portable artifacts", function()
            local schema = json.decode('{"type":"object","properties":{},"default":{},"examples":[]}')
            local artifact, artifact_err = flow_contract.build({ key = "schema-flow", title = "Schema flow", version = 1, refs = {},
                document = { nodes = { { id = "step", kind = "block", ref = "app:block.engine_linear", config = { schema = schema } } }, edges = {} },
            })
            test.is_nil(artifact_err)
            local node = ((((artifact :: Map).document :: Map).nodes :: { Map })[1] :: Map)
            test.eq(json.encode((node.config :: Map).schema), json.encode(schema))
        end)
    end)
end

return { run = test.run_cases(run) }
