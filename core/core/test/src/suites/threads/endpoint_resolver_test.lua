-- Tests for kickside.core.threads:endpoint_resolver.
--
-- Covers resolve() URI parsing (scheme/target/context with {self} substitution)
-- and write() dispatch across the three via branches: thread (hits the real
-- threads contract over the test thread engine, driven through a funcs:call frame
-- so the resolver inherits the actor ambiently), func:// and contract:// (the
-- contract/funcs modules are stubbed so the dispatch path is asserted without a
-- live backing).

local test = require("test")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")
local resolver = require("endpoint_resolver")

local THREADS = "kickside.core:threads"
-- Test helper that calls resolver.write from inside a funcs:call frame so the
-- thread branch inherits the call's actor/scope ambiently.
local RESOLVER_WRITE = "app:endpoint_resolver_test_write"

local function test_scope(): any
    local pol, perr = security.policy("app:test_scope_policy")
    if not pol then error("test policy missing: " .. tostring(perr)) end
    return security.new_scope({ pol })
end

-- Inject funcs/contract stubs through the resolver's module seam for the duration
-- of a case so func:// and contract:// dispatch can be asserted without a live
-- backing.
local function with_stubs(stubs: any, fn)
    local prior: any = {}
    for name, value in pairs(stubs) do
        prior[name] = resolver._modules[name]
        resolver._modules[name] = value
    end
    local ok, err = pcall(fn)
    for name, _ in pairs(stubs) do
        resolver._modules[name] = prior[name]
    end
    if not ok then error(err) end
end

