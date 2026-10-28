-- Provisioning: materializing a provisioned component-kind declaration into a real
-- component + its event-log thread (one id), its declared projection, and its
-- retention policy -- and that re-running converges (idempotent) rather than
-- duplicating. Driven under a real actor so the components are owned through the
-- normal access path.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local provision = require("provision")
local autoinit = require("autoinit")
local channel = require("channel")
local process = require("process")
local time = require("time")
local json = require("json")
local funcs = require("funcs")

local DB = "app:db"
local PROCESS_SCOPE = "wippy.security:process"

local function define_tests()
    test.describe("Threads Provision", function()
        local suffix = uuid.v4():sub(1, 8)
        local user_id = "prov-user-" .. suffix

        local function scope()
            local scoped, serr = security.named_scope(PROCESS_SCOPE)
            if not scoped then error("test scope missing: " .. tostring(serr)) end
            return scoped
        end
        local function actor()
            return security.new_actor(user_id, { security_groups = {} })
        end
        local function db()
            local d, e = sql.get(DB)
            if e or not d then error("db unavailable: " .. tostring(e)) end
            return d
        end
        local function count(d, tbl, col, val)
            local rows = sql.builder.select("COUNT(*) AS c"):from(tbl)
                :where(sql.builder.eq({ [col] = val })):run_with(d):query()
            return tonumber(rows and rows[1] and rows[1].c) or 0
        end

        test.it("privileged provisioning respects the owner's denied kind read", function()
            local owner = security.new_actor("provision-denied-" .. uuid.v4(), {})
            local deny, deny_err = security.policy("app:provision_kind_read_deny")
            test.is_nil(deny_err)
            local restricted = scope():with(deny)
            test.eq(restricted:evaluate(owner, "registry.get", "app:provision_test_decl"), "deny")
            local executor, actor_err = funcs.new():with_actor(owner)
            test.is_nil(actor_err)
            local scoped, scope_err = executor:with_scope(restricted)
            test.is_nil(scope_err)
            local discovered, discovery_err = scoped:call("app:provision_declarations")
            test.is_nil(discovery_err)
            for _, decl in ipairs(discovered) do test.is_true(decl.impl_id ~= "app:provision_test_decl") end
            local ids, err = provision.ensure_user(owner, restricted, owner:id())
            test.is_nil(err)
            test.not_nil(ids)
            local cid = autoinit.component_id(owner:id(), "test_ws")
            for _, id in ipairs(ids) do test.is_true(id ~= cid) end
            local d = db()
            test.eq(count(d, "kickside_components", "component_id", cid), 0)
            test.eq(count(d, "kickside_thread", "id", cid), 0)
            test.eq(count(d, "kickside_retention_policy", "thread_id", cid), 0)
            test.is_nil(select(2, d:release()))
            local allowed, allow_err = provision.ensure_user(owner, scope(), owner:id())
            test.is_nil(allow_err)
            local found = false
            for _, id in ipairs(allowed) do if id == cid then found = true end end
            test.is_true(found)
        end)

        test.it("materializes component+thread+projection+retention, idempotently", function()
            local cid = autoinit.component_id(user_id, "test_ws")

            local ids, err = provision.ensure_user(actor(), scope(), user_id)
            test.is_nil(err)
            test.is_true(#ids >= 1)

            local d = db()
            -- The component's thread exists at the deterministic id.
            test.eq(count(d, "kickside_thread", "id", cid), 1)
            local component_rows = sql.builder.select("impl_id"):from("kickside_components")
                :where(sql.builder.eq({ component_id = cid })):run_with(d):query()
            test.eq(component_rows[1].impl_id, "app:provision_test_decl")
            -- The declared title + icon are carried onto the component meta.
            local meta_rows = sql.builder.select("key", "value"):from("kickside_component_meta")
                :where(sql.builder.eq({ component_id = cid })):run_with(d):query()
            local meta_map: { [string]: any } = {}
            for _, row in ipairs(meta_rows or {}) do meta_map[tostring(row.key)] = row.value end
            test.eq(meta_map.icon, "tabler:test-pipe")
            -- The declared projection is registered on that thread.
            test.is_true(count(d, "kickside_projection", "thread_id", cid) >= 1)
            -- Retention/vacuum policy set with the declared 7-day window.
            local rp = sql.builder.select("event_hot_retention_days"):from("kickside_retention_policy")
                :where(sql.builder.eq({ thread_id = cid })):run_with(d):query()
            test.is_true(rp ~= nil and #rp >= 1)
            test.eq(tonumber(rp[1].event_hot_retention_days), 7)
            d:release()

            -- Idempotent: a second materialization neither errors nor duplicates.
            local ids2, err2 = provision.ensure_user(actor(), scope(), user_id)
            test.is_nil(err2)
            test.eq(#ids2, #ids)
            local d2 = db()
            test.eq(count(d2, "kickside_thread", "id", cid), 1)
            d2:release()
        end)

        test.it("concurrent first provisioning converges on one owned thread", function()
            local id = "prov-race-" .. uuid.v4()
            local owner = security.new_actor(id, { security_groups = {} })
            local start = channel.new(2)
            local done = channel.new(2)
            for _ = 1, 2 do
                coroutine.spawn(function()
                    start:receive()
                    local ids, err = provision.ensure_user(owner, scope(), id)
                    done:send({ ids = ids, err = err })
                end)
            end
            start:send(true)
            start:send(true)
            local first, second = done:receive(), done:receive()
            test.is_nil(first.err)
            test.is_nil(second.err)
            test.eq(#first.ids, #second.ids)
            local cid = autoinit.component_id(id, "test_ws")
            local d = db()
            test.eq(count(d, "kickside_components", "component_id", cid), 1)
            test.eq(count(d, "kickside_thread", "id", cid), 1)
            test.eq(count(d, "kickside_projection", "thread_id", cid), 1)
            test.eq(count(d, "kickside_retention_policy", "thread_id", cid), 1)
            d:release()
        end)

        test.it("declared thread classes reject caller overrides on create and update", function()
            local owner = security.new_actor("class-owner-" .. uuid.v4(), { security_groups = {} })
            local component_id = uuid.v4()
            local cinst = (contract.get("kickside.component:component_service") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local reg = cinst:register({ component_id = component_id, impl_id = "app:converge_component_impl",
                meta = { class = "test_descriptor", title = "Declared class" } })
            test.is_true(reg.success)
            local tinst = (contract.get("kickside.core:threads") :: any):with_actor(owner):with_scope(scope()):open()
            local refused, refuse_err = tinst:ensure_thread({ component_id = component_id,
                impl_id = "app:converge_descriptor_decl", thread_class = "conversation" })
            test.is_nil(refused)
            test.not_nil(refuse_err)
            test.eq(refuse_err:kind(), errors.INVALID)
            local d = db()
            test.eq(count(d, "kickside_thread", "id", component_id), 0)
            d:release()
            local created, create_err = tinst:ensure_thread({ component_id = component_id,
                impl_id = "app:converge_descriptor_decl" })
            test.is_nil(create_err)
            test.eq(created.thread.thread_class, "test.descriptor.thread")
            local changed, change_err = tinst:update({ thread_id = component_id, thread_class = "conversation" })
            test.is_nil(changed)
            test.not_nil(change_err)
            test.eq(change_err:kind(), errors.INVALID)
            local after = tinst:find({ thread_id = component_id })
            test.eq(after.thread_class, "test.descriptor.thread")
        end)

        test.it("converge restores missing public thread markers for a retained declared thread", function()
            local owner_id = "marker-owner-" .. uuid.v4():sub(1, 8)
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local component_id = uuid.v4()
            local cinst = (contract.get("kickside.component:component_service") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local registered = cinst:register({
                component_id = component_id,
                impl_id = "app:converge_test_decl",
                meta = { class = "test_converge", title = "Marker repair" },
            })
            test.is_true(type(registered) == "table" and registered.success == true)
            local tinst = (contract.get("kickside.core:threads") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local ensured, ensure_err = tinst:ensure_thread({
                component_id = component_id,
                impl_id = "app:converge_test_decl",
            })
            test.is_nil(ensure_err)
            test.not_nil(ensured)

            local d = db()
            local stored = sql.builder.select("thread_class"):from("kickside_thread")
                :where(sql.builder.eq({ id = component_id })):run_with(d):query()
            test.eq(tostring(stored[1].thread_class), "test.converge.thread")
            test.eq(count(d, "kickside_retention_policy", "thread_id", component_id), 1)
            local grants = d:query([[SELECT subject_id,subject_type,access_mask,inherited
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            for _, key in ipairs({ "type", "thread_class" }) do
                local _, delete_err = d:execute(
                    "DELETE FROM kickside_component_meta WHERE component_id=$1 AND key=$2", { component_id, key })
                test.is_nil(delete_err)
            end
            local absent = sql.builder.select("key"):from("kickside_component_meta")
                :where("component_id = ?", component_id)
                :where("key IN ('type', 'thread_class')")
                :run_with(d):query()
            test.eq(#(absent or {}), 0)
            d:release()

            local summary, converge_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(converge_err)
            test.is_true((tonumber((summary :: any).healed) or 0) >= 1)

            local repaired = db()
            local markers = sql.builder.select("key", "value", "updated_at"):from("kickside_component_meta")
                :where("component_id = ?", component_id)
                :where("key IN ('type', 'thread_class')")
                :run_with(repaired):query()
            local marker_map: { [string]: any } = {}
            local marker_updates: { [string]: any } = {}
            for _, marker in ipairs(markers or {}) do
                marker_map[tostring(marker.key)] = marker.value
                marker_updates[tostring(marker.key)] = marker.updated_at
            end
            test.eq(marker_map.type, "thread")
            test.eq(marker_map.thread_class, "test.converge.thread")
            test.eq(#(markers or {}), 2)
            local repaired_grants = repaired:query([[SELECT subject_id,subject_type,access_mask,inherited
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            test.eq(#(repaired_grants or {}), #(grants or {}))
            for index, grant in ipairs(grants or {}) do
                for key, value in pairs(grant) do test.eq(repaired_grants[index][key], value) end
            end
            repaired:release()

            local _, repeat_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(repeat_err)
            local verified = db()
            local repeated_markers = sql.builder.select("key", "updated_at"):from("kickside_component_meta")
                :where("component_id = ?", component_id)
                :where("key IN ('type', 'thread_class')")
                :run_with(verified):query()
            for _, marker in ipairs(repeated_markers or {}) do
                test.eq(marker.updated_at, marker_updates[tostring(marker.key)])
            end
            test.eq(#(repeated_markers or {}), 2)
            verified:release()
        end)

        test.it("converge restores a retained declared class without changing durable thread state", function()
            local owner = security.new_actor("class-converge-owner-" .. uuid.v4(), { security_groups = {} })
            local component_id = uuid.v4()
            local component = (contract.get("kickside.component:component_service") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local registered, register_err = component:register({
                component_id = component_id,
                impl_id = "app:converge_test_decl",
                meta = { class = "test_converge", title = "Declared class convergence" },
            })
            test.is_nil(register_err)
            test.is_true(type(registered) == "table" and registered.success == true)

            local threads = (contract.get("kickside.core:threads") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local ensured, ensure_err = threads:ensure_thread({
                component_id = component_id,
                impl_id = "app:converge_test_decl",
            })
            test.is_nil(ensure_err)
            test.eq(ensured.thread.thread_class, "test.converge.thread")
            local appended, append_err = threads:append_event({
                thread_id = component_id,
                event = { type = "app:threads_cv_trigger", body = {} },
            })
            test.is_nil(append_err)
            test.not_nil(appended)

            local before_db = db()
            local thread_before = before_db:query([[SELECT id,thread_class,state,event_count,attrs,updated_at
                FROM kickside_thread WHERE id=$1]], { component_id })[1]
            local retention_before = before_db:query([[SELECT thread_id,event_hot_retention_days,archive_mode,enabled
                FROM kickside_retention_policy WHERE thread_id=$1]], { component_id })[1]
            local events_before = before_db:query([[SELECT id,seq,type,body FROM kickside_event
                WHERE thread_id=$1 ORDER BY seq]], { component_id })
            local access_before = before_db:query([[SELECT subject_id,subject_type,access_mask,inherited
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            test.not_nil(retention_before)
            test.eq(#events_before, 1)

            local _, class_err = before_db:execute("UPDATE kickside_thread SET thread_class=$1 WHERE id=$2",
                { "conversation", component_id })
            test.is_nil(class_err)
            for key, value in pairs({ type = "thread", thread_class = "conversation" }) do
                local _, marker_err = before_db:execute(
                    "UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key=$3",
                    { value, component_id, key })
                test.is_nil(marker_err)
            end
            before_db:release()

            local summary, converge_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(converge_err)
            test.is_true((tonumber((summary :: any).healed) or 0) >= 1)

            local after_db = db()
            local thread_after = after_db:query([[SELECT id,thread_class,state,event_count,attrs,updated_at
                FROM kickside_thread WHERE id=$1]], { component_id })[1]
            test.eq(thread_after.id, thread_before.id)
            test.eq(thread_after.thread_class, "test.converge.thread")
            test.eq(thread_after.state, thread_before.state)
            test.eq(tonumber(thread_after.event_count), tonumber(thread_before.event_count))
            test.eq(thread_after.attrs, thread_before.attrs)
            local markers = after_db:query([[SELECT key,value FROM kickside_component_meta
                WHERE component_id=$1 AND key IN ('type','thread_class') ORDER BY key]], { component_id })
            local marker_map: { [string]: any } = {}
            for _, marker in ipairs(markers) do marker_map[tostring(marker.key)] = marker.value end
            test.eq(marker_map.type, "thread")
            test.eq(marker_map.thread_class, "test.converge.thread")
            local retention_after = after_db:query([[SELECT thread_id,event_hot_retention_days,archive_mode,enabled
                FROM kickside_retention_policy WHERE thread_id=$1]], { component_id })[1]
            for key, value in pairs(retention_before) do test.eq(retention_after[key], value) end
            local events_after = after_db:query([[SELECT id,seq,type,body FROM kickside_event
                WHERE thread_id=$1 ORDER BY seq]], { component_id })
            test.eq(#events_after, #events_before)
            for index, event in ipairs(events_before) do
                for key, value in pairs(event) do test.eq(events_after[index][key], value) end
            end
            local access_after = after_db:query([[SELECT subject_id,subject_type,access_mask,inherited
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            test.eq(#access_after, #access_before)
            for index, grant in ipairs(access_before) do
                for key, value in pairs(grant) do test.eq(access_after[index][key], value) end
            end
            after_db:release()

            local stranger = security.new_actor("class-converge-reader-" .. uuid.v4(), { security_groups = {} })
            local stranger_threads = (contract.get("kickside.core:threads") :: any)
                :with_actor(stranger):with_scope(scope()):open()
            local hidden, hidden_err = stranger_threads:find({ thread_id = component_id })
            test.is_nil(hidden)
            test.is_nil(hidden_err)

            local repeated, repeat_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(repeat_err)
            local verified_db = db()
            local verified = verified_db:query("SELECT updated_at FROM kickside_thread WHERE id=$1", { component_id })[1]
            verified_db:release()
            test.eq(verified.updated_at, thread_after.updated_at)
            test.eq(tonumber((repeated :: any).healed) or 0, 0)
        end)

        test.it("converge recreates a lost declared thread with its projections", function()
            local owner_id = "cv-owner-" .. uuid.v4():sub(1, 8)
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local component_id = uuid.v4()

            -- A real component of the converge kind, thread attached the normal way.
            local csvc = contract.get("kickside.component:component_service")
            local cinst = (csvc :: any):with_actor(owner):with_scope(scope()):open()
            local reg = cinst:register({ component_id = component_id, impl_id = "app:converge_test_decl", meta = { class = "test_converge", title = "Converge KB" } })
            test.is_true(type(reg) == "table" and reg.success == true)
            local tsvc = contract.get("kickside.core:threads")
            local tinst = (tsvc :: any):with_actor(owner):with_scope(scope()):open()
            local ensured, ensure_err = tinst:ensure_thread({ component_id = component_id, impl_id = "app:converge_test_decl" })
            test.is_nil(ensure_err)
            test.not_nil(ensured)

            local d = db()
            -- The declared class came from meta.thread, not from any caller argument.
            local class_rows = sql.builder.select("thread_class"):from("kickside_thread")
                :where(sql.builder.eq({ id = component_id })):run_with(d):query()
            test.eq(tostring(class_rows[1].thread_class), "test.converge.thread")
            test.is_true(count(d, "kickside_projection", "thread_id", component_id) >= 1)

            -- The loss: thread + projections + cursors destroyed, component intact.
            for _, tbl in ipairs({ "kickside_projection_cursor", "kickside_projection", "kickside_event", "kickside_thread" }) do
                local col = tbl == "kickside_thread" and "id" or "thread_id"
                if tbl == "kickside_projection_cursor" then
                    sql.builder.delete("kickside_projection_cursor")
                        :where("projection_id IN (SELECT id FROM kickside_projection WHERE thread_id = ?)", component_id)
                        :run_with(d):exec()
                else
                    sql.builder.delete(tbl):where(sql.builder.eq({ [col] = component_id })):run_with(d):exec()
                end
            end
            test.eq(count(d, "kickside_thread", "id", component_id), 0)
            d:release()

            local summary, converge_err = provision.converge(security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(converge_err)
            if (tonumber((summary :: any).healed) or 0) < 1 then
                local parts = {}
                for _, sk in ipairs(((summary :: any).skipped :: { any }) or {}) do
                    parts[#parts + 1] = tostring((sk :: any).component_id) .. ": " .. tostring((sk :: any).reason)
                end
                error("converge healed nothing; checked=" .. tostring((summary :: any).checked) .. " skipped=[" .. table.concat(parts, " | ") .. "]")
            end

            local d2 = db()
            test.eq(count(d2, "kickside_thread", "id", component_id), 1)
            local healed_class = sql.builder.select("thread_class"):from("kickside_thread")
                :where(sql.builder.eq({ id = component_id })):run_with(d2):query()
            test.eq(tostring(healed_class[1].thread_class), "test.converge.thread")
            test.is_true(count(d2, "kickside_projection", "thread_id", component_id) >= 1)
            -- Projections run as the component owner, not the converging system actor.
            local proj_actor = sql.builder.select("actor_id"):from("kickside_projection")
                :where(sql.builder.eq({ thread_id = component_id, kind = "test.converge" })):run_with(d2):query()
            test.eq(tostring(proj_actor[1].actor_id), owner_id)
            d2:release()

            -- A second pass finds nothing missing for this component and stays away:
            -- generation is untouched, so no in-flight work is fenced off.
            local d3 = db()
            local gen_before = sql.builder.select("generation"):from("kickside_projection_cursor")
                :where("projection_id IN (SELECT id FROM kickside_projection WHERE thread_id = ?)", component_id)
                :run_with(d3):query()
            d3:release()
            local _, second_err = provision.converge(security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(second_err)
            local d4 = db()
            local gen_after = sql.builder.select("generation"):from("kickside_projection_cursor")
                :where("projection_id IN (SELECT id FROM kickside_projection WHERE thread_id = ?)", component_id)
                :run_with(d4):query()
            d4:release()
            test.eq(tonumber(gen_before[1].generation), tonumber(gen_after[1].generation))
        end)

        -- Delete ordering: a refused component delete must leave the component
        -- WHOLE — thread intact — because the thread is reaped only after the
        -- component row is gone. The old order purged first, which is exactly the
        -- state (alive component, destroyed thread) convergence had to heal.
        test.it("a refused delete leaves the declared thread intact", function()
            local owner_id = "cv-del-" .. uuid.v4():sub(1, 8)
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local parent_id = uuid.v4()

            local csvc = contract.get("kickside.component:component_service")
            local cinst = (csvc :: any):with_actor(owner):with_scope(scope()):open()
            cinst:register({ component_id = parent_id, impl_id = "app:converge_test_decl", meta = { class = "test_converge", title = "Delete order" } })
            local tsvc = contract.get("kickside.core:threads")
            local tinst = (tsvc :: any):with_actor(owner):with_scope(scope()):open()
            local _, ensure_err = tinst:ensure_thread({ component_id = parent_id, impl_id = "app:converge_test_decl" })
            test.is_nil(ensure_err)

            -- A direct child makes the delete refuse (no child_policy given).
            local child_reg = cinst:register({ component_id = uuid.v4(), impl_id = "app:converge_test_decl", parent_id = parent_id, meta = { class = "test_converge", title = "Child" } })
            test.is_true(type(child_reg) == "table" and child_reg.success == true)

            local del = cinst:delete({ component_id = parent_id })
            test.is_true(type(del) == "table" and del.success ~= true)

            local d = db()
            test.eq(count(d, "kickside_thread", "id", parent_id), 1)
            test.is_true(count(d, "kickside_projection", "thread_id", parent_id) >= 1)
            d:release()
        end)

        test.it("repeated ensures preserve declared thread state and cursor progress", function()
            local owner = security.new_actor("ensure-owner-" .. uuid.v4(), { security_groups = {} })
            local component_id = uuid.v4()
            local cinst = (contract.get("kickside.component:component_service") :: any)
                :with_actor(owner):with_scope(scope()):open()
            local reg = cinst:register({ component_id = component_id, impl_id = "app:converge_test_decl",
                meta = { class = "test_converge", title = "Portable shell" } })
            test.is_true(reg.success)
            local tinst = (contract.get("kickside.core:threads") :: any):with_actor(owner):with_scope(scope()):open()
            -- Create the current declared thread before repeating ensure.
            local shell, shell_err = tinst:ensure_thread({ component_id = component_id,
                impl_id = "app:converge_test_decl" })
            test.is_nil(shell_err)
            local appended, append_err = tinst:append_event({ thread_id = component_id,
                event = { type = "app:threads_cv_trigger", body = {} } })
            test.is_nil(append_err)
            test.not_nil(appended)
            local before = tinst:find({ thread_id = component_id })
            local grants_db = db()
            local grants = grants_db:query([[SELECT access_id,subject_id,subject_type,access_mask
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            grants_db:release()
            local ensured, ensure_err = tinst:ensure_thread({ component_id = component_id,
                impl_id = "app:converge_test_decl" })
            test.is_nil(ensure_err)
            test.eq(ensured.thread.id, component_id)
            test.eq(ensured.thread.thread_class, "test.converge.thread")
            test.eq(ensured.thread.event_count, 1)
            test.eq(ensured.thread.state, before.state)
            local current = tinst:find({ thread_id = component_id })
            test.eq(current.attrs.owner_principal.id, before.attrs.owner_principal.id)
            test.eq(current.attrs.owner_principal.kind, before.attrs.owner_principal.kind)
            local d = db()
            local rows, row_err = d:query([[SELECT c.id,c.generation,c.job_id FROM kickside_projection_cursor c
                JOIN kickside_projection p ON p.id=c.projection_id WHERE p.thread_id=$1]], { component_id })
            test.is_nil(row_err)
            test.eq(#rows, 1)
            local cursor = rows[1]
            test.not_nil(cursor.job_id)
            test.eq(count(d, "kickside_job", "id", cursor.job_id), 1)
            local _, seed_err = d:execute("UPDATE kickside_projection_cursor SET last_seq=1,status='paused' WHERE id=$1", { cursor.id })
            test.is_nil(seed_err)
            d:release()
            for _ = 1, 2 do
                local _, repeat_err = tinst:ensure_thread({ component_id = component_id, impl_id = "app:converge_test_decl" })
                test.is_nil(repeat_err)
            end
            local verify = db()
            local after = verify:query("SELECT id,generation,last_seq,status,job_id FROM kickside_projection_cursor WHERE id=$1", { cursor.id })
            test.eq(after[1].id, cursor.id)
            test.eq(tonumber(after[1].generation), tonumber(cursor.generation))
            test.eq(tonumber(after[1].last_seq), 1)
            test.eq(after[1].status, "paused")
            test.eq(after[1].job_id, cursor.job_id)
            test.eq(count(verify, "kickside_event", "thread_id", component_id), 1)
            local _, unlink_err = verify:execute("UPDATE kickside_projection_cursor SET job_id=NULL WHERE id=$1", { cursor.id })
            test.is_nil(unlink_err)
            verify:release()
            -- Boot's divergence scan includes missing slots, even with a healthy
            -- class, projection and cursor. It must preserve a paused cursor.
            local summary, boot_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(boot_err)
            test.is_true(summary.healed >= 1)
            local repaired = db()
            local linked = repaired:query("SELECT generation,last_seq,status,job_id FROM kickside_projection_cursor WHERE id=$1", { cursor.id })
            test.eq(linked[1].job_id, cursor.job_id)
            test.eq(tonumber(linked[1].generation), tonumber(cursor.generation))
            test.eq(tonumber(linked[1].last_seq), 1)
            test.eq(linked[1].status, "paused")
            local grants_after = repaired:query([[SELECT access_id,subject_id,subject_type,access_mask
                FROM kickside_component_access WHERE component_id=$1 ORDER BY access_id]], { component_id })
            test.eq(#grants_after, #grants)
            for i, grant in ipairs(grants) do
                for key, value in pairs(grant) do test.eq(grants_after[i][key], value) end
            end
            repaired:release()
        end)

        test.it("converge registers a declared projection missing from a live thread", function()
            local owner_id = "cv-proj-" .. uuid.v4():sub(1, 8)
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local component_id = uuid.v4()

            local csvc = contract.get("kickside.component:component_service")
            local cinst = (csvc :: any):with_actor(owner):with_scope(scope()):open()
            cinst:register({ component_id = component_id, impl_id = "app:converge_test_decl", meta = { class = "test_converge", title = "Converge partial" } })
            local tsvc = contract.get("kickside.core:threads")
            local tinst = (tsvc :: any):with_actor(owner):with_scope(scope()):open()
            local _, ensure_err = tinst:ensure_thread({ component_id = component_id, impl_id = "app:converge_test_decl" })
            test.is_nil(ensure_err)

            local d = db()
            sql.builder.delete("kickside_projection_cursor")
                :where("projection_id IN (SELECT id FROM kickside_projection WHERE thread_id = ?)", component_id)
                :run_with(d):exec()
            sql.builder.delete("kickside_projection"):where(sql.builder.eq({ thread_id = component_id })):run_with(d):exec()
            test.eq(count(d, "kickside_projection", "thread_id", component_id), 0)
            d:release()

            local summary, converge_err = provision.converge(security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(converge_err)
            test.is_true((tonumber((summary :: any).healed) or 0) >= 1)

            local d2 = db()
            test.is_true(count(d2, "kickside_projection", "thread_id", component_id) >= 1)
            d2:release()
        end)

        test.it("converge registers a declared projection for a kind without a primary thread", function()
            local owner_id = "po-owner-" .. uuid.v4():sub(1, 8)
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local component_id = uuid.v4()

            local csvc = contract.get("kickside.component:component_service")
            local cinst = (csvc :: any):with_actor(owner):with_scope(scope()):open()
            local reg = cinst:register({ component_id = component_id, impl_id = "app:converge_test_projonly", meta = { class = "test_projonly", title = "Proj only" } })
            test.is_true(type(reg) == "table" and reg.success == true)

            -- The kind declares no primary thread; its thread arrives from another
            -- flow. Simulate that flow's row: component + bare thread, no projection.
            local d = db()
            sql.builder.insert("kickside_thread")
                :set_map({
                    id = component_id,
                    thread_class = "test.projonly.thread",
                    component_id = component_id,
                    event_count = 0,
                })
                :run_with(d):exec()
            test.eq(count(d, "kickside_projection", "thread_id", component_id), 0)
            d:release()

            local summary, converge_err = provision.converge(security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            test.is_nil(converge_err)
            test.is_true((tonumber((summary :: any).healed) or 0) >= 1)

            local d2 = db()
            local rows = sql.builder.select("actor_id"):from("kickside_projection")
                :where(sql.builder.eq({ thread_id = component_id, kind = "test.projonly" })):run_with(d2):query()
            test.is_true(rows ~= nil and #rows >= 1)
            -- The projection runs as the component owner, not the converging system actor.
            test.eq(tostring(rows[1].actor_id), owner_id)
            d2:release()
        end)

        test.it("converge refuses a corrupt component identity without a framework fallback", function()
            local owner_id = "corrupt-identity-" .. uuid.v7()
            local owner = security.new_actor(owner_id, { security_groups = {} })
            local _, provision_err = provision.ensure_user(owner, scope(), owner_id)
            test.is_nil(provision_err)
            local id = autoinit.component_id(owner_id, "test_ws")
            local d = db()
            local rows = assert(d:query("SELECT private_context FROM kickside_components WHERE component_id=$1", { id }))
            local original = rows[1].private_context
            local context = assert(json.decode(original))
            context._execution_identity = { version = 1, principal = { kind = "user", id = owner_id } }
            local _, corrupt_err = d:execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2",
                { assert(json.encode(context)), id })
            test.is_nil(corrupt_err)
            local _, unlink_err = d:execute("UPDATE kickside_projection_cursor SET job_id=NULL WHERE thread_id=$1", { id })
            test.is_nil(unlink_err)
            d:release()
            local summary, converge_err = provision.converge(
                security.new_actor("system:lifecycle", { system = true, security_groups = {} }), scope())
            d = db()
            local cursors = assert(d:query("SELECT job_id FROM kickside_projection_cursor WHERE thread_id=$1", { id }))
            local stored = assert(d:query("SELECT private_context FROM kickside_components WHERE component_id=$1", { id }))
            local _, restore_err = d:execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2", { original, id })
            d:release()
            test.is_nil(restore_err)
            test.is_nil(converge_err)
            test.eq(#cursors, 1)
            test.is_nil(cursors[1].job_id)
            test.eq(assert(json.decode(stored[1].private_context))._execution_identity.version, 1)
            local refused = false
            for _, skipped in ipairs(summary.skipped) do
                if skipped.component_id == id then
                    test.contains(skipped.reason, "no valid execution identity")
                    refused = true
                end
            end
            test.is_true(refused)
        end)

        test.it("converge heals a system-owned component's projection under the explicit system identity", function()
            local sys_actor = security.new_actor("system:lifecycle", { system = true, security_groups = {} })
            local cid = autoinit.component_id(autoinit.SYSTEM_SCOPE_KEY, "test_sys")
            local _, sys_err = provision.ensure_system(sys_actor, scope())
            test.is_nil(sys_err)

            local d = db()
            sql.builder.delete("kickside_projection_cursor")
                :where("projection_id IN (SELECT id FROM kickside_projection WHERE thread_id = ?)", cid)
                :run_with(d):exec()
            sql.builder.delete("kickside_projection"):where(sql.builder.eq({ thread_id = cid })):run_with(d):exec()
            test.eq(count(d, "kickside_projection", "thread_id", cid), 0)
            d:release()

            local summary, converge_err = provision.converge(sys_actor, scope())
            test.is_nil(converge_err)
            test.is_true((tonumber((summary :: any).healed) or 0) >= 1)

            local d2 = db()
            local rows = sql.builder.select("actor_id", "actor_context"):from("kickside_projection")
                :where(sql.builder.eq({ thread_id = cid, kind = "test.reap" })):run_with(d2):query()
            test.is_true(rows ~= nil and #rows >= 1)
            -- A framework-owned component's projection carries the explicit system
            -- identity: no captured row, so it runs in the runner's framework frame.
            test.is_nil(rows[1].actor_id)
            test.is_nil(rows[1].actor_context)
            d2:release()
        end)

        test.it("ensure_system materializes the system singleton with declared grants, idempotently", function()
            local cid = autoinit.component_id(autoinit.SYSTEM_SCOPE_KEY, "test_sys")
            local sys_actor = security.new_actor("system:lifecycle", { security_groups = {} })

            local ids, err = provision.ensure_system(sys_actor, scope())
            test.is_nil(err)
            test.is_true(#ids >= 1)

            local d = db()
            -- System singleton's thread exists at the deterministic system-scope id.
            test.eq(count(d, "kickside_thread", "id", cid), 1)
            test.is_true(count(d, "kickside_projection", "thread_id", cid) >= 1)
            local projection_rows = sql.builder.select("actor_id", "actor_context"):from("kickside_projection")
                :where(sql.builder.eq({ thread_id = cid, kind = "test.reap" }))
                :run_with(d):query()
            test.is_true(projection_rows ~= nil and #projection_rows >= 1)
            -- The framework-created singleton carries no execution identity, so its
            -- declared projection runs under the explicit system identity.
            test.is_nil(projection_rows[1].actor_id)
            test.is_nil(projection_rows[1].actor_context)

            -- Declared grants landed as direct access rows: admin READ (1), user WRITE (2),
            -- on top of the owner's implicit FULL grant.
            local function mask_for(subject)
                local rows = sql.builder.select("access_mask"):from("kickside_component_access")
                    :where(sql.builder.eq({ component_id = cid, subject_id = subject }))
                    :where(sql.builder.eq({ inherited = 0 }))
                    :run_with(d):query()
                return tonumber(rows and rows[1] and rows[1].access_mask)
            end
            test.eq(mask_for("app.security:admin"), 1)
            test.eq(mask_for("app.security:user"), 2)
            d:release()

            -- Idempotent: a second run neither errors nor duplicates the thread.
            local ids2, err2 = provision.ensure_system(sys_actor, scope())
            test.is_nil(err2)
            test.eq(#ids2, #ids)
            local d2 = db()
            test.eq(count(d2, "kickside_thread", "id", cid), 1)
            d2:release()
        end)

        test.it("exposes committed projection bodies without history or cursor controls", function()
            local cid = autoinit.component_id(user_id, "test_ws")
            local _, provision_err = provision.ensure_user(actor(), scope(), user_id)
            test.is_nil(provision_err)

            local d = db()
            local _, update_err = d:execute([[
                UPDATE kickside_projection
                   SET body = $1
                 WHERE thread_id = $2 AND kind = $3 AND projection_key = 'default'
            ]], { '{"count":7}', cid, "test.count" })
            d:release()
            test.is_nil(update_err)

            local definition, definition_err = contract.get("kickside.core:read_models")
            test.is_nil(definition_err)
            test.not_nil(definition)
            local models, open_err = (definition :: any):with_actor(actor()):with_scope(scope()):open()
            test.is_nil(open_err)
            test.not_nil(models)
            test.is_nil((models :: any).list_events)
            test.is_nil((models :: any).list_projections)
            test.is_nil((models :: any).catch_up_projection)

            local result, read_err = (models :: any):get({ owner_id = cid, kind = "test.count" })
            test.is_nil(read_err)
            test.eq(tonumber((result :: any).body.count), 7)

            local stranger = security.new_actor("read-model-stranger-" .. suffix, { security_groups = {} })
            local denied_models, denied_open_err = (definition :: any):with_actor(stranger):with_scope(scope()):open()
            test.is_nil(denied_open_err)
            local denied, denied_err = (denied_models :: any):get({ owner_id = cid, kind = "test.count" })
            test.is_nil(denied)
            test.not_nil(denied_err)
            test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run, declarations = autoinit.declarations }
