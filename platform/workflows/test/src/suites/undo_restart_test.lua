local test = require("test")
local funcs = require("funcs")
local security = require("security")
local repo = require("workflow_repo")
local uuid = require("uuid")
local workflow = require("workflow")
local store = require("store")
local types = require("types")

local function ok(result: any, err: any): any
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    return result
end

local function apply(id: string, payload: any): any
    return ok(workflow.apply(id, payload.commands, payload.actor))
end

local function undo(id: string): any
    return ok(workflow.undo(id, "editor"))
end

local function redo(id: string): any
    return ok(workflow.redo(id, "editor"))
end

local function state(id: string): any
    return ok(workflow.state(id))
end

local function history(id: string): any
    local db, db_err = store.open_db()
    test.is_nil(db_err, tostring(db_err))
    local tracker, err = store.read_history(db, id)
    db:release()
    test.is_nil(err, tostring(err))
    return tracker
end

local function labels(value: string): any
    return { actor = "editor", commands = {
        { type = types.COMMAND.LABELS_SET, body = { labels = { value } } },
    } }
end

local function call_as(actor_id: string, args: any): any
    local actor, actor_err = security.new_actor(actor_id, {})
    test.is_nil(actor_err)
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    test.is_nil(policy_err)
    local scope, scope_err = security.new_scope({ policy })
    test.is_nil(scope_err)
    local result, err = funcs.new():with_actor(actor):with_scope(scope):call("app:undo_access_probe", args)
    test.is_nil(err, tostring(err))
    return result
end

local function access_probe(args: any): any
    if args.topic == "create" then
        local created, err = repo.create("Durable history access")
        return { id = created and created.id, error = err }
    end
    local mask = args.topic == "status" and repo.ACCESS.READ or repo.ACCESS.WRITE
    local access_err = repo.require_access(args.id, mask)
    if access_err then return { success = false, kind = access_err:kind() } end
    if args.topic == "status" then return { success = true, state = state(args.id) } end
    local result: any
    if args.topic == "apply" then result = apply(args.id, args.payload)
    elseif args.topic == "undo" then result = undo(args.id)
    else result = redo(args.id) end
    result.success = true
    return result
end

