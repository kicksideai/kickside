-- The MCP tool surface (kickside.workflows.agent:flows_read / flows_manage) runs
-- the full lifecycle an environment clone needs: create → apply → publish →
-- export → import → publish, with per-row access enforced for strangers. The
-- tools are called as real registry entries under real actors, so imports,
-- schemas, and the undo/versions/definitions seams are all exercised.

local test = require("test")
local security = require("security")
local funcs = require("funcs")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local json = require("json")

type Map = { [string]: any }

local READ_TOOL = "kickside.workflows.agent:flows_read"
local MANAGE_TOOL = "kickside.workflows.agent:flows_manage"

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function call_tool(actor_id: string, tool: string, args: any): Map
    local actor, actor_err = security.new_actor(actor_id, {})
    test.is_nil(actor_err)
    local result, err = funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call(tool, args or {})
    test.is_nil(err)
    test.not_nil(result)
    return result :: Map
end

local function call_error(actor_id: string, tool: string, args: any): any
    local result, err = funcs.new():with_actor(security.new_actor(actor_id, {}))
        :with_scope(suite_scope()):call(tool, args)
    test.is_nil(result)
    test.not_nil(err)
    return err
end

-- A publishable Flow with a real Start/Finish/Error boundary interface — the
-- shape automations bind to, and the shape the published picker filter lists.
local function seed_commands(): { Map }
    return {
        { type = "node.add", body = { id = "start", kind = "start", title = "Start", config = {
            input_schema = { type = "object", required = { "lead_id" }, properties = { lead_id = { type = "string" } } },
        } } },
        { type = "node.add", body = { id = "worker", kind = "block", ref = "app:block.engine_item_or_fail", title = "Score" } },
        { type = "node.add", body = { id = "finish", kind = "finish", title = "Finish", config = {
            output_schema = { type = "object", required = { "score" }, properties = { score = { type = "number" } } },
        } } },
        { type = "node.add", body = { id = "error", kind = "error", title = "Error", config = {
            error_schema = { type = "object", required = { "message" }, properties = { message = { type = "string" } } },
        } } },
        { type = "edge.add", body = { id = "e1", source_id = "start", source_port = "out", target_id = "worker" } },
        { type = "edge.add", body = { id = "e2", source_id = "worker", target_id = "finish", target_port = "in" } },
        { type = "edge.add", body = { id = "e3", source_id = "worker", source_port = "failed", target_id = "error", target_port = "in" } },
    }
end

local function catalog_item(actor: string, catalog_id: string): Map
    local selected = call_tool(actor, READ_TOOL, { action = "catalog", catalog_id = catalog_id })
    test.is_true(selected.success, tostring(selected.error))
    test.eq(selected.id, catalog_id)
    return selected.item :: Map
end

local function read_object(actor: string, args: Map): Map
    local result = call_tool(actor, READ_TOOL, args)
    test.is_true(result.success, tostring(result.error))
    return result
end

