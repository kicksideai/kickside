local blocks = require("blocks")
local tool_adapter = require("tool_adapter")
local lower = require("lower")
local test = require("test")
local registry = require("registry")
local time = require("time")

-- Each attempt rebuilds an owned fixture write from a fresh snapshot. Other
-- registry writers may advance the head; all other errors remain test failures.
local function fixture_write(write)
    local result, err
    for _ = 1, 5 do
        result, err = write()
        if not errors.is(err, errors.CONFLICT) or err:retryable() ~= true then return result, err end
        local details = err:details() or {}
        if details.plan_version == nil or details.current_version == nil then return result, err end
    end
    return result, err
end

local function declaration()
    return {
        id = "example:approval",
        kind = "registry.entry",
        meta = {
            type = "kickside.block",
            title = "Approval",
            module_digest = "sha256:proof",
        },
        data = {
            block = {
                api_version = "kickside.block/v1",
                input = { type = "object", properties = {} },
                config = { type = "object", properties = {} },
                output = { type = "object", properties = {} },
                ports = { { id = "result", direction = "out" } },
                execution = { kind = "function", function_id = "example:run_approval" },
            },
        },
    }
end

local function define_tests()
    test.describe("Block contract", function()
        test.it("owns typed input, config, output, and exact lowering", function()
            test.is_nil(blocks.validate(declaration()))
        end)

        test.it("does not treat registry provenance as Block semantics", function()
            local entry = declaration()
            entry.meta.module_digest = "sha256:installed-by-hub"
            test.is_nil(blocks.validate(entry))
        end)

        test.it("rejects a Block without typed config", function()
            local entry = declaration()
            entry.data.block.config = nil
            test.contains(tostring(blocks.validate(entry)), ".block.config")
        end)

        test.it("projects only canonical public function tools into the Block catalog", function()
            local catalog, err = blocks.catalog()
            test.is_nil(err)
            test.not_nil((catalog :: any)["app:public_block"])
            local tool = (catalog :: any)["app:public_tool_table"]
            test.not_nil(tool)
            test.eq(tool.source_kind, "tool")
            test.is_true(tool.tool)
            test.eq(tool.execution.kind, "tool")
            test.eq(tool.execution.tool_id, "app:public_tool_table")
            test.eq(tool.presentation.category, "Tools")
            test.eq(tool.presentation.hue, "blue")
            test.eq(tool.presentation.icon, "tabler:search")
            test.eq(tool.ports[1].id, "result")
            test.eq(tool.ports[2].id, "failed")
            test.eq(tool.error.required[1], "code")
            test.eq(tool.error.required[2], "message")
            test.is_nil((catalog :: any)["app:private_tool"])
            test.is_nil((catalog :: any)["app:missing_public_tool"])
            test.is_nil((catalog :: any)["app:malformed_private_tool"])
            test.is_nil((catalog :: any)["app:wrong_kind_tool"])
        end)

        test.it("fails the catalog with a typed error and no partial catalog when a declaration is invalid", function()
            local invalid = declaration()
            invalid.id = "app:invalid_block_" .. tostring(time.now():unix_nano())
            invalid.data.block.config = nil
            local _, apply_err = fixture_write(function()
                local changes = assert(registry.snapshot()):changes()
                changes:create(invalid)
                return changes:apply()
            end)
            test.is_nil(apply_err)
            local catalog, err = blocks.catalog()
            local _, cleanup_err = fixture_write(function()
                local cleanup = assert(registry.snapshot()):changes()
                cleanup:delete(invalid.id)
                return cleanup:apply()
            end)
            test.is_nil(cleanup_err)
            test.is_nil(catalog)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.contains(tostring(err), invalid.id)
        end)

        test.it("decodes table and JSON-string schemas while making fixed overrides partial", function()
            local table_tool, table_err = blocks.resolve("app:public_tool_table")
            test.is_nil(table_err)
            test.eq((table_tool :: any).input.required[1], "account_id")
            test.is_nil((table_tool :: any).config.required)
            test.eq((table_tool :: any).config.properties.account_id.type, "string")
            test.eq((table_tool :: any).output.properties.name.type, "string")

            local string_tool, string_err = blocks.resolve("app:public_tool_json")
            test.is_nil(string_err)
            test.eq((string_tool :: any).input.properties.score.type, "number")
            test.is_nil((string_tool :: any).config.required)
            test.eq((string_tool :: any).output.properties.accepted.type, "boolean")

            local malformed, malformed_err = blocks.resolve("app:malformed_schema_tool")
            test.is_nil(malformed_err)
            test.is_nil(next((malformed :: any).input))
            test.is_nil(next((malformed :: any).output))
            test.eq((malformed :: any).config.type, "object")
            test.is_true((malformed :: any).config.additionalProperties)

            local hidden, hidden_err = blocks.resolve("app:private_tool")
            test.is_nil(hidden)
            test.not_nil(hidden_err)
        end)

        test.it("lowers tools directly to exact native functions with fixed arguments", function()
            local plan, err = blocks.plan({
                block_id = "app:public_tool_table",
                def_node_id = "lookup",
                config = { include_closed = true },
            })
            test.is_nil(err)
            test.eq((plan :: any).node_type, "userspace.dataflow.node.func:node")
            test.eq((plan :: any).config.func_id, "app:public_tool_table")
            test.is_true((plan :: any).config.args.include_closed)
            test.is_nil((plan :: any).config.args.config)
            test.is_nil((plan :: any).config.input_transform)

            local passthrough, passthrough_err = blocks.plan({ block_id = "app:public_tool_table", config = {} })
            test.is_nil(passthrough_err)
            test.is_nil((passthrough :: any).config.args)
            test.is_nil((passthrough :: any).config.input_transform)

            local _, invalid = blocks.plan({ block_id = "app:public_tool_table", config = { include_closed = "yes" } })
            test.contains(tostring(invalid), "Block config invalid")
        end)

        test.it("rejects configured authority during tool admission", function()
            for _, frame in ipairs({ { actor = { id = "system:tool" } }, { scope = "wippy.security:process" } }) do
                local entry = { id = "app:scoped_tool", kind = "function.lua",
                    meta = { type = "tool", public = true }, security = frame }
                test.is_false(tool_adapter.visible(entry))
                local descriptor, err = tool_adapter.describe(entry)
                test.is_nil(descriptor)
                test.eq(err, "entry is not a public registry tool")
            end
        end)

        test.it("refuses a lowered tool the registry no longer publishes", function()
            local function tool_descriptor(tool_id)
                return {
                    id = tool_id,
                    source_kind = "tool",
                    tool = true,
                    config = { type = "object" },
                    execution = { kind = "tool", tool_id = tool_id },
                }
            end
            local plan, err = blocks.plan_descriptor(tool_descriptor("app:private_tool"), { config = {} })
            test.is_nil(plan)
            test.eq(err, "entry is not a public registry tool")
            local direct, direct_err = lower.plan_descriptor(tool_descriptor("app:private_tool"), { config = {} })
            test.is_nil(direct)
            test.eq(direct_err, "entry is not a public registry tool")

            local missing, missing_err = blocks.plan_descriptor(tool_descriptor("app:no_such_tool"), { config = {} })
            test.is_nil(missing)
            test.eq(missing_err, "Tool not found: app:no_such_tool")

            local allowed, allowed_err = blocks.plan_descriptor(tool_descriptor("app:public_tool_table"), { config = {} })
            test.is_nil(allowed_err)
            test.eq((allowed :: any).config.func_id, "app:public_tool_table")
        end)

        test.it("lists explicit and virtual tool Blocks through one API", function()
            local result, err = blocks.list({})
            test.is_nil(err)
            local found: any = {}
            for _, item in ipairs((result :: any).blocks) do found[item.id] = item end
            test.eq(found["app:public_block"].source_kind, "block")
            test.is_false(found["app:public_block"].tool)
            test.eq(found["app:public_tool_table"].source_kind, "tool")
            test.is_true(found["app:public_tool_table"].tool)
        end)

        test.it("fails the list with the catalog's typed error", function()
            local catalog = blocks.catalog
            local failure = errors.new({ kind = errors.INTERNAL, message = "invalid Block declarations: app:broken: schema is required" })
            blocks.catalog = function() return {}, failure end
            local result, err = blocks.list({})
            blocks.catalog = catalog
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("lists compact Block summaries and gets full descriptors", function()
            local catalog, catalog_err = blocks.list({ limit = 100 })
            test.is_nil(catalog_err)
            local row
            for _, item in ipairs((catalog :: any).blocks) do
                if item.id == "app:public_tool_table" then row = item end
            end
            test.not_nil(row)
            test.is_nil((row :: any).description)
            for _, field in ipairs({ "input", "config", "output", "error", "ports", "presentation", "execution" }) do
                test.is_nil((row :: any)[field])
            end
            local detail, detail_err = blocks.get({ block_id = (row :: any).id })
            test.is_nil(detail_err)
            test.eq((detail :: any).input.required[1], "account_id")
            test.eq((detail :: any).config.properties.account_id.type, "string")
            test.eq((detail :: any).output.properties.name.type, "string")
            test.eq((detail :: any).description, "Looks up one account by its exact identifier.")
            local explicit, explicit_err = blocks.get({ block_id = "app:public_block" })
            test.is_nil(explicit_err)
            test.eq((explicit :: any).declaration.data.block.api_version, "kickside.block/v1")
            local absent, absent_err = blocks.get({ block_id = "app:absent" })
            test.is_nil(absent)
            test.is_true(errors.is(absent_err, errors.NOT_FOUND))
            local private, private_err = blocks.get({ block_id = "app:private_tool" })
            test.is_nil(private)
            test.not_nil(private_err)
            local invalid, invalid_err = blocks.get({})
            test.is_nil(invalid)
            test.is_true(errors.is(invalid_err, errors.INVALID))
            test.is_nil((catalog :: any).content)
        end)

        test.it("pages the public Block catalog in id order with a cursor", function()
            local all, all_err = blocks.list({ limit = 100 })
            test.is_nil(all_err)
            test.is_true(#(all :: any).blocks >= 2)
            local first, first_err = blocks.list({ limit = 1 })
            test.is_nil(first_err)
            test.eq(#(first :: any).blocks, 1)
            test.eq((first :: any).next_cursor, (first :: any).blocks[1].id)

            local second, second_err = blocks.list({ limit = 1, cursor = (first :: any).next_cursor })
            test.is_nil(second_err)
            test.eq(#(second :: any).blocks, 1)
            test.is_true((second :: any).blocks[1].id > (first :: any).blocks[1].id)

            local seen = 0
            local cursor = nil
            repeat
                local page, page_err = blocks.list({ limit = 1, cursor = cursor })
                test.is_nil(page_err)
                seen = seen + #(page :: any).blocks
                cursor = (page :: any).next_cursor
            until cursor == nil
            test.eq(seen, #(all :: any).blocks)

            local invalid, invalid_err = blocks.list({ limit = 0 })
            test.is_nil(invalid)
            test.is_true(errors.is(invalid_err, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