local function define_tests()
    test.describe("Durable Workflow undo", function()
        test.it("keeps undo and redo flags in durable history", function()
            local id = uuid.v4()
            local applied = apply(id, labels("first"))
            test.is_true(applied.can_undo)
            local status = state(id)
            test.is_true(status.can_undo)
            test.is_false(status.can_redo)
            test.eq(status.labels[1], "first")
            local undone = undo(id)
            test.eq(#undone.state.labels, 0)
            test.is_true(undone.can_redo)
            status = state(id)
            test.is_false(status.can_undo)
            test.is_true(status.can_redo)
            local redone = redo(id)
            test.eq(redone.state.labels[1], "first")
            status = state(id)
            test.is_true(status.can_undo)
            test.is_false(status.can_redo)
        end)

        test.it("records every committed write in one history", function()
            local id = uuid.v4()
            apply(id, labels("first"))
            local payload = labels("second")
            local applied, err = workflow.apply(id, payload.commands, payload.actor)
            test.is_nil(err, tostring(err))
            test.not_nil(applied)
            local undone = undo(id)
            test.eq(undone.state.labels[1], "first")
            undone = undo(id)
            test.eq(#undone.state.labels, 0)
        end)

        test.it("keeps redo after a rejected edit and clears it only after a committed edit", function()
            local id = uuid.v4()
            apply(id, labels("first"))
            undo(id)
            local failed, err = workflow.apply(id, { { type = "unknown-command", body = {} } }, "editor")
            test.is_nil(failed)
            test.not_nil(err)
            test.is_true(state(id).can_redo)
            apply(id, labels("replacement"))
            local status = state(id)
            test.is_true(status.can_undo)
            test.is_false(status.can_redo)
            test.eq(status.labels[1], "replacement")
        end)
        test.it("rolls back definition events when history persistence fails", function()
            local id = uuid.v4()
            local payload = labels("first")
            local applied, apply_err = workflow.apply(id, payload.commands, payload.actor)
            test.is_nil(apply_err, tostring(apply_err))
            test.not_nil(applied)
            local save = store.write_history
            store.write_history = function(_handle: any, _id: string, _tracker: any): string?
                return "history write refused"
            end
            payload = labels("rejected")
            local rejected, err = workflow.apply(id, payload.commands, payload.actor)
            store.write_history = save
            test.is_nil(rejected)
            test.eq(tostring(err), "history write refused")
            local current = state(id)
            test.eq(current.labels[1], "first")
            test.eq(current.head_seq, applied.head_seq)
            test.is_true(current.can_undo)
            local undone, undo_err = workflow.undo(id, "editor")
            test.is_nil(undo_err, tostring(undo_err))
            test.eq(#undone.state.labels, 0)
        end)

        test.it("restores the exact bounded batches for each workflow", function()
            local id, other = uuid.v4(), uuid.v4()
            apply(other, labels("other"))
            for i = 1, types.MAX_UNDO + 5 do apply(id, labels(tostring(i))) end
            local tracker = history(id)
            test.eq(#tracker.undo, types.MAX_UNDO)
            test.eq(#tracker.redo, 0)
            test.eq(tracker.undo[1].forward[1].body.labels[1], "6")
            test.eq(tracker.undo[1].inverse[1].body.labels[1], "5")
            for i = types.MAX_UNDO + 4, 5, -1 do
                local result = undo(id)
                test.eq(result.state.labels[1], tostring(i))
            end
            local status = state(id)
            test.is_false(status.can_undo)
            test.is_true(status.can_redo)
            for i = 6, types.MAX_UNDO + 5 do
                test.eq(redo(id).state.labels[1], tostring(i))
            end
            test.is_false(state(id).can_redo)
            test.eq(state(other).labels[1], "other")
            test.eq(#undo(other).state.labels, 0)
        end)

        test.it("keeps restored history under the workflow access gate", function()
            local owner, stranger = uuid.v4(), uuid.v4()
            local created = call_as(owner, { topic = "create" })
            test.is_nil(created.error)
            test.not_nil(created.id)
            test.is_true(call_as(owner, { id = created.id, topic = "apply", payload = labels("private") }).success)
            test.is_true(call_as(owner, { id = created.id, topic = "status" }).state.can_undo)
            for _, topic in ipairs({ "status", "undo", "redo" }) do
                local denied = call_as(stranger, { id = created.id, topic = topic })
                test.is_false(denied.success)
                test.eq(denied.kind, errors.PERMISSION_DENIED)
                test.is_nil(denied.state)
                test.is_nil(denied.events)
            end
            test.eq(state(created.id).labels[1], "private")
            test.eq(#call_as(owner, { id = created.id, topic = "undo" }).state.labels, 0)
            test.eq(call_as(owner, { id = created.id, topic = "redo" }).state.labels[1], "private")
        end)

        test.it("purges definition history with its Workflow owner", function()
            local id = uuid.v4()
            apply(id, labels("first"))
            local purged, purge_err = workflow.purge(id)
            test.is_nil(purge_err, tostring(purge_err))
            test.is_true(purged)
            local db, db_err = store.open_db()
            test.is_nil(db_err)
            local rows, read_err = db:query("SELECT workflow_id FROM workflow_undo_history WHERE workflow_id=$1", { id })
            db:release()
            test.is_nil(read_err)
            test.eq(#rows, 0)
            local state = state(id)
            test.eq(state.head_seq, 0)
            test.eq(#state.labels, 0)
            test.is_false(state.can_undo)
            test.is_false(state.can_redo)
        end)
    end)
end

return { run = test.run_cases(define_tests), access_probe = access_probe }