local function define_tests()
    test.describe("workflow MCP tools", function()
        test.it("preserves restore refusal errors", function()
            local owner = "tool-errors-" .. uuid_v4()
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Restore validation" })
            local restore_err = call_error(owner, MANAGE_TOOL,
                { action = "restore", id = created.workflow.id, version = "invalid" })
            test.is_true(errors.is(restore_err, errors.NOT_FOUND), tostring(restore_err))
            call_tool(owner, MANAGE_TOOL, { action = "delete", id = created.workflow.id })
        end)

        test.it("rejects an action call that misses one of its required fields", function()
            local owner = "action-fields-" .. uuid_v4()
            local cases = {
                { args = { action = "create" }, message = "title is required for action=create" },
                { args = { action = "import" }, message = "flow is required for action=import" },
                { args = { action = "apply", id = "w1" }, message = "commands is required for action=apply" },
                { args = { action = "publish" }, message = "id is required for action=publish" },
                { args = { action = "restore", id = "w1" }, message = "version is required for action=restore" },
                { args = { action = "delete" }, message = "id is required for action=delete" },
                { args = { action = "run", id = "w1", input = {} }, message = "version is required for action=run" },
            }
            for _, case in ipairs(cases) do
                local err = call_error(owner, MANAGE_TOOL, case.args)
                test.is_true(errors.is(err, errors.INVALID), case.message .. ": " .. tostring(err))
                test.contains(tostring(err), case.message)
            end
        end)

        test.it("rejects fields that belong to another action", function()
            local owner = "action-fields-" .. uuid_v4()
            local cases = {
                { args = { action = "create", title = "T", id = "w1" }, message = "action=create does not accept id" },
                { args = { action = "publish", id = "w1", version = 1 }, message = "action=publish does not accept version" },
                { args = { action = "delete", id = "w1", commands = {} }, message = "action=delete does not accept commands" },
                { args = { action = "import", flow = {}, title = "T" }, message = "action=import does not accept title" },
            }
            for _, case in ipairs(cases) do
                local err = call_error(owner, MANAGE_TOOL, case.args)
                test.is_true(errors.is(err, errors.INVALID), case.message .. ": " .. tostring(err))
                test.contains(tostring(err), case.message)
            end
        end)

        test.it("preserves delete refusal errors", function()
            local owner = "delete-errors-" .. uuid_v4()
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Delete validation" })
            local delete_err = call_error("stranger-" .. owner, MANAGE_TOOL,
                { action = "delete", id = created.workflow.id })
            test.is_true(errors.is(delete_err, errors.PERMISSION_DENIED), tostring(delete_err))
            call_tool(owner, MANAGE_TOOL, { action = "delete", id = created.workflow.id })
        end)

        -- An agent arrives knowing only the tool. Everything the authoring
        -- surface refuses to guess — the closed kind vocabulary, the command
        -- names, which Block ref runs an agent, the ports an edge may leave —
        -- has to be answerable from the catalog alone, or the agent writes a
        -- definition the compiler rejects.
        test.it("inspects durable runs through the read tool with workflow access and pagination", function()
            local owner = "run-reader-" .. uuid_v4()
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Run reader fixture" })
            local id = tostring(created.workflow.id)
            local run_id = uuid_v4()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, insert_err = db:execute([[INSERT INTO workflow_runs
                (run_id,workflow_id,version,trigger_kind,origin,status,started_at)
                VALUES ($1,$2,1,'manual','published','pending','2026-10-05T00:00:00Z')]], { run_id, id })
            db:release()
            test.is_nil(insert_err)
            local earlier_run_id = uuid_v4()
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            _, insert_err = db:execute([[INSERT INTO workflow_runs
                (run_id,workflow_id,version,trigger_kind,origin,status,started_at)
                VALUES ($1,$2,1,'manual','published','completed','2026-10-04T00:00:00Z')]], { earlier_run_id, id })
            db:release()
            test.is_nil(insert_err)
            local listed = call_tool(owner, READ_TOOL, { action = "runs", id = id, limit = 1 })
            test.eq(listed.count, 1)
            test.eq(listed.runs[1].run_id, run_id)
            test.is_nil(listed.runs[1].dataflow_id)
            test.is_nil(listed.runs[1].dedup_key)
            test.is_nil(listed.runs[1].error)
            test.eq(listed.next_offset, 1)
            local following = call_tool(owner, READ_TOOL, { action = "runs", id = id, limit = 1, offset = listed.next_offset })
            test.eq(following.count, 1)
            test.eq(following.runs[1].run_id, earlier_run_id)
            test.is_nil(following.next_offset)
            local detail = read_object(owner, { action = "run_detail", id = id, run_id = run_id })
            test.eq(detail.run.run_id, run_id)
            test.eq(detail.run.status, "pending")
            local timeline = call_tool(owner, READ_TOOL, { action = "events", id = id, run_id = run_id, limit = 1 })
            test.eq(#timeline.timeline.events, 1)
            test.is_nil(timeline.timeline.events[1].raw)
            local event = read_object(owner, { action = "event_detail", id = id, run_id = run_id, event_seq = 1 })
            test.eq(event.event.seq, 1)
            test.not_nil(event.event.raw)
            local exported = read_object(owner, { action = "export_run", id = id, run_id = run_id })
            test.not_nil(exported.export)
            for _, args in ipairs({
                { action = "runs", id = id, status = "invented" },
                { action = "runs", id = id, limit = 201 },
                { action = "runs", id = id, offset = -1 },
                { action = "run_detail", id = id, run_id = "missing" },
                { action = "run_detail", id = id },
            }) do
                test.not_nil(call_error(owner, READ_TOOL, args))
            end
            for _, action in ipairs({ "runs", "run_detail", "events", "export_run", "node_data" }) do
                test.contains(tostring(call_error("stranger-" .. owner, READ_TOOL,
                    { action = action, id = id, run_id = run_id, node_id = "worker" })), "access denied")
            end
        end)

        test.it("pages full catalog records and selects the same record by catalog_id", function()
            local author = "catalog-author-" .. uuid_v4() .. "@local.test"
            local catalog = call_tool(author, READ_TOOL, { action = "catalog", limit = 1 })
            test.is_true(catalog.success)
            test.eq(#(catalog.catalog :: { any }), 1)
            test.not_nil(catalog.next_offset)
            local all = call_tool(author, READ_TOOL, { action = "catalog", limit = 100 })
            local row: Map? = nil
            local kind: Map? = nil
            for _, candidate in ipairs(all.catalog :: { Map }) do
                if candidate.section == "blocks" and not row then row = candidate end
                if candidate.section == "node_kinds" and candidate.id == "start" then kind = candidate end
            end
            test.not_nil(row)
            local block_row = row :: Map
            test.eq(tostring(block_row.ref), tostring(block_row.id))
            test.is_nil(block_row.input_schema)
            test.is_nil(block_row.config_schema)
            test.is_nil(block_row.output_schema)
            test.is_nil(block_row.ports)
            test.is_nil(block_row.declaration)
            test.not_nil(kind)
            test.is_nil((kind :: Map).config)
            local block = catalog_item(author, "blocks:" .. tostring(block_row.id))
            test.not_nil(block.input_schema)
            test.not_nil(block.config_schema)
            test.not_nil(block.output_schema)
            test.not_nil(block.ports)
            local node_kind = catalog_item(author, "node_kinds:start")
            test.not_nil(node_kind.config)
        end)

        test.it("returns correction paths for malformed batches and commits only the corrected batch", function()
            local owner = "tool-correction-" .. uuid_v4() .. "@local.test"
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Correctable batch" })
            local id = tostring((created.workflow :: Map).id)
            local bad: { Map } = {
                { type = "node.add", body = { id = "start", kind = "start" } },
                { type = "edge.add", body = { id = "edge", source = "start", target = "finish" } },
            }
            local err = call_error(owner, MANAGE_TOOL, { action = "apply", id = id, commands = bad })
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.is_true(tostring(err):find("commands[2]", 1, true) ~= nil, tostring(err))
            test.is_true(tostring(err):find("edge.add", 1, true) ~= nil, tostring(err))
            test.is_true(tostring(err):find("body.source_id", 1, true) ~= nil, tostring(err))
            local untouched = (read_object(owner, { action = "read", id = id }).state :: Map)
            test.eq(untouched.head_seq, 0)
            test.eq(#(untouched.nodes :: { any }), 0)
            local nested_err = call_error(owner, MANAGE_TOOL, { action = "apply", id = id, commands = {
                { type = "node.add", body = { node = { id = "start", kind = "start" } } },
            } })
            test.is_true(tostring(nested_err):find("body.kind", 1, true) ~= nil, tostring(nested_err))
            local shape_err = call_error(owner, MANAGE_TOOL, { action = "apply", id = id, commands = {
                { type = "node.add", body = "malformed" },
            } })
            test.is_true(errors.is(shape_err, errors.INVALID), tostring(shape_err))
            test.is_true(tostring(shape_err):find("commands[1].body", 1, true) ~= nil, tostring(shape_err))
            local kind_err = call_error(owner, MANAGE_TOOL, { action = "apply", id = id, commands = {
                { type = "node.add", body = { id = "step", kind = "agent" } },
            } })
            test.is_true(tostring(kind_err):find("body.kind", 1, true) ~= nil, tostring(kind_err))
            test.is_true(tostring(kind_err):find("block", 1, true) ~= nil, tostring(kind_err))
            local applied = call_tool(owner, MANAGE_TOOL, { action = "apply", id = id, commands = seed_commands() })
            test.is_true(applied.success)
            test.eq(#((applied.state :: Map).nodes :: { any }), 4)
            call_tool(owner, MANAGE_TOOL, { action = "delete", id = id })
        end)

        -- The example is a promise: an author that copies it verbatim gets a
        -- workflow that publishes. Applying it unchanged keeps that promise
        -- honest as the kinds, commands and Block catalog move.
        test.it("publishes the example the catalog hands out, applied verbatim", function()
            local author = "catalog-example-" .. uuid_v4() .. "@local.test"
            local catalog = call_tool(author, READ_TOOL, { action = "catalog" })
            test.is_true(catalog.success, tostring(catalog.error))
            local catalog = call_tool(author, READ_TOOL, { action = "catalog", limit = 1 })
            test.is_true(catalog.success, tostring(catalog.error))
            test.is_true(#(catalog.catalog :: { any }) > 0)
            local example = catalog_item(author, "examples:publishable")
            local commands = example.commands :: { Map }
            test.is_true(#commands > 0)

            local created = call_tool(author, MANAGE_TOOL, { action = "create", title = "Example as given" })
            test.is_true(created.success, tostring(created.error))
            local id = tostring((created.workflow :: Map).id)

            local applied = call_tool(author, MANAGE_TOOL, { action = "apply", id = id, commands = commands })
            test.is_true(applied.success, tostring(applied.error))

            local published = call_tool(author, MANAGE_TOOL, { action = "publish", id = id })
            test.is_true(published.success, tostring(published.error))
            test.eq(tonumber(published.version), 1)

            call_tool(author, MANAGE_TOOL, { action = "delete", id = id })
        end)

        -- The end the catalog exists for: an author that knows nothing up front
        -- reads the vocabulary, builds only from what it returned, and publishes.
        -- Every id, kind, ref and port below is taken from the catalog response
        -- rather than written in by hand.
        test.it("carries an author from catalog alone to a published workflow", function()
            local author = "catalog-builder-" .. uuid_v4() .. "@local.test"
            local catalog = call_tool(author, READ_TOOL, { action = "catalog", limit = 100 })
            test.is_true(catalog.success)
            local kinds: { [string]: Map } = {}
            local step_ref = ""
            for _, row in ipairs((catalog.catalog :: { Map }) or {}) do
                if row.section == "node_kinds" and (row.id == "start" or row.id == "finish") then
                    kinds[tostring(row.id)] = catalog_item(author, "node_kinds:" .. tostring(row.id))
                elseif row.section == "blocks" and step_ref == "" then
                    step_ref = tostring(row.id)
                end
            end
            if step_ref == "" then error("catalog returned no usable blocks") end

            -- Boundary config keys come from the kind rows, not from memory.
            local start_key = ""
            for field, _ in pairs(((kinds.start :: Map).config :: Map)) do start_key = field end
            local finish_key = ""
            for field, _ in pairs(((kinds.finish :: Map).config :: Map)) do finish_key = field end
            test.eq(start_key, "input_schema")
            test.eq(finish_key, "output_schema")

            local created = call_tool(author, MANAGE_TOOL, { action = "create", title = "Built from catalog" })
            test.is_true(created.success)
            local id = tostring((created.workflow :: Map).id)

            local schema: Map = { type = "object", properties = { note = { type = "string" } } }
            if created.success ~= true then error("create refused: " .. tostring(created.error)) end
            local applied = call_tool(author, MANAGE_TOOL, { action = "apply", id = id, commands = {
                { type = "node.add", body = { id = "start", kind = "start", title = "Start",
                    config = { [start_key] = schema } } },
                { type = "node.add", body = { id = "step", kind = "block", ref = step_ref, title = "Step" } },
                { type = "node.add", body = { id = "finish", kind = "finish", title = "Finish",
                    config = { [finish_key] = schema } } },
                { type = "edge.add", body = { id = "e1", source_id = "start", source_port = "out", target_id = "step" } },
                { type = "edge.add", body = { id = "e2", source_id = "step", target_id = "finish" } },
            } })
            if applied.success ~= true then error("apply refused: " .. tostring(applied.error)) end

            local published = call_tool(author, MANAGE_TOOL, { action = "publish", id = id })
            if published.success ~= true then error("publish refused: " .. tostring(published.error)) end
            test.eq(published.version, 1)

            call_tool(author, MANAGE_TOOL, { action = "delete", id = id })
        end)

        test.it("creates, edits, publishes, and reads back through the tool surface", function()
            local owner = "tool-owner-" .. uuid_v4() .. "@local.test"

            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "MCP lifecycle" })
            test.is_true(created.success, tostring(created.error))
            local id = tostring((created.workflow :: Map).id)
            test.is_true(id ~= "")

            local applied = call_tool(owner, MANAGE_TOOL, { action = "apply", id = id, commands = seed_commands() })
            test.is_true(applied.success, tostring(applied.error))
            test.is_true((tonumber(applied.head_seq) or 0) > 0)

            local state = read_object(owner, { action = "read", id = id })
            test.eq(#((state.state :: Map).nodes :: { any }), 4)

            local published = call_tool(owner, MANAGE_TOOL, { action = "publish", id = id })
            test.is_true(published.success, tostring(published.error))
            test.eq(tonumber(published.version), 1)

            local vs = call_tool(owner, READ_TOOL, { action = "versions", id = id })
            test.is_true(vs.success, tostring(vs.error))
            test.eq(#(vs.versions :: { any }), 1)

            local listed = call_tool(owner, READ_TOOL, { action = "list", published = true })
            test.is_true(listed.success, tostring(listed.error))
            local found = false
            for _, row in ipairs(listed.workflows :: { any }) do
                if tostring((row :: Map).id) == id then
                    found = true
                    test.is_nil((row :: Map).interface)
                    test.is_nil((row :: Map).published_interface)
                end
            end
            test.is_true(found, "published workflow missing from the actor's list")
        end)

        test.it("runs a published version through the manage tool without waiting for it", function()
            local owner = "tool-runner-" .. uuid_v4() .. "@local.test"
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "MCP run" })
            local id = tostring((created.workflow :: Map).id)
            call_tool(owner, MANAGE_TOOL, { action = "apply", id = id, commands = seed_commands() })
            local published = call_tool(owner, MANAGE_TOOL, { action = "publish", id = id })
            test.is_true(published.success, tostring(published.error))

            local launched = call_tool(owner, MANAGE_TOOL, {
                action = "run", id = id, version = 1, input = { lead_id = "lead-1" },
            })
            test.is_true(launched.success, tostring(launched.error))
            test.is_true(tostring(launched.run_id) ~= "")
            local detail = read_object(owner, { action = "run_detail", id = id, run_id = launched.run_id })
            test.eq(detail.run.run_id, launched.run_id)

            test.not_nil(call_error(owner, MANAGE_TOOL, { action = "run", id = id, version = 9, input = { lead_id = "l" } }))
            test.contains(tostring(call_error("stranger-" .. owner, MANAGE_TOOL,
                { action = "run", id = id, version = 1, input = { lead_id = "l" } })), "access denied")
        end)

        test.it("pages callable Flow headers with exact selectable identities", function()
            local owner = "catalog-pages-" .. uuid_v4() .. "@local.test"
            local created = call_tool(owner, MANAGE_TOOL, {action = "create", title = "Flow page"})
            local id = tostring((created.workflow :: Map).id)
            call_tool(owner, MANAGE_TOOL, {action = "apply", id = id, commands = seed_commands()})
            call_tool(owner, MANAGE_TOOL, {action = "publish", id = id})
            local offset = 0
            local found: Map? = nil
            repeat
                local page = call_tool(owner, READ_TOOL, {action = "catalog", limit = 2, offset = offset})
                test.is_true(#page.catalog <= 2)
                for _, row in ipairs(page.catalog) do
                    if row.section == "flows" then found = row end
                end
                if page.next_offset then test.is_true(page.next_offset > offset) end
                offset = page.next_offset
            until offset == nil
            test.not_nil(found)
            test.eq(found.id, id)
            test.eq(found.flow_ref.id, id)
            test.is_nil(found.input_schema)
            local selected = catalog_item(owner, "flows:" .. id)
            test.eq(selected.flow_ref.id, id)
            test.eq(selected.flow_ref.version, 1)
            test.eq(selected.input_schema.required[1], "lead_id")
        end)

        test.it("round-trips export to a publishable import — the clone path", function()
            local owner = "tool-clone-" .. uuid_v4() .. "@local.test"

            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Clone source" })
            test.is_true(created.success, tostring(created.error))
            local id = tostring((created.workflow :: Map).id)
            local applied = call_tool(owner, MANAGE_TOOL, { action = "apply", id = id, commands = seed_commands() })
            test.is_true(applied.success, tostring(applied.error))
            local published = call_tool(owner, MANAGE_TOOL, { action = "publish", id = id })
            test.is_true(published.success, tostring(published.error))

            local exported = read_object(owner, { action = "export", id = id })
            test.not_nil((exported :: Map).flow)
            local document = ((exported :: Map).flow :: Map).document :: Map
            test.eq(json.encode(document.params), "{}")
            for _, edge in ipairs(document.edges :: { Map }) do
                test.eq(json.encode(edge.transform), "{}")
            end

            local imported = call_tool(owner, MANAGE_TOOL, { action = "import", flow = (exported :: Map).flow })
            test.is_true(imported.success, tostring(imported.error))
            local draft_id = tostring((imported.flow :: Map).flow_id)
            test.is_true(draft_id ~= "" and draft_id ~= id)

            local draft_state = read_object(owner, { action = "read", id = draft_id })
            test.eq(#((draft_state.state :: Map).nodes :: { any }), 4)

            local republished = call_tool(owner, MANAGE_TOOL, { action = "publish", id = draft_id })
            test.is_true(republished.success, tostring(republished.error))
            test.eq(tonumber(republished.version), 1)
        end)

        test.it("reports publish validation refusal as a tool error", function()
            local owner = "publish-refusal-" .. uuid_v4() .. "@local.test"
            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Incomplete" })
            local id = tostring(created.workflow.id)
            local err = call_error(owner, MANAGE_TOOL, { action = "publish", id = id })
            test.is_true(errors.is(err, errors.INVALID))
            test.is_true(tostring(err) ~= "")
            call_tool(owner, MANAGE_TOOL, { action = "delete", id = id })
        end)

        test.it("denies strangers and deletes through the tool surface", function()
            local owner = "tool-own-" .. uuid_v4() .. "@local.test"
            local stranger = "tool-str-" .. uuid_v4() .. "@local.test"

            local created = call_tool(owner, MANAGE_TOOL, { action = "create", title = "Private" })
            test.is_true(created.success, tostring(created.error))
            local id = tostring((created.workflow :: Map).id)

            local denied_read = call_error(stranger, READ_TOOL, { action = "read", id = id })
            test.not_nil(denied_read)

            local denied_write = call_error(stranger, MANAGE_TOOL, { action = "apply", id = id, commands = seed_commands() })
            test.not_nil(denied_write)

            local deleted = call_tool(owner, MANAGE_TOOL, { action = "delete", id = id })
            test.is_true(deleted.success, tostring(deleted.error))

            local gone = call_error(owner, READ_TOOL, { action = "read", id = id })
            test.not_nil(gone)
        end)
    end)
end

return test.run_cases(define_tests)
