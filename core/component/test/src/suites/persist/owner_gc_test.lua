-- Component deletion must remove auxiliary owner rows even when SQLite foreign
-- keys are disabled on a pooled connection.
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local test = require("test")
local errors = require("errors")
local ops = require("ops")
local retention = require("retention")
local lifecycle_stub = require("lifecycle_stub")
local audit_policy = require("audit_policy")
local process = require("process")
local channel = require("channel")

local function insert(db: any, statement: string, params: { any }): ()
    local _, err = db:execute(statement, params)
    if err then error(tostring(err)) end
end

local function count(db: any, table_name: string, id: string): integer
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id = $1", { id })
    if err then error(tostring(err)) end
    return tonumber(rows[1].n) :: integer
end

local run_cases = test.run_cases(function()
    test.describe("component owner cleanup", function()
        test.it("acquires the structural lock before reading children or deleting owner rows", function()
            local statements = {}
            local refused = errors.new({ kind = errors.UNAVAILABLE, message = "structural lock unavailable" })
            local tx = {
                db_type = function() return sql.type.POSTGRES, nil end,
                query = function(_, statement)
                    statements[#statements + 1] = statement
                    return nil, refused
                end,
                execute = function(_, statement)
                    statements[#statements + 1] = statement
                    return nil, refused
                end,
            }
            local result, err = ops.dispatch(tx :: any, tx :: any, {
                type = ops.COMMAND_TYPES.DELETE_COMPONENT,
                payload = { component_id = uuid.v7(), child_policy = "reparent_root" },
            })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(#statements, 1)
            test.contains(statements[1], "pg_advisory_xact_lock")
            test.contains(tostring(err), "structural lock unavailable")
        end)
        test.it("rejects a missing child query result before owner deletion", function()
            local missing: { query: (string, ...unknown) -> ({ table }?, error?) } = {
                query = function() return nil, nil end,
            }
            local children, err = ops.validate_delete_tx(missing, { component_id = uuid.v7() })
            test.is_nil(children)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)

        test.it("records an initial identity audit for its durable component owner", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local tx = assert(db:begin())
            local created, create_err = ops.dispatch(tx, db,
                { type = ops.COMMAND_TYPES.CREATE_COMPONENT, payload = {
                    component_id = id, impl_id = "kickside.test:security", actor_id = "audit-owner" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created ~= nil)
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            test.eq(count(db, "kickside_execution_identity_audit", id), 1)
            db:release()
        end)

        test.it("publishes an audit before acknowledging and safely pruning old history", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local tx = assert(db:begin())
            local _, create_err = ops.dispatch(tx, db,
                { type = ops.COMMAND_TYPES.CREATE_COMPONENT, payload = {
                    component_id = id, impl_id = "kickside.test:security", actor_id = "audit-owner" } })
            test.is_nil(create_err, tostring(create_err))
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            local tick = retention.run()
            test.is_true(tick.success, tostring(tick.error))
            local rows = assert(db:query("SELECT published_at FROM kickside_execution_identity_audit WHERE component_id=$1", { id }))
            test.not_nil(rows[1].published_at)
            local _, generation_err = db:execute("UPDATE kickside_components SET identity_generation=identity_generation+1 WHERE component_id=$1", { id })
            test.is_nil(generation_err, tostring(generation_err))
            local owner = assert(db:query("SELECT identity_generation FROM kickside_components WHERE component_id=$1", { id }))
            test.eq(tonumber(owner[1].identity_generation), 1)
            local _, age_err = db:execute([[UPDATE kickside_execution_identity_audit
                SET created_at='2000-01-01T00:00:00Z',published_at='2000-01-01T00:00:00Z'
                WHERE component_id=$1]], { id })
            test.is_nil(age_err, tostring(age_err))
            local pruned = retention.run()
            test.is_true(pruned.success, tostring(pruned.error))
            test.eq(count(db, "kickside_execution_identity_audit", id), 0)
            db:release()
        end)

        test.it("keeps unpublished audits past the former per-owner count while publication is unavailable", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local tx = assert(db:begin())
            local _, create_err = ops.dispatch(tx, db,
                { type = ops.COMMAND_TYPES.CREATE_COMPONENT, payload = {
                    component_id = id, impl_id = "kickside.test:security", actor_id = "audit-owner" } })
            test.is_nil(create_err, tostring(create_err))
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            local seeded, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<10000)
                INSERT INTO kickside_execution_identity_audit
                    (component_id,identity_generation,request_id,record_json,created_at)
                SELECT $1,x,'seed-' || CAST(x AS TEXT),'{}','2000-01-01T00:00:00Z' FROM n]], { id })
            test.is_nil(seed_err, tostring(seed_err))
            test.eq(tonumber(seeded.rows_affected), 10000)
            lifecycle_stub.fail_audit = true
            local failed = retention.run()
            lifecycle_stub.fail_audit = false
            test.is_false(failed.success)
            test.not_nil(failed.error)
            test.eq(count(db, "kickside_execution_identity_audit", id), 10001)
            local function read_fresh_child(): any
                local pid, spawn_err = process.spawn_monitored(
                    "app.component_suites.persist:audit_restart_probe", "app:processes", { component_id = id })
                test.is_nil(spawn_err, tostring(spawn_err))
                local events, deadline = process.events(), time.after("10s")
                while true do
                    local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                    if selected.channel ~= events then error("audit restart probe did not exit") end
                    local event = selected.value
                    if type(event) == "table" and tostring(event.from) == tostring(pid) then
                        test.eq(event.kind, process.event.EXIT)
                        test.is_nil(event.result.error, tostring(event.result.error))
                        return event.result.value
                    end
                end
            end
            test.eq(read_fresh_child().physical, 10001)
            for _, table_name in ipairs({ "kickside_execution_identity_audit",
                "kickside_component_meta", "kickside_component_access", "kickside_component_ancestor",
                "kickside_components" }) do
                local deleted, delete_err = db:execute("DELETE FROM " .. table_name .. " WHERE component_id=$1", { id })
                test.is_nil(delete_err, tostring(delete_err))
                test.not_nil(deleted.rows_affected)
            end
            db:release()
        end)

        test.it("enforces the encoded audit row byte edge", function()
            local exact = '"' .. string.rep("x", 4194302) .. '"'
            test.eq(#exact, 4194304)
            test.is_nil(audit_policy.check_row("component", exact, "identity_bytes"))
            local denied = audit_policy.check_row("component", exact .. "x", "identity_bytes")
            test.not_nil(denied)
            test.eq(errors.is(denied, errors.INVALID), true)
            test.eq(denied:details().reason, "row_too_large")
            test.eq(denied:details().cap, 4194304)
        end)

        test.it("leaves no SQLite rebuild tables after component migrations", function()
            local db, open_err = sql.get("app:db")
            test.is_nil(open_err, tostring(open_err))
            db = assert(db)
            local dbtype, type_err = db:type()
            test.is_nil(type_err, tostring(type_err))
            for _, table_name in ipairs({ "kickside_components_new", "kickside_component_access_rebuild" }) do
                local statement = dbtype == sql.type.POSTGRES
                    and "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename=$1"
                    or "SELECT name FROM sqlite_master WHERE type='table' AND name=$1"
                local rows, query_err = db:query(statement, { table_name })
                test.is_nil(query_err, tostring(query_err))
                test.eq(#rows, 0, table_name .. " survives its migration")
            end
            db:release()
        end)

        test.it("deletes declaration fences and identity audit with the component", function()
            local db, open_err = sql.get("app:db")
            if open_err or not db then error(tostring(open_err)) end
            local id, other = uuid.v7(), uuid.v7()
            local stamp = time.now():utc():format(time.RFC3339)
            insert(db, [[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position,created_at,updated_at)
                VALUES ($1,'kickside.test:security','{}','n',$2,$2)]], { id, stamp })
            insert(db, [[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position,created_at,updated_at)
                VALUES ($1,'kickside.test:security','{}','n',$2,$2)]], { other, stamp })
            insert(db, [[INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)
                VALUES ($1,$1,0)]], { id })
            insert(db, [[INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)
                VALUES ($1,$1,0)]], { other })
            insert(db, [[INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)
                VALUES ($1,$2,1)]], { other, id })
            insert(db, [[INSERT INTO kickside_component_declaration_fence
                (component_id,automation_id,applied_command_generation,command_id,declaration_hash,updated_at)
                VALUES ($1,$3,1,'install','hash',$2)]], { id, stamp, id })
            insert(db, [[INSERT INTO kickside_execution_identity_audit
                (component_id,identity_generation,request_id,record_json,created_at)
                VALUES ($1,1,'set','{}',$2)]], { id, stamp })

            local tx, begin_err = db:begin()
            if begin_err or not tx then error(tostring(begin_err)) end
            local deleted, delete_err = ops.dispatch(tx, db,
                { type = ops.COMMAND_TYPES.DELETE_COMPONENT, payload = { component_id = id } })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true((deleted :: any).deleted)
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            test.eq(count(db, "kickside_components", id), 0)
            test.eq(count(db, "kickside_component_declaration_fence", id), 0)
            test.eq(count(db, "kickside_execution_identity_audit", id), 0)
            local ancestry, ancestry_err = db:query([[SELECT component_id,ancestor_id
                FROM kickside_component_ancestor WHERE component_id=$1 OR ancestor_id=$2]], { id, id })
            test.is_nil(ancestry_err, tostring(ancestry_err))
            test.eq(#ancestry, 0)
            test.eq(count(db, "kickside_component_ancestor", other), 1)
            db:release()
        end)

        test.it("pages component access owner rows before deleting the component", function()
            local db = assert(sql.get("app:db"))
            local id, stamp = uuid.v7(), time.now():utc():format(time.RFC3339)
            local seed = assert(db:begin())
            insert(seed, [[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position,created_at,updated_at,deleting_at)
                VALUES ($1,'kickside.test:security','{}','n',$2,$3,$4)]], { id, stamp, stamp, stamp })
            insert(seed, [[INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)
                VALUES ($1,$2,0)]], { id, id })
            for i = 1, 205 do
                insert(seed, [[INSERT INTO kickside_component_access
                    (access_id,subject_type,subject_id,component_id,source_component_id,access_mask)
                    VALUES ($1,'user',$2,$3,$4,1)]],
                    { uuid.v7(), "owner-page-" .. id .. ":" .. tostring(i), id, id })
            end
            local _, seed_err = seed:commit()
            test.is_nil(seed_err, tostring(seed_err))
            local function pass(): any
                local tx = assert(db:begin())
                local outcome, delete_err = ops.dispatch(tx, db,
                    { type = ops.COMMAND_TYPES.DELETE_COMPONENT, payload = { component_id = id } })
                local _, commit_err = tx:commit()
                test.is_nil(delete_err, tostring(delete_err))
                test.is_nil(commit_err, tostring(commit_err))
                return outcome
            end
            local first = pass()
            local after_first = count(db, "kickside_component_access", id)
            local still_owned = count(db, "kickside_components", id)
            local second = pass()
            local third = pass()
            local final = count(db, "kickside_components", id)
            db:release()
            test.is_true(first.pending, "the first owner page needs durable continuation")
            test.is_true(after_first >= 105, "one call must delete at most 100 grants")
            test.eq(still_owned, 1)
            test.is_true(second.pending)
            test.is_true(third.deleted)
            test.eq(final, 0)
        end)

        test.it("deletes audits in bounded physical owner-deletion pages", function()
            local db = assert(sql.get("app:db"))
            local id, stamp = uuid.v7(), time.now():utc():format(time.RFC3339)
            insert(db, [[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position,created_at,updated_at,deleting_at)
                VALUES ($1,'kickside.test:security','{}','n',$2,$2,$2)]], { id, stamp })
            local seeded, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<205)
                INSERT INTO kickside_execution_identity_audit
                    (component_id,identity_generation,request_id,record_json,created_at)
                SELECT $1,x,'delete-seed-' || CAST(x AS TEXT),'{}',$2 FROM n]], { id, stamp })
            test.is_nil(seed_err, tostring(seed_err))
            test.eq(tonumber(seeded.rows_affected), 205)
            local function page(): any
                local tx = assert(db:begin())
                local outcome, delete_err = ops.dispatch(tx, db,
                    { type = ops.COMMAND_TYPES.DELETE_COMPONENT, payload = { component_id = id } })
                test.is_nil(delete_err, tostring(delete_err))
                local _, commit_err = tx:commit()
                test.is_nil(commit_err, tostring(commit_err))
                return outcome
            end
            test.is_true(page().pending)
            test.eq(count(db, "kickside_execution_identity_audit", id), 105)
            test.is_true(page().pending)
            test.eq(count(db, "kickside_execution_identity_audit", id), 5)
            test.is_true(page().deleted)
            test.eq(count(db, "kickside_execution_identity_audit", id), 0)
            db:release()
        end)

        test.it("pages ancestry and child reroot across a large owned subtree", function()
            local db = assert(sql.get("app:db"))
            local dbtype = assert(db:type())
            local root, child, stamp = uuid.v7(), uuid.v7(), time.now():utc():format(time.RFC3339)
            local function path(id: string, parent: string?): string
                if dbtype == sql.type.POSTGRES then
                    local label = id:gsub("%-", "")
                    return parent and parent .. "." .. label or label
                end
                return parent and parent .. id .. "/" or "/" .. id .. "/"
            end
            local root_path = path(root)
            local child_path = path(child, root_path)
            local new_child_path = path(child)
            local seed = assert(db:begin())
            local function node(id: string, parent: string, node_path: string): ()
                insert(seed, [[INSERT INTO kickside_components
                    (component_id,impl_id,private_context,parent_id,position,path,created_at,updated_at)
                    VALUES ($1,'kickside.test:security','{}',$2,'n',$3,$4,$5)]],
                    { id, parent, node_path, stamp, stamp })
                insert(seed, "INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)"
                    .. " VALUES ($1,$2,0)", { id, id })
            end
            insert(seed, [[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position,path,created_at,updated_at)
                VALUES ($1,'kickside.test:security','{}','n',$2,$3,$4)]],
                { root, root_path, stamp, stamp })
            insert(seed, "INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)"
                .. " VALUES ($1,$2,0)", { root, root })
            node(child, root, child_path)
            insert(seed, "INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)"
                .. " VALUES ($1,$2,1)", { child, root })
            local grandchildren: { string } = {}
            for i = 1, 205 do
                local id = uuid.v7()
                grandchildren[#grandchildren + 1] = id
                node(id, child, path(id, child_path))
                insert(seed, "INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)"
                    .. " VALUES ($1,$2,1)", { id, child })
                insert(seed, "INSERT INTO kickside_component_ancestor (component_id,ancestor_id,depth)"
                    .. " VALUES ($1,$2,2)", { id, root })
            end
            insert(seed, "UPDATE kickside_components SET deleting_at=$1 WHERE component_id=$2", { stamp, root })
            local _, seed_err = seed:commit()
            test.is_nil(seed_err, tostring(seed_err))
            local function pass(): any
                local tx = assert(db:begin())
                local outcome, delete_err = ops.dispatch(tx, db,
                    { type = ops.COMMAND_TYPES.DELETE_COMPONENT,
                        payload = { component_id = root, child_policy = "reparent_root" } })
                test.is_nil(delete_err, tostring(delete_err))
                local _, commit_err = tx:commit()
                test.is_nil(commit_err, tostring(commit_err))
                return outcome
            end
            local first = pass()
            test.is_true(first.pending)
            local old_paths_sql = dbtype == sql.type.POSTGRES
                and "SELECT COUNT(*) AS n FROM kickside_components WHERE path <@ $1::ltree AND component_id<>$2"
                or "SELECT COUNT(*) AS n FROM kickside_components WHERE path LIKE $1 || '%' AND component_id<>$2"
            local old_paths = assert(db:query(old_paths_sql, { child_path, child }))
            test.is_true(tonumber(old_paths[1].n) >= 105, "one owner call changes at most 100 descendant paths")
            local outcome = first
            for _ = 1, 10 do
                if outcome.deleted then break end
                outcome = pass()
            end
            test.is_true(outcome.deleted, "durable owner retry completes the reroot")
            test.eq(count(db, "kickside_components", root), 0)
            local child_rows = assert(db:query("SELECT parent_id,path FROM kickside_components WHERE component_id=$1", { child }))
            test.is_nil(child_rows[1].parent_id)
            test.eq(tostring(child_rows[1].path), new_child_path)
            local sample = assert(db:query("SELECT path FROM kickside_components WHERE component_id=$1", { grandchildren[205] }))
            test.eq(tostring(sample[1].path), path(grandchildren[205], new_child_path))
            local old_edges = assert(db:query("SELECT COUNT(*) AS n FROM kickside_component_ancestor WHERE ancestor_id=$1", { root }))
            test.eq(tonumber(old_edges[1].n), 0)
            db:release()
        end)
    end)
end)

return { run = run_cases }
