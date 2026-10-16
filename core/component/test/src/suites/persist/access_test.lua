-- Derived ACL (design v4 §6.6, DDL component 08, IDENTITY-1 §5 typed ACL).
-- Only direct grants are stored; effective access is the bitwise union of the
-- direct user/group/service grants on a component and on every ancestor, read
-- through the indexed kickside_component_ancestor relation at check time.
-- Acceptance ACL-01 (10k-node grant bounded; indexed ancestor lookup) and
-- ACL-02 (group inheritance and revocation, notification behaviour).

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local contract = require("contract")
local security = require("security")
local ops = require("ops")
local access_ops = require("access_ops")
local share_subject = require("share_subject")
local component_reader = require("component_reader") :: any
local component_client = require("component_client")

local COMPONENT_SERVICE = "kickside.component:component_service"
local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, FULL = 15, READ_WRITE = 3 }
local IMPL = "kickside.test:derived_acl"
local EVENTS = "kickside_component_notify_access_realtime_events"
local MEMBERS = "kickside_component_notify_group_members"

local function db(): sql.DB
    local d, err = sql.get("app:db")
    if err or not d then error("db connect failed: " .. tostring(err)) end
    return d :: sql.DB
end

local function test_scope(): any
    local pol, perr = security.policy("app:test_scope_policy")
    if not pol then error("test policy missing: " .. tostring(perr)) end
    return security.new_scope({ pol })
end

local function call_as(actor_id: string, groups: { string }?, method: string, args: any): any
    local actor = security.new_actor(actor_id, { security_groups = groups or {} })
    local svc, cerr = contract.get(COMPONENT_SERVICE)
    if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
    local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
    if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
    return inst[method](inst, args)
end

local function register(owner: string, parent_id: string?): string
    local res, err = call_as(owner, nil, "register", { impl_id = IMPL, parent_id = parent_id, meta = { label = "acl" } })
    if err then error("register failed: " .. tostring(err)) end
    if not res or not res.success then error("register not success: " .. tostring(res and res.error)) end
    return tostring(res.component_id)
end

local function grant(owner: string, root: string, subject_id: string, subject_type: string, mask: integer): any
    local res, err = call_as(owner, nil, "grant_subtree", {
        root_component_id = root,
        subject = { subject_id = subject_id, subject_type = subject_type },
        access_mask = mask,
    })
    if err then error("grant_subtree failed: " .. tostring(err)) end
    return res
end

local function revoke(owner: string, root: string, subject_id: string, subject_type: string): any
    local res, err = call_as(owner, nil, "revoke_subtree", {
        root_component_id = root,
        subject = { subject_id = subject_id, subject_type = subject_type },
    })
    if err then error("revoke_subtree failed: " .. tostring(err)) end
    return res
end

-- Point check through the component_service contract as the acting identity.
local function can(actor_id: string, groups: { string }?, component_id: string, mask: integer): boolean
    local res, err = call_as(actor_id, groups, "get_access_context", { component_id = component_id, access_mask = mask })
    if err then error("get_access_context failed: " .. tostring(err)) end
    return type(res) == "table" and res.success == true
end

local function access_rows(subject_id: string): integer
    local d = db()
    local rows, err = sql.builder.select("access_id"):from("kickside_component_access")
        :where("subject_id = ?", subject_id):run_with(d):query()
    d:release()
    if err then error("access row count failed: " .. tostring(err)) end
    return #(rows or {})
end

local function ensure_notify_tables()
    local d = db()
    local _, e1 = d:execute("CREATE TABLE IF NOT EXISTS " .. EVENTS
        .. " (user_id TEXT NOT NULL, topic TEXT NOT NULL, event TEXT NOT NULL, data TEXT NOT NULL, authorized TEXT NOT NULL)")
    local _, e2 = d:execute("CREATE TABLE IF NOT EXISTS " .. MEMBERS .. " (group_id TEXT NOT NULL, user_id TEXT NOT NULL)")
    d:release()
    if e1 or e2 then error("notify tables: " .. tostring(e1 or e2)) end