local function define_tests()
    test.describe("kickside.automation:endpoint_resolver", function()

        test.describe("native endpoint failures", function()
            test.it("returns nonretryable Invalid errors with stable validation codes", function()
                local cases = {
                    {method = "resolve", endpoint = {}, code = "endpoint_owner_required"},
                    {method = "resolve", endpoint = {via = "broken"}, owner = "owner", code = "endpoint_via_invalid"},
                    {method = "write", endpoint = {via = "thread"}, owner = "owner", code = "endpoint_event_type_required"},
                    {method = "write", endpoint = {via = "other://target"}, owner = "owner", code = "endpoint_scheme_unsupported"},
                    {method = "read", endpoint = {via = "other://target"}, owner = "owner", code = "endpoint_scheme_unsupported"},
                    {method = "read", endpoint = {via = "thread"}, owner = "owner", code = "endpoint_source_event_driven"},
                }
                for _, case in ipairs(cases) do
                    local result, err
                    if case.method == "resolve" then
                        result, err = resolver.resolve(case.endpoint, case.owner)
                    else
                        result, err = resolver[case.method](case.endpoint, {}, case.owner)
                    end
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID), case.code .. " requires Invalid")
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, case.code)
                end
            end)

            test.it("keeps native kinds and metadata at every backing failure stage", function()
                local routes = {
                    {method = "write", via = "func://app:target", stages = {"get", "call"}},
                    {method = "read", via = "func://app:target", stages = {"get", "call"}},
                    {method = "write", via = "contract://app:definition@app:binding", stages = {"get", "open", "call"}},
                    {method = "read", via = "contract://app:definition", stages = {"get", "open", "call"}},
                    {method = "write", via = "thread", stages = {"get", "open", "call"}},
                }
                for _, route in ipairs(routes) do
                    for _, stage in ipairs(route.stages) do
                        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                                local source = errors.new({kind = kind, message = "backing fails",
                                    retryable = policy.retryable,
                                    details = {code = "backing_failure", nested = {marker = "kept"}}})
                                local function fail(): (table, error)
                                    return {partial = true}, source
                                end
                                local instance = {write = fail, pull = fail, append_event = fail}
                                local definition = {
                                    with_context = function(self) return self end,
                                    open = function()
                                        if stage == "open" then return nil, source end
                                        return instance, nil
                                    end,
                                }
                                local executor = {
                                    with_context = function(self) return self end,
                                    call = fail,
                                }
                                with_stubs({
                                    contract = {get = function()
                                        if stage == "get" then return nil, source end
                                        return definition, nil
                                    end},
                                    funcs = {new = function()
                                        if stage == "get" then return nil, source end
                                        return executor, nil
                                    end},
                                }, function()
                                    local result, err = resolver[route.method](
                                        {via = route.via, type = "app:event"}, {}, "owner")
                                    test.is_nil(result)
                                    local label = route.method .. " " .. route.via .. " " .. stage
                                    test.is_true(errors.is(err, kind), label .. " preserves native kind")
                                    test.eq(err:retryable(), policy.retryable, label .. " retryable")
                                    test.eq(err:details().code, "backing_failure")
                                    test.eq(err:details().nested.marker, "kept")
                                    test.eq(err:message(), source:message())
                                end)
                            end
                        end
                    end
                end
            end)

            test.it("reports a backing missing its value and error as nonretryable Internal", function()
                with_stubs({funcs = {new = function() return nil, nil end},
                    contract = {get = function() return nil, nil end}}, function()
                    for _, method in ipairs({"read", "write"}) do
                        for _, via in ipairs({"func://app:target", "contract://app:definition"}) do
                            local result, err = resolver[method]({via = via}, {}, "owner")
                            test.is_nil(result)
                            test.is_true(errors.is(err, errors.INTERNAL))
                            test.eq(err:retryable(), false)
                            test.eq(err:details().code, "endpoint_backing_missing")
                        end
                    end
                end)
            end)
        end)

        -- ─── resolve() URI parsing ──────────────────────────────────────
        test.describe("resolve", function()
            test.it("defaults a missing via to the component's own thread", function()
                local d, err = resolver.resolve({ type = "x.evt" }, "comp-1")
                test.is_nil(err)
                test.not_nil(d)
                test.eq(d.scheme, "thread")
                test.eq(d.target, "comp-1")
            end)

            test.it("treats the `thread` shorthand as thread://{self}", function()
                local d, err = resolver.resolve({ type = "x.evt", via = "thread" }, "comp-2")
                test.is_nil(err)
                test.eq(d.scheme, "thread")
                test.eq(d.target, "comp-2")
            end)

            test.it("parses func:// with a query-string into target + context", function()
                local d, err = resolver.resolve({ via = "func://app:send?channel_id={self}&mode=fast" }, "comp-3")
                test.is_nil(err)
                test.eq(d.scheme, "func")
                test.eq(d.target, "app:send")
                test.eq(d.context.channel_id, "comp-3")
                test.eq(d.context.mode, "fast")
            end)

            -- A contract:// via carries the contract's context_required params in its
            -- query-string; the resolver substitutes {self} -> owning component id so
            -- one contract serves many components, each binding its own context.
            test.it("parses contract:// and resolves {self} in the context table", function()
                local d, err = resolver.resolve(
                    { via = "contract://kickside.knowledge:embeddable?component_id={self}&kb_id=K9" },
                    "comp-4"
                )
                test.is_nil(err)
                test.eq(d.scheme, "contract")
                test.eq(d.target, "kickside.knowledge:embeddable")
                test.eq(d.context.component_id, "comp-4")
                test.eq(d.context.kb_id, "K9")
            end)

            test.it("splits a contract target@binding suffix", function()
                local d, err = resolver.resolve({ via = "contract://a:c@some.module:bind?x={self}" }, "comp-5")
                test.is_nil(err)
                test.eq(d.target, "a:c")
                test.eq(d.binding, "some.module:bind")
                test.eq(d.context.x, "comp-5")
            end)

            test.it("accepts a component row carrying component_id", function()
                local d, err = resolver.resolve({ type = "x" }, { component_id = "row-comp" })
                test.is_nil(err)
                test.eq(d.target, "row-comp")
            end)

            test.it("errors without an owning component id", function()
                local d, err = resolver.resolve({ type = "x" }, nil)
                test.is_nil(d)
                test.not_nil(err)
            end)
        end)

        -- ─── write() dispatch: func:// ──────────────────────────────────
        test.describe("write func://", function()
            test.it("calls the function with the body, passing the context", function()
                local recorded: any = {}
                local funcs_stub = {
                    new = function(): any
                        return {
                            with_context = function(self: any, ctx: any): any
                                recorded.context = ctx
                                return self
                            end,
                            call = function(_self: any, target: any, body: any): (any?, any?)
                                recorded.target = target
                                recorded.body = body
                                return { ok = true }, nil
                            end,
                        }, nil
                    end,
                }
                with_stubs({ funcs = funcs_stub }, function()
                    local res, err = resolver.write(
                        { via = "func://app:send?channel_id={self}" },
                        { content = "hi" },
                        "comp-9"
                    )
                    test.is_nil(err)
                    test.not_nil(res)
                end)
                test.eq(recorded.target, "app:send")
                test.eq(recorded.body.content, "hi")
                test.eq(recorded.context.channel_id, "comp-9")
            end)
        end)

        -- ─── write() dispatch: contract:// ──────────────────────────────
        test.describe("write contract://", function()
            test.it("opens the contract with context and calls write", function()
                local recorded: any = {}
                local contract_stub = {
                    get = function(id: any): (any?, any?)
                        recorded.contract_id = id
                        return {
                            with_context = function(self: any, ctx: any): any
                                recorded.context = ctx
                                return self
                            end,
                            open = function(_self: any, binding: any): (any?, any?)
                                recorded.binding = binding
                                return {
                                    write = function(_inst: any, body: any): (any?, any?)
                                        recorded.body = body
                                        return { embedded = true }, nil
                                    end,
                                }, nil
                            end,
                        }, nil
                    end,
                }
                with_stubs({ contract = contract_stub }, function()
                    local res, err = resolver.write(
                        { via = "contract://kickside.knowledge:embeddable?component_id={self}&kb_id=K9" },
                        { content = "doc" },
                        "comp-10"
                    )
                    test.is_nil(err)
                    test.not_nil(res)
                end)
                test.eq(recorded.contract_id, "kickside.knowledge:embeddable")
                test.eq(recorded.context.component_id, "comp-10")
                test.eq(recorded.context.kb_id, "K9")
                test.eq(recorded.body.content, "doc")
            end)
        end)

        -- ─── write() dispatch: thread (real threads contract) ───────────
        test.describe("write thread", function()
            test.it("appends the event to the component's own thread", function()
                local owner = "resolver-test-" .. uuid.v4():sub(1, 8)
                local actor = security.new_actor(owner, { security_groups = {} })
                local scope = test_scope()

                -- Create the backing thread/component through the contract so the
                -- actor owns it (append_event gates WRITE on it).
                local svc, cerr = contract.get(THREADS)
                test.is_nil(cerr, "threads contract.get: " .. tostring(cerr))
                local inst, oerr = (svc :: any):with_actor(actor):with_scope(scope):open()
                test.is_nil(oerr, "threads open: " .. tostring(oerr))
                local created, create_err = (inst :: any):create({ thread_class = "resolver.test",
                    impl_id = "app:threads_test_event_kind" })
                test.is_nil(create_err, "thread create: " .. tostring(create_err))
                local thread_id = (created :: any).thread_id

                -- Drive resolver.write through a funcs:call frame so its thread
                -- branch inherits the actor/scope ambiently, the production path.
                local res, write_err = funcs.new():with_actor(actor):with_scope(scope):call(RESOLVER_WRITE, {
                    endpoint = { type = "app:threads_resolver", via = "thread" },
                    body = { value = 42 },
                    owning = thread_id,
                })
                test.is_nil(write_err, "resolver.write thread: " .. tostring(write_err))
                test.not_nil(res)

                local listed, list_err = (inst :: any):list_events({ thread_id = thread_id })
                test.is_nil(list_err, "list_events: " .. tostring(list_err))
                local found = false
                for _, e in ipairs((listed :: any).events) do
                    if e.type == "app:threads_resolver" then found = true end
                end
                test.is_true(found, "appended event present in thread log")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
