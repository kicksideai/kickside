local test = require("test")
local store = require("store")
local fixture = require("store_fixture")
local writer = require("workflow_fixture")
local workflow = require("workflow")
local types = require("types")
local json = require("json")
local uuid = require("uuid")

local function native(kind: string, retryable: boolean, label: string): error
    return (errors.new({ kind = kind, retryable = retryable, message = label,
        details = { code = label, nested = { retained = true } } }) :: error)
end
local function same(err: error?, source: error)
    test.not_nil(err)
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, source:details().code)
    test.is_true(err:details().nested.retained)
end
local function apply(): (any?, error?)
    return writer.apply("test-workflow", {{ type = types.COMMAND.PARAM_SET,
        body = { key = "value", value = 2 } }}, "tester")
end
return test.run_cases(function()
    test.describe("workflow history native error boundary", function()
        for _, phase in ipairs({ "open", "begin", "lock", "history", "state", "published", "head", "append", "project", "save", "commit", "post", "release" }) do
            test.it("preserves native fields at " .. phase, function()
                local source = native(errors.PERMISSION_DENIED, false, "busy unique serial refusal")
                local counts = fixture.reset({ [phase] = source })
                local value, err = apply()
                test.is_nil(value)
                same(err, source)
                test.eq(counts.open, 1)
                if phase ~= "open" then test.eq(counts.release, 1) end
            end)
        end
        for _, phase in ipairs({ "begin", "lock", "history", "state", "published", "head", "append", "project", "save", "commit" }) do
            test.it("returns a conflict at " .. phase .. " to the caller and commits nothing", function()
                local source = native(errors.CONFLICT, true, "opaque contention")
                local counts = fixture.reset({ [phase] = source })
                local value, err = apply()
                test.is_nil(value)
                test.eq(err:kind(), errors.CONFLICT)
                test.eq(err:message(), "workflow changed since you opened it, reload and retry")
                test.eq(err:details().code, "opaque contention")
                test.eq(counts.open, 1)
                test.eq(counts.release, 1)
                if phase ~= "commit" then test.is_nil(counts.commit) end
            end)
        end
        for _, source in ipairs({ native(errors.CONFLICT, false, "unique collision"),
            native(errors.UNAVAILABLE, false, "connection loss"), native(errors.UNAVAILABLE, true, "busy"),
            native(errors.INVALID, true, "serial"), native(errors.CANCELED, false, "locked") }) do
            test.it("retains refusal policy for " .. source:details().code, function()
                local counts = fixture.reset({ lock = source })
                local value, err = apply()
                test.is_nil(value)
                same(err, source)
                test.eq(counts.open, 1)
                test.eq(counts.rollback, 1)
            end)
        end
        for _, cleanup in ipairs({ "rollback", "release", "both" }) do
            test.it("composes " .. cleanup .. " failure on a conflict", function()
                local primary = native(errors.CONFLICT, true, "primary")
                local rollback = native(errors.INTERNAL, true, "rollback")
                local release = native(errors.UNAVAILABLE, true, "release")
                local counts = fixture.reset({ lock = primary,
                    rollback = cleanup ~= "release" and rollback or nil,
                    release = cleanup ~= "rollback" and release or nil })
                local value, err = apply()
                test.is_nil(value)
                test.eq(err:kind(), cleanup == "rollback" and rollback:kind() or release:kind())
                test.eq(err:retryable(), false)
                test.eq(counts.open, 1)
                test.eq(counts.rollback, 1)
                test.eq(counts.release, 1)
                local details = err:details()
                test.eq(details.code, cleanup == "rollback" and "rollback" or "release")
                local operation = details.operation_error
                if cleanup == "both" then
                    test.eq(operation.details.code, "rollback")
                    operation = operation.details.operation_error
                end
                test.eq(operation.kind, primary:kind())
                test.eq(operation.retryable, true)
                test.eq(operation.details.code, "primary")
                test.is_true(operation.details.nested.retained)
            end)
        end
        for _, phase in ipairs({ "post", "release" }) do
            test.it("prevents replay after commit when " .. phase .. " fails", function()
                local source = native(errors.CONFLICT, true, phase)
                local counts = fixture.reset({ [phase] = source })
                local value, err = apply()
                test.is_nil(value)
                test.eq(err:kind(), source:kind())
                test.eq(err:retryable(), false)
                test.eq(err:details().code, phase)
                test.eq(counts.open, 1)
                test.eq(counts.commit, 1)
                test.is_nil(counts.rollback)
            end)
        end
        test.it("checks cleanup on empty command and undo paths and snapshot reads", function()
            for _, action in ipairs({ "empty", "undo", "redo", "state" }) do
                local source = native(errors.PERMISSION_DENIED, false, "release")
                local counts = fixture.reset({ release = source })
                local value, err
                if action == "empty" then value, err = writer.apply("test-workflow", {}, "tester")
                elseif action == "state" then value, err = writer.state("test-workflow")
                else value, err = writer[action]("test-workflow", "tester") end
                test.is_nil(value)
                test.eq(err:kind(), source:kind())
                test.eq(err:details().code, "release")
                test.eq(counts.release, 1)
            end
        end)
        test.it("retains SQL driver classification through execute and query", function()
            local db = assert(store.open_db())
            local id = uuid.v4()
            local _, first = db:execute("INSERT INTO workflow_undo_history (workflow_id,tracker) VALUES ($1,$2)", { id, '{"undo":[],"redo":[]}' })
            test.is_nil(first, tostring(first))
            local duplicate = store._internals.exec(db,
                "INSERT INTO workflow_undo_history (workflow_id,tracker) VALUES ($1,$2)", { id, '{}' })
            local _, missing = store._internals.query(db, "SELECT * FROM workflow_missing_history_relation", {})
            local _, release_err = db:release()
            test.is_nil(release_err, tostring(release_err))
            test.eq(duplicate:kind(), errors.CONFLICT)
            test.eq(duplicate:retryable(), false)
            test.is_true(duplicate:details().sqlstate ~= nil or duplicate:details().sqlite_code ~= nil)
            test.eq(missing:kind(), errors.INTERNAL)
            test.eq(missing:retryable(), false)
            test.is_true(missing:details().sqlstate ~= nil or missing:details().sqlite_code ~= nil)
        end)
        test.it("preserves history JSON errors and classifies malformed stack shape", function()
            local db = assert(store.open_db())
            local id = uuid.v4()
            test.is_nil(store.lock_history(db, id))
            local cyclic: any = { undo = {}, redo = {} }
            cyclic.undo[1] = cyclic
            local _, expected_encode = json.encode(cyclic)
            local encoded_err = store.write_history(db, id, cyclic)
            local _, changed = db:execute("UPDATE workflow_undo_history SET tracker=$1 WHERE workflow_id=$2", { "invalid-json", id })
            test.is_nil(changed, tostring(changed))
            local _, expected_decode = json.decode("invalid-json")
            local _, decoded_err = store.read_history(db, id)
            local _, shaped = db:execute("UPDATE workflow_undo_history SET tracker=$1 WHERE workflow_id=$2", { '{}', id })
            test.is_nil(shaped, tostring(shaped))
            local _, shape_err = store.read_history(db, id)
            local _, release_err = db:release()
            test.is_nil(release_err, tostring(release_err))
            test.eq(encoded_err:kind(), expected_encode:kind())
            test.eq(encoded_err:retryable(), expected_encode:retryable())
            test.eq(decoded_err:kind(), expected_decode:kind())
            test.eq(decoded_err:retryable(), expected_decode:retryable())
            test.eq(shape_err:kind(), errors.INTERNAL)
            test.eq(shape_err:retryable(), false)
        end)
        for _, meta in ipairs({ "invalid-json", '{"direction":"invalid"}' }) do
            test.it("retains native layout read errors for " .. meta, function()
                local id = uuid.v4()
                local db = assert(store.open_db())
                local _, inserted_err = db:execute("INSERT INTO workflow_def_layout (workflow_id,node_id,x,y,meta) VALUES ($1,$2,0,0,$3)",
                    { id, types.LAYOUT_NODE_ID, meta })
                test.is_nil(inserted_err, tostring(inserted_err))
                local value, err = store.read_state(db, id)
                local _, release_err = db:release()
                test.is_nil(release_err, tostring(release_err))
                test.is_nil(value)
                if meta == "invalid-json" then
                    local _, expected = json.decode(meta)
                    test.eq(err:kind(), expected:kind())
                    test.eq(err:retryable(), expected:retryable())
                else
                    test.eq(err:kind(), errors.INTERNAL)
                    test.eq(err:retryable(), false)
                end
            end)
        end
        test.it("rolls back corrupt history without definition changes", function()
            local id = uuid.v4()
            local edited, edit_err = workflow.apply(id, {{ type = types.COMMAND.PARAM_SET,
                body = { key = "value", value = 1 } }}, "tester")
            test.is_nil(edit_err, tostring(edit_err))
            local db = assert(store.open_db())
            local _, changed = db:execute("UPDATE workflow_undo_history SET tracker=$1 WHERE workflow_id=$2", { '{}', id })
            test.is_nil(changed, tostring(changed))
            local value, err = workflow.apply(id, {{ type = types.COMMAND.PARAM_SET,
                body = { key = "value", value = 2 } }}, "tester")
            local raw, read_err = store.read_state(db, id)
            local _, release_err = db:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(release_err, tostring(release_err))
            test.is_nil(value)
            test.eq(err:kind(), errors.INTERNAL)
            test.eq(err:retryable(), false)
            test.eq(raw.params.value, 1)
            test.eq(raw.head_seq, edited.head_seq)
        end)
    end)
end)