end

local function notified(component_id: string, mask: integer): { [string]: boolean }
    local d = db()
    d:execute("DELETE FROM " .. EVENTS)
    d:release()
    local result, err = component_client.notify_access(component_id, nil, { event = "acl" }, { access_mask = mask })
    if err then error("notify_access failed: " .. tostring(err)) end
    if not result or result.success ~= true then error("notify_access not success") end
    local d2 = db()
    local rows, qerr = d2:query("SELECT user_id FROM " .. EVENTS .. " WHERE topic = $1", { "component." .. component_id })
    d2:release()
    if qerr then error("events query failed: " .. tostring(qerr)) end
    local out: { [string]: boolean } = {}
    for _, row in ipairs(rows or {}) do out[tostring(row.user_id)] = true end
    return out
end

-- Multi-row insert of rows (lists of column values) in chunks, "$n" placeholders.
local function insert_rows(tx: any, table_name: string, columns: { string }, rows: { { any } }): error?
    local chunk = 400
    local i = 1
    while i <= #rows do
        local values: { string } = {}
        local args: { any } = {}
        for j = i, math.min(i + chunk - 1, #rows) do
            local marks: { string } = {}
            for _, v in ipairs(rows[j]) do
                args[#args + 1] = v
                marks[#marks + 1] = "$" .. tostring(#args)
            end
            values[#values + 1] = "(" .. table.concat(marks, ",") .. ")"
        end
        local _, err = tx:execute("INSERT INTO " .. table_name .. " (" .. table.concat(columns, ",") .. ") VALUES "
            .. table.concat(values, ","), args)
        if err then return (errors.new({ message = "fixture insert into " .. table_name .. ": " .. tostring(err), kind = errors.INTERNAL }) :: error) end
        i = i + chunk
    end
    return nil
end

-- Bulk fixture: a root with `width` folders of `fanout` leaves, written with
-- its ancestry closure in one transaction (the invariant every product create
-- keeps). Returns root, one deep leaf and the node count.
local function build_tree(owner: string, width: integer, fanout: integer): (string, string, integer)
    local d = db()
    local dbtype = tostring(d:type())
    local now = time.now():utc():format_rfc3339()
    local function label(id: string): string return (id:gsub("%-", "")) end
    local function path_of(parent_path: string?, id: string): string
        if dbtype == sql.type.POSTGRES then
            return parent_path and (parent_path .. "." .. label(id)) or label(id)
        end
        return (parent_path or "/") .. id .. "/"
    end
    local components: { { any } } = {}
    local edges: { { any } } = {}
    local root = uuid.v7()
    local root_path = path_of(nil, root)
    edges[#edges + 1] = { root, root, 0 }
    local leaf = ""
    for _ = 1, width do
        local folder = uuid.v7()
        local folder_path = path_of(root_path, folder)
        components[#components + 1] = { folder, IMPL, "{}", root, "n", folder_path, now, now }
        edges[#edges + 1] = { folder, folder, 0 }
        edges[#edges + 1] = { folder, root, 1 }
        for _ = 1, fanout do
            local node = uuid.v7()
            components[#components + 1] = { node, IMPL, "{}", folder, "n", path_of(folder_path, node), now, now }
            edges[#edges + 1] = { node, node, 0 }
            edges[#edges + 1] = { node, folder, 1 }
            edges[#edges + 1] = { node, root, 2 }
            leaf = node
        end
    end
    local tx, terr = d:begin()
    if terr or not tx then error("begin failed: " .. tostring(terr)) end
    local component_columns = { "component_id", "impl_id", "private_context", "parent_id", "position", "path", "created_at", "updated_at" }
    local err = insert_rows(tx, "kickside_components",
            { "component_id", "impl_id", "private_context", "position", "path", "created_at", "updated_at" },
            { { root, IMPL, "{}", "n", root_path, now, now } })
        or insert_rows(tx, "kickside_components", component_columns, components)
        or insert_rows(tx, "kickside_component_ancestor", { "component_id", "ancestor_id", "depth" }, edges)
        or insert_rows(tx, "kickside_component_access",
            { "access_id", "subject_id", "subject_type", "component_id", "source_component_id", "access_mask", "inherited", "created_at" },
            { { uuid.v7(), owner, "user", root, root, ACCESS.FULL, 0, now } })
    if err then tx:rollback(); d:release(); error(tostring(err)) end
    local _, cerr = tx:commit()
    d:release()
    if cerr then error("fixture commit failed: " .. tostring(cerr)) end
    return root, leaf, #components + 1
end

local function canonical_email_cases()
    test.describe("Canonical persisted email grants", function()
        test.it("persists the canonical member for a direct folder grant", function()
            local owner = "direct-email-owner-" .. uuid.v4()
            local root = register(owner, nil)
            local result = grant(owner, root, "member@northwind.example", "user", 1)
            test.is_true(result.success)
            local d = db()
            local rows, query_err = sql.builder.select("subject_id"):from("kickside_component_access")
                :where("component_id = ?", root):where("access_mask = ?", 1):run_with(d):query()
            d:release()
            test.is_nil(query_err)
            test.not_nil(rows[1])
            test.eq(rows[1].subject_id, "northwind-member-id")
            test.is_true(can("northwind-member-id", nil, root, 1))
        end)
        test.it("preserves mask unions, sources and inherited graph access across canonicalization and revoke", function()
            local owner = "email-owner-" .. uuid.v4()
            local root = register(owner, nil)
            local leaf = register(owner, root)
            local d = db()
            local function insert(subject_id, mask, source)
                local _, err = sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), component_id = root, source_component_id = source,
                    subject_type = "user", subject_id = subject_id, access_mask = mask,
                    inherited = 0, created_at = "2026-01-01T00:00:00Z",
                }):run_with(d):exec()
                test.is_nil(err)
            end
            insert("member@northwind.example", 1, root)
            insert("MEMBER@northwind.example", 2, root)
            insert("northwind-member-id", 4, root)
            insert("member@northwind.example", 8, "separate-source")
            insert("unknown@northwind.example", 1, root)
            local tx, tx_err = d:begin()
            test.is_nil(tx_err)
            local ok, err = pcall(function()
                local migrated, migrate_err = access_ops.canonicalize_email_grants(tx, function(id) return share_subject.find(id, "user") end)
                test.is_nil(migrate_err)
                test.is_true(migrated)
                local again, again_err = access_ops.canonicalize_email_grants(tx, function(id) return share_subject.find(id, "user") end)
                test.is_nil(again_err)
                test.is_true(again)
            end)
            if not ok then
                tx:rollback()
                d:release()
                error(err)
            end
            local _, commit_err = tx:commit()
            test.is_nil(commit_err)
            local rows, query_err = sql.builder.select("subject_id", "access_mask", "source_component_id", "created_at")
                :from("kickside_component_access"):where("component_id = ?", root):run_with(d):query()
            d:release()
            test.is_nil(query_err)
            local seen = {}
            for _, row in ipairs(rows) do
                if row.subject_id == "northwind-member-id" then
                    seen[row.source_component_id] = row.access_mask
                    test.eq(row.created_at, "2026-01-01T00:00:00Z")
                end
                test.is_false(row.subject_id == "member@northwind.example" or row.subject_id == "MEMBER@northwind.example")
            end
            test.eq(seen[root], 7)
            test.eq(seen["separate-source"], 8)
            test.eq(access_rows("unknown@northwind.example"), 1)
            test.is_true(can("northwind-member-id", nil, leaf, 15))
            test.is_false(can("email-outsider", nil, leaf, 1))
            local revoked = revoke(owner, root, "member@northwind.example", "user")
            test.is_true(revoked.success)
            test.is_false(can("northwind-member-id", nil, leaf, 1))
        end)
    end)
end

local function define_tests()
    canonical_email_cases()
    test.describe("derived component ACL", function()
        local sfx = uuid.v4():sub(1, 8)
        local owner = "acl-owner-" .. sfx

        test.before_all(ensure_notify_tables)
        test.after_all(function()
            local d = db()
            d:execute("DROP TABLE IF EXISTS " .. EVENTS)
            d:execute("DROP TABLE IF EXISTS " .. MEMBERS)
            d:release()
        end)

        test.it("a grant on the root of a 10k-node tree writes one direct row and reaches every node", function()
            local root, leaf, count = build_tree(owner, 100, 100)
            test.eq(count, 10101)
            local reader = "acl-wide-" .. sfx
            test.is_false(can(reader, nil, leaf, ACCESS.READ))
            local res = grant(owner, root, reader, "user", ACCESS.READ)
            test.eq(res.success, true)
            test.eq(access_rows(reader), 1)
            test.is_true(can(reader, nil, leaf, ACCESS.READ))
            test.is_false(can(reader, nil, leaf, ACCESS.WRITE))
            local visible, count_err = component_reader.new():with_user(reader)
                :with_access_mask(ACCESS.READ):count()
            test.is_nil(count_err)
            test.eq(visible, count)
            local rev = revoke(owner, root, reader, "user")
            test.eq(rev.success, true)
            test.eq(access_rows(reader), 0)
            test.is_false(can(reader, nil, leaf, ACCESS.READ))
        end)

        test.it("reads effective access through the indexed ancestor relation", function()
            local d = db()
            local dbtype = tostring(d:type())
            local sql_text, args = ops.effective_mask_query({ { subject_type = "user", subject_id = "x" } }, uuid.v7())
            if dbtype == sql.type.POSTGRES then
                d:execute("ANALYZE kickside_component_ancestor")
                d:execute("ANALYZE kickside_component_access")
            end
            local plan_sql = dbtype == sql.type.POSTGRES and ("EXPLAIN " .. sql_text) or ("EXPLAIN QUERY PLAN " .. sql_text)
            local rows, err = d:query(plan_sql, args)
            d:release()
            test.is_nil(err)
            local plan, encode_err = json.encode(rows or {})
            if encode_err or not plan then error(tostring(encode_err)) end
            local seq_scan = plan:find("Seq Scan on kickside_component_ancestor", 1, true)
            test.is_nil(seq_scan)
            local scan = plan:find("SCAN kickside_component_ancestor", 1, true)
            test.is_nil(scan)
        end)

        test.it("inherits user and group grants from every ancestor as one union", function()
            local root = register(owner)
            local folder = register(owner, root)
            local doc = register(owner, folder)
            local member = "acl-member-" .. sfx
            local group = "acl-group-" .. sfx
            grant(owner, root, member, "user", ACCESS.READ)
            grant(owner, folder, group, "group", ACCESS.WRITE)
            test.is_true(can(member, { group }, doc, ACCESS.READ_WRITE))
            test.is_true(can(member, {}, doc, ACCESS.READ))
            test.is_false(can(member, {}, doc, ACCESS.WRITE))
            test.is_false(can("acl-stranger-" .. sfx, {}, doc, ACCESS.READ))
        end)

        test.it("a new child of a shared folder is reachable immediately", function()
            local root = register(owner)
            local viewer = "acl-viewer-" .. sfx
            grant(owner, root, viewer, "user", ACCESS.READ)
            local child = register(owner, root)
            test.is_true(can(viewer, nil, child, ACCESS.READ))
        end)

        test.it("revocation on an ancestor is authoritative on the next check", function()
            local root = register(owner)
            local doc = register(owner, root)
            local group = "acl-revoke-" .. sfx
            local member = "acl-revoked-" .. sfx
            grant(owner, root, group, "group", ACCESS.READ)
            test.is_true(can(member, { group }, doc, ACCESS.READ))
            revoke(owner, root, group, "group")
            test.is_false(can(member, { group }, doc, ACCESS.READ))
        end)

        test.it("moving a subtree swaps its inherited access in one transaction", function()
            local a = register(owner)
            local b = register(owner)
            local doc = register(owner, a)
            local reader_a = "acl-ra-" .. sfx
            local reader_b = "acl-rb-" .. sfx
            grant(owner, a, reader_a, "user", ACCESS.READ)
            grant(owner, b, reader_b, "user", ACCESS.READ)
            test.is_true(can(reader_a, nil, doc, ACCESS.READ))
            local moved = call_as(owner, nil, "set_placement", { component_id = doc, parent_id = b })
            test.eq(moved.success, true)
            test.is_false(can(reader_a, nil, doc, ACCESS.READ))
            test.is_true(can(reader_b, nil, doc, ACCESS.READ))
        end)

        test.it("keeps grant subjects typed: a group grant never matches a user of the same id", function()
            local root = register(owner)
            local name = "acl-same-" .. sfx
            grant(owner, root, name, "group", ACCESS.READ)
            test.is_false(can(name, {}, root, ACCESS.READ))
            test.is_true(can("acl-in-" .. sfx, { name }, root, ACCESS.READ))
            grant(owner, root, name, "user", ACCESS.WRITE)
            revoke(owner, root, name, "user")
            test.is_true(can("acl-in-" .. sfx, { name }, root, ACCESS.READ))
        end)

        test.it("a group or service actor holds only its own typed grants", function()
            local root = register(owner)
            local group = "aclgrp" .. sfx
            local service = "aclsvc" .. sfx
            grant(owner, root, group, "group", ACCESS.READ)
            grant(owner, root, service, "service", ACCESS.WRITE)
            test.is_true(can("principal:group:" .. group, nil, root, ACCESS.READ))
            test.is_false(can("principal:group:" .. group, nil, root, ACCESS.WRITE))
            test.is_true(can("principal:service:" .. service, nil, root, ACCESS.WRITE))
            test.is_false(can("principal:service:" .. service, nil, root, ACCESS.READ))
        end)

        test.it("refuses a grant and a revoke without a subject type", function()
            local root = register(owner)
            local typeless = "acl-typeless-" .. sfx
            local res, res_err = call_as(owner, nil, "grant_subtree", {
                root_component_id = root,
                subject = { subject_id = typeless },
                access_mask = ACCESS.READ,
            })
            test.is_nil(res_err)
            test.eq(res.success, false)
            test.eq(access_rows(typeless), 0)
            local rev, rev_err = call_as(owner, nil, "revoke_subtree", {
                root_component_id = root,
                subject = { subject_id = typeless },
            })
            test.is_nil(rev_err)
            test.eq(rev.success, false)
        end)

        test.it("refuses unsupported subject grants", function()
            local root = register(owner)
            local res = grant(owner, root, "acl-agent-" .. sfx, "agent", ACCESS.READ)
            test.eq(res.success, false)
            test.eq(access_rows("acl-agent-" .. sfx), 0)
        end)

        test.it("notifies inherited viewers and drops a revoked one on the next event", function()
            local root = register(owner)
            local doc = register(owner, root)
            local viewer = "acl-nv-" .. sfx
            local group = "acl-ng-" .. sfx
            local gm = "acl-ngm-" .. sfx
            local d = db()
            d:execute("INSERT INTO " .. MEMBERS .. " (group_id, user_id) VALUES ($1, $2)", { group, gm })
            d:release()
            grant(owner, root, viewer, "user", ACCESS.READ)
            grant(owner, root, group, "group", ACCESS.READ)
            local first = notified(doc, ACCESS.READ)
            test.is_true(first[owner] == true)
            test.is_true(first[viewer] == true)
            test.is_true(first[gm] == true)
            revoke(owner, root, viewer, "user")
            local second = notified(doc, ACCESS.READ)
            test.is_nil(second[viewer])
            test.is_true(second[gm] == true)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
