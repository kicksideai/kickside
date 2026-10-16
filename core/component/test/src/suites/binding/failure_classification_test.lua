-- Every component_service method classifies every failure it returns: a malformed
-- request is INVALID, an access refusal is PERMISSION_DENIED (a "not found or access
-- denied" answer keeps concealing existence), a known absence or conflict keeps its
-- kind, and a failed query or lifecycle record is INTERNAL. The client surfaces the
-- service's kind as a typed error.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local read_port = require("read_port")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local PROBE = "app:context_revision_probe"

local COMPONENTS = "kickside_components"
local META = "kickside_component_meta"

local IMPL = "kickside.test:failure_classification"
local PORTABLE_IMPL = "app:portable_impl"
local FAILING_CREATE_IMPL = "kickside.test:failing_lifecycle_create"
local FAILING_DELETE_IMPL = "kickside.test:failing_lifecycle_delete"
local NON_PORTABLE_IMPL = "app:deletable_ok_binding"
local TYPED_FAILURE_DELETABLE_IMPL = "app:deletable_typed_failure_binding"
local NOT_INSTALLED_IMPL = "kickside.test:not_installed"

local CONCEALED = "Component not found or access denied"

local function same_data(actual: any, expected: any)
    test.eq(type(actual), type(expected))
    if type(expected) ~= "table" then test.eq(actual, expected); return end
    for key, value in pairs(expected) do same_data(actual[key], value) end
    for key, _ in pairs(actual) do test.not_nil(expected[key]) end
end

local function define_tests()
    test.describe("Component service failure classification", function()
        local suffix = uuid.v4():sub(1, 8)
        local users = {
            owner = "fc-owner-" .. suffix,
            reader = "fc-reader-" .. suffix,
            stranger = "fc-stranger-" .. suffix,
        }
        local fx: { [string]: any } = {}
        local hidden: { [string]: boolean } = {}

        -- Scopes are a broad base allow plus the named denies (deny wins).
        local DENIES: { [string]: { string } } = {
            restricted = { "app:restricted_scope_policy" },
            registry_denied = { "app:deny_portable_registry_policy" },
            open_denied = { "app:deny_service_open_policy" },
            call_denied = { "app:deny_access_context_call_policy", "app:deny_access_context_by_meta_call_policy" },
        }

        local function scope_of(name)
            local deny_ids = name and DENIES[name]
            if not deny_ids then
                local pol, perr = security.policy("app:test_scope_policy")
                if not pol then error("test policy missing: " .. tostring(perr)) end
                return security.new_scope({ pol })
            end
            local base, berr = security.policy("app:restricted_base_policy")
            if not base then error("restricted base policy missing: " .. tostring(berr)) end
            local policies: { security.Policy } = { base }
            for _, id in ipairs(deny_ids) do
                local deny, derr = security.policy(id)
                if not deny then error("deny policy missing: " .. id .. ": " .. tostring(derr)) end
                table.insert(policies, deny)
            end
            return security.new_scope(policies)
        end

        local function actor_of(name)
            local id = users[name]
            if not id then error("unknown test user: " .. tostring(name)) end
            return security.new_actor(id, { security_groups = {} })
        end

        local function service(actor_name, scope_name)
            local svc, err = contract.get(COMPONENT_SERVICE)
            if err or not svc then error("component_service unavailable: " .. tostring(err)) end
            local inst, oerr = svc:with_actor(actor_of(actor_name or "owner")):with_scope(scope_of(scope_name)):open()
            if oerr or not inst then error("open failed: " .. tostring(oerr)) end
            return inst
        end

        local function probe(args, scope_name)
            local res, err = funcs.new():with_actor(actor_of("owner")):with_scope(scope_of(scope_name)):call(PROBE, args)
            if err then error("probe call failed: " .. tostring(err)) end
            return res
        end

        local function exec(statement)
            local d, derr = sql.get(DB)
            if derr then error("db connect failed: " .. tostring(derr)) end
            local _, err = d:execute(statement)
            d:release()
            if err then error(statement .. ": " .. tostring(err)) end
        end

        -- Renaming a table makes every query against it fail, a storage failure the
        -- service cannot tell from a lost connection. after_each restores it.
        local function hide(tbl)
            exec("ALTER TABLE " .. tbl .. " RENAME TO " .. tbl .. "_hidden")
            hidden[tbl] = true
        end

        local function native_sql_failure(tbl: string, execute: boolean?): error
            local db, db_err = sql.get(DB)
            if db_err or not db then error(db_err or errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL cause guard needs database"})) end
            local cause: error? = nil
            if execute then local _, err = db:execute("DELETE FROM " .. tbl .. " WHERE 1=0"); cause = err
            else local _, err = db:query("SELECT * FROM " .. tbl .. " WHERE 1=0"); cause = err end
            local _, release_err = db:release()
            if release_err then error(release_err) end
            if not cause then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL cause guard needs native failure"})) end
            return cause
        end

        local function restore_hidden()
            for tbl in pairs(hidden) do
                exec("ALTER TABLE " .. tbl .. "_hidden RENAME TO " .. tbl)
                hidden[tbl] = nil
            end
        end

        local function register(impl_id, extra)
            local req: { [string]: any } = {
                impl_id = impl_id,
                meta = { title = "fc", label = "fc-" .. uuid.v4():sub(1, 8) },
                private_context = { v = 1 },
            }
            for k, v in pairs(extra or {}) do req[k] = v end
            local reg = service("owner"):register(req)
            if not reg.success then error("register failed: " .. tostring(reg.error)) end
            return reg.component_id
        end

        test.before_all(function()
            fx.cid = register(IMPL, { meta = { title = "fc", label = "fc-single-" .. suffix } })
            fx.parent = register(IMPL)
            fx.child = register(IMPL, { parent_id = fx.parent })
            fx.portable = register(PORTABLE_IMPL)
            fx.dup_label = "fc-dup-" .. suffix
            register(IMPL, { meta = { title = "fc", label = fx.dup_label } })
            register(IMPL, { meta = { title = "fc", label = fx.dup_label } })
            fx.shared = register(IMPL, {
                additional_access = { { subject_id = users.reader, subject_type = "user", access_mask = 1 } },
            })
            fx.failing_delete = register(FAILING_DELETE_IMPL)
            -- A stored context JSON with a null array hole decodes to a sparse table,
            -- which the portable envelope cannot encode.
            fx.unencodable = register(PORTABLE_IMPL)
            exec("UPDATE " .. COMPONENTS .. " SET private_context = '{\"list\":[1,null,3]}' WHERE component_id = '" .. fx.unencodable .. "'")
            fx.non_portable = register(NON_PORTABLE_IMPL)
            fx.not_installed = register(NOT_INSTALLED_IMPL)
            for _, kind in ipairs({ errors.TIMEOUT, errors.CANCELED, errors.RATE_LIMITED, errors.UNAVAILABLE }) do
                fx["typed_" .. kind] = register(TYPED_FAILURE_DELETABLE_IMPL, { private_context = { fail_kind = kind } })
            end
        end)

        test.after_each(restore_hidden)
        test.after_all(function()
            -- This fixture models a permanently unavailable lifecycle store.
            -- Its failed delete intentionally leaves a mark; clear the fixture's
            -- mark so it does not poison unrelated retention-slot tests.
            if fx.failing_delete then
                exec("UPDATE " .. COMPONENTS .. " SET deleting_at=NULL WHERE component_id='"
                    .. tostring(fx.failing_delete) .. "'")
            end
        end)

        local function shell(impl_id)
            return json.encode({ schema_version = 1, impl_id = impl_id, meta = {}, context = {} })
        end

        -- { name, method, request(fx), kind, actor?, scope?, hide?, error? }
        local cases = {
            -- Malformed requests.
            { name = "register without impl_id", method = "register", request = function() return {} end, kind = errors.INVALID },
            { name = "register with a bad additional_access", method = "register", request = function() return { impl_id = IMPL, additional_access = { "x" } } end, kind = errors.INVALID },
            { name = "get without component_id", method = "get", request = function() return {} end, kind = errors.INVALID },
            { name = "get_access_context with a bad access_mask", method = "get_access_context", request = function(f) return { component_id = f.cid, access_mask = 0 } end, kind = errors.INVALID },
            { name = "get_access_context_by_meta with empty meta", method = "get_access_context_by_meta", request = function() return { meta = {} } end, kind = errors.INVALID },
            { name = "get_access_context_by_meta matching several components", method = "get_access_context_by_meta", request = function(f) return { meta = { label = f.dup_label } } end, kind = errors.INVALID },
            { name = "list with non-table filters", method = "list", request = function() return { filters = "x" } end, kind = errors.INVALID },
            { name = "list with an out-of-range limit", method = "list", request = function() return { pagination = { limit = 0 } } end, kind = errors.INVALID },
            { name = "query with a bad access_mask", method = "query", request = function() return { access_mask = 0 } end, kind = errors.INVALID },
            { name = "count with a bad access_mask", method = "count", request = function() return { access_mask = 0 } end, kind = errors.INVALID },
            { name = "list_children with an empty parent_id", method = "list_children", request = function() return { parent_id = "" } end, kind = errors.INVALID },
            { name = "export without component_id", method = "export", request = function() return {} end, kind = errors.INVALID },
            { name = "export of a non-portable impl", method = "export", request = function(f) return { component_id = f.non_portable } end, kind = errors.INVALID },
            { name = "import without a shell", method = "import", request = function() return {} end, kind = errors.INVALID },
            { name = "import of undecodable JSON", method = "import", request = function() return { shell = "{" } end, kind = errors.INVALID },
            { name = "import of an unsupported envelope", method = "import", request = function() return { shell = json.encode({ schema_version = 99 }) } end, kind = errors.INVALID },
            { name = "import with an unknown slot", method = "import", request = function() return { shell = shell(PORTABLE_IMPL), slot_values = { nope = "x" } } end, kind = errors.INVALID },
            { name = "list_access without component_id", method = "list_access", request = function() return {} end, kind = errors.INVALID },
            { name = "delete without component_id", method = "delete", request = function() return {} end, kind = errors.INVALID },
            { name = "delete with an unknown child_policy", method = "delete", request = function(f) return { component_id = f.cid, child_policy = "cascade" } end, kind = errors.INVALID },
            { name = "update without commands", method = "update", request = function(f) return { component_id = f.cid } end, kind = errors.INVALID },
            { name = "update with a malformed command", method = "update", request = function(f) return { component_id = f.cid, commands = { false } } end, kind = errors.INVALID, error = "commands[1] must be a table" },
            { name = "set_meta without fields", method = "set_meta", request = function(f) return { component_id = f.cid } end, kind = errors.INVALID },
            { name = "set_placement without component_id", method = "set_placement", request = function() return {} end, kind = errors.INVALID },
            { name = "grant_subtree without root", method = "grant_subtree", request = function() return {} end, kind = errors.INVALID },
            { name = "revoke_subtree without root", method = "revoke_subtree", request = function() return {} end, kind = errors.INVALID },

            -- Known absence and conflict.
            { name = "import of an impl that is not installed", method = "import", request = function() return { shell = shell(NOT_INSTALLED_IMPL) } end, kind = errors.NOT_FOUND },
            { name = "export of a component whose impl is not installed", method = "export", request = function(f) return { component_id = f.not_installed } end, kind = errors.NOT_FOUND },
            { name = "delete of a parent with children and no child_policy", method = "delete", request = function(f) return { component_id = f.parent } end, kind = errors.CONFLICT },

            -- Access refusals, concealing existence where the service does.
            { name = "get by a stranger", method = "get", actor = "stranger", request = function(f) return { component_id = f.cid } end, kind = errors.PERMISSION_DENIED, error = CONCEALED },
            { name = "get of a missing component", method = "get", request = function() return { component_id = uuid.v7() } end, kind = errors.PERMISSION_DENIED, error = CONCEALED },
            { name = "get_access_context by a stranger", method = "get_access_context", actor = "stranger", request = function(f) return { component_id = f.cid } end, kind = errors.PERMISSION_DENIED, error = CONCEALED },
            { name = "get_access_context_by_meta by a stranger", method = "get_access_context_by_meta", actor = "stranger", request = function() return { meta = { label = "fc-single-" .. suffix } } end, kind = errors.PERMISSION_DENIED },
            { name = "query widening without the list-all capability", method = "query", scope = "restricted", request = function() return { scope = "all" } end, kind = errors.PERMISSION_DENIED },
            { name = "count widening without the list-all capability", method = "count", scope = "restricted", request = function() return { actor_id = users.stranger } end, kind = errors.PERMISSION_DENIED },
            { name = "register under a parent without WRITE", method = "register", actor = "stranger", request = function(f) return { impl_id = IMPL, parent_id = f.cid } end, kind = errors.PERMISSION_DENIED },
            { name = "export by a stranger", method = "export", actor = "stranger", request = function(f) return { component_id = f.portable } end, kind = errors.PERMISSION_DENIED },
            { name = "import when the impl lookup is refused", method = "import", scope = "registry_denied", request = function() return { shell = shell(PORTABLE_IMPL) } end, kind = errors.PERMISSION_DENIED },
            { name = "export when the impl lookup is refused", method = "export", scope = "registry_denied", request = function(f) return { component_id = f.portable } end, kind = errors.PERMISSION_DENIED },
            { name = "list_access by a stranger", method = "list_access", actor = "stranger", request = function(f) return { component_id = f.cid } end, kind = errors.PERMISSION_DENIED },
            { name = "list_access by a READ grantee", method = "list_access", actor = "reader", request = function(f) return { component_id = f.shared } end, kind = errors.PERMISSION_DENIED },
            { name = "delete by a stranger", method = "delete", actor = "stranger", request = function(f) return { component_id = f.cid } end, kind = errors.PERMISSION_DENIED },
            { name = "update by a READ grantee", method = "update", actor = "reader", request = function(f) return { component_id = f.shared, commands = { { type = "PATCH_CONTEXT", payload = { patch = { v = 2 } } } } } end, kind = errors.PERMISSION_DENIED },
            { name = "set_meta by a stranger", method = "set_meta", actor = "stranger", request = function(f) return { component_id = f.cid, fields = { title = "x" } } end, kind = errors.PERMISSION_DENIED },
            { name = "set_placement by a stranger", method = "set_placement", actor = "stranger", request = function(f) return { component_id = f.cid, parent_id = false } end, kind = errors.PERMISSION_DENIED },
            { name = "grant_subtree by a READ grantee", method = "grant_subtree", actor = "reader", request = function(f) return { root_component_id = f.shared, subject = { subject_id = users.stranger, subject_type = "user" }, access_mask = 1 } end, kind = errors.PERMISSION_DENIED },
            { name = "revoke_subtree by a READ grantee", method = "revoke_subtree", actor = "reader", request = function(f) return { root_component_id = f.shared, subject = { subject_id = users.owner, subject_type = "user" } } end, kind = errors.PERMISSION_DENIED },

            -- Storage and lifecycle failures.
            { name = "register when the component insert fails", method = "register", hide = { COMPONENTS }, request = function() return { impl_id = IMPL } end, kind = errors.INTERNAL, native_sql = true },
            { name = "register when the lifecycle record fails", method = "register", request = function() return { impl_id = FAILING_CREATE_IMPL } end, kind = errors.INTERNAL },
            { name = "get when the read fails", method = "get", hide = { COMPONENTS }, request = function(f) return { component_id = f.cid } end, kind = errors.INTERNAL, native_sql = true },
            { name = "get_access_context when the read fails", method = "get_access_context", hide = { COMPONENTS }, request = function(f) return { component_id = f.cid } end, kind = errors.INTERNAL, native_sql = true },
            { name = "get_access_context_by_meta when the read fails", method = "get_access_context_by_meta", hide = { COMPONENTS }, request = function() return { meta = { label = "fc-single-" .. suffix } } end, kind = errors.INTERNAL, native_sql = true },
            { name = "list when the read fails", method = "list", hide = { COMPONENTS }, request = function() return {} end, kind = errors.INTERNAL, native_sql = true },
            { name = "query when the read fails", method = "query", hide = { COMPONENTS }, request = function() return {} end, kind = errors.INTERNAL, native_sql = true },
            { name = "count when the read fails", method = "count", hide = { COMPONENTS }, request = function() return {} end, kind = errors.INTERNAL, native_sql = true },
            { name = "list_children when the read fails", method = "list_children", hide = { COMPONENTS }, request = function(f) return { parent_id = f.parent } end, kind = errors.INTERNAL, native_sql = true },
            { name = "export when the read fails", method = "export", hide = { COMPONENTS }, request = function(f) return { component_id = f.portable } end, kind = errors.INTERNAL, native_sql = true },
            { name = "import when the registration fails", method = "import", hide = { COMPONENTS }, request = function() return { shell = shell(PORTABLE_IMPL) } end, kind = errors.INTERNAL, native_sql = true },
            { name = "list_access when the owner read fails", method = "list_access", hide = { META }, request = function(f) return { component_id = f.cid } end, kind = errors.INTERNAL, native_sql = true },
            { name = "delete when the read fails", method = "delete", hide = { COMPONENTS }, request = function(f) return { component_id = f.cid } end, kind = errors.INTERNAL, native_sql = true },
            { name = "export when the envelope cannot be encoded", method = "export", request = function(f) return { component_id = f.unencodable } end, kind = errors.INTERNAL },
            { name = "delete when the lifecycle record fails", method = "delete", request = function(f) return { component_id = f.failing_delete } end, kind = errors.INTERNAL },
            { name = "set_meta when the meta write fails", method = "set_meta", hide = { META }, request = function(f) return { component_id = f.cid, fields = { title = "x" } } end, kind = errors.INTERNAL, native_sql = true },
            { name = "set_placement when the placement write fails", method = "set_placement", hide = { COMPONENTS }, request = function(f) return { component_id = f.cid, parent_id = false } end, kind = errors.INTERNAL, native_sql = true },
            { name = "grant_subtree when the subtree read fails", method = "grant_subtree", hide = { COMPONENTS }, request = function(f) return { root_component_id = f.cid, subject = { subject_id = users.reader, subject_type = "user" }, access_mask = 1 } end, kind = errors.INTERNAL, native_sql = true },
            { name = "revoke_subtree when the subtree read fails", method = "revoke_subtree", hide = { COMPONENTS }, request = function(f) return { root_component_id = f.shared, subject = { subject_id = users.reader, subject_type = "user" } } end, kind = errors.INTERNAL, native_sql = true },
        }

        -- A deletable cleanup's typed failure keeps its kind through delete.
        for _, kind in ipairs({ errors.TIMEOUT, errors.CANCELED, errors.RATE_LIMITED, errors.UNAVAILABLE }) do
            table.insert(cases, {
                name = "delete when the deletable cleanup fails with " .. kind,
                method = "delete",
                request = function(f) return { component_id = f["typed_" .. kind] } end,
                kind = kind,
            })
        end

        for _, case in ipairs(cases) do
            test.it(case.method .. ": " .. case.name .. " is " .. (case.native_sql and "native SQL" or tostring(case.kind)), function()
                local inst = service(case.actor, case.scope)
                local request = case.request(fx)
                for _, tbl in ipairs(case.hide or {}) do hide(tbl) end
                local source = case.native_sql and native_sql_failure(case.hide[1], case.method == "set_meta") or nil
                local res = inst[case.method](inst, request)
                restore_hidden()
                test.not_nil(res)
                test.eq(res.success, false, "expected a failure")
                if source then
                    test.eq(res.kind, source:kind(), tostring(res.error))
                    test.eq(res.retryable, source:retryable())
                    test.eq(res.details.cause.kind, source:kind())
                    test.eq(res.details.cause.retryable, source:retryable())
                    same_data(res.details.cause.details, source:details())
                else
                    test.eq(res.kind, case.kind, tostring(res.error))
                end
                if case.error then
                    test.eq(res.error, case.error)
                end
            end)
        end

        test.it("read_port refuses a read without an actor as PERMISSION_DENIED", function()
            local port = read_port :: any
            port._security = { actor = function() return nil end, can = function() return false end }
            local reader, err = read_port.build({})
            port._security = nil
            test.is_nil(reader)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)

        test.it("client validate_access preserves the native SQL failure", function()
            hide(COMPONENTS)
            local source = native_sql_failure(COMPONENTS)
            local res = probe({ op = "validate", component_id = fx.cid })
            restore_hidden()
            test.eq(res.ok, false)
            test.eq(res.internal, errors.is(source, errors.INTERNAL))
            test.eq(res.kind, source:kind()); test.eq(res.retryable, source:retryable())
            test.eq(res.details.error_kind, "infrastructure")
            test.eq(res.details.cause.kind, source:kind()); test.eq(res.details.cause.retryable, source:retryable())
            same_data(res.details.cause.details, source:details())
            test.eq(res.permission_denied, false)
        end)

        test.it("client query preserves the native SQL failure", function()
            hide(COMPONENTS)
            local source = native_sql_failure(COMPONENTS)
            local res = probe({ op = "query", component_id = fx.cid })
            restore_hidden()
            test.eq(res.ok, false)
            test.eq(res.internal, errors.is(source, errors.INTERNAL))
            test.eq(res.kind, source:kind()); test.eq(res.retryable, source:retryable())
            test.eq(res.details.error_kind, "infrastructure")
            test.eq(res.details.cause.kind, source:kind()); test.eq(res.details.cause.retryable, source:retryable())
            same_data(res.details.cause.details, source:details())
            test.eq(res.permission_denied, false)
        end)

        -- A refused call to the service is a typed refusal the client keeps.
        test.it("client validate_access keeps a refused get_access_context call as PERMISSION_DENIED", function()
            local res = probe({ op = "validate", component_id = fx.cid }, "call_denied")
            test.eq(res.ok, false)
            test.is_true(res.permission_denied, "refused call must surface as PERMISSION_DENIED: " .. tostring(res.err))
            test.eq(res.internal, false)
        end)

        test.it("client get_context_by_meta keeps a refused get_access_context_by_meta call as PERMISSION_DENIED", function()
            local res = probe({ op = "by_meta", meta = { label = "fc-single-" .. suffix } }, "call_denied")
            test.eq(res.ok, false)
            test.is_true(res.permission_denied, "refused call must surface as PERMISSION_DENIED: " .. tostring(res.err))
            test.eq(res.internal, false)
        end)

        test.it("client validate_access keeps a refused service open as PERMISSION_DENIED", function()
            local res = probe({ op = "validate", component_id = fx.cid }, "open_denied")
            test.eq(res.ok, false)
            test.is_true(res.permission_denied, "refused open must surface as PERMISSION_DENIED: " .. tostring(res.err))
        end)

        test.it("client validate_access keeps a concealed refusal as PERMISSION_DENIED", function()
            local res = probe({ op = "validate", component_id = uuid.v7() })
            test.eq(res.ok, false)
            test.is_true(res.permission_denied, tostring(res.err))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
