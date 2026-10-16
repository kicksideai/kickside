local test = require("test")
local json = require("json")
local resolve = require("inbox_resolve")
local inbox_types = require("inbox_types")

type Map = { [string]: any }

local function actor(id: string): any
    return { id = function(): string return id end }
end

local function reset(): ()
    resolve._security = nil
    resolve._reader = nil
    resolve._events = nil
    resolve._item_types = nil
    resolve._funcs = nil
end

local function setup(item: Map, item_type: Map, callbacks: Map, observed: Map, write_error: string?): ()
    local request_actor = actor("reviewer-1")
    local request_scope = { name = "review-scope" }
    resolve._security = {
        actor = function(): any return request_actor end,
        scope = function(): any return request_scope end,
    }
    resolve._reader = { get = function(id: string): any
        observed.read_id = id
        return item, nil
    end }
    resolve._item_types = { get = function(value: string): any
        observed.item_type = value
        return item_type, nil
    end }
    resolve._funcs = { new = function(): any
        local executor: any = {}
        function executor:with_actor(value: any): any observed.actor = value; return self end
        function executor:with_scope(value: any): any observed.scope = value; return self end
        function executor:call(target: string, args: any): any
            observed.calls = observed.calls or {}
            observed.calls[#observed.calls + 1] = { target = target, args = args }
            local callback = callbacks[target]
            if type(callback) == "function" then return callback(args) end
            return { ok = true }, nil
        end
        return executor, nil
    end }
    resolve._events = { resolution_event = function() return nil, nil end, _commit_resolution = function(id: string, status: string, meta: any): any
        observed.write = { id = id, status = status, action = meta.action, meta = meta }
        if write_error then return false, write_error, nil end
        return true, nil, {
            id = id,
            status = status,
            action = meta.action,
            resolution_id = meta.resolution_id,
            resolved_by = meta.resolved_by,
            form = meta.form,
        }
    end }
end

local function pending(metadata: Map?): Map
    return {
        id = "i1",
        item_type = "review",
        title = "Review",
        status = inbox_types.STATUS.PENDING,
        actor_id = "reviewer-1",
        metadata = metadata or {},
    }
end

local function run()
    test.describe("Inbox synchronous resolution", function()
        test.it("preserves the typed item-read failure", function()
            local observed: Map = {}
            setup(pending(), {}, {}, observed)
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "read-model unavailable", retryable = true })
            resolve._reader = { get = function() return nil, failure end }
            local result, err = resolve.apply("i1", "dismiss")
            reset()
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("returns object fields and commits an object form for plain Dismiss", function()
            local observed: Map = {}
            setup(pending(), { actions = { "dismiss" } }, {}, observed)
            local result, err = resolve.apply("i1", "dismiss")
            reset()
            test.is_nil(err)
            test.eq(json.encode((result :: any).form), "{}")
            test.eq(json.encode((result :: any).metadata), "{}")
            test.eq(json.encode(observed.write.meta.form), "{}")
        end)

        test.it("dismisses a removed declaration without running callbacks", function()
            local observed: Map = {}
            setup(pending(), {}, {}, observed)
            resolve._item_types = { get = function(): any return nil, errors.new({ kind = errors.NOT_FOUND, message = "type removed" }) end }
            local result, err = resolve.apply("i1", "dismiss")
            reset()
            test.is_nil(err)
            test.eq(result.status, inbox_types.STATUS.DISMISSED)
            test.eq(json.encode(observed.write.meta.form), "{}")
            test.eq(observed.write.meta.resolved_by, "reviewer-1")
            test.is_nil(observed.calls)
        end)

        test.it("refuses an orphan action and preserves declaration lookup failures", function()
            for _, case in ipairs({ { action = "approve", kind = errors.NOT_FOUND }, { action = "dismiss", kind = errors.INTERNAL } }) do
                local observed: Map = {}
                setup(pending(), {}, {}, observed)
                resolve._item_types = { get = function(): any return nil, errors.new({ kind = case.kind, message = "declaration unavailable" }) end }
                local result, err = resolve.apply("i1", case.action)
                reset()
                test.is_nil(result)
                test.contains(tostring(err), "declaration unavailable")
                test.is_nil(observed.calls)
                test.is_nil(observed.write)
            end
        end)

        test.it("uses declaration callbacks, action vocabulary, actor/scope, then writes", function()
            local observed: Map = {}
            local item = pending({ on_validate = "attacker:validate", on_resolve = "attacker:resolve" })
            setup(item, {
                value = "review",
                actions = { "approve", "reject" },
                on_validate = "review:validate",
                on_resolve = "review:resolve",
            }, {}, observed)

            local result, err = resolve.apply("i1", "approve", { note = "ok" })
            reset()
            test.is_nil(err)
            test.eq((result :: Map).status, inbox_types.STATUS.APPROVED)
            test.eq((result :: Map).action, "approve")
            test.eq(observed.item_type, "review")
            test.eq(#(observed.calls :: { any }), 2)
            test.eq(((observed.calls :: { any })[1] :: Map).target, "review:validate")
            test.eq(((observed.calls :: { any })[2] :: Map).target, "review:resolve")
            local args = (((observed.calls :: { any })[2] :: Map).args :: Map)
            test.eq(args.action, "approve")
            test.is_nil(args.decision)
            test.eq(args.resolution_id, "resolve:i1")
            test.eq((args.form :: Map).note, "ok")
            test.eq(observed.actor:id(), "reviewer-1")
            test.eq((observed.scope :: Map).name, "review-scope")
            test.eq((observed.write :: Map).action, "approve")
            test.eq(((observed.write :: Map).meta :: Map).resolution_id, "resolve:i1")
        end)

        test.it("accepts a declared custom action with generic resolved status", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "apply", "skip" } }, {}, observed)
            local result, err = resolve.apply("i1", "apply")
            reset()
            test.is_nil(err)
            test.eq((result :: Map).action, "apply")
            test.eq((result :: Map).status, inbox_types.STATUS.RESOLVED)
            test.eq((observed.write :: Map).status, inbox_types.STATUS.RESOLVED)
        end)

        test.it("returns a validation refusal without invoking the effect or writer", function()
            local observed: Map = {}
            setup(pending(), {
                value = "review", actions = { "approve" },
                on_validate = "review:validate", on_resolve = "review:resolve",
            }, {
                ["review:validate"] = function(): any
                    return { refusal = { code = "note_required", message = "note is required" } }, nil
                end,
            }, observed)
            local result, err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(result)
            test.eq((err :: Map).callback_refusal, true)
            test.eq((err :: Map).code, "note_required")
            test.eq(#(observed.calls :: { any }), 1)
            test.is_nil(observed.write)
        end)

        for _, phase in ipairs({"on_validate", "on_resolve"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, retryable in ipairs({false, true}) do
                    test.it("preserves callback " .. phase .. " " .. kind .. " " .. tostring(retryable), function()
                        local observed: Map = {}
                        local declaration: Map = {value = "review", actions = {"approve"}}
                        declaration[phase] = "review:native"
                        local source = errors.new({kind = kind, retryable = retryable, message = "native callback refusal",
                            details = {code = "callback_refused", nested = {generation = 9}}})
                        setup(pending(), declaration, {["review:native"] = function(): any return nil, source end}, observed)
                        local result, err = resolve.apply("i1", "approve")
                        reset()
                        test.is_nil(result)
                        test.is_true(errors.is(err, kind), tostring(err))
                        test.eq((err :: any):retryable(), retryable)
                        test.eq((err :: any):details().code, "callback_refused")
                        test.eq((err :: any):details().nested.generation, 9)
                        test.eq(#(observed.calls :: {any}), 1)
                        test.is_nil(observed.write)
                    end)
                end
            end
        end

        test.it("keeps the item pending when the synchronous effect fails", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "approve" }, on_resolve = "review:resolve" }, {
                ["review:resolve"] = function(): any return nil, "provider unavailable" end,
            }, observed)
            local result, err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(result)
            test.contains(tostring(err), "provider unavailable")
            test.is_nil(observed.write)
        end)

        test.it("rejects undeclared actions before any callback or write", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "approve" }, on_resolve = "review:resolve" }, {}, observed)
            local result, err = resolve.apply("i1", "reject")
            reset()
            test.is_nil(result)
            test.contains(tostring(err), inbox_types.ERROR.ACTION_NOT_ALLOWED)
            test.is_nil(observed.calls)
            test.is_nil(observed.write)
        end)

        test.it("reuses one resolution id if callback success is followed by append failure", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "approve" }, on_resolve = "review:resolve" }, {}, observed, "append failed")
            local first, first_err = resolve.apply("i1", "approve")
            local second, second_err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(first); test.is_nil(second)
            test.contains(tostring(first_err), "append failed")
            test.contains(tostring(second_err), "append failed")
            test.eq(#(observed.calls :: { any }), 2)
            local first_args = (((observed.calls :: { any })[1] :: Map).args :: Map)
            local second_args = (((observed.calls :: { any })[2] :: Map).args :: Map)
            test.eq(first_args.resolution_id, "resolve:i1")
            test.eq(second_args.resolution_id, first_args.resolution_id)
        end)

        test.it("rejects a durable resolution before callbacks despite a pending projection", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "approve" }, on_resolve = "review:resolve" }, {}, observed)
            resolve._events.resolution_event = function(id: string): any
                observed.resolution_lookup = id
                return { event_id = "durable-resolution" }, nil
            end
            local result, err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(result)
            test.contains(tostring(err), inbox_types.ERROR.ALREADY_RESOLVED)
            test.eq(observed.resolution_lookup, "i1")
            test.is_nil(observed.calls)
            test.is_nil(observed.write)
        end)

        test.it("fails closed when the durable resolution lookup fails", function()
            local observed: Map = {}
            setup(pending(), { value = "review", actions = { "approve" }, on_resolve = "review:resolve" }, {}, observed)
            resolve._events.resolution_event = function(): any return nil, "lookup unavailable" end
            local result, err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(result)
            test.contains(tostring(err), "lookup unavailable")
            test.is_nil(observed.calls)
            test.is_nil(observed.write)
        end)

        test.it("refuses an item owned by another actor", function()
            local observed: Map = {}
            local item = pending(); item.actor_id = "reviewer-2"
            setup(item, { value = "review", actions = { "approve" } }, {}, observed)
            local result, err = resolve.apply("i1", "approve")
            reset()
            test.is_nil(result)
            test.contains(tostring(err), inbox_types.ERROR.NOT_FOUND)
            test.is_nil(observed.write)
        end)
    end)
end

return { run = test.run_cases(run) }
