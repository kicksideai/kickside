-- Access is grant-based through the component service: the creator owns the workflow
-- (FULL), a stranger holds nothing. Runs the repo under two distinct actors via the
-- funcs seam so the denial path is exercised against the real service.

local test = require("test")
local security = require("security")
local funcs = require("funcs")
local repo = require("workflow_repo")
local workflow = require("workflow")
local version_publish = require("version_publish")
local store = require("store")
local types = require("types")

local C = types.COMMAND

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function call_as(actor_id: string, args: any): (any, any?)
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then return nil, actor_err end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call("app:access_seam", args or {})
end

local function define_tests()
    test.describe("Workflow access", function()
        test.it("fails closed when the component READ access mask is unavailable", function()
            local original = repo.ACCESS.READ
            repo.ACCESS.READ = nil
            local context, err = repo._get_workflow_context("wf-access-contract")
            repo.ACCESS.READ = original

            test.is_nil(context)
            test.eq(err, "component READ access mask is unavailable")
        end)

        test.it("threads an opaque parent id unchanged to component registration", function()
            local previous = repo._open_service
            local registered: any = nil
            repo._open_service = function(): (any?, string?)
                return {
                    register = function(_self: any, input: any): (any?, string?)
                        registered = input
                        return { component_id = "wf-placed" }, nil
                    end,
                }, nil
            end

            local created, err = repo.create("Placed workflow", "workspace-folder:opaque")
            repo._open_service = previous

            test.is_nil(err)
            test.eq((created :: any).id, "wf-placed")
            test.eq((registered :: any).parent_id, "workspace-folder:opaque")
        end)

        test.it("adds an access-checked parent breadcrumb to placed rows and omits it at root", function()
            local owner_id = "location-owner-" .. tostring(math.random(1, 1000000000))
            local parent, parent_err = call_as(owner_id, { op = "create", title = "Workflow folder" })
            test.is_nil(parent_err)
            local parent_id = tostring((parent :: any).id or "")
            test.is_true(parent_id ~= "")

            local placed, placed_err = call_as(owner_id, {
                op = "create", title = "Placed workflow", parent_id = parent_id,
            })
            test.is_nil(placed_err)
            local placed_id = tostring((placed :: any).id or "")

            local root, root_err = call_as(owner_id, { op = "create", title = "Root workflow" })
            test.is_nil(root_err)
            local root_id = tostring((root :: any).id or "")

            local listed = call_as(owner_id, { op = "list" }) :: any
            test.is_nil(listed.error)
            local by_id: { [string]: any } = {}
            for _, row in ipairs(listed.rows or {}) do by_id[tostring((row :: any).id or "")] = row end

            test.eq((by_id[placed_id] :: any).parent_id, parent_id)
            test.eq((by_id[placed_id] :: any).parent_name, "Workflow folder")
            test.eq((by_id[placed_id] :: any).breadcrumb, "Workflow folder")
            test.is_nil((by_id[root_id] :: any).parent_id)
            test.is_nil((by_id[root_id] :: any).parent_name)
            test.is_nil((by_id[root_id] :: any).breadcrumb)
        end)

        test.it("exposes definition-owned labels on each workflow list row", function()
            local owner_id = "labels-owner-" .. tostring(math.random(1, 1000000000))
            local created, cerr = call_as(owner_id, { op = "create", title = "Tagged workflow" })
            test.is_nil(cerr)
            local id = tostring((created :: any).id or "")
            test.is_true(id ~= "")

            local labeled = call_as(owner_id, { op = "apply", id = id, commands = {
                { type = C.LABELS_SET, body = { labels = { "Revenue", "Priority" } } },
            } })
            test.is_nil((labeled :: any).error)

            local listed = call_as(owner_id, { op = "list" })
            test.is_nil((listed :: any).error)
            local found: any = nil
            for _, row in ipairs((listed :: any).rows or {}) do
                if tostring((row :: any).id or "") == id then found = row end
            end
            test.not_nil(found)
            test.eq(((found :: any).labels)[1], "Revenue")
            test.eq(((found :: any).labels)[2], "Priority")
        end)

        test.it("grants the creator write and denies a non-owner", function()
            local created, cerr = call_as("owner-A", { op = "create", title = "Owned" })
            test.is_nil(cerr)
            test.not_nil(created)
            test.is_nil((created :: any).error)
            local id = tostring((created :: any).id or "")
            test.not_nil(id)
            test.is_true(id ~= "")

            local owner = call_as("owner-A", { op = "require_access", id = id, mask = repo.ACCESS.WRITE })
            test.is_nil((owner :: any).error)

            local stranger = call_as("stranger-B", { op = "require_access", id = id, mask = repo.ACCESS.WRITE })
            test.not_nil((stranger :: any).error)
        end)

        test.it("replays a create with the same idempotency key instead of minting another draft", function()
            local actor = "idempotent-create-owner-" .. tostring(math.random(1, 1000000000))
            local key = "create-" .. tostring(math.random(1, 1000000000))
            local first, ferr = call_as(actor, { op = "create", title = "Only once", idempotency_key = key })
            test.not_nil(first, "first idempotency create: " .. tostring(ferr))
            test.is_nil((first :: any).error, "first idempotency create")
            local first_id = tostring((first :: any).id or "")
            test.is_true(first_id ~= "")

            local replay, rerr = call_as(actor, { op = "create", title = "Ignored on replay", idempotency_key = key })
            test.not_nil(replay, "replay idempotency create: " .. tostring(rerr))
            test.is_nil((replay :: any).error, "replay idempotency create")
            test.eq((replay :: any).id, first_id, "replay idempotency create")
            test.eq((replay :: any).replayed, true, "replay idempotency create")

            local listed = call_as(actor, { op = "list" }) :: any
            local matches = 0
            for _, row in ipairs(listed.rows or {}) do
                if tostring((row :: any).id or "") == first_id then matches = matches + 1 end
            end
            test.eq(matches, 1)
        end)

        test.it("does not surface or authorize a definition without its component authority", function()
            local owner_id = "orphan-owner-" .. tostring(math.random(1, 1000000000))
            local seeded, seed_err = call_as(owner_id, { op = "seed_orphan" })
            test.is_nil(seed_err)
            local id = tostring((seeded :: any).id or "")
            test.is_true(id ~= "")

            local listed = call_as(owner_id, { op = "list" })
            test.is_nil((listed :: any).error)
            for _, row in ipairs((listed :: any).rows or {}) do
                test.is_true(tostring((row :: any).id or "") ~= id)
            end
            local access = call_as(owner_id, { op = "require_access", id = id, mask = repo.ACCESS.WRITE })
            test.not_nil((access :: any).error)
        end)

        test.it("lists newly created empty workflows with explicit zero counts", function()
            local owner_id = "empty-owner-" .. tostring(math.random(1, 1000000000))
            local created, cerr = call_as(owner_id, { op = "create", title = "Empty draft" })
            test.is_nil(cerr)
            test.not_nil(created)
            test.is_nil((created :: any).error)
            local id = tostring((created :: any).id or "")
            test.is_true(id ~= "")

            local listed = call_as(owner_id, { op = "list" })
            test.is_nil((listed :: any).error)
            local found: any = nil
            for _, row in ipairs((listed :: any).rows or {}) do
                if tostring((row :: any).id or "") == id then found = row end
            end
            test.not_nil(found)
            test.eq((found :: any).node_count, 0)
            test.eq((found :: any).run_count, 0)
        end)

        test.it("reports draft changes only for definition edits after the latest publish", function()
            local owner_id = "draft-status-owner-" .. tostring(math.random(1, 1000000000))
            local created, cerr = call_as(owner_id, { op = "create", title = "Published workflow" })
            test.is_nil(cerr)
            local id = tostring((created :: any).id or "")
            test.is_true(id ~= "")

            local seeded = call_as(owner_id, { op = "apply", id = id, commands = {
                { type = C.NODE_ADD, body = { id = "start", kind = "start", title = "Start", config = {
                    input_schema = { type = "object", properties = {} },
                } } },
                { type = C.NODE_ADD, body = { id = "worker", kind = "block", ref = "app:block.engine_item_or_fail", title = "Do" } },
                { type = C.NODE_ADD, body = { id = "finish", kind = "finish", title = "Finish", config = {
                    output_schema = { type = "object", properties = {} },
                } } },
                { type = C.NODE_ADD, body = { id = "error", kind = "error", title = "Error", config = {
                    error_schema = { type = "object", properties = {} },
                } } },
                { type = C.EDGE_ADD, body = { id = "e1", source_id = "start", source_port = "out", target_id = "worker" } },
                { type = C.EDGE_ADD, body = { id = "e2", source_id = "worker", target_id = "finish", target_port = "in" } },
                { type = C.EDGE_ADD, body = { id = "e3", source_id = "worker", source_port = "failed", target_id = "error", target_port = "in" } },
            } })
            test.is_nil((seeded :: any).error)

            local first_publish = call_as(owner_id, { op = "publish", id = id })
            test.is_nil((first_publish :: any).error)
            test.is_true(((first_publish :: any).result :: any).ok)

            local function listed_row(): any
                local listed = call_as(owner_id, { op = "list" })
                test.is_nil((listed :: any).error)
                for _, row in ipairs((listed :: any).rows or {}) do
                    if tostring((row :: any).id or "") == id then return row end
                end
                return nil
            end

            local published = listed_row()
            test.not_nil(published)
            test.eq((published :: any).has_draft_changes, false)

            local edited = call_as(owner_id, { op = "apply", id = id, commands = {
                { type = C.NODE_UPDATE, body = { id = "worker", title = "Edited step" } },
            } })
            test.is_nil((edited :: any).error)
            test.eq((listed_row() :: any).has_draft_changes, true)

            local second_publish = call_as(owner_id, { op = "publish", id = id })
            test.is_nil((second_publish :: any).error)
            test.is_true(((second_publish :: any).result :: any).ok)
            test.eq((listed_row() :: any).has_draft_changes, false)

            -- Future non-edit markers must not become draft changes merely because
            -- they consume a definition-stream sequence number.
            local marker = call_as(owner_id, { op = "append_marker", id = id })
            test.is_nil((marker :: any).error)
            test.eq((listed_row() :: any).has_draft_changes, false)
        end)

        test.it("filters list rows to published workflows for picker consumers", function()
            local owner_id = "published-list-owner-" .. tostring(math.random(1, 1000000000))
            local published, published_err = call_as(owner_id, { op = "create", title = "Published picker choice" })
            test.is_nil(published_err)
            local published_id = tostring((published :: any).id or "")
            test.is_true(published_id ~= "")

            local seeded = call_as(owner_id, { op = "apply", id = published_id, commands = {
                { type = C.NODE_ADD, body = { id = "start", kind = "start", title = "Start", config = {
                    input_schema = { type = "object", properties = {} },
                } } },
                { type = C.NODE_ADD, body = { id = "worker", kind = "block", ref = "app:block.engine_item_or_fail", title = "Do" } },
                { type = C.NODE_ADD, body = { id = "finish", kind = "finish", title = "Finish", config = {
                    output_schema = { type = "object", properties = {} },
                } } },
                { type = C.NODE_ADD, body = { id = "error", kind = "error", title = "Error", config = {
                    error_schema = { type = "object", properties = {} },
                } } },
                { type = C.EDGE_ADD, body = { id = "e1", source_id = "start", source_port = "out", target_id = "worker" } },
                { type = C.EDGE_ADD, body = { id = "e2", source_id = "worker", target_id = "finish", target_port = "in" } },
                { type = C.EDGE_ADD, body = { id = "e3", source_id = "worker", source_port = "failed", target_id = "error", target_port = "in" } },
            } })
            test.is_nil((seeded :: any).error)
            local released = call_as(owner_id, { op = "publish", id = published_id })
            test.is_nil((released :: any).error)
            test.is_true(((released :: any).result :: any).ok)

            local draft, draft_err = call_as(owner_id, { op = "create", title = "Draft picker choice" })
            test.is_nil(draft_err)
            local draft_id = tostring((draft :: any).id or "")
            test.is_true(draft_id ~= "")

            local listed = call_as(owner_id, { op = "list", published_only = true }) :: any
            test.is_nil(listed.error)
            local by_id: { [string]: any } = {}
            for _, row in ipairs(listed.rows or {}) do by_id[tostring((row :: any).id or "")] = row end
            test.not_nil(by_id[published_id])
            test.is_nil(by_id[draft_id])
            test.is_true(tonumber((by_id[published_id] :: any).published_version) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

-- seam: performed under the caller's actor via funcs.
local function seam(args: any): any
    args = type(args) == "table" and args or {}
    if args.op == "create" then
        local r, err = repo.create(args.title, args.parent_id, args.idempotency_key)
        return { id = r and (r :: any).id or nil, replayed = r and (r :: any).replayed or nil, error = err }
    elseif args.op == "seed_orphan" then
        local actor = security.actor()
        local aid = actor and actor:id() or "test"
        local id = "wf-orphan-" .. tostring(aid) .. "-" .. tostring(math.random(1, 1000000000))
        local _, err = workflow.apply(id, {
            { type = C.NODE_ADD, body = { id = "start", kind = "block", ref = "app:block.engine_linear", title = "Orphaned definition" } },
        }, aid)
        return { id = id, error = err }
    elseif args.op == "apply" then
        local actor = security.actor()
        local aid = actor and actor:id() or "test"
        local result, err = workflow.apply(tostring(args.id or ""), args.commands or {}, aid)
        return { result = result, error = err }
    elseif args.op == "publish" then
        local actor = security.actor()
        local aid = actor and actor:id() or "test"
        local result, err = version_publish.publish(args.id, aid)
        return { result = result, error = err }
    elseif args.op == "append_marker" then
        local db, db_err = store.open_db()
        if db_err or not db then return { error = db_err } end
        local head, head_err = store.head_seq(db, args.id)
        if head_err then db:release(); return { error = head_err } end
        local actor = security.actor()
        local aid = actor and actor:id() or "test"
        local err = store.append_event(db, args.id, (head or 0) + 1,
            "kickside.workflows.events:future.marker", {}, aid)
        db:release()
        return { error = err }
    elseif args.op == "list" then
        local rows, err = repo.list({ published_only = args.published_only == true })
        return { rows = rows or {}, error = err }
    elseif args.op == "require_access" then
        return { error = repo.require_access(args.id, args.mask) }
    elseif args.op == "delete" then
        local ok, err = repo.delete(args.id)
        return { success = ok, error = err }
    end
    return { error = "unknown op" }
end

local function run(options)
    return run_cases(options)
end

return { run = run, seam = seam }
